import { getFallbackCourseReviewCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { fetchCourseReviewCategories } from '@/lib/course-review-utils';

export async function GET() {
  try {
    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getFallbackCourseReviewCategories()));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const items = await fetchCourseReviewCategories();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
