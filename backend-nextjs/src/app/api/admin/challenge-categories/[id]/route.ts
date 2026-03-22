import { connectToDatabase } from '@/lib/db';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ChallengeCategoryModel, ChallengeItemModel } from '@/models/ChallengeItem';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;
  await connectToDatabase();
  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update = { ...body, ...(body.name ? { slug: body.slug || slugify(String(body.name)) } : {}) };
  const item = await ChallengeCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Challenge category not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;
  await connectToDatabase();
  const { id } = await params;
  const item = await ChallengeCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Challenge category not found', 'NOT_FOUND', undefined, 404));
  const count = await ChallengeItemModel.countDocuments({ category: item.name });
  if (count > 0) return toResponse(fail('Cannot delete a category that is used by existing challenges', 'CONFLICT', undefined, 409));
  await ChallengeCategoryModel.findByIdAndDelete(id).lean();
  return toResponse(ok({ deleted: true, id }));
}
