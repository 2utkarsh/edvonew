'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, DollarSign, TrendingUp, Plus, Edit, Trash2, 
  Eye, MessageSquare, Star, BarChart3, Upload, Video, FileText, Award 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { FadeIn, StaggerGrid } from '@/components/animations';

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('courses');

  const instructorCourses = [
    {
      id: '1',
      title: 'Complete Python Programming Masterclass',
      students: 89543,
      rating: 4.8,
      reviews: 15420,
      revenue: 268629,
      status: 'published',
      thumbnail: '/images/courses/python.jpg',
      lastUpdated: '2 days ago',
    },
    {
      id: '2',
      title: 'Advanced Machine Learning with Python',
      students: 34200,
      rating: 4.7,
      reviews: 5680,
      revenue: 102600,
      status: 'published',
      thumbnail: '/images/courses/ml.jpg',
      lastUpdated: '1 week ago',
    },
    {
      id: '3',
      title: 'Web Scraping and Automation',
      students: 12500,
      rating: 4.6,
      reviews: 2340,
      revenue: 37500,
      status: 'draft',
      thumbnail: '/images/courses/scraping.jpg',
      lastUpdated: '3 days ago',
    },
  ];

  const recentReviews = [
    { student: 'Priya S.', course: 'Python Programming', rating: 5, comment: 'Excellent course! Very detailed and easy to follow.', date: '2 hours ago' },
    { student: 'Rahul M.', course: 'Machine Learning', rating: 5, comment: 'Best ML course I have taken. Highly recommended!', date: '5 hours ago' },
    { student: 'Ananya K.', course: 'Python Programming', rating: 4, comment: 'Great content, but would love more practice exercises.', date: '1 day ago' },
  ];

  const stats = [
    { label: 'Total Students', value: '136,243', icon: Users, change: '+12% this month', color: 'blue' },
    { label: 'Total Revenue', value: '₹4.08L', icon: DollarSign, change: '+28% this month', color: 'green' },
    { label: 'Average Rating', value: '4.7', icon: Star, change: 'Top 5% instructor', color: 'yellow' },
    { label: 'Courses Published', value: '8', icon: BookOpen, change: '2 in draft', color: 'purple' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <Badge variant="gradient" className="mb-4">Instructor Dashboard</Badge>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                Welcome back, Dr. Rajesh! 👨‍🏫
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your courses and track your performance
              </p>
            </div>
            <Button variant="primary" size="lg" className="group">
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Create New Course
            </Button>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <StaggerGrid staggerDelay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={stat.label} className="!p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <Badge variant={stat.color === 'green' ? 'success' : stat.color === 'yellow' ? 'warning' : 'info'} size="sm">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </StaggerGrid>

        {/* Tabs */}
        <FadeIn delay={0.2}>
          <div className="flex gap-4 mb-8 overflow-x-auto">
            {[
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'courses' && (
              <>
                <FadeIn>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Courses</h2>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                  </div>
                </FadeIn>

                <StaggerGrid staggerDelay={0.1}>
                  <div className="space-y-6">
                    {instructorCourses.map((course) => (
                      <Card key={course.id} className="!p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/30" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
                              <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                                {course.status === 'published' ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                {course.students.toLocaleString()} students
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {course.rating} ({course.reviews.toLocaleString()} reviews)
                              </div>
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <DollarSign className="w-4 h-4" />
                                ₹{course.revenue.toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                Updated {course.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </StaggerGrid>
              </>
            )}

            {activeTab === 'reviews' && (
              <FadeIn>
                <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
                <div className="space-y-6">
                  {recentReviews.map((review, index) => (
                    <Card key={index} className="!p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {review.student.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.student}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{review.course}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <FadeIn delay={0.2}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" fullWidth className="justify-start">
                      <Video className="w-4 h-4 mr-2" />
                      Upload Lecture
                    </Button>
                    <Button variant="outline" fullWidth className="justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Assignment
                    </Button>
                    <Button variant="outline" fullWidth className="justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Announce to Students
                    </Button>
                    <Button variant="outline" fullWidth className="justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Performance Overview */}
            <FadeIn delay={0.3}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Performance
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Course Completion Rate</span>
                        <span className="font-semibold">78%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '78%' }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Student Satisfaction</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '94%' }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="font-semibold">2.5 hrs</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeIn>

            {/* Top Performing Course */}
            <FadeIn delay={0.4}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">🏆 Top Performer</h3>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">Python Programming</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Your most popular course with 89K+ students
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-bold text-green-600">₹2.68L</div>
                        <div className="text-gray-500">Revenue</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600">4.8★</div>
                        <div className="text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </main>
  );
}

