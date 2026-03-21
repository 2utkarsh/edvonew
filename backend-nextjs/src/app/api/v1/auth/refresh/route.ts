import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthPayload, signAccessToken } from '@/lib/auth';
import { fail, unauthorized } from '@/lib/http';
import { UserModel } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get current auth payload
    const payload = await getAuthPayload();
    if (!payload) {
      return unauthorized('Invalid or expired token');
    }

    // Verify user still exists and is active
    const user = await UserModel.findById(payload.sub);
    if (!user || !user.isActive) {
      return unauthorized('User not found or deactivated');
    }

    // Generate new token
    const newToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return success(
      {
        token: newToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      'Token refreshed successfully'
    );
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return fail(
      error.message || 'Token refresh failed',
      'REFRESH_FAILED',
      undefined,
      500
    );
  }
}
