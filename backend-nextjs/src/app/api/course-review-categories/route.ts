import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { fetchCourseReviewCategories } from '@/lib/course-review-utils';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const items = await fetchCourseReviewCategories();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
