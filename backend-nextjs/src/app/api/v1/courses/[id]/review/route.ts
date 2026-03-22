import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { ReviewModel } from '@/models/Review';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: courseId } = await params;

    const body = await request.json();
    const { rating, comment } = body;

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return notFound('Course');
    }

    const existingReview = await ReviewModel.findOne({
      courseId,
      userId,
    });

    if (existingReview) {
      return fail('You have already reviewed this course', 'REVIEW_EXISTS', undefined, 409);
    }

    const currentCount = await ReviewModel.countDocuments();

    const review = await ReviewModel.create({
      courseId,
      userId,
      rating,
      comment: comment || '',
      order: currentCount + 1,
    });

    const stats = await ReviewModel.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: '$courseId',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await CourseModel.findByIdAndUpdate(courseId, {
        rating: stats[0].avgRating,
        reviewCount: stats[0].reviewCount,
      });
    }

    return success(
      {
        review: {
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment,
        },
      },
      'Review added successfully',
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add review error:', error);
    return fail(
      error.message || 'Failed to add review',
      'ADD_REVIEW_FAILED',
      undefined,
      500
    );
  }
}
