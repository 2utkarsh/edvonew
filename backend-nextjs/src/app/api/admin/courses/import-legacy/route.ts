import { requireAuth } from '@/lib/auth';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { importLegacyCourseCatalog, markLegacyCourseCatalogImported } from '@/lib/ensure-legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';
import { getLegacyAdminCoursesForApi, getLegacyCategoriesForApi } from '@/lib/legacy-course-catalog-fallback';

function fallbackResponse() {
  const totalLegacyCourses = getLegacyAdminCoursesForApi().length;
  const totalLegacyCategories = getLegacyCategoriesForApi().length;

  return toResponse(
    ok({
      createdCategories: 0,
      updatedCategories: 0,
      createdCourses: 0,
      skippedCourses: totalLegacyCourses,
      totalLegacyCourses,
      totalLegacyCategories,
      fallback: true,
    })
  );
}

export async function POST() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

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
      })
    );
  } catch (error) {
    if (!hasConfiguredMongoUri()) {
      return fallbackResponse();
    }
    return handleError(error);
  }
}
