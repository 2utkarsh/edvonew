'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search, Filter, BookOpen, ChevronDown
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { FadeIn } from '@/components/animations';
import { Course } from '@/types';
import CourseShowcaseCard from '@/components/marketing/CourseShowcaseCard';

type DisplayCourse = Partial<Course> & {
  id: string | number;
  title: string;
  category?: string;
  level?: string;
  description?: string;
  short_description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  duration?: string;
  lectures?: number;
  thumbnail?: string;
  banner?: string;
  href?: string;
  rating?: number;
  average_rating?: number;
  reviewCount?: number;
  reviews_count?: number;
  studentsEnrolled?: number;
  enrollments_count?: number;
};

const featuredCourses: DisplayCourse[] = [
  {
    id: 'featured-mba',
    title: 'MBA Career Accelerator',
    description: 'Build business strategy, finance, operations, and leadership skills with practical case-based learning.',
    category: 'MBA',
    level: 'intermediate',
    rating: 4.8,
    reviewCount: 4200,
    studentsEnrolled: 89543,
    price: 2999,
    originalPrice: 7999,
    discount: 63,
    duration: '24 weeks',
    lectures: 62,
    thumbnail: '/images/courses/management.svg',
    href: '/courses',
  },
  {
    id: 'featured-cs',
    title: 'Computer Science Foundations',
    description: 'Cover programming, data structures, algorithms, systems, and core problem-solving for modern tech roles.',
    category: 'CS',
    level: 'beginner',
    rating: 4.9,
    reviewCount: 6100,
    studentsEnrolled: 125000,
    price: 4999,
    originalPrice: 12999,
    discount: 61,
    duration: '32 weeks',
    lectures: 96,
    thumbnail: '/images/courses/computer-science.svg',
    href: '/courses',
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Computer Science', 'Management'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { sort: sortBy };
      if (selectedLevel !== 'all') params.level = selectedLevel;
      if (searchTerm) params.search = searchTerm;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/courses`, { params });
      setCourses(mergeFeaturedCourses((response.data.data || []) as DisplayCourse[]));
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(featuredCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const visibleCourses = getVisibleCourses(courses, selectedCategory, searchTerm);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Explore Courses</Badge>
            <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
              Find Your Perfect <span className="gradient-text">Course</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Focused programs in Computer Science and Management with practical projects and career outcomes.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-slate-900/50 mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for courses, skills, or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 !py-4 !text-lg"
                />
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-wrap gap-4 flex-1`}>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-gray-100 dark:bg-slate-800 dark:text-gray-300 border-0 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="appearance-none bg-gray-100 dark:bg-slate-800 dark:text-gray-300 border-0 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="all">All Levels</option>
                    {levels.filter((l) => l !== 'all').map((level) => (
                      <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative ml-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-100 dark:bg-slate-800 dark:text-gray-300 border-0 rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {!loading && (
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{visibleCourses.length}</span> courses
              </p>
            </div>
          </FadeIn>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : visibleCourses.length > 0 ? (
            visibleCourses.map((course, index) => (
              <FadeIn key={String(course.id)} delay={index * 0.1}>
                <CourseCard course={course} />
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold mb-2 dark:text-white">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: DisplayCourse }) {
  const displayCategory = getDisplayCategory(course.category);
  const paletteMap: Record<string, 'blue' | 'violet' | 'emerald' | 'amber'> = {
    'Computer Science': 'blue',
    Management: 'amber',
  };

  const levelLabel =
    course.level === 'beginner'
      ? 'Beginner Friendly'
      : course.level === 'intermediate'
        ? 'Intermediate Track'
        : 'Advanced Track';

  return (
    <CourseShowcaseCard
      href={course.href || `/courses/${course.id}`}
      title={course.title}
      subtitle={course.description || course.short_description || 'Practical learning path with mentor support and career-focused outcomes.'}
      category={displayCategory}
      levelLabel={levelLabel}
      rating={formatRating(course)}
      reviewsText={formatCompact(course.reviewCount || course.reviews_count || 0)}
      studentsText={`${formatCompact(course.studentsEnrolled || course.enrollments_count || 0)} enrolled`}
      price={formatCurrency(course.price || 0)}
      originalPrice={course.originalPrice ? formatCurrency(course.originalPrice) : undefined}
      discountLabel={course.discount ? `${course.discount}% OFF` : undefined}
      duration={course.duration || 'Self paced'}
      lectures={`${course.lectures || 0} lessons`}
      projects={displayCategory === 'Management' ? '8 case studies' : '12 coding projects'}
      badge={course.discount ? 'Hot Deal' : 'Featured'}
      palette={paletteMap[displayCategory] || 'blue'}
      ctaLabel="Explore Program"
      imageSrc={course.thumbnail || course.banner}
    />
  );
}

function getDisplayCategory(category?: string) {
  const normalized = (category || '').trim().toLowerCase();

  if (['management', 'mba', 'business', 'finance', 'operations', 'leadership'].includes(normalized)) {
    return 'Management';
  }

  return 'Computer Science';
}

function getVisibleCourses(courses: DisplayCourse[], selectedCategory: string, searchTerm: string) {
  return courses.filter((course) => {
    const matchesCategory = selectedCategory === 'all' || getDisplayCategory(course.category) === selectedCategory;
    const haystack = `${course.title} ${course.description || ''} ${course.short_description || ''} ${course.category || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function mergeFeaturedCourses(apiCourses: DisplayCourse[]) {
  const seen = new Set(apiCourses.map((course) => course.title.toLowerCase()));
  const missingFeatured = featuredCourses.filter((course) => !seen.has(course.title.toLowerCase()));
  return [...missingFeatured, ...apiCourses];
}

function formatCompact(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return `${num}`;
}

function formatCurrency(num: number) {
  return `Rs ${num.toLocaleString()}`;
}

function formatRating(course: DisplayCourse) {
  const rating = course.rating || course.average_rating || 0;
  return Number(rating).toFixed(1);
}
