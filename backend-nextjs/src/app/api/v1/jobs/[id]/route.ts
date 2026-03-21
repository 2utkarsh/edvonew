import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail, notFound } from '@/lib/http';
import { JobModel } from '@/models/Job';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single job by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const job = await JobModel.findOne({ _id: id })
      .populate('postedBy', 'name email company')
      .lean();

    if (!job) {
      return notFound('Job');
    }

    // Increment views
    await JobModel.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });

    return success(
      {
        job: {
          ...job.toObject(),
          id: job._id.toString(),
        },
      },
      'Job retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get job error:', error);
    return fail(
      error.message || 'Failed to fetch job',
      'FETCH_JOB_FAILED',
      undefined,
      500
    );
  }
}
