import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { ReviewModel } from '@/models/Review';

export async function GET() {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const rows = await ReviewModel.aggregate([
      { $match: { isApproved: true } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.category',
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const items = rows
      .map((row: any) => ({ id: String(row._id || ''), label: String(row._id || ''), total: Number(row.total || 0) }))
      .filter((row) => row.label);

    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
