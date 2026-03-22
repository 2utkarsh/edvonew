/**
 * Seed Sample Events (Webinars, Workshops, Hackathons)
 * Usage: npx tsx scripts/seed-events.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { EventModel } from '../src/models/Event';

config({ path: '.env.local' });

const sampleEvents = [
  // Webinars
  {
    title: 'Introduction to AI and Machine Learning',
    type: 'webinar',
    description: 'Learn the fundamentals of AI and ML in this comprehensive webinar. Perfect for beginners who want to understand the basics of artificial intelligence.',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: 90,
    maxParticipants: 500,
    price: 0,
    isPaid: false,
    tags: ['AI', 'Machine Learning', 'Technology'],
    requirements: ['Basic computer knowledge', 'Internet connection'],
    status: 'published',
    liveUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    title: 'Web Development Trends 2026',
    type: 'webinar',
    description: 'Discover the latest trends in web development including AI integration, WebAssembly, and modern frameworks.',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration: 60,
    maxParticipants: 300,
    price: 499,
    isPaid: true,
    tags: ['Web Development', 'Technology', 'Trends'],
    requirements: ['Interest in web development'],
    status: 'published',
    liveUrl: 'https://meet.google.com/webinar-2026',
  },
  
  // Workshops
  {
    title: 'Full Stack React & Node.js Workshop',
    type: 'workshop',
    description: 'Hands-on workshop to build a complete full-stack application using React, Node.js, Express, and MongoDB. Build your portfolio project!',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 240, // 4 hours
    maxParticipants: 50,
    price: 1999,
    isPaid: true,
    tags: ['React', 'Node.js', 'Full Stack', 'JavaScript'],
    requirements: ['Basic JavaScript knowledge', 'Node.js installed', 'Code editor'],
    status: 'published',
    liveUrl: 'https://meet.google.com/workshop-fullstack',
  },
  {
    title: 'Python for Data Science Workshop',
    type: 'workshop',
    description: 'Learn Python for data science including pandas, numpy, matplotlib, and basic machine learning with scikit-learn.',
    scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    duration: 180, // 3 hours
    maxParticipants: 100,
    price: 1499,
    isPaid: true,
    tags: ['Python', 'Data Science', 'Machine Learning'],
    requirements: ['Basic programming knowledge', 'Python installed'],
    status: 'published',
    liveUrl: 'https://meet.google.com/python-ds-workshop',
  },
  
  // Hackathons
  {
    title: 'AI Innovation Hackathon 2026',
    type: 'hackathon',
    description: '48-hour online hackathon focused on AI solutions for real-world problems. Win exciting prizes and get noticed by top companies!',
    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    duration: 2880, // 48 hours
    maxParticipants: 1000,
    price: 0,
    isPaid: false,
    tags: ['AI', 'Hackathon', 'Innovation', 'Competition'],
    requirements: ['Programming skills', 'Team of 2-4 members', 'GitHub account'],
    status: 'published',
    liveUrl: 'https://hackathon.ai2026.com',
    resources: ['https://hackathon.ai2026.com/rules', 'https://hackathon.ai2026.com/prizes'],
  },
  {
    title: 'Web3 Blockchain Hackathon',
    type: 'hackathon',
    description: 'Build the next generation of decentralized applications. Work with Ethereum, Solana, and other blockchain platforms.',
    scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    duration: 1440, // 24 hours
    maxParticipants: 500,
    price: 999,
    isPaid: true,
    tags: ['Blockchain', 'Web3', 'Smart Contracts', 'DeFi'],
    requirements: ['Blockchain basics', 'Solidity or Rust knowledge'],
    status: 'published',
    liveUrl: 'https://web3hack.dev',
    resources: ['https://web3hack.dev/resources', 'https://web3hack.dev/mentors'],
  },
];

async function seedEvents() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not configured');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing events (optional - comment out to keep existing data)
    // console.log('🗑️  Clearing existing events...');
    // await EventModel.deleteMany({});
    
    // Get instructor user (use admin or create one)
    const { UserModel } = await import('../src/models/User');
    let instructor = await UserModel.findOne({ role: { $in: ['instructor', 'admin'] } });
    
    if (!instructor) {
      console.log('⚠️  No instructor found, creating demo instructor...');
      const { hashPassword } = await import('../src/lib/auth');
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
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
      });
      console.log('✅ Created instructor: instructor@edvo.com / instructor123');
    }

    console.log(`📝 Seeding ${sampleEvents.length} events...`);
    
    let created = 0;
    let updated = 0;

    for (const eventData of sampleEvents) {
      const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const existingEvent = await EventModel.findOne({ slug });
      
      if (existingEvent) {
        await EventModel.updateOne({ slug }, {
          ...eventData,
          instructorId: instructor!._id,
          instructorName: instructor!.name,
          updatedAt: new Date(),
        });
        updated++;
        console.log(`✓ Updated: ${eventData.title}`);
      } else {
        await EventModel.create({
          ...eventData,
          slug,
          instructorId: instructor!._id,
          instructorName: instructor!.name,
          registeredCount: 0,
          thumbnail: `/images/events/${eventData.type}-${created + 1}.jpg`,
          banner: `/images/events/${eventData.type}-banner-${created + 1}.jpg`,
        });
        created++;
        console.log(`✓ Created: ${eventData.title}`);
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   📊 Created: ${created} events`);
    console.log(`   🔄 Updated: ${updated} events`);
    console.log(`\n🎯 Events available at: /backend/api/v1/events`);
    console.log(`\n📝 Instructor credentials:`);
    console.log(`   Email: ${instructor.email}`);
    console.log(`   Password: instructor123`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding events:', error.message);
    process.exit(1);
  }
}

seedEvents();
