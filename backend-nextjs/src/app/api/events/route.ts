import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { mapEventDocumentToPublicEvent } from '@/lib/event-data';
import { EventItemModel } from '@/models/EventItem';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const query: Record<string, unknown> = { visibility: 'active' };

    if (type && ['webinar', 'workshop', 'hackathon'].includes(type)) query.type = type;
    if (category) query.category = category;

    const items = await EventItemModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map(mapEventDocumentToPublicEvent)));
  } catch (error) {
    return handleError(error);
  }
}
