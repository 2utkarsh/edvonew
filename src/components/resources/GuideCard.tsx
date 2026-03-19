'use client';

import { motion } from 'framer-motion';
import { Target, Map, Star, Download, ChevronRight, ClipboardCheck, Layers, FileText, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideCardProps {
  id: string;
  title: string;
  description: string;
  track: string;
  steps: number;
  highlight: string;
  icon: 'Map' | 'Target' | 'Star' | 'Blueprint' | string;
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
}: GuideCardProps) {
  const Icon = iconMap[icon as keyof typeof iconMap] || Compass;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* Blueprint Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />

      <div className="p-8 lg:p-10 flex flex-col flex-1 relative z-10">
        {/* Top Section: Breadcrumb style */}
        <div className="flex items-center justify-between mb-8">
          <div className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-gradient-to-br transition-all duration-500",
            trackStyles[track as keyof typeof trackStyles] || 'from-slate-100 to-slate-50 text-slate-500'
          )}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{track}</span>
          </div>
          
          <div className="flex items-center gap-1 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
             <Star className="w-3 h-3 fill-current" />
             {highlight}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-[1.2] mb-4 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-10">
          {description}
        </p>

        {/* Roadmap Progress Visualization */}
        <div className="mb-10 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group/progress">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roadmap Progress</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{steps} Milestones</span>
           </div>
           {/* Visual simulation of steps */}
           <div className="flex gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-700",
                    i < 4 ? "bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-200 dark:bg-slate-800"
                  )} 
                />
              ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95 group/btn">
            Unlock Roadmap
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
          
          <button className="w-14 h-14 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 shadow-sm relative overflow-hidden">
            <Download className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-primary-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
