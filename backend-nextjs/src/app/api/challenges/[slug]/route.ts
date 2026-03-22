import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { handleError, ok, toResponse, fail } from '@/lib/http';
import { mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { ChallengeItemModel } from '@/models/ChallengeItem';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { slug } = await params;
    const item = await ChallengeItemModel.findOne({ slug, visibility: 'active' }).lean();
    if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok(mapChallengeDocumentToPublicChallenge(item)));
  } catch (error) {
    return handleError(error);
  }
}
