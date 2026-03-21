import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';
import { mapInstructorToTeamMember, MOCK_TEAM_MEMBERS } from '@/lib/team-data';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await InstructorModel.find().populate('userId', 'name photo').sort({ updatedAt: -1 }).lean();
    if (items.length > 0) {
      return toResponse(ok(items.map(mapInstructorToTeamMember)));
    }
  } catch (error) {
    console.warn('Falling back to mock team data:', error);
  }

  return toResponse(ok(MOCK_TEAM_MEMBERS));
}
