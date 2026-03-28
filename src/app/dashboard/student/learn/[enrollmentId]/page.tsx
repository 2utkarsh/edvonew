'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
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
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout';

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

type FlatLesson = {
  subject: SubjectItem;
  module: ModuleItem;
  lecture: LectureItem;
};

type RoadmapStep = {
  key: string;
  subjectName: string;
  moduleId: string;
  label: string;
  title: string;
  totalLectures: number;
  completedLectures: number;
  progress: number;
  mode: LearningDeliveryMode;
  launchLectureId: string;
};

type StageAsset =
  | { kind: 'iframe'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'placeholder'; url: string };

export default function StudentLearningPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = Array.isArray(params?.enrollmentId) ? params.enrollmentId[0] : params?.enrollmentId || '';
  const learningFocus = searchParams?.get('focus') === 'live' ? 'live' : 'recorded';
  const selectedLessonId = searchParams?.get('lesson') || '';
  const isLessonWorkspace = Boolean(selectedLessonId);

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
      if (selectedLessonId && hasLecture(data.curriculum, selectedLessonId)) {
        return selectedLessonId;
      }

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

  useEffect(() => {
    if (!payload) return;

    if (selectedLessonId && hasLecture(payload.curriculum, selectedLessonId)) {
      setActiveLectureId(selectedLessonId);
      return;
    }

    if (!activeLectureId || !hasLecture(payload.curriculum, activeLectureId)) {
      setActiveLectureId(pickInitialLecture(payload.curriculum, learningFocus) || '');
    }
  }, [payload, selectedLessonId, activeLectureId, learningFocus]);

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

  const flatLessons = useMemo(() => {
    const lessons: FlatLesson[] = [];

    for (const subject of payload?.curriculum || []) {
      for (const module of subject.modules || []) {
        for (const lecture of module.lectures || []) {
          lessons.push({ subject, module, lecture });
        }
      }
    }

    return lessons;
  }, [payload?.curriculum]);

  const activeLessonIndex = useMemo(
    () => flatLessons.findIndex((item) => item.lecture.id === activeLectureId),
    [flatLessons, activeLectureId]
  );

  const previousLesson = activeLessonIndex > 0 ? flatLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < flatLessons.length - 1 ? flatLessons[activeLessonIndex + 1] : null;

  const nextIncompleteLesson = useMemo(() => {
    const completedSet = new Set(payload?.enrollment.completedLectures || []);
    return flatLessons.find((item) => !completedSet.has(item.lecture.id)) || flatLessons[0] || null;
  }, [flatLessons, payload?.enrollment.completedLectures]);

  const roadmapSteps = useMemo(() => {
    const steps: RoadmapStep[] = [];
    const completedSet = new Set(payload?.enrollment.completedLectures || []);
    let index = 0;

    for (const subject of payload?.curriculum || []) {
      for (const module of subject.modules || []) {
        index += 1;
        const lectureIds = (module.lectures || []).map((lecture) => lecture.id);
        const completedLectures = lectureIds.filter((lectureId) => completedSet.has(lectureId)).length;
        const totalLectures = lectureIds.length;
        const progress = totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0;
        const launchLectureId = module.lectures.find((lecture) => !completedSet.has(lecture.id))?.id || module.lectures[0]?.id || '';

        steps.push({
          key: `${subject.id}-${module.id}`,
          subjectName: subject.name,
          moduleId: module.id,
          label: module.label || `Step ${index}`,
          title: module.title,
          totalLectures,
          completedLectures,
          progress,
          mode: resolveModuleDeliveryMode(module),
          launchLectureId,
        });
      }
    }

    return steps;
  }, [payload?.curriculum, payload?.enrollment.completedLectures]);

  const activeRoadmapIndex = useMemo(
    () => roadmapSteps.findIndex((step) => step.moduleId === activeModule?.id),
    [roadmapSteps, activeModule?.id]
  );

  const activeRoadmapStep = activeRoadmapIndex >= 0 ? roadmapSteps[activeRoadmapIndex] : null;

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

  const stageAsset = useMemo(
    () => resolveStageAsset(activeLecture, recommendedLiveSession, activeDeliveryMode),
    [activeLecture, recommendedLiveSession, activeDeliveryMode]
  );

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
    if (!isLessonWorkspace || !payload?.course?.id || !activeLecture?.id) return;
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

  const buildLearningUrl = ({ lessonId, focus = learningFocus }: { lessonId?: string; focus?: 'live' | 'recorded' } = {}) => {
    const params = new URLSearchParams();
    if (focus === 'live') {
      params.set('focus', 'live');
    }
    if (lessonId) {
      params.set('lesson', lessonId);
    }
    const query = params.toString();
    return query
      ? '/dashboard/student/learn/' + enrollmentId + '?' + query
      : '/dashboard/student/learn/' + enrollmentId;
  };

  const openLesson = (lectureId?: string) => {
    if (!lectureId) return;
    const targetLesson = flatLessons.find((item) => item.lecture.id === lectureId)?.lecture || null;
    const targetFocus = targetLesson && resolveLectureDeliveryMode(targetLesson) !== 'recorded' ? 'live' : 'recorded';
    setActiveLectureId(lectureId);
    setMessage('');
    router.push(buildLearningUrl({ lessonId: lectureId, focus: targetFocus }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.1),_transparent_28%),linear-gradient(180deg,#fffef9_0%,#f8fafc_52%,#f5f7fb_100%)] pt-32 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)]" />
      </>
    );
  }

  if (!payload) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.1),_transparent_28%),linear-gradient(180deg,#fffef9_0%,#f8fafc_52%,#f5f7fb_100%)] px-4 pb-16 pt-36 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] dark:text-white">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-none">
            <p>{error || 'Learning workspace unavailable'}</p>
            <Link className="mt-4 inline-flex underline" href="/dashboard/student">Back to dashboard</Link>
          </div>
        </main>
      </>
    );
  }

  const completedCount = payload.enrollment.completedLectures.length;
  const messageIsError = /unable|failed|error/i.test(message);
  const overallJourneyProgress = payload.enrollment.totalLectures
    ? Math.round((completedCount / payload.enrollment.totalLectures) * 100)
    : payload.enrollment.progress;
  const overviewDeliveryMode: LearningDeliveryMode =
    learningInsights.live > 0 || learningInsights.hybrid > 0
      ? learningInsights.recorded > 0 || learningInsights.hybrid > 0
        ? 'hybrid'
        : 'live'
      : 'recorded';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.08),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.1),_transparent_28%),linear-gradient(180deg,#fffef9_0%,#f8fafc_52%,#f5f7fb_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] dark:text-white">
        <div className="border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/50">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4 px-4 pb-5 pt-32 sm:px-6 sm:pt-36 lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{isLessonWorkspace ? 'Daily learning workspace' : 'Purchased course journey'}</div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">{isLessonWorkspace ? activeLecture?.title || payload.course.title : payload.course.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-violet-100 dark:bg-violet-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">
                {getDeliveryLabel(isLessonWorkspace ? activeDeliveryMode : overviewDeliveryMode)}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {payload.enrollment.progress}% completed
              </span>
            </div>
          </div>
        </div>

        <div className={cn('mx-auto gap-6 px-4 py-6 sm:px-6 lg:px-8', isLessonWorkspace ? 'grid max-w-[1600px] xl:grid-cols-[320px_1fr]' : 'max-w-[1500px]')}>
        {isLessonWorkspace ? (
          <aside className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none xl:sticky xl:top-24 xl:h-fit">
            <div className="border-b border-slate-200 dark:border-white/10 px-5 py-4">
              <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contents</div>
              <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Course roadmap</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recorded and live sessions are arranged by module.</div>
                      </div>

            <div className="max-h-[calc(100vh-10rem)] space-y-4 overflow-auto p-3">
              {payload.curriculum.map((subject) => (
              <div key={subject.id} className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 p-3.5">
                <div className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{subject.name}</div>
                <div className="mt-3 space-y-3">
                  {subject.modules.map((module) => {
                    const moduleMode = resolveModuleDeliveryMode(module);
                    const moduleMix = summarizeDeliveryModes(module.lectures || []);

                    return (
                      <div key={module.id} className="rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{module.label || 'Module'}</div>
                            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{module.title}</div>
                          </div>
                          <DeliveryPill mode={moduleMode} compact />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{module.lectures.length} lessons</span>
                          {moduleMix.recorded ? <span>{moduleMix.recorded} recorded</span> : null}
                          {moduleMix.live ? <span>{moduleMix.live} live</span> : null}
                          {moduleMix.hybrid ? <span>{moduleMix.hybrid} blended</span> : null}
                        </div>

                        <div className="mt-3 space-y-2">
                          {module.lectures.map((lecture) => {
                            const lectureMode = resolveLectureDeliveryMode(lecture);
                            const isActive = activeLectureId === lecture.id;
                            const isSyncing = syncingLectureId === lecture.id;

                            return (
                              <button
                                key={lecture.id}
                                type="button"
                                onClick={() => openLesson(lecture.id)}
                                className={cn(
                                  'w-full rounded-2xl border px-3 py-3 text-left transition',
                                  isActive
                                    ? 'border-violet-300 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-500/10 shadow-[0_10px_30px_rgba(139,92,246,0.08)]'
                                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{lecture.title}</div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                      <DeliveryPill mode={lectureMode} compact />
                                      {lecture.duration ? <span>{lecture.duration}</span> : null}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {lecture.completed ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 text-emerald-700 dark:text-emerald-200">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                                      </span>
                                    ) : isSyncing ? (
                                      <span className="rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-1 text-amber-700 dark:text-amber-200">Syncing</span>
                                    ) : (
                                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-1">Open</span>
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
          </aside>
        ) : null}

        <section className="space-y-6">
          {!isLessonWorkspace ? (
            <>
              {message ? (
                <div className={cn('rounded-2xl border px-4 py-3 text-sm', messageIsError ? 'border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200' : 'border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200')}>
                  {message}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-[2.4rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
                <div className="relative overflow-hidden border-b border-slate-200 dark:border-white/10 bg-[radial-gradient(circle_at_top_right,#312e81_0%,#4338ca_22%,#eef2ff_22%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_right,#4338ca_0%,#1e1b4b_24%,#0f172a_24%,#020617_100%)] px-6 py-8 sm:px-8">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-200 shadow-sm dark:shadow-none">Purchased course journey</div>
                    <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white sm:text-[2.2rem]">{payload.course.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                      Click any roadmap circle to open the dedicated lesson player page. The overview stays clean here, and the actual learning opens separately just like your reference.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:max-w-[520px] xl:grid-cols-4">
                    <PanelStat label="Modules" value={String(learningInsights.modules)} />
                    <PanelStat label="Lessons" value={String(payload.enrollment.totalLectures)} />
                    <PanelStat label="Live" value={String(learningInsights.live + learningInsights.hybrid)} />
                    <PanelStat label="Progress" value={overallJourneyProgress + '%'} />
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div ref={liveSectionRef} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] border border-amber-200 dark:border-amber-400/30 bg-[linear-gradient(135deg,#fff7cc_0%,#fff4d9_52%,#ffffff_100%)] dark:bg-[linear-gradient(135deg,rgba(120,53,15,0.26)_0%,rgba(67,56,202,0.18)_52%,rgba(15,23,42,0.96)_100%)] px-5 py-4">
                    <div className="max-w-3xl">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Course access</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Recorded lessons and live sessions stay connected in one bootcamp roadmap.</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{payload.course.description || 'Open any circle below to enter the lesson workspace.'}</div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {recommendedLiveSession ? (
                        <button
                          type="button"
                          onClick={() => joinLiveSession(recommendedLiveSession.id, recommendedLiveSession.meetingUrl || recommendedLiveSession.recordingUrl)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {recommendedLiveSession.status === 'live' ? 'Join live class now' : 'Open live access'}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => openLesson(nextIncompleteLesson?.lecture.id || activeLectureId)}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Continue your journey <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 overflow-x-auto pb-4">
                    <div className="flex min-w-[1220px] items-center">
                      <div className="mr-6 hidden shrink-0 rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)] px-5 py-4 text-center text-white md:block">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">Start</div>
                        <div className="mt-1 text-sm font-black">Bootcamp</div>
                      </div>

                      {roadmapSteps.map((step, index) => {
                        const isCompleted = step.progress >= 100;
                        const isActive = step.moduleId === activeModule?.id;
                        const connectorWidth = isCompleted ? '100%' : step.progress >= 50 ? '70%' : step.progress > 0 ? '36%' : '16%';

                        return (
                          <div key={step.key} className="flex items-center">
                            <button
                              type="button"
                              onClick={() => openLesson(step.launchLectureId)}
                              className={cn(
                                'group w-[188px] shrink-0 rounded-[1.8rem] border px-4 py-5 text-center transition',
                                isActive
                                  ? 'border-violet-300 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-500/10 shadow-[0_14px_35px_rgba(139,92,246,0.12)]'
                                  : isCompleted
                                    ? 'border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 hover:bg-white dark:bg-slate-900'
                              )}
                            >
                              <div
                                className={cn(
                                  'mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 text-base font-black transition',
                                  isActive
                                    ? 'border-violet-200 bg-violet-600 text-white'
                                    : isCompleted
                                      ? 'border-emerald-200 dark:border-emerald-400/30 bg-emerald-500 text-white'
                                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                                )}
                              >
                                {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : isActive ? <Play className="ml-0.5 h-5 w-5" /> : <span>{index + 1}</span>}
                              </div>
                              <div className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{step.label}</div>
                              <div className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{step.title}</div>
                              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{step.subjectName}</div>
                              <div className="mt-3 flex items-center justify-center gap-2">
                                <DeliveryPill mode={step.mode} compact />
                              </div>
                              <div className="mt-3 inline-flex rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
                                {step.completedLectures}/{step.totalLectures} lessons
                              </div>
                            </button>

                            {index < roadmapSteps.length - 1 ? (
                              <div className="flex h-[72px] w-24 shrink-0 items-center justify-center">
                                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                                  <div className={cn('h-full rounded-full', isCompleted ? 'bg-emerald-500' : isActive ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-700')} style={{ width: connectorWidth }} />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      <div className="ml-6 hidden shrink-0 rounded-full border border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-500/10 px-5 py-4 text-center text-sky-700 dark:text-sky-200 md:block">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-500">Finish</div>
                        <div className="mt-1 text-sm font-black">Bootcamp</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] bg-[linear-gradient(135deg,#312e81_0%,#4338ca_52%,#1d4ed8_100%)] p-5 text-white">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Boarding Pass</div>
                        <div className="mt-2 text-2xl font-black">{activeRoadmapStep?.title || activeLecture?.title || payload.course.title}</div>
                        <div className="mt-2 text-sm text-white/80">Bootcamp progress {overallJourneyProgress}% with {completedCount}/{payload.enrollment.totalLectures} lessons completed.</div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => openLesson(activeRoadmapStep?.launchLectureId || activeLectureId)}
                          className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white transition hover:bg-white/90 dark:hover:bg-slate-800"
                        >
                          Open current lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => openLesson(nextIncompleteLesson?.lecture.id || activeLectureId)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Continue your journey <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {activeSubject ? <span>{activeSubject.name}</span> : null}
                      {activeModule ? <span>/ {activeModule.title}</span> : null}
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">{activeLecture?.title || 'Select a lesson'}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{activeLecture?.description || payload.course.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={buildLearningUrl()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                      <ArrowLeft className="h-4 w-4" /> Back to roadmap
                    </Link>
                    <LessonNavButton
                      label="Prev"
                      disabled={!previousLesson}
                      icon={<ArrowLeft className="h-4 w-4" />}
                      onClick={() => previousLesson && openLesson(previousLesson.lecture.id)}
                    />
                    <LessonNavButton
                      label="Next"
                      disabled={!nextLesson}
                      icon={<ArrowRight className="h-4 w-4" />}
                      onClick={() => nextLesson && openLesson(nextLesson.lecture.id)}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <PanelStat label="Lesson" value={(activeLessonIndex >= 0 ? activeLessonIndex + 1 : 0) + '/' + (flatLessons.length || 0)} />
                  <PanelStat label="Mode" value={getDeliveryLabel(activeDeliveryMode)} />
                  <PanelStat label="Duration" value={activeLecture?.duration || 'Flexible'} />
                  <PanelStat label="Resources" value={activeLecture?.resourceUrl || activeLecture?.videoUrl || activeLecture?.recordingUrl ? 'Ready' : 'Pending'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
                <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-[#030712] md:min-h-[460px]">
                  {stageAsset.kind === 'iframe' ? (
                    <iframe
                      src={stageAsset.url}
                      title={activeLecture?.title || payload.course.title}
                      className="h-full min-h-[360px] w-full border-0 md:min-h-[460px]"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : stageAsset.kind === 'video' ? (
                    <video
                      src={stageAsset.url}
                      controls
                      className="h-full min-h-[360px] w-full bg-black object-contain md:min-h-[460px]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 text-center text-white md:min-h-[460px]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                        {activeDeliveryMode === 'live' ? <RadioTower className="h-8 w-8" /> : activeDeliveryMode === 'hybrid' ? <Video className="h-8 w-8" /> : <MonitorPlay className="h-8 w-8" />}
                      </div>
                      <h3 className="mt-5 text-2xl font-black">
                        {activeDeliveryMode === 'live' ? 'Live session ready to join' : activeDeliveryMode === 'hybrid' ? 'Recorded and live learning together' : 'Recorded lesson ready'}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{activeLecture ? getActiveLessonCopy(activeDeliveryMode) : 'Select a lesson from the contents panel to begin.'}</p>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
                    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur">
                      <Play className="h-3.5 w-3.5" /> {getDeliveryLabel(activeDeliveryMode)}
                    </div>
                    {activeLecture?.completed ? (
                      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 backdrop-blur">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Progress synced
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {activeLecture?.videoUrl ? (
                    <a className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" href={activeLecture.videoUrl} target="_blank" rel="noreferrer">
                      Open recorded video <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  {activeLecture?.resourceUrl ? (
                    <a className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800" href={activeLecture.resourceUrl} target="_blank" rel="noreferrer">
                      Open study material <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  {recommendedLiveSession ? (
                    <button
                      type="button"
                      onClick={() => joinLiveSession(recommendedLiveSession.id, recommendedLiveSession.meetingUrl || recommendedLiveSession.recordingUrl)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {recommendedLiveSession.status === 'live' ? 'Join live class now' : 'Open live access'}
                    </button>
                  ) : null}
                  {recommendedLiveSession?.recordingUrl ? (
                    <a className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800" href={recommendedLiveSession.recordingUrl} target="_blank" rel="noreferrer">
                      Open live recording <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                {message ? (
                  <div className={cn('mt-4 rounded-2xl border px-4 py-3 text-sm', messageIsError ? 'border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-200' : 'border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200')}>
                    {message}
                  </div>
                ) : null}
              </div>

              {activeLecture?.notes ? (
                <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">Lesson notes</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Only the lesson essentials stay on this page for a cleaner learning flow.</div>
                    </div>
                    <DeliveryPill mode={activeDeliveryMode} />
                  </div>
                  <div className="mt-5 whitespace-pre-wrap rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/70 p-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
                    {activeLecture.notes}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
        </div>
      </main>
    </>
  );
}

function PanelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 px-4 py-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function LessonNavButton({ label, icon, disabled, onClick }: { label: string; icon: ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 px-4 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-slate-600 dark:text-slate-300">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function DeliveryPill({ mode, compact = false }: { mode: LearningDeliveryMode; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 font-semibold', compact ? 'text-[11px]' : 'text-xs', getDeliveryPillClasses(mode))}>
      {getDeliveryLabel(mode)}
    </span>
  );
}

function getDeliveryPillClasses(mode: LearningDeliveryMode) {
  if (mode === 'live') return 'border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-200';
  if (mode === 'hybrid') return 'border-violet-200 dark:border-violet-400/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-200';
  return 'border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200';
}

function getSessionStatusClasses(status?: string) {
  if (status === 'live') return 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-200';
  if (status === 'completed') return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-200';
  return 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300';
}

function getActiveLessonCopy(mode: LearningDeliveryMode) {
  if (mode === 'live') {
    return 'This lesson depends on a live classroom touchpoint. Admin schedules the session, controls the join link, and later decides how attendance and completion should be counted.';
  }

  if (mode === 'hybrid') {
    return 'This lesson blends recorded material with a live support moment. Recorded assets stay available here while the live session schedule remains attached to the same purchased course.';
  }

  return 'Recorded lessons no longer need a manual completion button. Opening a recorded lesson syncs progress automatically so the purchased course flow stays clean for students.';
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

function resolveStageAsset(
  lecture: LectureItem | null,
  session: LiveSessionItem | null,
  mode: LearningDeliveryMode
): StageAsset {
  const candidates = [
    lecture?.videoUrl,
    lecture?.recordingUrl,
    mode !== 'recorded' ? session?.recordingUrl : '',
    mode !== 'recorded' ? session?.meetingUrl : '',
    lecture?.meetingUrl,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const media = resolveEmbeddableMedia(candidate);
    if (media) {
      return media;
    }
  }

  return { kind: 'placeholder', url: candidates[0] || '' };
}

function resolveEmbeddableMedia(url: string): StageAsset | null {
  if (!url) return null;

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { kind: 'video', url };
  }

  if (/youtube\.com\/embed\//i.test(url)) {
    return { kind: 'iframe', url };
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/i);
  if (shortMatch?.[1]) {
    return { kind: 'iframe', url: `https://www.youtube.com/embed/${shortMatch[1]}` };
  }

  const watchMatch = url.match(/[?&]v=([^?&]+)/i);
  if (/youtube\.com\/watch/i.test(url) && watchMatch?.[1]) {
    return { kind: 'iframe', url: `https://www.youtube.com/embed/${watchMatch[1]}` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return { kind: 'iframe', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return null;
}


