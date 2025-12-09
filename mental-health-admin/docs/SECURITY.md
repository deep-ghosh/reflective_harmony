# Security Documentation

## Overview
This document outlines the security measures implemented in the Mental Health Admin Dashboard.

## Data Protection

### Encryption
- All Personally Identifiable Information (PII) is encrypted at rest using AWS KMS
- TLS 1.3 is enforced for all data in transit
- Database connections use SSL/TLS encryption

### Anonymization
- Student identities are anonymized using UUID-based `anon_id` identifiers
- Real names and direct identifiers are stored separately from wellbeing metrics
- Contact information is only revealed through audited, logged requests

## Authentication & Authorization

### Multi-Factor Authentication (2FA)
- All identity reveal requests require ApproverAdmin level 2FA verification
- TOTP-based authentication using industry-standard algorithms
- Time-locked tokens with configurable expiration

### Role-Based Access Control (RBAC)
- **Admin**: Can access anonymized student data, request identity reveals
- **ApproverAdmin**: Can approve identity reveal requests with 2FA
- **Auditor**: Can view audit logs (read-only)
- **SuperAdmin**: Full system access (limited usage)

## Audit & Compliance

### Immutable Audit Logging
- All sensitive actions are logged to an append-only audit table
- Logs include: timestamp, admin ID, action, student anon_id, IP address, result
- Logs cannot be modified or deleted
- Identity reveal requests are tracked with justification text

### Compliance Features
- GDPR-compliant data handling
- Student consent tracking for information access
- Mandatory PHQ-9 and GAD-7 questionnaire enforcement
- Compliance tracker showing overdue assessments

## API Security

### Rate Limiting
- 100 requests per IP per 15 minutes
- Different limits for different endpoint types
- Configurable per environment

### Request Validation
- All inputs validated using Joi schema validation
- SQL injection prevention through parameterized queries
- XSS protection through output encoding

### CORS Configuration
- Strict origin validation
- Limited HTTP methods (GET, POST, PUT, DELETE)
- Explicit header allowlisting

## Network Security

### TLS/SSL
- TLS 1.3 mandatory in production
- Strong cipher suites only
- Certificate pinning available

### Security Headers
- Content-Security-Policy: Strict directives
- Strict-Transport-Security: 1-year HSTS
- X-Frame-Options: deny (prevent clickjacking)
- X-Content-Type-Options: nosniff

## Data Retention

### Audit Logs
- Retained for 7 years (compliance requirement)
- Encrypted at rest
- Geographically distributed backups

### Student Data
- Anonymized wellbeing metrics: Indefinite
- Contact information: Only when authorized
- Session logs: 90 days

## Incident Response

### Security Incidents
1. Automatic alerting on suspicious activities
2. Incident logging with full audit trail
3. Escalation procedures to security team
4. Post-incident analysis and remediation

### Contact Reveal Abuse
- Requests with weak justifications are flagged
- Pattern detection for unauthorized access attempts
- Automatic admin account lock on suspicious activity

## Encryption Keys

### Key Management
- Keys stored in AWS KMS with proper IAM policies
- Key rotation every 90 days
- Separate keys for different data types
- Hardware security module (HSM) backed

### Key Access
- Only authorized services can request decryption
- All key operations are logged
- Access requires both RBAC and network-level authentication

## Compliance Standards

- GDPR Article 5, 32, 33
- ISO 27001 Information Security Management
- NIST Cybersecurity Framework
- Indian Data Privacy Guidelines
- Educational Data Protection Guidelines
