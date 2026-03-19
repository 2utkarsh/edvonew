'use client';

import { motion } from 'framer-motion';
import { Clock, Play, BookOpen, ChevronRight, Users, PlayCircle, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialCardProps {
  id: string;
  title: string;
  description: string;
  tool: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  thumbnail: string;
}

const levelColors = {
  Beginner: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
  Advanced: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
} as const;

export default function TutorialCard({
  title,
  description,
  tool,
  duration,
  level,
  thumbnail,
}: TutorialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full"
    >
      {/* Thumbnail with Sophisticated Overlay */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
        
        {/* Play Button - Floating Aesthetic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/30 flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Play className="w-6 h-6 fill-white ml-1" />
          </div>
        </div>

        {/* Status Pills */}
        <div className="absolute top-5 left-5 flex gap-2">
          <div className={cn(
            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg",
            levelColors[level as keyof typeof levelColors] || levelColors.Beginner
          )}>
            {level}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
            {tool}
          </div>
        </div>

        {/* Feature Pill */}
        <div className="absolute top-5 right-5">
           <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-500/20 animate-pulse">
              <Sparkles className="w-3 h-3" />
              HOT
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 lg:p-10 flex flex-col flex-1">
        {/* Meta Row */}
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            {duration}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            15 Lessons
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-[1.2] mb-4 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-8 flex-1 font-medium">
          {description}
        </p>

        {/* Footer: User social proof & CTA */}
        <div className="pt-8 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?u=tut${i}`} alt="user" className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
             <span className="text-[11px] font-bold text-slate-400">8.4k Learners</span>
          </div>

          <button className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[12px] uppercase tracking-widest group/btn hover:translate-x-1 transition-transform">
            Start Learning
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
