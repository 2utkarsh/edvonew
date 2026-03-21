import { z } from 'zod';
import { NextRequest } from 'next/server';

// Helper functions for validation
export async function validateRegisterInput(request: NextRequest) {
  try {
    const body = await request.json();
    return registerSchema.parse(body);
  } catch (error: any) {
    return null;
  }
}

export async function validateLoginInput(request: NextRequest) {
  try {
    const body = await request.json();
    return loginSchema.parse(body);
  } catch (error: any) {
    return null;
  }
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']).optional().default('student'),
  mobile: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

// User schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
  skills: z.array(z.string()).optional(),
  socialLinks: z.array(z.record(z.string(), z.string())).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Course schemas
export const createCourseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5).optional(),
  shortDescription: z.string().max(200).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  price: z.number().min(0, 'Price cannot be negative'),
  originalPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  curriculum: z.array(z.object({
    name: z.string(),
    modules: z.array(z.object({
      title: z.string(),
      lectures: z.array(z.object({
        title: z.string(),
        duration: z.string().optional(),
        videoUrl: z.string().url().optional(),
        isFree: z.boolean().optional(),
      })).optional(),
    })).optional(),
  })).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Enrollment schemas
export const enrollCourseSchema = z.object({
  courseId: z.string(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet']).optional(),
});

export const updateProgressSchema = z.object({
  lectureId: z.string(),
  completed: z.boolean(),
  progress: z.number().min(0).max(100),
});

// Exam schemas
export const createExamSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(1),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string(),
    marks: z.number().min(1),
  })).min(1, 'At least one question is required'),
  attempts: z.number().min(1).optional().default(1),
  price: z.number().min(0).default(0),
});

export const attemptExamSchema = z.object({
  examId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3).optional(),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  mode: z.enum(['remote', 'onsite', 'hybrid']),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  responsibilities: z.array(z.string()).optional(),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
    period: z.enum(['year', 'month', 'hour']).default('year'),
  }).optional(),
  benefits: z.array(z.string()).optional(),
  applicationUrl: z.string().url('Invalid URL'),
  applicationDeadline: z.string().datetime().optional(),
});

export const applyJobSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

// Subscription schemas
export const createSubscriptionSchema = z.object({
  planId: z.string(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'wallet']),
});

// Review schemas
export const createReviewSchema = z.object({
  courseId: z.string(),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').optional(),
});

// Certificate schemas
export const verifyCertificateSchema = z.object({
  certificateId: z.string(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
});

// Export type inference helpers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
