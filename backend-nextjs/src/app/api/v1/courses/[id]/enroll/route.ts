import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail, notFound } from '@/lib/http';
import { CourseModel } from '@/models/Course';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST enroll in course
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id: courseId } = await params;

    // Verify course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return notFound('Course');
    }

    if (course.status !== 'published') {
      return fail('Course is not available for enrollment', 'COURSE_NOT_AVAILABLE', undefined, 400);
    }

    // In a real implementation, you would:
    // 1. Check if user is already enrolled
    // 2. Process payment
    // 3. Create enrollment record
    // 4. Update course enrollment count

    return success(
      { 
        courseId,
        message: 'Enrollment flow initiated',
        nextStep: 'payment',
      },
      'Ready to enroll'
    );
  } catch (error: any) {
    console.error('Enroll course error:', error);
    return fail(
      error.message || 'Failed to enroll in course',
      'ENROLLMENT_FAILED',
      undefined,
      500
    );
  }
}
