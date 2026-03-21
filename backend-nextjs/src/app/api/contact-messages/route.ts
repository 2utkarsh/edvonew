import { connectToDatabase } from '@/lib/db';
import { created, handleError, parseJson, toResponse } from '@/lib/http';
import { ContactMessageModel } from '@/models/ContactMessage';

export async function POST(request: Request): Promise<Response> {
  try {
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);
    const item = await ContactMessageModel.create({
      name: String(body.name || ''),
      email: String(body.email || ''),
      phone: body.phone,
      subject: body.subject,
      message: String(body.message || ''),
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    });
    return toResponse(created(item));
  } catch (error) {
    return handleError(error);
  }
}
