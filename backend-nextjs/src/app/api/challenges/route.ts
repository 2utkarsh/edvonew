import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { ChallengeItemModel } from '@/models/ChallengeItem';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const category = searchParams.get('category');
    const query: Record<string, unknown> = { visibility: 'active' };
    if (phase && ['ongoing', 'completed'].includes(phase)) query.phase = phase;
    if (category) query.category = category;

    const items = await ChallengeItemModel.find(query).sort({ phase: 1, order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map(mapChallengeDocumentToPublicChallenge)));
  } catch (error) {
    return handleError(error);
  }
}
