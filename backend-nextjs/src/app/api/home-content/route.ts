import { connectToDatabase } from '@/lib/db';
import { ensureHomeContent } from '@/lib/home-content-store';
import { handleError, ok, toResponse } from '@/lib/http';
import { HomeContentModel } from '@/models/HomeContent';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureHomeContent();
    const item = await HomeContentModel.findOne({ key: 'home' }).lean();
    return toResponse(ok(item || {}));
  } catch (error) {
    return handleError(error);
  }
}
