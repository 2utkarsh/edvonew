import { buildAdminReportCsv, buildAdminReportFallbackPayload, buildAdminReportPayload, type AdminReportScope } from '@/lib/admin-reporting';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { PaymentModel } from '@/models/Payment';
import { UserModel } from '@/models/User';

function normalizeScope(value: string | null): AdminReportScope {
  if (value === 'courses' || value === 'payments') return value;
  return 'enrollments';
}

export async function GET(request: Request) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    const url = new URL(request.url);
    const format = String(url.searchParams.get('format') || 'json').toLowerCase();
    const scope = normalizeScope(url.searchParams.get('scope'));

    const payload = hasConfiguredMongoUri()
      ? await (async () => {
          await connectToDatabase();

          const [students, courses, enrollments, payments] = await Promise.all([
            UserModel.find({ role: 'student' }).select('name email mobile isActive createdAt').lean(),
            CourseModel.find().sort({ updatedAt: -1 }).lean(),
            EnrollmentModel.find().populate('userId', 'name email mobile').sort({ createdAt: -1 }).lean(),
            PaymentModel.find({ purpose: 'course' }).populate('userId', 'name email mobile').sort({ createdAt: -1 }).lean(),
          ]);

          return buildAdminReportPayload({ students, courses, enrollments, payments });
        })()
      : buildAdminReportFallbackPayload();

    if (format === 'csv') {
      const csv = buildAdminReportCsv(payload, scope);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="edvo-${scope}-report.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return toResponse(ok(payload));
  } catch (error) {
    console.error('Falling back to built-in admin reports', error);
    const payload = buildAdminReportFallbackPayload();

    return toResponse(ok(payload));
  }
}
