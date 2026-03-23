'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ExternalLink, Trophy, Video, Wrench } from 'lucide-react';
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
    hrefBase: '/events/webinars',
  },
  workshop: {
    icon: Wrench,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    label: 'Hands-on Workshop',
    hrefBase: '/events/workshops',
  },
  hackathon: {
    icon: Trophy,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    label: 'Hackathon',
    hrefBase: '/events/hackathons',
  },
};

export default function EventCard({
  id,
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
  const detailHref = `${config.hrefBase}/${id}`;
  const liveHref = `${detailHref}/live`;
  const primaryLabel = status === 'Live' ? 'Join Live' : status === 'Ended' ? 'View Event' : 'Register Now';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all duration-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        <div className="absolute top-5 left-5">
          <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md', config.color)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </div>
        </div>

        <div className="absolute top-5 right-5">
          <div className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg', status === 'Live' ? 'bg-rose-500 animate-pulse' : status === 'Upcoming' ? 'bg-primary-500' : 'bg-slate-500/50 backdrop-blur-md')}>
            {status === 'Live' && <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
            {status}
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary-400" />{date}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary-400" />{time}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-8 lg:p-10">
        <h3 className="mb-4 text-xl font-black leading-[1.2] text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white lg:text-2xl">{title}</h3>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{location}</p>
        <p className="mb-8 flex-1 line-clamp-2 text-[15px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>

        {(speakers || prizes || duration) && (
          <div className="mb-8 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800/50 dark:bg-slate-950/50">
            {type === 'webinar' && speakers && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {speakers.map((s, i) => (
                    <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-200 dark:border-slate-900"><img src={s.avatar} alt={s.name} className="h-full w-full object-cover" /></div>
                  ))}
                </div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speaker(s)</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{speakers[0].name} {speakers.length > 1 && `& ${speakers.length - 1} more`}</span></div>
              </div>
            )}
            {type === 'workshop' && duration && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><Clock className="h-4 w-4" /></div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{duration}</span></div>
              </div>
            )}
            {type === 'hackathon' && prizes && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500"><Trophy className="h-4 w-4" /></div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prizes</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{prizes}</span></div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4">
          <Link href={detailHref} className="flex-1 rounded-2xl bg-slate-900 py-4 text-center text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-primary-600 active:scale-95 dark:bg-white dark:text-slate-950 dark:hover:bg-primary-500 dark:hover:text-white">{primaryLabel}</Link>
          <Link href={status === 'Live' ? liveHref : detailHref} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-400 transition-all hover:text-slate-900 dark:border-slate-800/50 dark:bg-slate-800 dark:hover:text-white"><ExternalLink className="h-4 w-4" /></Link>
        </div>
      </div>
    </motion.div>
  );
}
