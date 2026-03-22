import { slugify } from '@/lib/query';
import { CourseReviewCategoryModel, CourseReviewItemModel } from '@/models/CourseReviewItem';
import { ReviewModel } from '@/models/Review';

export function formatSubmittedCourseReview(item: any) {
  const course = item.courseId || {};
  const user = item.userId || {};

  return {
    id: String(item._id),
    sourceType: 'submitted',
    rating: Number(item.rating || 0),
    comment: String(item.comment || ''),
    helpful: Number(item.helpful || 0),
    order: Number(item.order || 0),
    isApproved: item.isApproved === false ? false : true,
    status: item.isApproved === false ? 'inactive' : 'active',
    category: String(course.category || 'General'),
    courseId: String(course._id || ''),
    courseName: String(course.title || 'EDVO Course'),
    courseSlug: String(course.slug || ''),
    reviewerName: String(user.name || 'EDVO Learner'),
    reviewerAvatar: String(user.photo || user.avatar || '/images/edvo-official-logo-v10.png'),
    reviewerRole: String(user.headline || 'Learner'),
    externalUrl: '',
    sourceLabel: 'EDVO Course Review',
    editable: false,
    deletable: false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function formatManualCourseReview(item: any) {
  return {
    id: String(item._id),
    sourceType: 'manual',
    rating: Number(item.rating || 0),
    comment: String(item.comment || ''),
    helpful: Number(item.helpful || 0),
    order: Number(item.order || 0),
    isApproved: item.status === 'inactive' ? false : true,
    status: item.status === 'inactive' ? 'inactive' : 'active',
    category: String(item.category || 'General'),
    courseId: '',
    courseName: String(item.courseName || 'EDVO Course'),
    courseSlug: String(item.courseSlug || ''),
    reviewerName: String(item.reviewerName || 'EDVO Learner'),
    reviewerAvatar: String(item.reviewerAvatar || '/images/edvo-official-logo-v10.png'),
    reviewerRole: String(item.reviewerRole || 'Learner'),
    externalUrl: String(item.externalUrl || ''),
    sourceLabel: String(item.sourceLabel || 'External Review'),
    editable: true,
    deletable: true,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function fetchSubmittedCourseReviews() {
  const items = await ReviewModel.find()
    .populate('courseId', 'title slug category')
    .populate('userId', 'name photo avatar headline')
    .sort({ order: 1, updatedAt: -1 })
    .lean();

  return items.map(formatSubmittedCourseReview);
}

export async function fetchManualCourseReviews() {
  const items = await CourseReviewItemModel.find().sort({ order: 1, updatedAt: -1 }).lean();
  return items.map(formatManualCourseReview);
}

export async function ensureCourseReviewCategoriesFromData() {
  const manualCategories = await CourseReviewItemModel.distinct('category', { category: { $exists: true, $ne: '' } });
  const submittedRows = await ReviewModel.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$course.category',
      },
    },
  ]);

  const names = Array.from(new Set(manualCategories.concat(submittedRows.map((row: any) => String(row._id || '')).filter(Boolean))));
  if (!names.length) {
    return;
  }

  await Promise.all(
    names.map((name, index) =>
      CourseReviewCategoryModel.updateOne(
        { slug: slugify(String(name)) },
        {
          $set: {
            name: String(name),
            slug: slugify(String(name)),
            description: `${String(name)} course reviews`,
            isActive: true,
            order: index,
          },
        },
        { upsert: true }
      )
    )
  );
}

export async function fetchCourseReviewCategories() {
  await ensureCourseReviewCategoriesFromData();

  const categoryDocs = await CourseReviewCategoryModel.find().sort({ order: 1, updatedAt: -1 }).lean();
  const counts = new Map<string, number>();

  const manualCounts = await CourseReviewItemModel.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', total: { $sum: 1 } } },
  ]);

  for (const row of manualCounts) {
    counts.set(String(row._id || ''), Number(row.total || 0));
  }

  const submittedCounts = await ReviewModel.aggregate([
    { $match: { isApproved: true } },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    { $group: { _id: '$course.category', total: { $sum: 1 } } },
  ]);

  for (const row of submittedCounts) {
    const key = String(row._id || '');
    counts.set(key, Number(row.total || 0) + Number(counts.get(key) || 0));
  }

  const categories = categoryDocs.map((item: any) => ({
    id: String(item._id),
    label: String(item.name || ''),
    slug: String(item.slug || ''),
    description: String(item.description || ''),
    isActive: item.isActive === false ? false : true,
    order: Number(item.order || 0),
    total: Number(counts.get(String(item.name || '')) || 0),
  }));

  return categories.filter((item) => item.label);
}
