import { getFallbackEvents } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { mapEventDocumentToPublicEvent } from '@/lib/event-data';
import { EventItemModel } from '@/models/EventItem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getFallbackEvents(type || undefined, category || undefined)));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const query: Record<string, unknown> = { visibility: 'active' };

    if (type && ['webinar', 'workshop', 'hackathon'].includes(type)) query.type = type;
    if (category) query.category = category;

    const items = await EventItemModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map(mapEventDocumentToPublicEvent)));
  } catch (error) {
    return handleError(error);
  }
}
