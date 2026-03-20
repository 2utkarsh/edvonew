import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { FooterModel } from '@/models/Footer';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await FooterModel.find({ active: true }).sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
