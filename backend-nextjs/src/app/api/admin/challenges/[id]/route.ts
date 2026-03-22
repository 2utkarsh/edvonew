import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { slugify } from '@/lib/query';
import { ChallengeItemModel } from '@/models/ChallengeItem';

function parseList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

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
  if (body.objective !== undefined) update.objective = String(body.objective || '');
  if (body.duration !== undefined) update.duration = String(body.duration || '');
  if (body.difficulty !== undefined) update.difficulty = String(body.difficulty || 'Intermediate');
  if (body.tools !== undefined) update.tools = parseList(body.tools);
  if (body.deliverables !== undefined) update.deliverables = parseList(body.deliverables);
  if (body.steps !== undefined) update.steps = parseList(body.steps);
  if (body.actionUrl !== undefined) update.actionUrl = String(body.actionUrl || '');
  if (body.startDate !== undefined) update.startDate = String(body.startDate || '');
  if (body.startTime !== undefined) update.startTime = String(body.startTime || '');
  if (body.endDate !== undefined) update.endDate = String(body.endDate || '');
  if (body.endTime !== undefined) update.endTime = String(body.endTime || '');
  if (body.registrationDeadline !== undefined) update.registrationDeadline = String(body.registrationDeadline || '');
  if (body.expiryDate !== undefined) update.expiryDate = String(body.expiryDate || '');
  if (body.competitionMode !== undefined) update.competitionMode = String(body.competitionMode || 'Individual');
  if (body.maxSubmissions !== undefined) update.maxSubmissions = Math.max(1, parseInt(String(body.maxSubmissions), 10) || 1);
  if (body.teamSize !== undefined) update.teamSize = String(body.teamSize || 'Solo or small team');
  if (body.statusNote !== undefined) update.statusNote = String(body.statusNote || '');
  if (body.eligibility !== undefined) update.eligibility = parseList(body.eligibility);
  if (body.rules !== undefined) update.rules = parseList(body.rules);

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
