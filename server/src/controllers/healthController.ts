import type { RequestHandler } from 'express';
import { runHealthChecks, type HealthChecks } from '../services/healthService.js';

export function healthController(checks: HealthChecks): RequestHandler {
  return async (_req, res) => {
    const report = await runHealthChecks(checks);
    res.status(report.status === 'ok' ? 200 : 503).json({ success: true, data: report });
  };
}
