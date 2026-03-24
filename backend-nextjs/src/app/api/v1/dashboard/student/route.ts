import { requireAuth } from '@/lib/auth';
import { buildLearningWorkspaceUrl } from '@/lib/course-access';
import { buildEnrollmentSnapshot } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { CertificateModel } from '@/models/Certificate';
import { EnrollmentModel } from '@/models/Enrollment';
import { NotificationModel } from '@/models/Notification';

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function getParticipationTotal(summary: {
  discussionCount?: number;
  questionsAsked?: number;
  resourcesDownloaded?: number;
}) {
  return Number(summary?.discussionCount || 0) + Number(summary?.questionsAsked || 0) + Number(summary?.resourcesDownloaded || 0);
}

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

    const courseSnapshots = enrollments
      .map((enrollment: any) => {
        const course = enrollment.courseId;
        if (!course?._id) return null;

        const snapshot = buildEnrollmentSnapshot(course, enrollment);
        const deliveryMode = course.deliveryMode || course.delivery || 'recorded';

        return {
          enrollmentId: String(enrollment._id),
          launchUrl: buildLearningWorkspaceUrl(String(enrollment._id), course),
          course: {
            id: String(course._id),
            title: course.title,
            slug: course.slug,
            category: course.category,
            instructorName: course.instructorName,
            thumbnail: course.thumbnail,
            duration: course.duration,
            deliveryMode,
            progress: enrollment.progress,
          },
          progress: enrollment.progress,
          attendance: snapshot.attendanceSummary,
          performance: snapshot.performanceSummary,
          participation: snapshot.participationSummary,
          participationTotal: getParticipationTotal(snapshot.participationSummary),
          certificateEligible: snapshot.certificateEligible,
          nextLiveSession: snapshot.nextLiveSession,
          lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
          careerPaths: Array.isArray(course.careerPaths) ? course.careerPaths : [],
        };
      })
      .filter(Boolean) as Array<{
        enrollmentId: string;
        launchUrl: string;
        course: {
          id: string;
          title: string;
          slug: string;
          category?: string;
          instructorName?: string;
          thumbnail?: string;
          duration?: string;
          deliveryMode?: string;
          progress: number;
        };
        progress: number;
        attendance: { overallPercentage: number };
        performance: { finalScore: number; streakDays?: number };
        participation: { discussionCount?: number; questionsAsked?: number; resourcesDownloaded?: number };
        participationTotal: number;
        certificateEligible: boolean;
        nextLiveSession?: { title: string; startTime: string; status?: string } | null;
        lastAccessedAt?: string;
        careerPaths: Array<{
          title?: string;
          company?: string;
          location?: string;
          type?: string;
          mode?: string;
          salary?: string;
          applicationUrl?: string;
          note?: string;
        }>;
      }>;

    const myCourses = courseSnapshots.map(({ careerPaths, ...item }) => item);

    const upcomingLiveSessions = myCourses
      .filter((item) => item.nextLiveSession)
      .map((item) => ({
        enrollmentId: item.enrollmentId,
        courseTitle: item.course.title,
        courseSlug: item.course.slug,
        launchUrl: item.launchUrl,
        ...item.nextLiveSession,
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);

    const careerMap = new Map<string, {
      id: string;
      courseId: string;
      courseTitle: string;
      courseSlug: string;
      title: string;
      company?: string;
      location?: string;
      type?: string;
      mode?: string;
      salary?: string;
      applicationUrl?: string;
      note?: string;
    }>();

    courseSnapshots.forEach((item) => {
      item.careerPaths.forEach((careerPath, index) => {
        const title = String(careerPath?.title || '').trim();
        const company = String(careerPath?.company || '').trim();
        const applicationUrl = String(careerPath?.applicationUrl || '').trim();

        if (!title && !company && !applicationUrl) return;

        const key = [title.toLowerCase(), company.toLowerCase(), applicationUrl.toLowerCase(), item.course.id].join('::');
        if (careerMap.has(key)) return;

        careerMap.set(key, {
          id: `${item.course.id}-${index + 1}`,
          courseId: item.course.id,
          courseTitle: item.course.title,
          courseSlug: item.course.slug,
          title: title || 'Career opportunity',
          company: company || undefined,
          location: String(careerPath?.location || '').trim() || undefined,
          type: String(careerPath?.type || '').trim() || undefined,
          mode: String(careerPath?.mode || '').trim() || undefined,
          salary: String(careerPath?.salary || '').trim() || undefined,
          applicationUrl: applicationUrl || undefined,
          note: String(careerPath?.note || '').trim() || undefined,
        });
      });
    });

    const careerOpportunities = Array.from(careerMap.values()).slice(0, 12);
    const completedCourses = myCourses.filter((course) => course.progress >= 100).length;
    const averageProgress = average(myCourses.map((course) => Number(course.progress || 0)));
    const averageAttendance = average(myCourses.map((course) => Number(course.attendance?.overallPercentage || 0)));
    const averagePerformance = average(myCourses.map((course) => Number(course.performance?.finalScore || 0)));
    const totalParticipation = myCourses.reduce((sum, course) => sum + Number(course.participationTotal || 0), 0);
    const bestStreakDays = myCourses.length ? Math.max(...myCourses.map((course) => Number(course.performance?.streakDays || 0))) : 0;

    return toResponse(success({
      myCourses,
      stats: {
        totalEnrolled: myCourses.length,
        completedCourses,
        inProgressCourses: myCourses.length - completedCourses,
        averageProgress,
        averageAttendance,
        averagePerformance,
        totalParticipation,
        certificatesEarned: certificates.length,
        certificateReady: myCourses.filter((course) => course.certificateEligible).length,
        unreadNotifications: notifications.filter((item) => !item.isRead).length,
        bestStreakDays,
        careerMatches: careerOpportunities.length,
      },
      upcomingLiveSessions,
      careerOpportunities,
      notifications: notifications.map((item: any) => ({
        ...item,
        id: String(item._id),
      })),
      certificates: certificates.map((item: any) => ({
        ...item,
        id: String(item._id),
        credentialUrl: item.credentialUrl,
      })),
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch dashboard data', 'FETCH_DASHBOARD_FAILED', undefined, 500));
  }
}
