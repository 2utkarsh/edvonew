import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ResourceItemModel } from '@/models/ResourceItem';
import { mapResourceDocumentToTutorial } from '@/lib/resource-data';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.title) {
    update.title = String(body.title);
    update.slug = String(body.slug || slugify(String(body.title)));
  }
  if (body.description !== undefined) update.description = String(body.description || '');
  if (body.thumbnail) update.thumbnail = String(body.thumbnail);
  if (body.category) update.category = String(body.category);
  if (body.tool) update.tool = String(body.tool);
  if (body.duration) update.duration = String(body.duration);
  if (body.level) update.level = String(body.level);
  if (body.status) update.status = String(body.status);
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;

  const item = await ResourceItemModel.findOneAndUpdate({ _id: id, type: 'tutorial' }, update, { new: true }).lean();
  if (!item) return toResponse(fail('Tutorial not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapResourceDocumentToTutorial(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await ResourceItemModel.findOneAndDelete({ _id: id, type: 'tutorial' }).lean();
  if (!item) return toResponse(fail('Tutorial not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
