import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { SuccessStoryCategoryModel, SuccessStoryModel } from '@/models/SuccessStory';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update = { ...body, ...(body.name ? { slug: body.slug || slugify(String(body.name)) } : {}) };
  const item = await SuccessStoryCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Success story category not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const item = await SuccessStoryCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Success story category not found', 'NOT_FOUND', undefined, 404));

  const storyCount = await SuccessStoryModel.countDocuments({ category: item.name });
  if (storyCount > 0) {
    return toResponse(fail('Cannot delete a category that is used by existing job success stories', 'CONFLICT', undefined, 409));
  }

  await SuccessStoryCategoryModel.findByIdAndDelete(id).lean();
  return toResponse(ok({ deleted: true, id }));
}
