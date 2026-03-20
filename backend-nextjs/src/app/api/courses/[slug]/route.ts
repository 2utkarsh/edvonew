import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok } from '@/lib/http';
import { CourseModel } from '@/models/Course';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const item = await CourseModel.findOne({ slug }).lean();
    if (!item) return fail('Course not found', 404);

    return ok({
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
      language: item.language,
      jobAssistance: item.jobAssistance,
      bannerTag: item.bannerTag,
      bannerSubtag: item.bannerSubtag,
      bannerExtra: item.bannerExtra,
      stats: item.stats,
      tags: item.tags,
      requirements: item.requirements,
      whatYouWillLearn: item.whatYouWillLearn,
      curriculum: item.curriculum,
      mentors: item.mentors,
      plans: item.plans,
      offerings: item.offerings,
      faqs: item.faqs,
      testimonials: item.testimonials,
      certifications: item.certifications,
      rating: item.rating,
      reviewCount: item.reviewCount,
      studentsEnrolled: item.studentsEnrolled,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}

