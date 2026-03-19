'use client';

import { useState } from 'react';
import { Search, Wrench, Calendar, Trophy, Sparkles, Filter, CheckCircle2, Layout, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, StaggerGrid } from '@/components/animations';
import EventCard from '@/components/resources/EventCard';
import { cn } from '@/lib/utils';

const MOCK_WORKSHOPS = [
  {
    id: '1',
    title: 'Building Your First LLM-Powered App',
    description: 'A dedicated 4-hour hands-on session where you will build and deploy a RAG-based chatbot using LangChain and OpenAI.',
    date: '18th March, 2026',
    time: '11:00 AM IST',
    location: 'Online (Discord Live)',
    type: 'workshop' as const,
    image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    duration: '4 Hours'
  },
  {
    id: '2',
    title: 'Advanced Data Cleaning with Python & Pandas',
    description: 'Stop spending 80% of your time cleaning data. Learn advanced vectorized operations to handle messy real-world datasets.',
    date: '22nd March, 2026',
    time: '02:00 PM IST',
    location: 'Online (Zoom)',
    type: 'workshop' as const,
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    duration: '3 Hours'
  },
  {
    id: '3',
    title: 'Deployment Mastery: Docker & AWS for Analysts',
    description: 'Learn how to containerize your dashboards and deploy them to the cloud for real-world business impact.',
    date: '28th March, 2026',
    time: '04:00 PM IST',
    location: 'Online (Google Meet)',
    type: 'workshop' as const,
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    duration: '5 Hours'
  }
];

export default function WorkshopsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkshops = MOCK_WORKSHOPS.filter(w => 
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                   <Wrench className="w-3.5 h-3.5" />
                   Hands-On Learning
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight mb-8">
                  Practical <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Skill Workshops.</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Deep-dive tech sessions where you don't just watch—you build. Come prepared with your IDE and a desire to code.
                </p>
              </div>

              {/* Stats Capsule */}
              <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">100%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hands-on</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">8/mo</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bootcamps</span>
                 </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search workshops by skill or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Filter className="w-3.5 h-3.5" />
             Advance Filter
          </div>
        </div>

        {/* --- Grid Layout --- */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filteredWorkshops.map((workshop) => (
            <EventCard key={workshop.id} {...workshop} />
          ))}
        </StaggerGrid>

        {/* --- Certification Section --- */}
        <FadeIn delay={0.4}>
          <div className="mt-28 relative rounded-[4rem] bg-slate-950 p-12 lg:p-20 overflow-hidden text-center lg:text-left">
             <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2">
                <Trophy className="w-[600px] h-[600px] text-emerald-500" />
             </div>
             
             <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                   <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-[1.1]">Get Certified <br /> After Each Session.</h2>
                   <p className="text-lg text-slate-400 mb-12 max-w-lg">Complete the hands-on project assigned during the workshop to receive a verified EDVO Skill Certificate to showcase on LinkedIn.</p>
                   
                   <div className="space-y-4 mb-12">
                      {['Project-based validation', 'Verified digital certificates', 'LinkedIn integration'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           <span className="text-slate-300 font-bold">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl group">
                   <div className="aspect-[4/3] rounded-2xl bg-slate-900 overflow-hidden relative mb-8 border border-white/5 shadow-2xl">
                      <img src="https://images.unsplash.com/photo-1586282391129-56a991ae5717?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105" alt="certificate" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Layout className="w-16 h-16 text-emerald-500/50" />
                      </div>
                   </div>
                   <h3 className="text-xl font-black text-white mb-2">EDVO Skill Mastery - AI Engineering</h3>
                   <p className="text-slate-500 text-sm font-bold">Successfully completed the RAG Application Deployment Workshop.</p>
                </div>
             </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
