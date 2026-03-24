import { getFallbackChallengeCategories } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { ChallengeCategoryModel } from '@/models/ChallengeItem';

export async function GET() {
  try {
    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getFallbackChallengeCategories()));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const items = await ChallengeCategoryModel.find({ isActive: true }).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
