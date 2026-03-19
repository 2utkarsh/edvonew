'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Head from 'next/head';
import { Star, Clock, Users, Award, Calendar } from 'lucide-react';
import Link from 'next/link';

const BootcampsPage = () => {
  const bootcamps = [
    {
      id: 1,
      title: 'AI Engineering Bootcamp',
      slug: 'ai-engineering-bootcamp',
      short_description: 'Become an AI-Enabled Software Engineer in 75 Days',
      level: 'advanced',
      duration_weeks: 9,
      live_sessions: 18,
      projects_count: 8,
      virtual_internships: 1,
      price: 48000,
      featured: true,
      category: { name: 'AI & Data Science' },
      average_rating: 4.9,
      total_reviews: 234,
      is_enrollment_open: true,
      remaining_slots: 25,
    },
    {
      id: 2,
      title: 'Data Analytics Bootcamp',
      slug: 'data-analytics-bootcamp',
      short_description: 'Complete learning path with job placement support',
      level: 'beginner',
      duration_weeks: 12,
      live_sessions: 24,
      projects_count: 18,
      virtual_internships: 2,
      price: 12900,
      featured: false,
      category: { name: 'Data Analytics' },
      average_rating: 4.8,
      total_reviews: 567,
      is_enrollment_open: true,
      remaining_slots: 40,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <Head>
        <title>Bootcamps</title>
      </Head>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live Cohorts & Bootcamps
          </h1>
          <p className="text-xl mb-8">
            Designed for Working Professionals Who Prefer Flexible Learning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">76K+</div>
              <div>Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold">6000+</div>
              <div>Recent Placements</div>
            </div>
            <div>
              <div className="text-3xl font-bold">353+</div>
              <div>Companies</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bootcamps.map((bootcamp) => (
          <Card key={bootcamp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {bootcamp.featured && (
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold text-center">
                Featured
              </div>
            )}
            
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{bootcamp.title}</h3>
              <p className="text-gray-600 mb-4">{bootcamp.short_description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{bootcamp.duration_weeks} Weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{bootcamp.live_sessions} Sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{bootcamp.projects_count} Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{bootcamp.virtual_internships} Internships</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant={bootcamp.level === 'beginner' ? 'default' : 'secondary'}>
                  {bootcamp.level}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{bootcamp.average_rating}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold">₹{bootcamp.price.toLocaleString()}</span>
                <p className="text-sm text-gray-600">{bootcamp.remaining_slots} slots left</p>
              </div>

              <div className="space-y-2">
                <Link href={`/bootcamps/${bootcamp.slug}`}>
                  <Button className="w-full">Know More</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BootcampsPage;
