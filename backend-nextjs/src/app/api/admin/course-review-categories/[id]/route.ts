import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { CourseReviewCategoryModel, CourseReviewItemModel } from '@/models/CourseReviewItem';
import { ReviewModel } from '@/models/Review';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update = { ...body, ...(body.name ? { slug: body.slug || slugify(String(body.name)) } : {}) };
  const item = await CourseReviewCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Course review category not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const item = await CourseReviewCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Course review category not found', 'NOT_FOUND', undefined, 404));

  const manualCount = await CourseReviewItemModel.countDocuments({ category: item.name });
  const submittedCount = await ReviewModel.aggregate([
    { $match: { isApproved: true } },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    { $match: { 'course.category': item.name } },
    { $count: 'total' },
  ]);

  if (manualCount > 0 || Number(submittedCount[0]?.total || 0) > 0) {
    return toResponse(fail('Cannot delete a category that is used by existing course reviews', 'CONFLICT', undefined, 409));
  }

  await CourseReviewCategoryModel.findByIdAndDelete(id).lean();
  return toResponse(ok({ deleted: true, id }));
}
