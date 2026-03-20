import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { buildSearchRegex, getPagination } from '@/lib/query';
import { ExamModel } from '@/models/Exam';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const query: Record<string, unknown> = { status: 'published' };

    const search = buildSearchRegex(searchParams.get('search'));
    if (search) query.$or = [{ title: search }, { description: search }, { category: search }];

    const category = searchParams.get('category');
    if (category) query.category = category;

    const level = searchParams.get('level');
    if (level) query.level = level;

    const [items, total] = await Promise.all([
      ExamModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ExamModel.countDocuments(query),
    ]);

    return ok({
      data: items.map((item) => ({
        id: String(item._id),
        title: item.title,
        slug: item.slug,
        short_description: item.shortDescription,
        description: item.description,
        category: item.category,
        level: item.level,
        pricing_type: item.pricingType,
        price: item.price,
        thumbnail: item.thumbnail,
        banner: item.banner,
        review_count: item.reviewCount,
        average_rating: item.averageRating,
        enrollments_count: item.enrollmentsCount,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleError(error);
  }
}

