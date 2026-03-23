import { requireAuth } from '@/lib/auth';
import { buildEnrollmentSnapshot, deriveLiveSessionStatus } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { CertificateModel } from '@/models/Certificate';
import { EnrollmentModel } from '@/models/Enrollment';
import { NotificationModel } from '@/models/Notification';

export async function GET() {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;

    const [enrollments, certificates, notifications] = await Promise.all([
      EnrollmentModel.find({ userId })
        .populate('courseId')
        .sort({ updatedAt: -1 })
        .lean(),
      CertificateModel.find({ userId }).sort({ issuedAt: -1 }).lean(),
      NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const myCourses = enrollments.map((enrollment: any) => {
      const course = enrollment.courseId;
      const snapshot = buildEnrollmentSnapshot(course, enrollment);
      return {
        enrollmentId: String(enrollment._id),
        course: {
          id: String(course._id),
          title: course.title,
          slug: course.slug,
          category: course.category,
          instructorName: course.instructorName,
          thumbnail: course.thumbnail,
          duration: course.duration,
          deliveryMode: course.deliveryMode || course.delivery || 'recorded',
          progress: enrollment.progress,
        },
        progress: enrollment.progress,
        attendance: snapshot.attendanceSummary,
        performance: snapshot.performanceSummary,
        participation: snapshot.participationSummary,
        certificateEligible: snapshot.certificateEligible,
        nextLiveSession: snapshot.nextLiveSession,
        lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
      };
    });

    const upcomingLiveSessions = myCourses
      .filter((item) => item.nextLiveSession)
      .map((item) => ({
        enrollmentId: item.enrollmentId,
        courseTitle: item.course.title,
        courseSlug: item.course.slug,
        ...item.nextLiveSession,
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);

    const completedCourses = myCourses.filter((course) => course.progress >= 100).length;
    const averageProgress =
      myCourses.length > 0 ? Math.round(myCourses.reduce((sum, course) => sum + course.progress, 0) / myCourses.length) : 0;

    return toResponse(success({
      myCourses,
      stats: {
        totalEnrolled: myCourses.length,
        completedCourses,
        inProgressCourses: myCourses.length - completedCourses,
        averageProgress,
        certificatesEarned: certificates.length,
        unreadNotifications: notifications.filter((item) => !item.isRead).length,
      },
      upcomingLiveSessions,
      notifications: notifications.map((item: any) => ({
        ...item,
        id: String(item._id),
      })),
      certificates: certificates.map((item: any) => ({
        ...item,
        id: String(item._id),
      })),
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch dashboard data', 'FETCH_DASHBOARD_FAILED', undefined, 500));
  }
}
