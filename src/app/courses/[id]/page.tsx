'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  Lock,
  Mail,
  Monitor,
  Phone,
  Play,
  Star,
  Target,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import { authFetchJson, loadScript, publicFetchJson } from '@/lib/backend-api';

type LectureItem = { id: string; title: string; duration?: string; isFree?: boolean; contentType?: string };
type ModuleItem = { id: string; label?: string; title: string; lectures: LectureItem[] };
type SubjectItem = { id: string; name: string; modules: ModuleItem[] };
type Mentor = { id: string; name: string; designation: string; company: string; experience: string; image?: string };
type PlanFeature = { label: string; value: string };
type CoursePlan = { id: string; name: string; price: number; isRecommended: boolean; features: PlanFeature[] };
type CourseOffering = { icon: string; title: string };
type FAQ = { question: string; answer: string };
type TestimonialItem = { name: string; role: string; company: string; quote: string; rating: number };
type CertificationItem = { name: string; provider: string };

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  bannerTag?: string;
  bannerSubtag?: string;
  bannerExtra?: string;
  price: number;
  originalPrice?: number;
  startDate?: string;
  duration?: string;
  deliveryMode?: string;
  language?: string;
  jobAssistance?: boolean;
  category?: string;
  supportEmail?: string;
  rating?: number;
  reviewCount?: number;
  studentsEnrolled?: number;
  stats?: { hiringPartners?: string; careerTransitions?: string; highestPackage?: string };
  offerings: CourseOffering[];
  requirements: string[];
  curriculum: SubjectItem[];
  mentors: Mentor[];
  plans: CoursePlan[];
  certifications: CertificationItem[];
  testimonials: TestimonialItem[];
  faqs: FAQ[];
};

type CourseResponse = { success: boolean; data: any };
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
    redirectUrl?: string;
  };
};
type VerifyResponse = { success: boolean; data: { enrollmentId: string; redirectUrl: string } };

const COURSE_SLUG_ALIASES: Record<string, string> = {
  '1': 'data-science-with-generative-ai-bootcamp',
  '$1': 'data-science-with-generative-ai-bootcamp',
  '2': 'excel-mother-of-business-intelligence',
  '$2': 'excel-mother-of-business-intelligence',
  'ds-gen-ai': 'data-science-with-generative-ai-bootcamp',
};

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'offerings', label: 'Offerings' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'mentors', label: 'Mentors' },
  { id: 'plans', label: 'Plans' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'testimonials', label: 'Testimonial' },
  { id: 'faqs', label: 'FAQs' },
] as const;

export default function CourseDetailPage() {
  const params = useParams();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  const courseSlug = COURSE_SLUG_ALIASES[routeId] || routeId;
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]['id']>('overview');
  const [activeSubject, setActiveSubject] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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
        setError('');
        const payload = await publicFetchJson<CourseResponse>(`/api/courses/${courseSlug}`);
        if (!active) return;
        const nextCourse = normalizeCourseDetail(payload.data);
        setCourse(nextCourse);
        setActiveSubject(0);
        setExpandedModule(nextCourse.curriculum[0]?.modules[0]?.id || null);
        setExpandedFaq(null);
        setPurchaseMessage('');
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError?.message || 'Unable to load course details');
        setCourse(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCourse();
    return () => {
      active = false;
    };
  }, [courseSlug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      const scrollPos = window.scrollY + 180;
      for (const section of SECTIONS) {
        const element = sectionRefs.current[section.id];
        if (!element) continue;
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentSubject = course?.curriculum[activeSubject];
  const defaultPlan = useMemo(() => course?.plans.find((plan) => plan.isRecommended) || course?.plans[0] || null, [course]);

  const scrollToSection = (sectionId: (typeof SECTIONS)[number]['id']) => {
    const element = sectionRefs.current[sectionId];
    if (!element) return;
    window.scrollTo({ top: element.offsetTop - 82, behavior: 'smooth' });
  };

  const handlePurchase = async (planName?: string) => {
    if (!course) return;
    const chosenPlan = planName || defaultPlan?.name;
    setPurchaseMessage('');
    setIsPurchasing(true);
    try {
      const orderPayload = await authFetchJson<OrderResponse>('/api/v1/payments/course-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, planName: chosenPlan || undefined }),
      });
      const order = orderPayload.data;
      if (order.mode === 'demo' || order.mode === 'already-enrolled') {
        router.push(order.redirectUrl || '/dashboard/student');
        return;
      }
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded || !(window as any).Razorpay) throw new Error('Unable to load Razorpay checkout');
      const razorpay = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.companyName || 'EDVO',
        description: course.title,
        order_id: order.orderId,
        theme: { color: order.themeColor || '#f97316' },
        handler: async (response: any) => {
          const verifyPayload = await authFetchJson<VerifyResponse>('/api/v1/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentRecordId: order.paymentId, courseId: course.id, planName: chosenPlan || undefined, ...response }),
          });
          router.push(verifyPayload.data.redirectUrl || '/dashboard/student');
        },
      });
      razorpay.open();
    } catch (purchaseError: any) {
      const message = purchaseError?.message || 'Unable to start checkout';
      setPurchaseMessage(message);
      if (message.toLowerCase().includes('log in')) router.push('/auth/login');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-950" />;
  if (!course) {
    return (
      <main className="min-h-screen bg-white px-4 py-20 text-center dark:bg-slate-950">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{error || 'This course could not be loaded.'}</p>
      </main>
    );
  }

  const roundedRating = Math.max(0, Math.min(5, Math.round(Number(course.rating || 5))));

  return (
    <main className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <section id="overview" ref={(el) => { sectionRefs.current.overview = el; }} className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent dark:from-primary-500/5" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="transition-colors hover:text-primary-600 dark:hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses" className="transition-colors hover:text-primary-600 dark:hover:text-white">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-slate-900 dark:text-white">{course.title}</span>
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <FadeIn>
                <h1 className="mb-4 text-3xl font-black leading-tight text-slate-900 dark:text-white md:text-4xl">{course.title}</h1>
                <p className="mb-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{course.description || course.shortDescription}</p>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < roundedRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">({course.reviewCount?.toLocaleString() || 0} ratings)</span>
                </div>

                <div className="mb-8 flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-600 dark:text-orange-300">Enroll Now!</span>
                  <button type="button" onClick={() => handlePurchase()} disabled={isPurchasing} className="rounded-xl bg-orange-500 px-8 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:bg-orange-600 disabled:opacity-60">
                    {isPurchasing ? 'Starting checkout...' : 'Buy now'}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(course.price)}</span>
                    {course.originalPrice ? <span className="text-lg font-medium text-slate-400 line-through dark:text-slate-500">{formatCurrency(course.originalPrice)}</span> : null}
                  </div>
                </div>

                {purchaseMessage ? (
                  <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                    {purchaseMessage}
                  </div>
                ) : null}
              </FadeIn>
            </div>

            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 p-6">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-600/30" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-600/30" />
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center gap-2">
                      <GraduationCap className="h-6 w-6 text-indigo-300" />
                      <span className="text-sm font-semibold uppercase tracking-wide text-indigo-200">{course.bannerTag || course.category || 'EDVO SKILLS'}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">{course.bannerSubtag || course.title}</h3>
                    <p className="mb-4 text-sm text-indigo-200">{course.bannerExtra || course.shortDescription || 'Industry-ready course path'}</p>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {course.plans.slice(0, 3).map((plan) => (
                        <span key={plan.id} className={`rounded px-2 py-1 text-xs ${plan.isRecommended ? 'bg-orange-500 font-semibold text-white' : 'bg-white/20 text-white'}`}>
                          {plan.name.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="text-2xl font-bold text-white">Starting at {formatCurrency(course.price)}/-</div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
            <InfoItem icon={<Calendar className="h-5 w-5" />} label="Starts" value={course.startDate || 'Anytime'} />
            <InfoItem icon={<Clock className="h-5 w-5" />} label="Duration" value={course.duration || 'Flexible'} />
            <InfoItem icon={<Monitor className="h-5 w-5" />} label="Format" value={formatDeliveryMode(course.deliveryMode)} />
            <InfoItem icon={<Globe className="h-5 w-5" />} label="Language" value={course.language || 'English'} />
            <InfoItem icon={<Users className="h-5 w-5" />} label="Learners" value={`${course.studentsEnrolled?.toLocaleString() || 0}+`} />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard icon={<Building2 className="h-8 w-8 text-indigo-500" />} value={course.stats?.hiringPartners || '350+'} label="Hiring Partners" />
            <StatCard icon={<Users className="h-8 w-8 text-orange-500" />} value={course.stats?.careerTransitions || `${course.studentsEnrolled?.toLocaleString() || 0}+`} label="Career Transitions" />
            <StatCard icon={<Award className="h-8 w-8 text-emerald-500" />} value={course.stats?.highestPackage || `${Number(course.rating || 0).toFixed(1)} Rating`} label="Top Outcome" />
          </div>
        </div>
      </section>

      <section id="offerings" ref={(el) => { sectionRefs.current.offerings = el; }} className="bg-gray-50 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Everything You Need to Succeed" /></FadeIn>
          {course.offerings.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {course.offerings.map((offering, index) => (
                <FadeIn key={`${offering.title}-${index}`} delay={index * 0.05}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
                      <OfferingIcon type={offering.icon || offering.title} className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{offering.title}</h3>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : <EmptyState text="Offerings will appear here when the admin adds them." />}

          {course.requirements.length ? (
            <div className="mt-10 rounded-2xl border border-orange-100 bg-white p-6 dark:border-orange-500/20 dark:bg-slate-900">
              <div className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Requirements</div>
              <div className="flex flex-wrap gap-3">
                {course.requirements.map((item) => (
                  <span key={item} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">{item}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="curriculum" ref={(el) => { sectionRefs.current.curriculum = el; }} className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Course Curriculum" /></FadeIn>
          <FadeIn>
            <div className="mb-8 flex flex-wrap gap-3">
              {course.curriculum.map((subject, index) => (
                <button key={subject.id} type="button" onClick={() => { setActiveSubject(index); setExpandedModule(subject.modules[0]?.id || null); }} className={`rounded-full px-5 py-3 text-sm font-semibold transition-all ${activeSubject === index ? 'bg-orange-500 text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>
                  {subject.name}
                </button>
              ))}
            </div>
          </FadeIn>
          {course.curriculum.length ? (
            <FadeIn>
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                  {currentSubject?.modules.map((module) => (
                    <button key={module.id} type="button" onClick={() => setExpandedModule(module.id)} className={`flex w-full items-center justify-between border-b border-gray-100 px-6 py-5 text-left transition-colors last:border-b-0 dark:border-slate-800 ${expandedModule === module.id ? 'border-l-4 border-l-orange-500 bg-white dark:bg-slate-900' : 'border-l-4 border-l-transparent hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      <div>
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-orange-500">{module.label || 'Module'}</div>
                        <div className={`font-semibold ${expandedModule === module.id ? 'text-orange-600 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>{module.title}</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${expandedModule === module.id ? 'text-orange-500' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
                  {(currentSubject?.modules.find((module) => module.id === expandedModule)?.lectures || []).length ? (
                    currentSubject?.modules.find((module) => module.id === expandedModule)?.lectures.map((lecture, index) => (
                      <motion.div key={lecture.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between border-b border-gray-100 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{lecture.title}</div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
                            {lecture.duration ? <span>{lecture.duration}</span> : null}
                            {lecture.contentType ? <span>{lecture.contentType}</span> : null}
                          </div>
                        </div>
                        {lecture.isFree ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20"><Play className="h-4 w-4 text-orange-500" /></div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"><Lock className="h-4 w-4 text-gray-400 dark:text-slate-500" /></div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-6"><EmptyState text="Lecture details will appear here when the admin adds curriculum rows." /></div>
                  )}
                </div>
              </div>
            </FadeIn>
          ) : <EmptyState text="Curriculum will appear here when the admin adds course rows." />}

          {course.supportEmail ? (
            <FadeIn>
              <div className="mt-10 flex justify-center">
                <a href={`mailto:${course.supportEmail}?subject=${encodeURIComponent(`Need curriculum for ${course.title}`)}`} className="group flex items-center gap-3 text-lg font-semibold text-orange-500 transition-colors hover:text-orange-600">
                  Download Curriculum
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 transition-colors group-hover:bg-orange-200 dark:bg-orange-500/10 dark:group-hover:bg-orange-500/20">
                    <Download className="h-5 w-5" />
                  </div>
                </a>
              </div>
            </FadeIn>
          ) : null}
        </div>
      </section>

      <section id="mentors" ref={(el) => { sectionRefs.current.mentors = el; }} className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Learn From Industry Experts" /></FadeIn>
          {course.mentors.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {course.mentors.map((mentor, index) => (
                <FadeIn key={mentor.id} delay={index * 0.08}>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-3xl font-bold text-white shadow-lg">
                        {mentor.name.charAt(0)}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{mentor.name}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{mentor.designation}</p>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><Building2 className="h-4 w-4" /><span>{mentor.company || 'EDVO'}</span></div>
                        {mentor.experience ? <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{mentor.experience}</span> : null}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : <EmptyState text="Mentors will appear here when the admin adds them." />}
        </div>
      </section>

      <section id="plans" ref={(el) => { sectionRefs.current.plans = el; }} className="bg-gray-50 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Customize Your Growth: Course Plan Options" /></FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {course.plans.map((plan, index) => (
              <FadeIn key={plan.id} delay={index * 0.08}>
                <div className={`relative rounded-2xl border-2 bg-white p-8 transition-all duration-300 dark:bg-slate-900 ${plan.isRecommended ? 'border-orange-500 shadow-xl shadow-orange-500/10' : 'border-gray-200 dark:border-slate-800'}`}>
                  {plan.isRecommended ? <span className="absolute -top-3 right-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">Recommended</span> : null}
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${plan.name.toLowerCase().includes('basic') ? 'bg-rose-100 text-rose-500' : plan.name.toLowerCase().includes('premium') ? 'bg-blue-100 text-blue-500' : 'bg-purple-100 text-purple-500'}`}>
                    {plan.name.toLowerCase().includes('basic') ? <BookOpen className="h-5 w-5" /> : plan.name.toLowerCase().includes('premium') ? <Award className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="mb-2 flex items-baseline gap-1"><span className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(plan.price)}</span></div>
                  <p className="mb-6 text-sm font-medium text-orange-600 dark:text-orange-400">Enroll Now!</p>
                  <button type="button" onClick={() => handlePurchase(plan.name)} disabled={isPurchasing} className={`mb-8 w-full rounded-lg py-3 font-semibold transition-colors disabled:opacity-60 ${plan.isRecommended ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                    {isPurchasing && defaultPlan?.name === plan.name ? 'Starting checkout...' : 'Buy now'}
                  </button>
                  <div className="space-y-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={`${plan.id}-${feature.label}-${featureIndex}`}>
                        <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{feature.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{feature.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section id="certifications" ref={(el) => { sectionRefs.current.certifications = el; }} className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Industry-Recognized Certifications" /></FadeIn>
          {course.certifications.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {course.certifications.map((certificate, index) => (
                <FadeIn key={`${certificate.name}-${index}`} delay={index * 0.08}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10"><Award className="h-8 w-8 text-indigo-500" /></div>
                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{certificate.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{certificate.provider}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : <EmptyState text="Certificates will appear here when the admin adds them." />}
        </div>
      </section>

      <section id="testimonials" ref={(el) => { sectionRefs.current.testimonials = el; }} className="bg-gray-50 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="What Our Students Say" /></FadeIn>
          {course.testimonials.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {course.testimonials.map((testimonial, index) => (
                <FadeIn key={`${testimonial.name}-${index}`} delay={index * 0.08}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className={`h-4 w-4 ${starIndex < Math.round(testimonial.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-slate-800'}`} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">{testimonial.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role} {testimonial.company ? `at ${testimonial.company}` : ''}</div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : <EmptyState text="Student testimonials will appear here when the admin adds them." />}
        </div>
      </section>

      <section id="faqs" ref={(el) => { sectionRefs.current.faqs = el; }} className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading title="Frequently Asked Questions" /></FadeIn>
          {course.faqs.length ? (
            <div className="max-w-3xl space-y-4">
              {course.faqs.map((faq, index) => (
                <FadeIn key={`${faq.question}-${index}`} delay={index * 0.05}>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <button type="button" onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800">
                      <span className="pr-4 font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform dark:text-slate-500 ${expandedFaq === index ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index ? (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="border-t border-gray-100 px-6 pb-5 pt-4 leading-relaxed text-gray-600 dark:border-slate-800 dark:text-gray-400">{faq.answer}</div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : <EmptyState text="FAQs will appear here when the admin adds them." />}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <ArrowUp className="h-4 w-4" />
            </button>
            {SECTIONS.map((section) => (
              <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${activeSection === section.id ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-orange-600 dark:text-slate-300 dark:hover:text-white'}`}>
                {section.label}
              </button>
            ))}
            <button type="button" onClick={() => handlePurchase()} disabled={isPurchasing} className="ml-1 flex-shrink-0 whitespace-nowrap rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60">
              {isPurchasing ? 'Starting checkout...' : 'Buy now'}
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />

      <AnimatePresence>
        {showScrollTop ? (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-colors hover:bg-orange-600">
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function normalizeCourseDetail(data: any): CourseDetail {
  const requirements = Array.isArray(data?.requirements) ? data.requirements.filter(Boolean) : [];
  const curriculum = Array.isArray(data?.curriculum) ? data.curriculum : [];
  const mentors = Array.isArray(data?.mentors) ? data.mentors : [];
  const plans = Array.isArray(data?.plans) ? data.plans : [];
  const offerings = Array.isArray(data?.offerings) ? data.offerings : [];
  const featured = Array.isArray(data?.featuredOutcomes) ? data.featuredOutcomes : [];
  const learn = Array.isArray(data?.whatYouWillLearn) ? data.whatYouWillLearn : [];

  return {
    id: String(data?.id || data?._id || data?.slug || 'course'),
    title: data?.title || 'Course',
    slug: data?.slug || 'course',
    description: data?.description || data?.shortDescription || '',
    shortDescription: data?.shortDescription || '',
    bannerTag: data?.bannerTag || '',
    bannerSubtag: data?.bannerSubtag || '',
    bannerExtra: data?.bannerExtra || '',
    price: Number(data?.price || 0),
    originalPrice: Number(data?.originalPrice || 0) || undefined,
    startDate: data?.startDate || '',
    duration: data?.duration || '',
    deliveryMode: data?.deliveryMode || data?.delivery || 'recorded',
    language: data?.language || 'English',
    jobAssistance: Boolean(data?.jobAssistance),
    category: data?.category || '',
    supportEmail: data?.supportEmail || '',
    rating: Number(data?.rating || 0),
    reviewCount: Number(data?.reviewCount || 0),
    studentsEnrolled: Number(data?.studentsEnrolled || 0),
    stats: data?.stats || {},    offerings: offerings.length
      ? offerings.map((item: any, index: number) => ({ icon: String(item?.icon || item?.title || 'zap'), title: String(item?.title || `Offering ${index + 1}`) }))
      : [...featured, ...learn].filter(Boolean).map((title: string, index: number) => ({ icon: index % 2 === 0 ? 'target' : 'zap', title })),
    requirements,
    curriculum: curriculum.map((subject: any, subjectIndex: number) => ({
      id: String(subject?.id || `subject-${subjectIndex + 1}`),
      name: String(subject?.name || `Subject ${subjectIndex + 1}`),
      modules: Array.isArray(subject?.modules)
        ? subject.modules.map((module: any, moduleIndex: number) => ({
            id: String(module?.id || `module-${subjectIndex + 1}-${moduleIndex + 1}`),
            label: String(module?.label || `Module ${moduleIndex + 1}`),
            title: String(module?.title || `Module ${moduleIndex + 1}`),
            lectures: Array.isArray(module?.lectures)
              ? module.lectures.map((lecture: any, lectureIndex: number) => ({
                  id: String(lecture?.id || `lecture-${subjectIndex + 1}-${moduleIndex + 1}-${lectureIndex + 1}`),
                  title: String(lecture?.title || `Lecture ${lectureIndex + 1}`),
                  duration: lecture?.duration ? String(lecture.duration) : '',
                  isFree: Boolean(lecture?.isFree),
                  contentType: lecture?.contentType ? String(lecture.contentType) : '',
                }))
              : [],
          }))
        : [],
    })),
    mentors: mentors.map((mentor: any, index: number) => ({
      id: String(mentor?.id || `mentor-${index + 1}`),
      name: String(mentor?.name || `Mentor ${index + 1}`),
      designation: String(mentor?.designation || ''),
      company: String(mentor?.company || 'EDVO'),
      experience: String(mentor?.experience || ''),
      image: String(mentor?.image || ''),
    })),
    plans: plans.length
      ? plans.map((plan: any, index: number) => ({
          id: String(plan?._id || plan?.id || `plan-${index + 1}`),
          name: String(plan?.name || `Plan ${index + 1}`),
          price: Number(plan?.price || 0),
          isRecommended: Boolean(plan?.isRecommended),
          features: Array.isArray(plan?.features)
            ? plan.features.map((feature: any, featureIndex: number) => ({
                label: String(feature?.label || `Feature ${featureIndex + 1}`),
                value: String(feature?.value || ''),
              }))
            : [],
        }))
      : [{ id: 'core-access', name: 'Core Access', price: Number(data?.price || 0), isRecommended: true, features: [{ label: 'Course access', value: String(data?.shortDescription || data?.description || 'Full course access') }, { label: 'Format', value: formatDeliveryMode(data?.deliveryMode || data?.delivery || 'recorded') }, { label: 'Duration', value: String(data?.duration || 'Flexible duration') }] }],
    certifications: Array.isArray(data?.certifications) ? data.certifications.map((certificate: any, index: number) => ({ name: String(certificate?.name || `Certification ${index + 1}`), provider: String(certificate?.provider || '') })) : [],
    testimonials: Array.isArray(data?.testimonials) ? data.testimonials.map((testimonial: any, index: number) => ({ name: String(testimonial?.name || `Learner ${index + 1}`), role: String(testimonial?.role || ''), company: String(testimonial?.company || ''), quote: String(testimonial?.quote || ''), rating: Number(testimonial?.rating || 5) })) : [],
    faqs: Array.isArray(data?.faqs) ? data.faqs.map((faq: any, index: number) => ({ question: String(faq?.question || `Question ${index + 1}`), answer: String(faq?.answer || '') })) : [],
  };
}

function OfferingIcon({ type, className }: { type: string; className?: string }) {
  const value = String(type || '').toLowerCase();
  const classes = className || 'h-6 w-6';
  if (value.includes('book') || value.includes('curriculum')) return <BookOpen className={classes} />;
  if (value.includes('laptop') || value.includes('content') || value.includes('recorded')) return <Monitor className={classes} />;
  if (value.includes('video') || value.includes('live') || value.includes('session')) return <Video className={classes} />;
  if (value.includes('target') || value.includes('project') || value.includes('capstone')) return <Target className={classes} />;
  if (value.includes('code') || value.includes('practice')) return <Code className={classes} />;
  if (value.includes('file') || value.includes('assignment') || value.includes('resource') || value.includes('case')) return <FileText className={classes} />;
  if (value.includes('award') || value.includes('certificate')) return <Award className={classes} />;
  if (value.includes('briefcase') || value.includes('career') || value.includes('interview') || value.includes('job')) return <Briefcase className={classes} />;
  if (value.includes('mail') || value.includes('email')) return <Mail className={classes} />;
  if (value.includes('headphone') || value.includes('support') || value.includes('doubt')) return <Headphones className={classes} />;
  if (value.includes('phone') || value.includes('talk')) return <Phone className={classes} />;
  return <Zap className={classes} />;
}

function SectionHeading({ title }: { title: string }) {
  return <div className="mb-10 flex items-center gap-3"><div className="h-10 w-1 rounded-full bg-orange-500" /><h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{title}</h2></div>;
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl px-4 py-4"><div className="text-slate-400 dark:text-slate-500">{icon}</div><div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div><div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div></div></div>;
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex justify-center">{icon}</div><div className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</div><div className="text-gray-500 dark:text-gray-400">{label}</div></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{text}</div>;
}

function formatDeliveryMode(mode?: string) {
  const value = String(mode || 'recorded').toLowerCase();
  if (value === 'live') return 'Live';
  if (value === 'hybrid') return 'Hybrid';
  return 'Recorded';
}

function formatCurrency(value: number) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}
