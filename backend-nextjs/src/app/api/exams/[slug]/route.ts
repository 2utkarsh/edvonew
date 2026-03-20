import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok } from '@/lib/http';
import { ExamModel } from '@/models/Exam';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const item = await ExamModel.findOne({ slug }).lean();
    if (!item) return fail('Exam not found', 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

