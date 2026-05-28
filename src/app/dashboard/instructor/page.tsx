'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Eye,
  LogOut,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authFetchJson, getStoredAuthToken, getStoredAuthUser } from '@/lib/backend-api';

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
      studentsEnrolled?: number;
      rating?: number;
      price?: number;
      updatedAt?: string;
    }>;
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No teacher courses found yet. Admin can assign or create teacher accounts from the admin side.
              </div>
            )}
          </Card>

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
        </section>
      </div>
    </main>
  );
}
