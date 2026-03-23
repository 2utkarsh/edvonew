import { requireAuth } from '@/lib/auth';
import { issueCourseCertificateIfEligible } from '@/lib/course-access';
import { buildEnrollmentSnapshot, countCourseLectures } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { UserModel } from '@/models/User';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const { id: courseId } = await params;

    const enrollment = await EnrollmentModel.findOne({ userId, courseId }).lean();
    if (!enrollment) {
      return toResponse(fail('Enrollment not found', 'NOT_FOUND', undefined, 404));
    }

    return toResponse(success({
      progress: {
        percentage: enrollment.progress,
        completedLectures: enrollment.completedLectures,
        lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
      },
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch progress', 'FETCH_PROGRESS_FAILED', undefined, 500));
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const { id: courseId } = await params;
    const body = await request.json();
    const lectureId = String(body.lectureId || '');
    const completed = Boolean(body.completed);

    if (!lectureId) {
      return toResponse(fail('Lecture ID is required', 'INVALID_REQUEST', undefined, 400));
    }

    const [enrollment, course, user] = await Promise.all([
      EnrollmentModel.findOne({ userId, courseId }),
      CourseModel.findById(courseId),
      UserModel.findById(userId).lean(),
    ]);

    if (!enrollment || !course) {
      return toResponse(fail('Enrollment not found', 'NOT_FOUND', undefined, 404));
    }

    let completedLectures = Array.isArray(enrollment.completedLectures) ? [...enrollment.completedLectures] : [];
    if (completed) {
      if (!completedLectures.includes(lectureId)) {
        completedLectures.push(lectureId);
      }
    } else {
      completedLectures = completedLectures.filter((id: string) => id !== lectureId);
    }

    const totalLectures = Math.max(countCourseLectures(course.toObject()), 1);
    const progress = Math.min(100, Math.round((completedLectures.length / totalLectures) * 100));

    enrollment.completedLectures = completedLectures;
    enrollment.progress = progress;
    enrollment.lastAccessedAt = new Date();

    const snapshot = buildEnrollmentSnapshot(course.toObject(), {
      ...enrollment.toObject(),
      completedLectures,
      progress,
      lastAccessedAt: new Date(),
    });

    enrollment.attendanceSummary = snapshot.attendanceSummary as any;
    enrollment.performanceSummary = {
      ...snapshot.performanceSummary,
      completionRate: progress,
    } as any;
    enrollment.participationSummary = snapshot.participationSummary as any;
    enrollment.certificateEligible = snapshot.certificateEligible;

    if (progress >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    await issueCourseCertificateIfEligible({
      course,
      enrollment,
      userName: user?.name || 'Student',
    });

    return toResponse(success({
      progress: {
        percentage: progress,
        completedLectures,
        attendance: snapshot.attendanceSummary,
        performance: snapshot.performanceSummary,
        participation: snapshot.participationSummary,
      },
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to update progress', 'UPDATE_PROGRESS_FAILED', undefined, 500));
  }
}
