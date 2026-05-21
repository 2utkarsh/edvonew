'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaShieldAlt } from 'react-icons/fa';
import EnhancedDashboard from '../../components/EnhancedDashboard';
import { apiUrl, withBasePath } from '@/lib/url';

const hostNotes = ['Live room control', 'Meeting scheduling', 'Recording library'];

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('dashboardAccess') === 'granted') {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Session storage unavailable:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/verify-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid password');
        return;
      }

      try {
        sessionStorage.setItem('dashboardAccess', 'granted');
      } catch (err) {
        console.error('Unable to persist dashboard access:', err);
      }

      setIsAuthenticated(true);
    } catch (err) {
      setError('Unable to verify the password right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    try {
      sessionStorage.removeItem('dashboardAccess');
    } catch (err) {
      console.error('Unable to clear dashboard session:', err);
    }
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isHydrated) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="auth-badge">Preparing</span>
          <h1 className="auth-title">EDVO Host Sign In</h1>
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return <EnhancedDashboard variant="admin" onExit={handleExit} />;
  }

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
            <FaShieldAlt />
            Host Access
          </span>
          <div>
            <h1 className="auth-title">EDVO Dashboard</h1>
            <p className="auth-subtitle">Enter the host password to open your meetings workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field" htmlFor="dashboard-password">
              <span className="auth-label">Password</span>
              <span className="auth-input-wrap">
                <FaLock className="auth-input-icon" />
                <input
                  id="dashboard-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="auth-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>

            {error ? <div className="auth-message auth-message--error">{error}</div> : null}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="button-spinner" /> : <FaArrowRight />}
              {isSubmitting ? 'Verifying' : 'Continue'}
            </button>
          </form>

          <div className="auth-link-row">
            <Link href="/" className="auth-secondary-link">
              Back to home
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
              src={withBasePath('/logo/edvo-official-logo-v10.webp')}
              alt="EDVO"
            />
          </div>

          <div className="preview-shell">
            <p className="preview-kicker">Desktop Workspace</p>
            <h2 className="preview-title">Meetings, rooms, and recordings</h2>
          </div>

          <div className="preview-list preview-list--plain">
            {hostNotes.map((item) => (
              <div key={item} className="preview-line">
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
