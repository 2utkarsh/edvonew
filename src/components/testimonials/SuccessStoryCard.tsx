'use client';

import { motion } from 'framer-motion';
import { Linkedin, ArrowRight, ArrowUpRight, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SuccessStory {
  id: string;
  name: string;
  location: string;
  beforeRole: string;
  afterRole: string;
  companyLogo: string;
  avatar: string;
  linkedinUrl: string;
  tags: string[];
}

export default function SuccessStoryCard({ story }: { story: SuccessStory }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      {/* Top Section: Avatar & Branding */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Image 
          src={story.avatar} 
          alt={story.name} 
          fill 
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent" />
        
        {/* Tags */}
        <div className="absolute top-5 left-5 z-20 flex flex-wrap gap-2">
          {story.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 backdrop-blur shadow-sm border border-slate-100 dark:border-slate-700">
              {tag}
            </span>
          ))}
        </div>

        {/* LinkedIn Button Overlay */}
        <a 
          href={story.linkedinUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-[#0077b5] dark:text-blue-400 shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>

      {/* Content Section */}
      <div className="px-8 pb-8 flex flex-col flex-1 relative -mt-8">
        {/* Name & Location */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">
            {story.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-400 dark:text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            {story.location}
          </div>
        </div>

        {/* Transition Logic (Before/After) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1.5">Before</div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400 line-clamp-1">{story.beforeRole}</div>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-primary-500 font-black mb-1.5">After</div>
            <div className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{story.afterRole}</div>
          </div>
        </div>

        {/* Company Placement */}
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black mb-2">Hired At</span>
            <div className="relative h-8 w-24">
               <Image 
                 src={story.companyLogo} 
                 alt="Company Logo" 
                 fill 
                 className="object-contain object-left dark:invert dark:opacity-80"
               />
            </div>
          </div>
          
          <a 
            href={story.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group/link"
          >
            Verified
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
