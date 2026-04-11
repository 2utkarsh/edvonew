'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaUsers,
} from 'react-icons/fa';

const demoAccounts = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password789',
  },
];

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/participant-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('participantData', JSON.stringify(data.participant));
      localStorage.setItem('participantToken', data.token);
      setSuccess('Opening...');

      setTimeout(() => {
        router.push('/participant');
      }, 900);
    } catch (err) {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoAccount = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setSuccess('');
  };

  return (
    <main className="auth-shell">
      <div className="auth-grid">
        <motion.section
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="auth-badge">
            <FaUsers />
            Participant Access
          </span>
          <div>
            <h1 className="auth-title">Participant Sign In</h1>
            <p className="auth-subtitle">Enter your account details.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field" htmlFor="participant-email">
              <span className="auth-label">Email</span>
              <span className="auth-input-wrap">
                <FaUser className="auth-input-icon" />
                <input
                  id="participant-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="auth-input"
                  placeholder="Enter email"
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="auth-field" htmlFor="participant-password">
              <span className="auth-label">Password</span>
              <span className="auth-input-wrap">
                <FaLock className="auth-input-icon" />
                <input
                  id="participant-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="auth-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </span>
            </label>

            {error ? <div className="auth-message auth-message--error">{error}</div> : null}
            {success ? <div className="auth-message auth-message--success">{success}</div> : null}

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? <span className="button-spinner" /> : <FaArrowRight />}
              {isLoading ? 'Signing in' : 'Continue'}
            </button>
          </form>

          <div className="auth-link-row">
            <Link href="/" className="auth-secondary-link">
              Home
            </Link>
            <Link href="/dashboard" className="auth-secondary-link">
              Host sign in
            </Link>
          </div>
        </motion.section>

        <motion.aside
          className="auth-card auth-showcase"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="preview-media">
            <img
              src="/images/itech-innovation-foundation.jpeg"
              alt="Itech Innovation Foundation"
            />
          </div>

          <div className="preview-shell">
            <h2 className="preview-title">Available Accounts</h2>
          </div>

          <div className="auth-demo-grid">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className="auth-demo-button"
                onClick={() => useDemoAccount(account)}
              >
                <strong>{account.name}</strong>
                <span>{account.email}</span>
              </button>
            ))}
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
