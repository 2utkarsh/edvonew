import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { UserModel } from '@/models/User';
import { EnrollmentModel } from '@/models/Enrollment';

// GET instructor dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    // Get instructor's courses
    const courses = await CourseModel.find({ instructorId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get total students across all courses
    const totalStudents = courses.reduce((sum, course) => sum + course.studentsEnrolled, 0);

    // Get total revenue (simplified - would come from payments in real app)
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price * course.studentsEnrolled), 0);

    // Get average rating
    const avgRating = courses.length > 0
      ? courses.reduce((sum, course) => sum + course.rating, 0) / courses.length
      : 0;

    // Get recent enrollments
    const courseIds = courses.map((c) => c._id);
    const recentEnrollments = await EnrollmentModel.find({ courseId: { $in: courseIds } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return success(
      {
        courses,
        stats: {
          totalCourses: courses.length,
          totalStudents,
          totalRevenue,
          averageRating: avgRating.toFixed(1),
        },
        recentEnrollments,
      },
      'Instructor dashboard data retrieved successfully'
    );
  } catch (error: any) {
    console.error('Instructor dashboard error:', error);
    return fail(
      error.message || 'Failed to fetch dashboard data',
      'FETCH_DASHBOARD_FAILED',
      undefined,
      500
    );
  }
}
