# Mental Health Admin Dashboard

A privacy-first student mental health administration system for government educational institutions.

## 🎯 Project Overview

This is a secure, HIPAA-compliant admin dashboard for monitoring student mental health metrics with:
- **Anonymized student tracking** with risk assessment
- **Privacy-first identity reveal** with 2FA approval workflow
- **Immutable audit trail** for all administrative actions
- **Real-time analytics** with severity distribution tracking
- **Compliance monitoring** for mandatory questionnaire completion

## 📋 Project Structure

```
mental-health-admin/
├── frontend/                 # React + TypeScript + Vite + Tailwind
├── backend/                  # Node.js + Express + TypeScript
├── database/                 # PostgreSQL schema & migrations
├── k8s/                      # Kubernetes deployment manifests
├── docs/                     # API & deployment documentation
├── docker-compose.yml        # Local development environment
└── openapi.yaml             # OpenAPI 3.0 specification
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

#### Option 1: Run both services (Windows)
```bash
# In the project root
.\start.bat
```

#### Option 2: Run both services (Linux/Mac)
```bash
# In the project root
./start.sh
```

#### Option 3: Run individually

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

## 📚 Building

### Frontend Build
```bash
cd frontend
npm run build
# Output: dist/
```

### Backend Build
```bash
cd backend
npm run build
# Output: dist/
```

### Docker Build
```bash
docker-compose build
docker-compose up
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### End-to-End Tests
```bash
cd backend
npm run test:e2e
```

## 🔐 Security Features

- **TLS 1.3** for all HTTPS connections
- **JWT authentication** with secure token handling
- **Role-Based Access Control (RBAC)** for admin permissions
- **Rate limiting** to prevent abuse
- **Helmet.js** for comprehensive HTTP security headers
- **CORS** with strict origin validation
- **Input validation** with Joi schemas
- **Audit logging** of all privileged actions
- **2FA verification** for sensitive operations

## 📊 Dashboard Features

### Analytics Dashboard
- Real-time student severity metrics
- 7-day trend analysis with area charts
- Department-wise comparison
- 6-month historical trends
- Intervention effectiveness tracking
- Live alert notifications

### Critical Monitor
- Filtered list of students requiring intervention
- Severity-based risk scoring (0-100%)
- Search and filtering capabilities
- Adherence tracking
- Status indicators (escalating, stable, improving)

### Compliance Tracker
- Overdue questionnaire monitoring
- Contact information access logging
- Mandatory assessment tracking
- Outreach campaign management

### Audit Trail
- Immutable record of all admin actions
- Timestamp and IP address logging
- User identification and action type
- Identity reveal request history
- Regulatory compliance documentation

## 🗄️ Database Schema

### Key Tables
- `anon_students` - Anonymized student profiles
- `student_severity_history` - Historical risk assessments
- `audit_logs` - Immutable action records
- `reveal_requests` - Identity disclosure requests
- `reveal_approvals` - 2FA verified reveals

## 🔌 API Endpoints

### Analytics
- `GET /api/analytics/overview` - Dashboard metrics
- `GET /api/analytics/trend` - Weekly trend data
- `GET /api/analytics/departments` - Department statistics

### Students
- `GET /api/admin/critical` - Critical students list
- `GET /api/admin/critical/:anon_id` - Student details

### Reveal Requests
- `POST /api/reveal/request` - Request identity reveal
- `POST /api/reveal/approve` - Approve with 2FA

### Audit
- `GET /api/audit` - Audit log with filtering

## 📖 Documentation

- **API Documentation**: See `docs/API.md`
- **Security Guidelines**: See `docs/SECURITY.md`
- **Deployment Guide**: See `docs/DEPLOYMENT.md`
- **Testing Guide**: See `docs/TESTING.md`
- **OpenAPI Spec**: See `openapi.yaml`

## 🐳 Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Access dashboard
# Frontend: http://localhost
# Backend API: http://localhost/api
```

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments -n mental-health-admin

# View logs
kubectl logs -n mental-health-admin -l app=frontend
kubectl logs -n mental-health-admin -l app=backend
```

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- Zustand for state management

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL for persistence
- Redis for caching
- JSON Web Tokens for auth
- Winston for logging

### DevOps
- Docker & Docker Compose
- Kubernetes manifests
- PostgreSQL & Redis containers
- CI/CD ready

## 📝 Environment Variables

Create `.env` file in root:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mental_health_db
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key

# Frontend
VITE_API_URL=http://localhost:3000

# TLS (production)
TLS_KEY_PATH=/path/to/key.pem
TLS_CERT_PATH=/path/to/cert.pem
```

## 📞 Support & Documentation

For detailed documentation, refer to the `/docs` folder:
- API endpoints and schemas
- Security best practices
- Deployment procedures
- Test coverage guidelines

## 📄 License

This project is part of the National Student Wellbeing Portal initiative.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: ✅ Production Ready
