import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { slugify } from '@/lib/query';
import { ChallengeItemModel } from '@/models/ChallengeItem';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ChallengeItemModel.find().sort({ phase: 1, order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapChallengeDocumentToPublicChallenge)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const title = String(body.title || '').trim();
  if (!title) return toResponse(fail('Title is required', 'VALIDATION_ERROR', undefined, 400));

  const item = await ChallengeItemModel.create({
    title,
    slug: String(body.slug || slugify(title)),
    description: String(body.description || ''),
    image: String(body.image || '/images/edvo-official-logo-v10.png'),
    category: String(body.category || 'General'),
    phase: body.phase === 'completed' ? 'completed' : 'ongoing',
    visibility: body.visibility === 'inactive' ? 'inactive' : 'active',
    order: parseInt(String(body.order || 0), 10) || 0,
    prize: String(body.prize || ''),
    participants: String(body.participants || ''),
    href: String(body.href || `/challenges/${slugify(title)}`),
    badge: body.badge ? String(body.badge) : undefined,
  });

  return toResponse(created(mapChallengeDocumentToPublicChallenge(item)));
}
