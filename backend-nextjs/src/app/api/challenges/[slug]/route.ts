import { getFallbackChallengeBySlug } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse, fail } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { ChallengeItemModel } from '@/models/ChallengeItem';

const activeVisibilityFilter = {
  $or: [
    { visibility: 'active' },
    { visibility: { $exists: false } },
    { visibility: null },
    { visibility: '' },
  ],
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!hasConfiguredMongoUri()) {
      const fallbackItem = getFallbackChallengeBySlug(slug);
      if (!fallbackItem) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
      return toResponse(ok(fallbackItem));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const item = await ChallengeItemModel.findOne({ slug, ...activeVisibilityFilter }).lean();
    if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok(mapChallengeDocumentToPublicChallenge(item)));
  } catch (error) {
    return handleError(error);
  }
}
