import { getFallbackChallengeBySlug } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { ok, toResponse, fail } from '@/lib/http';
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
  let slug = '';
  try {
    ({ slug } = await params);

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
    console.error('Falling back to built-in challenge', error);
    const fallbackItem = getFallbackChallengeBySlug(String(slug || ''));
    if (!fallbackItem) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok(fallbackItem));
  }
}
