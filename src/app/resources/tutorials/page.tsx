'use client';

import { useState, useMemo } from 'react';
import { Search, Code, Database, Brain, Rocket, Play, BookOpen, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { FadeIn, StaggerGrid } from '@/components/animations';
import TutorialCard from '@/components/resources/TutorialCard';
import { cn } from '@/lib/utils';

const TUTORIAL_CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'Coding', label: 'Coding', icon: Code },
  { id: 'Data', label: 'Data', icon: Database },
  { id: 'AI', label: 'AI', icon: Brain },
  { id: 'Tools', label: 'Tools', icon: Rocket },
];

const MOCK_TUTORIALS = [
  {
    id: '1',
    title: 'Python for Data Engineering: Building Robust ETL Pipelines',
    description: 'Learn how to use Python, Pandas, and SQLAlchemy to build production-grade data pipelines from scratch.',
    tool: 'Python',
    duration: '4h 15m',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
  },
  {
    id: '2',
    title: 'Modern SQL: Window Functions and Advanced Joins',
    description: 'Master the complex SQL queries that data analysts use daily to generate insights from large datasets.',
    tool: 'PostgreSQL',
    duration: '2h 30m',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
  },
  {
    id: '3',
    title: 'Fine-tuning LLMs with Hugging Face and PyTorch',
    description: 'Step-by-step guide to taking a pre-trained model and adapting it to your specific business domain.',
    tool: 'PyTorch',
    duration: '6h 45m',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    category: 'AI',
  },
  {
    id: '4',
    title: 'Git Mastery: Branching Strategies and Conflict Resolution',
    description: 'Never fear a merge conflict again. A practical guide to Git teamwork for modern engineering teams.',
    tool: 'Git',
    duration: '1h 20m',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&q=80&w=800',
    category: 'Tools',
  },
  {
    id: '5',
    title: 'Building Interactive Dashboards with Power BI',
    description: 'Turn raw data into storytelling visuals that executives can use to make million-dollar decisions.',
    tool: 'Power BI',
    duration: '3h 10m',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=800',
    category: 'Data',
  },
  {
    id: '6',
    title: 'Reactive Microservices with Node.js and Redis',
    description: 'Scale your applications by learning how to implement message queues and event-driven architecture.',
    tool: 'Node.js',
    duration: '5h 00m',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800',
    category: 'Coding',
  },
];

export default function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTutorials = useMemo(() => {
    return MOCK_TUTORIALS.filter(tut => {
      const matchSearch = tut.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tut.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || tut.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* --- Unified Resource Header --- */}
        <section className="mb-20">
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                   <Sparkles className="w-3.5 h-3.5" />
                   High-Impact Learning
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-[1.1] tracking-tight mb-8">
                  Master Tools with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Practical Modules.</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Bite-sized, expert-led tutorials designed to get you from zero to production-ready in record time.
                </p>
              </div>

              {/* Stats Capsule */}
              <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">120+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modules</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">4.9/5</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                 </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- Search & Category Filters (Inline & Compact) --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by tool or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl flex flex-wrap gap-1">
            {TUTORIAL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat.id 
                    ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-100 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Grid Layout (Standard 3 Column) --- */}
        {filteredTutorials.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTutorials.map((tut) => (
              <TutorialCard key={tut.id} {...tut} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white">Module not found</h3>
             <p className="text-slate-500 font-medium mt-2">Try clearing your search or filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}
