import { connectToDatabase } from '@/lib/db';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { mapSuccessStoryToPublicStory } from '@/lib/success-story-data';
import { SuccessStoryModel } from '@/models/SuccessStory';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await SuccessStoryModel.find().sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapSuccessStoryToPublicStory)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || '').trim();
  if (!name) {
    return toResponse(fail('Name is required', 'VALIDATION_ERROR', undefined, 400));
  }

  const story = await SuccessStoryModel.create({
    name,
    slug: String(body.slug || slugify(name)),
    location: String(body.location || ''),
    beforeRole: String(body.beforeRole || ''),
    afterRole: String(body.afterRole || ''),
    companyLogo: String(body.companyLogo || '/images/edvo-official-logo-v10.png'),
    avatar: String(body.avatar || '/images/edvo-official-logo-v10.png'),
    linkedinUrl: String(body.linkedinUrl || '#'),
    category: String(body.category || 'Career Growth'),
    tags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : String(body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    status: body.status === 'inactive' ? 'inactive' : 'active',
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(mapSuccessStoryToPublicStory(story)));
}
