'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { publicFetchJson } from '@/lib/backend-api';
import Badge from '@/components/ui/Badge';

type DirectoryItem = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
};

type PublicListResponse<T> = {
  success: boolean;
  data: T[];
};

type DirectoryMode = 'team' | 'instructors';

const directoryCopy: Record<DirectoryMode, { badge: string; title: string; description: string; empty: string }> = {
  team: {
    badge: 'Our Team',
    title: 'Meet the EDVO Team',
    description: 'Meet the EDVO team guiding learners with practical, industry-focused experience.',
    empty: 'No team members are available right now.',
  },
  instructors: {
    badge: 'Instructors',
    title: 'Meet the EDVO Instructors',
    description: 'Explore the instructors leading learners with practical, industry-focused teaching and real-world expertise.',
    empty: 'No instructors are available right now.',
  },
};

function normalizeItems(items: Record<string, unknown>[]) {
  return items.map((item, index) => ({
    id: String(item.id || `member-${index}`),
    name: String(item.name || 'EDVO Member'),
    title: String(item.title || 'Mentor, EDVO'),
    bio: String(item.bio || 'Experienced mentor guiding learners with practical, industry-focused knowledge.'),
    image: String(item.image || '/images/edvo-official-logo-v10.png'),
  }));
}

export default function OurTeamClient() {
  const [mode, setMode] = useState<DirectoryMode>('team');
  const [teamMembers, setTeamMembers] = useState<DirectoryItem[]>([]);
  const [instructors, setInstructors] = useState<DirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDirectory() {
      try {
        setIsLoading(true);
        setLoadError('');

        const [teamPayload, instructorPayload] = await Promise.all([
          publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/team'),
          publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/instructors'),
        ]);

        if (!cancelled) {
          setTeamMembers(normalizeItems(Array.isArray(teamPayload?.data) ? teamPayload.data : []));
          setInstructors(normalizeItems(Array.isArray(instructorPayload?.data) ? instructorPayload.data : []));
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || 'Unable to load team information right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDirectory();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = directoryCopy[mode];
  const members = useMemo(() => (mode === 'team' ? teamMembers : instructors), [instructors, mode, teamMembers]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-5 inline-flex px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] md:text-base">
            {content.badge}
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">{content.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-300">{content.description}</p>

          <div className="mx-auto mt-8 max-w-xs text-left">
            <label htmlFor="directory-view" className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
              Directory View
            </label>
            <div className="relative">
              <select
                id="directory-view"
                value={mode}
                onChange={(event) => setMode(event.target.value as DirectoryMode)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-lg outline-none transition focus:border-primary-400"
              >
                <option value="team">Our Team</option>
                <option value="instructors">Instructors</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="mb-8 rounded-3xl border border-red-900/40 bg-red-950/30 px-6 py-5 text-sm font-medium text-red-300">
            {loadError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 p-6" />
            ))}
          </div>
        ) : members.length ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {members.map((member) => (
              <article key={member.id} className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                <img src={member.image} alt={member.name} className="mb-5 h-40 w-40 rounded-2xl object-cover object-center shadow-lg shadow-primary-500/20" />
                <h2 className="mb-2 text-2xl font-bold text-white">{member.name}</h2>
                <p className="mb-4 text-sm font-medium leading-6 text-sky-300">{member.title}</p>
                <p className="text-sm leading-7 text-slate-300">{member.bio}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-10 text-center text-slate-300">
            {content.empty}
          </div>
        )}
      </div>
    </main>
  );
}
