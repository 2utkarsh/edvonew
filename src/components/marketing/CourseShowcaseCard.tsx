'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock3,
  FolderKanban,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const paletteMap = {
  blue: {
    shell: 'from-primary-600 via-primary-700 to-accent-500',
    tint: 'from-primary-50 via-white to-accent-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950',
    badge: 'bg-primary-600/90 text-white',
    chip: 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300',
    rail: 'from-primary-500 to-accent-500',
    icon: 'text-primary-600 dark:text-primary-400',
    price: 'text-primary-700 dark:text-primary-300',
    shadow: 'hover:shadow-[0_24px_70px_rgba(37,99,235,0.20)]',
  },
  emerald: {
    shell: 'from-emerald-500 via-teal-600 to-cyan-600',
    tint: 'from-emerald-50 via-white to-cyan-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950',
    badge: 'bg-emerald-600/90 text-white',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    rail: 'from-emerald-500 to-cyan-500',
    icon: 'text-emerald-600 dark:text-emerald-400',
    price: 'text-emerald-700 dark:text-emerald-300',
    shadow: 'hover:shadow-[0_24px_70px_rgba(16,185,129,0.18)]',
  },
  amber: {
    shell: 'from-amber-500 via-orange-500 to-rose-500',
    tint: 'from-amber-50 via-white to-orange-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950',
    badge: 'bg-amber-500/90 text-slate-950',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    rail: 'from-amber-500 to-orange-500',
    icon: 'text-amber-600 dark:text-amber-400',
    price: 'text-amber-700 dark:text-amber-300',
    shadow: 'hover:shadow-[0_24px_70px_rgba(245,158,11,0.18)]',
  },
  violet: {
    shell: 'from-violet-600 via-fuchsia-600 to-pink-500',
    tint: 'from-violet-50 via-white to-pink-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950',
    badge: 'bg-violet-600/90 text-white',
    chip: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    rail: 'from-violet-500 to-pink-500',
    icon: 'text-violet-600 dark:text-violet-400',
    price: 'text-violet-700 dark:text-violet-300',
    shadow: 'hover:shadow-[0_24px_70px_rgba(139,92,246,0.18)]',
  },
} as const;

type Palette = keyof typeof paletteMap;

interface CourseShowcaseCardProps {
  href: string;
  title: string;
  subtitle: string;
  category: string;
  levelLabel: string;
  rating: string;
  reviewsText: string;
  studentsText: string;
  price: string;
  originalPrice?: string;
  discountLabel?: string;
  duration: string;
  lectures: string;
  projects: string;
  badge?: string;
  ctaLabel?: string;
  palette?: Palette;
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
}

function StatChip({ icon, text, chipClass, iconClass }: { icon: React.ReactNode; text: string; chipClass: string; iconClass: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold', chipClass)}>
      <span className={iconClass}>{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

export default function CourseShowcaseCard({
  href,
  title,
  subtitle,
  category,
  levelLabel,
  rating,
  reviewsText,
  studentsText,
  price,
  originalPrice,
  discountLabel,
  duration,
  lectures,
  projects,
  badge,
  ctaLabel = 'Explore Now',
  palette = 'blue',
  className,
  imageSrc,
  imageAlt,
}: CourseShowcaseCardProps) {
  const styles = paletteMap[palette];
  const resolvedImage = imageSrc || getCourseImage(title, category);

  return (
    <Link href={href} className="block h-full">
      <motion.article
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900',
          styles.shadow,
          className
        )}
      >
        <div className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', styles.rail)} />

        <div className={cn('relative overflow-hidden px-5 pb-4 pt-5', 'bg-gradient-to-br', styles.shell)}>
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                {category}
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.28em] text-white/70">
                {levelLabel}
              </p>
            </div>
            {badge ? (
              <div className={cn('rounded-full px-3 py-1 text-[11px] font-bold shadow-lg', styles.badge)}>
                {badge}
              </div>
            ) : null}
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[24px] border border-white/15 bg-slate-950/35 backdrop-blur-sm">
            <img
              src={resolvedImage}
              alt={imageAlt || title}
              className="h-48 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/90">EDVO Signature Track</p>
                <p className="mt-1 text-xs leading-5 text-white/70">Practical projects, mentor support, and career-ready outcomes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col bg-gradient-to-b p-5', styles.tint)}>
          <h3 className="line-clamp-2 text-xl font-black leading-snug text-slate-950 transition-colors group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-semibold text-slate-800 ring-1 ring-slate-200 dark:bg-slate-950/70 dark:text-slate-100 dark:ring-slate-800">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-slate-400">({reviewsText})</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950/70 dark:text-slate-300 dark:ring-slate-800">
              <Users className="h-4 w-4" />
              <span>{studentsText}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <StatChip icon={<Clock3 className="h-3.5 w-3.5" />} text={duration} chipClass={styles.chip} iconClass={styles.icon} />
            <StatChip icon={<BookOpen className="h-3.5 w-3.5" />} text={lectures} chipClass={styles.chip} iconClass={styles.icon} />
            <StatChip icon={<FolderKanban className="h-3.5 w-3.5" />} text={projects} chipClass={styles.chip} iconClass={styles.icon} />
            <StatChip icon={<Award className="h-3.5 w-3.5" />} text="Certificate" chipClass={styles.chip} iconClass={styles.icon} />
          </div>

          <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className={cn('text-3xl font-black tracking-tight', styles.price)}>{price}</span>
              {originalPrice ? <span className="text-sm text-slate-400 line-through">{originalPrice}</span> : null}
              {discountLabel ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {discountLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Includes guided learning, portfolio outcomes, and upgrade-friendly access.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-[22px] bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 dark:text-slate-500">Next Step</p>
              <p className="mt-1 text-sm font-semibold">{ctaLabel}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 dark:bg-slate-100">
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function getCourseImage(title: string, category: string) {
  const token = `${title} ${category}`.toLowerCase();

  if (token.includes('mba') || token.includes('management') || token.includes('business')) {
    return '/images/courses/management.svg';
  }

  if (token.includes('computer science') || token.includes('cs') || token.includes('algorithm') || token.includes('data structure')) {
    return '/images/courses/computer-science.svg';
  }

  if (token.includes('web')) {
    return '/images/courses/web-development.svg';
  }

  if (token.includes('data science') || token.includes('machine learning') || token.includes('analytics') || token.includes('python')) {
    return '/images/courses/data-science.svg';
  }

  if (token.includes('cloud') || token.includes('devops')) {
    return '/images/courses/cloud-devops.svg';
  }

  if (token.includes('mobile') || token.includes('android') || token.includes('ios')) {
    return '/images/courses/mobile-development.svg';
  }

  return '/images/courses/computer-science.svg';
}
