import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, toResponse } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EventModel } from '@/models/Event';
import { EnrollmentModel } from '@/models/Enrollment';
import { UserModel } from '@/models/User';
import { Types } from 'mongoose';

// GET instructor dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor']);
    if ('error' in authResult) return toResponse(authResult.error);

    const userId = authResult.payload.sub;
    const isValidUserId = Types.ObjectId.isValid(userId);

    if (!isValidUserId) {
      return toResponse(success(
        {
          user: {
            name: authResult.payload.name || 'Teacher',
            email: authResult.payload.email || '',
            photo: '',
            avatar: '',
          },
          courses: [],
          liveModule: null,
          stats: {
            totalCourses: 0,
            totalStudents: 0,
            totalRevenue: 0,
            averageRating: '0.0',
          },
          recentEnrollments: [],
        },
        'Instructor dashboard data retrieved successfully'
      ));
    }

    const user = await UserModel.findById(userId).select('name email photo avatar headline').lean();

    // Get instructor's courses
    const courses = await CourseModel.find({ instructorId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    const liveEvents = await EventModel.find({
      instructorId: new Types.ObjectId(userId),
      status: { $in: ['live', 'published'] },
    })
      .sort({ scheduledAt: 1 })
      .lean();

    const liveModuleSource = liveEvents.find((event) => event.status === 'live') || liveEvents[0] || null;
    const liveModule = liveModuleSource
      ? {
          _id: String(liveModuleSource._id),
          title: liveModuleSource.title,
          type: liveModuleSource.type,
          status: liveModuleSource.status,
          scheduledAt: liveModuleSource.scheduledAt,
          duration: liveModuleSource.duration,
          liveUrl: liveModuleSource.liveUrl || '',
          instructorName: liveModuleSource.instructorName,
          registeredCount: liveModuleSource.registeredCount || 0,
          maxParticipants: liveModuleSource.maxParticipants || 0,
          slug: liveModuleSource.slug,
        }
      : null;

    // Get total students across all courses
    const totalStudents = courses.reduce(
      (sum, course) => sum + Number(course.studentsEnrolled ?? 0),
      0
    );

    // Get total revenue (simplified - would come from payments in real app)
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (Number(course.price ?? 0) * Number(course.studentsEnrolled ?? 0)),
      0
    );

    // Get average rating
    const avgRating = courses.length > 0
      ? courses.reduce((sum, course) => sum + Number(course.rating ?? 0), 0) / courses.length
      : 0;

    // Get recent enrollments
    const courseIds = courses.map((c) => c._id).filter(Boolean);
    const recentEnrollments = courseIds.length > 0
      ? await EnrollmentModel.find({ courseId: { $in: courseIds } })
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      : [];

    return toResponse(success(
      {
        user: {
          name: user?.name || authResult.payload.name || 'Teacher',
          email: user?.email || authResult.payload.email || '',
          photo: user?.photo || '',
          avatar: user?.avatar || '',
          headline: user?.headline || '',
        },
        courses,
        liveModule,
        stats: {
          totalCourses: courses.length,
          totalStudents,
          totalRevenue,
          averageRating: avgRating.toFixed(1),
        },
        recentEnrollments,
      },
      'Instructor dashboard data retrieved successfully'
    ));
  } catch (error: any) {
    console.error('Instructor dashboard error:', error);
    return toResponse(fail(
      error.message || 'Failed to fetch dashboard data',
      'FETCH_DASHBOARD_FAILED',
      undefined,
      500
    ));
  }
}
