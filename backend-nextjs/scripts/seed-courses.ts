/**
 * Seed Sample Courses Script
 * 
 * Usage: npx tsx scripts/seed-courses.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { CourseModel } from '../src/models/Course';
import { UserModel } from '../src/models/User';
import { hashPassword } from '../src/lib/auth';

config({ path: '.env.local' });

const sampleCourses = [
  {
    title: 'Complete Python Bootcamp: From Zero to Hero',
    shortDescription: 'Learn Python programming from scratch with hands-on projects',
    description: 'This comprehensive Python course takes you from beginner to advanced level. You will learn Python fundamentals, data structures, OOP, file handling, web scraping, and more through practical projects.',
    category: 'Programming',
    level: 'beginner' as const,
    price: 4999,
    originalPrice: 9999,
    discount: 50,
    duration: '40 hours',
    language: 'English',
    tags: ['python', 'programming', 'beginner', 'coding'],
    requirements: [
      'No programming experience needed',
      'A computer with internet access',
      'Willingness to learn',
    ],
    whatYouWillLearn: [
      'Python fundamentals and syntax',
      'Data structures and algorithms',
      'Object-oriented programming',
      'File handling and exceptions',
      'Web scraping with BeautifulSoup',
      'Building real-world projects',
    ],
    curriculum: [
      {
        name: 'Introduction',
        modules: [
          {
            title: 'Getting Started',
            lectures: [
              { title: 'Welcome to the Course', duration: '5:00', isFree: true },
              { title: 'Installing Python', duration: '10:00', isFree: true },
              { title: 'Your First Python Program', duration: '15:00' },
            ],
          },
        ],
      },
      {
        name: 'Python Basics',
        modules: [
          {
            title: 'Variables and Data Types',
            lectures: [
              { title: 'Understanding Variables', duration: '20:00' },
              { title: 'Strings in Python', duration: '25:00' },
              { title: 'Numbers and Math', duration: '20:00' },
            ],
          },
        ],
      },
    ],
    faqs: [
      { question: 'Do I need prior programming experience?', answer: 'No, this course starts from the basics.' },
      { question: 'What version of Python will I learn?', answer: 'Python 3, the latest version.' },
    ],
    testimonials: [
      { name: 'John D.', role: 'Student', company: 'Tech Corp', quote: 'Best Python course I have taken!', rating: 5 },
    ],
    stats: {
      hiringPartners: '50+',
      careerTransitions: '1000+',
      highestPackage: '15 LPA',
    },
  },
  {
    title: 'React JS - The Complete Guide including Hooks',
    shortDescription: 'Master React.js with modern hooks and best practices',
    description: 'Learn React.js from scratch and build modern web applications. This course covers React fundamentals, hooks, context API, Redux, and building production-ready applications.',
    category: 'Web Development',
    level: 'intermediate' as const,
    price: 5999,
    originalPrice: 11999,
    discount: 50,
    duration: '50 hours',
    language: 'English',
    tags: ['react', 'javascript', 'web-development', 'frontend'],
    requirements: [
      'Basic HTML, CSS, and JavaScript knowledge',
      'Understanding of ES6+ features',
      'Node.js installed',
    ],
    whatYouWillLearn: [
      'React fundamentals and JSX',
      'Components, props, and state',
      'Hooks (useState, useEffect, custom hooks)',
      'Context API for state management',
      'React Router for navigation',
      'Building and deploying production apps',
    ],
    curriculum: [
      {
        name: 'React Basics',
        modules: [
          {
            title: 'Introduction to React',
            lectures: [
              { title: 'What is React?', duration: '10:00', isFree: true },
              { title: 'Setting Up React Environment', duration: '15:00', isFree: true },
              { title: 'Understanding JSX', duration: '20:00' },
            ],
          },
        ],
      },
    ],
    faqs: [
      { question: 'Is React still relevant in 2024?', answer: 'Yes, React is widely used in the industry.' },
    ],
    stats: {
      hiringPartners: '100+',
      careerTransitions: '2000+',
      highestPackage: '20 LPA',
    },
  },
  {
    title: 'Machine Learning A-Z: AI, Python & R',
    shortDescription: 'Learn to create Machine Learning algorithms with Python and R',
    description: 'Master Machine Learning with this comprehensive course covering supervised and unsupervised learning, deep learning, NLP, and more. Build real-world AI applications.',
    category: 'Data Science',
    level: 'advanced' as const,
    price: 7999,
    originalPrice: 14999,
    discount: 47,
    duration: '60 hours',
    language: 'English',
    tags: ['machine-learning', 'ai', 'python', 'data-science'],
    requirements: [
      'Basic programming knowledge',
      'High school mathematics',
      'Python or R basics helpful',
    ],
    whatYouWillLearn: [
      'Machine Learning fundamentals',
      'Supervised and unsupervised learning',
      'Deep learning and neural networks',
      'Natural Language Processing',
      'Model deployment',
      'Real-world case studies',
    ],
    curriculum: [
      {
        name: 'Introduction to ML',
        modules: [
          {
            title: 'ML Basics',
            lectures: [
              { title: 'What is Machine Learning?', duration: '15:00', isFree: true },
              { title: 'Types of ML', duration: '20:00' },
            ],
          },
        ],
      },
    ],
    stats: {
      hiringPartners: '75+',
      careerTransitions: '1500+',
      highestPackage: '25 LPA',
    },
  },
  {
    title: 'Digital Marketing Masterclass',
    shortDescription: 'Become a Digital Marketing Expert with practical strategies',
    description: 'Learn digital marketing from industry experts. Master SEO, social media marketing, email marketing, Google Ads, content marketing, and analytics.',
    category: 'Marketing',
    level: 'beginner' as const,
    price: 3999,
    originalPrice: 7999,
    discount: 50,
    duration: '30 hours',
    language: 'English',
    tags: ['marketing', 'seo', 'social-media', 'digital-marketing'],
    requirements: [
      'Basic computer skills',
      'Interest in marketing',
      'No prior experience needed',
    ],
    whatYouWillLearn: [
      'SEO fundamentals and advanced techniques',
      'Social media marketing strategies',
      'Email marketing campaigns',
      'Google Ads and Facebook Ads',
      'Content marketing',
      'Analytics and reporting',
    ],
    curriculum: [
      {
        name: 'SEO Fundamentals',
        modules: [
          {
            title: 'Introduction to SEO',
            lectures: [
              { title: 'What is SEO?', duration: '10:00', isFree: true },
              { title: 'How Search Engines Work', duration: '15:00' },
            ],
          },
        ],
      },
    ],
    stats: {
      hiringPartners: '60+',
      careerTransitions: '800+',
      highestPackage: '12 LPA',
    },
  },
  {
    title: 'AWS Certified Solutions Architect',
    shortDescription: 'Prepare for AWS certification with hands-on labs',
    description: 'Complete AWS Solutions Architect certification preparation course. Learn cloud computing, AWS services, architecture best practices, and pass the certification exam.',
    category: 'Cloud Computing',
    level: 'intermediate' as const,
    price: 6999,
    originalPrice: 12999,
    discount: 46,
    duration: '45 hours',
    language: 'English',
    tags: ['aws', 'cloud', 'devops', 'certification'],
    requirements: [
      'Basic IT knowledge',
      'Understanding of networking',
      'Some programming experience helpful',
    ],
    whatYouWillLearn: [
      'AWS core services',
      'EC2, S3, RDS, Lambda',
      'VPC and networking',
      'Security best practices',
      'Architecture patterns',
      'Exam preparation and practice tests',
    ],
    curriculum: [
      {
        name: 'AWS Fundamentals',
        modules: [
          {
            title: 'Cloud Computing Basics',
            lectures: [
              { title: 'Introduction to Cloud', duration: '15:00', isFree: true },
              { title: 'AWS Global Infrastructure', duration: '20:00' },
            ],
          },
        ],
      },
    ],
    stats: {
      hiringPartners: '80+',
      careerTransitions: '1200+',
      highestPackage: '18 LPA',
    },
  },
];

async function seedCourses() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not configured');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database');

    // Find or create an instructor user
    let instructor = await UserModel.findOne({ role: 'instructor' });
    
    if (!instructor) {
      const passwordHash = await hashPassword('instructor123');
      instructor = await UserModel.create({
        name: 'Demo Instructor',
        email: 'instructor@edvo.com',
        passwordHash,
        role: 'instructor',
        isActive: true,
        status: 1,
        bio: 'Experienced instructor with 10+ years in the industry',
        headline: 'Senior Software Engineer & Educator',
        skills: ['Python', 'React', 'Machine Learning', 'AWS'],
      });
      console.log('✓ Created instructor user');
    }

    // Seed courses
    let createdCount = 0;
    let updatedCount = 0;

    for (const courseData of sampleCourses) {
      const slug = courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const existingCourse = await CourseModel.findOne({ slug });
      
      if (existingCourse) {
        await CourseModel.updateOne({ slug }, {
          ...courseData,
          instructorId: instructor!._id,
          instructorName: instructor!.name,
          updatedAt: new Date(),
        });
        updatedCount++;
        console.log(`✓ Updated: ${courseData.title}`);
      } else {
        await CourseModel.create({
          ...courseData,
          slug,
          instructorId: instructor!._id,
          instructorName: instructor!.name,
          status: 'published',
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 100),
          studentsEnrolled: Math.floor(Math.random() * 1000),
          publishedAt: new Date(),
        });
        createdCount++;
        console.log(`✓ Created: ${courseData.title}`);
      }
    }

    console.log(`\n✓ Seeding complete: ${createdCount} created, ${updatedCount} updated`);
    console.log(`\nInstructor credentials:`);
    console.log({
      email: instructor!.email,
      password: 'instructor123',
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Error seeding courses:', error.message);
    process.exit(1);
  }
}

seedCourses();
