'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Eye,
  ExternalLink,
  LogOut,
  MessageSquare,
  Link2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authFetchJson, getStoredAuthToken, getStoredAuthUser } from '@/lib/backend-api';
import { buildLiveClassroomPath } from '@/lib/live-classroom';

type InstructorDashboardPayload = {
  data?: {
    user?: {
      name?: string;
      email?: string;
      photo?: string;
      avatar?: string;
      headline?: string;
    };
    courses?: Array<{
      _id?: string;
      title?: string;
      status?: string;
      deliveryMode?: string;
      studentsEnrolled?: number;
      rating?: number;
      price?: number;
      updatedAt?: string;
      nextLiveSession?: {
        _id?: string;
        title?: string;
        description?: string;
        hostName?: string;
        roomName?: string;
        startTime?: string;
        endTime?: string;
        duration?: string;
        moduleTitle?: string;
        subjectTitle?: string;
        timezone?: string;
        meetingUrl?: string;
        recordingUrl?: string;
        attendanceRequired?: boolean;
        status?: string;
        source?: string;
      } | null;
    }>;
    liveModule?: {
      courseId?: string;
      courseTitle?: string;
      courseSlug?: string;
      _id?: string;
      title?: string;
      description?: string;
      hostName?: string;
      roomName?: string;
      startTime?: string;
      endTime?: string;
      duration?: string;
      moduleTitle?: string;
      subjectTitle?: string;
      timezone?: string;
      meetingUrl?: string;
      recordingUrl?: string;
      attendanceRequired?: boolean;
      status?: string;
      source?: string;
    } | null;
    stats?: {
      totalCourses?: number;
      totalStudents?: number;
      totalRevenue?: number;
      averageRating?: string | number;
    };
    recentEnrollments?: Array<{
      _id?: string;
      userId?: {
        name?: string;
        email?: string;
      };
      createdAt?: string;
    }>;
  };
};

type AuthUser = {
  name?: string;
  role?: string;
  photo?: string;
  avatar?: string;
};

type InstructorCourse = {
  _id?: string;
  title?: string;
  status?: string;
  deliveryMode?: string;
  studentsEnrolled?: number;
  rating?: number;
  price?: number;
  updatedAt?: string;
  nextLiveSession?: {
    _id?: string;
    title?: string;
    description?: string;
    hostName?: string;
    roomName?: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
    moduleTitle?: string;
    subjectTitle?: string;
    timezone?: string;
    meetingUrl?: string;
    recordingUrl?: string;
    attendanceRequired?: boolean;
    status?: string;
    source?: string;
  } | null;
};

const emptyInstructorDashboard: NonNullable<InstructorDashboardPayload['data']> = {
  courses: [],
  stats: {
    totalCourses: 0,
    totalStudents: 0,
    averageRating: '0.0',
  },
  recentEnrollments: [],
};

function formatCurrency(value: number) {
  return `Rs${Number(value || 0).toLocaleString()}`;
}

function formatDate(value?: string) {
  if (!value) return 'Recently updated';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently updated';
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value?: string) {
  if (!value) return 'Timing not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Timing not set';
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getCourseSessionLink(course: InstructorCourse) {
  const session = course.nextLiveSession;
  if (!session) return '';

  return (
    session.meetingUrl ||
    buildLiveClassroomPath(
      session.roomName || course._id || course.title || 'instructor-live-room',
      {
        title: session.title || course.title || 'Live module',
        host: session.hostName || 'EDVO Instructor',
        start: session.startTime,
        recordingUrl: session.recordingUrl,
      },
      'student'
    )
  );
}

function getFeaturedLiveModuleLink(module: NonNullable<NonNullable<InstructorDashboardPayload['data']>['liveModule']>) {
  if (!module) return '';

  return (
    module.meetingUrl ||
    buildLiveClassroomPath(
      module.roomName || module.courseId || module.courseTitle || 'instructor-live-room',
      {
        title: module.title || module.courseTitle || 'Live module',
        host: module.hostName || 'EDVO Instructor',
        start: module.startTime,
        recordingUrl: module.recordingUrl,
      },
      'student'
    )
  );
}

function buildCourseLiveModule(course: InstructorCourse) {
  const deliveryMode = String(course.deliveryMode || '').toLowerCase();
  if (deliveryMode !== 'live' && deliveryMode !== 'hybrid') return null;

  return {
    courseId: course._id,
    courseTitle: course.title || 'Assigned course',
    title: `${course.title || 'Course'} live module`,
    description:
      deliveryMode === 'hybrid'
        ? 'This course includes live classes alongside recorded lessons.'
        : 'This course is delivered as a live program.',
    hostName: 'EDVO Instructor',
    roomName: course._id || course.title || 'instructor-live-room',
    startTime: course.nextLiveSession?.startTime || '',
    endTime: course.nextLiveSession?.endTime || '',
    duration: course.nextLiveSession?.duration || '',
    moduleTitle: 'Live module',
    subjectTitle: course.title || '',
    meetingUrl: course.nextLiveSession?.meetingUrl || '',
    recordingUrl: course.nextLiveSession?.recordingUrl || '',
    attendanceRequired: true,
    status: course.nextLiveSession?.status || 'scheduled',
    source: 'course',
  };
}

function formatLiveTiming(session: NonNullable<InstructorCourse['nextLiveSession']>) {
  if (session.startTime) return formatDateTime(session.startTime);
  if (session.duration) return session.duration;
  return 'Timing not set';
}

function initials(value: string) {
  return value
    .split(' ')
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'T';
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);
  const [displayName, setDisplayName] = useState('Teacher');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<InstructorDashboardPayload['data'] | null>(null);

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('auth_user');
    } catch {
      // ignore
    }
    router.push('/instructor');
  };

  useEffect(() => {
    const token = getStoredAuthToken();
    const user = getStoredAuthUser() as AuthUser | null;

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/backend/admin/dashboard');
      return;
    }

    if (user?.role !== 'instructor') {
      router.replace('/dashboard/student');
      return;
    }

    setDisplayName(user?.name || 'Teacher');
    setProfilePhoto(user?.photo || user?.avatar || '');
    setAccessChecked(true);
  }, [router]);

  useEffect(() => {
    if (!accessChecked) return;

    let active = true;

    authFetchJson<InstructorDashboardPayload>('/api/v1/dashboard/instructor')
      .then((payload) => {
        if (active) {
          setDashboard(payload.data || null);
          setDisplayName((current) => payload.data?.user?.name || current);
          setProfilePhoto((current) => payload.data?.user?.photo || payload.data?.user?.avatar || current);
        }
      })
      .catch((loadError: any) => {
        console.warn('Instructor dashboard data could not be loaded:', loadError);
        if (active) {
          setDashboard(emptyInstructorDashboard);
          setError('');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accessChecked]);

  const stats = useMemo(
    () => [
      {
        label: 'Courses',
        value: Number(dashboard?.stats?.totalCourses || 0).toLocaleString(),
        icon: BookOpen,
        tone: 'blue',
      },
      {
        label: 'Students',
        value: Number(dashboard?.stats?.totalStudents || 0).toLocaleString(),
        icon: Users,
        tone: 'emerald',
      },
      {
        label: 'Average Rating',
        value: String(dashboard?.stats?.averageRating || '0.0'),
        icon: Star,
        tone: 'violet',
      },
    ],
    [dashboard]
  );

  const firstCourseWithLiveSession = dashboard?.courses?.find((course) => course.nextLiveSession);
  const firstLiveOrHybridCourse = dashboard?.courses?.find((course) => {
    const mode = String(course.deliveryMode || '').toLowerCase();
    return mode === 'live' || mode === 'hybrid';
  });
  const featuredLiveModule =
    dashboard?.liveModule ||
    (firstCourseWithLiveSession
      ? {
          ...firstCourseWithLiveSession.nextLiveSession,
          courseId: firstCourseWithLiveSession._id,
          courseTitle: firstCourseWithLiveSession.title,
        }
      : null) ||
    (firstLiveOrHybridCourse ? buildCourseLiveModule(firstLiveOrHybridCourse) : null);

  if (!accessChecked) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Verifying teacher access...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="mb-10 rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#2563eb_100%)] px-8 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/25 bg-white/10 text-3xl font-black uppercase shadow-[0_20px_45px_rgba(15,23,42,0.22)]">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials(displayName)
                )}
              </div>
              <div>
                <Badge variant="gradient" className="mb-4 bg-white/10 text-white">Teacher Panel</Badge>
                <h1 className="text-4xl font-black">Welcome back, {displayName}!</h1>
                <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
                  Manage your courses, track enrollments, and monitor student activity from the same EDVO login.
                </p>
              </div>
            </div>
            <div className="flex w-full justify-end lg:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/15"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="rounded-[1.6rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{item.label}</div>
                  <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{item.value}</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </section>

        {featuredLiveModule ? (
          <section className="mb-8">
            <Card className="overflow-hidden rounded-[1.9rem] border border-blue-200/60 bg-[linear-gradient(135deg,#081120_0%,#0f172a_48%,#1d4ed8_100%)] p-0 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.7fr),minmax(280px,360px)]">
                <div className="p-6 sm:p-8">
                  <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                    Live Module
                  </div>
                  <div className="mt-4 text-sm uppercase tracking-[0.2em] text-white/65">
                    {featuredLiveModule.courseTitle || 'Assigned course'}
                  </div>
                  <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                    {featuredLiveModule.title || 'Live session'}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
                    {featuredLiveModule.description ||
                      [featuredLiveModule.subjectTitle, featuredLiveModule.moduleTitle].filter(Boolean).join(' / ') ||
                      'This live module is configured in the course curriculum and is ready to launch.'}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                      {featuredLiveModule.status || 'scheduled'}
                    </span>
                    {featuredLiveModule.startTime ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                        {formatDateTime(featuredLiveModule.startTime)}
                      </span>
                    ) : null}
                    {featuredLiveModule.duration ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                        Duration {featuredLiveModule.duration}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-blue-50">
                      <a href={getFeaturedLiveModuleLink(featuredLiveModule)} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join live module
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
                      type="button"
                      disabled={!getFeaturedLiveModuleLink(featuredLiveModule)}
                      onClick={async () => {
                        const link = getFeaturedLiveModuleLink(featuredLiveModule);
                        if (!link) return;
                        try {
                          await navigator.clipboard.writeText(link);
                        } catch {
                          // ignore clipboard failures
                        }
                      }}
                    >
                      Copy link
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                      Session details
                    </div>
                    <div className="mt-4 space-y-4 text-sm text-white/85">
                      <div>
                        <div className="text-white/55">Course</div>
                        <div className="mt-1 font-semibold text-white">
                          {featuredLiveModule.courseTitle || 'Assigned course'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/55">Room</div>
                        <div className="mt-1 font-semibold text-white">
                          {featuredLiveModule.roomName || 'Not assigned yet'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/55">Host</div>
                        <div className="mt-1 font-semibold text-white">
                          {featuredLiveModule.hostName || 'EDVO Instructor'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/55">Source</div>
                        <div className="mt-1 font-semibold text-white">
                          {featuredLiveModule.source || 'curriculum'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),380px]">
          <Card className="rounded-[1.8rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/80">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">My Courses</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Published and draft courses assigned to your teacher account.</p>
              </div>
              <Button variant="outline" className="rounded-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Loading teacher dashboard...
              </div>
            ) : dashboard?.courses?.length ? (
              <div className="space-y-4">
                {dashboard.courses.map((course) => (
                  <div
                    key={course._id || course.title}
                    className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/60"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                          {course.status || 'draft'}
                        </div>
                        <h3 className="text-xl font-black text-slate-950 dark:text-white">{course.title || 'Untitled course'}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span>{Number(course.studentsEnrolled || 0).toLocaleString()} students</span>
                          <span>{Number(course.rating || 0).toFixed(1)} rating</span>
                          <span>{formatCurrency(Number(course.price || 0))}</span>
                          <span>Updated {formatDate(course.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" className="rounded-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Reviews
                        </Button>
                      </div>
                    </div>

                    {course.nextLiveSession ? (
                      <div className="mt-5 rounded-[1.4rem] border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            Live Module
                          </span>
                          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-slate-900/80 dark:text-blue-200">
                            {course.nextLiveSession.status || 'scheduled'}
                          </span>
                        </div>

                        <div className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                          {course.nextLiveSession.title || 'Live session'}
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {course.nextLiveSession.description ||
                            [course.nextLiveSession.subjectTitle, course.nextLiveSession.moduleTitle].filter(Boolean).join(' / ') ||
                            'This live module is configured inside the course.'}
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-950/70">
                            <div className="flex items-start gap-3">
                              <Clock className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-300" />
                              <div>
                                <div className="text-sm font-semibold text-slate-950 dark:text-white">Timing</div>
                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                  {formatLiveTiming(course.nextLiveSession)}
                                </div>
                                {course.nextLiveSession.endTime ? (
                                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Ends {formatDateTime(course.nextLiveSession.endTime)}
                                  </div>
                                ) : course.nextLiveSession.duration ? (
                                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Duration {course.nextLiveSession.duration}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-950/70">
                            <div className="flex items-start gap-3">
                              <Link2 className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-300" />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-950 dark:text-white">Joining link</div>
                                <a
                                  href={getCourseSessionLink(course)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 block break-all text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-800 dark:text-blue-200 dark:decoration-blue-400/40"
                                >
                                  {getCourseSessionLink(course)}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button asChild className="rounded-full">
                            <a href={getCourseSessionLink(course)} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Join live module
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            type="button"
                            disabled={!getCourseSessionLink(course)}
                            onClick={async () => {
                              const link = getCourseSessionLink(course);
                              if (!link) return;
                              try {
                                await navigator.clipboard.writeText(link);
                              } catch {
                                // ignore clipboard failures
                              }
                            }}
                          >
                            Copy link
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No teacher courses found yet. Admin can assign or create teacher accounts from the admin side.
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[1.8rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/80">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">Recent Enrollments</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest student activity across your assigned programs.</p>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Loading enrollments...
                </div>
              ) : dashboard?.recentEnrollments?.length ? (
                <div className="space-y-4">
                  {dashboard.recentEnrollments.map((entry) => (
                    <div
                      key={entry._id || `${entry.userId?.email}-${entry.createdAt}`}
                      className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/60"
                    >
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">{entry.userId?.name || 'Student'}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.userId?.email || 'No email available'}</div>
                      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Joined {formatDate(entry.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Recent enrollments will appear here once students join your courses.
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
