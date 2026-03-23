import { requireAuth } from '@/lib/auth';
import { buildEnrollmentSnapshot, flattenCurriculumRows, normalizeCoursePayload } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const { id } = await params;
    const course = await CourseModel.findById(id).lean();
    if (!course) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    const enrollments = await EnrollmentModel.find({ courseId: id }).populate('userId', 'name email').lean();
    const students = enrollments.map((enrollment) => {
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

    return toResponse(
      ok({
        ...course,
        id: String(course._id),
        curriculumRows: flattenCurriculumRows(course.curriculum),
        deliveryMode: course.deliveryMode || course.delivery || 'recorded',
        students,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const payload = normalizeCoursePayload(body as Record<string, unknown>);
    const title = String(payload.title || body.title || 'Untitled Course');
    const update = {
      ...payload,
      ...(payload.slug ? { slug: payload.slug } : title ? { slug: slugify(title) } : {}),
      ...(payload.status === 'published' ? { publishedAt: new Date() } : {}),
    };

    const item = await CourseModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    return toResponse(ok({ ...item, id: String(item._id) }));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const { id } = await params;
    const item = await CourseModel.findByIdAndDelete(id).lean();
    if (!item) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    await EnrollmentModel.deleteMany({ courseId: id });
    return toResponse(ok({ deleted: true, id }));
  } catch (error) {
    return handleError(error);
  }
}
