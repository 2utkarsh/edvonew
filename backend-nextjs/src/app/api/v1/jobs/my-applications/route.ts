import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { JobApplicationModel } from '@/models/JobApplication';

// GET user's job applications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const applications = await JobApplicationModel.find({ userId })
      .populate('jobId', 'title company location type mode salary')
      .sort({ createdAt: -1 })
      .lean();

    return success(
      {
        applications: applications.map((a: any) => ({
          ...a.toObject(),
          id: a._id.toString(),
        })),
      },
      'Applications retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get applications error:', error);
    return fail(
      error.message || 'Failed to fetch applications',
      'FETCH_APPLICATIONS_FAILED',
      undefined,
      500
    );
  }
}
