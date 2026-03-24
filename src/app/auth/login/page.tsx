'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { buildApiUrl } from '@/lib/backend-api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await fetch(buildApiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json().catch(() => ({}));
      const payload = (data as any)?.data || data;
      if (!res.ok) throw new Error(payload?.message || (data as any)?.message || 'Login failed');

      const token = payload?.token;
      if (!token) throw new Error('Login token was not returned by the backend');

      localStorage.setItem('auth_token', token);
      if (payload?.user) {
        localStorage.setItem('auth_user', JSON.stringify(payload.user));
      }
      window.dispatchEvent(new Event('auth-changed'));

      setSubmitSuccess(payload?.message || 'Login successful. Redirecting...');
      setTimeout(() => {
        router.replace('/');
        router.refresh();
      }, 300);
    } catch (error: any) {
      console.error('Login error:', error);
      setSubmitError(error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/50 flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-primary-950/50 px-12 border-r border-gray-100 dark:border-slate-800 transition-colors">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100/40 dark:bg-primary-900/20 rounded-full blur-3xl transition-colors" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-indigo-100/40 dark:bg-indigo-950/20 rounded-full blur-3xl transition-colors" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/images/edvo-official-logo-v10.png"
              alt="EDVO"
              width={180}
              height={58}
              className="h-12 w-auto"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Enabling Careers</h2>

          <div className="my-8">
            <Image
              src="/images/student-illustration.png"
              alt="Student learning illustration"
              width={280}
              height={280}
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Upscaling your career was never this easy. To stay updated with us, please log in with your information.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 dark:text-gray-400">
              Welcome to <span className="text-primary-600 dark:text-primary-400 font-semibold">EDVO</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No Account?{' '}
              <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter your Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            {submitError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{submitError}</div> : null}
            {submitSuccess ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{submitSuccess}</div> : null}
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-gray-700 dark:text-gray-300 font-semibold hover:underline">Terms and Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-700 dark:text-gray-300 font-semibold hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
