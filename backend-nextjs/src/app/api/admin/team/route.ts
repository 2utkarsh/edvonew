import { connectToDatabase } from '@/lib/db';
import { created, ok, parseJson, toResponse } from '@/lib/http';
import { TeamMemberModel } from '@/models/TeamMember';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { mapTeamMemberToPublicTeamMember } from '@/lib/team-data';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await TeamMemberModel.find().sort({ updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapTeamMemberToPublicTeamMember)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const name = String(body.name || 'New Team Member');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const item = await TeamMemberModel.create({
    name,
    slug,
    title: String(body.title || 'Mentor, EDVO'),
    bio: String(body.bio || 'Experienced mentor guiding learners with practical, industry-focused knowledge.'),
    image: String(body.image || '/images/edvo-official-logo-v10.png'),
    status: body.status === 'inactive' ? 'inactive' : 'active',
  });

  return toResponse(created(mapTeamMemberToPublicTeamMember(item)));
}
