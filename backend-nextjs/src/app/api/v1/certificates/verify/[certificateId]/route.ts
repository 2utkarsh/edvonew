import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail, notFound } from '@/lib/http';
import { CertificateModel } from '@/models/Certificate';

interface RouteParams {
  params: Promise<{ certificateId: string }>;
}

// GET verify certificate by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { certificateId } = await params;

    const certificate = await CertificateModel.findOne({ certificateNumber: certificateId })
      .populate('userId', 'name email')
      .lean();

    if (!certificate) {
      return notFound('Certificate');
    }

    return success(
      {
        certificate: {
          certificateNumber: certificate.certificateNumber,
          recipientName: certificate.recipientName,
          courseName: certificate.courseName,
          instructorName: certificate.instructorName,
          issuedAt: certificate.issuedAt,
          grade: certificate.grade,
          score: certificate.score,
          verified: certificate.verified,
          credentialUrl: certificate.credentialUrl,
        },
        isValid: certificate.verified,
      },
      certificate.verified ? 'Certificate is valid' : 'Certificate verification pending'
    );
  } catch (error: any) {
    console.error('Verify certificate error:', error);
    return fail(
      error.message || 'Failed to verify certificate',
      'VERIFY_CERTIFICATE_FAILED',
      undefined,
      500
    );
  }
}
