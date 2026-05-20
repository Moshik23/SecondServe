# FoodHawk Platform - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                    ┌──────────────┐                     │
│  │   Customer   │                    │    Vendor    │                     │
│  │   Web App    │                    │  Dashboard   │                     │
│  │  (React)     │                    │   (React)    │                     │
│  └──────┬───────┘                    └──────┬───────┘                     │
│         │                                     │                              │
│         └─────────────────┬───────────────────┘                              │
│                           │                                                  │
└───────────────────────────┼──────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Nginx Reverse Proxy                                │  │
│  │  - SSL Termination                                                   │  │
│  │  - Static File Serving                                                │  │
│  │  - Load Balancing                                                     │  │
│  └───────────────────────────┬──────────────────────────────────────────┘  │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   FastAPI Backend                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │   Auth API   │  │  Product API │  │  Order API   │               │  │
│  │  │  (JWT)       │  │  (CRUD)      │  │  (CRUD)      │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │ Pricing Eng. │  │  WebSocket   │  │  Analytics   │               │  │
│  │  │ (Dynamic)    │  │  (Real-time) │  │  Dashboard   │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └───────────────────────────┬──────────────────────────────────────────┘  │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL Database                                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │  Users   │  │ Products │  │  Orders  │  │  Audit   │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │  │
│  └───────────────────────────┬──────────────────────────────────────────┘  │
│                              │                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Redis Cache (Optional)                            │  │
│  │  - Session Storage                                                    │  │
│  │  - Real-time Data                                                      │  │
│  └───────────────────────────┬──────────────────────────────────────────┘  │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │   Docker     │  │   GitHub     │  │   Cloud      │                     │
│  │  Containers  │  │   Actions    │  │  Provider    │                     │
│  │              │  │   (CI/CD)    │  │  (AWS/GCP)   │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React)
- **Customer Web App**: Browse products, place orders, view order history
- **Vendor Dashboard**: Manage products, view orders, analytics dashboard
- **Mobile App**: React Native Expo (future enhancement)

### Backend (FastAPI)
- **Authentication**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for food listings
- **Order Management**: Order creation, status updates
- **Dynamic Pricing Engine**: Auto-discounts based on expiry time
- **WebSocket**: Real-time inventory updates
- **Analytics**: Sales metrics and waste prevention tracking

### Database (PostgreSQL)
- **Users**: Vendor and customer accounts
- **Products**: Food listings with stock and pricing
- **Orders**: Transaction records
- **Indexes**: Optimized for performance

### Infrastructure
- **Docker**: Containerization for all services
- **Docker Compose**: Local development orchestration
- **GitHub Actions**: CI/CD pipeline
- **Terraform**: Infrastructure as Code for cloud deployment
- **Ansible**: Configuration management

## Data Flow

### Product Listing Flow
```
Vendor → Dashboard → API → Database → WebSocket → Customer App
```

### Order Placement Flow
```
Customer → Browse → Add to Cart → API → Database → WebSocket → Vendor Dashboard
```

### Dynamic Pricing Flow
```
Pricing Engine (Background) → Check Expiry → Calculate Discount → Update Price → WebSocket Notification
```

## Security Considerations

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Input validation with Pydantic
- Environment variable management
- SSL/TLS for production

## Scalability Considerations

- Stateless API design
- Horizontal scaling with Docker
- Load balancing with Nginx
- Database connection pooling
- Caching with Redis (optional)
- CDN for static assets
