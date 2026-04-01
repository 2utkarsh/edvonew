import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, ok, parseJson } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';
import { UserModel } from '@/models/User';

function serializeInstructor(item: any) {
  if (!item) return null;
  const user = item.userId && typeof item.userId === 'object' ? item.userId : null;
  return {
    id: String(item._id || item.id),
    userId: user?._id ? String(user._id) : String(item.userId || ''),
    bio: item.bio || '',
    headline: item.headline || '',
    expertise: Array.isArray(item.expertise) ? item.expertise : [],
    experience: item.experience || '',
    education: item.education || '',
    certifications: Array.isArray(item.certifications) ? item.certifications : [],
    socialLinks: item.socialLinks || {},
    totalStudents: Number(item.totalStudents || 0),
    totalCourses: Number(item.totalCourses || 0),
    averageRating: Number(item.averageRating || 0),
    totalReviews: Number(item.totalReviews || 0),
    isVerified: item.isVerified === true,
    isFeatured: item.isFeatured === true,
    joinDate: item.joinDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    user: user
      ? {
          id: String(user._id),
          name: user.name || '',
          email: user.email || '',
          mobile: user.mobile || '',
          role: user.role || 'instructor',
          isActive: user.isActive !== false,
          bio: user.bio || '',
          headline: user.headline || '',
          skills: Array.isArray(user.skills) ? user.skills : [],
          photo: user.photo || '',
          avatar: user.avatar || '',
        }
      : null,
  };
}

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await InstructorModel.find()
      .populate('userId', 'name email mobile role isActive bio headline skills photo avatar')
      .sort({ updatedAt: -1 })
      .lean();
    return ok(items.map(serializeInstructor));
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

    const userId = String(body.userId || '').trim();
    if (!userId) {
      return fail('User is required', 422);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return fail('Instructor user not found', 404);
    }

    const existingInstructor = await InstructorModel.findOne({ userId }).lean();
    if (existingInstructor) {
      return fail('Instructor profile already exists for this user', 409);
    }

    const expertise = Array.isArray(body.expertise)
      ? body.expertise
      : Array.isArray(body.skills)
        ? body.skills
        : [];
    const certifications = Array.isArray(body.certifications) ? body.certifications : [];
    const socialLinks = body.socialLinks && typeof body.socialLinks === 'object' ? body.socialLinks : {};

    const item = await InstructorModel.create({
      userId,
      bio: String(body.bio || body.biography || user.bio || ''),
      headline: String(body.headline || user.headline || ''),
      expertise: expertise.map((entry) => String(entry).trim()).filter(Boolean),
      experience: String(body.experience || ''),
      education: String(body.education || ''),
      certifications: certifications.map((entry) => String(entry).trim()).filter(Boolean),
      socialLinks: {
        linkedin: String((socialLinks as Record<string, unknown>).linkedin || ''),
        twitter: String((socialLinks as Record<string, unknown>).twitter || ''),
        github: String((socialLinks as Record<string, unknown>).github || ''),
        website: String((socialLinks as Record<string, unknown>).website || ''),
      },
      isVerified: body.isVerified === true,
      isFeatured: body.isFeatured === true,
    });

    user.role = 'instructor';
    user.instructorId = item._id;
    user.bio = String(body.bio || body.biography || user.bio || '');
    user.headline = String(body.headline || user.headline || '');
    user.skills = expertise.map((entry) => String(entry).trim()).filter(Boolean);
    await user.save();

    const populated = await InstructorModel.findById(item._id)
      .populate('userId', 'name email mobile role isActive bio headline skills photo avatar')
      .lean();

    return created(serializeInstructor(populated));
  } catch (error) {
    return handleError(error);
  }
}
