import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { ExamModel } from '@/models/Exam';
import { ExamAttemptModel } from '@/models/ExamAttempt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST submit exam attempt
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: examId } = await params;

    const body = await request.json();
    const { answers } = body;

    // Find exam
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      return notFound('Exam');
    }

    if (exam.status !== 'published') {
      return fail('Exam is not available for attempts', 'EXAM_NOT_AVAILABLE', undefined, 400);
    }

    // Check attempt limit
    const existingAttempts = await ExamAttemptModel.countDocuments({
      userId,
      examId,
    });

    if (existingAttempts >= exam.attempts) {
      return fail('Maximum attempt limit reached', 'ATTEMPT_LIMIT_REACHED', undefined, 400);
    }

    // Calculate score
    let obtainedMarks = 0;
    const questionResults = answers.map((answer: any) => {
      const question = exam.questions.id(answer.questionId);
      if (!question) return null;

      const isCorrect = question.correctAnswer === answer.answer;
      if (isCorrect) {
        obtainedMarks += question.marks;
      }

      return {
        questionId: answer.questionId,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
      };
    }).filter(Boolean);

    const percentage = (obtainedMarks / exam.totalMarks) * 100;
    const passed = percentage >= (exam.passingMarks / exam.totalMarks) * 100;

    // Create attempt record
    const attempt = await ExamAttemptModel.create({
      examId,
      userId,
      answers: questionResults,
      obtainedMarks,
      totalMarks: exam.totalMarks,
      percentage,
      passed,
      status: 'completed',
    });

    // Update exam attempt count
    await ExamModel.findByIdAndUpdate(examId, {
      $inc: { attemptCount: 1 },
    });

    return success(
      {
        attempt: {
          id: attempt._id.toString(),
          obtainedMarks,
          totalMarks: exam.totalMarks,
          percentage,
          passed,
          showResults: exam.showResults,
        },
      },
      'Exam submitted successfully'
    );
  } catch (error: any) {
    console.error('Submit exam error:', error);
    return fail(
      error.message || 'Failed to submit exam',
      'SUBMIT_EXAM_FAILED',
      undefined,
      500
    );
  }
}
