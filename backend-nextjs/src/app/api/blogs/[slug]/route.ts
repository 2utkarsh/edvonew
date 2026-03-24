import { getFallbackBlogBySlugOrId } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { fail, ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;

  if (!hasConfiguredMongoUri()) {
    const fallbackItem = getFallbackBlogBySlugOrId(slug);
    if (!fallbackItem) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok(fallbackItem));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const item = await BlogModel.findOne({ slug, status: 'published' })
    .populate('author', 'name')
    .lean();

  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapBlogDocumentToPublicBlog(item)));
}
