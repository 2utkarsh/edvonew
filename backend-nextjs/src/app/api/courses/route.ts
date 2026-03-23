import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { buildSearchRegex, getPagination } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const query: Record<string, unknown> = { status: 'published' };

    const search = buildSearchRegex(searchParams.get('search'));
    if (search) {
      query.$or = [{ title: search }, { description: search }, { category: search }];
    }

    const level = searchParams.get('level');
    if (level) query.level = level;

    const category = searchParams.get('category');
    if (category) {
      const categoryDoc = await CourseCategoryModel.findOne({
        $or: [{ slug: category }, { name: category }],
      }).lean();
      query.category = categoryDoc?.name || category;
    }

    const sortParam = searchParams.get('sort') || 'popular';
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      popular: { studentsEnrolled: -1, createdAt: -1 },
      rating: { rating: -1, reviewCount: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      latest: { createdAt: -1 },
    };

    const [items, total] = await Promise.all([
      CourseModel.find(query).sort(sortMap[sortParam] || sortMap.popular).skip(skip).limit(limit).lean(),
      CourseModel.countDocuments(query),
    ]);

    return toResponse(
      ok({
        data: items.map((item) => ({
          id: String(item._id),
          title: item.title,
          slug: item.slug,
          description: item.description,
          short_description: item.shortDescription,
          category: item.category,
          level: item.level,
          price: item.price,
          originalPrice: item.originalPrice,
          discount: item.discount,
          duration: item.duration,
          thumbnail: item.thumbnail,
          banner: item.banner,
          rating: item.rating,
          reviewCount: item.reviewCount,
          studentsEnrolled: item.studentsEnrolled,
          deliveryMode: item.deliveryMode || item.delivery || 'recorded',
          liveSessionsCount: Array.isArray(item.liveSessions) ? item.liveSessions.length : 0,
          href: `/courses/${item.slug}`,
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    return handleError(error);
  }
}
