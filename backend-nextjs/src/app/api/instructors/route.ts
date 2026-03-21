import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { TeamMemberModel } from '@/models/TeamMember';
import { ensureSeededContent } from '@/lib/content-seeder';
import { mapTeamMemberToPublicTeamMember } from '@/lib/team-data';

export async function GET() {
  await connectToDatabase();
  await ensureSeededContent();

  const items = await TeamMemberModel.find({ status: 'active' }).sort({ updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapTeamMemberToPublicTeamMember)));
}
