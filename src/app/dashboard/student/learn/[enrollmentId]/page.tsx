'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MonitorPlay,
  Play,
  RadioTower,
} from 'lucide-react';
import { authFetchJson } from '@/lib/backend-api';

type LectureItem = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  videoUrl?: string;
  resourceUrl?: string;
  notes?: string;
  contentType?: string;
  completed?: boolean;
};

type ModuleItem = {
  id: string;
  label?: string;
  title: string;
  description?: string;
  lectures: LectureItem[];
};

type SubjectItem = {
  id: string;
  name: string;
  modules: ModuleItem[];
};

type LearningPayload = {
  success: boolean;
  data: {
    enrollment: {
      id: string;
      progress: number;
      attendance: { overallPercentage: number };
      performance: { finalScore: number };
      participation: { discussionCount: number; questionsAsked: number; resourcesDownloaded: number };
      certificateEligible: boolean;
      totalLectures: number;
      completedLectures: string[];
    };
    course: {
      id: string;
      title: string;
      slug: string;
      description: string;
      deliveryMode?: string;
      supportEmail?: string;
      duration?: string;
      startDate?: string;
      certificateSettings?: { enabled?: boolean };
    };
    curriculum: SubjectItem[];
    liveSessions: Array<{
      id: string;
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      status?: string;
      meetingUrl?: string;
      recordingUrl?: string;
      hostName?: string;
      attendanceRequired?: boolean;
    }>;
    certificate?: {
      id: string;
      certificateNumber: string;
      issuedAt: string;
      credentialUrl: string;
    } | null;
  };
};

export default function StudentLearningPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const enrollmentId = Array.isArray(params?.enrollmentId) ? params.enrollmentId[0] : params?.enrollmentId || '';
  const learningFocus = searchParams?.get('focus') === 'live' ? 'live' : 'recorded';
  const [payload, setPayload] = useState<LearningPayload['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLectureId, setActiveLectureId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const liveSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    const loadWorkspace = async () => {
      if (!enrollmentId) {
        setError('Learning workspace unavailable');
        setLoading(false);
        return;
      }

      try {
        const response = await authFetchJson<LearningPayload>(`/api/v1/enrollments/${enrollmentId}`);
        if (!active) return;
        setPayload(response.data);

        const firstLecture = response.data.curriculum?.[0]?.modules?.[0]?.lectures?.[0];
        setActiveLectureId(firstLecture?.id || '');
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError?.message || 'Unable to load learning workspace');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWorkspace();
    return () => {
      active = false;
    };
  }, [enrollmentId]);

  const activeLecture = useMemo(() => {
    for (const subject of payload?.curriculum || []) {
      for (const module of subject.modules || []) {
        const lecture = module.lectures?.find((item) => item.id === activeLectureId);
        if (lecture) return lecture;
      }
    }
    return null;
  }, [payload?.curriculum, activeLectureId]);

  useEffect(() => {
    if (!payload || learningFocus !== 'live' || !liveSectionRef.current) return;

    const timer = window.setTimeout(() => {
      liveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [payload, learningFocus]);

  const markComplete = async () => {
    if (!payload?.course?.id || !activeLectureId) return;
    setSaving(true);
    setMessage('');
    try {
      await authFetchJson(`/api/v1/courses/${payload.course.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId: activeLectureId, completed: true }),
      });
      const refreshed = await authFetchJson<LearningPayload>(`/api/v1/enrollments/${enrollmentId}`);
      setPayload(refreshed.data);
      setMessage('Progress updated');
    } catch (saveError: any) {
      setMessage(saveError?.message || 'Unable to update progress');
    } finally {
      setSaving(false);
    }
  };

  const joinLiveSession = async (sessionId: string, url?: string) => {
    try {
      await authFetchJson(`/api/v1/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join-live-session', sessionId }),
      });
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      const refreshed = await authFetchJson<LearningPayload>(`/api/v1/enrollments/${enrollmentId}`);
      setPayload(refreshed.data);
    } catch (joinError: any) {
      setMessage(joinError?.message || 'Unable to join live session');
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-slate-950" />;
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <p>{error || 'Learning workspace unavailable'}</p>
        <Link className="mt-4 inline-flex underline" href="/dashboard/student">Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300">Learning workspace</div>
            <h1 className="mt-2 text-2xl font-black">{payload.course.title}</h1>
          </div>
          <Link href="/dashboard/student" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">Back to dashboard</Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">Progress</div>
                <div className="mt-2 text-4xl font-black">{payload.enrollment.progress}%</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${payload.enrollment.progress}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Attendance" value={`${payload.enrollment.attendance.overallPercentage}%`} icon={<Calendar className="h-4 w-4" />} />
              <MetricCard label="Performance" value={`${payload.enrollment.performance.finalScore}%`} icon={<Award className="h-4 w-4" />} />
              <MetricCard label="Participation" value={`${payload.enrollment.participation.discussionCount + payload.enrollment.participation.questionsAsked + payload.enrollment.participation.resourcesDownloaded}`} icon={<BookOpen className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5">
            <div className="text-lg font-bold">Recorded modules</div>
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-auto pr-1">
              {payload.curriculum.map((subject) => (
                <div key={subject.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">{subject.name}</div>
                  <div className="mt-4 space-y-3">
                    {subject.modules.map((module) => (
                      <div key={module.id} className="rounded-2xl bg-slate-900 p-3">
                        <div className="text-sm font-semibold text-white">{module.title}</div>
                        <div className="mt-3 space-y-2">
                          {module.lectures.map((lecture) => (
                            <button
                              key={lecture.id}
                              onClick={() => setActiveLectureId(lecture.id)}
                              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${activeLectureId === lecture.id ? 'bg-amber-500/15 text-white' : 'bg-white/5 text-white/75 hover:bg-white/10'}`}
                            >
                              <span className="pr-3">{lecture.title}</span>
                              <span className="flex items-center gap-2 text-xs text-white/50">
                                {lecture.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4" />}
                                {lecture.duration || lecture.contentType || 'lesson'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">Current lesson</div>
                <h2 className="mt-2 text-3xl font-black">{activeLecture?.title || 'Select a lecture'}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{activeLecture?.description || payload.course.description}</p>
              </div>
              <button
                onClick={markComplete}
                disabled={!activeLectureId || saving}
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Mark complete'}
              </button>
            </div>

            <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-[linear-gradient(135deg,_rgba(245,158,11,0.08),_rgba(15,118,110,0.10))] p-8">
              <div className="flex items-center gap-3 text-amber-300">
                <MonitorPlay className="h-6 w-6" />
                <div className="text-sm font-semibold uppercase tracking-[0.2em]">Recorded learning module</div>
              </div>
              <div className="mt-5 text-sm leading-7 text-white/70">
                {activeLecture?.notes || activeLecture?.resourceUrl || 'Video playback, notes, and downloadable resources can be managed from admin for each lecture.'}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/50">
                {activeLecture?.duration ? <span>{activeLecture.duration}</span> : null}
                {activeLecture?.contentType ? <span>{activeLecture.contentType}</span> : null}
                {activeLecture?.videoUrl ? <a className="underline" href={activeLecture.videoUrl} target="_blank" rel="noreferrer">Open video</a> : null}
                {activeLecture?.resourceUrl ? <a className="underline" href={activeLecture.resourceUrl} target="_blank" rel="noreferrer">Open resource</a> : null}
              </div>
            </div>

            {message ? <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div ref={liveSectionRef} className="rounded-[2rem] border border-white/10 bg-slate-900 p-5">
              <div className="flex items-center gap-3">
                <RadioTower className="h-5 w-5 text-amber-300" />
                <div className="text-lg font-bold">Live session control</div>
              </div>
              <div className="mt-5 space-y-4">
                {payload.liveSessions.length ? payload.liveSessions.map((session) => (
                  <div key={session.id} className="rounded-3xl bg-slate-950/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{session.title}</div>
                        <div className="mt-1 text-sm text-white/60">{session.description || session.hostName || 'Live class managed from admin'}</div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${session.status === 'live' ? 'bg-red-500/15 text-red-200' : session.status === 'completed' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-white/70'}`}>
                        {session.status || 'scheduled'}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatDate(session.startTime)}</div>
                      <button
                        disabled={session.status !== 'live'}
                        onClick={() => joinLiveSession(session.id, session.meetingUrl)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {session.status === 'live' ? 'Join live now' : session.status === 'completed' ? 'Session completed' : 'Available at start time'}
                      </button>
                    </div>
                  </div>
                )) : <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/50">No live sessions available.</div>}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5">
                <div className="text-lg font-bold">Course summary</div>
                <div className="mt-5 space-y-4 text-sm text-white/70">
                  <SummaryRow label="Delivery" value={payload.course.deliveryMode || 'recorded'} />
                  <SummaryRow label="Duration" value={payload.course.duration || 'Flexible'} />
                  <SummaryRow label="Support" value={payload.course.supportEmail || 'Support managed by admin'} />
                  <SummaryRow label="Certificate" value={payload.enrollment.certificateEligible ? 'Eligible' : payload.course.certificateSettings?.enabled === false ? 'Disabled' : 'In progress'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5">
                <div className="text-lg font-bold">Certificate status</div>
                {payload.certificate ? (
                  <div className="mt-4 rounded-3xl bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <div className="font-semibold">Certificate ready</div>
                    <div className="mt-1">{payload.certificate.certificateNumber}</div>
                    <a className="mt-3 inline-flex underline" href={payload.certificate.credentialUrl} target="_blank" rel="noreferrer">Open credential</a>
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl bg-white/5 p-4 text-sm text-white/65">
                    {payload.enrollment.certificateEligible ? 'You are eligible. Your certificate will appear here after the completion rule is applied.' : 'Complete the course, attendance target, and performance target to unlock the certificate.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-2xl bg-slate-950/80 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">{icon}<span>{label}</span></div>
      <div className="mt-3 text-2xl font-black">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/70 px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
