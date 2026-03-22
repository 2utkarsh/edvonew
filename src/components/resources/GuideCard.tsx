'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Star, Download, FileText, Compass, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideCardProps {
  id: string;
  title: string;
  description: string;
  track: string;
  steps: number;
  highlight: string;
  icon: 'Map' | 'Target' | 'Star' | 'Blueprint' | string;
  thumbnail: string;
  roadmapSteps: string[];
  roadmapFileName: string;
  roadmapFileUrl: string;
}

const iconMap = {
  Map: Compass,
  Target: Target,
  Star: Star,
  Blueprint: FileText,
} as const;

const trackStyles = {
  'Career Growth': 'from-emerald-600/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Interview Prep': 'from-primary-600/20 to-primary-600/5 text-primary-600 dark:text-primary-400 border-primary-500/20',
  'Salary Mastery': 'from-amber-600/20 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Resume Building': 'from-rose-600/20 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export default function GuideCard({
  title,
  description,
  track,
  steps,
  highlight,
  icon,
  thumbnail,
  roadmapSteps,
  roadmapFileName,
  roadmapFileUrl,
}: GuideCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || Compass;
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const visibleSteps = roadmapSteps.length ? roadmapSteps : ['Roadmap will appear here after admin updates it.'];

  return (
    <>
      <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-85" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-gradient-to-br transition-all duration-500',
              trackStyles[track as keyof typeof trackStyles] || 'from-slate-100 to-slate-50 text-slate-500'
            )}>
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{track}</span>
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-10 flex flex-col flex-1 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
              <Star className="w-3 h-3 fill-current" />
              {highlight}
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-[1.2] mb-4 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-10">
            {description}
          </p>

          <div className="mb-10 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group/progress">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roadmap Progress</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{steps} Milestones</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-700',
                    i < Math.max(1, Math.min(12, Math.round((steps / 15) * 12))) ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-200 dark:bg-slate-800'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3">
            <button type="button" onClick={() => setRoadmapOpen(true)} className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95 group/btn">
              Unlock Roadmap
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>

            <a href={roadmapFileUrl || '#'} download={roadmapFileName || undefined} className="w-14 h-14 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 shadow-sm relative overflow-hidden">
              <Download className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-primary-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {roadmapOpen ? (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Admin-Controlled Roadmap</div>
                  <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <button type="button" onClick={() => setRoadmapOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8">
                <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Track</div>
                    <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">{track}</div>
                    <div className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Milestones</div>
                    <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{visibleSteps.length}</div>
                    <a href={roadmapFileUrl || '#'} download={roadmapFileName || undefined} className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white dark:bg-white dark:text-slate-900">
                      <Download className="h-4 w-4" />
                      Download Roadmap
                    </a>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[17px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-primary-500 via-orange-400 to-transparent sm:block" />
                    <div className="space-y-5">
                      {visibleSteps.map((step, index) => (
                        <div key={`${title}-${index}`} className="relative rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/30 sm:pl-14">
                          <div className="absolute left-4 top-5 hidden h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-black text-white sm:flex">{index + 1}</div>
                          <div className="flex items-start gap-3 sm:hidden">
                            <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-black text-white">{index + 1}</div>
                            <div className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{step}</div>
                          </div>
                          <div className="hidden items-start gap-3 sm:flex">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                            <div className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
