'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Building2, Send } from 'lucide-react';
import Button from '@/components/ui/Button';

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

const initialForm = {
  companyName: '',
  contactName: '',
  workEmail: '',
  phone: '',
  website: '',
  companySize: '',
  roles: '',
  hiringNeeds: '',
  message: '',
};

export default function HireTalentApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${apiBase}/api/hiring-partner-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || payload?.message || 'Unable to submit application');
      }
      setForm(initialForm);
      setStatus({ type: 'success', message: 'Application submitted. Our hiring partnerships team will contact you soon.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error?.message || 'Unable to submit application' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/hire-talent" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Hiring Partners
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-300">
              <Building2 className="h-4 w-4" />
              Become a Hiring Partner
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight">Tell us who you want to hire.</h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Share your company details, the roles you are hiring for, and the kind of candidates you need. We will match you with vetted talent from the EDVO network.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 px-4 py-3">Company hiring form for webinar, workshop, hackathon, data, analytics, and developer hiring needs.</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Admin can review, update status, contact, archive, or delete applications from the backend.</div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">Your request goes directly into the partner hiring inbox.</div>
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Company Hiring Request</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fill the form and we will reach out with the next steps.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Company name" value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} required />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Contact person" value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} required />
                <input type="email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Work email" value={form.workEmail} onChange={(event) => setForm((current) => ({ ...current, workEmail: event.target.value }))} required />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Phone number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Company website" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
                <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Company size" value={form.companySize} onChange={(event) => setForm((current) => ({ ...current, companySize: event.target.value }))} />
              </div>
              <textarea className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Roles you are hiring for" value={form.roles} onChange={(event) => setForm((current) => ({ ...current, roles: event.target.value }))} />
              <textarea className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Hiring needs and timeline" value={form.hiringNeeds} onChange={(event) => setForm((current) => ({ ...current, hiringNeeds: event.target.value }))} />
              <textarea className="min-h-[140px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Anything else you want us to know" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />

              {status.type !== 'idle' ? (
                <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                  {status.message}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="h-14 !rounded-2xl px-8" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Company Application'}
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
