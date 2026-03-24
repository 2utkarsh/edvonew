import { getFallbackChallengeCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ChallengeCategoryModel, ChallengeItemModel } from '@/models/ChallengeItem';

async function ensureCategoriesFromChallenges() {
  const existingCount = await ChallengeCategoryModel.countDocuments();
  if (existingCount > 0) return;
  const categories = await ChallengeItemModel.distinct('category', { category: { $exists: true, $ne: '' } });
  if (!categories.length) return;
  await Promise.all(categories.map((name, index) => ChallengeCategoryModel.updateOne(
    { slug: slugify(String(name)) },
    { $setOnInsert: { name: String(name), slug: slugify(String(name)), description: `${String(name)} challenges`, isActive: true, order: index } },
    { upsert: true }
  )));
}

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackChallengeCategories()));
  }

  await connectToDatabase();
  await ensureSeededContent();
  await ensureCategoriesFromChallenges();

  const items = await ChallengeCategoryModel.find().sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || '').trim();
  if (!name) return toResponse(fail('Category name is required', 'VALIDATION_ERROR', undefined, 400));
  const slug = String(body.slug || slugify(name));
  const existing = await ChallengeCategoryModel.findOne({ slug }).lean();
  if (existing) return toResponse(fail('Challenge category already exists', 'CONFLICT', undefined, 409));

  const item = await ChallengeCategoryModel.create({ name, slug, description: String(body.description || ''), isActive: body.isActive === false ? false : true, order: parseInt(String(body.order || 0), 10) || 0 });
  return toResponse(created(item));
}
