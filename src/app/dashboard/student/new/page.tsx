'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, Clock, BookOpen, Award, TrendingUp, ChevronRight,
  Play, FileText, Users, Target, Zap, CheckCircle, Lock
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Widget Components
function StatCard({ icon: Icon, label, value, change, color }: any) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            change > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </motion.div>
  );
}

function TodayClassCard({ classItem }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Play className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{classItem.title}</h4>
        <p className="text-sm text-gray-500">{classItem.instructor}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-medium text-gray-900">{classItem.time}</div>
        <div className="text-xs text-gray-500">{classItem.duration}</div>
      </div>
    </div>
  );
}

function ProjectCard({ project, status }: any) {
  const statusColors = {
    in_progress: 'bg-blue-50 text-blue-600',
    pending_review: 'bg-yellow-50 text-yellow-600',
    approved: 'bg-green-50 text-green-600',
    locked: 'bg-gray-100 text-gray-400',
  } satisfies Record<'in_progress' | 'pending_review' | 'approved' | 'locked', string>;

  return (
    <div className={`p-4 rounded-xl border ${
      status === 'locked' ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-md'
    } transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {status === 'locked' ? (
            <Lock className="w-4 h-4 text-gray-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        {project.deadline && (
          <span className="text-xs text-gray-500">Due: {project.deadline}</span>
        )}
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{project.title}</h4>
      <p className="text-sm text-gray-500 mb-3">{project.description}</p>
      {status !== 'locked' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2 w-24">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{project.progress}%</span>
          </div>
          <button className="text-sm text-indigo-600 font-medium hover:underline">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function LeaderboardItem({ rank, name, score, avatar }: any) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        rank === 1 ? 'bg-yellow-100 text-yellow-600' :
        rank === 2 ? 'bg-gray-100 text-gray-600' :
        rank === 3 ? 'bg-orange-100 text-orange-600' :
        'bg-gray-50 text-gray-500'
      }`}>
        {rank}
      </div>
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
        {avatar}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{score} points</div>
      </div>
    </div>
  );
}

function ModuleProgress({ module, isLocked }: any) {
  return (
    <div className={`relative ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
        {isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold">{module.number}</span>
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{module.title}</h4>
          <p className="text-sm text-gray-500">{module.lessons} lessons • {module.duration}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{module.progress}%</div>
          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full" 
              style={{ width: `${module.progress}%` }}
            />
          </div>
        </div>
      </div>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
          <div className="text-center">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-500">Complete previous module</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  // Mock Data
  const stats = [
    { icon: BookOpen, label: 'Courses Enrolled', value: '5', change: 12, color: 'indigo' },
    { icon: Clock, label: 'Hours Learned', value: '127', change: 8, color: 'blue' },
    { icon: Award, label: 'Certificates', value: '3', change: 0, color: 'emerald' },
    { icon: Target, label: 'Projects Done', value: '12', change: 25, color: 'purple' },
  ];

  const todayClasses = [
    { title: 'React Advanced Patterns', instructor: 'Dr. Sarah Johnson', time: '10:00 AM', duration: '1h 30m' },
    { title: 'Node.js Microservices', instructor: 'Prof. Michael Chen', time: '2:00 PM', duration: '1h' },
    { title: 'System Design Workshop', instructor: 'Alex Kumar', time: '4:30 PM', duration: '2h' },
  ];

  const projects = [
    { title: 'E-commerce API', description: 'Build a RESTful API for an e-commerce platform', progress: 75, deadline: 'Mar 15', status: 'in_progress' },
    { title: 'React Dashboard', description: 'Create an admin dashboard with charts', progress: 100, deadline: 'Mar 10', status: 'pending_review' },
    { title: 'Database Design', description: 'Design schema for a social media app', progress: 0, deadline: 'Mar 20', status: 'locked' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Priya Sharma', score: 2840, avatar: 'PS' },
    { rank: 2, name: 'Rahul Verma', score: 2720, avatar: 'RV' },
    { rank: 3, name: 'Ananya Iyer', score: 2650, avatar: 'AI' },
    { rank: 4, name: 'You', score: 2480, avatar: 'YU' },
    { rank: 5, name: 'Vikram Singh', score: 2390, avatar: 'VS' },
  ];

  const modules = [
    { number: 1, title: 'Fundamentals of Web Development', lessons: 12, duration: '8 hours', progress: 100 },
    { number: 2, title: 'React.js Essentials', lessons: 18, duration: '12 hours', progress: 65 },
    { number: 3, title: 'Node.js & Express', lessons: 15, duration: '10 hours', progress: 0 },
    { number: 4, title: 'Database Management', lessons: 10, duration: '6 hours', progress: 0 },
  ];

  return (
    <DashboardLayout userRole="student" userName="Arnav Pal">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Arnav! 👋</h1>
            <p className="text-gray-500 mt-1">Continue your learning journey</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Resume Learning
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Today's Classes</h2>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="p-4 space-y-3">
                {todayClasses.map((classItem, index) => (
                  <TodayClassCard key={index} classItem={classItem} />
                ))}
              </div>
            </div>

            {/* Projects & Deadlines */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Projects & Deadlines</h2>
                <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
              </div>
              <div className="p-4 grid gap-4">
                {projects.map((project, index) => (
                  <ProjectCard key={index} project={project} status={project.status} />
                ))}
              </div>
            </div>

            {/* Module Progression */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Course Progress</h2>
                <p className="text-sm text-gray-500 mt-1">Full Stack Web Development</p>
              </div>
              <div className="p-4 space-y-3">
                {modules.map((module, index) => (
                  <ModuleProgress 
                    key={module.number} 
                    module={module} 
                    isLocked={index > 1 && modules[index - 1].progress < 100}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Learning Streak */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6" />
                <h3 className="font-semibold">Learning Streak</h3>
              </div>
              <div className="text-4xl font-bold mb-2">15 Days</div>
              <p className="text-indigo-100 text-sm">Keep going! You're on fire 🔥</p>
              <div className="mt-4 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 bg-white/30 rounded-full">
                    <div className="h-full bg-white rounded-full" style={{ width: i < 5 ? '100%' : '0%' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Leaderboard</h2>
              </div>
              <div className="p-2">
                {leaderboard.map((item) => (
                  <LeaderboardItem key={item.rank} {...item} />
                ))}
              </div>
            </div>

            {/* Upcoming Tests */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Upcoming Tests</h2>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">React Assessment</div>
                    <div className="text-xs text-gray-500">Tomorrow, 3:00 PM</div>
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Urgent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Node.js Quiz</div>
                    <div className="text-xs text-gray-500">Mar 18, 11:00 AM</div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-full">5 days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Browse Courses</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">View Certificates</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Join Community</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
