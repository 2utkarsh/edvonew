'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPin, Radio, ShieldCheck, Trophy, UserRound, Users, Video, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EventItem, EventType, apiBase, fetchEventById } from '@/app/events/data';

const TYPE_LABELS: Record<EventType, string> = {
  webinar: 'Webinar',
  workshop: 'Workshop',
  hackathon: 'Hackathon',
};

const ICONS: Record<EventType, typeof Video> = {
  webinar: Video,
  workshop: Wrench,
  hackathon: Trophy,
};

const PARENT_LINKS: Record<EventType, string> = {
  webinar: '/events/webinars',
  workshop: '/events/workshops',
  hackathon: '/events/hackathons',
};

function readStoredToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('auth_token');
}

function readStoredUserRole(): 'student' | 'instructor' | 'admin' | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('auth_user');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.role || null;
  } catch {
    return null;
  }
}

export function EventActionPage({ eventId, type }: { eventId: string; type: EventType }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [registration, setRegistration] = useState<{ id: string; status: string } | null>(null);
  const [viewerRole, setViewerRole] = useState<'student' | 'instructor' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const token = readStoredToken();
        const detail = await fetchEventById(eventId, token);
        if (!active) return;
        setEvent(detail.event);
        setRegistration(detail.registration);
        setViewerRole(detail.viewerRole || readStoredUserRole());
      } catch (loadError: any) {
        if (active) setError(loadError?.message || 'Unable to load this event right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [eventId]);

  const token = useMemo(() => readStoredToken(), []);
  const effectiveRole = viewerRole || readStoredUserRole();
  const isStudent = effectiveRole === 'student';
  const canHostJoin = effectiveRole === 'instructor' || effectiveRole === 'admin';
  const isRegistered = Boolean(registration);

  async function sendEventAction(path: 'register' | 'join') {
    if (!token) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return null;
    }

    const response = await fetch(`${apiBase}/api/v1/events/${eventId}/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.message || payload?.message || `Failed to ${path} event`);
    }
    return payload?.data || null;
  }

  async function handleRegister(joinAfter = false) {
    try {
      setActionLoading(true);
      setError('');
      setMessage('');
      await sendEventAction('register');
      setRegistration({ id: 'registered', status: 'registered' });
      setMessage('Registration completed successfully.');
      if (joinAfter) {
        router.push(`${PARENT_LINKS[type]}/${eventId}/live`);
      }
    } catch (actionError: any) {
      setError(actionError?.message || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleJoinRedirect() {
    router.push(`${PARENT_LINKS[type]}/${eventId}/live`);
  }

  const primaryAction = useMemo(() => {
    if (!event) return null;
    if (event.status === 'Ended') {
      return { label: 'Event Ended', disabled: true, onClick: () => undefined };
    }
    if (event.status === 'Live') {
      if (canHostJoin) {
        return { label: 'Join as Host', disabled: false, onClick: handleJoinRedirect };
      }
      if (isStudent && !isRegistered) {
        return { label: 'Register & Join Live', disabled: false, onClick: () => handleRegister(true) };
      }
      return { label: 'Join Live Now', disabled: false, onClick: handleJoinRedirect };
    }
    if (isStudent && !isRegistered) {
      return { label: 'Register for Event', disabled: false, onClick: () => handleRegister(false) };
    }
    if (isRegistered) {
      return { label: 'Registered Successfully', disabled: true, onClick: () => undefined };
    }
    return {
      label: 'Login to Register',
      disabled: false,
      onClick: () => { window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`; },
    };
  }, [canHostJoin, event, isRegistered, isStudent, type]);

  const HeroIcon = ICONS[type];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href={PARENT_LINKS[type]} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to {TYPE_LABELS[type]}s
          </Link>
          {event?.status === 'Live' ? <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"><Radio className="h-3.5 w-3.5" />Live Now</span> : null}
        </div>

        {loading ? <div className="h-[520px] animate-pulse rounded-[2.5rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" /> : null}
        {error && !loading ? <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div> : null}

        {event && !loading ? (
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  <HeroIcon className="h-4 w-4" />
                  {TYPE_LABELS[type]}
                </div>
              </div>

              <div className="space-y-8 p-8 lg:p-10">
                <div>
                  <h1 className="text-3xl font-black text-slate-950 dark:text-white lg:text-5xl">{event.title}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{event.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><CalendarDays className="h-4 w-4" />Date</div><p className="text-sm font-bold text-slate-900 dark:text-white">{event.date || 'To be announced'}</p></div>
                  <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><Clock3 className="h-4 w-4" />Time</div><p className="text-sm font-bold text-slate-900 dark:text-white">{event.time || 'To be announced'}</p></div>
                  <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><MapPin className="h-4 w-4" />Access</div><p className="text-sm font-bold text-slate-900 dark:text-white">{event.location || 'Online'}</p></div>
                  <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"><Users className="h-4 w-4" />Participants</div><p className="text-sm font-bold text-slate-900 dark:text-white">{event.registeredCount || 0} / {event.maxParticipants || 'Open'}</p></div>
                </div>

                {event.requirements && event.requirements.length > 0 ? (
                  <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
                    <h2 className="mb-4 text-lg font-black text-slate-950 dark:text-white">Requirements</h2>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      {event.requirements.map((requirement) => (
                        <div key={requirement} className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" /><span>{requirement}</span></div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-300"><HeroIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{TYPE_LABELS[type]} Access</p><p className="text-lg font-black text-slate-950 dark:text-white">{event.status}</p></div>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-3"><span>Host</span><span className="font-bold text-slate-900 dark:text-white">{event.instructorName || 'EDVO Team'}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Category</span><span className="font-bold text-slate-900 dark:text-white">{event.category}</span></div>
                  {event.duration ? <div className="flex items-center justify-between gap-3"><span>Duration</span><span className="font-bold text-slate-900 dark:text-white">{event.duration}</span></div> : null}
                  {event.prizes ? <div className="flex items-center justify-between gap-3"><span>Prize Pool</span><span className="font-bold text-slate-900 dark:text-white">{event.prizes}</span></div> : null}
                  <div className="flex items-center justify-between gap-3"><span>Your Role</span><span className="font-bold capitalize text-slate-900 dark:text-white">{effectiveRole || 'guest'}</span></div>
                </div>

                {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</div> : null}

                <div className="mt-6 space-y-3">
                  <Button onClick={primaryAction?.onClick} disabled={primaryAction?.disabled || actionLoading} fullWidth className="!h-12 !rounded-2xl !text-xs !font-black !uppercase !tracking-[0.2em]">{actionLoading ? 'Please wait...' : primaryAction?.label || 'Open Event'}</Button>
                  <Button asChild variant="outline" fullWidth className="!h-12 !rounded-2xl !text-xs !font-black !uppercase !tracking-[0.2em]"><Link href={PARENT_LINKS[type]}>Back to Listings</Link></Button>
                  {event.status === 'Live' ? <Button asChild variant="ghost" fullWidth className="!h-12 !rounded-2xl !text-xs !font-black !uppercase !tracking-[0.2em]"><Link href={`${PARENT_LINKS[type]}/${eventId}/live`}>Open Live Redirect Page</Link></Button> : null}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-black text-slate-950 dark:text-white">Speakers & Mentors</h2>
                <div className="space-y-4">
                  {(event.speakers && event.speakers.length > 0 ? event.speakers : [{ name: event.instructorName || 'EDVO Team', role: 'Instructor', avatar: '/images/edvo-official-logo-v10.png' }]).map((speaker) => (
                    <div key={`${speaker.name}-${speaker.role}`} className="flex items-center gap-3 rounded-[1.5rem] border border-slate-100 p-4 dark:border-slate-800">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">{speaker.avatar ? <img src={speaker.avatar} alt={speaker.name} className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5 text-slate-400" />}</div>
                      <div><p className="font-bold text-slate-950 dark:text-white">{speaker.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{speaker.role || 'Instructor'}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export function EventLiveRedirectPage({ eventId, type }: { eventId: string; type: EventType }) {
  const router = useRouter();
  const [message, setMessage] = useState('Connecting you to the live session...');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function joinLive() {
      try {
        const token = readStoredToken();
        if (!token) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }

        const response = await fetch(`${apiBase}/api/v1/events/${eventId}/join`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error?.message || payload?.message || 'Unable to join live event');
        }

        const liveUrl = payload?.data?.liveUrl;
        if (!liveUrl) {
          throw new Error('Live room URL is not configured yet.');
        }

        if (!active) return;
        setMessage('Live room is ready. Redirecting now...');
        window.location.href = liveUrl;
      } catch (joinError: any) {
        if (!active) return;
        setError(joinError?.message || 'Unable to join live event right now.');
      }
    }

    joinLive();
    return () => {
      active = false;
    };
  }, [eventId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-rose-500/10 text-rose-500 dark:text-rose-300"><Radio className="h-7 w-7" /></div>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Joining Live {TYPE_LABELS[type]}</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{error || message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push(`${PARENT_LINKS[type]}/${eventId}`)} variant="outline" className="!h-12 !rounded-2xl !px-6 !text-xs !font-black !uppercase !tracking-[0.2em]">Back to Event Page</Button>
          <Button onClick={() => window.location.reload()} className="!h-12 !rounded-2xl !px-6 !text-xs !font-black !uppercase !tracking-[0.2em]">Retry Join</Button>
        </div>
        {error ? <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Students must register before joining. Teachers and admins can join directly once the event is live.</p> : <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"><ExternalLink className="h-4 w-4" />If nothing opens automatically, use retry.</p>}
      </div>
    </main>
  );
}
