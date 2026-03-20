import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { NavbarModel } from '@/models/Navbar';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await NavbarModel.find({ active: true }).sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
