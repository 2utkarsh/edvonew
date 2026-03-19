'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

// Required for static export — actual data is fetched client-side via useParams
export function generateStaticParams() {
  return [];
}
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Lock, ChevronRight, ChevronDown, Download, Star,
  Briefcase, Calendar, Clock, Monitor, Globe, Award, Users,
  BookOpen, Code, FileText, MessageCircle, Headphones, Video,
  GraduationCap, Target, Zap, CheckCircle, ArrowUp, X,
  Building2, TrendingUp, DollarSign, Mail, Phone
} from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';

// ─── Types ───
interface CurriculumLecture {
  id: string;
  title: string;
  isFree: boolean;
}

interface CurriculumModule {
  id: string;
  label: string;
  title: string;
  lectures: CurriculumLecture[];
}

interface CurriculumSubject {
  id: string;
  name: string;
  modules: CurriculumModule[];
}

interface Mentor {
  id: string;
  name: string;
  designation: string;
  company: string;
  experience: string;
  image: string;
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

interface CourseOffering {
  icon: string;
  title: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

interface CertificationItem {
  name: string;
  provider: string;
}

// ─── Mock Data ───
const courseData = {
  id: 'ds-gen-ai',
  title: 'Data Science With Generative AI Course',
  description: 'Become a Certified Data Scientist with EDVO Skills and harness the power of Machine Learning, NLP and Generative AI. Learn industry-relevant skills that can help you land your dream job.',
  bannerTag: 'EDVO SKILLS',
  bannerSubtag: 'DATA SCIENCE WITH GENERATIVE AI',
  bannerExtra: 'COURSE | AI-collaboration with industry',
  price: 6999,
  originalPrice: 19999,
  startDate: '16th Mar, 2026',
  duration: '8 months',
  delivery: 'Live',
  language: 'Hinglish',
  jobAssistance: true,
  planType: 'Pro Plus',
  stats: {
    hiringPartners: '350+',
    careerTransitions: '120+',
    highestPackage: '6 LPA',
  },
  offerings: [
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
    { icon: 'phone', title: 'EDVO Talk Access (Premium & Pro Only)' },
  ] as CourseOffering[],
  curriculum: [
    {
      id: 'ds-foundations',
      name: 'Data Science Foundations',
      modules: [
        {
          id: 'mod1',
          label: 'Module1',
          title: 'What is Data Science?',
          lectures: [
            { id: 'l1', title: 'Lecture 1 : What is DS?', isFree: true },
            { id: 'l2', title: 'Lecture 2 : Why DS Matters', isFree: false },
            { id: 'l3', title: 'Lecture 3 : DS Roles (DS, ML Engineer, AI Engineer)', isFree: false },
            { id: 'l4', title: 'Lecture 4 : Tools used in DS', isFree: false },
            { id: 'l5', title: 'Lecture 5 : Industry examples', isFree: false },
          ],
        },
        {
          id: 'mod2',
          label: 'Module2',
          title: 'Future of Data Science',
          lectures: [
            { id: 'l6', title: 'Lecture 1 : AI Revolution', isFree: false },
            { id: 'l7', title: 'Lecture 2 : DS in 2030', isFree: false },
            { id: 'l8', title: 'Lecture 3 : Career roadmap', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'python',
      name: 'Python',
      modules: [
        {
          id: 'mod3',
          label: 'Module1',
          title: 'Python Basics',
          lectures: [
            { id: 'l9', title: 'Lecture 1 : Introduction to Python', isFree: true },
            { id: 'l10', title: 'Lecture 2 : Variables & Data Types', isFree: false },
            { id: 'l11', title: 'Lecture 3 : Control Flow', isFree: false },
            { id: 'l12', title: 'Lecture 4 : Functions', isFree: false },
          ],
        },
        {
          id: 'mod4',
          label: 'Module2',
          title: 'Advanced Python',
          lectures: [
            { id: 'l13', title: 'Lecture 1 : OOP in Python', isFree: false },
            { id: 'l14', title: 'Lecture 2 : File Handling', isFree: false },
            { id: 'l15', title: 'Lecture 3 : Libraries & Packages', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'statistics',
      name: 'Statistics',
      modules: [
        {
          id: 'mod5',
          label: 'Module1',
          title: 'Descriptive Statistics',
          lectures: [
            { id: 'l16', title: 'Lecture 1 : Mean, Median, Mode', isFree: true },
            { id: 'l17', title: 'Lecture 2 : Standard Deviation', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'eda',
      name: 'EDA',
      modules: [
        {
          id: 'mod6',
          label: 'Module1',
          title: 'Exploratory Data Analysis',
          lectures: [
            { id: 'l18', title: 'Lecture 1 : Data Cleaning', isFree: true },
            { id: 'l19', title: 'Lecture 2 : Visualization with Matplotlib', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'ml',
      name: 'Machine Learning',
      modules: [
        {
          id: 'mod7',
          label: 'Module1',
          title: 'Supervised Learning',
          lectures: [
            { id: 'l20', title: 'Lecture 1 : Linear Regression', isFree: true },
            { id: 'l21', title: 'Lecture 2 : Classification', isFree: false },
            { id: 'l22', title: 'Lecture 3 : Decision Trees', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'sql',
      name: 'SQL',
      modules: [
        {
          id: 'mod8',
          label: 'Module1',
          title: 'SQL Fundamentals',
          lectures: [
            { id: 'l23', title: 'Lecture 1 : SELECT & FROM', isFree: true },
            { id: 'l24', title: 'Lecture 2 : JOINs', isFree: false },
          ],
        },
      ],
    },
    {
      id: 'mlops',
      name: 'MLOps',
      modules: [
        {
          id: 'mod9',
          label: 'Module1',
          title: 'ML in Production',
          lectures: [
            { id: 'l25', title: 'Lecture 1 : Model Deployment', isFree: true },
            { id: 'l26', title: 'Lecture 2 : CI/CD for ML', isFree: false },
          ],
        },
      ],
    },
  ] as CurriculumSubject[],
  mentors: [
    { id: 'm1', name: 'Kartik', designation: 'Quantitative Researcher & AI Instructor at IIT Ropar', company: 'EDVO SKILLS', experience: '6+ Years', image: '' },
    { id: 'm2', name: 'Darshan', designation: 'Principal Consultant, Senior Data Scientist and Corporate Trainer', company: 'EDVO SKILLS', experience: '10+ Years', image: '' },
    { id: 'm3', name: 'Ajay Kumar Gupta', designation: 'Senior Data Scientist, Synopsys For Humanity', company: 'Novaritys', experience: '5+ Years', image: '' },
    { id: 'm4', name: 'Priya Bhatia', designation: 'AI Tech GT Hyderabad (Data & Technology)', company: 'Hitachi Pvt. Ltd', experience: '4+ Years', image: '' },
  ] as Mentor[],
  plans: [
    {
      id: 'basic',
      name: 'Basic',
      price: 6999,
      isRecommended: false,
      features: [
        { label: 'Extended Access', value: 'Access to recorded content for 24 months' },
        { label: 'Delivery Mode', value: 'Recorded Lectures - Learn at your own pace with full access to pre-recorded modules.' },
        { label: 'Certification', value: 'EDVO Skills Certificate.' },
        { label: 'Case Studies & Masterclass', value: 'Not included' },
        { label: 'Doubt Sessions', value: '1 Live Doubt Session per week - Sunday' },
        { label: 'Assignments', value: 'Not included' },
        { label: 'Job Assistance', value: 'Not included' },
        { label: 'Career Excellence and Soft Skills', value: 'Not included' },
        { label: 'EDVO Talk App', value: 'For premium and pro plan only' },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19999,
      isRecommended: false,
      features: [
        { label: 'Extended Access', value: 'Access to recorded content for 24 months' },
        { label: 'Delivery Mode', value: 'Virtual Live' },
        { label: 'Certification', value: 'Co-Branded Certificate from EDVO Skills + PWC' },
        { label: 'Case Studies & Masterclass', value: '2 Live Case Studies + Monthly Masterclass' },
        { label: 'Doubt Session', value: 'Monday to Thursday 4-10 PM' },
        { label: 'Assignments', value: 'Not included' },
        { label: 'Job Assistance', value: 'Not included' },
        { label: 'Career Excellence and Soft Skills', value: 'Included' },
        { label: 'EDVO Talk App', value: 'Get EDVO Talk App access for free' },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29999,
      isRecommended: true,
      features: [
        { label: 'Extended Access', value: 'Access to recorded content for 24 months' },
        { label: 'Live Lectures', value: 'Weekend Live Sessions | Sat & Sun' },
        { label: 'Certification', value: 'Co-Branded Certificate from EDVO Skills + PWC' },
        { label: 'Case Studies & Masterclass', value: '2 live Case Studies + Monthly Masterclass' },
        { label: 'Doubt Session', value: 'Daily 4 PM to 10 PM' },
        { label: 'Job Assistance', value: 'Only for Pro learners if they fulfill the eligibility criteria' },
        { label: 'Career Excellence & Soft Skills', value: 'Included' },
        { label: 'EDVO Talk App', value: 'Get EDVO Talk App access for free' },
      ],
    },
  ] as CoursePlan[],
  certifications: [
    { name: 'NSDC Certification', provider: 'National Skill Development Corporation' },
    { name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services' },
    { name: 'IIT Delhi Certificate', provider: 'Indian Institute of Technology, Delhi' },
    { name: 'Google Cloud Certificate', provider: 'Google Cloud' },
  ] as CertificationItem[],
  testimonials: [
    { name: 'Rahul Sharma', role: 'Data Analyst', company: 'TCS', quote: 'This course transformed my career. I went from a non-tech background to a data analyst role in just 8 months. The mentors are incredibly supportive.', rating: 5 },
    { name: 'Sneha Patel', role: 'ML Engineer', company: 'Flipkart', quote: 'The hands-on projects and live sessions made all the difference. I could directly apply what I learned in interviews.', rating: 5 },
    { name: 'Amit Verma', role: 'Data Scientist', company: 'Razorpay', quote: 'Best investment I made for my career. The curriculum is industry-relevant and the placement support is excellent.', rating: 4 },
  ] as TestimonialItem[],
  faqs: [
    { question: 'Who is this course for?', answer: 'This course is designed for beginners, working professionals, and anyone looking to transition into data science. No prior coding experience is required.' },
    { question: 'What are the prerequisites?', answer: 'Basic knowledge of mathematics (10+2 level) is helpful but not mandatory. We cover everything from scratch.' },
    { question: 'Will I get a certificate?', answer: 'Yes! You will receive a co-branded certificate upon successful completion of the course. Pro plan users get an additional industry-recognized certification.' },
    { question: 'Is there job placement support?', answer: 'Yes, our Pro plan includes dedicated job assistance with resume building, mock interviews, and direct referrals to our 350+ hiring partners.' },
    { question: 'Can I pay in installments?', answer: 'Yes, we offer EMI options starting from ₹1,166/month. You can also avail no-cost EMI on select plans.' },
    { question: 'What if I miss a live session?', answer: 'All live sessions are recorded and available for replay within 24 hours. You can access them throughout your subscription period.' },
  ] as FAQ[],
};

// ─── Icon map ───
function OfferingIcon({ type, className }: { type: string; className?: string }) {
  const cls = className || 'w-6 h-6';
  switch (type) {
    case 'book': return <BookOpen className={cls} />;
    case 'laptop': return <Monitor className={cls} />;
    case 'video': return <Video className={cls} />;
    case 'target': return <Target className={cls} />;
    case 'code': return <Code className={cls} />;
    case 'file': return <FileText className={cls} />;
    case 'award': return <Award className={cls} />;
    case 'briefcase': return <Briefcase className={cls} />;
    case 'mail': return <Mail className={cls} />;
    case 'headphones': return <Headphones className={cls} />;
    case 'phone': return <Phone className={cls} />;
    default: return <Zap className={cls} />;
  }
}

// ─── Section IDs for sticky nav ───
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'offerings', label: 'Offerings' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'mentors', label: 'Mentors' },
  { id: 'plans', label: 'Plans' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'testimonials', label: 'Testimonial' },
  { id: 'faqs', label: 'FAQs' },
];

export default function CourseDetailPage() {
  const params = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubject, setActiveSubject] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(courseData.curriculum[0]?.modules[0]?.id || null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      // Update active section based on scroll
      const scrollPos = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      const offset = 80;
      const top = el.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const currentSubject = courseData.curriculum[activeSubject];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ═══ HERO SECTION ═══ */}
      <section
        id="overview"
        ref={(el) => { sectionRefs.current['overview'] = el; }}
        className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent dark:from-primary-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 mb-6">
            <a href="/" className="hover:text-primary-600 dark:hover:text-white transition-colors">Home</a>
            <ChevronRight className="w-4 h-4" />
            <a href="/courses" className="hover:text-primary-600 dark:hover:text-white transition-colors">Courses</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 dark:text-white font-medium">{courseData.title}</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left content */}
            <div className="lg:col-span-3">
              <FadeIn>
                <h1 className="text-3xl md:text-4xl font-black mb-4 font-heading leading-tight text-slate-900 dark:text-white">
                  {courseData.title}
                </h1>
                <p className="text-slate-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  {courseData.description}
                </p>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-gray-400">(2,450 ratings)</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="text-sm bg-orange-500/10 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full font-bold">Enroll Now!</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
                    Buy now
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹{courseData.price.toLocaleString()}</span>
                    <span className="text-slate-400 dark:text-gray-400 line-through text-lg font-medium">₹{courseData.originalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right - Banner card */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 rounded-full -mr-10 -mt-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/30 rounded-full -ml-8 -mb-8" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-6 h-6 text-indigo-300" />
                      <span className="text-indigo-200 font-semibold text-sm uppercase tracking-wide">{courseData.bannerTag}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{courseData.bannerSubtag}</h3>
                    <p className="text-indigo-200 text-sm mb-4">{courseData.bannerExtra}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">BASIC</span>
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">PREMIUM</span>
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">PRO</span>
                    </div>
                    <div className="text-white font-bold text-2xl">
                      Starting at ₹{courseData.price.toLocaleString()}/-
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="border-t border-slate-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-200 dark:divide-gray-800">
              <InfoItem icon={<Briefcase className="w-5 h-5" />} label="Job Assistance" value={courseData.jobAssistance ? 'For Pro Plus' : 'No'} />
              <InfoItem icon={<Calendar className="w-5 h-5" />} label="Date of Commencement" value={courseData.startDate} />
              <InfoItem icon={<Clock className="w-5 h-5" />} label="Duration" value={courseData.duration} />
              <InfoItem icon={<Monitor className="w-5 h-5" />} label="Delivery Mode" value={courseData.delivery} />
              <InfoItem icon={<Globe className="w-5 h-5" />} label="Language" value={courseData.language} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT SECTION ═══ */}
      <section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 dark:text-white">
              About {courseData.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-4xl">
              Discover your potential by learning the latest skills, using powerful tools, and gaining
              practical experience that can help you in the world of data science.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-12 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard icon={<Users className="w-8 h-8 text-indigo-500" />} value={courseData.stats.hiringPartners} label="Hiring Partners" />
              <StatCard icon={<TrendingUp className="w-8 h-8 text-indigo-500" />} value={courseData.stats.careerTransitions} label="Career Transitions" />
              <StatCard icon={<DollarSign className="w-8 h-8 text-green-500" />} value={courseData.stats.highestPackage} label="Highest Package" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OFFERINGS SECTION ═══ */}
      <section
        id="offerings"
        ref={(el) => { sectionRefs.current['offerings'] = el; }}
        className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Unlock Your Potential: Exclusive Course Offerings
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {courseData.offerings.map((offering, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <div className="flex items-center gap-4 px-6 py-5 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <OfferingIcon type={offering.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{offering.title}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CURRICULUM SECTION ═══ */}
      <section
        id="curriculum"
        ref={(el) => { sectionRefs.current['curriculum'] = el; }}
        className="py-16 bg-gray-50 dark:bg-slate-950 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Your Guide To Upskilling: Our Curriculum
              </h2>
            </div>
          </FadeIn>

          {/* Subject Tabs */}
          <FadeIn>
            <div className="flex flex-wrap gap-3 mb-8">
              {courseData.curriculum.map((subject, index) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    setActiveSubject(index);
                    setExpandedModule(courseData.curriculum[index]?.modules[0]?.id || null);
                  }}
                  className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                    activeSubject === index
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 dark:bg-slate-900 dark:text-gray-300 dark:border-slate-800 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Modules + Lectures */}
          <FadeIn>
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Module list */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                {currentSubject?.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setExpandedModule(module.id)}
                    className={`w-full text-left px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 transition-colors ${
                      expandedModule === module.id
                        ? 'bg-white dark:bg-slate-900 border-l-4 border-l-orange-500'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1">
                        {module.label}
                      </div>
                      <div className={`font-semibold ${expandedModule === module.id ? 'text-orange-600' : 'text-gray-800 dark:text-gray-200'}`}>
                        {module.title}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${expandedModule === module.id ? 'text-orange-500' : 'text-gray-400'}`} />
                  </button>
                ))}
              </div>

              {/* Lecture list */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                  {currentSubject?.modules
                    .find((m) => m.id === expandedModule)
                    ?.lectures.map((lecture, index) => (
                      <motion.div
                        key={lecture.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-gray-800 dark:text-gray-200 font-medium">{lecture.title}</span>
                        {lecture.isFree ? (
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-orange-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                          </div>
                        )}
                      </motion.div>
                    ))}
              </div>
            </div>
          </FadeIn>

          {/* Download Curriculum */}
          <FadeIn>
            <div className="flex justify-center mt-10">
              <button className="flex items-center gap-3 text-orange-500 font-semibold text-lg hover:text-orange-600 transition-colors group">
                Download Curriculum
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-colors">
                  <Download className="w-5 h-5" />
                </div>
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ MENTORS SECTION ═══ */}
      <section
        id="mentors"
        ref={(el) => { sectionRefs.current['mentors'] = el; }}
        className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Learn From Industry Experts
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseData.mentors.map((mentor, index) => (
              <FadeIn key={mentor.id} delay={index * 0.1}>
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Avatar placeholder */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950 dark:to-rose-950 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {mentor.name.charAt(0)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{mentor.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{mentor.designation}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Building2 className="w-4 h-4" />
                        <span>{mentor.company}</span>
                      </div>
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                        {mentor.experience}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLANS SECTION ═══ */}
      <section
        id="plans"
        ref={(el) => { sectionRefs.current['plans'] = el; }}
        className="py-16 bg-gray-50 dark:bg-slate-950 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Customize Your Growth: Course Plan Options
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {courseData.plans.map((plan, index) => (
              <FadeIn key={plan.id} delay={index * 0.1}>
                <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 p-8 relative transition-all duration-300 ${
                  plan.isRecommended
                    ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                    : 'border-gray-200 dark:border-slate-800'
                }`}>
                  {plan.isRecommended && (
                    <span className="absolute -top-3 right-6 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  )}

                  {/* Plan icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    plan.name === 'Basic' ? 'bg-rose-100 text-rose-500' :
                    plan.name === 'Premium' ? 'bg-blue-100 text-blue-500' :
                    'bg-purple-100 text-purple-500'
                  }`}>
                    {plan.name === 'Basic' ? <BookOpen className="w-5 h-5" /> :
                     plan.name === 'Premium' ? <Award className="w-5 h-5" /> :
                     <GraduationCap className="w-5 h-5" />}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">₹ {plan.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors font-medium text-orange-600 dark:text-orange-400">Enroll Now!</p>

                  <button className={`w-full py-3 rounded-lg font-semibold transition-colors mb-8 ${
                    plan.isRecommended
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                  }`}>
                    Buy now
                  </button>

                  <div className="space-y-6">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex}>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white transition-colors mb-1">{feature.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{feature.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CERTIFICATIONS SECTION ═══ */}
      <section
        id="certifications"
        ref={(el) => { sectionRefs.current['certifications'] = el; }}
        className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Industry-Recognized Certifications
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseData.certifications.map((cert, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="text-center p-6 border border-gray-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{cert.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{cert.provider}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS SECTION ═══ */}
      <section
        id="testimonials"
        ref={(el) => { sectionRefs.current['testimonials'] = el; }}
        className="py-16 bg-gray-50 dark:bg-slate-950 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                What Our Students Say
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {courseData.testimonials.map((testimonial, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-slate-800'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm transition-colors">{testimonial.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQS SECTION ═══ */}
      <section
        id="faqs"
        ref={(el) => { sectionRefs.current['faqs'] = el; }}
        className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1 h-10 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold font-heading dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>

          <div className="max-w-3xl space-y-4">
            {courseData.faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4 transition-colors">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-180 text-orange-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors border-t border-gray-100 dark:border-slate-800 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STICKY BOTTOM NAV ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl px-4 py-3 flex items-center gap-1 overflow-x-auto border border-slate-200 dark:border-white/10 transition-colors">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex-shrink-0 w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-1"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}

            <button className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors ml-1 whitespace-nowrap">
              Buy now
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky nav */}
      <div className="h-20" />

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-50"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Sub-components ───

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <div className="text-slate-400 dark:text-gray-500">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-8 text-center hover:shadow-md transition-all duration-300">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{value}</div>
      <div className="text-gray-500 dark:text-gray-400 transition-colors">{label}</div>
    </div>
  );
}
