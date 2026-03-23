import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { CertificateModel } from '@/models/Certificate';

export async function GET() {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const certificates = await CertificateModel.find({ userId }).sort({ issuedAt: -1 }).lean();

    return toResponse(success({
      certificates: certificates.map((certificate: any) => ({
        ...certificate,
        id: String(certificate._id),
      })),
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch certificates', 'FETCH_CERTIFICATES_FAILED', undefined, 500));
  }
}
