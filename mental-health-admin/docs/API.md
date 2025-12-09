# Mental Health Admin Dashboard - API Documentation

## Overview
This is the API documentation for the National Student Wellbeing Portal, a privacy-first mental health administration system for educational institutions.

## Authentication
All endpoints (except `/health`) require Bearer token authentication.

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Analytics

#### GET /api/analytics/overview
Get dashboard overview metrics.

**Response:**
```json
{
  "total_students": 1247,
  "critical": 23,
  "moderate": 89,
  "good": 993,
  "pending_questionnaires": 47,
  "avg_adherence": 72.5,
  "outreach_needed": 15
}
```

#### GET /api/analytics/trend?days=7
Get weekly severity trends.

**Response:**
```json
{
  "trend": [
    {
      "day": "2025-11-23",
      "critical": 18,
      "moderate": 82,
      "good": 1147,
      "avg_score": 23
    }
  ]
}
```

### Critical Monitor

#### GET /api/admin/critical
Get list of critical students (anonymized).

**Query Parameters:**
- `min_severity` (number): Filter by minimum severity (0-1)
- `course` (string): Filter by course code
- `limit` (integer, default: 50): Number of results
- `offset` (integer, default: 0): Pagination offset

**Response:**
```json
{
  "total": 23,
  "students": [
    {
      "anon_id": "ANO-7F3K2",
      "gender": "F",
      "course": "CSE-Y3",
      "severity": 0.82,
      "lastSeen": "2025-11-23T10:30:00Z",
      "questionnaire": true,
      "adherence": 65
    }
  ]
}
```

#### GET /api/admin/critical/{anon_id}
Get detailed view of critical student.

**Response:**
```json
{
  "anon_id": "ANO-7F3K2",
  "gender": "F",
  "course": "CSE-Y3",
  "severity": 0.82,
  "weeklyTrend": [45, 52, 61, 68, 75, 79, 82],
  "chatbotInteractions": 12
}
```

### Contact Information

#### POST /api/admin/contact
Access contact information (audited).

**Request:**
```json
{
  "anon_id": "ANO-7F3K2",
  "contact_reason": "mandatory_phq9_followup"
}
```

**Reason Options:**
- `mandatory_phq9_followup`
- `mandatory_gad7_followup`
- `wellness_check`
- `program_reminder`

**Response:**
```json
{
  "anon_id": "ANO-7F3K2",
  "contact": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john.doe@university.edu.in"
  },
  "accessed_at": "2025-11-23T10:30:00Z",
  "accessed_by": "ADM-001"
}
```

### Identity Reveal

#### POST /api/reveal/request
Request identity reveal.

**Request:**
```json
{
  "anon_id": "ANO-7F3K2",
  "justification": "Student showing severe distress indicators requiring immediate intervention..."
}
```

**Response:**
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "created_at": "2025-11-23T10:30:00Z"
}
```

#### POST /api/reveal/approve
Approve identity reveal (requires 2FA).

**Request:**
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440001",
  "twofa_code": "123456",
  "approval_decision": "approve"
}
```

**Response:**
```json
{
  "status": "approved",
  "reveal_token": "TOKEN_XXXXXX",
  "expires_at": "2025-11-23T12:30:00Z"
}
```

### Audit Trail

#### GET /api/audit
Get audit trail.

**Query Parameters:**
- `admin_id` (string): Filter by admin ID
- `action` (string): Filter by action type
- `start_date` (date-time): Filter by start date
- `end_date` (date-time): Filter by end date

**Response:**
```json
{
  "total": 150,
  "logs": [
    {
      "audit_id": "550e8400-e29b-41d4-a716-446655440001",
      "admin_id": "ADM-001",
      "action": "access_contact",
      "anon_id": "ANO-7F3K2",
      "timestamp": "2025-11-23T10:30:00Z",
      "revealed": false
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Security Headers
All responses include:
- `Content-Security-Policy`: Strict CSP directives
- `Strict-Transport-Security`: HSTS enabled (1 year)
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: deny
