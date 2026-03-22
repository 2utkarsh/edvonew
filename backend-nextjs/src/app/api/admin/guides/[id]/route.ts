import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ResourceItemModel } from '@/models/ResourceItem';
import { mapResourceDocumentToGuide } from '@/lib/resource-data';

function normalizeRoadmapSteps(value: unknown) {
  if (Array.isArray(value)) return value.map((step) => String(step || '').trim()).filter(Boolean);
  return String(value || '')
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter(Boolean);
}

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
  if (body.track || body.category) {
    update.track = String(body.track || body.category);
    update.category = String(body.track || body.category);
  }
  if (body.steps !== undefined) update.steps = parseInt(String(body.steps), 10) || 0;
  if (body.highlight) update.highlight = String(body.highlight);
  if (body.icon) update.icon = String(body.icon);
  if (body.roadmapSteps !== undefined) update.roadmapSteps = normalizeRoadmapSteps(body.roadmapSteps);
  if (body.roadmapFileName !== undefined) update.roadmapFileName = String(body.roadmapFileName || '');
  if (body.roadmapFileUrl !== undefined) update.roadmapFileUrl = String(body.roadmapFileUrl || '');
  if (body.status) update.status = String(body.status);
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;

  const item = await ResourceItemModel.findOneAndUpdate({ _id: id, type: 'guide' }, update, { new: true }).lean();
  if (!item) return toResponse(fail('Guide not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapResourceDocumentToGuide(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await ResourceItemModel.findOneAndDelete({ _id: id, type: 'guide' }).lean();
  if (!item) return toResponse(fail('Guide not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
