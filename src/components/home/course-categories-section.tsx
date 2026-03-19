'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Star, Crown } from 'lucide-react';
import { getCourseArtwork } from '@/lib/marketing-images';

interface Course {
  id: number;
  title: string;
  rating: number;
  reviews: number;
  enrolled: string;
  price: number;
  badge?: string;
}

interface CourseCategorySectionProps {
  title: string;
  subtitle: string;
  courses: Course[];
  bgColor?: string;
}

const CourseCategorySection = ({ title, subtitle, courses, bgColor = 'bg-background' }: CourseCategorySectionProps) => {
  return (
    <section className={`py-16 px-4 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                {course.badge && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-accent-300 text-accent-900 font-semibold dark:bg-accent-500 dark:text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      {course.badge}
                    </Badge>
                  </div>
                )}
                <img
                  src={getCourseArtwork(course.title)}
                  alt={course.title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{course.title}</h3>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{course.rating}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">({course.reviews})</span>
                </div>

                <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                  {course.enrolled} Enrolled
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-950 dark:text-white">Rs {course.price.toLocaleString()}</span>
                    <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">(Incl. of all taxes)</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export const DataAnalyticsSection = () => {
  const courses = [
    { id: 1, title: 'Excel: Mother of Business Intelligence', rating: 4.9, reviews: 1889, enrolled: '10,232', price: 1500, badge: 'Best Seller' },
    { id: 2, title: 'Get Job Ready: Power BI Data Analytics for All Levels 3.0', rating: 4.9, reviews: 904, enrolled: '7,484', price: 3300 },
    { id: 3, title: 'SQL Beginner to Advanced For Data Professionals', rating: 4.9, reviews: 1377, enrolled: '9,404', price: 1500 },
    { id: 4, title: 'Python: Beginner to Advanced For Data Professionals', rating: 4.9, reviews: 416, enrolled: '7,963', price: 1200 },
    { id: 5, title: 'AI Automation for Data Professionals', rating: 5.0, reviews: 61, enrolled: '182', price: 1800, badge: 'Brand New' },
    { id: 6, title: 'Data Engineering Basics for Data Analysts', rating: 4.9, reviews: 65, enrolled: '225', price: 1500, badge: 'Brand New' },
  ];

  return <CourseCategorySection title="Data Analytics Courses" subtitle="Master the tools and thinking behind every data-driven decision" courses={courses} bgColor="bg-background dark:bg-slate-900" />;
};

export const AIDataScienceSection = () => {
  const courses = [
    { id: 1, title: 'Gen AI to Agentic AI with Business Projects', rating: 5.0, reviews: 193, enrolled: '1,193', price: 2700, badge: 'Brand New' },
    { id: 2, title: 'Master Machine Learning for Data Science & AI: Beginner to Advanced', rating: 5.0, reviews: 234, enrolled: '4,129', price: 1800 },
    { id: 3, title: 'Deep Learning: Beginner to Advanced', rating: 4.9, reviews: 65, enrolled: '989', price: 1200 },
    { id: 4, title: 'Math and Statistics For AI, Data Science', rating: 5.0, reviews: 161, enrolled: '2,078', price: 900 },
  ];

  return <CourseCategorySection title="AI & Data Science Courses" subtitle="Understand the science behind AI and learn to build real-world models, one concept at a time" courses={courses} bgColor="bg-slate-50 dark:bg-slate-950" />;
};

export const ProfessionalSkillsSection = () => {
  const courses = [
    { id: 1, title: 'AI Toolkit For Professionals', rating: 5.0, reviews: 61, enrolled: '2,249', price: 1800 },
    { id: 2, title: 'Mastering Communication & Stakeholder Management', rating: 5.0, reviews: 718, enrolled: '718', price: 600, badge: 'Brand New' },
    { id: 3, title: 'Mastering Time Management & Deep Work', rating: 5.0, reviews: 380, enrolled: '380', price: 900, badge: 'Brand New' },
    { id: 4, title: 'Personal Branding (LinkedIn & Beyond) for All Professionals', rating: 5.0, reviews: 44, enrolled: '44', price: 900, badge: 'Brand New' },
  ];

  return <CourseCategorySection title="Professional Upskilling Courses" subtitle="Sharpen the timeless skills that set great professionals apart" courses={courses} bgColor="bg-background dark:bg-slate-900" />;
};

export default CourseCategorySection;
