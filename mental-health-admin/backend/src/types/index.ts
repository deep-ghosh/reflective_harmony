export interface Student {
  id: string;
  anon_id: string;
  gender: 'M' | 'F' | 'NB';
  course: string;
  severity: number;
  adherence_pct: number;
  questionnaire_status: boolean;
  last_seen: Date;
}

export interface AuditLog {
  audit_id: string;
  admin_id: string;
  action: string;
  anon_id: string;
  timestamp: Date;
  revealed: boolean;
  ip_address: string;
}

export interface RevealRequest {
  request_id: string;
  admin_id: string;
  anon_id: string;
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  created_at: Date;
  approved_at?: Date;
  approved_by?: string;
}

export interface ContactInfo {
  anon_id: string;
  name: string;
  email: string;
  phone: string;
  accessed_at: Date;
  accessed_by: string;
  contact_reason: string;
}
