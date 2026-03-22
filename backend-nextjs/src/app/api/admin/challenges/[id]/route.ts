import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { slugify } from '@/lib/query';
import { ChallengeItemModel } from '@/models/ChallengeItem';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};
  if (body.title) { update.title = String(body.title); update.slug = String(body.slug || slugify(String(body.title))); }
  if (body.description !== undefined) update.description = String(body.description || '');
  if (body.image) update.image = String(body.image);
  if (body.category !== undefined) update.category = String(body.category || 'General');
  if (body.phase !== undefined) update.phase = body.phase === 'completed' ? 'completed' : 'ongoing';
  if (body.visibility !== undefined) update.visibility = body.visibility === 'inactive' ? 'inactive' : 'active';
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;
  if (body.prize !== undefined) update.prize = String(body.prize || '');
  if (body.participants !== undefined) update.participants = String(body.participants || '');
  if (body.href !== undefined) update.href = String(body.href || '');
  if (body.badge !== undefined) update.badge = body.badge ? String(body.badge) : undefined;

  const item = await ChallengeItemModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapChallengeDocumentToPublicChallenge(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await ChallengeItemModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
