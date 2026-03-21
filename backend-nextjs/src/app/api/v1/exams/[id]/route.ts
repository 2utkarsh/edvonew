import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound, forbidden } from '@/lib/http';
import { ExamModel } from '@/models/Exam';
import { ExamAttemptModel } from '@/models/ExamAttempt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single exam by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const exam = await ExamModel.findOne({ _id: id })
      .populate('instructorId', 'name email avatar bio')
      .lean();

    if (!exam) {
      return notFound('Exam');
    }

    // Hide questions for published exams (show only when attempting)
    const examData = { ...exam.toObject() };
    if (exam.status === 'published') {
      examData.questions = exam.questions.map((q: any) => ({
        _id: q._id,
        question: q.question,
        type: q.type,
        options: q.type === 'true-false' ? ['True', 'False'] : q.options,
        marks: q.marks,
      }));
    }

    return success(
      {
        exam: {
          ...examData,
          id: exam._id.toString(),
        },
      },
      'Exam retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get exam error:', error);
    return fail(
      error.message || 'Failed to fetch exam',
      'FETCH_EXAM_FAILED',
      undefined,
      500
    );
  }
}
