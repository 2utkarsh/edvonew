import { getFallbackEventCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { EventCategoryModel, EventItemModel } from '@/models/EventItem';

async function ensureCategoriesFromEvents(type: string) {
  const existingCount = await EventCategoryModel.countDocuments({ type });
  if (existingCount > 0) return;

  const categories = await EventItemModel.distinct('category', { type, category: { $exists: true, $ne: '' } });
  if (!categories.length) return;

  await Promise.all(categories.map((name, index) => EventCategoryModel.updateOne(
    { slug: slugify(`${type}-${String(name)}`) },
    { $setOnInsert: { type, name: String(name), slug: slugify(`${type}-${String(name)}`), description: `${String(name)} ${type} events`, isActive: true, order: index } },
    { upsert: true }
  )));
}

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const type = String(searchParams.get('type') || 'webinar');

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackEventCategories(type)));
  }

  await connectToDatabase();
  await ensureSeededContent();
  await ensureCategoriesFromEvents(type);

  const items = await EventCategoryModel.find({ type }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || '').trim();
  const type = String(body.type || 'webinar');
  if (!name) return toResponse(fail('Category name is required', 'VALIDATION_ERROR', undefined, 400));
  if (!['webinar', 'workshop', 'hackathon'].includes(type)) return toResponse(fail('Valid event type is required', 'VALIDATION_ERROR', undefined, 400));

  const slug = String(body.slug || slugify(`${type}-${name}`));
  const existing = await EventCategoryModel.findOne({ slug }).lean();
  if (existing) return toResponse(fail('Event category already exists', 'CONFLICT', undefined, 409));

  const item = await EventCategoryModel.create({ type, name, slug, description: String(body.description || ''), isActive: body.isActive === false ? false : true, order: parseInt(String(body.order || 0), 10) || 0 });
  return toResponse(created(item));
}
