import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';

// GET student dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    // Get user's enrolled courses with progress
    const enrollments = await EnrollmentModel.find({ userId })
      .populate('courseId', 'title thumbnail price rating instructorName')
      .lean();

    const myCourses = enrollments.map((enrollment: any) => ({
      course: enrollment.courseId,
      progress: enrollment.progress,
      completedLectures: enrollment.completedLectures,
      enrolledAt: enrollment.createdAt,
    }));

    // Get completed courses
    const completedCourses = myCourses.filter((c: any) => c.progress === 100);

    // Get in-progress courses
    const inProgressCourses = myCourses.filter((c: any) => c.progress < 100 && c.progress > 0);

    return success(
      {
        myCourses,
        stats: {
          totalEnrolled: myCourses.length,
          completed: completedCourses.length,
          inProgress: inProgressCourses.length,
          averageProgress: myCourses.length > 0
            ? myCourses.reduce((acc: number, c: any) => acc + c.progress, 0) / myCourses.length
            : 0,
        },
        recentCourses: myCourses.slice(0, 5),
      },
      'Student dashboard data retrieved successfully'
    );
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return fail(
      error.message || 'Failed to fetch dashboard data',
      'FETCH_DASHBOARD_FAILED',
      undefined,
      500
    );
  }
}
