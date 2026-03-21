import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { EnrollmentModel } from '@/models/Enrollment';
import { CourseModel } from '@/models/Course';

// GET user enrollments
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const enrollments = await EnrollmentModel.find({ userId })
      .populate('courseId', 'title thumbnail price rating instructorName category')
      .sort({ createdAt: -1 })
      .lean();

    return success(
      {
        enrollments: enrollments.map((e: any) => ({
          ...e.toObject(),
          id: e._id.toString(),
          course: e.courseId,
        })),
      },
      'Enrollments retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get enrollments error:', error);
    return fail(
      error.message || 'Failed to fetch enrollments',
      'FETCH_ENROLLMENTS_FAILED',
      undefined,
      500
    );
  }
}

// POST enroll in course
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return fail('Course ID is required', 'INVALID_REQUEST', undefined, 400);
    }

    // Verify course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return notFound('Course');
    }

    // Check if already enrolled
    const existingEnrollment = await EnrollmentModel.findOne({ userId, courseId });
    if (existingEnrollment) {
      return fail('Already enrolled in this course', 'ALREADY_ENROLLED', undefined, 409);
    }

    // Create enrollment (in real app, this would happen after payment)
    const enrollment = await EnrollmentModel.create({
      userId,
      courseId,
      status: 'active',
      progress: 0,
      completedLectures: [],
    });

    // Update course enrollment count
    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { studentsEnrolled: 1 },
    });

    return success(
      {
        enrollment: {
          id: enrollment._id.toString(),
          status: enrollment.status,
          enrolledAt: enrollment.createdAt,
        },
      },
      'Enrollment successful',
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Enroll course error:', error);
    return fail(
      error.message || 'Failed to enroll',
      'ENROLLMENT_FAILED',
      undefined,
      500
    );
  }
}
