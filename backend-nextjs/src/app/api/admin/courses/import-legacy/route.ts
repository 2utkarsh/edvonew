import { requireAdminOrDemo } from '@/lib/demo-admin';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import {
  importLegacyCourseCatalog,
  markLegacyCourseCatalogImported,
} from '@/lib/ensure-legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';
import {
  getLegacyAdminCoursesForApi,
  getLegacyCategoriesForApi,
} from '@/lib/legacy-course-catalog-fallback';
import { importLegacyAdminCourseDemoCatalog } from '@/lib/admin-course-demo-store';

function fallbackResponse() {
  return toResponse(ok(importLegacyAdminCourseDemoCatalog()));
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return fallbackResponse();
    }

    await connectToDatabase();

    const result = await importLegacyCourseCatalog();
    await markLegacyCourseCatalogImported();
    await syncCourseCategoryCounts();

    return toResponse(
      ok({
        createdCategories: result.createdCategories,
        updatedCategories: 0,
        createdCourses: result.createdCourses,
        skippedCourses: Math.max(result.totalLegacyCourses - result.createdCourses, 0),
        totalLegacyCourses: result.totalLegacyCourses,
        totalLegacyCategories: result.totalLegacyCategories,
      }),
    );
  } catch (error) {
    if (!hasConfiguredMongoUri()) {
      return toResponse(
        ok({
          createdCategories: 0,
          updatedCategories: 0,
          createdCourses: 0,
          skippedCourses: getLegacyAdminCoursesForApi().length,
          totalLegacyCourses: getLegacyAdminCoursesForApi().length,
          totalLegacyCategories: getLegacyCategoriesForApi().length,
          fallback: true,
        }),
      );
    }
    return handleError(error);
  }
}
