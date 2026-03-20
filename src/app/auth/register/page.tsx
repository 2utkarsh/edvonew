'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.message || 'Registration failed');

      setSubmitSuccess('Account created successfully. Redirecting to login...');
      setFormData({ fullName: '', mobile: '', email: '', password: '', confirmPassword: '', agreeToTerms: false });
      setTimeout(() => router.push('/auth/login'), 500);
    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitError(error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/50 flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-primary-950/50 px-12 border-r border-gray-100 dark:border-slate-800 transition-colors">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100/40 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent-100/40 dark:bg-accent-900/20 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <Image src="/images/edvo-official-logo-v10.png" alt="EDVO" width={180} height={58} className="h-12 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Enabling Careers</h2>
          <div className="my-8">
            <Image src="/images/student-illustration.png" alt="Student learning illustration" width={280} height={280} className="mx-auto drop-shadow-lg" priority />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Your search for the ultimate learning community ends here. Register with us to become a career-ready professional.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 dark:text-gray-400">Welcome to <span className="text-primary-600 dark:text-primary-400 font-semibold">EDVO</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Have an Account? <Link href="/auth/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Log in</Link></p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Register</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.fullName ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'}`} placeholder="Enter your full name" autoComplete="name" />
              {errors.fullName ? <p className="mt-1 text-xs text-red-500">{errors.fullName}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter Your Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 dark:border-slate-700 rounded-l-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-sm">+91</span>
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-r-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Enter mobile number" autoComplete="tel" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter Your Email Address <span className="text-red-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'}`} placeholder="you@example.com" autoComplete="email" />
              {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full px-4 py-2.5 pr-10 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'}`} placeholder="Password" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retype Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={`w-full px-4 py-2.5 pr-10 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 dark:border-slate-700'}`} placeholder="Retype password" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.confirmPassword ? <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p> : null}
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">By continuing, you are agreeing to EDVO&apos;s <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Use</Link> & <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link></span>
            </label>
            {errors.agreeToTerms ? <p className="text-xs text-red-500 -mt-2">{errors.agreeToTerms}</p> : null}

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</span> : 'Submit'}
            </button>

            {submitError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{submitError}</div> : null}
            {submitSuccess ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">{submitSuccess}</div> : null}
          </form>
        </motion.div>
      </div>
    </main>
  );
}
