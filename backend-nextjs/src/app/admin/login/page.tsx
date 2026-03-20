'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BackendAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@edvo.local');
  const [password, setPassword] = useState('Admin@123');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('backend_auth_token');
    if (savedToken) {
      router.replace('/admin');
      return;
    }
    setCheckingSession(false);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data && data.message) || 'Login failed');
      }

      const nextToken = data?.data?.token || data?.token || '';
      if (!nextToken) {
        throw new Error('Token was not returned by the backend');
      }

      localStorage.setItem('backend_auth_token', nextToken);
      setToken(nextToken);
      setMessage('Login successful. Redirecting to admin dashboard...');
      router.replace('/admin');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>Checking session...</main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Backend Admin Login</h1>
      <p style={{ marginBottom: 24 }}>
        Use the seeded admin account to get a JWT token for protected backend routes.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label style={{ display: 'grid', gap: 8 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span>Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 14,
            borderRadius: 8,
            border: 0,
            background: '#0f172a',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <p style={{ marginBottom: 12 }}><strong>Default admin credentials</strong></p>
        <p>Email: admin@edvo.local</p>
        <p>Password: Admin@123</p>
      </div>

      {message ? (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: '#e2e8f0' }}>
          {message}
        </div>
      ) : null}

      {token ? (
        <textarea
          readOnly
          value={token}
          style={{ marginTop: 16, width: '100%', minHeight: 160, padding: 12, borderRadius: 8 }}
        />
      ) : null}
    </main>
  );
}
