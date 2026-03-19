'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, Star, Globe, Award, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CourseShowcaseCard from '@/components/marketing/CourseShowcaseCard';
import { FadeIn, StaggerGrid } from '@/components/animations';
import { SocialStats } from '@/components/home';

const CareerTransformationsSection = dynamic(() => import('@/components/home/career-transformations-section'));
const DataAnalyticsSection = dynamic(() =>
  import('@/components/home/course-categories-section').then((mod) => ({ default: mod.DataAnalyticsSection }))
);
const AIDataScienceSection = dynamic(() =>
  import('@/components/home/course-categories-section').then((mod) => ({ default: mod.AIDataScienceSection }))
);
const ProfessionalSkillsSection = dynamic(() =>
  import('@/components/home/course-categories-section').then((mod) => ({ default: mod.ProfessionalSkillsSection }))
);
const InstructorsSection = dynamic(() => import('@/components/home/instructors-section'));
const CinematicSection = dynamic(() => import('@/components/home/cinematic-section'));
const JobReadyPortfoliosSection = dynamic(() => import('@/components/home/job-ready-portfolios-section'));
const YouTubeSection = dynamic(() => import('@/components/home/youtube-section'));
const FreeCoursesSection = dynamic(() => import('@/components/home/free-courses-section'));
const HiringPartnersSection = dynamic(() => import('@/components/home/hiring-partners-section'));
const TestimonialsSection = dynamic(() => import('@/components/home/testimonials-section'));

type HeroSlide = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  chips: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  note: string;
  panelTitle: string;
  panelBody: string;
  theme: {
    shell: string;
    glow: string;
    accent: string;
  };
};

const heroSlides: HeroSlide[] = [
  {
    eyebrow: 'LIVE COHORT STARTED ON 7TH MARCH',
    title: 'AI Engineering Bootcamp',
    accent: 'Go from Software Engineer to AI Engineer in 75 Days',
    description: 'A project-first roadmap covering orchestration, agents, deployment, and real production-style workflows.',
    chips: ['BUILD', 'ORCHESTRATE', 'DISTRIBUTE'],
    primaryCta: { label: 'Explore Bootcamp', href: '/bootcamps' },
    secondaryCta: { label: 'Watch Demo', href: '/about' },
    note: 'Enrollments open until 13th March, 2026',
    panelTitle: 'Recordings Available',
    panelBody: 'Live sessions, guided build-alongs, mock interviews, and mentor checkpoints in one flagship cohort.',
    theme: {
      shell: 'from-[#eff6ff] via-white to-[#f8fafc] dark:from-[#0d1630] dark:via-[#131d40] dark:to-[#081024]',
      glow: 'from-blue-500/20 via-orange-500/10 to-transparent dark:from-blue-500/15 dark:via-orange-500/10',
      accent: 'text-orange-600 dark:text-orange-400',
    },
  },
  {
    eyebrow: 'FLAGSHIP DATA ANALYTICS TRACK',
    title: 'Data Analytics Career Accelerator',
    accent: 'Master Excel, SQL, Power BI, Python, and stakeholder storytelling',
    description: 'Everything needed to move from confusion to dashboard-ready execution with portfolio projects that feel interview-ready.',
    chips: ['ANALYZE', 'VISUALIZE', 'PRESENT'],
    primaryCta: { label: 'View Analytics Track', href: '/courses' },
    secondaryCta: { label: 'See Outcomes', href: '/alumni' },
    note: 'Built for beginners, career switchers, and working professionals',
    panelTitle: 'Project + Placement Focused',
    panelBody: 'Structured modules, guided capstones, resume proof, and review loops that keep learners shipping real work.',
    theme: {
      shell: 'from-[#f0f9ff] via-[#f8fafc] to-[#eff6ff] dark:from-[#0b1b3d] dark:via-[#10234a] dark:to-[#0a1532]',
      glow: 'from-blue-400/20 via-primary-500/10 to-transparent dark:from-blue-500/20 dark:via-primary-500/10',
      accent: 'text-primary-600 dark:text-primary-400',
    },
  },
  {
    eyebrow: 'COMMUNITY + CAREER MOMENTUM',
    title: 'Learn With Momentum, Not Guesswork',
    accent: 'Courses, challenges, mentors, and hiring support inside one focused ecosystem',
    description: 'Stop stitching together random tutorials. Follow one intentional path that moves you from skill building to visible outcomes.',
    chips: ['LEARN', 'BUILD', 'GET HIRED'],
    primaryCta: { label: 'Explore Courses', href: '/courses' },
    secondaryCta: { label: 'Browse Jobs', href: '/jobs' },
    note: 'Trusted by learners leveling up across analytics, AI, and software tracks',
    panelTitle: 'One Product, End to End',
    panelBody: 'From concept videos to project reviews and job-facing assets, the learner journey stays connected from start to finish.',
    theme: {
      shell: 'from-[#faf5ff] via-white to-[#f0f9ff] dark:from-[#111129] dark:via-[#151c3d] dark:to-[#0c152e]',
      glow: 'from-orange-500/10 via-blue-500/10 to-transparent dark:from-orange-500/10 dark:via-blue-500/10',
      accent: 'text-orange-600 dark:text-orange-400',
    },
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 9000);

    return () => window.clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Interactive Learning',
      description: 'Engage with hands-on projects, quizzes, and real-world challenges that reinforce your learning.',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Join learners from 190+ countries. Collaborate, share knowledge, and grow together.',
      color: 'from-primary-500 to-primary-700',
    },
    {
      icon: Award,
      title: 'Industry Certificates',
      description: 'Earn recognized certificates upon completion to boost your career prospects.',
      color: 'from-primary-600 to-accent-500',
    },
    {
      icon: CheckCircle,
      title: 'Career Support',
      description: 'Get personalized career guidance, resume reviews, and interview preparation.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const topCourses = [
    {
      title: 'MBA Career Accelerator',
      subtitle: 'Build business strategy, finance, operations, and leadership skills with practical case-based learning.',
      category: 'MBA',
      levelLabel: 'Career Track',
      instructor: 'Dr. Radhika Mehta',
      rating: '4.8',
      reviewsText: '4.2k',
      studentsText: '89,543 enrolled',
      price: '₹2,999',
      originalPrice: '₹7,999',
      discountLabel: '63% OFF',
      duration: '24 weeks',
      lectures: '62 lessons',
      projects: '8 case studies',
      badge: 'Bestseller',
      palette: 'blue' as const,
    },
    {
      title: 'Computer Science Foundations',
      subtitle: 'Cover programming, data structures, algorithms, systems, and core problem-solving for modern tech roles.',
      category: 'CS',
      levelLabel: 'Beginner to Advanced',
      instructor: 'Prof. Arjun Nair',
      rating: '4.9',
      reviewsText: '6.1k',
      studentsText: '125,000 enrolled',
      price: '₹4,999',
      originalPrice: '₹12,999',
      discountLabel: '61% OFF',
      duration: '32 weeks',
      lectures: '96 lessons',
      projects: '18 coding labs',
      badge: 'Popular',
      palette: 'violet' as const,
    },
  ];

  const currentSlide = heroSlides[activeSlide];

  return (
    <main className="min-h-screen">
      <section className="relative bg-slate-50 dark:bg-slate-950 px-4 pt-0 pb-16 transition-colors duration-300">
        <div className="mx-auto max-w-[1400px]">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/50 shadow-2xl ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-900/50 dark:ring-white/5 transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`relative grid min-h-[320px] gap-6 overflow-hidden bg-gradient-to-br ${currentSlide.theme.shell} px-6 pt-8 pb-14 sm:pb-16 lg:grid-cols-2 lg:px-10 lg:pt-10 lg:pb-24`}
              >

                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.theme.glow}`} />
                <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute left-10 bottom-0 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col items-start justify-center">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 dark:border-white/10 dark:bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-800 dark:text-white backdrop-blur-md transition-colors duration-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                    </span>
                    {currentSlide.eyebrow}
                  </div>
                  
                  <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm md:text-4xl lg:text-[2.75rem] lg:leading-[1.15] transition-colors duration-300">
                    {currentSlide.title}
                  </h1>
                  
                  <p className={`mt-2 max-w-2xl text-base font-medium tracking-wide ${currentSlide.theme.accent} sm:text-lg transition-colors duration-300`}>
                    {currentSlide.accent}
                  </p>
                  
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 transition-colors duration-300">
                    {currentSlide.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {currentSlide.chips.map((chip) => (
                      <span key={chip} className="rounded-lg bg-slate-100 dark:bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-700 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-white/20 backdrop-blur-sm transition-colors hover:bg-slate-200 dark:hover:bg-white/20">
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <Link href={currentSlide.primaryCta.href} className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" className="h-11 w-full !rounded-full px-6 text-sm font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:w-auto">
                        {currentSlide.primaryCta.label}
                      </Button>
                    </Link>
                    <Link href={currentSlide.secondaryCta.href} className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="h-11 w-full !rounded-full border-slate-300 dark:!border-white/20 px-6 text-sm font-bold text-slate-700 dark:!text-white backdrop-blur-sm transition-all hover:bg-slate-100 dark:hover:!bg-white/10 sm:w-auto">
                        <Play className="mr-2 h-4 w-4" />
                        {currentSlide.secondaryCta.label}
                      </Button>
                    </Link>
                  </div>
                  
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{currentSlide.note}</p>
                </div>

                <div className="relative z-10 hidden items-center justify-end lg:flex">
                  <div className="relative w-full max-w-md">
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-orange-500/0 opacity-20 blur-lg dark:from-white/20 dark:to-white/0" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0A0D1F]/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-colors duration-300">
                      
                      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4 transition-colors duration-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-inner">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{currentSlide.panelTitle}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">EDVO Flagship Learning</p>
                        </div>
                      </div>
                      
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 transition-colors duration-300">{currentSlide.panelBody}</p>
                      
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mode</p>
                          <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Live + Recorded</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Projects</p>
                          <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Portfolio-first</p>
                        </div>
                        <div className="col-span-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Support</p>
                          <p className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">Mentor led</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute right-8 z-20 hidden items-center gap-2 lg:flex lg:bottom-20">
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-[#0A0D1F]/80 text-slate-700 dark:text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white dark:hover:bg-white hover:text-slate-900"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                type="button"
                aria-label="Next banner"
                onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-[#0A0D1F]/80 text-slate-700 dark:text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white dark:hover:bg-white hover:text-slate-900"
              >
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="absolute left-8 z-20 flex gap-2 bottom-12 sm:bottom-16 lg:bottom-20">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Go to banner ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === activeSlide ? 'w-8 bg-slate-800 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          <SocialStats className="relative z-30 -mt-8 sm:-mt-12 lg:-mt-16 transform" />
        </div>
      </section>

      <section className="bg-white pb-24 pt-20 dark:bg-slate-950 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-16 text-center">
              <Badge variant="info" className="mb-4">Why Choose EDVO?</Badge>
              <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                Everything You Need to <span className="gradient-text">Succeed</span>
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400">
                We provide a complete learning ecosystem designed to help you learn, practice, and grow.
              </p>
            </div>
          </FadeIn>

          <StaggerGrid staggerDelay={0.15}>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="group !p-8 text-center">
                  <motion.div
                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color}`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="mb-3 text-xl font-bold dark:text-white">{feature.title}</h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </StaggerGrid>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white py-24 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge variant="gradient" className="mb-4">Top Courses</Badge>
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  Popular Among <span className="gradient-text">Learners</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Discover our highest-rated courses taught by industry experts
                </p>
              </div>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="group">
                  View All Courses
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <StaggerGrid staggerDelay={0.2}>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {topCourses.map((course) => (
                <CourseShowcaseCard
                  key={course.title}
                  href="/courses"
                  title={course.title}
                  subtitle={`${course.subtitle} Mentor: ${course.instructor}.`}
                  category={course.category}
                  levelLabel={course.levelLabel}
                  rating={course.rating}
                  reviewsText={course.reviewsText}
                  studentsText={course.studentsText}
                  price={course.price}
                  originalPrice={course.originalPrice}
                  discountLabel={course.discountLabel}
                  duration={course.duration}
                  lectures={course.lectures}
                  projects={course.projects}
                  badge={course.badge}
                  palette={course.palette}
                  ctaLabel="Preview Track"
                />
              ))}
            </div>
          </StaggerGrid>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-opacity='0.2' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Ready to Start Your Journey?</h2>
            <p className="mb-10 text-xl leading-relaxed text-primary-100">
              Join thousands of students who are already learning and growing with EDVO.
              Start your free trial today!
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button variant="secondary" size="lg" className="!border-accent-500 !bg-accent-500 !text-white hover:!bg-accent-600">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/20">
                  View Pricing
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <CareerTransformationsSection />
      <DataAnalyticsSection />
      <AIDataScienceSection />
      <ProfessionalSkillsSection />
      <InstructorsSection />
      <CinematicSection />
      <JobReadyPortfoliosSection />
      <YouTubeSection />
      <FreeCoursesSection />
      <HiringPartnersSection />
      <TestimonialsSection />
    </main>
  );
}


