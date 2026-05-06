'use client';

import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import { publicFetchJson } from '@/lib/backend-api';
import { stripHtml } from '@/lib/utils';

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

const FALLBACK_TEAM_MEMBERS: DirectoryItem[] = [
  {
    id: 'alok-pandey',
    name: 'Alok Pandey',
    title: 'Chief Mentor, EDVO | Mentor of Change, NITI Aayog | Startup & MSME Growth Catalyst',
    bio: 'Alok Pandey is an experienced entrepreneurship mentor and ecosystem builder with 17+ years of expertise in innovation, startup development, and MSME growth.',
    image: '/images/profiles/alok-pandey.png',
  },
  {
    id: 'akanksha-singh',
    name: 'Akanksha Singh',
    title: 'Mentor, EDVO | Marketing & Growth Architect | AI Marketing Strategist',
    bio: 'Akanksha Singh is a Marketing & Growth Architect with 10+ years of experience in performance marketing, brand strategy, and digital business growth.',
    image: '/images/profiles/akanksha-singh.jpeg',
  },
  {
    id: 'krishna-bhushan-mishra',
    name: 'Krishna Bhushan Mishra',
    title: 'Mentor, EDVO | Marketing Engineer | Performance & Growth Strategist',
    bio: 'Krishna Bhushan Mishra is a Marketing Engineer and Performance & Growth Strategist with 8+ years of experience in performance marketing, data-driven strategy, and growth systems.',
    image: '/images/profiles/krishna-bhushan-mishra.jpeg',
  },
];

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
  const [teamMembers, setTeamMembers] = useState<DirectoryItem[]>(FALLBACK_TEAM_MEMBERS);
  const [instructors, setInstructors] = useState<DirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Record<DirectoryMode, string>>({ team: '', instructors: '' });

  useEffect(() => {
    let cancelled = false;

    async function loadDirectory() {
      try {
        setIsLoading(true);
        setLoadError({ team: '', instructors: '' });

        const [teamResult, instructorResult] = await Promise.allSettled([
          publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/team'),
          publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/public-instructors'),
        ]);

        if (!cancelled) {
          if (teamResult.status === 'fulfilled') {
            const items = normalizeItems(Array.isArray(teamResult.value?.data) ? teamResult.value.data : []);
            setTeamMembers(items.length ? items : FALLBACK_TEAM_MEMBERS);
          } else {
            setTeamMembers(FALLBACK_TEAM_MEMBERS);
          }

          if (instructorResult.status === 'fulfilled') {
            setInstructors(normalizeItems(Array.isArray(instructorResult.value?.data) ? instructorResult.value.data : []));
          } else {
            setInstructors([]);
          }

          setLoadError({
            team: teamResult.status === 'rejected' ? teamResult.reason?.message || 'Unable to load team information right now.' : '',
            instructors: instructorResult.status === 'rejected' ? instructorResult.reason?.message || 'Unable to load instructor information right now.' : '',
          });
        }
      } catch (error: any) {
        if (!cancelled) {
          setTeamMembers(FALLBACK_TEAM_MEMBERS);
          setInstructors([]);
          setLoadError({
            team: error?.message || 'Unable to load team information right now.',
            instructors: error?.message || 'Unable to load instructor information right now.',
          });
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
  const activeError = loadError[mode];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-5 inline-flex px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] md:text-base">
            {content.badge}
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">{content.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-300">{content.description}</p>

          <div className="mx-auto mt-8 inline-flex rounded-full border border-white/10 bg-slate-900/80 p-1 shadow-lg">
            <button
              type="button"
              onClick={() => setMode('team')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'team' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}
            >
              Our Team
            </button>
            <button
              type="button"
              onClick={() => setMode('instructors')}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'instructors' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}
            >
              Instructors
            </button>
          </div>
        </div>

        {activeError ? (
          <div className="mb-8 rounded-3xl border border-red-900/40 bg-red-950/30 px-6 py-5 text-sm font-medium text-red-300">
            {activeError}
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
                <p className="text-sm leading-7 text-slate-300">{stripHtml(member.bio)}</p>
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
