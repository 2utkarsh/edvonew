'use client';

import { useState } from 'react';
import { Search, Trophy, Calendar, Sparkles, Filter, Rocket, Target, Zap, Users, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, StaggerGrid } from '@/components/animations';
import EventCard from '@/components/resources/EventCard';
import { cn } from '@/lib/utils';

const MOCK_HACKATHONS = [
  {
    id: '1',
    title: 'Generative AI Innovation Sprint',
    description: 'Build the next generation of AI productivity tools. Participants get exclusive access to enterprise GPUs and mentorship from top AI labs.',
    date: '10-12 April, 2026',
    time: '48 Hours',
    location: 'Hybrid (Bangalore + Online)',
    type: 'hackathon' as const,
    image: 'https://images.unsplash.com/photo-1504384308090-c89eececbf83?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    prizes: '₹5,00,000 + Funding'
  },
  {
    id: '2',
    title: 'Data-for-Good Global Challenge',
    description: 'Solve real-world sustainability problems using satellite data and machine learning. A global competition for data scientists.',
    date: '5-7 May, 2026',
    time: '72 Hours',
    location: 'Remote Only',
    type: 'hackathon' as const,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    prizes: '₹2,50,000 + Internship'
  },
  {
    id: '3',
    title: 'Low-Code Automation Builder Cup',
    description: 'A rapid prototyping hackathon focused on building complex business workflows using modern low-code/no-code stacks.',
    date: '20th April, 2026',
    time: '24 Hours',
    location: 'Online',
    type: 'hackathon' as const,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    status: 'Upcoming' as const,
    prizes: '₹1,00,000 + Tool Credits'
  }
];

export default function HackathonsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHackathons = MOCK_HACKATHONS.filter(h => 
    h.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* --- Header --- */}
        <section className="mb-20">
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                   <Zap className="w-3.5 h-3.5 fill-current" />
                   Rapid Innovation
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight mb-8">
                  Build, Break, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-rose-600">Innovate.</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Collaborate with the brightest minds to solve impossible problems. Our hackathons are more than just coding—they are the launchpads for future startups.
                </p>
              </div>

              {/* Stats Capsule */}
              <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹1Cr+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Prizes</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">15k+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Innovators</span>
                 </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search hackathons by theme or prize pool..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Filter className="w-3.5 h-3.5" />
             Theme
          </div>
        </div>

        {/* --- Grid Layout --- */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filteredHackathons.map((hackathon) => (
            <EventCard key={hackathon.id} {...hackathon} />
          ))}
        </StaggerGrid>

        {/* --- Why Participate Section --- */}
        <FadeIn delay={0.4}>
          <div className="mt-28 p-1 rounded-[4rem] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20">
             <div className="bg-white dark:bg-slate-950 rounded-[3.9rem] p-12 lg:p-20 relative overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-12 relative z-10">
                   <div className="lg:col-span-1">
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Why Bother <br /> Competing?</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">It’s not just about the prize money. It’s about the transformation of your engineering mindset.</p>
                      <button className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Read Winner Stories
                        <Rocket className="w-4 h-4" />
                      </button>
                   </div>
                   
                   <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                      {[
                        { icon: Users, title: 'Network with Elite Mentors', desc: 'Get direct feedback from engineers at Google, Meta, and OpenAI.' },
                        { icon: Trophy, title: 'Build a Winning Portfolio', desc: 'Winning a hackathon is the ultimate proof of work for recruiters.' },
                        { icon: Rocket, title: 'Venture Capital Exposure', desc: 'Pitch your demo to active angel investors and VC firms.' },
                        { icon: Code, title: 'Master New Tech Stacks', desc: 'Nothing forces you to learn faster than a 48-hour deadline.' },
                      ].map((feature, i) => (
                        <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                              <feature.icon className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="font-black text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
