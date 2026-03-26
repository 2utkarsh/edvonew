import { getBlogCategoryFilterQuery } from '@/lib/blog-categories';
import { getFallbackPublicBlogs } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

const BLOG_LIST_SELECT = 'slug title excerpt featuredImage category categories author readTime publishedAt createdAt updatedAt';
const PUBLIC_BLOG_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=600',
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackPublicBlogs(category)), { headers: PUBLIC_BLOG_HEADERS });
  }

  await connectToDatabase();
  await ensureSeededContent();

  const query = {
    status: 'published',
    ...(category ? getBlogCategoryFilterQuery(category) : {}),
  };

  const items = await BlogModel.find(query, BLOG_LIST_SELECT)
    .populate('author', 'name')
    .sort({ order: 1, updatedAt: -1 })
    .lean();

  return toResponse(ok(items.map(mapBlogDocumentToPublicBlog)), { headers: PUBLIC_BLOG_HEADERS });
}