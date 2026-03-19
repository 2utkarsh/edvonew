'use client';

import { useState } from 'react';
import { Search, Video, Calendar, ArrowRight, Sparkles, Filter, Users, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, StaggerGrid } from '@/components/animations';
import EventCard from '@/components/resources/EventCard';
import { cn } from '@/lib/utils';

const MOCK_WEBINARS = [
  {
    id: '1',
    title: 'Future of Generative AI in Enterprise Solutions',
    description: 'Join industry experts to discuss how LLMs are transforming enterprise-grade software development and automation.',
    date: '15th March, 2026',
    time: '07:30 PM IST',
    location: 'Online (Zoom)',
    type: 'webinar' as const,
    image: 'https://images.unsplash.com/photo-1591115765373-520b7a217217?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    speakers: [
      { name: 'Dr. Arpit Jain', role: 'AI Research Lead', avatar: 'https://i.pravatar.cc/100?u=12' },
      { name: 'Sarah Chen', role: 'CTO @ Innovate', avatar: 'https://i.pravatar.cc/100?u=34' }
    ]
  },
  {
    id: '2',
    title: 'Career Pivot: From Non-Tech to Data Science',
    description: 'Listen to someone who actually did it. A real-world journey of transitioning into data analytics from a sales background.',
    date: '20th March, 2026',
    time: '06:00 PM IST',
    location: 'Online (YouTube Live)',
    type: 'webinar' as const,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
    status: 'Live' as const,
    speakers: [
      { name: 'Rahul Varma', role: 'Data Scientist @ Meta', avatar: 'https://i.pravatar.cc/100?u=56' }
    ]
  },
  {
    id: '3',
    title: 'Mastering SQL for Senior Data Roles',
    description: 'Deep dive into window functions, recursive CTEs, and query optimization for high-scale data environments.',
    date: '25th March, 2026',
    time: '08:00 PM IST',
    location: 'Online (Zoom)',
    type: 'webinar' as const,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    speakers: [
      { name: 'Amit Singh', role: 'Database Architect', avatar: 'https://i.pravatar.cc/100?u=78' }
    ]
  }
];

export default function WebinarsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWebinars = MOCK_WEBINARS.filter(w => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* --- Header --- */}
        <section className="mb-20">
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                   <Video className="w-3.5 h-3.5" />
                   Interactive Live Sessions
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight mb-8">
                  World-Class <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Expert Webinars.</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Live sessions with industry veterans helping you bridge the gap between academic learning and industry expectations.
                </p>
              </div>

              {/* Stats Capsule */}
              <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">40+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speakers</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">12/mo</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sessions</span>
                 </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- Search & Toolbar --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search webinars by topic or speaker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Filter className="w-3.5 h-3.5" />
             Filter
          </div>
        </div>

        {/* --- Grid Layout --- */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filteredWebinars.map((webinar) => (
            <EventCard key={webinar.id} {...webinar} />
          ))}
        </StaggerGrid>

        {/* --- Archive / Play Section --- */}
        <FadeIn delay={0.4}>
          <div className="mt-24 rounded-[3.5rem] p-12 lg:p-16 bg-slate-950 text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#3b82f6_0,transparent_50%)]" />
             
             <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                   <h2 className="text-4xl font-black mb-6 leading-tight">Missed a Session? <br /> Access the Archive.</h2>
                   <p className="text-slate-400 text-lg mb-10">All our past webinars are recorded and available for free in the resource hub.</p>
                   <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-[1.5rem] font-bold text-sm hover:scale-105 transition-all">
                      <Play className="w-4 h-4 fill-current" />
                      Browse Recorded Sessions
                   </button>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group cursor-pointer shadow-2xl">
                   <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="archive" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                         <Play className="w-6 h-6 fill-white" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
