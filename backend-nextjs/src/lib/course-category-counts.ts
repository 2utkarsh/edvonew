import { CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';

export async function syncCourseCategoryCounts() {
  const categoryCounts = await CourseModel.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  await CourseCategoryModel.updateMany({}, { $set: { courseCount: 0 } });

  await Promise.all(
    categoryCounts.map((item: any) =>
      CourseCategoryModel.updateOne(
        { name: item._id },
        { $set: { courseCount: item.count } }
      )
    )
  );
}
