import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, forbidden } from '@/lib/http';
import { ExamModel } from '@/models/Exam';
import { createExamSchema, paginationSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';
import { buildPagination } from '@/lib/pagination';

// GET all exams with pagination
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

    const filterQuery: any = { status: 'published' };
    
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await ExamModel.countDocuments(filterQuery);

    const exams = await ExamModel.find(filterQuery)
      .sort({ [sort || 'createdAt']: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructorId', 'name email avatar')
      .lean();

    const meta = buildPagination({ page, limit }, total);

    return success(
      { exams },
      'Exams retrieved successfully',
      meta
    );
  } catch (error: any) {
    console.error('Get exams error:', error);
    return fail(
      error.message || 'Failed to fetch exams',
      'FETCH_EXAMS_FAILED',
      undefined,
      500
    );
  }
}

// POST create new exam (instructor/admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor', 'admin']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const validation = await validateRequest(request, createExamSchema);
    if (validation.error) return validation.error;
    if (!validation.data) return fail('Request body is required', 'INVALID_REQUEST', undefined, 400);

    const examData = validation.data;

    // Generate slug
    const slug = examData.slug || examData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingExam = await ExamModel.findOne({ slug });
    if (existingExam) {
      return fail('An exam with this slug already exists', 'SLUG_EXISTS', undefined, 409);
    }

    // Calculate total marks from questions
    const totalMarks = examData.questions.reduce((sum, q) => sum + q.marks, 0);

    const exam = await ExamModel.create({
      ...examData,
      slug,
      instructorId: userId,
      totalMarks,
      status: 'draft',
      rating: 0,
      attemptCount: 0,
    });

    return success(
      {
        exam: {
          ...exam.toObject(),
          id: exam._id.toString(),
        },
      },
      'Exam created successfully',
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create exam error:', error);
    return fail(
      error.message || 'Failed to create exam',
      'CREATE_EXAM_FAILED',
      undefined,
      500
    );
  }
}
