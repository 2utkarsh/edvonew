import { slugify } from '@/lib/query';

type LegacyCourseSeedInput = {
  title: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  deliveryMode?: 'recorded' | 'live' | 'hybrid';
  price: number;
  originalPrice?: number;
  duration?: string;
  order: number;
  shortDescription: string;
  description: string;
  learners?: number;
  rating?: number;
  reviewCount?: number;
  bannerTag?: string;
  featuredOutcomes?: string[];
  whatYouWillLearn?: string[];
  requirements?: string[];
};

export const legacyCourseCategories = [
  { name: 'Data Analytics', slug: 'data-analytics', description: 'Analytics, BI, SQL, Excel, and reporting programs.', color: '#0f766e', order: 1 },
  { name: 'AI & Data Science', slug: 'ai-data-science', description: 'Machine learning, deep learning, GenAI, and applied data science programs.', color: '#7c3aed', order: 2 },
  { name: 'Professional Skills', slug: 'professional-skills', description: 'Communication, deep work, personal branding, and workplace acceleration.', color: '#c17017', order: 3 },
  { name: 'Programming', slug: 'programming', description: 'Programming-first foundations for engineers and analysts.', color: '#2563eb', order: 4 },
  { name: 'Web Development', slug: 'web-development', description: 'Frontend and full-stack development programs.', color: '#16a34a', order: 5 },
  { name: 'Data Science', slug: 'data-science', description: 'Applied machine learning and predictive analytics tracks.', color: '#8b5cf6', order: 6 },
  { name: 'Marketing', slug: 'marketing', description: 'Digital marketing, SEO, ads, and content growth programs.', color: '#db2777', order: 7 },
  { name: 'Cloud Computing', slug: 'cloud-computing', description: 'Cloud architecture, infrastructure, and certification tracks.', color: '#0f766e', order: 8 },
];

function createCurriculum(title: string, outcomes: string[]) {
  const primaryOutcomes = outcomes.length ? outcomes : ['Foundations', 'Projects', 'Career execution'];

  return [
    {
      name: 'Foundation Sprint',
      description: 'Core concepts learners need before advanced ' + title + ' work.',
      modules: [
        {
          label: 'Module 1',
          title: 'Concepts and Setup',
          description: 'Understand the tools, workflows, and setup used in ' + title + '.',
          estimatedMinutes: 160,
          lectures: [
            { title: 'Welcome and roadmap', duration: '12m', isFree: true, contentType: 'recorded' },
            { title: 'Environment setup', duration: '18m', isFree: true, contentType: 'recorded' },
            { title: 'First guided walkthrough', duration: '28m', contentType: 'recorded' },
          ],
        },
        {
          label: 'Module 2',
          title: 'Hands-on drills',
          description: 'Short practical exercises that build daily consistency.',
          estimatedMinutes: 180,
          lectures: [
            { title: primaryOutcomes[0] || 'Core drill', duration: '26m', contentType: 'recorded' },
            { title: primaryOutcomes[1] || 'Applied workflow', duration: '32m', contentType: 'recorded' },
          ],
        },
      ],
    },
    {
      name: 'Project and Career Layer',
      description: 'Where learners build proof-of-work, portfolio assets, and outcome signals.',
      modules: [
        {
          label: 'Module 3',
          title: 'Project build',
          description: 'Turn ' + title + ' concepts into a visible portfolio project.',
          estimatedMinutes: 210,
          lectures: [
            { title: 'Capstone planning', duration: '20m', contentType: 'recorded' },
            { title: 'Project implementation', duration: '46m', contentType: 'recorded' },
          ],
        },
        {
          label: 'Module 4',
          title: 'Review and readiness',
          description: 'Interview positioning, revision loops, and milestone review.',
          estimatedMinutes: 155,
          lectures: [
            { title: primaryOutcomes[2] || 'Revision and placement support', duration: '24m', contentType: 'recorded' },
            { title: 'Mock review and next steps', duration: '22m', contentType: 'recorded' },
          ],
        },
      ],
    },
  ];
}

function createLegacyCourse(input: LegacyCourseSeedInput) {
  const price = input.price;
  const originalPrice = input.originalPrice || Math.round(price * 1.8);
  const featuredOutcomes = input.featuredOutcomes || [
    'Build practical ' + input.category.toLowerCase() + ' work',
    'Create a portfolio-ready capstone',
    'Improve hiring visibility and interview confidence',
  ];
  const whatYouWillLearn = input.whatYouWillLearn || [
    'Core ' + input.category.toLowerCase() + ' workflows',
    'Project implementation with review loops',
    'Delivery, storytelling, and career positioning',
  ];
  const requirements = input.requirements || ['Laptop with internet access', 'Consistency for guided practice', 'Beginner-friendly mindset'];

  return {
    title: input.title,
    slug: slugify(input.title),
    shortDescription: input.shortDescription,
    description: input.description,
    category: input.category,
    level: input.level || 'beginner',
    status: 'published',
    order: input.order,
    instructorName: 'EDVO Mentor Team',
    price,
    originalPrice,
    discount: Math.max(5, Math.round(((originalPrice - price) / originalPrice) * 100)),
    duration: input.duration || '8 weeks',
    delivery: input.deliveryMode || 'recorded',
    deliveryMode: input.deliveryMode || 'recorded',
    language: 'English',
    jobAssistance: true,
    bannerTag: input.bannerTag || 'Legacy Catalog',
    bannerSubtag: 'Imported from the earlier EDVO catalog for admin control.',
    bannerExtra: 'Admin can now edit, reorder, publish, and expand this course.',
    supportEmail: 'support@edvo.com',
    accessDurationMonths: 12,
    stats: {
      hiringPartners: '350+',
      careerTransitions: '12K+',
      highestPackage: '24 LPA',
    },
    tags: [slugify(input.category), slugify(input.title)].filter(Boolean),
    requirements,
    whatYouWillLearn,
    featuredOutcomes,
    curriculum: createCurriculum(input.title, featuredOutcomes),
    liveSessions: input.deliveryMode === 'live' || input.deliveryMode === 'hybrid'
      ? [
          {
            title: input.title + ' live kickoff',
            description: 'Mentor-led onboarding and execution roadmap.',
            hostName: 'EDVO Mentor Team',
            startTime: '2026-04-10T19:00:00+05:30',
            endTime: '2026-04-10T20:30:00+05:30',
            timezone: 'Asia/Kolkata',
            attendanceRequired: true,
            status: 'scheduled',
          },
        ]
      : [],
    mentors: [
      {
        name: 'EDVO Mentor Team',
        designation: 'Program Mentor',
        company: 'EDVO',
        experience: '8+ years industry experience',
      },
    ],
    plans: [
      {
        name: 'Core Access',
        price,
        isRecommended: true,
        features: [
          { label: 'Format', value: input.deliveryMode === 'live' ? 'Live classes' : input.deliveryMode === 'hybrid' ? 'Hybrid learning' : 'Recorded learning' },
          { label: 'Curriculum', value: 'Modules, projects, and mentor guidance' },
          { label: 'Certificate', value: 'Completion certificate included' },
        ],
      },
      {
        name: 'Mentor Plus',
        price: price + Math.round(price * 0.35),
        isRecommended: false,
        features: [
          { label: 'Support', value: 'Priority mentor support' },
          { label: 'Reviews', value: 'Project and mock interview reviews' },
          { label: 'Career', value: 'Resume and portfolio refinement' },
        ],
      },
    ],
    offerings: [
      { icon: 'book', title: 'Structured modules' },
      { icon: 'briefcase', title: 'Career support' },
      { icon: 'award', title: 'Completion certificate' },
    ],
    faqs: [
      { question: 'Is ' + input.title + ' beginner-friendly?', answer: 'Yes. The learning flow is guided and admin can expand the program over time.' },
      { question: 'Will I get recordings and resources?', answer: 'Yes. Course materials and structured modules are included in the student dashboard.' },
    ],
    testimonials: [
      {
        name: 'EDVO Learner',
        role: 'Program Graduate',
        company: 'Career Switcher',
        quote: 'The ' + input.title + ' track gave me a clear roadmap and project-first learning experience.',
        rating: input.rating || 5,
      },
    ],
    certifications: [
      { name: input.title + ' Certificate', provider: 'EDVO' },
    ],
    certificateSettings: {
      enabled: true,
      minProgressPercentage: 100,
      minAttendancePercentage: 70,
      minPerformanceScore: 60,
      templateName: 'EDVO Completion Certificate',
      badgeLabel: 'Course Graduate',
    },
    notificationSettings: {
      enrollmentConfirmation: true,
      liveClassReminder: true,
      certificateIssued: true,
    },
    rating: input.rating || 4.9,
    reviewCount: input.reviewCount || 120,
    studentsEnrolled: input.learners || 2500,
  };
}

export const legacyCourses = [
  createLegacyCourse({ order: 1, title: 'Data Science with Generative AI Bootcamp', category: 'AI & Data Science', level: 'advanced', deliveryMode: 'hybrid', price: 24999, originalPrice: 39999, duration: '8 months', shortDescription: 'Flagship live plus recorded bootcamp for data science, ML, and GenAI execution.', description: 'This flagship bootcamp brings together analytics, machine learning, GenAI workflows, portfolio projects, mentor reviews, and hiring support in one admin-managed program.', learners: 3420, rating: 4.9, reviewCount: 320, bannerTag: 'Flagship Cohort', featuredOutcomes: ['Master Python, SQL, ML, and GenAI tools', 'Ship capstone work and production-style case studies', 'Prepare for interviews with portfolio support'], whatYouWillLearn: ['Data analysis, ML, and GenAI workflows', 'Model building, prompting, and experimentation', 'Project delivery and career execution'], requirements: ['Basic spreadsheets or analytics exposure helps', 'Laptop and internet connection', 'Commitment to live and recorded learning'] }),
  createLegacyCourse({ order: 2, title: 'Excel: Mother of Business Intelligence', category: 'Data Analytics', level: 'beginner', price: 1500, originalPrice: 2900, duration: '4 weeks', shortDescription: 'Learn Excel foundations, dashboards, reporting logic, and business analysis workflows.', description: 'An essential Excel track for beginners who want to build analysis habits, reporting confidence, and decision-making clarity.' }),
  createLegacyCourse({ order: 3, title: 'Get Job Ready: Power BI Data Analytics for All Levels 3.0', category: 'Data Analytics', level: 'intermediate', price: 3300, originalPrice: 5400, duration: '7 weeks', shortDescription: 'Power BI dashboards, storytelling, data modeling, and interview-ready business reporting.', description: 'A guided Power BI program for learners who want portfolio dashboards, stakeholder-style storytelling, and analyst job readiness.' }),
  createLegacyCourse({ order: 4, title: 'SQL Beginner to Advanced For Data Professionals', category: 'Data Analytics', level: 'beginner', price: 1500, originalPrice: 2800, duration: '5 weeks', shortDescription: 'Master SQL from fundamentals to analytics problem solving and interview workflows.', description: 'Structured SQL learning for analysts and developers who need practical querying, case-style problem solving, and reporting fluency.' }),
  createLegacyCourse({ order: 5, title: 'Python: Beginner to Advanced For Data Professionals', category: 'Data Analytics', level: 'beginner', price: 1200, originalPrice: 2500, duration: '6 weeks', shortDescription: 'Python workflows for analysts and operators who need automation, wrangling, and data storytelling.', description: 'A practical Python track focused on reusable scripts, analysis workflows, and confident portfolio growth.' }),
  createLegacyCourse({ order: 6, title: 'AI Automation for Data Professionals', category: 'Data Analytics', level: 'intermediate', deliveryMode: 'hybrid', price: 1800, originalPrice: 3200, duration: '5 weeks', shortDescription: 'Use AI tools to automate reporting, decision support, and repetitive data workflows.', description: 'A modern upskilling program for professionals who want to use AI to speed up analysis, reporting, and operational tasks.' }),
  createLegacyCourse({ order: 7, title: 'Data Engineering Basics for Data Analysts', category: 'Data Analytics', level: 'intermediate', price: 1500, originalPrice: 3000, duration: '5 weeks', shortDescription: 'Pipelines, warehouse basics, data quality thinking, and analyst-friendly engineering foundations.', description: 'This course closes the gap between dashboards and data infrastructure for analysts who want stronger technical depth.' }),
  createLegacyCourse({ order: 8, title: 'Gen AI to Agentic AI with Business Projects', category: 'AI & Data Science', level: 'advanced', deliveryMode: 'hybrid', price: 2700, originalPrice: 4500, duration: '6 weeks', shortDescription: 'Go from prompts to agentic workflows with practical business projects and evaluations.', description: 'A project-first program that covers prompting, retrieval, orchestration, evaluation, and agentic workflows for real business-style problems.' }),
  createLegacyCourse({ order: 9, title: 'Master Machine Learning for Data Science & AI: Beginner to Advanced', category: 'AI & Data Science', level: 'advanced', price: 1800, originalPrice: 3500, duration: '7 weeks', shortDescription: 'Machine learning foundations through applied modeling, experimentation, and deployment thinking.', description: 'A machine learning track that helps learners move from model understanding to execution, evaluation, and project delivery.' }),
  createLegacyCourse({ order: 10, title: 'Deep Learning: Beginner to Advanced', category: 'AI & Data Science', level: 'advanced', price: 1200, originalPrice: 2400, duration: '5 weeks', shortDescription: 'Neural networks, deep learning workflows, and practical implementation for modern AI builders.', description: 'A deep learning curriculum that introduces architectures, experimentation patterns, and hands-on execution for serious learners.' }),
  createLegacyCourse({ order: 11, title: 'Math and Statistics For AI, Data Science', category: 'AI & Data Science', level: 'beginner', price: 900, originalPrice: 1800, duration: '4 weeks', shortDescription: 'The mathematical intuition required for analytics, machine learning, and model interpretation.', description: 'Build confidence with the statistics and mathematical ideas that power dashboards, machine learning, and experimentation.' }),
  createLegacyCourse({ order: 12, title: 'AI Toolkit For Professionals', category: 'Professional Skills', level: 'beginner', price: 1800, originalPrice: 3200, duration: '3 weeks', shortDescription: 'Use modern AI tools to improve productivity, research, writing, and daily workflows.', description: 'A fast-moving toolkit course that helps professionals adopt AI tools without hype and apply them immediately at work.' }),
  createLegacyCourse({ order: 13, title: 'Mastering Communication & Stakeholder Management', category: 'Professional Skills', level: 'beginner', price: 600, originalPrice: 1200, duration: '2 weeks', shortDescription: 'Communicate clearly, influence stakeholders, and make your work easier to trust and act on.', description: 'A practical communication course for professionals who want sharper updates, better alignment, and stronger leadership presence.' }),
  createLegacyCourse({ order: 14, title: 'Mastering Time Management & Deep Work', category: 'Professional Skills', level: 'beginner', price: 900, originalPrice: 1600, duration: '2 weeks', shortDescription: 'Build focused work systems, planning habits, and execution discipline for ambitious professionals.', description: 'A systems-first productivity course that helps learners create space for deep work, consistent progress, and cleaner execution.' }),
  createLegacyCourse({ order: 15, title: 'Personal Branding (LinkedIn & Beyond) for All Professionals', category: 'Professional Skills', level: 'beginner', price: 900, originalPrice: 1600, duration: '2 weeks', shortDescription: 'Improve LinkedIn, portfolio visibility, professional positioning, and opportunity flow.', description: 'A practical positioning course that helps learners present their work better and create stronger career momentum online.' }),
  createLegacyCourse({ order: 16, title: 'Complete Python Bootcamp: From Zero to Hero', category: 'Programming', level: 'beginner', price: 4999, originalPrice: 9999, duration: '40 hours', shortDescription: 'Learn Python programming from scratch with hands-on projects and practical foundations.', description: 'A broad Python course that covers syntax, data structures, OOP, automation patterns, and project building for new learners.' }),
  createLegacyCourse({ order: 17, title: 'React JS - The Complete Guide including Hooks', category: 'Web Development', level: 'intermediate', price: 5999, originalPrice: 11999, duration: '50 hours', shortDescription: 'Modern React development with components, hooks, routing, and production-ready workflows.', description: 'A complete React curriculum that helps learners build interactive applications, reusable UI systems, and frontend portfolio projects.' }),
  createLegacyCourse({ order: 18, title: 'Machine Learning A-Z: AI, Python & R', category: 'Data Science', level: 'advanced', price: 7999, originalPrice: 14999, duration: '60 hours', shortDescription: 'Comprehensive machine learning coverage with applied case studies, modeling, and AI fundamentals.', description: 'A rich machine learning program for learners who want hands-on experimentation, implementation, and AI portfolio depth.' }),
  createLegacyCourse({ order: 19, title: 'Digital Marketing Masterclass', category: 'Marketing', level: 'beginner', price: 3999, originalPrice: 7999, duration: '30 hours', shortDescription: 'SEO, social media, ads, content, email, and analytics in one practical marketing track.', description: 'A beginner-friendly marketing course for professionals who want usable frameworks for campaigns, growth, and measurement.' }),
  createLegacyCourse({ order: 20, title: 'AWS Certified Solutions Architect', category: 'Cloud Computing', level: 'intermediate', price: 6999, originalPrice: 12999, duration: '45 hours', shortDescription: 'Cloud architecture and AWS certification preparation with practical labs and best practices.', description: 'A certification-oriented AWS track that covers infrastructure, architecture decisions, security, and exam readiness.' }),
];
