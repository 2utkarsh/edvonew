import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { EnrollmentModel } from '@/models/Enrollment';

// GET user's enrolled courses
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const enrollments = await EnrollmentModel.find({ userId, status: 'active' })
      .populate('courseId', 'title thumbnail price rating instructorName category level')
      .sort({ updatedAt: -1 })
      .lean();

    const myCourses = enrollments.map((e: any) => ({
      enrollment: {
        id: e._id.toString(),
        progress: e.progress,
        completedLectures: e.completedLectures,
        status: e.status,
        lastAccessedAt: e.updatedAt,
      },
      course: e.courseId,
    }));

    return success(
      { myCourses },
      'My courses retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get my courses error:', error);
    return fail(
      error.message || 'Failed to fetch courses',
      'FETCH_COURSES_FAILED',
      undefined,
      500
    );
  }
}
