import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { ExamModel } from '@/models/Exam';
import { ExamAttemptModel } from '@/models/ExamAttempt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET exam attempt results
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: examId } = await params;

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('attemptId');

    if (attemptId) {
      // Get specific attempt
      const attempt = await ExamAttemptModel.findOne({
        _id: attemptId,
        userId,
        examId,
      }).lean();

      if (!attempt) {
        return notFound('Attempt');
      }

      const exam = await ExamModel.findById(examId);

      return success(
        {
          attempt: {
            ...attempt.toObject(),
            id: attempt._id.toString(),
            showResults: exam?.showResults,
          },
        },
        'Attempt results retrieved successfully'
      );
    } else {
      // Get all attempts for this exam
      const attempts = await ExamAttemptModel.find({ userId, examId })
        .sort({ createdAt: -1 })
        .lean();

      return success(
        {
          attempts: attempts.map((a: any) => ({
            ...a.toObject(),
            id: a._id.toString(),
          })),
        },
        'Attempt history retrieved successfully'
      );
    }
  } catch (error: any) {
    console.error('Get exam results error:', error);
    return fail(
      error.message || 'Failed to fetch exam results',
      'FETCH_RESULTS_FAILED',
      undefined,
      500
    );
  }
}
