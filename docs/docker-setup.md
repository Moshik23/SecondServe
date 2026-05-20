# FoodHawk Platform - Complete Docker Setup Guide

## Overview

This guide provides a complete Docker setup for the FoodHawk Platform, optimized for local demos and beginner-friendly deployment. All services run in containers for consistency and ease of use.

## Prerequisites

**Required:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- 4GB RAM minimum
- 10GB free disk space

**Install Docker Desktop:**
- Windows: https://www.docker.com/products/docker-desktop
- Mac: https://www.docker.com/products/docker-desktop
- Linux: https://docs.docker.com/engine/install/

## Quick Start (3 Commands)

```bash
# 1. Navigate to project directory
cd food-hawk-platform

# 2. Start all services
docker-compose up -d

# 3. Seed the database with demo data
docker-compose exec backend python seed.py
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │        │
│  │   (React)    │  │   (FastAPI)  │  │   Database   │        │
│  │  Port: 80    │  │  Port: 8000  │  │  Port: 5432  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │    Redis     │  │    NGINX     │                           │
│  │    Cache     │  │  Reverse     │                           │
│  │  Port: 6379  │  │   Proxy      │                           │
│  └──────────────┘  └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Docker Files

### 1. Backend Dockerfile

**Location:** `backend/Dockerfile`

```dockerfile
# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Features:**
- Uses slim image for smaller size
- Installs only necessary system dependencies
- Copies requirements first for better layer caching
- Exposes port 8000 for FastAPI
- Runs with uvicorn production server

### 2. Frontend Dockerfile (Multi-stage Build)

**Location:** `frontend/Dockerfile`

```dockerfile
# Stage 1: Build React app
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Key Features:**
- Multi-stage build for smaller final image
- Uses Alpine Linux for minimal size
- Production-optimized React build
- Nginx for serving static files
- Custom nginx configuration for API proxying

### 3. NGINX Configuration

**Location:** `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # Serve React app
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy WebSocket connections
    location /ws {
        proxy_pass http://backend:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend:8000/health;
    }
}
```

**Key Features:**
- Serves React SPA with proper routing
- Proxies API requests to backend
- Handles WebSocket connections
- Health check endpoint
- Proper header forwarding

### 4. Docker Compose File

**Location:** `docker-compose.yml`

```yaml
services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: foodhawk-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: foodhawk
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - foodhawk-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: foodhawk-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - foodhawk-network

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: foodhawk-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/foodhawk
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: your-secret-key-change-in-production
      CORS_ORIGINS: http://localhost
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - foodhawk-network
    restart: unless-stopped

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: foodhawk-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - foodhawk-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  foodhawk-network:
    driver: bridge
```

**Key Features:**
- PostgreSQL with persistent volume
- Redis for caching
- Health checks for all services
- Proper service dependencies
- Custom network for service communication
- Restart policies for reliability

## Docker Compose Services

### PostgreSQL Database
- **Image:** postgres:15-alpine
- **Port:** 5432
- **Environment:** User, password, database name
- **Volume:** Persistent data storage
- **Health Check:** Ensures database is ready before other services start

### Redis Cache
- **Image:** redis:7-alpine
- **Port:** 6379
- **Purpose:** Caching and session storage
- **Health Check:** Ensures Redis is ready

### FastAPI Backend
- **Build:** From backend/Dockerfile
- **Port:** 8000
- **Environment:** Database URL, Redis URL, secret key
- **Dependencies:** Waits for database and Redis to be healthy
- **Restart:** Automatic restart on failure

### React Frontend
- **Build:** From frontend/Dockerfile (multi-stage)
- **Port:** 80
- **Dependencies:** Waits for backend
- **Restart:** Automatic restart on failure
- **Nginx:** Serves static files and proxies API requests

## Common Docker Commands

### Starting Services

```bash
# Start all services in detached mode
docker-compose up -d

# Start specific service
docker-compose up backend

# Start with build (force rebuild)
docker-compose up -d --build
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend

# View last 50 lines
docker-compose logs --tail=50 backend
```

### Managing Containers

```bash
# List running containers
docker-compose ps

# View container details
docker inspect foodhawk-backend

# Execute command in container
docker-compose exec backend bash

# Restart service
docker-compose restart backend
```

### Database Management

```bash
# Seed database with demo data
docker-compose exec backend python seed.py

# Access PostgreSQL directly
docker-compose exec db psql -U postgres -d foodhawk

# Backup database
docker-compose exec db pg_dump -U postgres foodhawk > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres foodhawk < backup.sql
```

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Build with no cache
docker-compose build --no-cache
```

### Cleaning Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/foodhawk` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-change-in-production` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |

## Troubleshooting

### Port Already in Use

**Problem:** Port 80, 5432, or 6379 is already in use

**Solution:**
```bash
# Find process using the port
netstat -ano | findstr :80

# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead of 80
```

### Container Won't Start

**Problem:** Container keeps restarting

**Solution:**
```bash
# View logs to see error
docker-compose logs backend

# Check if dependencies are healthy
docker-compose ps

# Restart the service
docker-compose restart backend
```

### Database Connection Failed

**Problem:** Backend can't connect to database

**Solution:**
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify network connectivity
docker-compose exec backend ping db
```

### Out of Disk Space

**Problem:** Docker images taking too much space

**Solution:**
```bash
# Clean up unused resources
docker system prune -a

# Remove specific images
docker rmi foodhawk-backend foodhawk-frontend
```

### Build Failures

**Problem:** Docker build fails

**Solution:**
```bash
# Clear build cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test ./backend

# Verify dependencies
docker-compose exec backend pip list
```

### Permission Errors (Linux)

**Problem:** Permission denied on volume mounts

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
```

## Performance Optimization

### Reduce Image Size

```dockerfile
# Use alpine images
FROM python:3.11-alpine

# Multi-stage builds
FROM node:18-alpine as build
# ... build stage ...
FROM nginx:alpine
# ... final stage ...

# Clean up in RUN commands
RUN apt-get update && apt-get install -y \
    package \
    && rm -rf /var/lib/apt/lists/*
```

### Improve Build Speed

```yaml
# Use BuildKit
export DOCKER_BUILDKIT=1

# Use layer caching
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Use build cache in docker-compose
build:
  context: ./backend
  cache_from:
    - foodhawk-backend:latest
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Development vs Production

### Development Mode (docker-compose.dev.yml)

```yaml
services:
  backend:
    volumes:
      - ./backend:/app  # Hot reload
    command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

  frontend:
    volumes:
      - ./frontend/src:/app/src  # Hot reload
```

**Features:**
- Hot reload for code changes
- Volume mounts for live editing
- Debug mode enabled
- Detailed logging

### Production Mode (docker-compose.yml)

```yaml
services:
  backend:
    # No volume mounts
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Features:**
- No hot reload (optimized build)
- Automatic restart
- Health checks
- Resource limits
- Security hardening

## Security Best Practices

### 1. Use Non-Root User

```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 appuser
USER appuser

WORKDIR /home/appuser/app
```

### 2. Scan Images for Vulnerabilities

```bash
# Install Trivy
brew install trivy  # Mac
# or download from https://aquasecurity.github.io/trivy/

# Scan image
trivy image foodhawk-backend
```

### 3. Use Secrets for Sensitive Data

```yaml
services:
  backend:
    secrets:
      - db_password
      - secret_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt
```

### 4. Minimal Base Images

```dockerfile
# Use alpine or slim images
FROM python:3.11-slim
FROM node:18-alpine
FROM nginx:alpine
```

### 5. Update Regularly

```bash
# Pull latest base images
docker pull python:3.11-slim
docker pull postgres:15-alpine

# Rebuild images
docker-compose build --no-cache
```

## Demo Commands for Presentation

### Quick Demo Setup

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait for services to be healthy (30 seconds)
docker-compose ps

# 3. Seed database
docker-compose exec backend python seed.py

# 4. Open browser to http://localhost
```

### Demo Reset

```bash
# Stop and clear everything
docker-compose down -v

# Start fresh
docker-compose up -d
docker-compose exec backend python seed.py
```

### Demo Monitoring

```bash
# View all logs in one terminal
docker-compose logs -f

# Monitor resource usage
docker stats

# Check service health
docker-compose ps
```

## Free-Tier Cloud Deployment

### Deploy to Render

```bash
# 1. Install Render CLI
npm install -g @render/cli

# 2. Login
render login

# 3. Deploy services
render deploy ./backend
render deploy ./frontend
```

### Deploy to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add services
railway add postgresql
railway add redis
railway up
```

### Deploy to Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Launch
fly launch

# 4. Deploy
fly deploy
```

## Advanced Topics

### Docker Swarm (Multi-Node)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml foodhawk

# Scale services
docker service scale foodhawk_backend=3

# View services
docker service ls
```

### Kubernetes Deployment

```bash
# Install kubectl
# Install minikube for local testing

# Convert docker-compose to k8s
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f foodhawk-backend-deployment.yaml
kubectl apply -f foodhawk-frontend-deployment.yaml
```

## Summary

**Docker Setup Benefits:**
- ✅ Consistent environment across machines
- ✅ Easy setup with single command
- ✅ Isolated dependencies
- ✅ Quick teardown and cleanup
- ✅ Production-ready configuration

**Key Commands:**
```bash
docker-compose up -d              # Start
docker-compose down               # Stop
docker-compose logs -f            # Logs
docker-compose exec backend bash   # Access container
```

**Next Steps:**
1. Run `docker-compose up -d` to start
2. Run `docker-compose exec backend python seed.py` to seed data
3. Open http://localhost in browser
4. Login with demo accounts

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-20  
**Status:** Complete Docker Setup Guide
