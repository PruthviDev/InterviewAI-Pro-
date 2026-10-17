// app/login/page.tsx
'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { errorMessage, safeNext } from '@/lib/auth-client';

function LoginForm() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ loginIdentifier, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(errorMessage(json, 'Login failed'));

      router.replace(safeNext(params.get('next')));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && <p role="alert" className="mb-4 text-red-500 text-sm text-center">{error}</p>}

        <div className="mb-4">
          <label htmlFor="id" className="block text-gray-700 text-sm font-bold mb-2">Username or Email</label>
          <input id="id" type="text" required autoComplete="username"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
        </div>

        <div className="mb-6">
          <label htmlFor="pw" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input id="pw" type="password" required autoComplete="current-password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60">
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
