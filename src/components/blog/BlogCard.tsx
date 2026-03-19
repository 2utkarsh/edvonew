'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail: string;
}

export default function BlogCard({
  id,
  title,
  description,
  category,
  author,
  date,
  readTime,
  thumbnail,
}: BlogCardProps) {
  return (
    <Link href={`/resources/blog/${id}`} className="block group">
      <motion.div 
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        {/* Thumbnail Wrapper */}
        <div className="relative h-60 w-full overflow-hidden">
          {/* Category Overlay */}
          <div className="absolute top-5 left-5 z-20">
            <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              {category}
            </span>
          </div>
          
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Section */}
        <div className="p-7 lg:p-8 flex flex-col flex-1">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-[13px] font-bold text-slate-400 dark:text-slate-500 mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500/70" />
              {date}
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500/70" />
              {readTime}
            </div>
          </div>

          <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-[1.3] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3 mb-8 flex-1">
            {description}
          </p>

          <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center border border-primary-200/50 dark:border-primary-800/50">
                <span className="text-primary-700 dark:text-primary-300 font-black text-sm">
                  {author.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold leading-none mb-1">Author</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {author}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-sm group/btn">
              <span className="relative">
                Read More
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover/btn:w-full" />
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
