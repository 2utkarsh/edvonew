'use client';

import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

const InstructorsSection = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await fetch(`${apiBase}/api/instructors`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error?.message || payload?.message || 'Failed to load team members');
        }

        const items = Array.isArray(payload?.data) ? payload.data : [];
        if (!cancelled) {
          setMembers(items.map((item: Record<string, unknown>) => ({
            id: String(item.id || item.name || Math.random()),
            name: String(item.name || 'EDVO Mentor'),
            title: String(item.title || 'Mentor, EDVO'),
            bio: String(item.bio || 'Experienced mentor guiding learners with practical, industry-focused knowledge.'),
            image: String(item.image || '/images/edvo-official-logo-v10.png'),
          })));
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || 'Unable to load the team right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] md:text-base">Our Team</Badge>
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-slate-950 dark:text-white md:text-4xl">
          Learn from AI & Data Experts <span className="text-primary-600 dark:text-primary-300">with Real Industry Experience</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600 dark:text-slate-300">
          Industry experience meets the art of teaching, making complex concepts feel simple.
        </p>

        {loadError ? (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {loadError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20" />
              ))
            : members.map((instructor) => (
                <article
                  key={instructor.id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
                >
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="mb-5 h-40 w-40 rounded-2xl object-cover object-center shadow-lg shadow-primary-500/20"
                  />
                  <h3 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">{instructor.name}</h3>
                  <p className="mb-4 text-sm font-medium leading-6 text-primary-600 dark:text-primary-300">{instructor.title}</p>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{instructor.bio}</p>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;
