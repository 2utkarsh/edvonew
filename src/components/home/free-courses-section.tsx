'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { getCourseArtwork } from '@/lib/marketing-images';

const FreeCoursesSection = () => {
  const freeCourses = [
    {
      id: 1,
      title: 'Object-oriented Programming Python Tutorial',
      enrolled: '1,484',
    },
    {
      id: 2,
      title: 'Potato Disease Classification Free Course',
      enrolled: '3,287',
      badge: 'Deep Learning Project',
    },
    {
      id: 3,
      title: 'End-to-End Data Analytics Project with Power BI | Hospitality Domain',
      enrolled: '479',
    },
    {
      id: 4,
      title: 'Why You Should Learn Python - Hindi Tutorial',
      enrolled: '1,480',
    },
  ];

  return (
    <section className="px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">Free Courses</h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
            Explore free, beginner-friendly courses that introduce key concepts and prepare you for advanced learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freeCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                {course.badge && (
                  <Badge className="absolute top-2 left-2 z-10 bg-accent-300 text-accent-900 dark:bg-accent-500 dark:text-white">
                    {course.badge}
                  </Badge>
                )}
                <img
                  src={getCourseArtwork(course.title)}
                  alt={course.title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{course.title}</h3>
                <div className="mb-3 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled} Enrolled</span>
                </div>
                <Badge variant="secondary" className="w-full justify-center">Free</Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link href="/courses">
            <Button variant="outline" className="gap-2">
              Explore All Courses <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">Left</Button>
            <Button variant="outline" size="icon">Right</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeCoursesSection;
