import { pool } from '../config/database';
import { redisClient } from '../config/redis';

export class AnalyticsService {
  async getOverviewMetrics() {
    const cacheKey = 'analytics:overview';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE last_severity >= 0.75) as critical,
        COUNT(*) FILTER (WHERE last_severity >= 0.5 AND last_severity < 0.75) as moderate,
        COUNT(*) FILTER (WHERE last_severity < 0.5) as good,
        COUNT(*) FILTER (WHERE questionnaire_status = FALSE) as pending_questionnaires,
        AVG(adherence_pct) as avg_adherence,
        COUNT(*) FILTER (WHERE last_severity >= 0.75 AND questionnaire_status = FALSE) as outreach_needed
      FROM anon_students
    `);

    const metrics = result.rows[0];
    
    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(metrics));
    
    return metrics;
  }

  async getWeeklyTrend(days: number = 7) {
    const result = await pool.query(`
      SELECT 
        date_trunc('day', timestamp) as day,
        COUNT(*) FILTER (WHERE severity >= 0.75) as critical,
        COUNT(*) FILTER (WHERE severity >= 0.5 AND severity < 0.75) as moderate,
        COUNT(*) FILTER (WHERE severity < 0.5) as good,
        AVG(severity * 100) as avg_score
      FROM student_severity_history
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY day
      ORDER BY day ASC
    `);

    return result.rows;
  }

  async getDepartmentStats() {
    const result = await pool.query(`
      SELECT 
        course as dept,
        COUNT(*) FILTER (WHERE last_severity >= 0.75) as critical,
        COUNT(*) FILTER (WHERE last_severity >= 0.5) as moderate,
        COUNT(*) as total
      FROM anon_students
      GROUP BY course
      ORDER BY critical DESC, moderate DESC
      LIMIT 10
    `);

    return result.rows;
  }

  async getMonthlyComparison(months: number = 6) {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date_trunc('month', timestamp), 'Mon') as month,
        COUNT(*) FILTER (WHERE severity >= 0.75) as critical,
        COUNT(*) FILTER (WHERE severity >= 0.5 AND severity < 0.75) as moderate,
        COUNT(DISTINCT anon_id) as interventions
      FROM student_severity_history
      WHERE timestamp >= NOW() - INTERVAL '${months} months'
      GROUP BY date_trunc('month', timestamp)
      ORDER BY date_trunc('month', timestamp) ASC
    `);

    return result.rows;
  }
}
