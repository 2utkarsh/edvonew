import { normalizeBlogCategories } from '@/lib/blog-categories';
import { getFallbackBlogCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { BlogCategoryModel, BlogModel } from '@/models/Blog';
import { requireAdminOrDemo } from '@/lib/demo-admin';

declare global {
  var __edvoBlogCategoriesReady: boolean | undefined;
  var __edvoBlogCategoriesReadyPromise: Promise<void> | undefined;
}

async function syncBlogCategoriesFromBlogs() {
  const existingCategory = await BlogCategoryModel.exists({});
  if (existingCategory) {
    global.__edvoBlogCategoriesReady = true;
    return;
  }

  const [primaryCategories, multiCategories] = await Promise.all([
    BlogModel.distinct('category', { category: { $exists: true, $ne: '' } }),
    BlogModel.distinct('categories', { categories: { $exists: true } }),
  ]);

  const categories = normalizeBlogCategories(primaryCategories.concat(multiCategories as any));
  if (!categories.length) {
    return;
  }

  await Promise.all(
    categories.map((name, index) =>
      BlogCategoryModel.updateOne(
        { slug: slugify(String(name)) },
        {
          $setOnInsert: {
            name: String(name),
            slug: slugify(String(name)),
            description: `${String(name)} blog posts`,
            isActive: true,
            order: index + 1,
          },
        },
        { upsert: true }
      )
    )
  );

  global.__edvoBlogCategoriesReady = true;
}

async function ensureBlogCategoriesFromBlogs() {
  if (global.__edvoBlogCategoriesReady) return;

  if (!global.__edvoBlogCategoriesReadyPromise) {
    global.__edvoBlogCategoriesReadyPromise = syncBlogCategoriesFromBlogs()
      .catch((error) => {
        global.__edvoBlogCategoriesReadyPromise = undefined;
        throw error;
      })
      .finally(() => {
        if (global.__edvoBlogCategoriesReady) {
          global.__edvoBlogCategoriesReadyPromise = undefined;
        }
      });
  }

  await global.__edvoBlogCategoriesReadyPromise;
}

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackBlogCategories()));
  }

  await connectToDatabase();
  await ensureBlogCategoriesFromBlogs();

  const items = await BlogCategoryModel.find({}, 'name slug description isActive order createdAt updatedAt')
    .sort({ order: 1, updatedAt: -1 })
    .lean();
  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || '').trim();
  if (!name) {
    return toResponse(fail('Category name is required', 'VALIDATION_ERROR', undefined, 400));
  }

  const slug = String(body.slug || slugify(name));
  const existing = await BlogCategoryModel.findOne({ slug }).lean();
  if (existing) {
    return toResponse(fail('Blog category already exists', 'CONFLICT', undefined, 409));
  }

  const item = await BlogCategoryModel.create({
    name,
    slug,
    description: String(body.description || ''),
    isActive: body.isActive === false ? false : true,
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  global.__edvoBlogCategoriesReady = true;
  global.__edvoBlogCategoriesReadyPromise = undefined;

  return toResponse(created(item));
}