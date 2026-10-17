'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { errorMessage, safeNext } from '@/lib/auth-client';

function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(errorMessage(json, 'Registration failed'));

      router.replace(safeNext(params.get('next')));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const label = 'block text-gray-700 text-sm font-bold mb-2';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
        {error && <p role="alert" className="mb-4 text-red-500 text-sm text-center">{error}</p>}

        <div className="mb-4"><label htmlFor="name" className={label}>Name</label>
          <input id="name" type="text" required autoComplete="name" className={input} value={formData.name} onChange={set('name')} /></div>
        <div className="mb-4"><label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} value={formData.email} onChange={set('email')} /></div>
        <div className="mb-6"><label htmlFor="pw" className={label}>Password</label>
          <input id="pw" type="password" required autoComplete="new-password" className={input} value={formData.password} onChange={set('password')} /></div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
