'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Award, Linkedin, Briefcase, GraduationCap, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FadeIn, StaggerGrid } from '@/components/animations';
import SuccessStoryCard from '@/components/testimonials/SuccessStoryCard';
import { cn } from '@/lib/utils';

// --- Types ---
interface SuccessStory {
  id: string;
  name: string;
  location: string;
  beforeRole: string;
  afterRole: string;
  companyLogo: string;
  avatar: string;
  linkedinUrl: string;
  tags: string[];
}

// --- Mock Data ---
const MOCK_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: '1',
    name: 'Swapnaja Gurav',
    location: 'Thane, Maharashtra',
    beforeRole: 'Associate Customer Services',
    afterRole: 'Lead Process Associate',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['Career Growth', 'From Non-IT'],
  },
  {
    id: '2',
    name: 'Adithya Narayanan',
    location: 'Chennai, Tamil Nadu',
    beforeRole: 'Fresher',
    afterRole: 'Data Analyst',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['First Tech Job', 'Data Science'],
  },
  {
    id: '3',
    name: 'Rahul Keshri',
    location: 'Bengaluru, Karnataka',
    beforeRole: 'Civil Engineer',
    afterRole: 'BI Developer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['Major Shift', 'Engineering'],
  },
  {
    id: '4',
    name: 'Priyanka Patil',
    location: 'Pune, Maharashtra',
    beforeRole: 'Manual Tester',
    afterRole: 'Full Stack Developer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['Technical Upskill', 'Development'],
  },
  {
    id: '5',
    name: 'Vikram Joshi',
    location: 'Noida, Uttar Pradesh',
    beforeRole: 'BPO Employee',
    afterRole: 'Machine Learning Engineer',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Uber_logo_2018.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['Dream Choice', 'AI & ML'],
  },
  {
    id: '6',
    name: 'Ananya Iyer',
    location: 'Mumbai, Maharashtra',
    beforeRole: 'Administrative Assistant',
    afterRole: 'Business Consultant',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg', // Placeholder
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    linkedinUrl: 'https://linkedin.com',
    tags: ['Career Transition', 'Analytics'],
  },
];

const CATEGORIES = ['All', 'From Non-IT', 'Major Shift', 'Career Growth', 'First Tech Job'];

export default function SuccessStoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredStories = useMemo(() => {
    return MOCK_SUCCESS_STORIES.filter(story => {
      const matchSearch = story.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          story.beforeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          story.afterRole.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || story.tags.includes(selectedCategory);
      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-16 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Hero Section --- */}
        <div className="text-center mb-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-black uppercase tracking-widest border border-primary-200/50 dark:border-primary-800/50 mb-8">
              <Award className="w-3.5 h-3.5" />
              Impact Over Numbers
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-slate-900 dark:text-white leading-[0.95] tracking-tighter">
              Alumni <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-400">Achievements.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              Transforming careers is hard. Our alumni made it look easy. Every story here is verified via LinkedIn.
            </p>
          </FadeIn>

          {/* Aggregate Stats */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap justify-center gap-10 items-center border-y border-slate-100 dark:border-slate-800/50 py-10">
              {[
                { label: 'Avg Rating', value: '4.9/5', icon: Sparkles, color: 'text-amber-500' },
                { label: 'Success Rate', value: '95%', icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Companies', value: '500+', icon: Briefcase, color: 'text-blue-500' },
                { label: 'Professionals', value: '50k+', icon: GraduationCap, color: 'text-purple-500' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* --- Search & Filters --- */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by Name, Company or Job Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xl"
                    : "bg-white text-slate-400 border border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Stories Grid --- */}
        <AnimatePresence mode="wait">
          {filteredStories.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredStories.map((story) => (
                  <SuccessStoryCard key={story.id} story={story} />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No transformation stories found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Try searching for a different company or role.</p>
              <Button 
                variant="primary" 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="!rounded-2xl !px-10"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </AnimatePresence>

        {/* --- Footer CTA --- */}
        <div className="mt-28 relative">
           <div className="absolute inset-0 bg-primary-500 rounded-[4rem] blur-[120px] opacity-10 pointer-events-none" />
           <div className="relative rounded-[4rem] bg-slate-950 p-12 lg:p-24 text-white overflow-hidden text-center">
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
                Landed a job? <br /><span className="text-primary-500">You deserve this spotlight.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
                We celebrate every win. If you've landed your dream role after studying with EDVO, let the world know.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="!rounded-2xl !px-12 !py-6 !text-lg !font-black shadow-2xl shadow-primary-500/30">
                  Submit Your Success Story
                </Button>
                <Button variant="outline" className="!rounded-2xl !px-12 !py-6 !text-lg !font-black !border-white !text-white hover:!bg-white/10">
                   Browse Roadmaps
                </Button>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
