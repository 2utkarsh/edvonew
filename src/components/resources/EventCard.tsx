'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowRight, Video, Trophy, Wrench, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'webinar' | 'workshop' | 'hackathon';
  image: string;
  status: 'Upcoming' | 'Live' | 'Ended';
  speakers?: { name: string; role: string; avatar: string }[];
  prizes?: string;
  duration?: string;
}

const typeStyles = {
  webinar: {
    icon: Video,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    label: 'Live Webinar',
  },
  workshop: {
    icon: Wrench,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    label: 'Hands-on Workshop',
  },
  hackathon: {
    icon: Trophy,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    label: 'Hackathon',
  },
};

export default function EventCard({
  title,
  description,
  date,
  time,
  location,
  type,
  image,
  status,
  speakers,
  prizes,
  duration,
}: EventCardProps) {
  const config = typeStyles[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500"
    >
      {/* Media Header */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-5 left-5">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md font-black text-[10px] uppercase tracking-widest",
            config.color
          )}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-5 right-5">
           <div className={cn(
             "px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg",
             status === 'Live' ? "bg-rose-500 animate-pulse" : 
             status === 'Upcoming' ? "bg-primary-500" : "bg-slate-500/50 backdrop-blur-md"
           )}>
              {status === 'Live' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              {status}
           </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center text-white/90">
           <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                 <Calendar className="w-3.5 h-3.5 text-primary-400" />
                 {date}
              </div>
              <div className="flex items-center gap-1.5">
                 <Clock className="w-3.5 h-3.5 text-primary-400" />
                 {time}
              </div>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 lg:p-10 flex flex-col flex-1">
        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-[1.2] mb-4 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-8 flex-1 font-medium">
          {description}
        </p>

        {/* Special Detail Row */}
        {(speakers || prizes || duration) && (
          <div className="mb-8 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
             {type === 'webinar' && speakers && (
                <div className="flex items-center gap-3">
                   <div className="flex -space-x-2">
                      {speakers.map((s, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                           <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speaker(s)</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{speakers[0].name} {speakers.length > 1 && `& ${speakers.length - 1} more`}</span>
                   </div>
                </div>
             )}
             {type === 'workshop' && duration && (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Clock className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{duration} Course</span>
                   </div>
                </div>
             )}
             {type === 'hackathon' && prizes && (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Trophy className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prizes</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{prizes}</span>
                   </div>
                </div>
             )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center justify-between gap-4">
          <button className="flex-1 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[11px] uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95">
             Register Now
          </button>
          <button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800/50">
             <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
