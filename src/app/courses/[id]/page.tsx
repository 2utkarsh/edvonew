'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Lock,
  ChevronDown,
  Calendar,
  Clock,
  Monitor,
  Globe,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  RadioTower,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import { authFetchJson, loadScript, publicFetchJson } from '@/lib/backend-api';

type LectureItem = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  videoUrl?: string;
  resourceUrl?: string;
  notes?: string;
  isFree?: boolean;
  contentType?: string;
};

type ModuleItem = {
  id: string;
  label?: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  lectures: LectureItem[];
};

type SubjectItem = {
  id: string;
  name: string;
  description?: string;
  modules: ModuleItem[];
};

type SessionItem = {
  id: string;
  title: string;
  description?: string;
  hostName?: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  attendanceRequired?: boolean;
  status?: string;
};

type CoursePlan = {
  _id?: string;
  name: string;
  price: number;
  isRecommended?: boolean;
  features?: { label?: string; value?: string }[];
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: string;
  level?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  startDate?: string;
  duration?: string;
  deliveryMode?: string;
  language?: string;
  jobAssistance?: boolean;
  bannerTag?: string;
  bannerSubtag?: string;
  bannerExtra?: string;
  cohortLabel?: string;
  supportEmail?: string;
  stats?: {
    hiringPartners?: string;
    careerTransitions?: string;
    highestPackage?: string;
  };
  whatYouWillLearn?: string[];
  featuredOutcomes?: string[];
  requirements?: string[];
  curriculum: SubjectItem[];
  liveSessions?: SessionItem[];
  mentors?: { name?: string; designation?: string; company?: string; experience?: string }[];
  plans?: CoursePlan[];
  offerings?: { title?: string }[];
  faqs?: { question?: string; answer?: string }[];
  testimonials?: { name?: string; role?: string; company?: string; quote?: string; rating?: number }[];
  certifications?: { name?: string; provider?: string }[];
  certificateSettings?: { enabled?: boolean };
  rating?: number;
  reviewCount?: number;
  studentsEnrolled?: number;
};

type CourseResponse = {
  success: boolean;
  data: CourseDetail;
};

type OrderResponse = {
  success: boolean;
  data: {
    mode: 'razorpay' | 'demo' | 'already-enrolled';
    paymentId?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
    companyName?: string;
    themeColor?: string;
    enrollmentId?: string;
    redirectUrl?: string;
  };
};

type VerifyResponse = {
  success: boolean;
  data: {
    enrollmentId: string;
    redirectUrl: string;
  };
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      if (!courseSlug) {
        setError('Course not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const payload = await publicFetchJson<CourseResponse>(`/api/courses/${courseSlug}`);
        if (!active) return;

        const nextCourse = payload.data;
        setCourse(nextCourse);
        setSelectedPlan(nextCourse.plans?.[0]?.name || '');
        setExpandedModule(nextCourse.curriculum?.[0]?.modules?.[0]?.id || null);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError?.message || 'Unable to load course details');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourse();
    return () => {
      active = false;
    };
  }, [courseSlug]);

  const activeSubject = course?.curriculum?.[activeSubjectIndex];

  const selectedPlanData = useMemo(() => {
    return course?.plans?.find((plan) => plan.name === selectedPlan) || course?.plans?.[0] || null;
  }, [course?.plans, selectedPlan]);

  const liveSessions = useMemo(() => {
    return [...(course?.liveSessions || [])].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [course?.liveSessions]);

  const handlePurchase = async () => {
    if (!course) return;

    setPurchaseMessage('');
    setIsPurchasing(true);
    try {
      const orderPayload = await authFetchJson<OrderResponse>('/api/v1/payments/course-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, planName: selectedPlanData?.name || selectedPlan }),
      });

      const order = orderPayload.data;
      if (order.mode === 'demo' || order.mode === 'already-enrolled') {
        router.push(order.redirectUrl || '/dashboard/student');
        return;
      }

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded || !(window as any).Razorpay) {
        throw new Error('Unable to load Razorpay checkout');
      }

      const razorpay = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.companyName || 'EDVO',
        description: course.title,
        order_id: order.orderId,
        theme: { color: order.themeColor || '#c17017' },
        handler: async (response: any) => {
          const verifyPayload = await authFetchJson<VerifyResponse>('/api/v1/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentRecordId: order.paymentId,
              courseId: course.id,
              planName: selectedPlanData?.name || selectedPlan,
              ...response,
            }),
          });

          router.push(verifyPayload.data.redirectUrl || '/dashboard/student');
        },
      });

      razorpay.open();
    } catch (purchaseError: any) {
      const message = purchaseError?.message || 'Unable to start checkout';
      setPurchaseMessage(message);
      if (message.toLowerCase().includes('log in')) {
        router.push('/auth/login');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{error || 'This course could not be loaded.'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 pb-24">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(193,112,23,0.16),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#fff7ed_45%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(193,112,23,0.18),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr] items-start">
            <FadeIn>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm dark:bg-white/10 dark:text-amber-200">
                  <Sparkles className="h-4 w-4" />
                  {course.bannerTag || 'Career Accelerator'}
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  {course.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  {course.description}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={<Calendar className="h-5 w-5" />} label="Starts" value={course.startDate || 'Anytime'} />
                  <StatCard icon={<Clock className="h-5 w-5" />} label="Duration" value={course.duration || 'Flexible'} />
                  <StatCard icon={<Monitor className="h-5 w-5" />} label="Format" value={formatDeliveryMode(course.deliveryMode)} />
                  <StatCard icon={<Award className="h-5 w-5" />} label="Certificate" value={course.certificateSettings?.enabled === false ? 'Optional' : 'Included'} />
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <InfoChip icon={<Users className="h-4 w-4" />} text={`${course.studentsEnrolled || 0}+ learners`} />
                  <InfoChip icon={<RadioTower className="h-4 w-4" />} text={`${liveSessions.length} scheduled live sessions`} />
                  <InfoChip icon={<Globe className="h-4 w-4" />} text={course.language || 'English'} />
                  {course.jobAssistance ? <InfoChip icon={<Briefcase className="h-4 w-4" />} text="Job assistance included" /> : null}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-[2rem] border border-amber-100 bg-white/90 p-6 shadow-2xl shadow-amber-100/50 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">Enroll</p>
                <div className="mt-3 flex items-end gap-3">
                  <div className="text-4xl font-black text-slate-900 dark:text-white">Rs {(selectedPlanData?.price ?? course.price).toLocaleString()}</div>
                  {course.originalPrice ? <div className="pb-1 text-lg text-slate-400 line-through">Rs {course.originalPrice.toLocaleString()}</div> : null}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{course.bannerSubtag || 'Managed from admin with live payment and dashboard unlocks.'}</p>

                {course.plans?.length ? (
                  <div className="mt-6 space-y-3">
                    {course.plans.map((plan) => (
                      <button
                        key={plan.name}
                        onClick={() => setSelectedPlan(plan.name)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${selectedPlan === plan.name
                          ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{plan.name}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.features?.[0]?.value || 'Structured course access'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">Rs {plan.price.toLocaleString()}</div>
                            {plan.isRecommended ? <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">Recommended</span> : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/30 transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {isPurchasing ? 'Starting checkout...' : 'Buy now'}
                </button>
                {purchaseMessage ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{purchaseMessage}</p> : null}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {course.stats?.hiringPartners ? <MiniMetric label="Hiring partners" value={course.stats.hiringPartners} /> : null}
                  {course.stats?.careerTransitions ? <MiniMetric label="Transitions" value={course.stats.careerTransitions} /> : null}
                  {course.stats?.highestPackage ? <MiniMetric label="Highest package" value={course.stats.highestPackage} /> : null}
                  <MiniMetric label="Rating" value={`${Number(course.rating || 0).toFixed(1)} / 5`} />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
        <div className="space-y-12">
          <FadeIn>
            <SectionTitle title="What you will learn" subtitle="Everything here is now rendered from the backend course record." />
            <div className="grid gap-4 md:grid-cols-2">
              {(course.whatYouWillLearn || course.featuredOutcomes || []).map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <SectionTitle title="Recorded learning modules" subtitle="Structured module flow for recorded and hybrid courses." />
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-5 flex flex-wrap gap-3">
                {course.curriculum.map((subject, index) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setActiveSubjectIndex(index);
                      setExpandedModule(subject.modules?.[0]?.id || null);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeSubjectIndex === index
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  {activeSubject?.modules?.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setExpandedModule(module.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${expandedModule === module.id
                        ? 'border-amber-400 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">{module.label || 'Module'}</div>
                      <div className="mt-2 font-semibold text-slate-900 dark:text-white">{module.title}</div>
                      {module.description ? <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{module.description}</div> : null}
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  {(activeSubject?.modules || [])
                    .find((module) => module.id === expandedModule)
                    ?.lectures.map((lecture) => (
                      <div key={lecture.id} className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{lecture.title}</div>
                          {lecture.description ? <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lecture.description}</div> : null}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {lecture.duration ? <span>{lecture.duration}</span> : null}
                            <span>{lecture.contentType || 'recorded'}</span>
                          </div>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${lecture.isFree ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {lecture.isFree ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <SectionTitle title="Live sessions and timings" subtitle="Live links open only when the session window is active." />
            <div className="grid gap-4">
              {liveSessions.length ? liveSessions.map((session) => (
                <div key={session.id} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${session.status === 'live' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' : session.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {session.status || 'scheduled'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{formatSessionTime(session.startTime, session.timezone)}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{session.title}</h3>
                      {session.description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{session.description}</p> : null}
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
                      <div className="font-semibold text-slate-900 dark:text-white">{session.hostName || 'EDVO Mentor'}</div>
                      <div className="mt-1 text-slate-500 dark:text-slate-400">Attendance {session.attendanceRequired === false ? 'optional' : 'tracked from dashboard'}</div>
                    </div>
                  </div>
                </div>
              )) : <EmptyBox text="No live sessions are scheduled for this course yet." />}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <SectionTitle title="Frequently asked questions" subtitle="All FAQs are now dynamic from admin." />
            <div className="space-y-3">
              {(course.faqs || []).map((faq, index) => (
                <div key={`${faq.question}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition ${expandedFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === index ? <div className="border-t border-slate-100 px-6 pb-5 pt-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:text-slate-300">{faq.answer}</div> : null}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="space-y-8">
          <FadeIn delay={0.05}>
            <SidebarCard title="Why learners choose this">
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {(course.offerings || []).map((item, index) => (
                  <li key={`${item.title}-${index}`} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </SidebarCard>
          </FadeIn>

          <FadeIn delay={0.1}>
            <SidebarCard title="Mentors and support">
              <div className="space-y-4">
                {(course.mentors || []).map((mentor, index) => (
                  <div key={`${mentor.name}-${index}`} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="font-semibold text-slate-900 dark:text-white">{mentor.name}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{mentor.designation}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">{mentor.company} {mentor.experience ? ` -  ${mentor.experience}` : ''}</div>
                  </div>
                ))}
                {course.supportEmail ? <div className="text-sm text-slate-500 dark:text-slate-400">Support: {course.supportEmail}</div> : null}
              </div>
            </SidebarCard>
          </FadeIn>

          <FadeIn delay={0.15}>
            <SidebarCard title="Certificates">
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {(course.certifications || []).length ? (
                  (course.certifications || []).map((certificate, index) => (
                    <div key={`${certificate.name}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="font-semibold text-slate-900 dark:text-white">{certificate.name}</div>
                      {certificate.provider ? <div className="mt-1 text-slate-500 dark:text-slate-400">{certificate.provider}</div> : null}
                    </div>
                  ))
                ) : (
                  <EmptyBox text="Certificate details will appear here when the admin enables them." />
                )}
              </div>
            </SidebarCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <SidebarCard title="Learner voices">
              <div className="space-y-4">
                {(course.testimonials || []).slice(0, 3).map((testimonial, index) => (
                  <div key={`${testimonial.name}-${index}`} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">&quot;{testimonial.quote}&quot;</div>
                    <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{testimonial.role} {testimonial.company ? ` -  ${testimonial.company}` : ''}</div>
                  </div>
                ))}
              </div>
            </SidebarCard>
          </FadeIn>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{formatDeliveryMode(course.deliveryMode)}</div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Rs {(selectedPlanData?.price ?? course.price).toLocaleString()}</div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {isPurchasing ? 'Starting checkout...' : 'Enroll now'}
          </button>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{icon}<span>{label}</span></div>
      <div className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
      {icon}
      {text}
    </span>
  );
}

function EmptyBox({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{text}</div>;
}

function formatDeliveryMode(mode?: string) {
  const value = (mode || 'recorded').toLowerCase();
  if (value === 'live') return 'Live course';
  if (value === 'hybrid') return 'Hybrid course';
  return 'Recorded course';
}

function formatSessionTime(startTime: string, timezone?: string) {
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return startTime;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone || 'Asia/Kolkata',
  }).format(date);
}
