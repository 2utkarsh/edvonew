import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { legacyCourseCategories, legacyCourses } from '@/lib/legacy-course-catalog';
import { SystemSettingModel } from '@/models/SystemSetting';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

export const LEGACY_COURSE_CATALOG_IMPORTED_KEY = 'courses.legacyCatalogImported';

export async function markLegacyCourseCatalogImported() {
  await SystemSettingModel.findOneAndUpdate(
    { key: LEGACY_COURSE_CATALOG_IMPORTED_KEY },
    {
      key: LEGACY_COURSE_CATALOG_IMPORTED_KEY,
      value: true,
      category: 'courses',
      description: 'Whether the legacy course catalog has been imported into the dynamic admin system.',
      type: 'boolean',
      isPublic: false,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function importLegacyCourseCatalog() {
  const existingLegacyCategoryCount = await CourseCategoryModel.countDocuments({
    slug: { $in: legacyCourseCategories.map((item) => item.slug) },
  });
  const existingLegacyCourseCount = await CourseModel.countDocuments({
    slug: { $in: legacyCourses.map((item) => item.slug) },
  });

  if (existingLegacyCategoryCount < legacyCourseCategories.length) {
    await CourseCategoryModel.bulkWrite(
      legacyCourseCategories.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: {
            $setOnInsert: {
              ...category,
              isActive: true,
              courseCount: 0,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }

  if (existingLegacyCourseCount < legacyCourses.length) {
    await CourseModel.bulkWrite(
      legacyCourses.map((course) => ({
        updateOne: {
          filter: { slug: course.slug },
          update: {
            $setOnInsert: course,
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }

  await syncCourseCategoryCounts();

  return {
    createdCategories: Math.max(legacyCourseCategories.length - existingLegacyCategoryCount, 0),
    createdCourses: Math.max(legacyCourses.length - existingLegacyCourseCount, 0),
    seeded: existingLegacyCategoryCount < legacyCourseCategories.length || existingLegacyCourseCount < legacyCourses.length,
    totalLegacyCategories: legacyCourseCategories.length,
    totalLegacyCourses: legacyCourses.length,
  };
}

export async function bootstrapLegacyCourseCatalog() {
  const item = await SystemSettingModel.findOne({ key: LEGACY_COURSE_CATALOG_IMPORTED_KEY }).lean();
  if (item?.value === true) {
    return {
      createdCategories: 0,
      createdCourses: 0,
      seeded: false,
      totalLegacyCategories: legacyCourseCategories.length,
      totalLegacyCourses: legacyCourses.length,
    };
  }

  const result = await importLegacyCourseCatalog();
  await markLegacyCourseCatalogImported();
  return result;
}
