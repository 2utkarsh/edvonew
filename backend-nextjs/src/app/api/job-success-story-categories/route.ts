import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { SuccessStoryCategoryModel } from '@/models/SuccessStory';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const items = await SuccessStoryCategoryModel.find({ isActive: true }).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
