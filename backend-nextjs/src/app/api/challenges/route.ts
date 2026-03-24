import { getFallbackChallenges } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const category = searchParams.get('category');

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getFallbackChallenges(phase || undefined, category || undefined)));
    }

    await connectToDatabase();
    await ensureSeededContent();

    const query: Record<string, unknown> = { ...activeVisibilityFilter };
    if (phase && ['ongoing', 'completed'].includes(phase)) query.phase = phase;
    if (category) query.category = category;

    const items = await ChallengeItemModel.find(query).sort({ phase: 1, order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map(mapChallengeDocumentToPublicChallenge)));
  } catch (error) {
    return handleError(error);
  }
}
