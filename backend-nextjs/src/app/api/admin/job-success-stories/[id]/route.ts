import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { mapSuccessStoryToPublicStory } from '@/lib/success-story-data';
import { SuccessStoryModel } from '@/models/SuccessStory';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.name) {
    update.name = String(body.name);
    update.slug = String(body.slug || slugify(String(body.name)));
  }
  if (body.location !== undefined) update.location = String(body.location || '');
  if (body.beforeRole !== undefined) update.beforeRole = String(body.beforeRole || '');
  if (body.afterRole !== undefined) update.afterRole = String(body.afterRole || '');
  if (body.companyLogo) update.companyLogo = String(body.companyLogo);
  if (body.avatar) update.avatar = String(body.avatar);
  if (body.linkedinUrl !== undefined) update.linkedinUrl = String(body.linkedinUrl || '#');
  if (body.category) update.category = String(body.category);
  if (body.tags !== undefined) update.tags = Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : String(body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  if (body.status) update.status = body.status === 'inactive' ? 'inactive' : 'active';
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;

  const item = await SuccessStoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Success story not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapSuccessStoryToPublicStory(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await SuccessStoryModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Success story not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
