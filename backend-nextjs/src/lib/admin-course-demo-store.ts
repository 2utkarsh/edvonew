import crypto from 'crypto';
import { flattenCurriculumRows, normalizeCoursePayload } from '@/lib/course-runtime';
import { getLegacyAdminCoursesForApi, getLegacyCategoriesForApi } from '@/lib/legacy-course-catalog-fallback';
import {
  defaultPaymentGatewaySettings,
  normalizePaymentGatewaySettings,
  type PaymentGatewaySettings,
} from '@/lib/system-settings';
import { slugify } from '@/lib/query';

type AnyObject = Record<string, any>;

type AdminCourseDemoStore = {
  courses: AnyObject[];
  categories: AnyObject[];
  paymentSettings: PaymentGatewaySettings;
};

declare global {
  var __ADMIN_COURSE_DEMO_STORE__: AdminCourseDemoStore | undefined;
}

class AdminCourseDemoError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AdminCourseDemoError';
    this.status = status;
    this.code = code;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

function getNowIso() {
  return new Date().toISOString();
}

function getStore() {
  if (!global.__ADMIN_COURSE_DEMO_STORE__) {
    global.__ADMIN_COURSE_DEMO_STORE__ = {
      courses: clone(getLegacyAdminCoursesForApi()),
      categories: clone(getLegacyCategoriesForApi()),
      paymentSettings: clone(defaultPaymentGatewaySettings),
    };
  }

  syncStore(global.__ADMIN_COURSE_DEMO_STORE__);
  return global.__ADMIN_COURSE_DEMO_STORE__;
}

function syncStore(store: AdminCourseDemoStore) {
  const categoryCounts = new Map<string, number>();

  store.courses.forEach((course) => {
    const category = String(course.category || '').trim();
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }

    course.id = String(course.id || course._id || createId('fallback-course'));
    course._id = course.id;
    course.deliveryMode = String(course.deliveryMode || course.delivery || 'recorded').toLowerCase();
    course.delivery = course.deliveryMode;
    course.curriculumRows = flattenCurriculumRows(course.curriculum || []);
    course.liveSessionsCount = Array.isArray(course.liveSessions) ? course.liveSessions.length : 0;
    course.studentMetrics = {
      totalStudents: Number(course.studentMetrics?.totalStudents || course.studentsEnrolled || 0),
      averageProgress: Number(course.studentMetrics?.averageProgress || 0),
      averageAttendance: Number(course.studentMetrics?.averageAttendance || 0),
      averagePerformance: Number(course.studentMetrics?.averagePerformance || 0),
      averageParticipation: Number(course.studentMetrics?.averageParticipation || 0),
    };
    course.students = Array.isArray(course.students) ? course.students : [];
  });

  store.courses.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  store.categories = store.categories
    .map((category) => {
      const id = String(category.id || category._id || createId('fallback-category'));
      return {
        ...category,
        id,
        _id: id,
        order: Number(category.order || 0),
        color: String(category.color || '#c17017'),
        isActive: category.isActive === undefined ? true : Boolean(category.isActive),
        courseCount: categoryCounts.get(String(category.name || '').trim()) || 0,
      };
    })
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function getHighestOrder(items: AnyObject[]) {
  return items.reduce((highest, item) => Math.max(highest, Number(item.order || 0)), 0);
}

function getDefaultStudentMetrics() {
  return {
    totalStudents: 0,
    averageProgress: 0,
    averageAttendance: 0,
    averagePerformance: 0,
    averageParticipation: 0,
  };
}

function buildCourseRecord(input: Record<string, unknown>, existing?: AnyObject) {
  const payload = normalizeCoursePayload(input as AnyObject);
  const title = String((input as AnyObject).title || payload.title || existing?.title || 'Untitled Course').trim() || 'Untitled Course';
  const slug = String((input as AnyObject).slug || payload.slug || slugify(title)).trim() || slugify(title);
  const now = getNowIso();
  const nextStatus = String(payload.status || existing?.status || 'draft');

  return {
    ...existing,
    ...payload,
    title,
    slug,
    deliveryMode: String(payload.deliveryMode || payload.delivery || existing?.deliveryMode || 'recorded').toLowerCase(),
    delivery: String(payload.deliveryMode || payload.delivery || existing?.delivery || 'recorded').toLowerCase(),
    curriculumRows: flattenCurriculumRows(payload.curriculum || []),
    liveSessionsCount: Array.isArray(payload.liveSessions) ? payload.liveSessions.length : 0,
    studentMetrics: existing?.studentMetrics || getDefaultStudentMetrics(),
    students: Array.isArray(existing?.students) ? existing.students : [],
    rating: Number(existing?.rating || 0),
    reviewCount: Number(existing?.reviewCount || 0),
    studentsEnrolled: Number(existing?.studentsEnrolled || 0),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedAt: nextStatus === 'published' ? existing?.publishedAt || now : existing?.publishedAt,
  };
}

export function isAdminCourseDemoError(error: unknown): error is AdminCourseDemoError {
  return error instanceof AdminCourseDemoError;
}

export function getAdminCourseDemoPaymentSettings() {
  return clone(getStore().paymentSettings);
}

export function saveAdminCourseDemoPaymentSettings(input: unknown) {
  const store = getStore();
  store.paymentSettings = normalizePaymentGatewaySettings(input);
  return clone(store.paymentSettings);
}

export function getAdminCourseDemoCategories() {
  return clone(getStore().categories);
}

export function getAdminCourseDemoCategory(id: string) {
  const item = getStore().categories.find((category) => String(category.id) === String(id));
  return item ? clone(item) : null;
}

export function createAdminCourseDemoCategory(input: Record<string, unknown>) {
  const store = getStore();
  const name = String(input.name || input.title || '').trim();
  if (!name) {
    throw new AdminCourseDemoError('Category name is required', 400, 'VALIDATION_ERROR');
  }

  const slug = String(input.slug || slugify(name)).trim() || slugify(name);
  const duplicate = store.categories.find(
    (category) => String(category.name).toLowerCase() === name.toLowerCase() || String(category.slug).toLowerCase() === slug.toLowerCase(),
  );
  if (duplicate) {
    throw new AdminCourseDemoError('A category with this name or slug already exists', 409, 'CONFLICT');
  }

  const requestedOrder = Number(input.order || 0);
  const id = createId('fallback-category');
  const item = {
    id,
    _id: id,
    name,
    slug,
    description: String(input.description || ''),
    icon: String(input.icon || ''),
    color: String(input.color || '#c17017'),
    order: requestedOrder > 0 ? requestedOrder : getHighestOrder(store.categories) + 1,
    isActive: input.isActive === undefined ? true : Boolean(input.isActive),
    courseCount: 0,
    createdAt: getNowIso(),
    updatedAt: getNowIso(),
  };

  store.categories.push(item);
  syncStore(store);
  return clone(item);
}

export function updateAdminCourseDemoCategory(id: string, input: Record<string, unknown>) {
  const store = getStore();
  const index = store.categories.findIndex((category) => String(category.id) === String(id));
  if (index < 0) {
    return null;
  }

  const current = store.categories[index];
  const rawName = input.name || input.title;
  const nextName = rawName ? String(rawName).trim() : String(current.name || '');
  const nextSlug = input.slug ? String(input.slug).trim() : rawName ? slugify(String(rawName)) : String(current.slug || '');
  const duplicate = store.categories.find(
    (category, categoryIndex) =>
      categoryIndex !== index &&
      (String(category.name).toLowerCase() === nextName.toLowerCase() || String(category.slug).toLowerCase() === nextSlug.toLowerCase()),
  );
  if (duplicate) {
    throw new AdminCourseDemoError('A category with this name or slug already exists', 409, 'CONFLICT');
  }

  const updated = {
    ...current,
    ...(rawName ? { name: nextName } : {}),
    ...(nextSlug ? { slug: nextSlug } : {}),
    ...(input.description !== undefined ? { description: String(input.description || '') } : {}),
    ...(input.icon !== undefined ? { icon: String(input.icon || '') } : {}),
    ...(input.color !== undefined ? { color: String(input.color || '#c17017') } : {}),
    ...(input.order !== undefined ? { order: Number(input.order || 0) } : {}),
    ...(input.isActive !== undefined ? { isActive: Boolean(input.isActive) } : {}),
    updatedAt: getNowIso(),
  };

  store.categories[index] = updated;
  if (current.name !== updated.name) {
    store.courses = store.courses.map((course) =>
      String(course.category || '') === String(current.name || '') ? { ...course, category: updated.name, updatedAt: getNowIso() } : course,
    );
  }

  syncStore(store);
  return clone(store.categories[index]);
}

export function deleteAdminCourseDemoCategory(id: string) {
  const store = getStore();
  const current = store.categories.find((category) => String(category.id) === String(id));
  if (!current) {
    return null;
  }

  const attachedCourses = store.courses.filter((course) => String(course.category || '') === String(current.name || '')).length;
  if (attachedCourses > 0) {
    throw new AdminCourseDemoError(
      `This category is still assigned to ${attachedCourses} course${attachedCourses === 1 ? '' : 's'}. Move those courses first.`,
      409,
      'CONFLICT',
    );
  }

  store.categories = store.categories.filter((category) => String(category.id) !== String(id));
  syncStore(store);
  return { deleted: true, id };
}

export function getAdminCourseDemoPayload() {
  const store = getStore();
  syncStore(store);
  return {
    courses: clone(store.courses),
    categories: clone(store.categories),
  };
}

export function getAdminCourseDemoCourse(id: string) {
  const store = getStore();
  syncStore(store);
  const item = store.courses.find((course) => String(course.id) === String(id));
  return item ? clone(item) : null;
}

export function createAdminCourseDemoCourse(input: Record<string, unknown>) {
  const store = getStore();
  const draft = buildCourseRecord(input);
  const duplicate = store.courses.find((course) => String(course.slug).toLowerCase() === String(draft.slug).toLowerCase());
  if (duplicate) {
    throw new AdminCourseDemoError('A course with this slug already exists', 409, 'CONFLICT');
  }

  const id = createId('fallback-course');
  const requestedOrder = Number((input as AnyObject).order || draft.order || 0);
  const item = {
    ...draft,
    id,
    _id: id,
    order: requestedOrder > 0 ? requestedOrder : getHighestOrder(store.courses) + 1,
  };

  store.courses.push(item);
  syncStore(store);
  return clone(item);
}

export function updateAdminCourseDemoCourse(id: string, input: Record<string, unknown>) {
  const store = getStore();
  const index = store.courses.findIndex((course) => String(course.id) === String(id));
  if (index < 0) {
    return null;
  }

  const existing = store.courses[index];
  const mergedInput = {
    ...existing,
    ...input,
    stats: {
      ...(existing.stats || {}),
      ...((input as AnyObject).stats || {}),
    },
    certificateSettings: {
      ...(existing.certificateSettings || {}),
      ...((input as AnyObject).certificateSettings || {}),
    },
    notificationSettings: {
      ...(existing.notificationSettings || {}),
      ...((input as AnyObject).notificationSettings || {}),
    },
  };

  const updated = buildCourseRecord(mergedInput, existing);
  const duplicate = store.courses.find(
    (course, courseIndex) => courseIndex !== index && String(course.slug).toLowerCase() === String(updated.slug).toLowerCase(),
  );
  if (duplicate) {
    throw new AdminCourseDemoError('A course with this slug already exists', 409, 'CONFLICT');
  }

  updated.id = existing.id;
  updated._id = existing._id || existing.id;
  updated.order =
    (input as AnyObject).order !== undefined
      ? Number((input as AnyObject).order || 0)
      : Number(existing.order || updated.order || 0);

  store.courses[index] = updated;
  syncStore(store);
  return clone(store.courses[index]);
}

export function deleteAdminCourseDemoCourse(id: string) {
  const store = getStore();
  const index = store.courses.findIndex((course) => String(course.id) === String(id));
  if (index < 0) {
    return null;
  }

  store.courses.splice(index, 1);
  syncStore(store);
  return { deleted: true, id };
}

export function importLegacyAdminCourseDemoCatalog() {
  const store = getStore();
  const legacyCategories = getLegacyCategoriesForApi();
  const legacyCourses = getLegacyAdminCoursesForApi();
  let createdCategories = 0;
  let createdCourses = 0;

  legacyCategories.forEach((category) => {
    const exists = store.categories.some((item) => String(item.slug).toLowerCase() === String(category.slug).toLowerCase());
    if (!exists) {
      store.categories.push(clone(category));
      createdCategories += 1;
    }
  });

  legacyCourses.forEach((course) => {
    const exists = store.courses.some((item) => String(item.slug).toLowerCase() === String(course.slug).toLowerCase());
    if (!exists) {
      store.courses.push(clone(course));
      createdCourses += 1;
    }
  });

  syncStore(store);

  return {
    createdCategories,
    updatedCategories: 0,
    createdCourses,
    skippedCourses: Math.max(legacyCourses.length - createdCourses, 0),
    totalLegacyCourses: legacyCourses.length,
    totalLegacyCategories: legacyCategories.length,
    fallback: true,
  };
}
