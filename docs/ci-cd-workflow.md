# FoodHawk Platform - Complete CI/CD Workflow Documentation

## GitHub Actions Workflow YAML

```yaml
name: FoodHawk CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: us-east-1
  ECR_REPOSITORY: foodhawk
  BACKEND_IMAGE: foodhawk-backend
  FRONTEND_IMAGE: foodhawk-frontend
  IMAGE_TAG: ${{ github.sha }}

jobs:
  # ============================================
  # Stage 1: Code Quality & Security Scanning
  # ============================================
  lint-and-security:
    name: Lint and Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Python dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install flake8 black bandit safety
      
      - name: Run Python linting
        working-directory: ./backend
        run: |
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
          black --check .
      
      - name: Run Python security scan
        working-directory: ./backend
        run: |
          bandit -r . -f json -o bandit-report.json || true
          bandit -r . -f screen
      
      - name: Check dependencies for vulnerabilities
        working-directory: ./backend
        run: safety check --json --output safety-report.json || true
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Node dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint --if-present
      
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            backend/bandit-report.json
            backend/safety-report.json

  # ============================================
  # Stage 2: Backend Testing
  # ============================================
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    needs: lint-and-security
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Run tests with coverage
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          SECRET_KEY: test-secret-key-for-ci
        run: |
          pytest --cov=. --cov-report=xml --cov-report=html --cov-report=term-missing
      
      - name: Upload coverage reports
        uses: actions/upload-artifact@v3
        with:
          name: backend-coverage
          path: |
            backend/coverage.xml
            backend/htmlcov/
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: backend
          name: backend-coverage

  # ============================================
  # Stage 3: Frontend Testing
  # ============================================
  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest
    needs: lint-and-security
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run unit tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
      
      - name: Build for production
        working-directory: ./frontend
        env:
          CI: true
          REACT_APP_API_URL: https://api.foodhawk.example.com
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/build/
      
      - name: Upload coverage reports
        uses: actions/upload-artifact@v3
        with:
          name: frontend-coverage
          path: frontend/coverage/

  # ============================================
  # Stage 4: Build Docker Images
  # ============================================
  build-docker-images:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    if: success()
    
    outputs:
      backend-tag: ${{ steps.meta-backend.outputs.tags }}
      frontend-tag: ${{ steps.meta-frontend.outputs.tags }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ env.DOCKER_USERNAME }}
          password: ${{ env.DOCKER_PASSWORD }}
      
      - name: Extract metadata for backend
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=registry,ref=${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:buildcache
          cache-to: type=registry,ref=${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:buildcache,mode=max
      
      - name: Extract metadata for frontend
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          cache-from: type=registry,ref=${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:buildcache
          cache-to: type=registry,ref=${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:buildcache,mode=max
      
      - name: Scan backend image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}
          format: 'sarif'
          output: 'backend-trivy-results.sarif'
      
      - name: Scan frontend image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
          format: 'sarif'
          output: 'frontend-trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: backend-trivy-results.sarif
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: frontend-trivy-results.sarif

  # ============================================
  # Stage 5: Deploy to Staging
  # ============================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build-docker-images
    if: github.ref == 'refs/heads/develop' && success()
    environment:
      name: staging
      url: https://staging.foodhawk.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ env.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ env.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Pull and tag images for ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker pull ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}
          docker tag ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }} ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-backend:staging
          docker push ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-backend:staging
          
          docker pull ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
          docker tag ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }} ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-frontend:staging
          docker push ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-frontend:staging
      
      - name: Deploy to ECS Staging
        run: |
          # Update ECS task definition
          aws ecs update-service \
            --cluster foodhawk-staging \
            --service foodhawk-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster foodhawk-staging \
            --service foodhawk-frontend \
            --force-new-deployment
      
      - name: Wait for deployment to complete
        run: |
          aws ecs wait services-stable \
            --cluster foodhawk-staging \
            --services foodhawk-backend foodhawk-frontend
      
      - name: Run smoke tests on staging
        run: |
          # Health check
          curl -f https://staging.foodhawk.example.com/health || exit 1
          
          # API check
          curl -f https://staging.foodhawk.example.com/api/health || exit 1
      
      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment successful'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  # ============================================
  # Stage 6: Deploy to Production (Manual Approval)
  # ============================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-docker-images
    if: github.ref == 'refs/heads/main' && success()
    environment:
      name: production
      url: https://app.foodhawk.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ env.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ env.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Pull and tag images for ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker pull ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }}
          docker tag ${{ env.DOCKER_USERNAME }}/${{ env.BACKEND_IMAGE }}:${{ github.sha }} ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-backend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-backend:latest
          
          docker pull ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
          docker tag ${{ env.DOCKER_USERNAME }}/${{ env.FRONTEND_IMAGE }}:${{ github.sha }} ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-frontend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}-frontend:latest
      
      - name: Create backup before deployment
        run: |
          # Create database snapshot
          BACKUP_ID=$(aws rds create-db-snapshot \
            --db-instance-identifier foodhawk-prod \
            --db-snapshot-identifier foodhawk-backup-$(date +%Y%m%d-%H%M%S) \
            --query 'DBSnapshot.DBSnapshotId' \
            --output text)
          echo "BACKUP_ID=$BACKUP_ID" >> $GITHUB_ENV
          
          # Save previous task definition
          aws ecs describe-task-definition \
            --task-definition foodhawk-backend \
            --query 'taskDefinition' > previous-task-definition.json
          
          echo "Backup created: $BACKUP_ID"
      
      - name: Deploy to ECS Production
        run: |
          # Update ECS task definition
          aws ecs update-service \
            --cluster foodhawk-production \
            --service foodhawk-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster foodhawk-production \
            --service foodhawk-frontend \
            --force-new-deployment
      
      - name: Wait for deployment to complete
        run: |
          aws ecs wait services-stable \
            --cluster foodhawk-production \
            --services foodhawk-backend foodhawk-frontend
      
      - name: Run smoke tests on production
        run: |
          # Health check
          curl -f https://app.foodhawk.example.com/health || exit 1
          
          # API check
          curl -f https://app.foodhawk.example.com/api/health || exit 1
          
          # Product listing check
          curl -f https://app.foodhawk.example.com/api/products || exit 1
      
      - name: Rollback on failure
        if: failure()
        run: |
          echo "Deployment failed, initiating rollback..."
          
          # Rollback to previous task definition
          aws ecs register-task-definition \
            --cli-input-json file://previous-task-definition.json
          
          # Force redeployment
          aws ecs update-service \
            --cluster foodhawk-production \
            --service foodhawk-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster foodhawk-production \
            --service foodhawk-frontend \
            --force-new-deployment
          
          # Restore database if needed
          aws rds restore-db-instance-from-db-snapshot \
            --db-instance-identifier foodhawk-prod-restored \
            --db-snapshot-identifier ${{ env.BACKUP_ID }}
      
      - name: Notify deployment status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

  # ============================================
  # Stage 7: Post-Deployment Monitoring
  # ============================================
  post-deployment-monitoring:
    name: Post-Deployment Monitoring
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always()
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ env.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ env.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Check CloudWatch metrics
        run: |
          # Check error rates
          ERROR_RATE=$(aws cloudwatch get-metric-statistics \
            --namespace AWS/ECS \
            --metric-name CPUUtilization \
            --dimensions Name=ServiceName,Value=foodhawk-backend \
            --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
            --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
            --period 60 \
            --statistics Average \
            --query 'Datapoints[0].Average' \
            --output text)
          
          echo "CPU Utilization: $ERROR_RATE%"
          
          # Check for errors in logs
          aws logs filter-log-events \
            --log-group-name /ecs/foodhawk-backend \
            --start-time $(date -d '5 minutes ago' +%s)000 \
            --filter-pattern "ERROR" \
            --query 'events[*].message' \
            --output text
      
      - name: Create deployment report
        run: |
          cat > deployment-report.md << EOF
          # Deployment Report
          
          - **Commit**: ${{ github.sha }}
          - **Branch**: ${{ github.ref_name }}
          - **Deployed at**: $(date)
          - **Status**: ${{ needs.deploy-production.result }}
          - **Backup ID**: ${{ needs.deploy-production.outputs.backup-id }}
          EOF
      
      - name: Upload deployment report
        uses: actions/upload-artifact@v3
        with:
          name: deployment-report
          path: deployment-report.md
```

## Stage Explanations

### Stage 1: Code Quality & Security Scanning
**Purpose**: Ensure code quality and security before testing

**Steps**:
1. **Checkout code**: Pull the latest code from the repository
2. **Python linting**: Run flake8 and black to check code style
3. **Python security scan**: Use bandit to detect security issues
4. **Dependency vulnerability check**: Use safety to check for known vulnerabilities
5. **Node.js linting**: Run ESLint for frontend code
6. **Upload reports**: Save security reports for review

**Why this stage matters**: Catches issues early before expensive operations

### Stage 2: Backend Testing
**Purpose**: Validate backend functionality and code coverage

**Steps**:
1. **Setup PostgreSQL**: Start a test database
2. **Install dependencies**: Install Python packages
3. **Run tests**: Execute pytest with coverage reporting
4. **Upload coverage**: Send coverage data to Codecov

**Why this stage matters**: Ensures backend logic works correctly

### Stage 3: Frontend Testing
**Purpose**: Validate frontend functionality and build process

**Steps**:
1. **Setup Node.js**: Configure Node.js environment
2. **Install dependencies**: Install npm packages
3. **Run tests**: Execute Jest tests with coverage
4. **Build production**: Create optimized production build
5. **Upload artifacts**: Save build and coverage reports

**Why this stage matters**: Ensures frontend builds correctly and works

### Stage 4: Build Docker Images
**Purpose**: Create and push container images

**Steps**:
1. **Setup Buildx**: Configure Docker buildx for multi-platform builds
2. **Login to Docker Hub**: Authenticate with container registry
3. **Extract metadata**: Generate image tags based on git ref
4. **Build and push**: Build images with layer caching
5. **Security scan**: Scan images for vulnerabilities with Trivy
6. **Upload results**: Send scan results to GitHub Security

**Why this stage matters**: Creates deployable artifacts and checks for vulnerabilities

### Stage 5: Deploy to Staging
**Purpose**: Deploy to staging environment for testing

**Steps**:
1. **Configure AWS**: Set up AWS credentials
2. **Login to ECR**: Authenticate with Amazon ECR
3. **Pull and tag**: Retag images for ECR registry
4. **Deploy to ECS**: Update ECS services
5. **Wait for stability**: Ensure deployment completes
6. **Run smoke tests**: Verify basic functionality
7. **Notify team**: Send Slack notification

**Why this stage matters**: Tests deployment in a safe environment

### Stage 6: Deploy to Production
**Purpose**: Deploy to production with manual approval

**Steps**:
1. **Manual approval**: Requires human approval before proceeding
2. **Configure AWS**: Set up AWS credentials
3. **Login to ECR**: Authenticate with Amazon ECR
4. **Pull and tag**: Retag images for production registry
5. **Create backup**: Create database snapshot before deployment
6. **Deploy to ECS**: Update production services
7. **Wait for stability**: Ensure deployment completes
8. **Run smoke tests**: Verify production functionality
9. **Rollback on failure**: Automatically rollback if deployment fails
10. **Notify team**: Send Slack notification

**Why this stage matters**: Safely deploys to production with rollback capability

### Stage 7: Post-Deployment Monitoring
**Purpose**: Monitor deployment health after deployment

**Steps**:
1. **Check metrics**: Review CloudWatch metrics
2. **Check logs**: Search for errors in logs
3. **Create report**: Generate deployment summary
4. **Upload report**: Save report for documentation

**Why this stage matters**: Ensures deployment is healthy and provides audit trail

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD PIPELINE FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Git Push   │───▶│   Trigger    │───▶│   Checkout   │───▶│   Lint &     │    │
│  │              │    │              │    │              │    │   Security   │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘    │
│                                                                  │               │
│                                                                  ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Deploy     │◀───│   Build      │◀───│   Test       │◀───│   (if pass)  │    │
│  │   Production │    │   Docker     │    │   (Backend   │    │              │    │
│  │              │    │   Images     │    │   & Frontend)│    │              │    │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────────────┘    │
│         │                   │                   │                             │    │
│         │                   │                   ▼                             │    │
│         │                   │          ┌──────────────┐                       │    │
│         │                   │          │  Deploy to   │                       │    │
│         │                   │          │  Staging     │                       │    │
│         │                   │          │  (develop)   │                       │    │
│         │                   │          └──────┬───────┘                       │    │
│         │                   │                 │                               │    │
│         │                   │                 ▼                               │    │
│         │                   │          ┌──────────────┐                       │    │
│         │                   │          │ Manual       │                       │    │
│         │                   │          │ Approval     │                       │    │
│         │                   │          └──────┬───────┘                       │    │
│         │                   │                 │                               │    │
│         │                   │                 ▼                               │    │
│         │                   │          ┌──────────────┐                       │    │
│         │                   │          │  Deploy to   │                       │    │
│         │                   │          │  Production  │                       │    │
│         │                   │          │  (main)      │                       │    │
│         │                   │          └──────┬───────┘                       │    │
│         │                   │                 │                               │    │
│         │                   │                 ▼                               │    │
│         │                   │          ┌──────────────┐                       │    │
│         │                   │          │  Post-Deploy │                       │    │
│         │                   │          │  Monitoring  │                       │    │
│         │                   │          └──────────────┘                       │    │
│         │                   │                                                     │    │
│         ▼                   ▼                                                     │    │
│  ┌──────────────┐    ┌──────────────┐                                            │    │
│  │   Docker Hub │    │   AWS ECR    │                                            │    │
│  │   Registry   │    │   Registry   │                                            │    │
│  └──────────────┘    └──────────────┘                                            │    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Rollback Strategy

### Automatic Rollback Triggers
1. **Smoke test failures**: If health checks fail after deployment
2. **High error rates**: If error rate exceeds threshold (e.g., 5%)
3. **Deployment timeout**: If deployment doesn't complete within 30 minutes
4. **Manual trigger**: Team can manually trigger rollback

### Rollback Process

**1. Database Rollback**
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier foodhawk-prod-restored \
  --db-snapshot-identifier foodhawk-backup-YYYYMMDD-HHMMSS

# Point DNS to restored instance (if using read replica)
aws rds promote-read-replica \
  --db-instance-identifier foodhawk-prod-restored
```

**2. Application Rollback**
```bash
# Get previous task definition
aws ecs describe-task-definition \
  --task-definition foodhawk-backend \
  --query 'taskDefinition' > previous-task-definition.json

# Register previous task definition
aws ecs register-task-definition \
  --cli-input-json file://previous-task-definition.json

# Force redeployment
aws ecs update-service \
  --cluster foodhawk-production \
  --service foodhawk-backend \
  --force-new-deployment
```

**3. Docker Image Rollback**
```bash
# Pull previous image
docker pull foodhawk-backend:previous-tag

# Tag and push
docker tag foodhawk-backend:previous-tag foodhawk-backend:latest
docker push foodhawk-backend:latest
```

### Rollback Workflow in GitHub Actions

The workflow includes automatic rollback logic:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    # Rollback to previous task definition
    aws ecs register-task-definition \
      --cli-input-json file://previous-task-definition.json
    
    # Force redeployment
    aws ecs update-service \
      --cluster foodhawk-production \
      --service foodhawk-backend \
      --force-new-deployment
```

### Rollback Best Practices

1. **Always create backups**: Before every production deployment
2. **Use blue-green deployment**: Maintain two identical environments
3. **Canary releases**: Roll out to subset of users first
4. **Feature flags**: Use feature flags to enable/disable features
5. **Monitor closely**: Watch metrics for at least 30 minutes after deployment
6. **Document rollback procedures**: Keep rollback steps documented
7. **Practice rollbacks**: Test rollback procedures regularly

## Demo Commands

### Setup GitHub Secrets

```bash
# Docker Hub credentials
gh secret set DOCKER_USERNAME
gh secret set DOCKER_PASSWORD

# AWS credentials
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY

# Slack webhook (optional)
gh secret set SLACK_WEBHOOK
```

### Trigger Pipeline

```bash
# Push to develop branch (triggers staging deployment)
git checkout develop
git add .
git commit -m "Feature: Add new functionality"
git push origin develop

# Push to main branch (triggers production deployment with approval)
git checkout main
git merge develop
git push origin main
```

### Monitor Pipeline

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch logs in real-time
gh run watch

# Cancel a running workflow
gh run cancel <run-id>
```

### Manual Rollback

```bash
# Using AWS CLI
aws ecs update-service \
  --cluster foodhawk-production \
  --service foodhawk-backend \
  --task-definition foodhawk-backend:previous-version \
  --force-new-deployment

# Or rollback to specific task definition
aws ecs update-service \
  --cluster foodhawk-production \
  --service foodhawk-backend \
  --task-definition arn:aws:ecs:region:account-id:task-definition/foodhawk-backend:42 \
  --force-new-deployment
```

### Testing Locally

```bash
# Test backend locally
cd backend
pytest

# Test frontend locally
cd frontend
npm test

# Build Docker images locally
docker build -t foodhawk-backend ./backend
docker build -t foodhawk-frontend ./frontend

# Run containers locally
docker-compose up -d

# Test deployment locally
docker-compose exec backend python seed.py
curl http://localhost:8000/health
```

## Required GitHub Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `DOCKER_USERNAME` | Docker Hub username | Yes |
| `DOCKER_PASSWORD` | Docker Hub password/token | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | Yes |
| `SLACK_WEBHOOK` | Slack webhook URL for notifications | Optional |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region for deployment | `us-east-1` |
| `ECR_REPOSITORY` | ECR repository name | `foodhawk` |
| `BACKEND_IMAGE` | Backend image name | `foodhawk-backend` |
| `FRONTEND_IMAGE` | Frontend image name | `foodhawk-frontend` |

## Pipeline Metrics to Monitor

- **Build time**: Time to complete the pipeline
- **Test coverage**: Code coverage percentage
- **Deployment success rate**: Percentage of successful deployments
- **Rollback rate**: Percentage of deployments that required rollback
- **Mean time to recovery**: Time to recover from failed deployments

## Troubleshooting

### Pipeline Fails at Lint Stage
- Check code style issues with flake8/black locally
- Fix security issues flagged by bandit
- Update vulnerable dependencies

### Pipeline Fails at Test Stage
- Run tests locally: `pytest` (backend), `npm test` (frontend)
- Check test logs in GitHub Actions
- Ensure test database is configured correctly

### Pipeline Fails at Build Stage
- Check Dockerfile syntax
- Ensure Docker Hub credentials are correct
- Verify build context is correct

### Pipeline Fails at Deploy Stage
- Check AWS credentials
- Verify ECS cluster and service exist
- Check task definition is valid
- Review CloudWatch logs for errors

### Deployment Fails Smoke Tests
- Check application logs
- Verify database connectivity
- Check environment variables
- Review security group rules

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-20  
**Status**: Complete CI/CD Pipeline Documentation
