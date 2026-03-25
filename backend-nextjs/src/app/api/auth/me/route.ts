import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { UserModel } from '@/models/User';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;

    await connectToDatabase();
    const user = await UserModel.findById(auth.payload.sub).lean();

    if (!user) {
      return ok({
        id: auth.payload.sub,
        name: auth.payload.name,
        email: auth.payload.email,
        role: auth.payload.role,
        avatar: null,
        bio: null,
        mobile: null,
        createdAt: null,
        updatedAt: null,
      });
    }

    return ok({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      mobile: user.mobile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}
