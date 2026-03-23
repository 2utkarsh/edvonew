'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Search, Filter, BookOpen, ChevronDown, RadioTower } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { FadeIn } from '@/components/animations';
import CourseShowcaseCard from '@/components/marketing/CourseShowcaseCard';
import { publicFetchJson } from '@/lib/backend-api';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

type DisplayCourse = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  level?: string;
  description?: string;
  short_description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  duration?: string;
  thumbnail?: string;
  banner?: string;
  href?: string;
  rating?: number;
  reviewCount?: number;
  studentsEnrolled?: number;
  deliveryMode?: string;
  liveSessionsCount?: number;
};

type CoursesResponse = {
  success: boolean;
  data: {
    data: DisplayCourse[];
    meta: {
      page: number;
      total: number;
    };
  };
};

type CategoriesResponse = {
  success: boolean;
  data: CategoryItem[];
};

const levels = ['all', 'beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [coursesPayload, categoriesPayload] = await Promise.all([
          loadCourses({ selectedCategory, selectedLevel, sortBy, searchTerm }),
          publicFetchJson<CategoriesResponse>('/api/course-categories'),
        ]);

        if (!active) return;
        setCourses(coursesPayload);
        setCategories(categoriesPayload.data || []);
      } catch (error) {
        console.error('Error loading courses:', error);
        if (!active) return;
        setCourses([]);
        setCategories([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [selectedCategory, selectedLevel, sortBy]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setCourses(await loadCourses({ selectedCategory, selectedLevel, sortBy, searchTerm }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge variant="gradient" className="mb-4">Dynamic Learning Catalog</Badge>
            <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
              Choose a <span className="gradient-text">course path</span> that fits how you learn
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore live cohorts, recorded learning tracks, and hybrid programs managed directly from the admin workspace.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg dark:shadow-slate-900/50 mb-8 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for courses, skills, or career tracks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 !py-4 !text-lg"
                />
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-wrap gap-4 flex-1`}>
                <SelectField value={selectedCategory} onChange={setSelectedCategory} className="min-w-[220px]">
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </SelectField>

                <SelectField value={selectedLevel} onChange={setSelectedLevel} className="min-w-[220px]">
                  <option value="all">All Levels</option>
                  {levels.filter((level) => level !== 'all').map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </SelectField>

                <SelectField value={sortBy} onChange={setSortBy} className="min-w-[220px] ml-auto">
                  <option value="featured">Admin Order</option>
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </SelectField>
              </div>
            </div>
          </div>
        </FadeIn>

        {!loading && (
          <FadeIn>
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{courses.length}</span> courses
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <RadioTower className="w-4 h-4" />
                <span>Live, recorded, and hybrid formats are now controlled from admin.</span>
              </div>
            </div>
          </FadeIn>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, index) => <CardSkeleton key={index} />)
          ) : courses.length > 0 ? (
            courses.map((course, index) => (
              <FadeIn key={course.id} delay={index * 0.06}>
                <CourseCard course={course} />
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold mb-2 dark:text-white">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters or searching for a different track.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSortBy('featured');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SelectField({
  value,
  onChange,
  className,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className || ''}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-gray-100 dark:bg-slate-800 dark:text-gray-300 border-0 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
    </div>
  );
}

function CourseCard({ course }: { course: DisplayCourse }) {
  const paletteMap: Record<string, 'blue' | 'violet' | 'emerald' | 'amber'> = {
    live: 'amber',
    recorded: 'blue',
    hybrid: 'emerald',
  };

  const deliveryMode = (course.deliveryMode || 'recorded').toLowerCase();
  const levelLabel = course.level ? `${course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level` : 'Career Track';
  const badge = deliveryMode === 'live' ? 'Live Cohort' : deliveryMode === 'hybrid' ? 'Hybrid Access' : 'Recorded Track';
  const lecturesText = course.liveSessionsCount && course.liveSessionsCount > 0
    ? `${course.liveSessionsCount} live sessions`
    : 'Recorded modules';

  return (
    <CourseShowcaseCard
      href={course.href || `/courses/${course.slug}`}
      title={course.title}
      subtitle={course.description || course.short_description || 'Career-focused course experience with projects, sessions, and certificate support.'}
      category={course.category || 'General'}
      levelLabel={levelLabel}
      rating={Number(course.rating || 0).toFixed(1)}
      reviewsText={`${course.reviewCount || 0} reviews`}
      studentsText={`${course.studentsEnrolled || 0} enrolled`}
      price={formatCurrency(course.price || 0)}
      originalPrice={course.originalPrice ? formatCurrency(course.originalPrice) : undefined}
      discountLabel={course.discount ? `${course.discount}% OFF` : undefined}
      duration={course.duration || 'Flexible duration'}
      lectures={lecturesText}
      projects={deliveryMode === 'live' ? 'Mentor led' : 'Self paced'}
      badge={badge}
      palette={paletteMap[deliveryMode] || 'blue'}
      ctaLabel="Explore Program"
      imageSrc={course.thumbnail || course.banner}
    />
  );
}

async function loadCourses({
  selectedCategory,
  selectedLevel,
  sortBy,
  searchTerm,
}: {
  selectedCategory: string;
  selectedLevel: string;
  sortBy: string;
  searchTerm: string;
}) {
  const params = new URLSearchParams({ sort: sortBy });
  if (selectedCategory !== 'all') params.set('category', selectedCategory);
  if (selectedLevel !== 'all') params.set('level', selectedLevel);
  if (searchTerm.trim()) params.set('search', searchTerm.trim());

  const payload = await publicFetchJson<CoursesResponse>(`/api/courses?${params.toString()}`);
  return payload.data?.data || [];
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString()}`;
}
