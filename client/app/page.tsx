export const dynamic = 'force-dynamic';

async function getApiStatus(): Promise<'ok' | 'degraded' | 'unreachable'> {
  const base = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
    const body = (await res.json()) as { data?: { status?: 'ok' | 'degraded' } };
    return body.data?.status ?? 'degraded';
  } catch {
    return 'unreachable';
  }
}

export default async function HomePage() {
  const status = await getApiStatus();
  return (
    <main>
      <h1>Practice the interview before it counts.</h1>
      <p>
        An AI interviewer asks, listens, and adjusts the next question to how you answered. Sign-in
        and interview setup arrive in the next phases.
      </p>
      <div className="status" role="status">
        Backend: <strong>{status}</strong>
      </div>
    </main>
  );
}
