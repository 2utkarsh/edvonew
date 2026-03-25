import {
  deleteAdminCourseDemoCourse,
  getAdminCourseDemoCourse,
  isAdminCourseDemoError,
  updateAdminCourseDemoCourse,
} from '@/lib/admin-course-demo-store';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { buildEnrollmentSnapshot, flattenCurriculumRows, normalizeCoursePayload } from '@/lib/course-runtime';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    const { id } = await params;

    if (!hasConfiguredMongoUri()) {
      const course = getAdminCourseDemoCourse(id);
      if (!course) {
        return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
      }

      return toResponse(
        ok({
          ...course,
          id: String(course.id || course._id),
          curriculumRows: flattenCurriculumRows(course.curriculum),
          deliveryMode: course.deliveryMode || course.delivery || 'recorded',
          students: Array.isArray(course.students) ? course.students : [],
        }),
      );
    }

    await connectToDatabase();

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
      }),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    const { id } = await params;
    const body = await request.json();

    if (!hasConfiguredMongoUri()) {
      const item = updateAdminCourseDemoCourse(id, (body || {}) as Record<string, unknown>);
      if (!item) {
        return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
      }
      return toResponse(ok(item));
    }

    await connectToDatabase();

    const existing = await CourseModel.findById(id).lean();
    if (!existing) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    const mergedInput = {
      ...existing,
      ...body,
      stats: {
        ...(existing.stats || {}),
        ...(body.stats || {}),
      },
      certificateSettings: {
        ...(existing.certificateSettings || {}),
        ...(body.certificateSettings || {}),
      },
      notificationSettings: {
        ...(existing.notificationSettings || {}),
        ...(body.notificationSettings || {}),
      },
    };

    const payload = normalizeCoursePayload(mergedInput as Record<string, unknown>);
    const title = String((body as Record<string, unknown>).title || payload.title || existing.title || 'Untitled Course');
    const update = {
      ...payload,
      order: body.order !== undefined ? Number(body.order || 0) : Number(existing.order || payload.order || 0),
      ...(body.slug || payload.slug ? { slug: String(body.slug || payload.slug || slugify(title)) } : title ? { slug: slugify(title) } : {}),
      ...(payload.status === 'published' ? { publishedAt: existing.publishedAt || new Date() } : {}),
    };

    const item = await CourseModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    await syncCourseCategoryCounts();
    return toResponse(ok({ ...item, id: String(item._id) }));
  } catch (error) {
    if (isAdminCourseDemoError(error)) {
      return toResponse(fail(error.message, error.code, undefined, error.status));
    }
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    const { id } = await params;

    if (!hasConfiguredMongoUri()) {
      const item = deleteAdminCourseDemoCourse(id);
      if (!item) {
        return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
      }
      return toResponse(ok(item));
    }

    await connectToDatabase();

    const item = await CourseModel.findByIdAndDelete(id).lean();
    if (!item) {
      return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
    }

    await EnrollmentModel.deleteMany({ courseId: id });
    await syncCourseCategoryCounts();
    return toResponse(ok({ deleted: true, id }));
  } catch (error) {
    if (isAdminCourseDemoError(error)) {
      return toResponse(fail(error.message, error.code, undefined, error.status));
    }
    return handleError(error);
  }
}
