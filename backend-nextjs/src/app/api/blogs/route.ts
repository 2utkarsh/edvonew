import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

export async function GET(): Promise<Response> {
  await connectToDatabase();
  await ensureSeededContent();

  const items = await BlogModel.find({ status: 'published' })
    .populate('author', 'name')
    .sort({ order: 1, updatedAt: -1 })
    .lean();

  return toResponse(ok(items.map(mapBlogDocumentToPublicBlog)));
}
