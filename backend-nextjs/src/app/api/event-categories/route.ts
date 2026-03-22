import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { EventCategoryModel } from '@/models/EventItem';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query: Record<string, unknown> = { isActive: true };
    if (type && ['webinar', 'workshop', 'hackathon'].includes(type)) query.type = type;

    const items = await EventCategoryModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
