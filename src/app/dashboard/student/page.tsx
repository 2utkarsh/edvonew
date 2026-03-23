'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Play,
  RadioTower,
  TrendingUp,
  Users,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FadeIn } from '@/components/animations';
import { Footer, Navbar } from '@/components/layout';
import { authFetchJson, getStoredAuthUser } from '@/lib/backend-api';

type DashboardPayload = {
  success: boolean;
  data: {
    myCourses: Array<{
      enrollmentId: string;
      course: {
        id: string;
        title: string;
        slug: string;
        category: string;
        instructorName?: string;
        thumbnail?: string;
        duration?: string;
        deliveryMode?: string;
        progress: number;
      };
      progress: number;
      attendance: { overallPercentage: number };
      performance: { finalScore: number };
      participation: { discussionCount: number; questionsAsked: number; resourcesDownloaded: number };
      certificateEligible: boolean;
      nextLiveSession?: { title: string; startTime: string } | null;
      lastAccessedAt?: string;
    }>;
    stats: {
      totalEnrolled: number;
      completedCourses: number;
      inProgressCourses: number;
      averageProgress: number;
      certificatesEarned: number;
      unreadNotifications: number;
    };
    upcomingLiveSessions: Array<{
      enrollmentId: string;
      courseTitle: string;
      title: string;
      startTime: string;
      status?: string;
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
    }>;
  };
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<DashboardPayload['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredAuthUser() as { name?: string } | null;

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const payload = await authFetchJson<DashboardPayload>('/api/v1/dashboard/student');
        if (!active) return;
        setDashboard(payload.data);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError?.message || 'Unable to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-8 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#b45309_0%,_#0f766e_100%)] p-8 text-white shadow-2xl shadow-amber-500/10 md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_30%)]" />
                <div className="relative z-10">
                  <h1 className="text-4xl font-black tracking-tight md:text-5xl">Welcome back, {user?.name || 'Student'}</h1>
                  <p className="mt-4 max-w-2xl text-lg text-white/85">
                    Your dashboard is now fully dynamic with course access, live schedule, attendance, performance, participation, certificates, and notifications.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    {[
                      { label: 'Courses', value: dashboard?.stats.totalEnrolled ?? 0, icon: BookOpen },
                      { label: 'Completed', value: dashboard?.stats.completedCourses ?? 0, icon: Award },
                      { label: 'In progress', value: dashboard?.stats.inProgressCourses ?? 0, icon: TrendingUp },
                      { label: 'Avg progress', value: `${dashboard?.stats.averageProgress ?? 0}%`, icon: Clock },
                      { label: 'Certificates', value: dashboard?.stats.certificatesEarned ?? 0, icon: Award },
                      { label: 'Unread alerts', value: dashboard?.stats.unreadNotifications ?? 0, icon: Bell },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                      >
                        <item.icon className="h-6 w-6 text-white/80" />
                        <div className="mt-3 text-3xl font-black">{item.value}</div>
                        <div className="mt-1 text-sm text-white/75">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {error ? (
              <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {error} <Link href="/auth/login" className="font-semibold underline">Log in again</Link>
              </div>
            ) : null}

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_0.9fr]">
              <div className="space-y-8">
                <FadeIn delay={0.05}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My learning workspace</h2>
                    <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                      {loading ? 'Loading...' : `${dashboard?.myCourses.length || 0} active enrollments`}
                    </span>
                  </div>
                </FadeIn>

                <div className="space-y-5">
                  {(dashboard?.myCourses || []).map((item, index) => (
                    <FadeIn key={item.enrollmentId} delay={index * 0.05}>
                      <Card className="!p-0 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                          <div className="flex min-h-[220px] flex-col justify-between bg-[linear-gradient(135deg,_rgba(15,118,110,0.15),_rgba(245,158,11,0.16))] p-6 dark:bg-[linear-gradient(135deg,_rgba(15,118,110,0.18),_rgba(245,158,11,0.10))]">
                            <div>
                              <div className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                {formatDelivery(item.course.deliveryMode)}
                              </div>
                              <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{item.course.title}</h3>
                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.course.category}  -  {item.course.duration || 'Flexible duration'}</p>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              {item.nextLiveSession ? `Next live class: ${item.nextLiveSession.title}` : 'Continue your recorded modules'}
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">Progress</div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">{item.progress}%</div>
                              </div>
                              <Link href={`/dashboard/student/learn/${item.enrollmentId}`}>
                                <Button variant="primary" size="sm">
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume
                                </Button>
                              </Link>
                            </div>

                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${item.progress}%` }} />
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                              <MetricBox label="Attendance" value={`${item.attendance.overallPercentage}%`} />
                              <MetricBox label="Performance" value={`${item.performance.finalScore}%`} />
                              <MetricBox label="Participation" value={`${item.participation.discussionCount + item.participation.questionsAsked + item.participation.resourcesDownloaded}`} />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                              {item.certificateEligible ? <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Certificate eligible</span> : null}
                              {item.lastAccessedAt ? <span>Last active {formatDate(item.lastAccessedAt)}</span> : null}
                              {item.nextLiveSession?.startTime ? <span>{formatDate(item.nextLiveSession.startTime)}</span> : null}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <FadeIn delay={0.08}>
                  <SidebarBlock icon={<RadioTower className="h-5 w-5" />} title="Upcoming live classes">
                    {(dashboard?.upcomingLiveSessions || []).length ? (
                      <div className="space-y-4">
                        {dashboard?.upcomingLiveSessions.map((session) => (
                          <div key={`${session.enrollmentId}-${session.title}`} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                            <div className="font-semibold text-slate-900 dark:text-white">{session.title}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.courseTitle}</div>
                            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{formatDate(session.startTime)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="No live classes are scheduled right now." />
                    )}
                  </SidebarBlock>
                </FadeIn>

                <FadeIn delay={0.12}>
                  <SidebarBlock icon={<Bell className="h-5 w-5" />} title="Notifications">
                    {(dashboard?.notifications || []).length ? (
                      <div className="space-y-4">
                        {dashboard?.notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                            <div className="font-semibold text-slate-900 dark:text-white">{notification.title}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</div>
                            {notification.actionUrl ? <Link className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300" href={notification.actionUrl}>Open</Link> : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="No notifications yet." />
                    )}
                  </SidebarBlock>
                </FadeIn>

                <FadeIn delay={0.16}>
                  <SidebarBlock icon={<Award className="h-5 w-5" />} title="Certificates">
                    {(dashboard?.certificates || []).length ? (
                      <div className="space-y-4">
                        {dashboard?.certificates.map((certificate) => (
                          <div key={certificate.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                            <div className="font-semibold text-slate-900 dark:text-white">{certificate.courseName || 'Course certificate'}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{certificate.certificateNumber}</div>
                            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Issued {formatDate(certificate.issuedAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState text="Certificates will appear here after course completion." />
                    )}
                  </SidebarBlock>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SidebarBlock({ icon, title, children }: { icon: any; title: string; children: any }) {
  return (
    <Card className="rounded-[2rem] !p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{icon}</div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{text}</div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDelivery(mode?: string) {
  if ((mode || '').toLowerCase() === 'live') return 'Live';
  if ((mode || '').toLowerCase() === 'hybrid') return 'Hybrid';
  return 'Recorded';
}
