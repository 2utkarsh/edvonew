import { connectToDatabase } from '@/lib/db';
import { fail, ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { getMockBlogBySlugOrId, mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;

  try {
    await connectToDatabase();
    const item = await BlogModel.findOne({ slug, status: 'published' }).populate('author', 'name').lean();
    if (item) {
      return toResponse(ok(mapBlogDocumentToPublicBlog(item)));
    }
  } catch (error) {
    console.warn('Falling back to mock single blog data:', error);
  }

  const item = getMockBlogBySlugOrId(slug);
  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}
