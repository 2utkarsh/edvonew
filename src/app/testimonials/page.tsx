'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Star, Quote, Clock3, ChevronDown, Award } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';
import { cn } from '@/lib/utils';
import { CourseReviewItem, fetchCourseReviewCategories, fetchCourseReviews, ReviewCategoryOption } from './reviews/data';

function formatRelativeDate(value: string) {
  if (!value) return 'Recently added';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently added';

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths <= 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears <= 1 ? '1 year ago' : `${diffYears} years ago`;
}

function ReviewCard({ review }: { review: CourseReviewItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-primary-600 dark:text-primary-400 mb-2">{review.category}</div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{review.courseName}</h3>
        </div>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, index) => (
            <Star key={index} className={cn('w-4 h-4', index < review.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-700')} />
          ))}
        </div>
      </div>

      <div className="relative mb-6 flex-1">
        <Quote className="absolute -top-2 -left-1 w-8 h-8 text-slate-100 dark:text-slate-800/60 -z-10" />
        <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{review.comment || 'This learner left a rating for the course.'}</p>
      </div>

      <div className="mt-auto border-t border-gray-100 dark:border-slate-800/70 pt-5 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <Image src={review.reviewerAvatar} alt={review.reviewerName} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900 dark:text-white truncate">{review.reviewerName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{review.reviewerRole}</div>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
          <Clock3 className="w-3.5 h-3.5" />
          {formatRelativeDate(review.updatedAt || review.createdAt)}
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<CourseReviewItem[]>([]);
  const [categories, setCategories] = useState<ReviewCategoryOption[]>([{ id: 'all', label: 'All Categories' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError('');
        const [reviewItems, categoryItems] = await Promise.all([fetchCourseReviews(), fetchCourseReviewCategories()]);
        if (!cancelled) {
          setReviews(reviewItems);
          setCategories(categoryItems);
        }
      } catch (error: any) {
        if (!cancelled) setLoadError(error?.message || 'Unable to load course reviews right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        review.reviewerName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query) ||
        review.courseName.toLowerCase().includes(query);
      const matchCategory = selectedCategory === 'all' || review.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [reviews, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">Course Reviews</Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
              Learner Feedback. <span className="gradient-text">Live From Courses.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              These reviews come directly from course review submissions, so the testimonials page always reflects the latest approved learner feedback.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 mb-12 border border-white dark:border-slate-800 transition-all">
            <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-center">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by learner, review, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 !py-5 !text-lg !rounded-3xl border-gray-100 dark:border-slate-800 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent hover:border-gray-200 dark:hover:border-slate-700 dark:text-gray-300 rounded-2xl px-6 py-5 pr-12 focus:outline-none focus:border-primary-500 transition-all cursor-pointer font-medium text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-gray-500 dark:text-slate-500 font-medium">
              Found <span className="text-gray-900 dark:text-white font-bold">{filteredReviews.length}</span> course reviews
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Admin Synced</span>
            </div>
          </div>
        </FadeIn>

        {loadError ? <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{loadError}</div> : null}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[320px] animate-pulse rounded-[2rem] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" />
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching reviews found</h3>
            <p className="text-gray-500 dark:text-slate-500">Try adjusting your search or category filter.</p>
            <Button variant="outline" className="mt-8 !rounded-2xl" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Reset filters
            </Button>
          </div>
        )}

        <FadeIn delay={0.5}>
          <div className="mt-24 relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-primary-600 to-indigo-700 p-12 text-white shadow-2xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Award className="w-64 h-64" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Build the next review worth featuring.</h2>
              <p className="text-lg text-primary-100 mb-8 leading-relaxed">
                Start learning with EDVO and turn your own course experience into the next success story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses" className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-black text-primary-700 shadow-xl transition hover:bg-white/90">
                  Explore Courses
                </Link>
                <Link href="/testimonials/success-stories" className="inline-flex items-center justify-center rounded-2xl border border-white px-8 py-4 text-lg font-black text-white transition hover:bg-white/10">
                  View Job Success Stories
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
