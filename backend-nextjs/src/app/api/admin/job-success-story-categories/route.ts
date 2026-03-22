import { connectToDatabase } from '@/lib/db';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ensureSeededContent } from '@/lib/content-seeder';
import { SuccessStoryCategoryModel, SuccessStoryModel } from '@/models/SuccessStory';

async function ensureCategoriesFromStories() {
  const existingCount = await SuccessStoryCategoryModel.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const categories = await SuccessStoryModel.distinct('category', { category: { $exists: true, $ne: '' } });
  if (!categories.length) {
    return;
  }

  await Promise.all(
    categories.map((name, index) =>
      SuccessStoryCategoryModel.updateOne(
        { slug: slugify(String(name)) },
        {
          $setOnInsert: {
            name: String(name),
            slug: slugify(String(name)),
            description: `${String(name)} success stories`,
            isActive: true,
            order: index,
          },
        },
        { upsert: true }
      )
    )
  );
}

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();
  await ensureCategoriesFromStories();

  const items = await SuccessStoryCategoryModel.find().sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || '').trim();
  if (!name) {
    return toResponse(fail('Category name is required', 'VALIDATION_ERROR', undefined, 400));
  }

  const slug = String(body.slug || slugify(name));
  const existing = await SuccessStoryCategoryModel.findOne({ slug }).lean();
  if (existing) {
    return toResponse(fail('Job success story category already exists', 'CONFLICT', undefined, 409));
  }

  const item = await SuccessStoryCategoryModel.create({
    name,
    slug,
    description: String(body.description || ''),
    isActive: body.isActive === false ? false : true,
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(item));
}
