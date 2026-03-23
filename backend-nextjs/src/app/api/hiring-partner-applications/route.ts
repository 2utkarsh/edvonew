import { connectToDatabase } from '@/lib/db';
import { created, fail, handleError, parseJson, toResponse } from '@/lib/http';
import { HiringPartnerApplicationModel } from '@/models/HiringPartnerApplication';

export async function POST(request: Request): Promise<Response> {
  try {
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);
    const companyName = String(body.companyName || '').trim();
    const contactName = String(body.contactName || '').trim();
    const workEmail = String(body.workEmail || '').trim();

    if (!companyName || !contactName || !workEmail) {
      return toResponse(fail('Company name, contact name, and work email are required', 'VALIDATION_ERROR', undefined, 400));
    }

    const item = await HiringPartnerApplicationModel.create({
      companyName,
      contactName,
      workEmail,
      phone: String(body.phone || '').trim() || undefined,
      website: String(body.website || '').trim() || undefined,
      hiringNeeds: String(body.hiringNeeds || '').trim() || undefined,
      roles: String(body.roles || '').trim() || undefined,
      companySize: String(body.companySize || '').trim() || undefined,
      message: String(body.message || '').trim() || undefined,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
    });

    return toResponse(created(item));
  } catch (error) {
    return handleError(error);
  }
}
