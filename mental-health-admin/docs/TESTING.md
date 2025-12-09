# Testing Guide

## Unit Tests

### Running unit tests:
```bash
npm run test:unit
```

### Test structure:
```
backend/tests/unit/
├── services/
│   ├── analytics.service.test.ts
│   ├── encryption.service.test.ts
│   └── twofa.service.test.ts
├── controllers/
│   ├── admin.controller.test.ts
│   └── analytics.controller.test.ts
└── middleware/
    ├── auth.test.ts
    └── rbac.test.ts
```

## Integration Tests

### Running integration tests:
```bash
npm run test:integration
```

Integration tests verify:
- Database connectivity
- API endpoint functionality
- Authentication and authorization
- Error handling

## E2E Tests

### Running E2E tests:
```bash
npm run test:e2e
```

Test scenarios:
1. Student data access flow
2. Contact information reveal process
3. Identity reveal workflow
4. Audit trail verification
5. Compliance tracking

## Security Testing

### SQL Injection Tests
```bash
npm run test:security:sql-injection
```

### XSS Prevention Tests
```bash
npm run test:security:xss
```

### CSRF Protection Tests
```bash
npm run test:security:csrf
```

## Performance Testing

### Load testing:
```bash
npm run test:load
```

Targets:
- 1000 concurrent users
- 10 requests per second
- 500 requests total

### Benchmark tests:
```bash
npm run test:benchmark
```

## Test Coverage

### Generate coverage report:
```bash
npm run test:coverage
```

Target coverage:
- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

## Continuous Integration

Tests automatically run on:
- Pull requests
- Commits to main branch
- Scheduled nightly builds

## Manual Testing Checklist

### Frontend
- [ ] Dashboard loads correctly
- [ ] Charts render properly
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Modal dialogs function properly
- [ ] Export data feature works
- [ ] Responsive design on mobile

### Backend
- [ ] Health endpoint responds
- [ ] Authentication works
- [ ] Rate limiting functions
- [ ] Audit logging captures actions
- [ ] Error handling provides proper messages
- [ ] Database connections are stable
- [ ] Cache invalidation works correctly

### Security
- [ ] HTTPS enforced
- [ ] CSRF tokens validated
- [ ] SQL injection prevented
- [ ] XSS payloads sanitized
- [ ] Rate limiting prevents abuse
- [ ] Authentication required for all endpoints
- [ ] Authorization checks enforced

## Test Data

Sample test users:
```
Admin User: admin@university.edu.in (password: TestAdmin123!)
Approver User: approver@university.edu.in (password: TestApprover123!)
Auditor User: auditor@university.edu.in (password: TestAuditor123!)
```

Sample test students:
- ANO-7F3K2 (Critical, pending questionnaire)
- ANO-9M2L8 (Critical, missing form)
- ANO-4N8P1 (Moderate, compliant)

## Regression Testing

### Run full test suite:
```bash
npm run test:full
```

### Run only changed tests:
```bash
npm run test:watch
```
