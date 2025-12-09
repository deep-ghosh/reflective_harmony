import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log audit information
    const auditLog = {
      admin_id: (req as any).user?.id,
      action: req.method + ' ' + req.path,
      timestamp: new Date(),
      ip_address: req.ip,
      status: res.statusCode
    };

    // Store in audit log table
    pool.query(
      'INSERT INTO audit_logs (admin_id, action, timestamp, ip_address, status) VALUES ($1, $2, $3, $4, $5)',
      [auditLog.admin_id, auditLog.action, auditLog.timestamp, auditLog.ip_address, auditLog.status]
    ).catch((err: Error) => console.error('Audit logging failed:', err));

    return originalSend.call(this, data);
  };

  next();
};
