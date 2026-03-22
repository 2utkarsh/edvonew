'use client';

import { GraduationCap, Star, Users, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = { Youtube, Users, GraduationCap, Star } as const;

interface SocialStat {
  icon?: React.ReactNode;
  iconName?: keyof typeof ICONS | string;
  value: string;
  label: string;
  color?: string;
}

interface SocialStatsProps {
  stats?: SocialStat[];
  className?: string;
}

const SocialStats = ({
  stats = [
    { iconName: 'Youtube', value: '1.4M+', label: 'YouTube Subscribers', color: 'text-red-500' },
    { iconName: 'Users', value: '667K+', label: 'Enrolled Learners', color: 'text-blue-400' },
    { iconName: 'GraduationCap', value: '76K+', label: 'Paid Learners', color: 'text-lime-400' },
    { iconName: 'Star', value: '6000+', label: '5 star Reviews', color: 'text-yellow-400' },
  ],
  className = '',
}: SocialStatsProps) => {
  return (
    <div className={cn('relative z-30 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-slate-200 bg-white dark:border-[#FFFFFF1A] dark:bg-[#1a153a] px-5 py-4 text-slate-900 dark:text-white shadow-xl dark:shadow-[0_24px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 sm:w-[calc(100%-4rem)] md:px-8 md:py-6', className)}>
      <div className="mx-auto max-w-5xl"><div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">{stats.map((stat, index) => { const Icon = stat.iconName && stat.iconName in ICONS ? ICONS[stat.iconName as keyof typeof ICONS] : null; return <div key={index} className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start sm:gap-4"><div className={cn('rounded-[14px] bg-slate-100 dark:bg-white/5 p-2 sm:p-2.5 shadow-inner transition-colors duration-300', stat.color)}>{stat.icon || (Icon ? <Icon className="h-6 w-6" /> : null)}</div><div className="text-center sm:text-left"><div className="text-xl font-black tracking-tight md:text-2xl text-slate-900 dark:text-white transition-colors duration-300">{stat.value}</div><div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors duration-300">{stat.label}</div></div></div>; })}</div></div>
    </div>
  );
};

export default SocialStats;
