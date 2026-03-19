'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Calendar, Clock, CheckCircle, XCircle,
  Play, FileText, BarChart3, Settings, Plus, MoreVertical,
  ChevronDown, Video, Edit, Trash2, Eye, Copy
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Course Builder Component
function CourseBuilder() {
  const [expandedProgram, setExpandedProgram] = useState<string | null>('program-1');

  const programs = [
    {
      id: 'program-1',
      title: 'Full Stack Web Development',
      subjects: [
        {
          id: 'subject-1',
          title: 'Frontend Development',
          modules: [
            { id: 'module-1', title: 'HTML & CSS Basics', lessons: 8, duration: '4h', status: 'published' },
            { id: 'module-2', title: 'JavaScript Fundamentals', lessons: 12, duration: '8h', status: 'published' },
            { id: 'module-3', title: 'React.js Essentials', lessons: 15, duration: '10h', status: 'draft' },
          ]
        },
        {
          id: 'subject-2',
          title: 'Backend Development',
          modules: [
            { id: 'module-4', title: 'Node.js Introduction', lessons: 10, duration: '6h', status: 'draft' },
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div key={program.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">{program.title}</span>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                {program.subjects.length} Subjects
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedProgram === program.id && (
            <div className="border-t border-gray-100">
              {program.subjects.map((subject) => (
                <div key={subject.id} className="border-b border-gray-100 last:border-0">
                  <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{subject.title}</span>
                      <span className="text-xs text-gray-500">({subject.modules.length} modules)</span>
                    </div>
                    <button className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Module
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {subject.modules.map((module) => (
                      <div key={module.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{module.title}</div>
                            <div className="text-xs text-gray-500">{module.lessons} lessons • {module.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            module.status === 'published' 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {module.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Create New Program
      </button>
    </div>
  );
}

// Live Class Panel
function LiveClassPanel() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  
  const upcomingClasses = [
    { id: '1', title: 'React Hooks Deep Dive', program: 'Full Stack Web Dev', time: '10:00 AM', students: 45, status: 'scheduled' },
    { id: '2', title: 'Node.js Authentication', program: 'Backend Development', time: '2:00 PM', students: 38, status: 'scheduled' },
    { id: '3', title: 'Database Design Workshop', program: 'Full Stack Web Dev', time: '4:30 PM', students: 52, status: 'scheduled' },
  ];

  return (
    <div className="space-y-4">
      {upcomingClasses.map((classItem) => (
        <div key={classItem.id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{classItem.title}</h4>
              <p className="text-sm text-gray-500">{classItem.program}</p>
            </div>
            <span className="text-sm font-medium text-indigo-600">{classItem.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{classItem.students} students enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Video className="w-4 h-4" /> Start Class
              </button>
              <button 
                onClick={() => setSelectedClass(selectedClass === classItem.id ? null : classItem.id)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Cancellation Options */}
          {selectedClass === classItem.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-3">Choose replacement option:</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
                  <FileText className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <span className="text-sm font-medium">AI Test</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <span className="text-sm font-medium">Reschedule</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
                  <Copy className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
                  <span className="text-sm font-medium">Recording</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

// Grading Center
function GradingCenter() {
  const submissions = [
    { id: '1', student: 'Priya Sharma', project: 'E-commerce API', submitted: '2 hours ago', status: 'pending' },
    { id: '2', student: 'Rahul Verma', project: 'React Dashboard', submitted: '5 hours ago', status: 'pending' },
    { id: '3', student: 'Ananya Iyer', project: 'Database Design', submitted: '1 day ago', status: 'graded', score: 92 },
    { id: '4', student: 'Vikram Singh', project: 'Node.js Microservices', submitted: '2 days ago', status: 'graded', score: 88 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Submissions</h3>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <option>All Projects</option>
            <option>E-commerce API</option>
            <option>React Dashboard</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {submissions.map((submission) => (
          <div key={submission.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {submission.student.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium text-gray-900">{submission.student}</div>
                <div className="text-sm text-gray-500">{submission.project}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{submission.submitted}</span>
              {submission.status === 'pending' ? (
                <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Grade
                </button>
              ) : (
                <span className="text-sm font-medium text-green-600">{submission.score}/100</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Attendance Table
function AttendanceTable() {
  const students = [
    { id: '1', name: 'Priya Sharma', present: 12, absent: 1, percentage: 92 },
    { id: '2', name: 'Rahul Verma', present: 10, absent: 3, percentage: 77 },
    { id: '3', name: 'Ananya Iyer', present: 13, absent: 0, percentage: 100 },
    { id: '4', name: 'Vikram Singh', present: 11, absent: 2, percentage: 85 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Attendance Overview</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Student</th>
            <th className="px-6 py-3 text-center">Present</th>
            <th className="px-6 py-3 text-center">Absent</th>
            <th className="px-6 py-3 text-center">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-medium text-gray-900">{student.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-green-600 font-medium">{student.present}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-red-600 font-medium">{student.absent}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${student.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{student.percentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InstructorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'classes' | 'builder' | 'grading' | 'attendance'>('classes');

  const stats = [
    { icon: BookOpen, label: 'Active Programs', value: '4', color: 'indigo' },
    { icon: Users, label: 'Total Students', value: '156', color: 'blue' },
    { icon: Calendar, label: 'Classes This Week', value: '12', color: 'emerald' },
    { icon: CheckCircle, label: 'Submissions to Grade', value: '8', color: 'purple' },
  ];

  return (
    <DashboardLayout userRole="instructor" userName="Dr. Sarah Johnson">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your courses and students</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Schedule
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Course
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {[
              { id: 'classes', label: 'Live Classes' },
              { id: 'builder', label: 'Course Builder' },
              { id: 'grading', label: 'Grading Center' },
              { id: 'attendance', label: 'Attendance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'classes' && <LiveClassPanel />}
          {activeTab === 'builder' && <CourseBuilder />}
          {activeTab === 'grading' && <GradingCenter />}
          {activeTab === 'attendance' && <AttendanceTable />}
        </div>
      </div>
    </DashboardLayout>
  );
}
