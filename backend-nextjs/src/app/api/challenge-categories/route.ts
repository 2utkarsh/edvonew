import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { ChallengeCategoryModel } from '@/models/ChallengeItem';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const items = await ChallengeCategoryModel.find({ isActive: true }).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
