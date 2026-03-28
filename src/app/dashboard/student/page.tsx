'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  NotebookPen,
  PlayCircle,
  Sparkles,
  UserRound,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Footer, Navbar } from '@/components/layout';
import { authFetchJson, getStoredAuthUser } from '@/lib/backend-api';
import { cn } from '@/lib/utils';

type DashboardPayload = {
  success: boolean;
  data: {
    myCourses: Array<{
      enrollmentId: string;
      launchUrl?: string;
      course: {
        id: string;
        title: string;
        slug: string;
        category: string;
        thumbnail?: string;
        duration?: string;
        deliveryMode?: string;
      };
      progress: number;
      attendance: { overallPercentage: number };
      performance: { finalScore: number; streakDays?: number };
      participation: { discussionCount: number; questionsAsked: number; resourcesDownloaded: number };
      certificateEligible: boolean;
      nextLiveSession?: { title: string; startTime: string } | null;
      lastAccessedAt?: string;
    }>;
    stats: {
      totalEnrolled: number;
      averageProgress: number;
      averageAttendance: number;
      certificatesEarned: number;
      certificateReady: number;
      unreadNotifications: number;
      bestStreakDays: number;
      careerMatches: number;
    };
    upcomingLiveSessions: Array<{
      enrollmentId: string;
      courseTitle: string;
      title: string;
      startTime: string;
      launchUrl?: string;
    }>;
    careerOpportunities: Array<{
      id: string;
      courseTitle: string;
      courseSlug: string;
      title: string;
      company?: string;
      location?: string;
      type?: string;
      mode?: string;
      salary?: string;
      applicationUrl?: string;
      note?: string;
    }>;
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      isRead?: boolean;
      actionUrl?: string;
    }>;
    certificates: Array<{
      id: string;
      courseName?: string;
      certificateNumber: string;
      issuedAt: string;
      credentialUrl?: string;
    }>;
  };
};

type StudentUser = {
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  linkedinUrl?: string;
  avatar?: string;
  image?: string;
  profileImage?: string;
} | null;

type Section = 'dashboard' | 'courses' | 'events' | 'certificates' | 'career' | 'profile';

type ProfileForm = {
  fullName: string;
  gender: string;
  birthDate: string;
  email: string;
  whatsapp: string;
  country: string;
  pinCode: string;
  city: string;
  state: string;
  certificateName: string;
  linkedinUrl: string;
  bio: string;
};

const PROFILE_KEY = 'student_dashboard_profile_draft';
const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500/10';

export default function StudentDashboard() {
  const router = useRouter();
  const user = getStoredAuthUser() as StudentUser;
  const [dashboard, setDashboard] = useState<DashboardPayload['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<ProfileForm>(() => baseProfile(null));
  const [saved, setSaved] = useState('');
  const [section, setSection] = useState<Section>('dashboard');
  const displayName = profile.fullName || user?.name || 'Student';
  const displayEmail = profile.email || user?.email || 'student@edvo.in';
  const avatar = user?.avatar || user?.image || user?.profileImage || '';
  const currentCourse = dashboard?.myCourses.find((item) => item.progress < 100) || dashboard?.myCourses[0] || null;
  const stats = [
    { label: 'Courses', value: dashboard?.stats.totalEnrolled ?? 0 },
    { label: 'Progress', value: `${dashboard?.stats.averageProgress ?? 0}%` },
    { label: 'Attendance', value: `${dashboard?.stats.averageAttendance ?? 0}%` },
    { label: 'Certificates', value: dashboard?.stats.certificatesEarned ?? 0 },
  ];
  const featuredCourses = dashboard?.myCourses.slice(0, 4) || [];
  const dashboardCourseGridClass = featuredCourses.length > 1 ? 'xl:grid-cols-2' : 'grid-cols-1';
  const fullCourseGridClass = (dashboard?.myCourses.length || 0) > 1 ? 'xl:grid-cols-2' : 'grid-cols-1';
  const menu = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { key: 'courses' as const, label: 'Enrolled Courses', icon: BookOpen, badge: dashboard?.stats.totalEnrolled ?? 0 },
    { key: 'events' as const, label: 'Enrolled Events', icon: CalendarDays, badge: dashboard?.upcomingLiveSessions.length ?? 0 },
    { key: 'certificates' as const, label: 'My Certificates', icon: Award, badge: dashboard?.stats.certificatesEarned ?? 0 },
    { key: 'career' as const, label: 'Job Assistance', icon: Briefcase, badge: dashboard?.stats.careerMatches ?? 0 },
    { key: 'profile' as const, label: 'Profile Settings', icon: UserRound, badge: 0 },
  ];

  useEffect(() => {
    let active = true;
    authFetchJson<DashboardPayload>('/api/v1/dashboard/student')
      .then((payload) => {
        if (active) setDashboard(payload.data);
      })
      .catch((loadError: any) => {
        if (active) setError(loadError?.message || 'Unable to load dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSection(parseSection(new URLSearchParams(window.location.search).get('tab')));
    }
    setProfile({ ...baseProfile(getStoredAuthUser() as StudentUser), ...readDraft() });
  }, []);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const open = (next: Section) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const tab = toTab(next);
    if (tab) params.set('tab', tab);
    else params.delete('tab');
    const query = params.toString();
    setSection(next);
    router.replace(query ? `/dashboard/student?${query}` : '/dashboard/student', { scroll: false });
  };

  const change = (key: keyof ProfileForm, value: string) => setProfile((current) => ({ ...current, [key]: value }));

  const saveProfile = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    try {
      const raw = window.localStorage.getItem('auth_user');
      const parsed = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(
        'auth_user',
        JSON.stringify({ ...parsed, name: profile.fullName, email: profile.email, mobile: profile.whatsapp, linkedinUrl: profile.linkedinUrl })
      );
      window.dispatchEvent(new Event('auth-changed'));
    } catch {}
    setSaved('Profile draft saved on this device.');
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('auth_user');
      window.localStorage.removeItem(PROFILE_KEY);
      window.dispatchEvent(new Event('auth-changed'));
    }
    router.push('/');
    router.refresh();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/85">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr),360px]">
          <div className="bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_46%,#7c3aed_100%)] p-8 text-white sm:p-10 xl:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
              <Sparkles className="h-3.5 w-3.5" /> Student Overview
            </div>
            <h2 className="mt-5 text-3xl font-black sm:text-[2.6rem]">Hi, {displayName}!</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Stay on top of your enrolled courses, upcoming live classes, certificates, and profile details from one polished workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {currentCourse ? (
                <Button asChild variant="secondary" className="rounded-full border-0 bg-white px-5 text-slate-950 hover:bg-white/90">
                  <Link href={currentCourse.launchUrl || `/dashboard/student/learn/${currentCourse.enrollmentId}`}>Resume Course</Link>
                </Button>
              ) : null}
              <button
                type="button"
                onClick={() => open('profile')}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <NotebookPen className="h-4 w-4" /> Profile Settings
              </button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <HeroStrip label="Active Course" value={currentCourse?.course.title || 'Start your learning path'} />
              <HeroStrip label="Live Sessions" value={`${dashboard?.upcomingLiveSessions.length ?? 0} scheduled`} />
              <HeroStrip label="Certificates Ready" value={`${dashboard?.stats.certificateReady ?? 0} unlocked`} />
            </div>
          </div>
          <div className="flex h-full flex-col justify-between gap-6 bg-[linear-gradient(180deg,#faf5ff_0%,#eef2ff_100%)] p-6 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.98)_0%,rgba(15,23,42,0.98)_100%)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-lg dark:bg-slate-900/80 dark:text-slate-300">
                <div className="font-semibold text-slate-950 dark:text-white">{dashboard?.stats.bestStreakDays ?? 0} day streak</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Keep the momentum</div>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-right shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Unread Alerts</div>
                <div className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{dashboard?.stats.unreadNotifications ?? 0}</div>
              </div>
            </div>
            <Image src="/images/student-illustration.png" alt="Student illustration" width={320} height={260} className="mx-auto h-auto w-full max-w-[290px] object-contain" priority />
            <div className="grid grid-cols-2 gap-3">
              <SmallCard label="Avg Progress" value={dashboard?.stats.averageProgress ?? 0} suffix="%" />
              <SmallCard label="Attendance" value={dashboard?.stats.averageAttendance ?? 0} suffix="%" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/80">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.32fr),320px]">
        <div className="space-y-6">
          <Panel title="My Courses" description="Your enrolled programs with quick resume buttons.">
            {loading ? <Empty text="Loading courses..." /> : featuredCourses.length ? (
              <div className={cn('grid gap-5', dashboardCourseGridClass)}>
                {featuredCourses.map((course) => <CourseCard key={course.enrollmentId} course={course} compact />)}
              </div>
            ) : <Empty text="Your enrolled courses will appear here after payment and enrollment." />}
          </Panel>

          <Panel title="Career Matches" description="Job assistance and opportunities tied to your learning path.">
            {loading ? <Empty text="Loading opportunities..." /> : dashboard?.careerOpportunities.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {dashboard.careerOpportunities.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{item.courseTitle}</div>
                    <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                    {item.company ? <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.company}</div> : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {item.location ? <Pill>{item.location}</Pill> : null}
                      {item.salary ? <Pill tone="emerald">{item.salary}</Pill> : null}
                    </div>
                    {item.note ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.note}</p> : null}
                  </div>
                ))}
              </div>
            ) : <Empty text="Career opportunities will appear here when they are mapped to your course path." />}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Upcoming Live Classes" description="Scheduled sessions linked to your enrollments.">
            {loading ? <Empty text="Loading live sessions..." /> : dashboard?.upcomingLiveSessions.length ? (
              <div className="space-y-4">
                {dashboard.upcomingLiveSessions.slice(0, 3).map((item) => (
                  <div key={`${item.enrollmentId}-${item.title}`} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="font-semibold text-slate-950 dark:text-white">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.courseTitle}</div>
                    <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{formatDate(item.startTime)}</div>
                  </div>
                ))}
              </div>
            ) : <Empty text="No live sessions are scheduled right now." />}
          </Panel>
          <Panel title="Certificates" description="Your earned credentials and readiness status.">
            {loading ? <Empty text="Loading certificates..." /> : dashboard?.certificates.length ? (
              <div className="space-y-4">
                {dashboard.certificates.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="font-semibold text-slate-950 dark:text-white">{item.courseName || 'Course Certificate'}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.certificateNumber}</div>
                    <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">Issued {formatDate(item.issuedAt)}</div>
                  </div>
                ))}
              </div>
            ) : <Empty text="Certificates will appear here after course completion." />}
          </Panel>

          <Panel title="Notifications" description="Recent updates you should keep an eye on.">
            {loading ? <Empty text="Loading notifications..." /> : dashboard?.notifications.length ? (
              <div className="space-y-4">
                {dashboard.notifications.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-950 dark:text-white">{item.title}</div>
                        <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.message}</div>
                      </div>
                      {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" /> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : <Empty text="No notifications yet." />}
          </Panel>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/85">
      <div className="grid gap-0 lg:grid-cols-[280px,minmax(0,1fr)]">
        <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.98)_0%,rgba(17,24,39,0.98)_100%)] lg:border-b-0 lg:border-r">
          <div className="rounded-[1.7rem] bg-[linear-gradient(145deg,#4f46e5_0%,#7c3aed_58%,#f59e0b_140%)] p-6 text-white shadow-xl shadow-indigo-900/10">
            <div className="flex items-center justify-between gap-4">
              {avatar ? <img src={avatar} alt={displayName} className="h-16 w-16 rounded-full border-2 border-white/30 object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-xl font-black uppercase">{initials(displayName)}</div>}
              <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Edit</div>
            </div>
            <h2 className="mt-5 text-2xl font-black">{displayName}</h2>
            <p className="mt-2 text-sm text-white/80">Keep your certificate and contact details accurate for courses, events, and placements.</p>
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div>Email: {profile.email || 'Not added'}</div>
            <div>WhatsApp: {profile.whatsapp || 'Not added'}</div>
            <div>Location: {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Not added'}</div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Basic Information</div>
              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Student Profile Settings</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">This form currently saves locally on this device so the UI is fully usable even before a profile update API is connected.</p>
            </div>
            <Button type="button" onClick={saveProfile} className="rounded-full px-5">Save Draft</Button>
          </div>

          {saved ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{saved}</div> : null}

          <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); saveProfile(); }}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" required><input value={profile.fullName} onChange={(e) => change('fullName', e.target.value)} className={inputClass} placeholder="Enter your full name" /></Field>
              <Field label="Birth Date"><input type="date" value={profile.birthDate} onChange={(e) => change('birthDate', e.target.value)} className={inputClass} /></Field>
              <Field label="Gender"><select value={profile.gender} onChange={(e) => change('gender', e.target.value)} className={inputClass}><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></Field>
              <Field label="WhatsApp Phone Number"><input value={profile.whatsapp} onChange={(e) => change('whatsapp', e.target.value)} className={inputClass} placeholder="WhatsApp Number" /></Field>
              <Field label="Email" required><input type="email" value={profile.email} onChange={(e) => change('email', e.target.value)} className={inputClass} placeholder="you@example.com" /></Field>
              <Field label="Country"><input value={profile.country} onChange={(e) => change('country', e.target.value)} className={inputClass} placeholder="India" /></Field>
              <Field label="City"><input value={profile.city} onChange={(e) => change('city', e.target.value)} className={inputClass} placeholder="City" /></Field>
              <Field label="State"><input value={profile.state} onChange={(e) => change('state', e.target.value)} className={inputClass} placeholder="State" /></Field>
              <Field label="Pin Code / Zip Code"><input value={profile.pinCode} onChange={(e) => change('pinCode', e.target.value)} className={inputClass} placeholder="Pin Code / Zip Code" /></Field>
              <div className="md:col-span-2"><Field label="Your Name on Certificate" required><input value={profile.certificateName} onChange={(e) => change('certificateName', e.target.value)} className={inputClass} placeholder="This name will be displayed on the certificate" /></Field><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Once certificate records are issued, changing this usually requires admin support.</p></div>
              <div className="md:col-span-2"><Field label="LinkedIn Profile URL"><input value={profile.linkedinUrl} onChange={(e) => change('linkedinUrl', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/your-profile" /></Field></div>
              <div className="md:col-span-2"><Field label="About"><textarea value={profile.bio} onChange={(e) => change('bio', e.target.value)} className={`${inputClass} min-h-[140px] resize-y`} placeholder="Add a short student bio, learning goals, or placement preferences" /></Field></div>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.16),_transparent_30%),linear-gradient(180deg,#fffef9_0%,#f8fafc_52%,#f7fafc_100%)] pt-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)]">
          <div className="mx-auto max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700 shadow-sm dark:border-indigo-400/20 dark:bg-slate-900/70 dark:text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Student Dashboard</div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">Learning, live classes, and progress in one place.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">A cleaner student workspace with stronger alignment, better card sizing, and a clearer overview of courses, certificates, job assistance, and profile settings.</p>
              </div>
              {currentCourse ? <Button asChild className="rounded-full px-6"><Link href={currentCourse.launchUrl || `/dashboard/student/learn/${currentCourse.enrollmentId}`}><PlayCircle className="h-4 w-4" /> Continue Learning</Link></Button> : null}
            </div>
            {error ? <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">{error} <Link href="/auth/login" className="font-semibold underline underline-offset-2">Log in again</Link></div> : null}

            <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
              <aside className="xl:sticky xl:top-28 xl:self-start">
                <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/80">
                  <div className="relative overflow-hidden rounded-[1.7rem] bg-[linear-gradient(145deg,#4f46e5_0%,#7c3aed_56%,#f59e0b_140%)] p-6 text-white">
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      {avatar ? <img src={avatar} alt={displayName} className="h-16 w-16 rounded-full border-2 border-white/30 object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/15 text-xl font-black uppercase">{initials(displayName)}</div>}
                      <button type="button" onClick={() => open('profile')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"><NotebookPen className="h-4.5 w-4.5" /></button>
                    </div>
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Student Access</p>
                      <h2 className="mt-2 text-2xl font-black leading-tight">{displayName}</h2>
                      <p className="mt-2 text-sm text-white/80">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {menu.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => open(item.key)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                          section === item.key
                            ? 'border-indigo-600 bg-[linear-gradient(135deg,#312e81_0%,#4338ca_100%)] text-white shadow-lg shadow-indigo-900/20'
                            : 'border-amber-100 bg-[linear-gradient(180deg,#fffef6_0%,#fff7db_100%)] text-slate-700 hover:border-amber-200 hover:text-slate-950 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.94)_0%,rgba(15,23,42,0.94)_100%)] dark:text-slate-200 dark:hover:border-indigo-400/30 dark:hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-3"><span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', section === item.key ? 'bg-white/15' : 'bg-white shadow-sm dark:bg-white/5')}><item.icon className="h-4.5 w-4.5" /></span><span className="text-sm font-semibold">{item.label}</span></span>
                        {item.badge > 0 ? <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', section === item.key ? 'bg-white/15 text-white' : 'bg-slate-900 text-white dark:bg-indigo-500/20 dark:text-indigo-100')}>{item.badge}</span> : null}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <SmallCard label="Courses" value={dashboard?.stats.totalEnrolled ?? 0} />
                    <SmallCard label="Ready Certs" value={dashboard?.stats.certificateReady ?? 0} />
                  </div>

                  <button type="button" onClick={logout} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"><LogOut className="h-4 w-4" /> Log Out</button>
                </Card>
              </aside>

              <div className="min-w-0">
                {section === 'dashboard' ? renderDashboard() : null}
                {section === 'courses' ? <Panel title="Enrolled Courses" description="Everything you are currently learning.">{loading ? <Empty text="Loading courses..." /> : dashboard?.myCourses.length ? <div className={cn('grid gap-5', fullCourseGridClass)}>{dashboard.myCourses.map((course) => <CourseCard key={course.enrollmentId} course={course} />)}</div> : <Empty text="No enrolled courses found yet." />}</Panel> : null}
                {section === 'events' ? <Panel title="Enrolled Events" description="Upcoming live classes and event-style sessions.">{loading ? <Empty text="Loading live sessions..." /> : dashboard?.upcomingLiveSessions.length ? <div className="space-y-4">{dashboard.upcomingLiveSessions.map((item) => <div key={`${item.enrollmentId}-${item.title}`} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70"><div className="font-semibold text-slate-950 dark:text-white">{item.title}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.courseTitle}</div><div className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">{formatDate(item.startTime)}</div></div>)}</div> : <Empty text="You do not have any upcoming live events right now." />}</Panel> : null}
                {section === 'certificates' ? <Panel title="My Certificates" description="Credentials generated from your completed courses.">{loading ? <Empty text="Loading certificates..." /> : dashboard?.certificates.length ? <div className="grid gap-5 md:grid-cols-2">{dashboard.certificates.map((item) => <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/70"><div className="font-semibold text-slate-950 dark:text-white">{item.courseName || 'Course Certificate'}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.certificateNumber}</div><div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">Issued {formatDate(item.issuedAt)}</div>{item.credentialUrl ? <a href={item.credentialUrl} target={isExternal(item.credentialUrl) ? '_blank' : undefined} rel={isExternal(item.credentialUrl) ? 'noreferrer' : undefined} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">Open Credential <ExternalLink className="h-4 w-4" /></a> : null}</div>)}</div> : <Empty text="You have not earned any certificates yet." />}</Panel> : null}
                {section === 'career' ? <Panel title="Job Assistance Form" description="Explore the job opportunities your admin has mapped to your enrolled courses.">{loading ? <Empty text="Loading opportunities..." /> : dashboard?.careerOpportunities.length ? <div className="grid gap-5 md:grid-cols-2">{dashboard.careerOpportunities.map((item) => <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/70"><div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{item.courseTitle}</div><h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>{item.company ? <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.company}</div> : null}<div className="mt-4 flex flex-wrap gap-2 text-xs">{item.location ? <Pill>{item.location}</Pill> : null}{item.salary ? <Pill tone="emerald">{item.salary}</Pill> : null}</div>{item.note ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.note}</p> : null}</div>)}</div> : <Empty text="Career opportunities will appear here after your learning path is matched to open roles." />}</Panel> : null}
                {section === 'profile' ? renderProfile() : null}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/85"><h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p><div className="mt-6">{children}</div></Card>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-sm leading-7 text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">{text}</div>;
}

function SmallCard({ label, value, suffix = '' }: { label: string; value: number | string; suffix?: string }) {
  return <div className="rounded-[1.35rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div><div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}{suffix}</div></div>;
}

function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'emerald' }) {
  const style = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{children}</span>;
}

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <label className="block"><div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}{required ? <span className="text-rose-500"> *</span> : null}</div>{children}</label>;
}

function CourseCard({ course, compact = false }: { course: DashboardPayload['data']['myCourses'][number]; compact?: boolean }) {
  const participation = Number(course.participation.discussionCount || 0) + Number(course.participation.questionsAsked || 0) + Number(course.participation.resourcesDownloaded || 0);
  const courseHref = course.launchUrl || `/dashboard/student/learn/${course.enrollmentId}`;

  if (compact) {
    return (
      <Card className="overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white p-0 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/90">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#1d4ed8_0%,#4f46e5_45%,#f59e0b_140%)] p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">{course.course.category}</div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Progress</div>
              <div className="mt-1 text-lg font-black">{course.progress}%</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-[0.2em] text-white/75">EDVO Learning</div>
            <div className="mt-2 text-2xl font-black leading-tight">{course.course.title}</div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            <Pill tone="slate">{delivery(course.course.deliveryMode)}</Pill>
            <Pill tone="slate">{course.course.duration || 'Flexible duration'}</Pill>
            {course.certificateEligible ? <Pill tone="emerald">Certificate Ready</Pill> : null}
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#6366f1_52%,#f59e0b_100%)]" style={{ width: `${Math.max(0, Math.min(100, Number(course.progress || 0)))}%` }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <CompactMetric label="Attendance" value={`${course.attendance.overallPercentage}%`} />
            <CompactMetric label="Score" value={`${course.performance.finalScore}%`} />
            <CompactMetric label="Participation" value={`${participation}`} />
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{course.nextLiveSession ? 'Next live class' : course.lastAccessedAt ? 'Last opened' : 'Learning flow'}</div>
              <div className="mt-1 text-sm font-semibold leading-6 text-slate-900 dark:text-white">{course.nextLiveSession?.title || (course.lastAccessedAt ? formatShortDate(course.lastAccessedAt) : 'Resume your recorded lessons')}</div>
              {course.nextLiveSession?.startTime ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatShortDate(course.nextLiveSession.startTime)}</div> : null}
            </div>
            <Button asChild className="shrink-0 rounded-full px-4">
              <Link href={courseHref}><span className="inline-flex items-center gap-1.5">Open <ChevronRight className="h-4 w-4" /></span></Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white p-0 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/90">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#1d4ed8_0%,#4f46e5_45%,#f59e0b_140%)] p-5 text-white h-48">
        <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">{course.course.category}</div>
        <div className="absolute bottom-5 left-5 right-5"><div className="text-xs uppercase tracking-[0.2em] text-white/75">EDVO Learning</div><div className="mt-2 text-xl font-black leading-tight">{course.course.title}</div></div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4"><div><div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">{delivery(course.course.deliveryMode)}</div><p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{course.course.duration || 'Flexible duration'}</p></div><div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-900"><div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Progress</div><div className="mt-1 text-lg font-black text-slate-950 dark:text-white">{course.progress}%</div></div></div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#6366f1_52%,#f59e0b_100%)]" style={{ width: `${Math.max(0, Math.min(100, Number(course.progress || 0)))}%` }} /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><SmallCard label="Attendance" value={course.attendance.overallPercentage} suffix="%" /><SmallCard label="Performance" value={course.performance.finalScore} suffix="%" /><SmallCard label="Participation" value={participation} /></div>
      </div>
    </Card>
  );
}

function HeroStrip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.35rem] border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm"><div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">{label}</div><div className="mt-2 text-sm font-semibold leading-6 text-white">{value}</div></div>;
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.15rem] border border-slate-200/70 bg-slate-50/90 px-3 py-3 dark:border-white/10 dark:bg-slate-900/70"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div><div className="mt-1 text-base font-black text-slate-950 dark:text-white">{value}</div></div>;
}
function parseSection(tab: string | null): Section { if (tab === 'courses') return 'courses'; if (tab === 'events') return 'events'; if (tab === 'certificates') return 'certificates'; if (tab === 'job-assistance' || tab === 'career') return 'career'; if (tab === 'settings' || tab === 'profile') return 'profile'; return 'dashboard'; }
function toTab(section: Section) { return section === 'dashboard' ? '' : section === 'career' ? 'job-assistance' : section === 'profile' ? 'settings' : section; }
function baseProfile(user: StudentUser): ProfileForm { const name = user?.name || ''; return { fullName: name, gender: user?.gender || '', birthDate: user?.birthDate || '', email: user?.email || '', whatsapp: user?.mobile || user?.phone || '', country: user?.country || 'India', pinCode: user?.pinCode || '', city: user?.city || '', state: user?.state || '', certificateName: name, linkedinUrl: user?.linkedinUrl || '', bio: '' }; }
function readDraft(): Partial<ProfileForm> { if (typeof window === 'undefined') return {}; try { const raw = window.localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
function formatShortDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date); }
function delivery(value?: string) { return (value || '').toLowerCase() === 'live' ? 'Live' : (value || '').toLowerCase() === 'hybrid' ? 'Hybrid' : 'Recorded'; }
function initials(value: string) { const parts = value.split(' ').filter(Boolean).slice(0, 2); return parts.length ? parts.map((item) => item[0]).join('') : 'S'; }
function isExternal(value: string) { return /^https?:\/\//.test(String(value || '')); }












