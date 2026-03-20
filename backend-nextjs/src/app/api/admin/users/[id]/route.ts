import { hashPassword, requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson } from '@/lib/http';
import { UserModel } from '@/models/User';

function serializeUser(user: any) {
  if (!user) return null;
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isActive: user.isActive !== false,
    mobile: user.mobile,
    photo: user.photo,
    avatar: user.avatar,
    googleId: user.googleId,
    socialLinks: user.socialLinks || [],
    instructorId: user.instructorId,
    bio: user.bio,
    headline: user.headline,
    skills: user.skills || [],
    enrolledCourses: user.enrolledCourses || [],
    enrolledExams: user.enrolledExams || [],
    createdCourses: user.createdCourses || [],
    createdExams: user.createdExams || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const user = await UserModel.findById(id).lean();
    if (!user) return fail('User not found', 404);
    return ok(serializeUser(user));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const body = await parseJson<Record<string, unknown>>(request);
    const update: Record<string, unknown> = {
      name: body.name,
      email: body.email ? String(body.email).toLowerCase() : undefined,
      role: body.role,
      status: typeof body.status === 'number' ? body.status : undefined,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      mobile: body.mobile,
      photo: body.photo,
      avatar: body.avatar,
      googleId: body.googleId,
      socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : undefined,
      instructorId: body.instructorId,
      bio: body.bio,
      headline: body.headline,
      skills: Array.isArray(body.skills) ? body.skills : undefined,
    };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    if (typeof body.password === 'string' && body.password.length >= 6) {
      update.passwordHash = await hashPassword(body.password);
    }

    const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!user) return fail('User not found', 404);
    return ok(serializeUser(user));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const user = await UserModel.findByIdAndDelete(id).lean();
    if (!user) return fail('User not found', 404);
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
