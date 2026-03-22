import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapSuccessStoryToPublicStory } from '@/lib/success-story-data';
import { SuccessStoryModel } from '@/models/SuccessStory';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query: Record<string, unknown> = { status: 'active' };
    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await SuccessStoryModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map(mapSuccessStoryToPublicStory)));
  } catch (error) {
    return handleError(error);
  }
}
