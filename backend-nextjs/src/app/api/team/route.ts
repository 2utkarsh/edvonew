import { getFallbackTeamMembers } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { TeamMemberModel } from '@/models/TeamMember';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapTeamMemberToPublicTeamMember } from '@/lib/team-data';

export async function GET() {
  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackTeamMembers().filter((item) => item.status === 'active')));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const items = await TeamMemberModel.find({ status: 'active' }).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapTeamMemberToPublicTeamMember)));
}
