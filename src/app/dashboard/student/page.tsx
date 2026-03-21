'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Award, TrendingUp, Play, Calendar, Target, 
  Star, ChevronRight, BarChart3, FileText, MessageSquare 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { FadeIn, StaggerGrid } from '@/components/animations';
import { Navbar, Footer } from '@/components/layout';

type StoredAuthUser = {
  name?: string;
};

function readStoredUserName() {
  if (typeof window === 'undefined') {
    return 'Student';
  }

  try {
    const storedUser = window.localStorage.getItem('auth_user');
    if (!storedUser) {
      return 'Student';
    }

    const parsedUser = JSON.parse(storedUser) as StoredAuthUser | null;
    const nextName = parsedUser?.name?.trim();

    return nextName || 'Student';
  } catch {
    return 'Student';
  }
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const syncUserName = () => {
      setUserName(readStoredUserName());
    };

    syncUserName();
    window.addEventListener('storage', syncUserName);
    window.addEventListener('auth-change', syncUserName as EventListener);

    return () => {
      window.removeEventListener('storage', syncUserName);
      window.removeEventListener('auth-change', syncUserName as EventListener);
    };
  }, []);

  const enrolledCourses = [
    {
      id: '1',
      title: 'Complete Python Programming Masterclass',
      instructor: 'Dr. Rajesh Kumar',
      progress: 65,
      totalLectures: 342,
      completedLectures: 222,
      thumbnail: '/images/courses/python.jpg',
      nextLesson: 'Object-Oriented Programming in Python',
      lastAccessed: '2 hours ago',
    },
    {
      id: '2',
      title: 'Full Stack Web Development Bootcamp',
      instructor: 'Angela Yu',
      progress: 32,
      totalLectures: 425,
      completedLectures: 136,
      thumbnail: '/images/courses/fullstack.jpg',
      nextLesson: 'React Hooks Deep Dive',
      lastAccessed: '1 day ago',
    },
    {
      id: '3',
      title: 'Data Structures & Algorithms in Java',
      instructor: 'Tim Buchalka',
      progress: 89,
      totalLectures: 380,
      completedLectures: 338,
      thumbnail: '/images/courses/dsa.jpg',
      nextLesson: 'Dynamic Programming - Advanced Patterns',
      lastAccessed: '5 hours ago',
    },
  ];

  const achievements = [
    { icon: Star, title: 'Fast Learner', description: 'Completed 10 lectures in a week', unlocked: true, color: 'from-yellow-500 to-orange-500' },
    { icon: Target, title: 'On Track', description: '7-day learning streak', unlocked: true, color: 'from-green-500 to-emerald-500' },
    { icon: Award, title: 'Course Champion', description: 'Completed first course', unlocked: true, color: 'from-blue-500 to-purple-500' },
    { icon: TrendingUp, title: 'Rising Star', description: 'Top 10% in your cohort', unlocked: false, color: 'from-pink-500 to-red-500' },
  ];

  const upcomingDeadlines = [
    { course: 'Python Programming', assignment: 'Build a Weather App', dueDate: 'Tomorrow', priority: 'high' },
    { course: 'Web Development', assignment: 'React Portfolio Project', dueDate: '3 days', priority: 'medium' },
    { course: 'DSA in Java', assignment: 'Graph Algorithms Quiz', dueDate: '5 days', priority: 'low' },
  ];

  const stats = [
    { label: 'Courses Enrolled', value: '5', icon: BookOpen, change: '+2 this month' },
    { label: 'Hours Learned', value: '127', icon: Clock, change: '+15 this week' },
    { label: 'Certificates Earned', value: '2', icon: Award, change: 'Keep going!' },
    { label: 'Average Score', value: '87%', icon: TrendingUp, change: '+5% improvement' },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <FadeIn>
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                  <motion.h1 
                    className="text-4xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Welcome back, {userName}! </motion.h1>
                  <p className="text-xl text-white/90">
                    Ready to continue your learning journey?
                  </p>
                </div>
                <Button variant="secondary" size="lg" className="!bg-white !text-blue-600 hover:!bg-gray-100">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Schedule
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <stat.icon className="w-8 h-8 mb-3 text-white/80" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-white/70 mb-1">{stat.label}</div>
                    <div className="text-xs text-white/60">{stat.change}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.2}>
          <div className="flex gap-4 mb-8 overflow-x-auto">
            {[
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'progress', label: 'Progress', icon: BarChart3 },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'settings', label: 'Settings', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
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
            {/* Continue Learning */}
            <FadeIn>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Continue Learning</h2>
                <Button variant="ghost" size="sm" className="group">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </FadeIn>

            <StaggerGrid staggerDelay={0.15}>
              <div className="space-y-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="!p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <BookOpen className="w-12 h-12 text-white/30" />
                        <motion.div 
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-10 h-10 text-white" />
                        </motion.div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{course.instructor}</p>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-semibold">{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{course.completedLectures}</span>/{course.totalLectures} lectures
                          </div>
                          <Button variant="primary" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </StaggerGrid>

            {/* Achievements */}
            <FadeIn delay={0.3}>
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Your Achievements</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      className={`relative p-6 rounded-2xl text-center ${
                        achievement.unlocked
                          ? 'bg-white dark:bg-slate-900 shadow-lg'
                          : 'bg-gray-100 dark:bg-slate-900/50 opacity-50'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={achievement.unlocked ? { y: -5, scale: 1.05 } : undefined}
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center`}>
                        <achievement.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
                          <Award className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <FadeIn delay={0.2}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          deadline.priority === 'high' ? 'bg-red-500' :
                          deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{deadline.assignment}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{deadline.course}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due: {deadline.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" fullWidth size="sm" className="mt-4">
                    View All Deadlines
                  </Button>
                </div>
              </Card>
            </FadeIn>

            {/* Daily Goal */}
            <FadeIn delay={0.3}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Daily Goal
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold gradient-text mb-2">45/60 min</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You're on fire! 🔥</p>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    15 more minutes to reach your goal!
                  </p>
                </div>
              </Card>
            </FadeIn>

            {/* Need Help? */}
            <FadeIn delay={0.4}>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Need Help?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Our support team is here to assist you 24/7
                  </p>
                  <Button variant="outline" fullWidth className="mb-3">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="ghost" fullWidth>
                    Visit Help Center
                  </Button>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
