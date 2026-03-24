import { getFallbackCourseReviewCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ensureSeededContent } from '@/lib/content-seeder';
import { fetchCourseReviewCategories } from '@/lib/course-review-utils';
import { CourseReviewCategoryModel } from '@/models/CourseReviewItem';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackCourseReviewCategories()));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const items = await fetchCourseReviewCategories();
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
  const existing = await CourseReviewCategoryModel.findOne({ slug }).lean();
  if (existing) {
    return toResponse(fail('Course review category already exists', 'CONFLICT', undefined, 409));
  }

  const item = await CourseReviewCategoryModel.create({
    name,
    slug,
    description: String(body.description || ''),
    isActive: body.isActive === false ? false : true,
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(item));
}
