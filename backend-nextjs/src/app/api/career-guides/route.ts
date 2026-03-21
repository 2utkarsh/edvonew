import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { ResourceItemModel } from '@/models/ResourceItem';
import { mapResourceDocumentToGuide } from '@/lib/resource-data';

export async function GET() {
  await connectToDatabase();
  await ensureSeededContent();

  const items = await ResourceItemModel.find({ type: 'guide', status: 'published' }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapResourceDocumentToGuide)));
}
