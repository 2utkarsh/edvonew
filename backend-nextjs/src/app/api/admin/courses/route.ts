import { requireAuth } from '@/lib/auth';
import { buildEnrollmentSnapshot, flattenCurriculumRows, normalizeCoursePayload } from '@/lib/course-runtime';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const [courses, categories, enrollments] = await Promise.all([
      CourseModel.find().sort({ order: 1, updatedAt: -1 }).lean(),
      CourseCategoryModel.find().sort({ order: 1, updatedAt: -1 }).lean(),
      EnrollmentModel.find().populate('userId', 'name email').lean(),
    ]);

    const enrollmentsByCourse = new Map();
    enrollments.forEach((enrollment) => {
      const key = String(enrollment.courseId);
      const bucket = enrollmentsByCourse.get(key) || [];
      bucket.push(enrollment);
      enrollmentsByCourse.set(key, bucket);
    });

    const formattedCourses = courses.map((course) => {
      const courseEnrollments = enrollmentsByCourse.get(String(course._id)) || [];
      const students = courseEnrollments.map((enrollment) => {
        const snapshot = buildEnrollmentSnapshot(course, enrollment);
        const user = enrollment.userId as any;
        return {
          id: String(enrollment._id),
          studentId: String(user?._id || ''),
          name: user?.name || 'Student',
          email: user?.email || '',
          progress: enrollment.progress || 0,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus || 'paid',
          attendance: snapshot.attendanceSummary.overallPercentage,
          performance: snapshot.performanceSummary.finalScore,
          participation:
            snapshot.participationSummary.discussionCount +
            snapshot.participationSummary.questionsAsked +
            snapshot.participationSummary.resourcesDownloaded,
          certificateEligible: snapshot.certificateEligible,
          lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
        };
      });

      const averageProgress =
        students.length > 0
          ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)
          : 0;
      const averageAttendance =
        students.length > 0
          ? Math.round(students.reduce((sum, student) => sum + student.attendance, 0) / students.length)
          : 0;
      const averagePerformance =
        students.length > 0
          ? Math.round(students.reduce((sum, student) => sum + student.performance, 0) / students.length)
          : 0;
      const averageParticipation =
        students.length > 0
          ? Math.round(students.reduce((sum, student) => sum + student.participation, 0) / students.length)
          : 0;

      return {
        ...course,
        id: String(course._id),
        curriculumRows: flattenCurriculumRows(course.curriculum),
        liveSessionsCount: Array.isArray(course.liveSessions) ? course.liveSessions.length : 0,
        deliveryMode: course.deliveryMode || course.delivery || 'recorded',
        studentMetrics: {
          totalStudents: students.length,
          averageProgress,
          averageAttendance,
          averagePerformance,
          averageParticipation,
        },
        students,
      };
    });

    return toResponse(
      ok({
        courses: formattedCourses,
        categories: categories.map((item) => ({ ...item, id: String(item._id) })),
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const body = await request.json();
    const payload = normalizeCoursePayload(body as Record<string, unknown>);
    const title = String(payload.title || 'Untitled Course');
    const slug = String(payload.slug || slugify(title));

    const exists = await CourseModel.findOne({ slug }).lean();
    if (exists) {
      return toResponse(fail('A course with this slug already exists', 'CONFLICT', undefined, 409));
    }

    const highestOrder = await CourseModel.findOne().sort({ order: -1, updatedAt: -1 }).select('order').lean();
    const order = payload.order > 0 ? payload.order : Number(highestOrder?.order || 0) + 1;

    const item = await CourseModel.create({
      ...payload,
      title,
      slug,
      order,
      publishedAt: payload.status === 'published' ? new Date() : undefined,
    });

    await syncCourseCategoryCounts();
    return toResponse(created({ ...item.toObject(), id: String(item._id) }));
  } catch (error) {
    return handleError(error);
  }
}
