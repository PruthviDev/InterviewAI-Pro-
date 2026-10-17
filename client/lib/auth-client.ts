// src/lib/auth-client.ts
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : '/dashboard';
}

export function errorMessage(json: any, fallback: string): string {
  const fields = json?.error?.details?.fieldErrors;
  const first = fields && (Object.values(fields).flat()[0] as string | undefined);
  return first ?? json?.error?.message ?? (typeof json?.error === 'string' ? json.error : null) ?? fallback;
}