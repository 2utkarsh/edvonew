import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, ok, parseJson } from '@/lib/http';
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

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    return ok(users.map(serializeUser));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);

    if (!body.name || !body.email || !body.role) {
      return fail('Name, email, and role are required', 422);
    }

    const { hashPassword } = await import('@/lib/auth');
    const password = typeof body.password === 'string' && body.password.length >= 6 ? body.password : 'Admin@123';
    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
      name: body.name,
      email: String(body.email).toLowerCase(),
      role: body.role,
      status: typeof body.status === 'number' ? body.status : 1,
      isActive: body.isActive !== false,
      mobile: body.mobile,
      photo: body.photo,
      avatar: body.avatar,
      googleId: body.googleId,
      socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : [],
      instructorId: body.instructorId,
      bio: body.bio,
      headline: body.headline,
      skills: Array.isArray(body.skills) ? body.skills : [],
      passwordHash,
    });

    return created(serializeUser(user.toObject()));
  } catch (error) {
    return handleError(error);
  }
}
