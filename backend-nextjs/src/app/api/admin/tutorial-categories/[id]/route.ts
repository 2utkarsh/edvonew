import { connectToDatabase } from '@/lib/db';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ResourceItemModel, TutorialCategoryModel } from '@/models/ResourceItem';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const current = await TutorialCategoryModel.findById(id).lean();
  if (!current) return toResponse(fail('Free course category not found', 'NOT_FOUND', undefined, 404));

  const nextName = String(body.name || current.name).trim() || current.name;
  const update = {
    ...body,
    name: nextName,
    slug: body.slug || slugify(nextName),
  };

  const item = await TutorialCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Free course category not found', 'NOT_FOUND', undefined, 404));

  if (current.name !== item.name) {
    await ResourceItemModel.updateMany(
      { type: 'tutorial', category: current.name },
      { $set: { category: item.name } }
    );
  }

  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const item = await TutorialCategoryModel.findById(id).lean();
  if (!item) return toResponse(fail('Free course category not found', 'NOT_FOUND', undefined, 404));

  const count = await ResourceItemModel.countDocuments({ type: 'tutorial', category: item.name });
  if (count > 0) {
    return toResponse(fail('Cannot delete a category that is used by existing free courses', 'CONFLICT', undefined, 409));
  }

  await TutorialCategoryModel.findByIdAndDelete(id).lean();
  return toResponse(ok({ deleted: true, id }));
}
