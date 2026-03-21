'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Code, Database, Brain, Rocket, BookOpen, Sparkles } from 'lucide-react';
import { FadeIn, StaggerGrid } from '@/components/animations';
import TutorialCard from '@/components/resources/TutorialCard';
import { cn } from '@/lib/utils';
import { deriveTutorialCategories, fetchTutorials, TutorialItem } from './data';

const CATEGORY_ICONS = {
  all: BookOpen,
  Coding: Code,
  Data: Database,
  AI: Brain,
  Tools: Rocket,
  General: Sparkles,
} as const;

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTutorials() {
      try {
        setIsLoading(true);
        setLoadError('');
        const items = await fetchTutorials();
        if (!cancelled) setTutorials(items);
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load tutorials right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTutorials();
    return () => {
      cancelled = true;
    };
  }, []);

  const tutorialCategories = useMemo(() => deriveTutorialCategories(tutorials), [tutorials]);

  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tutorial) => {
      const matchSearch =
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.tool.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [tutorials, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
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

              <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] self-start lg:self-auto">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{tutorials.length}+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modules</span>
                </div>
                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">Live</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Synced</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

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
            {tutorialCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS] || BookOpen;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
                    selectedCategory === cat.id
                      ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-100 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {loadError ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-[2.5rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
            ))}
          </div>
        ) : filteredTutorials.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} {...tutorial} />
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
