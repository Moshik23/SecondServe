# FoodHawk Platform - System Design Document

## 1. Overview

FoodHawk is a cloud-native platform connecting food hawkers with customers to reduce food waste through dynamic pricing of surplus food. The system is designed as a proof-of-concept MVP demonstrating modern DevOps practices, microservices architecture, and real-time data processing.

### 1.1 Problem Statement
- Food hawkers often have surplus food at the end of the day
- Traditional disposal leads to food waste and revenue loss
- Customers seek affordable meal options
- No real-time platform exists to connect these parties efficiently

### 1.2 Solution
- Web-based platform for vendors to list surplus food
- Dynamic pricing engine that auto-discounts nearing expiry items
- Real-time inventory tracking
- Location-based discovery for customers
- Order management system

## 2. System Architecture

### 2.1 High-Level Architecture
The system follows a three-tier architecture:
- **Presentation Layer**: React-based web applications
- **Application Layer**: FastAPI backend with microservices
- **Data Layer**: PostgreSQL database with optional Redis caching

### 2.2 Technology Rationale

#### Frontend - React
- **Chosen for**: Component-based architecture, large ecosystem, excellent tooling
- **Alternatives considered**: Vue.js, Angular (React chosen for popularity and job market relevance)
- **Tailwind CSS**: Utility-first CSS for rapid development and consistent design

#### Backend - FastAPI
- **Chosen for**: Modern Python framework, automatic API documentation, async support, type hints
- **Alternatives considered**: Flask (simpler but less features), Django (too heavy for MVP)
- **SQLAlchemy**: Mature ORM with good PostgreSQL support

#### Database - PostgreSQL
- **Chosen for**: ACID compliance, JSON support, excellent for relational data
- **Alternatives considered**: MongoDB (better for unstructured data), MySQL (good alternative)
- **Rationale**: Relational model fits the use case (users, products, orders)

#### Infrastructure
- **Docker**: Containerization for consistency across environments
- **GitHub Actions**: Native CI/CD integration with GitHub
- **Terraform**: Industry-standard IaC tool
- **Ansible**: Configuration management for server provisioning

## 3. Data Model

### 3.1 Entity Relationships

```
User (1) ----< (N) Products ----< (N) Orders >---- (1) User
```

### 3.2 Database Schema

#### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique email address |
| name | VARCHAR(255) | User's full name |
| hashed_password | VARCHAR(255) | Bcrypt hashed password |
| role | VARCHAR(50) | vendor/customer/admin |
| location | TEXT | JSON string with lat/lng |
| created_at | TIMESTAMP | Account creation timestamp |

#### Products Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| category | VARCHAR(100) | Food category |
| original_quantity | INTEGER | Initial stock quantity |
| stock | INTEGER | Current available stock |
| original_price | DECIMAL(10,2) | Base price |
| price | DECIMAL(10,2) | Current price (with discount) |
| discount_percentage | DECIMAL(5,2) | Current discount percentage |
| expiry_date | TIMESTAMP | Food expiry datetime |
| image_url | VARCHAR(500) | Product image URL |
| vendor_id | INTEGER | Foreign key to users |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### Orders Table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | Customer foreign key |
| product_id | INTEGER | Product foreign key |
| quantity | INTEGER | Order quantity |
| total_price | DECIMAL(10,2) | Order total |
| status | VARCHAR(50) | Order status |
| created_at | TIMESTAMP | Order creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 3.3 Indexes
- `idx_products_vendor`: Optimize vendor product queries
- `idx_products_stock`: Filter available products
- `idx_products_expiry`: Sort by expiry for pricing engine
- `idx_orders_user`: Customer order history
- `idx_orders_product`: Product sales tracking
- `idx_orders_status`: Filter by order status

## 4. API Design

### 4.1 RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)

#### Products
- `GET /api/products` - List all available products
- `GET /api/products/nearby` - Location-based product search
- `GET /api/products/{id}` - Get single product details
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/{id}` - Update product (vendor only)
- `DELETE /api/products/{id}` - Delete product (vendor only)

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user/vendor orders
- `PUT /api/orders/{id}/status` - Update order status

#### Analytics
- `GET /api/vendor/analytics` - Vendor dashboard metrics

#### WebSocket
- `WS /ws` - Real-time updates for inventory and orders

### 4.2 Authentication
- JWT tokens with 24-hour expiry
- Bearer token in Authorization header
- Role-based access control (RBAC)
- Token verification middleware

### 4.3 Error Handling
- HTTP status codes for different error types
- Structured error responses
- Validation errors with field details
- Global exception handling

## 5. Dynamic Pricing Engine

### 5.1 Algorithm
The pricing engine runs as a background task, checking product expiry times every 5 minutes:

```python
def calculate_discount(hours_to_expiry):
    if hours_to_expiry > 48: return 0%
    if hours_to_expiry > 24: return 10%
    if hours_to_expiry > 12: return 25%
    if hours_to_expiry > 6:  return 40%
    if hours_to_expiry > 3:  return 50%
    if hours_to_expiry > 1:  return 60%
    return 70%
```

### 5.2 Implementation
- Async background task using asyncio
- Database queries with SQLAlchemy
- WebSocket broadcast for price updates
- Transaction rollback on errors

### 5.3 Future Enhancements
- Machine learning for demand prediction
- Competitor price analysis
- Time-of-day pricing adjustments
- Weather-based demand modifiers

## 6. Real-Time Updates

### 6.1 WebSocket Implementation
- Connection manager for active clients
- Broadcast to all connected clients
- Event types: product_created, product_updated, product_deleted, order_created, order_updated
- Automatic reconnection handling

### 6.2 Use Cases
- Stock level updates when orders placed
- Price changes from dynamic pricing engine
- New product listings from vendors
- Order status changes

## 7. Security Considerations

### 7.1 Authentication & Authorization
- Password hashing with bcrypt
- JWT tokens with expiration
- Role-based access control
- Secure token storage (httpOnly cookies in production)

### 7.2 Data Protection
- SQL injection prevention (ORM)
- XSS prevention (React escaping)
- CSRF protection (token validation)
- Input validation (Pydantic schemas)

### 7.3 Network Security
- CORS configuration
- Rate limiting (future enhancement)
- HTTPS in production
- API key management for integrations

### 7.4 Secrets Management
- Environment variables for sensitive data
- .env files (gitignored)
- GitHub Secrets for CI/CD
- AWS Secrets Manager (production)

## 8. Scalability Strategy

### 8.1 Horizontal Scaling
- Stateless API design
- Docker containerization
- Load balancer (Nginx/ALB)
- Database connection pooling

### 8.2 Database Scaling
- Read replicas for analytics queries
- Connection pooling (PgBouncer)
- Index optimization
- Query caching (Redis)

### 8.3 Caching Strategy
- Redis for session storage
- API response caching
- Static asset CDN
- Browser caching headers

### 8.4 Performance Optimization
- Lazy loading for images
- Pagination for large datasets
- Database query optimization
- Frontend code splitting

## 9. Monitoring & Observability

### 9.1 Logging
- Structured logging with timestamps
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Centralized log aggregation (CloudWatch)
- Request/response logging

### 9.2 Metrics
- API response times
- Error rates
- Database query performance
- WebSocket connection counts
- User engagement metrics

### 9.3 Health Checks
- `/health` endpoint for backend
- Database connectivity check
- Service dependency checks
- Load balancer health probes

## 10. Deployment Strategy

### 10.1 Environments
- **Development**: Docker Compose locally
- **Staging**: Cloud deployment with test data
- **Production**: Auto-scaling cloud infrastructure

### 10.2 CI/CD Pipeline
1. Code push to GitHub
2. Automated tests (backend + frontend)
3. Docker image build
4. Push to registry
5. Deploy to staging
6. Manual approval for production
7. Deploy to production

### 10.3 Cloud Providers
- **AWS**: ECS Fargate, RDS PostgreSQL, ALB, CloudWatch
- **Alternative**: Google Cloud Run, Cloud SQL
- **Free Tier Options**: Render, Railway, Fly.io

## 11. Future Enhancements

### 11.1 Mobile Application
- React Native Expo for cross-platform mobile app
- Push notifications for deals
- Location-based alerts
- Offline mode support

### 11.2 Advanced Features
- AI-generated product descriptions
- Image recognition for food categorization
- Recommendation engine
- In-app payments (Stripe integration)
- Review and rating system
- Vendor analytics dashboard improvements

### 11.3 Integrations
- Social media sharing
- Calendar integration for pickup times
- SMS notifications
- Third-party delivery services

## 12. Cost Considerations

### 12.1 Development Costs
- Development time: ~80 hours
- Tools: Free (GitHub, Docker, etc.)
- Infrastructure: Free tier or minimal cost

### 12.2 Production Costs (AWS Estimate)
- ECS Fargate: ~$20/month (t3.micro)
- RDS PostgreSQL: ~$15/month (db.t3.micro)
- ALB: ~$20/month
- CloudWatch: ~$5/month
- Data Transfer: Variable
- **Total**: ~$60-100/month for small deployment

### 12.3 Free Alternatives
- Render: Free tier available
- Railway: Free tier with credits
- Fly.io: Free tier for small apps
- Heroku: Free tier (limited)

## 13. Testing Strategy

### 13.1 Unit Tests
- Backend: pytest with fixtures
- Frontend: Jest + React Testing Library
- Coverage goal: 70% minimum

### 13.2 Integration Tests
- API endpoint testing
- Database integration
- WebSocket connection tests

### 13.3 E2E Tests
- User flow testing (Playwright)
- Cross-browser testing
- Mobile responsiveness

### 13.4 Load Testing
- API performance under load
- Database query optimization
- WebSocket connection limits

## 14. Maintenance & Operations

### 14.1 Regular Tasks
- Database backups (daily)
- Log rotation
- Security patching
- Dependency updates
- Performance monitoring

### 14.2 Incident Response
- Error alerting ( PagerDuty/Sentry)
- Rollback procedures
- Incident documentation
- Post-mortem analysis

## 15. Success Metrics

### 15.1 Technical Metrics
- API response time < 200ms (p95)
- 99.9% uptime
- Zero data loss incidents
- Successful deployments > 95%

### 15.2 Business Metrics (Future)
- Food waste reduction percentage
- Vendor revenue increase
- Customer savings
- User retention rate
- Order completion rate

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-20  
**Status**: MVP Complete
