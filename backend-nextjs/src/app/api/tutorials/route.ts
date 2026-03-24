import { getFallbackTutorials } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { ResourceItemModel } from '@/models/ResourceItem';
import { mapResourceDocumentToTutorial } from '@/lib/resource-data';

export async function GET() {
  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackTutorials()));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ResourceItemModel.find({ type: 'tutorial', status: 'published' }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapResourceDocumentToTutorial)));
}
