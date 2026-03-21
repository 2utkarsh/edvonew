/**
 * Seed Admin User Script
 * 
 * Usage: npm run seed:admin
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { hashPassword } from '../src/lib/auth';
import { UserModel } from '../src/models/User';

config({ path: '.env.local' });

async function seedAdmin() {
  try {
    // Connect to database
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not configured');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠ Admin user already exists');
      console.log({
        email: existingAdmin.email,
        name: existingAdmin.name,
      });
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const passwordHash = await hashPassword('admin123');
    
    const admin = await UserModel.create({
      name: 'Admin User',
      email: 'admin@edvo.com',
      passwordHash,
      role: 'admin',
      isActive: true,
      status: 1,
      skills: [],
      enrolledCourses: [],
      createdCourses: [],
    });

    console.log('✓ Admin user created successfully');
    console.log({
      email: admin.email,
      password: 'admin123',
      role: admin.role,
    });
    console.log('\n⚠ Please change the default password after first login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
