import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { bootstrapLegacyCourseCatalog } from '@/lib/ensure-legacy-course-catalog';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { getLegacyCourseDetailForApi } from '@/lib/legacy-course-catalog-fallback';
import { flattenCurriculumRows } from '@/lib/course-runtime';
import { CourseModel } from '@/models/Course';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    if (!hasConfiguredMongoUri()) {
      const fallbackCourse = getLegacyCourseDetailForApi(slug);
      if (!fallbackCourse) return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));
      return toResponse(ok(fallbackCourse));
    }

    await connectToDatabase();
    await bootstrapLegacyCourseCatalog();

    const item = await CourseModel.findOne({ slug }).lean();
    if (!item) return toResponse(fail('Course not found', 'NOT_FOUND', undefined, 404));

    return toResponse(
      ok({
        id: String(item._id),
        title: item.title,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        category: item.category,
        level: item.level,
        status: item.status,
        thumbnail: item.thumbnail,
        banner: item.banner,
        price: item.price,
        originalPrice: item.originalPrice,
        discount: item.discount,
        startDate: item.startDate,
        duration: item.duration,
        delivery: item.delivery,
        deliveryMode: item.deliveryMode || item.delivery || 'recorded',
        language: item.language,
        jobAssistance: item.jobAssistance,
        bannerTag: item.bannerTag,
        bannerSubtag: item.bannerSubtag,
        bannerExtra: item.bannerExtra,
        cohortLabel: item.cohortLabel,
        supportEmail: item.supportEmail,
        accessDurationMonths: item.accessDurationMonths,
        stats: item.stats,
        tags: item.tags,
        requirements: item.requirements,
        whatYouWillLearn: item.whatYouWillLearn,
        featuredOutcomes: item.featuredOutcomes,
        curriculum: item.curriculum,
        curriculumRows: flattenCurriculumRows(item.curriculum),
        liveSessions: item.liveSessions,
        mentors: item.mentors,
        plans: item.plans,
        offerings: item.offerings,
        faqs: item.faqs,
        testimonials: item.testimonials,
        certifications: item.certifications,
        certificateSettings: item.certificateSettings,
        notificationSettings: item.notificationSettings,
        rating: item.rating,
        reviewCount: item.reviewCount,
        studentsEnrolled: item.studentsEnrolled,
        publishedAt: item.publishedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
    );
  } catch (error) {
    console.error('Falling back to built-in course detail', error);
    const fallbackCourse = getLegacyCourseDetailForApi(slug);
    if (fallbackCourse) {
      return toResponse(ok(fallbackCourse));
    }
    return handleError(error);
  }
}
