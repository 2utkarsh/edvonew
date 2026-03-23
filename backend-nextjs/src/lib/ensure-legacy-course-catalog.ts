import { syncCourseCategoryCounts } from '@/lib/course-category-counts';
import { legacyCourseCategories, legacyCourses } from '@/lib/legacy-course-catalog';
import { SystemSettingModel } from '@/models/SystemSetting';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

export const LEGACY_COURSE_CATALOG_IMPORTED_KEY = 'courses.legacyCatalogImported';

function getLegacyCatalogTotals() {
  return {
    totalLegacyCategories: legacyCourseCategories.length,
    totalLegacyCourses: legacyCourses.length,
  };
}

export async function getLegacyCatalogPresence() {
  const [existingLegacyCategoryCount, existingLegacyCourseCount] = await Promise.all([
    CourseCategoryModel.countDocuments({ slug: { $in: legacyCourseCategories.map((item) => item.slug) } }),
    CourseModel.countDocuments({ slug: { $in: legacyCourses.map((item) => item.slug) } }),
  ]);

  return {
    existingLegacyCategoryCount,
    existingLegacyCourseCount,
    missingLegacyCategories: Math.max(legacyCourseCategories.length - existingLegacyCategoryCount, 0),
    missingLegacyCourses: Math.max(legacyCourses.length - existingLegacyCourseCount, 0),
    ...getLegacyCatalogTotals(),
  };
}

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
  const presence = await getLegacyCatalogPresence();

  if (presence.missingLegacyCategories > 0) {
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

  if (presence.missingLegacyCourses > 0) {
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
    createdCategories: presence.missingLegacyCategories,
    createdCourses: presence.missingLegacyCourses,
    seeded: presence.missingLegacyCategories > 0 || presence.missingLegacyCourses > 0,
    totalLegacyCategories: presence.totalLegacyCategories,
    totalLegacyCourses: presence.totalLegacyCourses,
  };
}

export async function bootstrapLegacyCourseCatalog() {
  const [item, presence] = await Promise.all([
    SystemSettingModel.findOne({ key: LEGACY_COURSE_CATALOG_IMPORTED_KEY }).lean(),
    getLegacyCatalogPresence(),
  ]);

  if (item?.value === true && presence.missingLegacyCategories === 0 && presence.missingLegacyCourses === 0) {
    return {
      createdCategories: 0,
      createdCourses: 0,
      seeded: false,
      totalLegacyCategories: presence.totalLegacyCategories,
      totalLegacyCourses: presence.totalLegacyCourses,
    };
  }

  const result = await importLegacyCourseCatalog();
  await markLegacyCourseCatalogImported();
  return result;
}
