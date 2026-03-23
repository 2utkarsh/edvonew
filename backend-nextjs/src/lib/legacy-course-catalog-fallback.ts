import { flattenCurriculumRows } from '@/lib/course-runtime';
import { legacyCourseCategories, legacyCourses } from '@/lib/legacy-course-catalog';

function createLegacyId(...parts: Array<string | number>) {
  return parts
    .filter((value) => value !== undefined && value !== null && String(value).trim())
    .map((value) => String(value).trim())
    .join('-');
}

function getLegacyCourseCounts() {
  const counts = new Map<string, number>();

  legacyCourses.forEach((course) => {
    counts.set(course.category, (counts.get(course.category) || 0) + 1);
  });

  return counts;
}

function withLegacyTimestamps<T extends Record<string, any>>(item: T, index: number) {
  const timestamp = new Date(Date.UTC(2025, 0, index + 1, 12, 0, 0)).toISOString();
  return {
    ...item,
    createdAt: item.createdAt || timestamp,
    updatedAt: item.updatedAt || timestamp,
    publishedAt: item.publishedAt || timestamp,
  };
}

function hydrateCurriculum(courseSlug: string, curriculum: any[] = []) {
  return curriculum.map((subject, subjectIndex) => ({
    ...subject,
    id: subject.id || createLegacyId('legacy-subject', courseSlug, subjectIndex + 1),
    modules: Array.isArray(subject.modules)
      ? subject.modules.map((module: any, moduleIndex: number) => ({
          ...module,
          id: module.id || createLegacyId('legacy-module', courseSlug, subjectIndex + 1, moduleIndex + 1),
          lectures: Array.isArray(module.lectures)
            ? module.lectures.map((lecture: any, lectureIndex: number) => ({
                ...lecture,
                id:
                  lecture.id ||
                  createLegacyId('legacy-lecture', courseSlug, subjectIndex + 1, moduleIndex + 1, lectureIndex + 1),
              }))
            : [],
        }))
      : [],
  }));
}

function hydrateLegacyCourse(course: (typeof legacyCourses)[number], index: number) {
  const timestampedCourse = withLegacyTimestamps(course, index);
  const curriculum = hydrateCurriculum(course.slug, course.curriculum || []);

  return {
    ...timestampedCourse,
    id: createLegacyId('legacy-course', course.slug),
    _id: createLegacyId('legacy-course', course.slug),
    thumbnail: course.thumbnail || '',
    banner: course.banner || '',
    curriculum,
    curriculumRows: flattenCurriculumRows(curriculum),
    liveSessions: Array.isArray(course.liveSessions)
      ? course.liveSessions.map((session, sessionIndex) => ({
          ...session,
          id: (session as any).id || createLegacyId('legacy-session', course.slug, sessionIndex + 1),
        }))
      : [],
    mentors: Array.isArray(course.mentors)
      ? course.mentors.map((mentor, mentorIndex) => ({
          ...mentor,
          id: (mentor as any).id || createLegacyId('legacy-mentor', course.slug, mentorIndex + 1),
        }))
      : [],
    plans: Array.isArray(course.plans)
      ? course.plans.map((plan, planIndex) => ({
          ...plan,
          _id: (plan as any)._id || createLegacyId('legacy-plan', course.slug, planIndex + 1),
        }))
      : [],
    studentMetrics: {
      totalStudents: course.studentsEnrolled || 0,
      averageProgress: course.deliveryMode === 'live' ? 68 : course.deliveryMode === 'hybrid' ? 73 : 79,
      averageAttendance: course.deliveryMode === 'recorded' ? 92 : course.deliveryMode === 'hybrid' ? 87 : 84,
      averagePerformance: 81,
      averageParticipation: 24,
    },
    students: [],
  };
}

export function getLegacyCategoriesForApi() {
  const counts = getLegacyCourseCounts();

  return legacyCourseCategories
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((category) => ({
      ...category,
      id: createLegacyId('legacy-category', category.slug),
      isActive: true,
      courseCount: counts.get(category.name) || 0,
    }));
}

export function getLegacyAdminCoursesForApi() {
  return legacyCourses
    .map((course, index) => hydrateLegacyCourse(course, index))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function findLegacyCourseBySlug(slug: string) {
  const index = legacyCourses.findIndex((course) => course.slug === slug);
  if (index < 0) return null;
  return hydrateLegacyCourse(legacyCourses[index], index);
}

export function getLegacyPublicCourseListForApi() {
  return getLegacyAdminCoursesForApi().map((item) => ({
    id: item.id,
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
    order: item.order,
    createdAt: item.createdAt,
    href: `/courses/${item.slug}`,
  }));
}

export function getLegacyCourseDetailForApi(slug: string) {
  const item = findLegacyCourseBySlug(slug);
  if (!item) return null;

  return {
    id: item.id,
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
    curriculumRows: item.curriculumRows,
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
  };
}
