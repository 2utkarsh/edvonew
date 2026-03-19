'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Play, 
  Linkedin, 
  MessageSquare,
  Quote,
  Clock,
  ExternalLink,
  Award
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// --- Types ---
type TestimonialType = 'text' | 'video' | 'linkedin';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating: number;
  date: string;
  type: TestimonialType;
  category: string;
  videoUrl?: string; // For video testimonials
  socialUrl?: string; // For LinkedIn testimonials
  courseName: string;
}

// --- Mock Data ---
const TOPICS = ['all', 'Data Science', 'SQL', 'Power BI', 'Python', 'Machine Learning', 'Excel', 'Web Development'];
const TYPES = ['all', 'text', 'video', 'linkedin'];

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ankit Sharma',
    role: 'Data Analyst',
    company: 'Amazon',
    content: 'The DA Bootcamp was a game changer for me. The structured roadmap helped me transition from a non-tech background to a high-paying data role.',
    rating: 5,
    date: '2 months ago',
    type: 'video',
    category: 'Data Science',
    videoUrl: 'https://vimeo.com/example/123',
    courseName: 'Data Analytics Bootcamp',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Software Engineer',
    company: 'Microsoft',
    content: 'Finally found a course that explains SQL concepts with practical business use cases. Highly recommend EDVO to anyone starting their tech journey.',
    rating: 5,
    date: '1 month ago',
    type: 'text',
    category: 'SQL',
    courseName: 'SQL Mastery for Professionals',
  },
  {
    id: '3',
    name: 'Rahul Varma',
    role: 'Business Analyst',
    company: 'Deloitte',
    content: 'Just finished my first dashboard! The Power BI course is so hands-on. I actually built something I can show in my interviews.',
    rating: 4,
    date: '3 weeks ago',
    type: 'linkedin',
    category: 'Power BI',
    socialUrl: 'https://linkedin.com/posts/example',
    courseName: 'Power BI Business Intelligence',
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    role: 'Student',
    company: 'IIT Madras',
    content: 'Python for Data Science was so easy to follow. The mentorship support is what makes EDVO stand out from other platforms.',
    rating: 5,
    date: '2 weeks ago',
    type: 'text',
    category: 'Python',
    courseName: 'Python for Data Science',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    role: 'ML Engineer',
    company: 'Swiggy',
    content: 'Mastered Machine Learning with EDVO. The capstone projects are realistic and challenging. Best investment for my career.',
    rating: 5,
    date: '5 days ago',
    type: 'video',
    category: 'Machine Learning',
    videoUrl: 'https://vimeo.com/example/456',
    courseName: 'Advanced Machine Learning',
  },
  {
    id: '6',
    name: 'Megha Gupta',
    role: 'Operations Lead',
    company: 'Flipkart',
    content: 'Excel wasn\'t enough for my role. Learning DA concepts here gave me the edge I needed for my promotion.',
    rating: 5,
    date: '10 days ago',
    type: 'linkedin',
    category: 'Excel',
    socialUrl: 'https://linkedin.com/posts/example-2',
    courseName: 'Advanced Excel for Business',
  },
  {
    id: '7',
    name: 'Arjun Das',
    role: 'Full Stack Developer',
    company: 'Zomato',
    content: 'The Web Dev path is incredibly detailed. From React to Node, everything is covered with clear projects. Helped me land my dream job.',
    rating: 5,
    date: '3 months ago',
    type: 'text',
    category: 'Web Development',
    courseName: 'Full Stack Web Development',
  },
  {
    id: '8',
    name: 'Sanjana Rao',
    role: 'Fresher',
    company: 'TCS',
    content: 'As a fresher, I was confused about where to start. EDVO\'s roadmap for beginners was exactly what I needed. SQL and Python were taught so well!',
    rating: 4,
    date: '1 week ago',
    type: 'video',
    category: 'SQL',
    videoUrl: 'https://vimeo.com/example/789',
    courseName: 'SQL Mastery for Professionals',
  },
  {
    id: '9',
    name: 'Karan Mehra',
    role: 'Data Scientist',
    company: 'Uber',
    content: 'Structured learning at its best. The mentor support for Python and ML questions was instant. Really appreciated the depth of content.',
    rating: 5,
    date: '4 days ago',
    type: 'linkedin',
    category: 'Python',
    socialUrl: 'https://linkedin.com/posts/example-3',
    courseName: 'Python for Data Science',
  }
];

// --- Sub-components ---

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const Icon = testimonial.type === 'video' ? Play : testimonial.type === 'linkedin' ? Linkedin : MessageSquare;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Type Badge */}
      <div className="absolute top-6 right-6">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
          testimonial.type === 'video' ? "bg-red-50 text-red-500 dark:bg-red-500/10" :
          testimonial.type === 'linkedin' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10" :
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Course & Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3.5 h-3.5", i < testimonial.rating ? "fill-current" : "text-gray-200 dark:text-slate-800")} />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500">•</span>
        <span className="text-[10px] uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400">
          {testimonial.courseName}
        </span>
      </div>

      {/* Content */}
      <div className="relative mb-6 flex-grow">
        <Quote className="absolute -top-1 -left-1 w-8 h-8 text-gray-100 dark:text-slate-800/50 -z-10" />
        <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
          {testimonial.content}
        </p>
      </div>

      {/* User Info */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800/50 flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">
          {testimonial.avatar ? (
            <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
          ) : (
            testimonial.name.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white truncate transition-colors">
            {testimonial.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
            {testimonial.role} at <span className="text-gray-700 dark:text-slate-400 font-medium">{testimonial.company}</span>
          </p>
        </div>
      </div>

      {/* Date & Link */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-400 font-medium italic">
          <Clock className="w-3 h-3" />
          {testimonial.date}
        </div>
        {testimonial.type !== 'text' && (
          <button className="text-[10px] font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline group-hover:gap-1.5 transition-all">
            {testimonial.type === 'video' ? 'Watch Story' : 'View Post'}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function TestimonialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTestimonials = useMemo(() => {
    return MOCK_TESTIMONIALS.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTopic = selectedTopic === 'all' || t.category === selectedTopic;
      const matchType = selectedType === 'all' || t.type === selectedType;
      return matchSearch && matchTopic && matchType;
    });
  }, [searchTerm, selectedTopic, selectedType]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">Success Stories</Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
              Real People. <span className="gradient-text">Real Results.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover how thousands of learners transformed their careers with EDVO&apos;s structured learning paths.
            </p>
          </div>
        </FadeIn>

        {/* Search & Filter Bar */}
        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-gray-200/50 dark:shadow-slate-900/50 mb-12 border border-white dark:border-slate-800 transition-all">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-grow">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search testimonials by name, skills, or courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 !py-5 !text-lg !rounded-3xl border-gray-100 dark:border-slate-800 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden !rounded-2xl"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className={cn(
                  "flex-wrap gap-4 flex-1 lg:flex",
                  showFilters ? "flex" : "hidden"
                )}>
                  {/* Topic Select */}
                  <div className="relative group min-w-[180px]">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent hover:border-gray-200 dark:hover:border-slate-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 pr-12 focus:outline-none focus:border-primary-500 transition-all cursor-pointer font-medium text-sm"
                    >
                      <option value="all">Every Topic</option>
                      {TOPICS.filter(t => t !== 'all').map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                  </div>

                  {/* Type Select */}
                  <div className="relative group min-w-[180px]">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent hover:border-gray-200 dark:hover:border-slate-700 dark:text-gray-300 rounded-2xl px-6 py-3.5 pr-12 focus:outline-none focus:border-primary-500 transition-all cursor-pointer font-medium text-sm"
                    >
                      <option value="all">All Post Types</option>
                      <option value="video">🚀 Video Stories</option>
                      <option value="linkedin">🧵 LinkedIn Highlights</option>
                      <option value="text">✍️ Text Reviews</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Results Counter */}
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-gray-500 dark:text-slate-500 font-medium">
              Found <span className="text-gray-900 dark:text-white font-bold">{filteredTestimonials.length}</span> inspirational stories
            </h2>
            <div className="hidden sm:flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Live Updates</span>
            </div>
          </div>
        </FadeIn>

        {/* Grid */}
        {filteredTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((testimonial, index) => (
              <FadeIn key={testimonial.id} delay={0.1 * index}>
                <TestimonialCard testimonial={testimonial} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
             <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-300 dark:text-slate-700" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching stories found</h3>
             <p className="text-gray-500 dark:text-slate-500">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
             <Button 
                variant="outline" 
                className="mt-8 !rounded-2xl"
                onClick={() => {
                   setSearchTerm('');
                   setSelectedTopic('all');
                   setSelectedType('all');
                }}
             >
                Reset all filters
             </Button>
          </div>
        )}

        {/* Call to Action */}
        <FadeIn delay={0.5}>
          <div className="mt-24 relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-primary-600 to-indigo-700 p-12 text-white shadow-2xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Award className="w-64 h-64" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Be the next success story.</h2>
              <p className="text-lg text-primary-100 mb-8 leading-relaxed">
                Join 500k+ learners who are upskilling with EDVO. Start your journey today and landing your dream job in tech.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="!rounded-2xl !px-8 !py-6 !text-lg !bg-white !text-primary-700 border-none hover:!bg-white/90 transition-all font-black shadow-xl"
                  style={{ backgroundImage: 'none' }}
                >
                  Explore Courses
                </Button>
                <Button variant="outline" className="!rounded-2xl !px-8 !py-6 !text-lg !border-white !text-white hover:!bg-white/10 transition-all font-black">
                   Free Resources
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}


