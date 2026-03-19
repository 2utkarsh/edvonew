'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Star, Users, Milestone, FolderGit2, Radio, Award } from 'lucide-react';
import Link from 'next/link';

// ─── Category data with emoji icons ───
const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'Data Science & Analytics', label: 'Data Science & Analytics', emoji: '📊' },
  { id: 'AI & ML', label: 'AI & ML', emoji: '🤖' },
  { id: 'DSA', label: 'DSA', emoji: '🧩' },
  { id: 'Design', label: 'Design', emoji: '🎨' },
  { id: 'Finance', label: 'Finance', emoji: '💹' },
  { id: 'Video Editing', label: 'Video Editing', emoji: '🎬' },
  { id: 'Cyber Security', label: 'Cyber Security', emoji: '🔒' },
  { id: 'Software Development', label: 'Software Development', emoji: '💻' },
  { id: 'Marketing', label: 'Marketing', emoji: '📣' },
  { id: 'DevOps & Cloud', label: 'DevOps & Cloud', emoji: '☁️' },
];

// ─── Static course tile data ───
const COURSE_TILES = [
  {
    id: '1',
    title: 'Web Development MERN Stack',
    category: 'Software Development',
    emoji: '🌐',
    gradient: 'from-violet-600 via-indigo-600 to-blue-600',
    iconBg: 'bg-indigo-100',
    students: '67k+',
    rating: 4.7,
    price: 3499,
    originalPrice: 9999,
  },
  {
    id: '2',
    title: 'Python',
    category: 'Data Science & Analytics',
    emoji: '🐍',
    gradient: 'from-blue-600 via-cyan-600 to-teal-500',
    iconBg: 'bg-blue-100',
    students: '89k+',
    rating: 4.8,
    price: 2999,
    originalPrice: 7999,
  },
  {
    id: '3',
    title: 'Data Science',
    category: 'Data Science & Analytics',
    emoji: '📊',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    iconBg: 'bg-teal-100',
    students: '45k+',
    rating: 4.9,
    price: 4999,
    originalPrice: 12999,
  },
  {
    id: 'ds-gen-ai',
    title: 'Data Analytics',
    category: 'Data Science & Analytics',
    emoji: '📈',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    iconBg: 'bg-orange-100',
    students: '32k+',
    rating: 4.6,
    price: 2499,
    originalPrice: 6999,
  },
  {
    id: '4',
    title: 'Machine Learning',
    category: 'AI & ML',
    emoji: '🤖',
    gradient: 'from-pink-600 via-rose-600 to-red-500',
    iconBg: 'bg-pink-100',
    students: '28k+',
    rating: 4.8,
    price: 5999,
    originalPrice: 14999,
  },
  {
    id: '5',
    title: 'DSA with Java',
    category: 'DSA',
    emoji: '🧩',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    iconBg: 'bg-purple-100',
    students: '45k+',
    rating: 4.6,
    price: 2499,
    originalPrice: 6999,
  },
  {
    id: '3',
    title: 'React & Next.js',
    category: 'Software Development',
    emoji: '⚛️',
    gradient: 'from-sky-600 via-blue-600 to-indigo-600',
    iconBg: 'bg-sky-100',
    students: '52k+',
    rating: 4.7,
    price: 3999,
    originalPrice: 9999,
  },
  {
    id: '5',
    title: 'Power BI & Tableau',
    category: 'Data Science & Analytics',
    emoji: '📉',
    gradient: 'from-yellow-500 via-orange-500 to-amber-600',
    iconBg: 'bg-yellow-100',
    students: '19k+',
    rating: 4.5,
    price: 1999,
    originalPrice: 5999,
  },
];

interface Props {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function CourseSearch({ title = 'Courses Created by Industry Experts', subtitle, compact = false }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState(COURSE_TILES);

  useEffect(() => {
    let result = COURSE_TILES;
    if (activeCategory !== 'all') {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFiltered(result);
  }, [activeCategory, searchQuery]);

  return (
    <section className="py-16 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Heading ── */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
        </div>

        {/* ── Search bar ── */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Machine Learning"
            className="w-full border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-5 py-3.5 pr-14 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm text-base"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center transition-colors">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Category pills ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Course tiles ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
          >
            {filtered.map((course, index) => (
              <motion.div
                key={`${course.id}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseTile course={course} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No courses found for &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-3 text-indigo-600 text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── View all link ── */}
        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 px-6 py-2.5 rounded-full transition-all hover:bg-indigo-50"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Individual course tile ───
function CourseTile({ course }: { course: typeof COURSE_TILES[0] }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <motion.div
        className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Gradient banner */}
        <div className={`relative h-28 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-4 -mb-4" />
          <span className="text-5xl drop-shadow-lg z-10">{course.emoji}</span>
          {/* hover overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Explore
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{course.rating}</span>
            </div>
            <div className="flex items-center gap-0.5 text-gray-400 dark:text-gray-500">
              <Users className="w-3 h-3" />
              <span className="text-xs">{course.students}</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-black text-gray-900 dark:text-white">₹{course.price.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
