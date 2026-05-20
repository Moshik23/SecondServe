# FoodHawk Platform - Free-Tier Deployment Guide

## Overview

This guide provides deployment instructions using only free or low-cost services, perfect for MVPs, demos, and academic presentations. All services have generous free tiers that can host the entire FoodHawk Platform at minimal or no cost.

## Service Comparison

| Service | Purpose | Free Tier | Paid Starting | Best For |
|---------|---------|-----------|---------------|----------|
| **Vercel** | Frontend hosting | Free (unlimited) | $20/month | React frontend |
| **Render** | Backend hosting | Free (750 hours/month) | $7/month | FastAPI backend |
| **Railway** | Full-stack hosting | $5 credit/month | $5/month | Complete app |
| **Supabase** | Database & Auth | Free (500MB) | $25/month | PostgreSQL + Auth |
| **Docker Hub** | Container registry | Free (unlimited public) | $5/month | Docker images |
| **GitHub Actions** | CI/CD | Free (2000 minutes/month) | Paid for more | Automation |

## Recommended Architecture

### Option 1: Vercel + Render + Supabase (Recommended)
```
Frontend (Vercel) → Backend (Render) → Database (Supabase)
```
**Cost**: $0/month (all free tiers)
**Best for**: Production-ready MVP

### Option 2: Railway (All-in-One)
```
Frontend + Backend + Database (Railway)
```
**Cost**: $5/month (after $5 credit)
**Best for**: Simplest setup

### Option 3: Vercel + Supabase + Docker Hub
```
Frontend (Vercel) → Supabase Edge Functions → Database (Supabase)
```
**Cost**: $0/month
**Best for**: Serverless approach

## Option 1: Vercel + Render + Supabase Deployment

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Browser                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                             │
│  • React SPA                                                    │
│  • Automatic HTTPS                                              │
│  • Global CDN                                                   │
│  • Free hosting                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Render (Backend)                              │
│  • FastAPI Docker container                                      │
│  • Automatic HTTPS                                              │
│  • Free tier (750 hours/month)                                  │
│  • Auto-deploys on git push                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Supabase (Database)                             │
│  • PostgreSQL database                                           │
│  • 500MB storage (free tier)                                    │
│  • Built-in auth & real-time                                     │
│  • Free hosting                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estimated Monthly Cost

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Unlimited free tier |
| Render | $0 | 750 free hours/month (sufficient for MVP) |
| Supabase | $0 | 500MB database (sufficient for MVP) |
| Docker Hub | $0 | Public repositories free |
| GitHub Actions | $0 | 2000 free minutes/month |
| **Total** | **$0** | All services on free tiers |

### Deployment Steps

#### Step 1: Set Up Supabase Database

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub
   - Create new project: "foodhawk-platform"

2. **Get Database Credentials**
   - Navigate to Settings → Database
   - Copy connection string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
     ```

3. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run schema from `database/schema.sql`
   - Run init script from `database/init.sql`

4. **Enable Required Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

#### Step 2: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Service (Optional)**
   - If not using Supabase, create Render PostgreSQL
   - Free tier: 90 days, then $7/month

3. **Create Web Service for Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: foodhawk-backend
     Environment: Docker
     Dockerfile Path: ./backend/Dockerfile
     Branch: main
     ```

4. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   SECRET_KEY=your-secret-key-change-in-production
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   REDIS_URL=redis://default:[PASSWORD]@your-redis.render.com:6379
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy the backend URL: `https://foodhawk-backend.onrender.com`

6. **Seed Database**
   - Add a deploy script to package.json or use Render shell
   - Run: `python seed.py` after first deployment

#### Step 3: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Configure:
     ```
     Framework Preset: Create React App
     Root Directory: ./frontend
     Build Command: npm run build
     Output Directory: build
     Install Command: npm ci
     ```

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://foodhawk-backend.onrender.com
   REACT_APP_WS_URL=wss://foodhawk-backend.onrender.com/ws
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - Copy the frontend URL: `https://foodhawk-platform.vercel.app`

5. **Update CORS**
   - Go back to Render backend
   - Update CORS_ORIGINS to include Vercel URL

#### Step 4: Set Up GitHub Actions (Optional)

1. **Configure GitHub Secrets**
   ```bash
   # In GitHub repository settings
   gh secret set RENDER_API_KEY
   gh secret set VERCEL_TOKEN
   gh secret set SUPABASE_URL
   gh secret set SUPABASE_ANON_KEY
   ```

2. **Create Workflow**
   - Create `.github/workflows/deploy.yml`
   - Add auto-deployment on push to main

### Environment Variables Setup

#### Backend (Render)
```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Security
SECRET_KEY=generate-strong-random-key-here
JWT_SECRET_KEY=another-strong-random-key

# CORS
CORS_ORIGINS=https://your-app.vercel.app,https://your-app.onrender.com

# Redis (optional)
REDIS_URL=redis://default:[PASSWORD]@your-redis.render.com:6379

# Supabase (if using Supabase features)
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Frontend (Vercel)
```bash
# API Configuration
REACT_APP_API_URL=https://foodhawk-backend.onrender.com
REACT_APP_WS_URL=wss://foodhawk-backend.onrender.com/ws

# Supabase (if using Supabase Auth)
REACT_APP_SUPABASE_URL=https://[PROJECT-REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Scaling Considerations

#### Free Tier Limitations

**Vercel:**
- Unlimited bandwidth
- 100GB bandwidth per month (generous)
- 6GB build output size
- Automatic scaling

**Render:**
- 750 free hours/month (~31 days continuous)
- 512MB RAM
- 0.1 CPU
- Sleeps after 15 minutes inactivity (spins up in ~30s)

**Supabase:**
- 500MB database storage
- 1GB file storage
- 50,000 MAU (Monthly Active Users)
- 2 concurrent connections

#### When to Upgrade

**Render:**
- Upgrade when: >750 hours/month usage
- Cost: $7/month for Standard
- Benefits: No sleep, more CPU/RAM

**Supabase:**
- Upgrade when: >500MB database or >50k MAU
- Cost: $25/month for Pro
- Benefits: 8GB database, 100k MAU

**Vercel:**
- Upgrade when: Need custom domains, advanced features
- Cost: $20/month for Pro
- Benefits: Analytics, faster builds

#### Scaling Strategies

1. **Database Optimization**
   - Use connection pooling
   - Add indexes to frequently queried columns
   - Archive old data

2. **Caching**
   - Implement Redis caching
   - Use CDN for static assets
   - Cache API responses

3. **Code Optimization**
   - Optimize database queries
   - Use pagination
   - Lazy load components

### Security Best Practices

#### 1. Environment Variables
```bash
# Never commit secrets to git
# Use .env files (gitignored)
# Store secrets in platform's secret manager
```

#### 2. Database Security
```sql
-- Use Row Level Security (RLS) in Supabase
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own products"
ON products FOR SELECT
USING (vendor_id = auth.uid());
```

#### 3. API Security
```python
# Use HTTPS only (automatic on Vercel/Render)
# Implement rate limiting
# Validate all inputs
# Use parameterized queries (SQLAlchemy)
```

#### 4. Authentication
```python
# Use JWT with expiration
# Rotate secrets regularly
# Implement refresh tokens
# Use secure cookie storage
```

#### 5. CORS Configuration
```python
# Only allow specific origins
CORS_ORIGINS=https://your-app.vercel.app
# Don't use wildcard (*) in production
```

#### 6. Secrets Management
```bash
# Use platform secrets (Render/Vercel)
# Never hardcode secrets
# Rotate secrets regularly
# Use different secrets for dev/prod
```

#### 7. Dependency Security
```bash
# Regularly update dependencies
npm audit
pip-audit
# Use dependency scanning in CI/CD
```

## Option 2: Railway Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Railway (All-in-One)                            │
│  • Frontend (React)                                              │
│  • Backend (FastAPI)                                             │
│  • Database (PostgreSQL)                                         │
│  • Redis (Cache)                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estimated Monthly Cost

| Service | Cost | Notes |
|---------|------|-------|
| Railway | $5 | After $5 monthly credit |
| **Total** | **$0-$5** | Free with credit, then $5 |

### Deployment Steps

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize Project
```bash
cd food-hawk-platform
railway init
```

#### Step 3: Add Services
```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Add Backend
railway up
# Select Dockerfile: backend/Dockerfile

# Add Frontend
railway up
# Select Dockerfile: frontend/Dockerfile
```

#### Step 4: Configure Environment
```bash
# Railway automatically injects:
# DATABASE_URL
# REDIS_URL

# Add custom variables
railway variables set SECRET_KEY=your-secret-key
railway variables set CORS_ORIGINS=https://your-app.railway.app
```

#### Step 5: Deploy
```bash
railway up
railway domain
```

### Railway-Specific Configuration

#### Backend Dockerfile for Railway
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway injects PORT environment variable
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
```

#### Frontend Dockerfile for Railway
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Scaling on Railway

**Free Tier:**
- $5 monthly credit
- 512MB RAM per service
- 0.5 CPU per service
- Sleeps after inactivity

**Paid Tier:**
- $5/month per service
- 1GB RAM
- 1 CPU
- No sleep

## Option 3: Vercel + Supabase Serverless

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                            │
│  • Serverless API functions                                      │
│  • Direct database access                                        │
│  • Built-in auth & real-time                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Supabase (Database)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Estimated Monthly Cost

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier |
| Supabase | $0 | Free tier |
| **Total** | **$0** | All free |

### Deployment Steps

#### Step 1: Deploy Frontend to Vercel
(Same as Option 1, Step 3)

#### Step 2: Set Up Supabase Edge Functions

1. **Install Supabase CLI**
```bash
npm install -g supabase
supabase login
```

2. **Initialize Supabase**
```bash
cd food-hawk-platform
supabase init
```

3. **Create Edge Function**
```bash
supabase functions new api
```

4. **Implement API in Edge Function**
```typescript
// supabase/functions/api/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { method, url } = req
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  // Implement API routes
  if (method === 'GET' && url === '/api/products') {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
    return new Response(JSON.stringify(data))
  }

  return new Response('Not Found', { status: 404 })
})
```

5. **Deploy Functions**
```bash
supabase functions deploy api
```

#### Step 3: Update Frontend Configuration
```bash
# Vercel environment variables
REACT_APP_SUPABASE_URL=https://[PROJECT-REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Docker Hub Setup

### Push Images to Docker Hub

1. **Create Docker Hub Account**
   - Go to https://hub.docker.com
   - Sign up for free account

2. **Create Repositories**
   - Create `foodhawk-backend`
   - Create `foodhawk-frontend`

3. **Login to Docker Hub**
```bash
docker login
```

4. **Tag Images**
```bash
docker tag foodhawk-backend yourusername/foodhawk-backend:latest
docker tag foodhawk-frontend yourusername/foodhawk-frontend:latest
```

5. **Push Images**
```bash
docker push yourusername/foodhawk-backend:latest
docker push yourusername/foodhawk-frontend:latest
```

### Use Docker Hub Images in Deployments

**Render:**
```yaml
# In Render service settings
Docker Image: yourusername/foodhawk-backend:latest
```

**Railway:**
```bash
# In railway.toml
[build]
dockerfile = "backend/Dockerfile"
```

## GitHub Actions CI/CD

### Workflow for Free-Tier Deployment

```yaml
name: Deploy to Free Tier

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Deploy to Render
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/v1/services/srv-xxxx/deploy \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}"
      
      # Deploy to Vercel
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

### Required GitHub Secrets

```bash
# Render
RENDER_API_KEY=your-render-api-key

# Vercel
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Docker Hub
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

## Monitoring & Logging

### Free Tier Monitoring

**Vercel:**
- Built-in analytics dashboard
- Real-time logs
- Performance metrics
- Error tracking

**Render:**
- Real-time logs
- Metrics dashboard
- Health checks
- Error notifications

**Supabase:**
- Database metrics
- Query performance
- Storage usage
- Auth analytics

### Setting Up Alerts

**Vercel:**
```bash
# Settings → Notifications
# Enable email alerts for:
# - Deployments
# - Errors
# - Performance degradation
```

**Render:**
```bash
# Settings → Notifications
# Enable alerts for:
# - Service crashes
# - High CPU usage
# - Deployments
```

## Backup Strategy

### Free Tier Backup

**Supabase:**
- Automatic daily backups (free tier)
- Point-in-time recovery (7 days)
- Manual backup via SQL Editor

**Manual Backup Script:**
```bash
# Backup Supabase database
pg_dump "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" > backup.sql

# Restore database
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
```

**Render Database:**
- Automatic backups (paid tier only)
- Manual backup via pg_dump

## Cost Optimization Tips

### 1. Minimize Database Size
```sql
-- Archive old orders
CREATE TABLE orders_archive AS SELECT * FROM orders WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete archived data
DELETE FROM orders WHERE created_at < NOW() - INTERVAL '90 days';
```

### 2. Optimize API Calls
```python
# Implement pagination
@app.get("/api/products")
async def get_products(skip: int = 0, limit: int = 20):
    return db.query(Product).offset(skip).limit(limit).all()
```

### 3. Use Caching
```python
# Cache frequently accessed data
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_products():
    return db.query(Product).all()
```

### 4. Optimize Images
```bash
# Compress images before upload
# Use WebP format
# Implement lazy loading
```

## Migration Guide: Local to Cloud

### Step 1: Export Local Database
```bash
docker-compose exec db pg_dump -U postgres foodhawk > local-backup.sql
```

### Step 2: Import to Cloud Database
```bash
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" < local-backup.sql
```

### Step 3: Update Environment Variables
```bash
# Update backend environment variables
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

### Step 4: Test Cloud Deployment
```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test API
curl https://your-backend.onrender.com/api/products
```

### Step 5: Update DNS (Optional)
```bash
# Point custom domain to Vercel
# Configure CNAME record
```

## Troubleshooting

### Common Issues

**1. Render Service Sleeping**
- Problem: First request takes 30+ seconds
- Solution: Use cron job to keep service awake, or upgrade to paid tier

**2. Database Connection Errors**
- Problem: Can't connect to database
- Solution: Check connection string, verify network access

**3. CORS Errors**
- Problem: API requests blocked
- Solution: Update CORS_ORIGINS in backend environment variables

**4. Build Failures**
- Problem: Deployment fails during build
- Solution: Check build logs, verify dependencies

**5. Out of Memory**
- Problem: Service crashes due to memory limits
- Solution: Optimize code, upgrade to paid tier

## Comparison: AWS vs Free-Tier

| Feature | AWS (Free Tier) | Free-Tier Stack |
|---------|-----------------|----------------|
| Cost | $0 (12 months) then ~$60/month | $0 indefinitely |
| Setup Complexity | High | Low |
| Maintenance | High | Low |
| Scalability | Excellent | Good |
| Features | Comprehensive | Sufficient for MVP |
| Learning Curve | Steep | Gentle |

## Recommendation

**For MVP/Demo:**
- Use Vercel + Render + Supabase (Option 1)
- Cost: $0/month
- Setup time: 30 minutes
- Maintenance: Minimal

**For Production:**
- Use Railway (Option 2)
- Cost: $5/month
- Setup time: 15 minutes
- Maintenance: Minimal

**For Serverless:**
- Use Vercel + Supabase Edge Functions (Option 3)
- Cost: $0/month
- Setup time: 45 minutes
- Maintenance: Minimal

## Quick Reference Commands

### Vercel
```bash
vercel login
vercel deploy
vercel --prod
```

### Render
```bash
# Via dashboard
# Connect GitHub repo
# Configure environment variables
# Deploy on push
```

### Railway
```bash
railway login
railway init
railway up
```

### Supabase
```bash
supabase login
supabase init
supabase db push
supabase functions deploy
```

### Docker Hub
```bash
docker login
docker push username/image:tag
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-20  
**Status:** Complete Free-Tier Deployment Guide
