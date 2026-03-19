import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FileQuestion,
  GraduationCap,
  Home,
  LayoutDashboard,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NotFoundVariant = 'default' | 'blogs' | 'courses' | 'dashboard' | 'jobs' | 'challenges' | 'events';

interface ActionLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'outline' | 'ghost';
}

interface QuickLink {
  href: string;
  label: string;
}

interface VariantContent {
  badge: string;
  title: string;
  description: string;
  primary: ActionLink;
  secondary: ActionLink;
  tertiary: ActionLink;
  quickLinks: QuickLink[];
  panelHeading: string;
  panelTitle: string;
  panelDescription: string;
  panelIcon: React.ComponentType<{ className?: string }>;
  fullViewport?: boolean;
}

const variantMap: Record<NotFoundVariant, VariantContent> = {
  default: {
    badge: '404 Error',
    title: 'Page not found',
    description:
      'The page may have been moved, deleted, or the URL may be incorrect. Use the links below to get back on track quickly.',
    primary: { href: '/', label: 'Go to Home', icon: Home, variant: 'primary' },
    secondary: { href: '/courses', label: 'Explore Courses', icon: GraduationCap, variant: 'outline' },
    tertiary: { href: '/blogs', label: 'Read Blogs', icon: BookOpen, variant: 'ghost' },
    quickLinks: [
      { href: '/', label: 'Home' },
      { href: '/courses', label: 'Courses' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/jobs', label: 'Jobs' },
    ],
    panelHeading: 'Page Not Found',
    panelIcon: FileQuestion,
    panelTitle: 'Keep learning with EDVO',
    panelDescription:
      'Jump into courses, blogs, and career-focused resources without losing momentum.',
  },
  blogs: {
    badge: 'Missing Article',
    title: 'This blog page is not available',
    description:
      'The article may have been removed, renamed, or linked incorrectly. You can head back to the latest posts or continue exploring the platform.',
    primary: { href: '/blogs', label: 'Browse Blogs', icon: BookOpen, variant: 'primary' },
    secondary: { href: '/', label: 'Go to Home', icon: Home, variant: 'outline' },
    tertiary: { href: '/courses', label: 'Explore Courses', icon: GraduationCap, variant: 'ghost' },
    quickLinks: [
      { href: '/blogs', label: 'All Blogs' },
      { href: '/courses', label: 'Courses' },
      { href: '/jobs', label: 'Jobs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Blogs',
    panelIcon: BookOpen,
    panelTitle: 'Find another useful read',
    panelDescription:
      'Explore fresh articles, practical courses, and other popular sections from the EDVO learning experience.',
  },
  courses: {
    badge: 'Missing Course',
    title: 'That course page could not be found',
    description:
      'This course may have been moved, retired, or opened using an incorrect link. You can return to the catalog and continue from there.',
    primary: { href: '/courses', label: 'Browse Courses', icon: GraduationCap, variant: 'primary' },
    secondary: { href: '/', label: 'Go to Home', icon: Home, variant: 'outline' },
    tertiary: { href: '/blogs', label: 'Read Blogs', icon: BookOpen, variant: 'ghost' },
    quickLinks: [
      { href: '/courses', label: 'Course Catalog' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/jobs', label: 'Jobs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Courses',
    panelIcon: GraduationCap,
    panelTitle: 'Pick your next learning path',
    panelDescription:
      'Browse the latest courses, return to the homepage, or discover related learning content across EDVO.',
  },
  dashboard: {
    badge: 'Dashboard 404',
    title: 'This dashboard page does not exist',
    description:
      'The dashboard route may be outdated or unavailable for your account. Use the safe links below to get back into the product.',
    primary: { href: '/dashboard/student', label: 'Open Dashboard', icon: LayoutDashboard, variant: 'primary' },
    secondary: { href: '/', label: 'Go to Home', icon: Home, variant: 'outline' },
    tertiary: { href: '/courses', label: 'Explore Courses', icon: GraduationCap, variant: 'ghost' },
    quickLinks: [
      { href: '/dashboard/student', label: 'Student Dashboard' },
      { href: '/courses', label: 'Courses' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Dashboard',
    panelIcon: LayoutDashboard,
    panelTitle: 'Get back to a valid workspace',
    panelDescription:
      'Use the student dashboard or return to the main site to continue without hitting another dead end.',
    fullViewport: true,
  },
  jobs: {
    badge: 'Missing Job Listing',
    title: 'This job posting could not be found',
    description:
      'The job listing may have been filled, expired, or the URL may be incorrect. Head back to explore other career opportunities.',
    primary: { href: '/jobs', label: 'Browse Jobs', icon: BriefcaseBusiness, variant: 'primary' },
    secondary: { href: '/', label: 'Go to Home', icon: Home, variant: 'outline' },
    tertiary: { href: '/courses', label: 'Upskill with Courses', icon: GraduationCap, variant: 'ghost' },
    quickLinks: [
      { href: '/jobs', label: 'All Job Listings' },
      { href: '/courses', label: 'Courses' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Jobs',
    panelIcon: BriefcaseBusiness,
    panelTitle: 'Explore career opportunities',
    panelDescription:
      'Discover open positions, upskill with courses, or explore other resources to advance your career on EDVO.',
  },
  challenges: {
    badge: 'Challenge Not Found',
    title: 'This data challenge doesn\u2019t exist',
    description:
      'The challenge may have ended, been archived, or the link might be incorrect. Explore other active challenges and test your skills.',
    primary: { href: '/challenges', label: 'View Challenges', icon: Trophy, variant: 'primary' },
    secondary: { href: '/courses', label: 'Learn & Prepare', icon: GraduationCap, variant: 'outline' },
    tertiary: { href: '/', label: 'Go to Home', icon: Home, variant: 'ghost' },
    quickLinks: [
      { href: '/challenges', label: 'Data Challenges' },
      { href: '/courses', label: 'Courses' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Data Challenges',
    panelIcon: Trophy,
    panelTitle: 'Ready for a challenge?',
    panelDescription:
      'Browse active data challenges, sharpen your skills with courses, or explore other learning resources on EDVO.',
  },
  events: {
    badge: 'Event Not Found',
    title: 'This event page is unavailable',
    description:
      'The event may have already taken place, been cancelled, or the link might be broken. Check out upcoming events or browse other sections.',
    primary: { href: '/events', label: 'Browse Events', icon: CalendarDays, variant: 'primary' },
    secondary: { href: '/courses', label: 'Explore Courses', icon: GraduationCap, variant: 'outline' },
    tertiary: { href: '/', label: 'Go to Home', icon: Home, variant: 'ghost' },
    quickLinks: [
      { href: '/events', label: 'All Events' },
      { href: '/courses', label: 'Courses' },
      { href: '/blogs', label: 'Blogs' },
      { href: '/', label: 'Home' },
    ],
    panelHeading: 'Events',
    panelIcon: CalendarDays,
    panelTitle: 'Discover upcoming events',
    panelDescription:
      'Find the latest workshops, bootcamps, and live sessions happening on EDVO.',
  },
};

function actionClasses(variant: ActionLink['variant']) {
  if (variant === 'outline') {
    return 'border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 hover:bg-primary-600 hover:text-white';
  }

  if (variant === 'ghost') {
    return 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';
  }

  return 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20 hover:scale-[1.02]';
}

interface NotFoundExperienceProps {
  variant?: NotFoundVariant;
}

export default function NotFoundExperience({ variant = 'default' }: NotFoundExperienceProps) {
  const content = variantMap[variant];
  const PrimaryIcon = content.primary.icon;
  const SecondaryIcon = content.secondary.icon;
  const TertiaryIcon = content.tertiary.icon;
  const PanelIcon = content.panelIcon;

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white',
        content.fullViewport ? 'min-h-screen' : 'min-h-[calc(100vh-9rem)]'
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.95))] dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:88px_88px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:gap-14 lg:px-12 lg:py-24">
        <div className="max-w-3xl flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm backdrop-blur dark:border-primary-500/30 dark:bg-slate-900/70 dark:text-primary-300">
            <FileQuestion className="h-4 w-4" />
            <span>{content.badge}</span>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={content.primary.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition-all duration-300',
                actionClasses(content.primary.variant)
              )}
            >
              <PrimaryIcon className="h-5 w-5" />
              <span>{content.primary.label}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href={content.secondary.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition-all duration-300',
                actionClasses(content.secondary.variant)
              )}
            >
              <SecondaryIcon className="h-5 w-5" />
              <span>{content.secondary.label}</span>
            </Link>

            <Link
              href={content.tertiary.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition-all duration-300',
                actionClasses(content.tertiary.variant)
              )}
            >
              <TertiaryIcon className="h-5 w-5" />
              <span>{content.tertiary.label}</span>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl flex-1">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-8">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-8 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-100">
                  EDVO
                </span>
                <PanelIcon className="h-8 w-8 text-primary-100" />
              </div>

              <div className="mt-8 text-5xl font-black leading-tight sm:text-6xl">{content.panelHeading}</div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-primary-50/90 sm:text-base">
                {content.panelDescription}
              </p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{content.panelTitle}</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {content.quickLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-500/40 dark:hover:text-primary-300"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-primary-200 bg-primary-50/80 px-4 py-4 text-sm text-slate-600 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-slate-300">
                Double-check the URL if you typed it manually, or use one of the verified navigation paths above.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
