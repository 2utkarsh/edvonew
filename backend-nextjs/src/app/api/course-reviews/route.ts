import { getFallbackCourseReviews } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { fetchManualCourseReviews, fetchSubmittedCourseReviews } from '@/lib/course-review-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getFallbackCourseReviews(category || undefined)));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const [submitted, manual] = await Promise.all([fetchSubmittedCourseReviews(), fetchManualCourseReviews()]);
    const items = submitted
      .filter((item) => item.isApproved)
      .concat(manual.filter((item) => item.status === 'active'))
      .filter((item) => !category || item.category === category)
      .sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
