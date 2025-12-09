# Emotion Recognition Model - Backend API

A robust Express.js/TypeScript backend for emotion recognition with JWT authentication, encryption key management, and ML pipeline job queuing.

## Features

✅ **User Authentication**

- User registration and login with bcrypt password hashing
- JWT-based access tokens (RSA-2048 signed)
- Refresh token management
- Secure token validation middleware

✅ **Encryption Management**

- Generate encryption/decryption key pairs
- Store decryption keys with expiration windows
- Automatic key cleanup for expired sessions

✅ **Data Submission & Processing**

- Accept encrypted data submissions
- Queue jobs for ML pipeline processing
- Job tracking with Bull queue
- Fallback in-memory queue if Redis unavailable

✅ **Database Support**

- SQLite for development/testing
- PostgreSQL for production
- Automatic schema initialization

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Authentication**: JWT (RSA-2048) + bcrypt
- **Database**: SQLite / PostgreSQL
- **Job Queue**: Bull (with Redis backend)
- **Crypto**: Node.js built-in crypto module

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── index.ts              # Server entry point
├── controllers/          # Request handlers
│   ├── auth.controller.ts
│   ├── encrytion.controller.ts
│   ├── health.controller.ts
│   └── submit.controller.ts
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── encrytion.service.ts
│   ├── health.service.ts
│   └── queue.processor.ts
├── routes/             # API route definitions
│   ├── auth.route.ts
│   ├── encryption.route.ts
│   ├── health.route.ts
│   ├── home.route.ts
│   └── submit.route.ts
├── middlewares/        # Express middlewares
│   ├── auth.middleware.ts
│   ├── errorHandler.ts
│   └── requestLogger.ts
├── db/                 # Database setup
│   ├── connect.ts
│   └── init.ts
├── schemas/            # SQL table definitions
│   ├── user.sql
│   ├── refresh-token.sql
│   └── decryption-window.sql
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── crypto.ts       # Key generation
│   ├── generateKeys.ts # RSA key pair generation
│   ├── jwt.ts
│   ├── password.ts
│   └── httpError.ts
└── scripts/
    └── setup-db.ts    # Database initialization script

keys/                  # RSA key storage (generated on startup)
├── public.pem
└── private.pem

dist/                  # Compiled JavaScript output
```

## Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- SQLite (included) or PostgreSQL

### Setup

```bash
# Install dependencies
npm install

# Copy environment file (if needed)
cp .env.example .env

# Setup database
npm run setup-db

# Build TypeScript
npm run build

# Start server
npm run start
```

## Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Database (SQLite)
DB_DRIVER=sqlite
SQLITE_PATH=./database.sqlite

# Database (PostgreSQL alternative)
# DB_DRIVER=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=password
# DB_NAME=emotion_db

# Redis (for job queue)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Authentication Routes

```
GET /auth
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/me (protected)
```

#### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "userId": "john_doe",
  "userPass": "SecurePassword123!"
}
```

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "userId": "john_doe",
  "userPass": "SecurePassword123!"
}

# Response includes accessToken and refreshToken
```

### Encryption Routes

```
POST /encryption (protected)
```

Generate encryption key pair for data submission.

```bash
POST /encryption
Authorization: Bearer <accessToken>
Content-Type: application/json

# Response
{
  "encryptionKey": "799d8f04d871b18ff65c3c7596f4517d5e2169e4306cb32ef35984d3cb331378",
  "message": "Encryption key generated successfully"
}
```

### Submission Routes

```
POST /api/submit (protected)
```

Submit encrypted data to ML pipeline.

```bash
POST /api/submit
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "encryptedData": "base64-encoded-or-encrypted-data"
}

# Response
{
  "message": "Request queued successfully",
  "jobId": "2",
  "userId": "ca3603d6-3b55-44cb-bc21-db9f9bc05dc8"
}
```

## Testing

### Run All Tests (Database Setup + API Tests)

```bash
.\test-full.ps1  # PowerShell (Windows)
bash test-full.sh # Bash (Linux/macOS)
```

### Run Only API Tests

```bash
npm run test:api
```

### Run Database Setup

```bash
npm run setup-db
```

### Development Mode

```bash
npm run dev  # Uses ts-node/esm for live TypeScript execution
```

## Database Schema

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    uuid UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    user_uuid UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);
```

### Decryption Window Table

```sql
CREATE TABLE IF NOT EXISTS decryptionWindow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    expiary TIMESTAMP NOT NULL,
    userId TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication Flow

1. **Register** → Get initial JWT tokens
2. **Login** → Get new JWT tokens
3. **Access Protected Routes** → Include `Authorization: Bearer <token>` header
4. **Refresh Token** → Get new access token using refresh token
5. **Logout** → Invalidate refresh token

All tokens are signed using RSA-2048 private key stored in `keys/private.pem`.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:

- `200` - Success
- `201` - Created (registration)
- `202` - Accepted (job queued)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Code Organization

- Controllers handle HTTP request/response
- Services contain business logic
- Middlewares handle cross-cutting concerns
- Utils contain reusable functions
- Routes define API endpoints

## Notes

- RSA keys are generated automatically on server startup
- Demo user (demoUser/demoPass) is created during setup
- Redis is optional - queue falls back to in-memory if unavailable
- All tokens expire after 10 minutes (configurable in JWT utils)
- Decryption keys expire after 10 minutes by default

## Future Enhancements

- [ ] Rate limiting
- [ ] Request validation schemas (joi/zod)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Metrics and monitoring
- [ ] Database migrations system
- [ ] Multi-tenancy support
- [ ] Audit logging
- [ ] Two-factor authentication

## License

MIT
