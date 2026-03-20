import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await InstructorModel.find({ status: { $ne: 'rejected' } }).sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
