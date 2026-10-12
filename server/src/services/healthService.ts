export type HealthCheck = () => Promise<void>;

export interface HealthChecks {
  database: HealthCheck;
  redis: HealthCheck;
}

export type HealthStatus = 'ok' | 'degraded';

export interface HealthReport {
  status: HealthStatus;
  checks: Record<keyof HealthChecks, 'up' | 'down'>;
}

export async function runHealthChecks(checks: HealthChecks): Promise<HealthReport> {
  const entries = await Promise.all(
    (Object.entries(checks) as [keyof HealthChecks, HealthCheck][]).map(async ([name, check]) => {
      try {
        await check();
        return [name, 'up'] as const;
      } catch {
        return [name, 'down'] as const;
      }
    }),
  );
  const result = Object.fromEntries(entries) as HealthReport['checks'];
  const allUp = Object.values(result).every((s) => s === 'up');
  return { status: allUp ? 'ok' : 'degraded', checks: result };
}
