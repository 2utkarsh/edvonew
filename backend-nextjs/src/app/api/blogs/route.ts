import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';
import { mapBlogDocumentToPublicBlog, MOCK_BLOGS } from '@/lib/blog-data';

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();
    const items = await BlogModel.find({ status: 'published' }).populate('author', 'name').sort({ updatedAt: -1 }).lean();
    if (items.length > 0) {
      return toResponse(ok(items.map(mapBlogDocumentToPublicBlog)));
    }
  } catch (error) {
    console.warn('Falling back to mock blog data:', error);
  }

  return toResponse(ok(MOCK_BLOGS));
}
