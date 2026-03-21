import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { JobModel } from '@/models/Job';
import { paginationSchema, createJobSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';
import { buildPagination } from '@/lib/pagination';

// GET all jobs with pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = paginationSchema.safeParse(queryParams);
    if (!validation.success) {
      return fail('Invalid query parameters', 'INVALID_QUERY', undefined, 400);
    }

    const { page, limit, search, sort, order } = validation.data;

    const filterQuery: any = { status: 'active' };

    // Add application deadline filter
    filterQuery.$or = [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gte: new Date() } },
    ];

    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requirements: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await JobModel.countDocuments(filterQuery);

    const jobs = await JobModel.find(filterQuery)
      .sort({ [sort || 'createdAt']: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('postedBy', 'name email')
      .lean();

    const meta = buildPagination({ page, limit }, total);

    return success(
      { jobs },
      'Jobs retrieved successfully',
      meta
    );
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return fail(
      error.message || 'Failed to fetch jobs',
      'FETCH_JOBS_FAILED',
      undefined,
      500
    );
  }
}

// POST create new job (instructor/admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor', 'admin']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const validation = await validateRequest(request, createJobSchema);
    if (validation.error) return validation.error;
    if (!validation.data) return fail('Request body is required', 'INVALID_REQUEST', undefined, 400);

    const jobData = validation.data;

    // Generate slug
    const slug = jobData.slug || jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingJob = await JobModel.findOne({ slug });
    if (existingJob) {
      return fail('A job with this slug already exists', 'SLUG_EXISTS', undefined, 409);
    }

    const job = await JobModel.create({
      ...jobData,
      slug,
      postedBy: userId,
      status: 'active',
      applicationCount: 0,
      views: 0,
    });

    return success(
      {
        job: {
          ...job.toObject(),
          id: job._id.toString(),
        },
      },
      'Job created successfully',
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create job error:', error);
    return fail(
      error.message || 'Failed to create job',
      'CREATE_JOB_FAILED',
      undefined,
      500
    );
  }
}
