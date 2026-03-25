'use client';

import { useState } from 'react';
import { type LearningDeliveryMode, getDeliveryLabel, resolveModuleDeliveryMode, summarizeDeliveryModes } from '@/lib/learning-delivery';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, ChevronDown, ChevronRight,
  Save, X, GripVertical, BookOpen, Users, DollarSign, BarChart3,
  Clock, Globe, Calendar, Briefcase, Award, Video, Upload,
  ArrowLeft, Check, AlertCircle, Copy, MoreVertical, Star
} from 'lucide-react';

// ─── Types ───
interface CourseListItem {
  id: string;
  title: string;
  category: string;
  price: number;
  students: number;
  rating: number;
  status: 'published' | 'draft' | 'archived';
  lastUpdated: string;
  revenue: number;
}

interface PlanFeature {
  label: string;
  value: string;
}

interface CoursePlan {
  id: string;
  name: string;
  price: number;
  isRecommended: boolean;
  features: PlanFeature[];
}

type DeliveryMode = LearningDeliveryMode;
type LiveSessionStatus = 'scheduled' | 'live' | 'completed';

interface CurriculumLecture {
  id: string;
  title: string;
  isFree: boolean;
  deliveryMode: DeliveryMode;
  duration: string;
}

interface CurriculumModule {
  id: string;
  label: string;
  title: string;
  deliveryMode: DeliveryMode;
  lectures: CurriculumLecture[];
}

interface CurriculumSubject {
  id: string;
  name: string;
  modules: CurriculumModule[];
}

interface CourseLiveSession {
  id: string;
  title: string;
  roomName: string;
  description: string;
  hostName: string;
  startTime: string;
  duration: string;
  status: LiveSessionStatus;
  meetingUrl: string;
  recordingUrl: string;
  attendanceRequired: boolean;
}

interface Mentor {
  id: string;
  name: string;
  designation: string;
  company: string;
  experience: string;
}

interface Offering {
  icon: string;
  title: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const deliveryOptions: Array<{ value: DeliveryMode; label: string; note: string }> = [
  { value: 'recorded', label: 'Recorded only', note: 'Students move through video lessons and recorded assets.' },
  { value: 'live', label: 'Live only', note: 'Every lesson in the module depends on a live classroom touchpoint.' },
  { value: 'hybrid', label: 'Blended', note: 'Mix recorded lessons and live sessions inside the same module.' },
];

function createDefaultCurriculum(): CurriculumSubject[] {
  return [
    {
      id: 'sub1',
      name: 'Foundation Sprint',
      modules: [
        {
          id: 'mod1',
          label: 'Module1',
          title: 'Concepts and Setup',
          deliveryMode: 'recorded',
          lectures: [
            { id: 'l1', title: 'Lecture 1 : Welcome', isFree: true, deliveryMode: 'recorded', duration: '12 min' },
            { id: 'l2', title: 'Lecture 2 : Environment Setup', isFree: false, deliveryMode: 'recorded', duration: '18 min' },
          ],
        },
        {
          id: 'mod2',
          label: 'Module2',
          title: 'Mentor Kickoff',
          deliveryMode: 'live',
          lectures: [
            { id: 'l3', title: 'Lecture 1 : Live roadmap session', isFree: false, deliveryMode: 'live', duration: '60 min' },
          ],
        },
      ],
    },
    {
      id: 'sub2',
      name: 'Project Studio',
      modules: [
        {
          id: 'mod3',
          label: 'Module1',
          title: 'Portfolio Build Track',
          deliveryMode: 'hybrid',
          lectures: [
            { id: 'l4', title: 'Lecture 1 : Project brief', isFree: false, deliveryMode: 'recorded', duration: '16 min' },
            { id: 'l5', title: 'Lecture 2 : Live mentor review', isFree: false, deliveryMode: 'live', duration: '75 min' },
          ],
        },
      ],
    },
  ];
}

function createDefaultLiveSessions(): CourseLiveSession[] {
  return [
    {
      id: 'live-1',
      title: 'Orientation Live Class',
      roomName: 'edvo-orientation-room',
      description: 'Kickoff call for roadmap, pacing, and expectations.',
      hostName: 'Admin Mentor',
      startTime: '2026-04-05T19:00',
      duration: '60 mins',
      status: 'scheduled',
      meetingUrl: '',
      recordingUrl: '',
      attendanceRequired: true,
    },
  ];
}

function getCurriculumOverview(curriculum: CurriculumSubject[], liveSessions: CourseLiveSession[]) {
  const overview = {
    modules: 0,
    lectures: 0,
    recorded: 0,
    live: 0,
    hybrid: 0,
    liveSessions: liveSessions.length,
  };

  curriculum.forEach((subject) => {
    subject.modules.forEach((module) => {
      overview.modules += 1;
      module.lectures.forEach((lecture) => {
        overview.lectures += 1;
        overview[lecture.deliveryMode] += 1;
      });
    });
  });

  return overview;
}

function getLaunchPath(roomName: string) {
  return `/live-classroom/${roomName}`;
}

// ─── Mock Data ───
const mockCourses: CourseListItem[] = [
  { id: '1', title: 'Data Science With Generative AI Course', category: 'Data Science', price: 6999, students: 2450, rating: 4.8, status: 'published', lastUpdated: '2026-03-10', revenue: 1225000 },
  { id: '2', title: 'Full Stack Web Development Bootcamp', category: 'Web Development', price: 4999, students: 1890, rating: 4.7, status: 'published', lastUpdated: '2026-03-08', revenue: 945000 },
  { id: '3', title: 'Cloud Computing & DevOps Professional', category: 'Cloud', price: 8999, students: 780, rating: 4.9, status: 'published', lastUpdated: '2026-03-05', revenue: 702000 },
  { id: '4', title: 'Mobile App Development with React Native', category: 'Mobile', price: 5999, students: 650, rating: 4.6, status: 'draft', lastUpdated: '2026-03-01', revenue: 0 },
  { id: '5', title: 'Cybersecurity Fundamentals', category: 'Security', price: 7999, students: 320, rating: 4.5, status: 'archived', lastUpdated: '2026-02-20', revenue: 256000 },
];

const defaultOfferings: Offering[] = [
  { icon: 'book', title: 'Industry-Oriented Curriculum' },
  { icon: 'laptop', title: 'Comprehensive Learning Content' },
  { icon: 'video', title: 'Weekend Live Sessions' },
  { icon: 'target', title: 'Capstone Project' },
  { icon: 'code', title: 'Practice Exercises' },
  { icon: 'file', title: 'Assignments and Projects' },
  { icon: 'award', title: 'Certification of Completion' },
  { icon: 'briefcase', title: 'Career Guidance & Interview Preparation' },
  { icon: 'mail', title: 'Email Support' },
  { icon: 'headphones', title: 'SME Support Session' },
];

const defaultPlans: CoursePlan[] = [
  {
    id: 'basic', name: 'Basic', price: 6999, isRecommended: false,
    features: [
      { label: 'Extended Access', value: '24 months' },
      { label: 'Delivery Mode', value: 'Recorded Lectures' },
      { label: 'Certification', value: 'EDVO Skills Certificate' },
      { label: 'Doubt Sessions', value: '1 per week' },
      { label: 'Job Assistance', value: 'Not included' },
    ],
  },
  {
    id: 'premium', name: 'Premium', price: 19999, isRecommended: false,
    features: [
      { label: 'Extended Access', value: '24 months' },
      { label: 'Delivery Mode', value: 'Virtual Live' },
      { label: 'Certification', value: 'Co-Branded Certificate' },
      { label: 'Doubt Sessions', value: 'Mon-Thu 4-10 PM' },
      { label: 'Job Assistance', value: 'Not included' },
    ],
  },
  {
    id: 'pro', name: 'Pro', price: 29999, isRecommended: true,
    features: [
      { label: 'Extended Access', value: '24 months' },
      { label: 'Delivery Mode', value: 'Weekend Live Sessions' },
      { label: 'Certification', value: 'Co-Branded Certificate' },
      { label: 'Doubt Sessions', value: 'Daily 4-10 PM' },
      { label: 'Job Assistance', value: 'Included' },
    ],
  },
];

type ViewMode = 'list' | 'editor';
type EditorTab = 'general' | 'curriculum' | 'mentors' | 'plans' | 'offerings' | 'faqs';

export default function AdminCoursesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [courses, setCourses] = useState<CourseListItem[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('general');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // ─── Editor State ───
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    originalPrice: 0,
    startDate: '',
    duration: '',
    delivery: 'Live',
    language: 'Hinglish',
    jobAssistance: true,
    bannerTag: 'EDVO SKILLS',
    hiringPartners: '350+',
    careerTransitions: '120+',
    highestPackage: '6 LPA',
  });

  const [curriculum, setCurriculum] = useState<CurriculumSubject[]>(createDefaultCurriculum());
  const [liveSessions, setLiveSessions] = useState<CourseLiveSession[]>(createDefaultLiveSessions());
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [plans, setPlans] = useState<CoursePlan[]>(defaultPlans);
  const [offerings, setOfferings] = useState<Offering[]>(defaultOfferings);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // ─── Filtering ───
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ─── Stats ───
  const totalStudents = courses.reduce((a, b) => a + b.students, 0);
  const totalRevenue = courses.reduce((a, b) => a + b.revenue, 0);
  const publishedCount = courses.filter((c) => c.status === 'published').length;

  // ─── Handlers ───
  const handleCreateNew = () => {
    setCourseForm({
      title: '', description: '', category: '', price: 0, originalPrice: 0,
      startDate: '', duration: '', delivery: 'Live', language: 'Hinglish',
      jobAssistance: true, bannerTag: 'EDVO SKILLS', hiringPartners: '350+',
      careerTransitions: '120+', highestPackage: '6 LPA',
    });
    setCurriculum(createDefaultCurriculum());
    setLiveSessions(createDefaultLiveSessions());
    setMentors([]);
    setPlans(defaultPlans);
    setOfferings(defaultOfferings);
    setFaqs([]);
    setEditingCourseId(null);
    setActiveTab('general');
    setViewMode('editor');
  };

  const handleEditCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setCourseForm({
        title: course.title, description: 'Course description here...', category: course.category,
        price: course.price, originalPrice: course.price * 2, startDate: '2026-04-01',
        duration: '8 months', delivery: 'Live', language: 'Hinglish', jobAssistance: true,
        bannerTag: 'EDVO SKILLS', hiringPartners: '350+', careerTransitions: '120+', highestPackage: '6 LPA',
      });
      setCurriculum(createDefaultCurriculum());
      setLiveSessions(createDefaultLiveSessions());
      setEditingCourseId(courseId);
      setActiveTab('general');
      setViewMode('editor');
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      if (editingCourseId) {
        setCourses(courses.map((c) =>
          c.id === editingCourseId ? { ...c, title: courseForm.title, category: courseForm.category, price: courseForm.price, lastUpdated: new Date().toISOString().split('T')[0] } : c
        ));
      } else {
        const newCourse: CourseListItem = {
          id: `new-${Date.now()}`,
          title: courseForm.title || 'Untitled Course',
          category: courseForm.category || 'General',
          price: courseForm.price,
          students: 0,
          rating: 0,
          status: 'draft',
          lastUpdated: new Date().toISOString().split('T')[0],
          revenue: 0,
        };
        setCourses([newCourse, ...courses]);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
    setShowDeleteModal(null);
  };

  const handleToggleStatus = (courseId: string) => {
    setCourses(courses.map((c) => {
      if (c.id === courseId) {
        return { ...c, status: c.status === 'published' ? 'draft' : 'published' };
      }
      return c;
    }));
  };

  // ─── Curriculum handlers ───
  const addSubject = () => {
    const newId = `sub-${Date.now()}`;
    setCurriculum([...curriculum, { id: newId, name: 'New Subject', modules: [] }]);
  };

  const addModule = (subjectId: string) => {
    setCurriculum(curriculum.map((s) => {
      if (s.id === subjectId) {
        const modNum = s.modules.length + 1;
        return {
          ...s,
          modules: [...s.modules, {
            id: `mod-${Date.now()}`,
            label: `Module${modNum}`,
            title: 'New Module',
            deliveryMode: 'recorded',
            lectures: [],
          }],
        };
      }
      return s;
    }));
  };

  const addLecture = (subjectId: string, moduleId: string) => {
    setCurriculum(curriculum.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          modules: s.modules.map((m) => {
            if (m.id === moduleId) {
              const lecNum = m.lectures.length + 1;
              return {
                ...m,
                lectures: [...m.lectures, {
                  id: `l-${Date.now()}`,
                  title: `Lecture ${lecNum} : New Lecture`,
                  isFree: false,
                  deliveryMode: m.deliveryMode === 'hybrid' ? 'recorded' : m.deliveryMode,
                  duration: m.deliveryMode === 'live' ? '60 min' : '12 min',
                }],
              };
            }
            return m;
          }),
        };
      }
      return s;
    }));
  };

  const removeSubject = (subjectId: string) => {
    setCurriculum(curriculum.filter((s) => s.id !== subjectId));
  };

  const removeModule = (subjectId: string, moduleId: string) => {
    setCurriculum(curriculum.map((s) => {
      if (s.id === subjectId) {
        return { ...s, modules: s.modules.filter((m) => m.id !== moduleId) };
      }
      return s;
    }));
  };

  const removeLecture = (subjectId: string, moduleId: string, lectureId: string) => {
    setCurriculum(curriculum.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          modules: s.modules.map((m) => {
            if (m.id === moduleId) {
              return { ...m, lectures: m.lectures.filter((l) => l.id !== lectureId) };
            }
            return m;
          }),
        };
      }
      return s;
    }));
  };
  const updateModuleDeliveryMode = (subjectId: string, moduleId: string, mode: DeliveryMode) => {
    setCurriculum(curriculum.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          return {
            ...module,
            deliveryMode: mode,
            lectures: module.lectures.map((lecture) => ({
              ...lecture,
              deliveryMode: mode === 'hybrid' ? lecture.deliveryMode : mode,
            })),
          };
        }),
      };
    }));
  };

  const updateLectureDeliveryMode = (subjectId: string, moduleId: string, lectureId: string, mode: DeliveryMode) => {
    setCurriculum(curriculum.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          return {
            ...module,
            lectures: module.lectures.map((lecture) => lecture.id === lectureId ? { ...lecture, deliveryMode: mode } : lecture),
          };
        }),
      };
    }));
  };

  const addLiveSession = () => {
    setLiveSessions([
      ...liveSessions,
      {
        id: `live-${Date.now()}`,
        title: 'New Live Session',
        roomName: `edvo-room-${Date.now().toString().slice(-6)}`,
        description: '',
        hostName: '',
        startTime: '2026-04-10T19:00',
        duration: '60 mins',
        status: 'scheduled',
        meetingUrl: '',
        recordingUrl: '',
        attendanceRequired: true,
      },
    ]);
  };

  const updateLiveSession = <K extends keyof CourseLiveSession>(sessionId: string, key: K, value: CourseLiveSession[K]) => {
    setLiveSessions(liveSessions.map((session) => session.id === sessionId ? { ...session, [key]: value } : session));
  };

  const removeLiveSession = (sessionId: string) => {
    setLiveSessions(liveSessions.filter((session) => session.id !== sessionId));
  };

  const curriculumOverview = getCurriculumOverview(curriculum, liveSessions);

  // ─── Mentor handlers ───
  const addMentor = () => {
    setMentors([...mentors, { id: `m-${Date.now()}`, name: '', designation: '', company: '', experience: '' }]);
  };

  const removeMentor = (mentorId: string) => {
    setMentors(mentors.filter((m) => m.id !== mentorId));
  };

  // ─── FAQ handlers ───
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // ═══════════════════════
  // ═══ LIST VIEW ═══
  // ═══════════════════════
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Course Management</h1>
                <p className="text-gray-500 mt-1">Create, edit, and manage all courses on the platform</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 transition-colors">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Courses</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
              </div>
              <div className="bg-green-50 dark:bg-emerald-500/10 rounded-xl p-4 transition-colors">
                <div className="flex items-center gap-2 text-green-600 dark:text-emerald-400 mb-1">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Published</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{publishedCount}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 transition-colors">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Students</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 transition-colors">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{(totalRevenue / 100000).toFixed(1)}L</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'published', 'draft', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Table */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{course.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Updated {course.lastUpdated}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{course.category}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">₹{course.price.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{course.students.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{course.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(course.id)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer ${
                          course.status === 'published' ? 'bg-green-100 text-green-700' :
                          course.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          course.status === 'published' ? 'bg-green-500' :
                          course.status === 'draft' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                        {course.status}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">₹{(course.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`/courses/${course.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setShowDeleteModal(course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Course</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                  Are you sure you want to delete this course? This action cannot be undone. All student enrollments and data will be lost.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all"
                  >
                    Delete Course
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══════════════════════
  // ═══ EDITOR VIEW ═══
  // ═══════════════════════
  const editorTabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'curriculum', label: 'Curriculum', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'mentors', label: 'Mentors', icon: <Users className="w-4 h-4" /> },
    { id: 'plans', label: 'Pricing Plans', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'offerings', label: 'Offerings', icon: <Award className="w-4 h-4" /> },
    { id: 'faqs', label: 'FAQs', icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Editor Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('list')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingCourseId ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {courseForm.title || 'Untitled Course'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {editorTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ─── GENERAL TAB ─── */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Course Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title *</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g., Data Science With Generative AI Course"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile">Mobile Development</option>
                      <option value="Cloud">Cloud Computing</option>
                      <option value="Security">Cybersecurity</option>
                      <option value="AI/ML">AI/ML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Tag</label>
                    <input
                      type="text"
                      value={courseForm.bannerTag}
                      onChange={(e) => setCourseForm({ ...courseForm, bannerTag: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Pricing & Schedule</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Base Price (₹)</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Original Price (₹)</label>
                  <input
                    type="number"
                    value={courseForm.originalPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g., 8 months"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery & Stats</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Mode</label>
                  <select
                    value={courseForm.delivery}
                    onChange={(e) => setCourseForm({ ...courseForm, delivery: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Live">Live</option>
                    <option value="Recorded">Recorded</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select
                    value={courseForm.language}
                    onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hiring Partners</label>
                  <input
                    type="text"
                    value={courseForm.hiringPartners}
                    onChange={(e) => setCourseForm({ ...courseForm, hiringPartners: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Career Transitions</label>
                  <input
                    type="text"
                    value={courseForm.careerTransitions}
                    onChange={(e) => setCourseForm({ ...courseForm, careerTransitions: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Highest Package</label>
                  <input
                    type="text"
                    value={courseForm.highestPackage}
                    onChange={(e) => setCourseForm({ ...courseForm, highestPackage: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseForm.jobAssistance}
                      onChange={(e) => setCourseForm({ ...courseForm, jobAssistance: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Job Assistance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── CURRICULUM TAB ─── */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Builder</h3>
              <button
                onClick={addSubject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Modules</div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{curriculumOverview.modules}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Admin can decide per module if it is recorded, live, or blended.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Recorded lessons</div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{curriculumOverview.recorded}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Recorded lessons auto-complete on the student side once opened.</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
                <div className="text-sm font-semibold text-sky-700 dark:text-sky-300">Live touchpoints</div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{curriculumOverview.live}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Live completion logic can be attached later without changing the module map.</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">Scheduled sessions</div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{curriculumOverview.liveSessions}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Use the classroom block below to control join URLs and recordings.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">Learning flow rules</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    Set a whole module to recorded-only, live-only, or switch it to blended when you want different lesson types inside the same module.
                    Recorded lessons are already prepared to auto-mark complete for students. Live completion can be layered in later.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">Live classroom control</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Scheduling flow adapted from the live-class tool so admin can manage room names, launch links, and recordings per course.</p>
                </div>
                <button
                  onClick={addLiveSession}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Live Session
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {liveSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{session.title || 'Untitled live session'}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-400">Launch path {getLaunchPath(session.roomName || 'room-name')}</div>
                      </div>
                      <button
                        onClick={() => removeLiveSession(session.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session title</label>
                        <input type="text" value={session.title} onChange={(e) => updateLiveSession(session.id, 'title', e.target.value)} placeholder="Orientation live class" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Host name</label>
                        <input type="text" value={session.hostName} onChange={(e) => updateLiveSession(session.id, 'hostName', e.target.value)} placeholder="Admin mentor" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room name</label>
                        <input type="text" value={session.roomName} onChange={(e) => updateLiveSession(session.id, 'roomName', e.target.value)} placeholder="edvo-room-001" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start time</label>
                        <input type="datetime-local" value={session.startTime} onChange={(e) => updateLiveSession(session.id, 'startTime', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                        <input type="text" value={session.duration} onChange={(e) => updateLiveSession(session.id, 'duration', e.target.value)} placeholder="60 mins" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select value={session.status} onChange={(e) => updateLiveSession(session.id, 'status', e.target.value as LiveSessionStatus)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          <option value="scheduled">Scheduled</option>
                          <option value="live">Live now</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea value={session.description} onChange={(e) => updateLiveSession(session.id, 'description', e.target.value)} rows={2} placeholder="Tell students what happens in this session" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting URL</label>
                        <input type="text" value={session.meetingUrl} onChange={(e) => updateLiveSession(session.id, 'meetingUrl', e.target.value)} placeholder="Paste the live classroom or Zoom link" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recording URL</label>
                        <input type="text" value={session.recordingUrl} onChange={(e) => updateLiveSession(session.id, 'recordingUrl', e.target.value)} placeholder="Attach the recording once class is done" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 px-3 py-3 dark:border-slate-700">
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                        <input type="checkbox" checked={session.attendanceRequired} onChange={(e) => updateLiveSession(session.id, 'attendanceRequired', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        Attendance required
                      </label>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Suggested in-app launcher: <span className="font-medium text-gray-700 dark:text-slate-200">{getLaunchPath(session.roomName || 'room-name')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {curriculum.map((subject, sIndex) => (
              <div key={subject.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Subject header */}
                <div className="bg-indigo-50 dark:bg-indigo-500/10 px-6 py-4 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => {
                        const updated = [...curriculum];
                        updated[sIndex].name = e.target.value;
                        setCurriculum(updated);
                      }}
                      className="bg-transparent text-lg font-bold text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addModule(subject.id)}
                      className="text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Module
                    </button>
                    <button
                      onClick={() => removeSubject(subject.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modules */}
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {subject.modules.map((module, mIndex) => {
                    const moduleMix = summarizeDeliveryModes(module.lectures);
                    const moduleMode = resolveModuleDeliveryMode(module);
                    return (
                    <div key={module.id} className="px-6 py-4">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab mt-2" />
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-orange-500 font-bold uppercase">{module.label}</span>
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => {
                                  const updated = [...curriculum];
                                  updated[sIndex].modules[mIndex].title = e.target.value;
                                  setCurriculum(updated);
                                }}
                                className="font-bold text-gray-800 dark:text-gray-200 border-none focus:outline-none focus:ring-0 bg-transparent"
                              />
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-slate-800 dark:text-slate-200">{getDeliveryLabel(moduleMode)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={module.deliveryMode}
                                onChange={(e) => updateModuleDeliveryMode(subject.id, module.id, e.target.value as DeliveryMode)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              >
                                {deliveryOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                              <span className="text-xs text-gray-500 dark:text-slate-400">{deliveryOptions.find((option) => option.value === module.deliveryMode)?.note}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-800">{module.lectures.length} lessons</span>
                              {moduleMix.recorded > 0 ? <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-800">{moduleMix.recorded} recorded</span> : null}
                              {moduleMix.live > 0 ? <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-800">{moduleMix.live} live</span> : null}
                              {moduleMix.hybrid > 0 ? <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-slate-800">{moduleMix.hybrid} blended</span> : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addLecture(subject.id, module.id)}
                            className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Lecture
                          </button>
                          <button
                            onClick={() => removeModule(subject.id, module.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lectures */}
                      <div className="ml-7 space-y-2">
                        {module.lectures.map((lecture, lIndex) => (
                          <div key={lecture.id} className="rounded-xl border border-gray-200 bg-white p-3 group dark:border-slate-800 dark:bg-slate-950/50">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                              <div className="flex items-center gap-3 xl:flex-1">
                                <GripVertical className="w-3 h-3 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                <input
                                  type="text"
                                  value={lecture.title}
                                  onChange={(e) => {
                                    const updated = [...curriculum];
                                    updated[sIndex].modules[mIndex].lectures[lIndex].title = e.target.value;
                                    setCurriculum(updated);
                                  }}
                                  className="flex-1 text-sm text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 focus:border-indigo-300 px-2 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-indigo-200 bg-transparent"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                <select
                                  value={lecture.deliveryMode}
                                  disabled={module.deliveryMode !== 'hybrid'}
                                  onChange={(e) => updateLectureDeliveryMode(subject.id, module.id, lecture.id, e.target.value as DeliveryMode)}
                                  className="px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  {deliveryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={lecture.duration}
                                  onChange={(e) => {
                                    const updated = [...curriculum];
                                    updated[sIndex].modules[mIndex].lectures[lIndex].duration = e.target.value;
                                    setCurriculum(updated);
                                  }}
                                  placeholder="12 min"
                                  className="w-24 px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={lecture.isFree}
                                    onChange={(e) => {
                                      const updated = [...curriculum];
                                      updated[sIndex].modules[mIndex].lectures[lIndex].isFree = e.target.checked;
                                      setCurriculum(updated);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  Free
                                </label>
                                <button
                                  onClick={() => removeLecture(subject.id, module.id, lecture.id)}
                                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {module.deliveryMode !== 'hybrid' ? (
                              <div className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">Switch the module to Blended if you want lesson-level delivery control.</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  })}
                </div>

                {subject.modules.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No modules yet. Click &quot;+ Module&quot; to add one.</p>
                  </div>
                )}
              </div>
            ))}

            {curriculum.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No subjects added yet</p>
                <button
                  onClick={addSubject}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Add First Subject
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── MENTORS TAB ─── */}
        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mentors</h3>
              <button
                onClick={addMentor}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Mentor
              </button>
            </div>

            {mentors.map((mentor, index) => (
              <div key={mentor.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mentor {index + 1}</h4>
                  <button
                    onClick={() => removeMentor(mentor.id)}
                    className="text-gray-400 dark:text-gray-600 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={mentor.name}
                      onChange={(e) => {
                        const updated = [...mentors];
                        updated[index].name = e.target.value;
                        setMentors(updated);
                      }}
                      placeholder="Mentor name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={mentor.company}
                      onChange={(e) => {
                        const updated = [...mentors];
                        updated[index].company = e.target.value;
                        setMentors(updated);
                      }}
                      placeholder="Company name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={mentor.designation}
                      onChange={(e) => {
                        const updated = [...mentors];
                        updated[index].designation = e.target.value;
                        setMentors(updated);
                      }}
                      placeholder="e.g., Senior Data Scientist"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      type="text"
                      value={mentor.experience}
                      onChange={(e) => {
                        const updated = [...mentors];
                        updated[index].experience = e.target.value;
                        setMentors(updated);
                      }}
                      placeholder="e.g., 5+ Years"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {mentors.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No mentors added yet</p>
                <button
                  onClick={addMentor}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Add First Mentor
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── PLANS TAB ─── */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pricing Plans</h3>

            {plans.map((plan, pIndex) => (
              <div key={plan.id} className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-6 shadow-sm ${plan.isRecommended ? 'border-orange-400' : 'border-gray-200 dark:border-slate-800'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                    {plan.isRecommended && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">Recommended</span>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.isRecommended}
                      onChange={(e) => {
                        const updated = plans.map((p, i) => ({
                          ...p,
                          isRecommended: i === pIndex ? e.target.checked : false,
                        }));
                        setPlans(updated);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                    <span className="text-gray-600">Mark as recommended</span>
                  </label>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[pIndex].price = Number(e.target.value);
                      setPlans(updated);
                    }}
                    className="w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</div>
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="grid grid-cols-3 gap-3 items-start">
                      <input
                        type="text"
                        value={feature.label}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIndex].features[fIndex].label = e.target.value;
                          setPlans(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                      />
                      <input
                        type="text"
                        value={feature.value}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[pIndex].features[fIndex].value = e.target.value;
                          setPlans(updated);
                        }}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...plans];
                      updated[pIndex].features.push({ label: '', value: '' });
                      setPlans(updated);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Feature
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── OFFERINGS TAB ─── */}
        {activeTab === 'offerings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Course Offerings</h3>
              <button
                onClick={() => setOfferings([...offerings, { icon: 'book', title: '' }])}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Offering
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {offerings.map((offering, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4 group">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                  <select
                    value={offering.icon}
                    onChange={(e) => {
                      const updated = [...offerings];
                      updated[index].icon = e.target.value;
                      setOfferings(updated);
                    }}
                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {['book', 'laptop', 'video', 'target', 'code', 'file', 'award', 'briefcase', 'mail', 'headphones', 'phone'].map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={offering.title}
                    onChange={(e) => {
                      const updated = [...offerings];
                      updated[index].title = e.target.value;
                      setOfferings(updated);
                    }}
                    placeholder="Offering title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => setOfferings(offerings.filter((_, i) => i !== index))}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FAQS TAB ─── */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
              <button
                onClick={addFaq}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>

            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">FAQ {index + 1}</h4>
                  <button
                    onClick={() => removeFaq(index)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...faqs];
                        updated[index].question = e.target.value;
                        setFaqs(updated);
                      }}
                      placeholder="Enter the question"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...faqs];
                        updated[index].answer = e.target.value;
                        setFaqs(updated);
                      }}
                      placeholder="Enter the answer"
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No FAQs added yet</p>
                <button
                  onClick={addFaq}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Add First FAQ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
