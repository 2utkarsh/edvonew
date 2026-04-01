import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';
import { UserModel } from '@/models/User';

function serializePublicInstructor(item: any, user: any) {
  return {
    id: String(item?._id || item?.id || user?._id || user?.id || ''),
    name: String(user?.name || 'EDVO Instructor'),
    title: String(item?.headline || user?.headline || 'Instructor, EDVO'),
    bio: String(item?.bio || user?.bio || 'Experienced instructor guiding learners with practical, industry-focused knowledge.'),
    image: String(user?.photo || user?.avatar || '/images/edvo-official-logo-v10.png'),
    expertise: Array.isArray(item?.expertise) ? item.expertise : [],
    isVerified: item?.isVerified === true,
    isFeatured: item?.isFeatured === true,
  };
}

export async function GET() {
  try {
    if (!hasConfiguredMongoUri()) {
      return toResponse(ok([]));
    }

    await connectToDatabase();

    const items = await InstructorModel.find()
      .sort({ isFeatured: -1, updatedAt: -1 })
      .lean();

    const userIds = items
      .map((item: any) => String(item?.userId || ''))
      .filter(Boolean);

    const users = await UserModel.find({
      _id: { $in: userIds },
      role: 'instructor',
      isActive: { $ne: false },
    })
      .select('name headline bio photo avatar role isActive instructorId')
      .lean();

    const usersById = new Map(users.map((user: any) => [String(user._id), user]));

    const joinedItems = items
      .map((item: any) => {
        const user = usersById.get(String(item?.userId || ''));
        return user ? serializePublicInstructor(item, user) : null;
      })
      .filter(Boolean);

    if (joinedItems.length) {
      return toResponse(ok(joinedItems));
    }

    const fallbackUsers = await UserModel.find({
      role: 'instructor',
      isActive: { $ne: false },
    })
      .select('name headline bio photo avatar')
      .sort({ updatedAt: -1 })
      .lean();

    return toResponse(
      ok(
        fallbackUsers.map((user: any) =>
          serializePublicInstructor(
            {
              _id: user?.instructorId || user?._id,
              headline: user?.headline,
              bio: user?.bio,
              expertise: user?.skills || [],
              isVerified: false,
              isFeatured: false,
            },
            user
          )
        )
      )
    );
  } catch (_error) {
    return toResponse(ok([]));
  }
}
