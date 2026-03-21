import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { JobModel } from '@/models/Job';
import { JobApplicationModel } from '@/models/JobApplication';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST apply to job
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: jobId } = await params;

    const body = await request.json();
    const { coverLetter, resumeUrl } = body;

    // Verify job exists
    const job = await JobModel.findById(jobId);
    if (!job) {
      return notFound('Job');
    }

    if (job.status !== 'active') {
      return fail('Job is no longer accepting applications', 'JOB_NOT_ACTIVE', undefined, 400);
    }

    // Check if already applied
    const existingApplication = await JobApplicationModel.findOne({
      userId,
      jobId,
    });

    if (existingApplication) {
      return fail('You have already applied to this job', 'ALREADY_APPLIED', undefined, 409);
    }

    // Create application
    const application = await JobApplicationModel.create({
      jobId,
      userId,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'pending',
    });

    // Increment application count
    await JobModel.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 },
    });

    return success(
      {
        application: {
          id: application._id.toString(),
          status: application.status,
          submittedAt: application.createdAt,
        },
      },
      'Application submitted successfully',
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Apply job error:', error);
    return fail(
      error.message || 'Failed to apply to job',
      'APPLY_JOB_FAILED',
      undefined,
      500
    );
  }
}
