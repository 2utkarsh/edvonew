import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { NewsletterModel } from '@/models/Newsletter';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await NewsletterModel.find().sort({ createdAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
