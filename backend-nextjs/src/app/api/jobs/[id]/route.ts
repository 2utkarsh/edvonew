import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok } from '@/lib/http';
import { JobModel } from '@/models/Job';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await JobModel.findById(id).lean();
    if (!item) return fail('Job not found', 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

