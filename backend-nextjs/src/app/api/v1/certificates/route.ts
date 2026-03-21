import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { CertificateModel } from '@/models/Certificate';

// GET user certificates
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const certificates = await CertificateModel.find({ userId })
      .sort({ issuedAt: -1 })
      .lean();

    return success(
      {
        certificates: certificates.map((c: any) => ({
          ...c.toObject(),
          id: c._id.toString(),
        })),
      },
      'Certificates retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get certificates error:', error);
    return fail(
      error.message || 'Failed to fetch certificates',
      'FETCH_CERTIFICATES_FAILED',
      undefined,
      500
    );
  }
}
