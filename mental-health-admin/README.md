# National Student Wellbeing Portal - Mental Health Admin Dashboard

A privacy-first student mental health administration system for educational institutions, built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### Analytics Dashboard
- Real-time student wellbeing metrics
- 7-day severity trends visualization
- Department-wise analysis
- Monthly comparison reports
- Intervention effectiveness tracking
- Live alert monitoring

### Critical Monitor
- Identify at-risk students (anonymized)
- View detailed student profiles
- Track compliance status
- Monitor adherence rates
- 7-day severity progression tracking

### Privacy & Security
- End-to-end anonymization (UUID-based identifiers)
- Multi-factor authentication (2FA)
- Role-based access control (RBAC)
- Immutable audit logging
- AWS KMS encryption
- TLS 1.3 enforced communication

### Compliance Tracking
- Mandatory questionnaire enforcement (PHQ-9, GAD-7)
- Overdue assessment tracking
- Outreach campaign management
- Student consent management

### Identity Reveal
- Audited identity reveal requests with justification
- ApproverAdmin 2FA verification required
- Time-limited reveal tokens (2 hours)
- Comprehensive audit trail

## Technology Stack

### Frontend
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Recharts (data visualization)
- Lucide React (icons)

### Backend
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL
- Redis (caching)
- AWS KMS (encryption)
- JWT (authentication)

### DevOps
- Docker & Docker Compose
- Kubernetes
- AWS (RDS, KMS, ALB)
- Let's Encrypt (SSL/TLS)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 13+
- Redis 6.0+

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/deep-ghosh/mental-health-admin.git
cd mental-health-admin
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start services:
```bash
docker-compose up -d
```

4. Initialize database:
```bash
docker-compose exec postgres psql -U postgres -d mental_health_db -f /schema.sql
docker-compose exec postgres psql -U postgres -d mental_health_db -f /seed-data.sql
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/docs

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## Project Structure

```
mental-health-admin/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/             # Database, Redis, KMS
│   │   ├── middleware/         # Auth, RBAC, Audit
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Data models
│   │   ├── utils/              # Helper functions
│   │   └── types/              # TypeScript interfaces
│   ├── tests/                  # Unit, integration, E2E tests
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.sql              # Database schema
│   ├── seed-data.sql           # Sample data
│   ├── migrations/             # Database migrations
│   └── seeds/                  # Seed scripts
├── k8s/                        # Kubernetes manifests
│   ├── deployment-*.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── network-policy.yaml
├── docs/
│   ├── API.md                  # API documentation
│   ├── SECURITY.md             # Security guidelines
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── TESTING.md              # Testing guide
├── docker-compose.yml
├── openapi.yaml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
All endpoints require Bearer token authentication.

### Analytics
- `GET /api/analytics/overview` - Overview metrics
- `GET /api/analytics/trend` - Weekly trends
- `GET /api/analytics/department` - Department stats
- `GET /api/analytics/monthly` - Monthly comparison

### Critical Monitor
- `GET /api/admin/critical` - Critical students list
- `GET /api/admin/critical/{anon_id}` - Student details

### Contact Access
- `POST /api/admin/contact` - Access contact information (audited)

### Identity Reveal
- `POST /api/reveal/request` - Request identity reveal
- `POST /api/reveal/approve` - Approve reveal (2FA required)

### Audit
- `GET /api/audit` - View audit trail

See [API.md](docs/API.md) for complete documentation.

## Security

### Key Features
- **Encryption**: All PII encrypted with AWS KMS
- **Authentication**: JWT-based with 2FA support
- **Authorization**: Role-based access control
- **Audit**: Immutable, encrypted audit logs
- **Network**: TLS 1.3, CSP headers, CORS restrictions

See [SECURITY.md](docs/SECURITY.md) for detailed security guidelines.

## Deployment

### Development
```bash
docker-compose up
```

### Production (Kubernetes)
```bash
kubectl apply -f k8s/
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

See [TESTING.md](docs/TESTING.md) for comprehensive testing guide.

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

This project is licensed under the Government of India License. See LICENSE file for details.

## Contact

For security issues, please contact: security@education.gov.in
For general inquiries: admin@student-wellbeing.gov.in

## Acknowledgments

- Ministry of Education, Government of India
- Educational institutions and students across India
- Security & Privacy experts who contributed to this project

---

**Built with care for student wellbeing and data privacy.**
