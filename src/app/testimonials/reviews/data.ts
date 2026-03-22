export interface CourseReviewItem {
  id: string;
  rating: number;
  comment: string;
  helpful: number;
  order: number;
  status: 'active' | 'inactive';
  category: string;
  courseId: string;
  courseName: string;
  courseSlug: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCategoryOption {
  id: string;
  label: string;
  total?: number;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchCourseReviews(): Promise<CourseReviewItem[]> {
  const response = await fetch(`${apiBase}/api/course-reviews`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load course reviews');
  }

  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id || ''),
    rating: Number(item.rating || 0),
    comment: String(item.comment || ''),
    helpful: Number(item.helpful || 0),
    order: Number(item.order || 0),
    status: item.status === 'inactive' ? 'inactive' : 'active',
    category: String(item.category || 'General'),
    courseId: String(item.courseId || ''),
    courseName: String(item.courseName || 'EDVO Course'),
    courseSlug: String(item.courseSlug || ''),
    reviewerName: String(item.reviewerName || 'EDVO Learner'),
    reviewerAvatar: String(item.reviewerAvatar || '/images/edvo-official-logo-v10.png'),
    reviewerRole: String(item.reviewerRole || 'Learner'),
    createdAt: String(item.createdAt || ''),
    updatedAt: String(item.updatedAt || item.createdAt || ''),
  }));
}

export async function fetchCourseReviewCategories(): Promise<ReviewCategoryOption[]> {
  const response = await fetch(`${apiBase}/api/course-review-categories`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load review categories');
  }

  const items = Array.isArray(payload?.data) ? payload.data : [];
  return [{ id: 'all', label: 'All Categories' }].concat(
    items.map((item: Record<string, unknown>) => ({
      id: String(item.id || item.label || ''),
      label: String(item.label || item.id || 'General'),
      total: Number(item.total || 0),
    }))
  );
}
