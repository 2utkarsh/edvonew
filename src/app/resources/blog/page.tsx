'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, ChevronDown, GraduationCap, Code, Database, Brain, Rocket, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';
import BlogCard from '@/components/blog/BlogCard';
import { cn } from '@/lib/utils';
import { BlogCategoryOption, BlogPost, fetchBlogCategories, fetchBlogs } from './data';

const CATEGORY_ICONS = {
  all: BookOpen,
  Roadmaps: Rocket,
  'Data Science': Database,
  'AI & ML': Brain,
  Programming: Code,
  'Career Tips': GraduationCap,
} as const;

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategoryOption[]>([{ id: 'all', label: 'All Articles' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBlogs() {
      try {
        setIsLoading(true);
        setLoadError('');
        const [items, categoryItems] = await Promise.all([fetchBlogs(), fetchBlogCategories()]);
        if (!cancelled) {
          setBlogs(items);
          setCategories(categoryItems);
        }
      } catch (error: any) {
        if (!cancelled) {
          setLoadError(error?.message || 'Unable to load blogs right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBlogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-16 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <FadeIn>
            <div>
              <Badge variant="gradient" className="mb-6 px-4 py-1.5 text-xs font-black uppercase tracking-widest">EDVO Resources</Badge>
              <h1 className="text-6xl md:text-7xl font-black mb-8 text-slate-900 dark:text-white leading-[1.05] tracking-tighter">
                Knowledge for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-400">Career Growth.</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
                Deep dives into AI, Data Engineering, and software development from experts who&apos;ve built what you&apos;re learning.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-500" />
              <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Find what you need</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Search across the live resource blog library</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by topic, skill, or roadmap..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Rocket className="w-3.5 h-3.5" />
                    Live blog feed synced from the backend admin source
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mb-12 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS] || BookOpen;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'relative py-5 text-xs lg:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap',
                      selectedCategory === cat.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </span>
                    {selectedCategory === cat.id && (
                      <motion.div layoutId="activeCategory" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 dark:bg-primary-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'Article' : 'Articles'} Found
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
            Sort by: Admin Order <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {loadError ? (
          <div className="mb-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {loadError}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[420px] animate-pulse rounded-[2.5rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
              ))}
            </motion.div>
          ) : filteredBlogs.length > 0 ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {filteredBlogs.map((blog) => (
                  <BlogCard key={blog.id} {...blog} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-700">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No matches found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">We couldn&apos;t find any articles matching your search terms. Try different keywords.</p>
              <Button variant="primary" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="!rounded-2xl !px-10 !py-4 shadow-xl">
                Reset Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mt-20">
          <div className="absolute inset-0 bg-primary-600 rounded-[4rem] blur-[100px] opacity-10 pointer-events-none" />
          <div className="relative rounded-[4rem] bg-slate-950 p-12 lg:p-24 text-white overflow-hidden">
            <div className="absolute top-0 right-0 p-24 opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2">
              <MessageSquare className="w-96 h-96" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="bg-primary-500/20 text-primary-400 border-none mb-6">Newsletter</Badge>
                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">
                  Insights to build your <br /><span className="text-primary-500">dream career.</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                  Join 100,000+ professionals receiving weekly guides on AI, Data Engineering, and high-growth engineering roles.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 backdrop-blur-xl">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-primary-500/30 text-white font-bold placeholder:text-slate-500"
                    />
                  </div>
                  <Button className="w-full !rounded-2xl !py-6 !text-lg !font-black shadow-2xl shadow-primary-500/30">
                    Join the Newsletter
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-center text-xs text-slate-500 font-medium">Zero spam. High signal. Unsubscribe anytime.</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
