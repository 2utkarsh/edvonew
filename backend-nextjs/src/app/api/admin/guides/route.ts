import { connectToDatabase } from '@/lib/db';
import { created, ok, parseJson, toResponse } from '@/lib/http';
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

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ResourceItemModel.find({ type: 'guide' }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapResourceDocumentToGuide)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const title = String(body.title || 'Untitled Guide');
  const track = String(body.track || body.category || 'Career Growth');
  const roadmapSteps = normalizeRoadmapSteps(body.roadmapSteps);

  const item = await ResourceItemModel.create({
    type: 'guide',
    title,
    slug: String(body.slug || slugify(title)),
    description: String(body.description || ''),
    thumbnail: String(body.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: track,
    track,
    steps: parseInt(String(body.steps || roadmapSteps.length || 0), 10) || 0,
    highlight: String(body.highlight || 'Featured'),
    icon: String(body.icon || 'Map'),
    roadmapSteps,
    roadmapFileName: String(body.roadmapFileName || `${slugify(title)}-roadmap.txt`),
    roadmapFileUrl: String(body.roadmapFileUrl || ''),
    status: body.status === 'draft' || body.status === 'archived' ? body.status : 'published',
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(mapResourceDocumentToGuide(item)));
}
