-- Create schemas and tables for the mental health admin system

CREATE TABLE IF NOT EXISTS anon_students (
  id UUID PRIMARY KEY,
  anon_id VARCHAR(50) UNIQUE NOT NULL,
  gender CHAR(2),
  course VARCHAR(50),
  last_severity DECIMAL(3, 2),
  adherence_pct INTEGER,
  questionnaire_status BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_severity_history (
  id UUID PRIMARY KEY,
  anon_id VARCHAR(50) NOT NULL REFERENCES anon_students(anon_id),
  severity DECIMAL(3, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id UUID PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  action VARCHAR(255),
  anon_id VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  status VARCHAR(50),
  revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reveal_requests (
  request_id UUID PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  anon_id VARCHAR(50) NOT NULL,
  justification TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR(50),
  expires_at TIMESTAMP,
  FOREIGN KEY (anon_id) REFERENCES anon_students(anon_id)
);

CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY,
  anon_id VARCHAR(50) NOT NULL REFERENCES anon_students(anon_id),
  name VARCHAR(255) ENCRYPTED,
  email VARCHAR(255) ENCRYPTED,
  phone VARCHAR(20) ENCRYPTED,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessed_by VARCHAR(50),
  contact_reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anon_id ON anon_students(anon_id);
CREATE INDEX idx_severity ON anon_students(last_severity);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_reveal_status ON reveal_requests(status);
