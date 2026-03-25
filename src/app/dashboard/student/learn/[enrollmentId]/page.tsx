'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MonitorPlay,
  Play,
  RadioTower,
  Video,
} from 'lucide-react';
import { authFetchJson } from '@/lib/backend-api';
import {
  type LearningDeliveryMode,
  getDeliveryLabel,
  resolveLectureDeliveryMode,
  resolveModuleDeliveryMode,
  summarizeDeliveryModes,
} from '@/lib/learning-delivery';

type LectureItem = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  videoUrl?: string;
  resourceUrl?: string;
  notes?: string;
  contentType?: string;
  deliveryMode?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  completed?: boolean;
};

type ModuleItem = {
  id: string;
  label?: string;
  title: string;
  description?: string;
  deliveryMode?: string;
  lectures: LectureItem[];
};

type SubjectItem = {
  id: string;
  name: string;
  modules: ModuleItem[];
};

type LiveSessionItem = {
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
    liveSessions: LiveSessionItem[];
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
  const [message, setMessage] = useState('');
  const [syncingLectureId, setSyncingLectureId] = useState('');

  const liveSectionRef = useRef<HTMLDivElement | null>(null);
  const autoSyncRef = useRef('');

  const applyWorkspaceData = (data: LearningPayload['data'], preserveSelection = true) => {
    setPayload(data);
    setActiveLectureId((current) => {
      if (preserveSelection && current && hasLecture(data.curriculum, current)) {
        return current;
      }

      return pickInitialLecture(data.curriculum, learningFocus) || current || '';
    });
  };

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
        applyWorkspaceData(response.data, false);
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
  }, [enrollmentId, learningFocus]);

  const activeContext = useMemo(() => {
    for (const subject of payload?.curriculum || []) {
      for (const module of subject.modules || []) {
        const lecture = module.lectures?.find((item) => item.id === activeLectureId);
        if (lecture) {
          return { subject, module, lecture };
        }
      }
    }

    return null;
  }, [payload?.curriculum, activeLectureId]);

  const activeLecture = activeContext?.lecture || null;
  const activeModule = activeContext?.module || null;
  const activeSubject = activeContext?.subject || null;
  const activeDeliveryMode = activeLecture ? resolveLectureDeliveryMode(activeLecture) : 'recorded';

  const learningInsights = useMemo(() => {
    const summary = {
      modules: 0,
      lectures: 0,
      recorded: 0,
      live: 0,
      hybrid: 0,
    };

    for (const subject of payload?.curriculum || []) {
      for (const module of subject.modules || []) {
        summary.modules += 1;
        for (const lecture of module.lectures || []) {
          summary.lectures += 1;
          const mode = resolveLectureDeliveryMode(lecture);
          summary[mode] += 1;
        }
      }
    }

    return summary;
  }, [payload?.curriculum]);

  const recommendedLiveSession = useMemo(() => {
    if (!payload?.liveSessions?.length) return null;
    return payload.liveSessions.find((session) => session.status === 'live') || payload.liveSessions[0];
  }, [payload?.liveSessions]);

  useEffect(() => {
    if (!payload || learningFocus !== 'live' || !liveSectionRef.current) return;

    const timer = window.setTimeout(() => {
      liveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [payload, learningFocus]);

  useEffect(() => {
    if (!payload?.course?.id || !activeLecture?.id) return;
    if (resolveLectureDeliveryMode(activeLecture) !== 'recorded' || activeLecture.completed) return;

    const syncKey = `${payload.course.id}:${activeLecture.id}`;
    if (autoSyncRef.current === syncKey) return;

    autoSyncRef.current = syncKey;
    let cancelled = false;

    const syncRecordedProgress = async () => {
      setSyncingLectureId(activeLecture.id);
      setMessage('');

      try {
        await authFetchJson(`/api/v1/courses/${payload.course.id}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lectureId: activeLecture.id, completed: true }),
        });

        const refreshed = await authFetchJson<LearningPayload>(`/api/v1/enrollments/${enrollmentId}`);
        if (cancelled) return;

        applyWorkspaceData(refreshed.data, true);
        setMessage('Recorded lesson synced automatically');
      } catch (syncError: any) {
        if (cancelled) return;
        autoSyncRef.current = '';
        setMessage(syncError?.message || 'Unable to update recorded lesson progress');
      } finally {
        if (!cancelled) {
          setSyncingLectureId('');
        }
      }
    };

    syncRecordedProgress();

    return () => {
      cancelled = true;
    };
  }, [payload?.course?.id, enrollmentId, activeLecture?.id, activeLecture?.completed, activeLecture?.contentType, activeLecture?.deliveryMode]);

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
      applyWorkspaceData(refreshed.data, true);
      setMessage('Live session access updated');
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

  const completedCount = payload.enrollment.completedLectures.length;
  const messageIsError = /unable|failed|error/i.test(message);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_48%,_#020617_100%)] text-white">
      <div className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-amber-300">Learning workspace</div>
              <h1 className="mt-3 max-w-4xl text-2xl font-black sm:text-3xl">{payload.course.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
                Admin controls the learning flow for this course, including module structure, recorded lessons, and live classroom access.
              </p>
            </div>
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <HeroStat label="Roadmap" value={`${learningInsights.modules} modules`} hint={`${learningInsights.lectures} lessons`} />
            <HeroStat label="Recorded" value={`${learningInsights.recorded}`} hint="auto-synced lessons" />
            <HeroStat label="Live" value={`${payload.liveSessions.length}`} hint="managed sessions" />
            <HeroStat label="Completion" value={`${completedCount}/${payload.enrollment.totalLectures}`} hint="lessons marked" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[0.96fr_1.04fr] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">Progress</div>
                <div className="mt-2 text-4xl font-black">{payload.enrollment.progress}%</div>
                <div className="mt-1 text-sm text-white/55">{completedCount} of {payload.enrollment.totalLectures} lessons aligned with your roadmap</div>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400" style={{ width: `${payload.enrollment.progress}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Attendance" value={`${payload.enrollment.attendance.overallPercentage}%`} icon={<Calendar className="h-4 w-4" />} />
              <MetricCard label="Performance" value={`${payload.enrollment.performance.finalScore}%`} icon={<Award className="h-4 w-4" />} />
              <MetricCard label="Participation" value={`${payload.enrollment.participation.discussionCount + payload.enrollment.participation.questionsAsked + payload.enrollment.participation.resourcesDownloaded}`} icon={<BookOpen className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold">Course roadmap</div>
                <div className="mt-1 text-sm text-white/55">Each module can be fully recorded, fully live, or blended by admin.</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{learningInsights.recorded} recorded</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{learningInsights.live} live</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{learningInsights.hybrid} blended</span>
              </div>
            </div>

            <div className="mt-4 max-h-[64vh] space-y-4 overflow-auto pr-1">
              {payload.curriculum.map((subject) => (
                <div key={subject.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.26em] text-amber-300">{subject.name}</div>
                      <div className="mt-2 text-sm text-white/50">{subject.modules.length} module{subject.modules.length === 1 ? '' : 's'}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {subject.modules.map((module) => {
                      const moduleMode = resolveModuleDeliveryMode(module);
                      const moduleMix = summarizeDeliveryModes(module.lectures || []);

                      return (
                        <div key={module.id} className="rounded-[1.4rem] border border-white/10 bg-slate-900/90 p-3.5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">{module.label || 'Module'}</span>
                                <DeliveryPill mode={moduleMode} />
                              </div>
                              <div className="mt-2 text-sm font-semibold text-white">{module.title}</div>
                              {module.description ? <div className="mt-1 text-xs leading-6 text-white/50">{module.description}</div> : null}
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px] text-white/45">
                              <span className="rounded-full bg-white/5 px-2.5 py-1">{module.lectures.length} lessons</span>
                              {moduleMix.recorded ? <span className="rounded-full bg-white/5 px-2.5 py-1">{moduleMix.recorded} rec</span> : null}
                              {moduleMix.live ? <span className="rounded-full bg-white/5 px-2.5 py-1">{moduleMix.live} live</span> : null}
                              {moduleMix.hybrid ? <span className="rounded-full bg-white/5 px-2.5 py-1">{moduleMix.hybrid} blend</span> : null}
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {module.lectures.map((lecture) => {
                              const lectureMode = resolveLectureDeliveryMode(lecture);
                              const isActive = activeLectureId === lecture.id;
                              const isSyncing = syncingLectureId === lecture.id;

                              return (
                                <button
                                  key={lecture.id}
                                  onClick={() => setActiveLectureId(lecture.id)}
                                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${isActive ? 'border-amber-400/35 bg-amber-500/12 shadow-[0_10px_40px_rgba(245,158,11,0.12)]' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8'}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="font-medium text-white">{lecture.title}</div>
                                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                                        <DeliveryPill mode={lectureMode} compact />
                                        {lecture.duration ? <span>{lecture.duration}</span> : null}
                                        {lecture.contentType ? <span>{lecture.contentType}</span> : null}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-white/55">
                                      {lecture.completed ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-emerald-200">
                                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                                        </span>
                                      ) : isSyncing ? (
                                        <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-amber-200">Syncing</span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1">
                                          <Play className="h-3.5 w-3.5" /> Open
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                  {activeSubject ? <span>{activeSubject.name}</span> : null}
                  {activeModule ? <span>/ {activeModule.title}</span> : null}
                </div>
                <h2 className="mt-3 text-3xl font-black">{activeLecture?.title || 'Select a lesson'}</h2>
                <p className="mt-3 text-sm leading-7 text-white/68">{activeLecture?.description || payload.course.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeLecture ? <DeliveryPill mode={activeDeliveryMode} /> : null}
                {activeLecture?.completed ? <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">Progress synced</span> : null}
                {syncingLectureId === activeLecture?.id ? <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200">Syncing recorded lesson</span> : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <FocusCard title="Lesson type" value={activeLecture ? getDeliveryLabel(activeDeliveryMode) : 'Select a lesson'} hint={activeDeliveryMode === 'recorded' ? 'Auto-marked when opened' : activeDeliveryMode === 'live' ? 'Attendance rule comes next' : 'Use recorded and live touchpoints'} />
              <FocusCard title="Duration" value={activeLecture?.duration || 'Flexible'} hint={activeModule?.label || 'Admin-managed roadmap'} />
              <FocusCard title="Resources" value={activeLecture?.resourceUrl || activeLecture?.videoUrl ? 'Available' : 'Pending'} hint={activeLecture?.videoUrl ? 'Playback link ready' : activeLecture?.resourceUrl ? 'Study material linked' : 'Admin can attach assets'} />
            </div>

            <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-[linear-gradient(140deg,_rgba(245,158,11,0.10),_rgba(15,23,42,0.9),_rgba(20,184,166,0.10))] p-6 sm:p-7">
              <div className="flex items-center gap-3 text-amber-200">
                {activeDeliveryMode === 'live' ? <RadioTower className="h-6 w-6" /> : activeDeliveryMode === 'hybrid' ? <Video className="h-6 w-6" /> : <MonitorPlay className="h-6 w-6" />}
                <div className="text-sm font-semibold uppercase tracking-[0.24em]">
                  {activeDeliveryMode === 'live' ? 'Live classroom access' : activeDeliveryMode === 'hybrid' ? 'Blended lesson flow' : 'Recorded lesson access'}
                </div>
              </div>

              <div className="mt-4 text-sm leading-7 text-white/72">
                {activeLecture ? getActiveLessonCopy(activeDeliveryMode) : 'Choose a lesson from the roadmap to view its delivery rule, live access path, and study resources.'}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {activeLecture?.videoUrl ? (
                  <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" href={activeLecture.videoUrl} target="_blank" rel="noreferrer">
                    Open video <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
                {activeLecture?.resourceUrl ? (
                  <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10" href={activeLecture.resourceUrl} target="_blank" rel="noreferrer">
                    Open resource <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
                {activeDeliveryMode !== 'recorded' && recommendedLiveSession ? (
                  <button
                    onClick={() => joinLiveSession(recommendedLiveSession.id, recommendedLiveSession.meetingUrl)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {recommendedLiveSession.status === 'live' ? 'Join live classroom' : 'Open live schedule'}
                  </button>
                ) : null}
                {activeDeliveryMode === 'live' && !recommendedLiveSession ? (
                  <button
                    onClick={() => liveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View live schedule
                  </button>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/50">
                {activeLecture?.duration ? <span>{activeLecture.duration}</span> : null}
                {activeLecture?.contentType ? <span>{activeLecture.contentType}</span> : null}
                {activeLecture?.notes ? <span>{activeLecture.notes}</span> : null}
              </div>
            </div>

            {message ? (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${messageIsError ? 'border-red-400/30 bg-red-500/10 text-red-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'}`}>
                {message}
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div ref={liveSectionRef} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <RadioTower className="h-5 w-5 text-amber-300" />
                  <div>
                    <div className="text-lg font-bold">Live classroom control</div>
                    <div className="text-sm text-white/55">Session scheduling, join links, and recordings are managed by admin.</div>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">{payload.liveSessions.length} sessions</span>
              </div>

              <div className="mt-5 space-y-4">
                {payload.liveSessions.length ? payload.liveSessions.map((session) => (
                  <div key={session.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{session.title}</div>
                        <div className="mt-1 text-sm text-white/60">{session.description || session.hostName || 'Live class managed from admin'}</div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getSessionStatusClasses(session.status)}`}>
                        {session.status || 'scheduled'}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
                      <InfoChip icon={<Clock className="h-4 w-4" />} text={formatDate(session.startTime)} />
                      <InfoChip icon={<BookOpen className="h-4 w-4" />} text={session.attendanceRequired ? 'Attendance required' : 'Attendance optional'} />
                      <InfoChip icon={<Award className="h-4 w-4" />} text={session.hostName || 'Host assigned by admin'} />
                      <InfoChip icon={<MonitorPlay className="h-4 w-4" />} text={session.recordingUrl ? 'Recording linked' : 'Recording pending'} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        disabled={session.status !== 'live'}
                        onClick={() => joinLiveSession(session.id, session.meetingUrl)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {session.status === 'live' ? 'Join live now' : session.status === 'completed' ? 'Session completed' : 'Available at start time'}
                      </button>
                      {session.recordingUrl ? (
                        <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10" href={session.recordingUrl} target="_blank" rel="noreferrer">
                          Open recording <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[1.75rem] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/50">
                    No live sessions available yet. Admin can attach them course by course.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
                <div className="text-lg font-bold">Course summary</div>
                <div className="mt-5 space-y-4 text-sm text-white/70">
                  <SummaryRow label="Delivery" value={payload.course.deliveryMode || 'Recorded'} />
                  <SummaryRow label="Duration" value={payload.course.duration || 'Flexible'} />
                  <SummaryRow label="Modules" value={`${learningInsights.modules}`} />
                  <SummaryRow label="Support" value={payload.course.supportEmail || 'Support managed by admin'} />
                  <SummaryRow label="Certificate" value={payload.enrollment.certificateEligible ? 'Eligible' : payload.course.certificateSettings?.enabled === false ? 'Disabled' : 'In progress'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
                <div className="text-lg font-bold">Certificate status</div>
                {payload.certificate ? (
                  <div className="mt-4 rounded-[1.75rem] bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <div className="font-semibold">Certificate ready</div>
                    <div className="mt-1">{payload.certificate.certificateNumber}</div>
                    <a className="mt-3 inline-flex items-center gap-2 underline" href={payload.certificate.credentialUrl} target="_blank" rel="noreferrer">
                      Open credential <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.75rem] bg-white/5 p-4 text-sm leading-7 text-white/65">
                    {payload.enrollment.certificateEligible
                      ? 'You are eligible. Your certificate will appear here after the completion rule is applied.'
                      : 'Complete the recorded roadmap, meet attendance goals, and hit the performance target to unlock the certificate.'}
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

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{hint}</div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-950/80 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">{icon}<span>{label}</span></div>
      <div className="mt-3 text-2xl font-black">{value}</div>
    </div>
  );
}

function FocusCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">{title}</div>
      <div className="mt-3 text-lg font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/55">{hint}</div>
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

function InfoChip({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function DeliveryPill({ mode, compact = false }: { mode: LearningDeliveryMode; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${compact ? 'text-[11px]' : 'text-xs'} ${getDeliveryPillClasses(mode)}`}>
      {getDeliveryLabel(mode)}
    </span>
  );
}

function getDeliveryPillClasses(mode: LearningDeliveryMode) {
  if (mode === 'live') return 'border-sky-400/20 bg-sky-500/12 text-sky-100';
  if (mode === 'hybrid') return 'border-violet-400/20 bg-violet-500/12 text-violet-100';
  return 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100';
}

function getSessionStatusClasses(status?: string) {
  if (status === 'live') return 'bg-red-500/15 text-red-200';
  if (status === 'completed') return 'bg-emerald-500/15 text-emerald-200';
  return 'bg-white/10 text-white/70';
}

function getActiveLessonCopy(mode: LearningDeliveryMode) {
  if (mode === 'live') {
    return 'This lesson depends on a live classroom touchpoint. Admin can schedule the session, control the join link, and later decide how live completion should be counted.';
  }

  if (mode === 'hybrid') {
    return 'This lesson blends recorded material with a live support moment. Recorded assets stay available here, while the live session schedule appears below.';
  }

  return 'Recorded lessons no longer need a manual completion button. Opening a recorded lesson syncs progress automatically so the learning path stays clean for students.';
}

function hasLecture(curriculum: SubjectItem[], lectureId: string) {
  return curriculum.some((subject) => subject.modules.some((module) => module.lectures.some((lecture) => lecture.id === lectureId)));
}

function pickInitialLecture(curriculum: SubjectItem[], focus: 'live' | 'recorded') {
  let fallback = '';

  for (const subject of curriculum || []) {
    for (const module of subject.modules || []) {
      for (const lecture of module.lectures || []) {
        if (!fallback) {
          fallback = lecture.id;
        }

        const mode = resolveLectureDeliveryMode(lecture);
        if (focus === 'live' && mode !== 'recorded') {
          return lecture.id;
        }

        if (focus === 'recorded' && mode === 'recorded') {
          return lecture.id;
        }
      }
    }
  }

  return fallback;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
