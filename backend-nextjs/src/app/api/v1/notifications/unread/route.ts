import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { NotificationModel } from '@/models/Notification';

// GET unread notifications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const notifications = await NotificationModel.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return success(
      {
        notifications: notifications.map((n: any) => ({
          ...n.toObject(),
          id: n._id.toString(),
        })),
        count: notifications.length,
      },
      'Unread notifications retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get unread notifications error:', error);
    return fail(
      error.message || 'Failed to fetch unread notifications',
      'FETCH_NOTIFICATIONS_FAILED',
      undefined,
      500
    );
  }
}
