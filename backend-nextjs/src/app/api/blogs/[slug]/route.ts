import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const item = await BlogModel.findOne({ slug }).lean();
    if (!item) return toResponse(fail('Blog not found', 404));
    return toResponse(ok(item));
  } catch (error) {
    return handleError(error);
  }
}
