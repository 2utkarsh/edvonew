import { requireAuth } from '@/lib/auth';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase } from '@/lib/db';
import { importLegacyCourseCatalog, markLegacyCourseCatalogImported } from '@/lib/ensure-legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';

export async function POST() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
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
    return handleError(error);
  }
}
