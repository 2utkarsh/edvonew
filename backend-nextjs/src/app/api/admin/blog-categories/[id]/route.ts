import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { BlogCategoryModel } from '@/models/Blog';
import { requireAdminOrDemo } from '@/lib/demo-admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const { id } = await params;
  const item = await BlogCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Blog category not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update = { ...body, ...(body.name ? { slug: body.slug || slugify(String(body.name)) } : {}) };
  const item = await BlogCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Blog category not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const { id } = await params;
  const item = await BlogCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Blog category not found', 'NOT_FOUND', undefined, 404));

  const blogCount = await (await import('@/models/Blog')).BlogModel.countDocuments({ category: item.name });
  if (blogCount > 0) {
    return toResponse(fail('Cannot delete a category that is used by existing blogs', 'CONFLICT', undefined, 409));
  }

  await BlogCategoryModel.findByIdAndDelete(id).lean();
  return toResponse(ok({ deleted: true, id }));
}
