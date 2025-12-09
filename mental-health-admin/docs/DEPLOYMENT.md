# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Kubernetes cluster (1.20+)
- PostgreSQL 13+
- Redis 6.0+
- AWS KMS access
- Node.js 18+ (for local development)

## Local Development

### Using Docker Compose

1. Clone the repository and navigate to the project root:
```bash
cd mental-health-admin
```

2. Create `.env` file with appropriate values:
```bash
cp .env.example .env
```

3. Start the services:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`: Database credentials
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `JWT_SECRET`: JWT signing key
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Development/Production

## Docker Build

### Build images:
```bash
docker build -t mental-health-admin-frontend ./frontend
docker build -t mental-health-admin-backend ./backend
docker build -t mental-health-admin-postgres ./database
```

## Kubernetes Deployment

### Prerequisites
1. Create namespace:
```bash
kubectl create namespace mental-health
```

2. Create secrets:
```bash
kubectl create secret generic db-credentials \
  --from-literal=password=$DB_PASSWORD \
  -n mental-health

kubectl create secret generic jwt-secret \
  --from-literal=secret=$JWT_SECRET \
  -n mental-health
```

3. Create ConfigMap:
```bash
kubectl create configmap app-config \
  --from-file=k8s/configmap.yaml \
  -n mental-health
```

### Deploy using kubectl:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment-postgres.yaml
kubectl apply -f k8s/deployment-redis.yaml
kubectl apply -f k8s/deployment-backend.yaml
kubectl apply -f k8s/deployment-frontend.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
```

### Verify deployment:
```bash
kubectl get pods -n mental-health
kubectl get svc -n mental-health
kubectl logs -f deployment/mental-health-admin-backend -n mental-health
```

## Database Migrations

### Initialize database:
```bash
kubectl exec -it <postgres-pod> -n mental-health -- psql -U postgres -d mental_health_db -f /schema.sql
kubectl exec -it <postgres-pod> -n mental-health -- psql -U postgres -d mental_health_db -f /seed-data.sql
```

## Monitoring & Logging

### View logs:
```bash
# Backend logs
kubectl logs -f deployment/mental-health-admin-backend -n mental-health

# Frontend logs
kubectl logs -f deployment/mental-health-admin-frontend -n mental-health

# All pods
kubectl logs -l app=mental-health-admin -n mental-health
```

### Health checks:
```bash
curl http://localhost:3001/health
```

## Scaling

### Manual scaling:
```bash
kubectl scale deployment mental-health-admin-backend --replicas=3 -n mental-health
```

### Horizontal Pod Autoscaling:
```bash
kubectl apply -f k8s/hpa.yaml
kubectl get hpa -n mental-health
```

## SSL/TLS Configuration

### Using Let's Encrypt:
1. Install cert-manager
2. Create Certificate resource
3. Configure Ingress with TLS

## Backup & Recovery

### Database Backup:
```bash
kubectl exec <postgres-pod> -n mental-health -- pg_dump -U postgres mental_health_db > backup.sql
```

### Restore from backup:
```bash
kubectl exec -it <postgres-pod> -n mental-health -- psql -U postgres -d mental_health_db < backup.sql
```

## Troubleshooting

### Pod not starting:
```bash
kubectl describe pod <pod-name> -n mental-health
kubectl logs <pod-name> -n mental-health
```

### Database connection issues:
```bash
kubectl exec -it <postgres-pod> -n mental-health -- psql -U postgres
```

### Memory issues:
```bash
kubectl top nodes
kubectl top pods -n mental-health
```

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Monitoring and logging setup
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
- [ ] Admin training completed
