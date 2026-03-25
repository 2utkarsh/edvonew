import { getBlogCategoryFilterQuery } from '@/lib/blog-categories';
import { getFallbackPublicBlogs } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackPublicBlogs(category)));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const query = {
    status: 'published',
    ...(category ? getBlogCategoryFilterQuery(category) : {}),
  };

  const items = await BlogModel.find(query)
    .populate('author', 'name')
    .sort({ order: 1, updatedAt: -1 })
    .lean();

  return toResponse(ok(items.map(mapBlogDocumentToPublicBlog)));
}
