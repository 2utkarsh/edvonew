import {
  deleteAdminCourseDemoCategory,
  getAdminCourseDemoCategory,
  isAdminCourseDemoError,
  updateAdminCourseDemoCategory,
} from '@/lib/admin-course-demo-store';
import { requireAuth } from '@/lib/auth';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseModel } from '@/models/Course';
import { CourseCategoryModel } from '@/models/CourseCategory';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    const { id } = await params;

    if (!hasConfiguredMongoUri()) {
      const item = getAdminCourseDemoCategory(id);
      if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));
      return toResponse(ok(item));
    }

    await connectToDatabase();

    const item = await CourseCategoryModel.findById(id).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok({ ...item, id: String(item._id) }));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();

    if (!hasConfiguredMongoUri()) {
      const item = updateAdminCourseDemoCategory(id, (body || {}) as Record<string, unknown>);
      if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));
      return toResponse(ok(item));
    }

    await connectToDatabase();

    const current = await CourseCategoryModel.findById(id).lean();
    if (!current) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    const rawName = (body as any)?.name || (body as any)?.title;
    const nextName = rawName ? String(rawName).trim() : current.name;
    const nextSlug = (body as any)?.slug ? String((body as any).slug) : rawName ? slugify(String(rawName)) : current.slug;
    const duplicate = await CourseCategoryModel.findOne({
      _id: { $ne: id },
      $or: [{ name: nextName }, { slug: nextSlug }],
    }).lean();
    if (duplicate) {
      return toResponse(fail('A category with this name or slug already exists', 'CONFLICT', undefined, 409));
    }

    const update = {
      ...(rawName ? { name: nextName } : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...((body as any)?.description !== undefined ? { description: String((body as any).description || '') } : {}),
      ...((body as any)?.icon !== undefined ? { icon: String((body as any).icon || '') } : {}),
      ...((body as any)?.color !== undefined ? { color: String((body as any).color || '#c17017') } : {}),
      ...((body as any)?.order !== undefined ? { order: Number((body as any).order || 0) } : {}),
      ...((body as any)?.isActive !== undefined ? { isActive: Boolean((body as any).isActive) } : {}),
    };

    const item = await CourseCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    if (current.name !== item.name) {
      await CourseModel.updateMany({ category: current.name }, { $set: { category: item.name } });
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    const { id } = await params;

    if (!hasConfiguredMongoUri()) {
      const item = deleteAdminCourseDemoCategory(id);
      if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));
      return toResponse(ok(item));
    }

    await connectToDatabase();

    const current = await CourseCategoryModel.findById(id).lean();
    if (!current) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    const attachedCourses = await CourseModel.countDocuments({ category: current.name });
    if (attachedCourses > 0) {
      return toResponse(
        fail(
          `This category is still assigned to ${attachedCourses} course${attachedCourses === 1 ? '' : 's'}. Move those courses first.`,
          'CONFLICT',
          undefined,
          409,
        ),
      );
    }

    const item = await CourseCategoryModel.findByIdAndDelete(id).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok({ deleted: true, id }));
  } catch (error) {
    if (isAdminCourseDemoError(error)) {
      return toResponse(fail(error.message, error.code, undefined, error.status));
    }
    return handleError(error);
  }
}
