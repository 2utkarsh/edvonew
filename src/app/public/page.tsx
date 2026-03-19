'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Play, Award, Briefcase, CheckCircle,
  TrendingUp, Zap, Target, Globe, ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FadeIn, ScaleIn } from '@/components/animations';
import CourseShowcaseCard from '@/components/marketing/CourseShowcaseCard';

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/40 overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transition-opacity" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-opacity" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <FadeIn>
            <Badge variant="gradient" className="mb-6 px-6 py-2">
              🎓 Industry-Integrated Learning Platform
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors">
              Learn. Build Projects.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Get Hired.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed transition-colors">
              Join thousands of students who transformed their careers through real projects, 
              industry mentorship, and guaranteed placement opportunities.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="group !px-10 !py-5 !text-lg">
                  Start Learning Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="!px-10 !py-5 !text-lg !border-gray-200 dark:!border-slate-800 dark:text-white">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.4}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50,000+', label: 'Students Placed' },
                { value: '500+', label: 'Hiring Partners' },
                { value: '4.8/5', label: 'Average Rating' },
                { value: '95%', label: 'Placement Rate' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Trusted By */}
          <FadeIn delay={0.5}>
            <div className="mt-16">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Trusted by leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-50 dark:opacity-40">
                {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
                  <span key={company} className="text-xl font-bold text-gray-400 dark:text-slate-500">{company}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// Courses Section
function CoursesSection() {
  const courses = [
    {
      title: 'Full Stack Web Development',
      description: 'Master React, Node.js, product APIs, and deployment with portfolio-ready builds.',
      duration: '6 months',
      students: '12,500 enrolled',
      rating: '4.9',
      reviewsText: '2.8k',
      price: '₹29,999',
      originalPrice: '₹49,999',
      lectures: '72 lessons',
      projects: '10 projects',
      badge: 'Career Track',
      category: 'Web Development',
      levelLabel: 'Builder Focused',
      palette: 'emerald' as const,
    },
    {
      title: 'Data Science & ML',
      description: 'Python, analytics, machine learning, and job-facing case studies in one path.',
      duration: '8 months',
      students: '8,200 enrolled',
      rating: '4.8',
      reviewsText: '2.1k',
      price: '₹34,999',
      originalPrice: '₹54,999',
      lectures: '84 lessons',
      projects: '12 case studies',
      badge: 'Flagship',
      category: 'Programming',
      levelLabel: 'Data Career Path',
      palette: 'blue' as const,
    },
    {
      title: 'Cloud & DevOps',
      description: 'Deploy, monitor, automate, and scale modern infra with hands-on workflow labs.',
      duration: '4 months',
      students: '5,800 enrolled',
      rating: '4.9',
      reviewsText: '1.4k',
      price: '₹24,999',
      originalPrice: '₹39,999',
      lectures: '48 lessons',
      projects: '7 labs',
      badge: 'Fast Track',
      category: 'Programming',
      levelLabel: 'Ops Intensive',
      palette: 'violet' as const,
    },
    {
      title: 'Mobile App Development',
      description: 'Create polished iOS and Android experiences using modern cross-platform stacks.',
      duration: '5 months',
      students: '6,300 enrolled',
      rating: '4.7',
      reviewsText: '1.7k',
      price: '₹27,999',
      originalPrice: '₹42,999',
      lectures: '58 lessons',
      projects: '9 builds',
      badge: 'Creator Path',
      category: 'Programming',
      levelLabel: 'App Launch Track',
      palette: 'amber' as const,
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Industry-Ready Courses</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Learn What Employers Want
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Industry-aligned curriculum designed with hiring partners
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <ScaleIn key={course.title} delay={index * 0.1}>
              <CourseShowcaseCard
                href="/courses"
                title={course.title}
                subtitle={course.description}
                category={course.category}
                levelLabel={course.levelLabel}
                rating={course.rating}
                reviewsText={course.reviewsText}
                studentsText={course.students}
                price={course.price}
                originalPrice={course.originalPrice}
                discountLabel="Limited Seats"
                duration={course.duration}
                lectures={course.lectures}
                projects={course.projects}
                badge={course.badge}
                palette={course.palette}
                ctaLabel="See Curriculum"
              />
            </ScaleIn>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/courses">
            <Button variant="outline" size="lg" className="group !rounded-2xl dark:text-white dark:!border-slate-800">
              View All Courses
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Certifications Section
function CertificationsSection() {
  const certifications = [
    { name: 'Full Stack Developer', partner: 'NSDC', logo: '/images/nsdc.png' },
    { name: 'Cloud Architect', partner: 'AWS', logo: '/images/aws.png' },
    { name: 'Data Scientist', partner: 'IIT Delhi', logo: '/images/iit.png' },
    { name: 'DevOps Engineer', partner: 'Google Cloud', logo: '/images/gcp.png' },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">Recognized Certifications</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Industry-Recognized Certificates
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get certified by leading institutions and companies
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <ScaleIn key={cert.name} delay={index * 0.1}>
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 text-center hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">Certified by {cert.partner}</p>
              </motion.div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Challenges Section
function ChallengesSection() {
  const challenges = [
    { title: '30-Day Coding Challenge', participants: 5200, prize: '₹50,000', difficulty: 'Beginner' },
    { title: 'Hackathon 2024', participants: 3400, prize: '₹1,00,000', difficulty: 'All Levels' },
    { title: 'Data Science Competition', participants: 2800, prize: '₹75,000', difficulty: 'Intermediate' },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">Live Challenges</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Compete & Win Prizes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Test your skills and win exciting prizes
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <ScaleIn key={challenge.title} delay={index * 0.1}>
              <motion.div
                className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-2xl p-6 text-white shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">{challenge.difficulty}</span>
                  <Zap className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <div className="text-sm opacity-80 uppercase tracking-tighter">Prize Pool</div>
                    <div className="font-black text-lg">{challenge.prize}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80 uppercase tracking-tighter">Participants</div>
                    <div className="font-bold">{challenge.participants.toLocaleString()}</div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-white text-indigo-700 rounded-xl font-black hover:bg-gray-100 transition-colors shadow-xl">
                  Join Now
                </button>
              </motion.div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// Success Stories Section
function SuccessStoriesSection() {
  const stories = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer at Google',
      story: 'From a non-tech background to Google in 8 months. EDVO made it possible!',
      salary: '₹32 LPA',
    },
    {
      name: 'Rahul Verma',
      role: 'Data Scientist at Amazon',
      story: 'The project-based learning approach helped me crack the toughest interviews.',
      salary: '₹28 LPA',
    },
    {
      name: 'Ananya Iyer',
      role: 'Full Stack Developer at Microsoft',
      story: 'Best investment I made in my career. The mentors are incredibly supportive.',
      salary: '₹35 LPA',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <Badge variant="gradient" className="mb-4">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Dream Jobs, Real Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how our students transformed their careers
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <ScaleIn key={story.name} delay={index * 0.1}>
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 hover:shadow-xl transition-all"
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{story.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{story.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic leading-relaxed">&quot;{story.story}&quot;</p>
                <div className="flex items-center gap-2 mt-6">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-black text-green-600 dark:text-green-400">{story.salary}</span>
                </div>
              </motion.div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 opacity-90">
            Join 50,000+ students who are already building their dream careers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button 
                variant="secondary" 
                size="lg" 
                className="!bg-white !text-indigo-600 hover:!bg-gray-100 !px-10 !py-5 !text-lg !font-black shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button 
                variant="outline" 
                size="lg" 
                className="!border-white !text-white hover:!bg-white/20 !px-10 !py-5 !text-lg !font-black"
              >
                Explore Courses
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function PublicHomePage() {
  return (
    <main className="dark:bg-slate-950">
      <HeroSection />
      <CoursesSection />
      <CertificationsSection />
      <ChallengesSection />
      <SuccessStoriesSection />
      <CTASection />
    </main>
  );
}
