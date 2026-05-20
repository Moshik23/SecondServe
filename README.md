# FoodHawk Platform 🍽️

A cloud-native proof-of-concept ecommerce platform for food hawkers to sell surplus food at discounted prices, reducing food waste while helping customers save money.

## 🎯 Project Goals

- Demonstrate DevOps, CI/CD, Docker, and cloud deployment practices
- Provide a portfolio-ready MVP with modern architecture
- Showcase scalable system design
- Implement real-time inventory tracking and dynamic pricing
- Minimize food waste through smart expiry-based discounts

## 🌟 Key Features

### For Vendors
- **Dashboard**: Manage products, view orders, track analytics
- **Product Management**: Upload surplus food listings with expiry dates
- **Real-time Updates**: WebSocket-based inventory tracking
- **Dynamic Pricing**: Automatic discounts based on time to expiry
- **Order Management**: Accept, confirm, and complete orders

### For Customers
- **Browse Products**: Discover nearby food deals
- **Location-based**: Find food from hawkers in your area
- **Real-time Stock**: Live inventory updates
- **Discount Alerts**: See expiring food at steep discounts
- **Order Tracking**: Monitor order status in real-time

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **WebSocket** - Real-time updates

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local development
- **GitHub Actions** - CI/CD pipeline
- **Terraform** - Infrastructure as Code (AWS)
- **Ansible** - Configuration management

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- PostgreSQL 15+ (or use Docker)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd food-hawk-platform
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

4. **Demo Accounts**
- Vendor: `vendor@demo.com` / `demo123`
- Customer: `customer@demo.com` / `demo123`

### Local Development

#### Backend Setup

1. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start PostgreSQL** (or use Docker)
```bash
docker run -d --name foodhawk-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=foodhawk \
  -p 5432:5432 \
  postgres:15-alpine
```

4. **Run the backend**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start the development server**
```bash
npm start
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 🐳 Docker Commands

### Build images
```bash
docker-compose build
```

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Restart services
```bash
docker-compose restart
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`ci-cd.yml`) includes:

1. **Backend Tests**: Run pytest with PostgreSQL service
2. **Frontend Tests**: Run React tests
3. **Build**: Build Docker images
4. **Push**: Push to Docker Hub (on main branch)
5. **Deploy**: Deploy to cloud (configure based on provider)

### Required Secrets

Configure these in GitHub repository settings:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password/token

## ☁️ Cloud Deployment

### Using Terraform (AWS)

1. **Install Terraform**
```bash
# Download from https://www.terraform.io/downloads
```

2. **Configure AWS credentials**
```bash
aws configure
```

3. **Set up variables**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

4. **Initialize Terraform**
```bash
terraform init
```

5. **Plan deployment**
```bash
terraform plan
```

6. **Apply deployment**
```bash
terraform apply
```

### Using Ansible

1. **Configure inventory**
```bash
cd ansible
cp inventory.example inventory
# Edit inventory with your server details
```

2. **Run server setup**
```bash
ansible-playbook -i inventory setup-server.yml
```

3. **Deploy application**
```bash
ansible-playbook -i inventory deploy.yml
```

### Alternative: Free Cloud Platforms

For a simpler deployment, consider:
- **Render**: Deploy Docker containers
- **Railway**: Full-stack deployment
- **Fly.io**: Global edge deployment
- **Heroku**: Easy PaaS deployment

## 📊 Dynamic Pricing Engine

The smart pricing engine automatically discounts food based on time to expiry:

| Time to Expiry | Discount |
|----------------|----------|
| > 48 hours | 0% |
| 24-48 hours | 10% |
| 12-24 hours | 25% |
| 6-12 hours | 40% |
| 3-6 hours | 50% |
| 1-3 hours | 60% |
| < 1 hour | 70% |

The pricing engine runs as a background task, checking every 5 minutes.

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Input validation with Pydantic
- Environment variable management

## 📁 Project Structure

```
food-hawk-platform/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── pricing_engine.py   # Dynamic pricing
│   ├── websocket_manager.py # WebSocket handling
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   └── services/       # API client
│   ├── public/             # Static files
│   ├── Dockerfile          # Frontend Dockerfile
│   └── package.json        # Node dependencies
├── database/               # Database scripts
│   ├── schema.sql          # Database schema
│   └── init.sql            # Demo data
├── docker/                 # Docker configurations
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Terraform configuration
│   ├── variables.tf       # Variable definitions
│   └── outputs.tf         # Output definitions
├── ansible/                # Configuration management
│   ├── deploy.yml         # Deployment playbook
│   ├── setup-server.yml   # Server setup playbook
│   └── inventory.example # Inventory template
├── .github/workflows/      # CI/CD pipelines
│   ├── ci-cd.yml         # Main CI/CD workflow
│   └── docker-build.yml  # Docker build workflow
├── docs/                   # Documentation
│   └── architecture.md    # System architecture
├── docker-compose.yml      # Production compose
└── docker-compose.dev.yml  # Development compose
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **API Docs**: `/docs` (Swagger UI)
- **Logs**: Docker logs or CloudWatch (in production)

## 🤝 Contributing

This is a proof-of-concept project. For contributions:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is created for educational and demonstration purposes.

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Docker**: https://docs.docker.com/
- **Terraform**: https://developer.hashicorp.com/terraform
- **Ansible**: https://docs.ansible.com/

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Built with ❤️ to reduce food waste and help communities thrive.**
