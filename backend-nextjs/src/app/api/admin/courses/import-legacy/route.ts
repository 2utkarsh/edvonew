import { requireAuth } from '@/lib/auth';
import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { connectToDatabase } from '@/lib/db';
import { legacyCourseCategories, legacyCourses } from '@/lib/legacy-course-catalog';
import { handleError, ok, toResponse } from '@/lib/http';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

export async function POST() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    let createdCategories = 0;
    let updatedCategories = 0;
    let createdCourses = 0;
    let skippedCourses = 0;

    for (const category of legacyCourseCategories) {
      const existing = await CourseCategoryModel.findOne({ slug: category.slug }).lean();
      if (existing) {
        await CourseCategoryModel.updateOne(
          { _id: existing._id },
          {
            $set: {
              description: category.description,
              color: category.color,
              order: category.order,
              isActive: true,
            },
          }
        );
        updatedCategories += 1;
      } else {
        await CourseCategoryModel.create({
          ...category,
          isActive: true,
          courseCount: 0,
        });
        createdCategories += 1;
      }
    }

    for (const course of legacyCourses) {
      const existing = await CourseModel.findOne({ slug: course.slug }).lean();
      if (existing) {
        skippedCourses += 1;
        continue;
      }

      await CourseModel.create(course);
      createdCourses += 1;
    }
    await syncCourseCategoryCounts();

    return toResponse(
      ok({
        createdCategories,
        updatedCategories,
        createdCourses,
        skippedCourses,
        totalLegacyCourses: legacyCourses.length,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}
