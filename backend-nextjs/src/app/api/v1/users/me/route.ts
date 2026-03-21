import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthPayload } from '@/lib/auth';
import { success, fail, notFound, forbidden } from '@/lib/http';
import { UserModel } from '@/models/User';

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await getAuthPayload();
    if (!authResult) {
      return fail('Unauthorized', 'UNAUTHORIZED', undefined, 401);
    }

    const user = await UserModel.findById(authResult.sub)
      .select('-passwordHash')
      .lean();

    if (!user) {
      return notFound('User');
    }

    return success(
      {
        user: {
          ...user.toObject(),
          id: user._id.toString(),
        },
      },
      'Profile retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get current user error:', error);
    return fail(
      error.message || 'Failed to fetch profile',
      'FETCH_PROFILE_FAILED',
      undefined,
      500
    );
  }
}
