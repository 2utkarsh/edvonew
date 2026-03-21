import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { UserModel } from '@/models/User';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { ExamModel } from '@/models/Exam';
import { JobModel } from '@/models/Job';

// GET admin dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['admin']);
    if (authResult.error) return authResult.error;

    // Get statistics
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      recentUsers,
      recentCourses,
      topCourses,
    ] = await Promise.all([
      UserModel.countDocuments(),
      CourseModel.countDocuments(),
      EnrollmentModel.countDocuments(),
      // Total revenue would come from Payment collection
      Promise.resolve(0),
      UserModel.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      CourseModel.find().sort({ createdAt: -1 }).limit(5).select('title price studentsEnrolled createdAt'),
      CourseModel.find({ status: 'published' }).sort({ studentsEnrolled: -1 }).limit(5).select('title studentsEnrolled price rating'),
    ]);

    return success(
      {
        stats: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalRevenue,
        },
        recentUsers,
        recentCourses,
        topCourses,
      },
      'Admin dashboard data retrieved successfully'
    );
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return fail(
      error.message || 'Failed to fetch dashboard data',
      'FETCH_DASHBOARD_FAILED',
      undefined,
      500
    );
  }
}
