'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Award, Briefcase, GraduationCap, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';
import SuccessStoryCard from '@/components/testimonials/SuccessStoryCard';
import { fetchSuccessStories, fetchSuccessStoryCategories, SuccessStoryCategoryOption, SuccessStoryItem } from './data';

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStoryItem[]>([]);
  const [categories, setCategories] = useState<SuccessStoryCategoryOption[]>([{ id: 'All', label: 'All Categories' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError('');
        const [storyItems, categoryItems] = await Promise.all([fetchSuccessStories(), fetchSuccessStoryCategories()]);
        if (!cancelled) {
          setStories(storyItems);
          setCategories(categoryItems);
        }
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load success stories right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        story.name.toLowerCase().includes(query) ||
        story.beforeRole.toLowerCase().includes(query) ||
        story.afterRole.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query);
      const matchCategory = selectedCategory === 'All' || story.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [stories, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-16 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest border border-primary-200/50 dark:border-primary-800/50 mb-8">
              <Award className="w-3.5 h-3.5" />
              Verified Career Outcomes
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-slate-900 dark:text-white leading-[0.95] tracking-tighter">
              Alumni <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-400">Achievements.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              Every job success story is now loaded from the backend admin, with category order and active status reflected here automatically.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-wrap justify-center gap-10 items-center border-y border-slate-100 dark:border-slate-800/50 py-10">
              {[
                { label: 'Visible Stories', value: `${stories.length}+`, icon: Sparkles, color: 'text-amber-500' },
                { label: 'Career Moves', value: 'Real', icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Categories', value: `${Math.max(categories.length - 1, 0)}`, icon: Briefcase, color: 'text-blue-500' },
                { label: 'Frontend Sync', value: 'Live', icon: GraduationCap, color: 'text-purple-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-center mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by learner, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] px-6 py-6 pr-12 focus:outline-none focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-900 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {loadError ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[430px] animate-pulse rounded-[2.5rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
              ))}
            </motion.div>
          ) : filteredStories.length > 0 ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredStories.map((story) => (
                  <SuccessStoryCard key={story.id} story={story} />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No transformation stories found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Try a different search or choose another category.</p>
              <Button variant="primary" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="!rounded-2xl !px-10">
                Clear Filters
              </Button>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-28 relative">
          <div className="absolute inset-0 bg-primary-500 rounded-[4rem] blur-[120px] opacity-10 pointer-events-none" />
          <div className="relative rounded-[4rem] bg-slate-950 p-12 lg:p-24 text-white overflow-hidden text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
              Ready for your own <br /><span className="text-primary-500">career leap?</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Start with the right course path and build the next job transition story that belongs here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-12 py-6 text-lg font-black text-white shadow-2xl shadow-primary-500/30 transition hover:bg-primary-400">
                Start Learning
              </Link>
              <Link href="/testimonials" className="inline-flex items-center justify-center rounded-2xl border border-white px-12 py-6 text-lg font-black text-white transition hover:bg-white/10">
                Browse Course Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
