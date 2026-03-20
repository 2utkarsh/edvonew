import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { InstructorModel } from '@/models/Instructor';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await InstructorModel.find().sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);
    const item = await InstructorModel.create({
      userId: body.userId,
      skills: Array.isArray(body.skills) ? body.skills : [],
      biography: String(body.biography || ''),
      resume: body.resume,
      status: body.status || 'pending',
      designation: body.designation,
      payoutMethods: Array.isArray(body.payoutMethods) ? body.payoutMethods : undefined,
    });
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}
