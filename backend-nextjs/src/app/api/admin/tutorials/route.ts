import { connectToDatabase } from '@/lib/db';
import { created, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ResourceItemModel } from '@/models/ResourceItem';
import { mapResourceDocumentToTutorial } from '@/lib/resource-data';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ResourceItemModel.find({ type: 'tutorial' }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapResourceDocumentToTutorial)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const title = String(body.title || 'Untitled Tutorial');

  const item = await ResourceItemModel.create({
    type: 'tutorial',
    title,
    slug: String(body.slug || slugify(title)),
    description: String(body.description || ''),
    thumbnail: String(body.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: String(body.category || 'General'),
    tool: String(body.tool || 'Tool'),
    duration: String(body.duration || '1h 00m'),
    level: String(body.level || 'Beginner'),
    status: body.status === 'draft' || body.status === 'archived' ? body.status : 'published',
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(mapResourceDocumentToTutorial(item)));
}
