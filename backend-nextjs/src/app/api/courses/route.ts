import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { bootstrapLegacyCourseCatalog } from '@/lib/ensure-legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';
import { getLegacyCategoriesForApi, getLegacyPublicCourseListForApi } from '@/lib/legacy-course-catalog-fallback';
import { buildSearchRegex, getPagination } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

function buildFallbackResponse(searchParams: URLSearchParams) {
  const { page, limit, skip } = getPagination(searchParams);
  const search = buildSearchRegex(searchParams.get('search'));
  const level = searchParams.get('level');
  const category = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'featured';
  const categories = getLegacyCategoriesForApi();
  const categoryName = category
    ? categories.find((item) => item.slug === category || item.name === category)?.name || category
    : '';

  let items = getLegacyPublicCourseListForApi();

  if (search) {
    items = items.filter((item) => search.test([item.title, item.description, item.category].join(' ')));
  }

  if (level) {
    items = items.filter((item) => item.level === level);
  }

  if (categoryName) {
    items = items.filter((item) => item.category === categoryName);
  }

  const sorters: Record<string, (a: (typeof items)[number], b: (typeof items)[number]) => number> = {
    featured: (a, b) => (a.order || 0) - (b.order || 0),
    popular: (a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0) || (a.order || 0) - (b.order || 0),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0),
    'price-low': (a, b) => (a.price || 0) - (b.price || 0) || (a.order || 0) - (b.order || 0),
    'price-high': (a, b) => (b.price || 0) - (a.price || 0) || (a.order || 0) - (b.order || 0),
    latest: (a, b) => new Date(String(b.createdAt || '')).getTime() - new Date(String(a.createdAt || '')).getTime(),
  };

  items = items.sort(sorters[sortParam] || sorters.featured);

  const total = items.length;
  const pagedItems = items.slice(skip, skip + limit).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    short_description: item.short_description,
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
    deliveryMode: item.deliveryMode,
    liveSessionsCount: item.liveSessionsCount,
    href: item.href,
  }));

  return toResponse(
    ok({
      data: pagedItems,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (!hasConfiguredMongoUri()) {
      return buildFallbackResponse(searchParams);
    }

    await connectToDatabase();
    await bootstrapLegacyCourseCatalog();
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

    const sortParam = searchParams.get('sort') || 'featured';
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      featured: { order: 1, createdAt: -1 },
      popular: { studentsEnrolled: -1, order: 1, createdAt: -1 },
      rating: { rating: -1, reviewCount: -1, order: 1 },
      'price-low': { price: 1, order: 1 },
      'price-high': { price: -1, order: 1 },
      latest: { createdAt: -1, order: 1 },
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
    console.error('Falling back to built-in course catalog', error);
    return buildFallbackResponse(new URL(request.url).searchParams);
  }
}
