import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function requireUser(): Promise<SessionUser> {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) redirect('/login');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) redirect('/login');

  const json = await res.json();
  return json.data as SessionUser;
}
