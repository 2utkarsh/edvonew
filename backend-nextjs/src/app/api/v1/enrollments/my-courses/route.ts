import { requireAuth } from '@/lib/auth';
import { buildLearningWorkspaceUrl } from '@/lib/course-access';
import { buildEnrollmentSnapshot } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { EnrollmentModel } from '@/models/Enrollment';

export async function GET() {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const enrollments = await EnrollmentModel.find({ userId, paymentStatus: 'paid' })
      .populate('courseId')
      .sort({ updatedAt: -1 })
      .lean();

    const myCourses = enrollments.map((enrollment: any) => {
      const course = enrollment.courseId;
      const snapshot = buildEnrollmentSnapshot(course, enrollment);
      return {
        enrollment: {
          id: String(enrollment._id),
          progress: enrollment.progress,
          completedLectures: enrollment.completedLectures,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
          launchUrl: buildLearningWorkspaceUrl(String(enrollment._id), course),
        },
        course: {
          id: String(course._id),
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          rating: course.rating,
          instructorName: course.instructorName,
          category: course.category,
          level: course.level,
          deliveryMode: course.deliveryMode || course.delivery || 'recorded',
          duration: course.duration,
        },
        attendance: snapshot.attendanceSummary,
        performance: snapshot.performanceSummary,
        participation: snapshot.participationSummary,
        certificateEligible: snapshot.certificateEligible,
        nextLiveSession: snapshot.nextLiveSession,
      };
    });

    return toResponse(success({ myCourses }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch courses', 'FETCH_COURSES_FAILED', undefined, 500));
  }
}