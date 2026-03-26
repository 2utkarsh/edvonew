import { getFallbackBlogBySlugOrId } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { fail, ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

const BLOG_DETAIL_SELECT = 'slug title excerpt featuredImage category categories author readTime publishedAt createdAt updatedAt content';
const PUBLIC_BLOG_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
};

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;

  if (!hasConfiguredMongoUri()) {
    const fallbackItem = getFallbackBlogBySlugOrId(slug);
    if (!fallbackItem) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok(fallbackItem), { headers: PUBLIC_BLOG_HEADERS });
  }

  await connectToDatabase();
  await ensureSeededContent();

  const item = await BlogModel.findOne({ slug, status: 'published' }, BLOG_DETAIL_SELECT)
    .populate('author', 'name')
    .lean();

  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapBlogDocumentToPublicBlog(item)), { headers: PUBLIC_BLOG_HEADERS });
}