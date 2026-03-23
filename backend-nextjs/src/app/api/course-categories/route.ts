import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { bootstrapLegacyCourseCatalog } from '@/lib/ensure-legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';
import { getLegacyCategoriesForApi } from '@/lib/legacy-course-catalog-fallback';
import { CourseCategoryModel } from '@/models/CourseCategory';

function fallbackResponse() {
  return toResponse(ok(getLegacyCategoriesForApi()));
}

export async function GET() {
  try {
    if (!hasConfiguredMongoUri()) {
      return fallbackResponse();
    }

    await connectToDatabase();
    await bootstrapLegacyCourseCatalog();

    const items = await CourseCategoryModel.find({ isActive: true })
      .sort({ order: 1, updatedAt: -1 })
      .lean();

    return toResponse(
      ok(
        items.map((item) => ({
          id: String(item._id),
          name: item.name,
          slug: item.slug,
          description: item.description,
          icon: item.icon,
          color: item.color,
          order: item.order,
          isActive: item.isActive,
          courseCount: item.courseCount,
        }))
      )
    );
  } catch (error) {
    console.error('Falling back to built-in course categories', error);
    return fallbackResponse();
  }
}
