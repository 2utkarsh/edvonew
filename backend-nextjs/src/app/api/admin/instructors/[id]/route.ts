import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson } from '@/lib/http';
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await InstructorModel.findById(id)
      .populate('userId', 'name email mobile role isActive bio headline skills photo avatar')
      .lean();
    if (!item) return fail('Instructor not found', 404);
    return ok(serializeInstructor(item));
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
    const expertise = Array.isArray(body.expertise)
      ? body.expertise
      : Array.isArray(body.skills)
        ? body.skills
        : undefined;
    const certifications = Array.isArray(body.certifications) ? body.certifications : undefined;
    const socialLinks = body.socialLinks && typeof body.socialLinks === 'object' ? body.socialLinks : undefined;

    const update: Record<string, unknown> = {
      bio: body.bio !== undefined ? String(body.bio || '') : undefined,
      headline: body.headline !== undefined ? String(body.headline || '') : undefined,
      expertise: expertise ? expertise.map((entry) => String(entry).trim()).filter(Boolean) : undefined,
      experience: body.experience !== undefined ? String(body.experience || '') : undefined,
      education: body.education !== undefined ? String(body.education || '') : undefined,
      certifications: certifications ? certifications.map((entry) => String(entry).trim()).filter(Boolean) : undefined,
      socialLinks: socialLinks
        ? {
            linkedin: String((socialLinks as Record<string, unknown>).linkedin || ''),
            twitter: String((socialLinks as Record<string, unknown>).twitter || ''),
            github: String((socialLinks as Record<string, unknown>).github || ''),
            website: String((socialLinks as Record<string, unknown>).website || ''),
          }
        : undefined,
      isVerified: typeof body.isVerified === 'boolean' ? body.isVerified : undefined,
      isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined,
    };
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const item = await InstructorModel.findByIdAndUpdate(id, update, { new: true })
      .populate('userId', 'name email mobile role isActive bio headline skills photo avatar');
    if (!item) return fail('Instructor not found', 404);

    if (item.userId) {
      await UserModel.findByIdAndUpdate(item.userId, {
        role: 'instructor',
        bio: item.bio,
        headline: item.headline,
        skills: item.expertise,
      });
    }

    return ok(serializeInstructor(item.toObject ? item.toObject() : item));
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
    const item = await InstructorModel.findByIdAndDelete(id).lean();
    if (!item) return fail('Instructor not found', 404);
    if (item.userId) {
      await UserModel.findByIdAndUpdate(item.userId, {
        $unset: { instructorId: 1 },
        role: 'student',
      });
    }
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
