import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { NotificationModel } from '@/models/Notification';

// POST mark notifications as read
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const body = await request.json();
    const { notificationIds } = body;

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await NotificationModel.updateMany(
        { _id: { $in: notificationIds }, userId },
        {
          $set: { isRead: true, readAt: new Date() },
        }
      );
    } else {
      // Mark all notifications as read
      await NotificationModel.updateMany(
        { userId, isRead: false },
        {
          $set: { isRead: true, readAt: new Date() },
        }
      );
    }

    return success(
      { message: 'Notifications marked as read' },
      'Notifications updated successfully'
    );
  } catch (error: any) {
    console.error('Mark notifications read error:', error);
    return fail(
      error.message || 'Failed to update notifications',
      'UPDATE_NOTIFICATIONS_FAILED',
      undefined,
      500
    );
  }
}
