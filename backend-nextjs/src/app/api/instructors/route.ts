import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';

function serializePublicInstructor(item: any) {
  const user = item?.userId && typeof item.userId === 'object' ? item.userId : null;

  return {
    id: String(item?._id || item?.id || user?._id || ''),
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
  if (!hasConfiguredMongoUri()) {
    return toResponse(ok([]));
  }

  await connectToDatabase();

  const items = await InstructorModel.find()
    .populate('userId', 'name headline bio photo avatar role isActive')
    .sort({ isFeatured: -1, updatedAt: -1 })
    .lean();

  const activeItems = items.filter((item: any) => {
    const user = item?.userId && typeof item.userId === 'object' ? item.userId : null;
    return user && user.role === 'instructor' && user.isActive !== false;
  });

  return toResponse(ok(activeItems.map(serializePublicInstructor)));
}
