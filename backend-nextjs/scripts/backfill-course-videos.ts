import mongoose from 'mongoose';
import { config } from 'dotenv';
import { CourseModel } from '../src/models/Course';
import { fillCurriculumRecordedVideoUrls } from '../src/lib/course-recorded-videos';

config({ path: '.env.local' });

async function backfillCourseVideos() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not configured');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const courses = await CourseModel.find({}, { title: 1, slug: 1, curriculum: 1 }).lean();

    let changedCourses = 0;
    let lecturesFilled = 0;
    let recordedLectures = 0;
    let coursesWithoutRecordedLessons = 0;

    const operations = courses
      .map((course) => {
        const result = fillCurriculumRecordedVideoUrls(course.slug || course.title || 'course', course.curriculum || []);
        recordedLectures += result.recordedLectureCount;

        if (result.recordedLectureCount === 0) {
          coursesWithoutRecordedLessons += 1;
        }

        if (result.addedCount === 0) {
          return null;
        }

        changedCourses += 1;
        lecturesFilled += result.addedCount;

        return {
          updateOne: {
            filter: { _id: course._id },
            update: {
              $set: {
                curriculum: result.curriculum,
                updatedAt: new Date(),
              },
            },
          },
        };
      })
      .filter(Boolean);

    if (operations.length > 0) {
      await CourseModel.bulkWrite(operations as any[], { ordered: false });
    }

    console.log(
      JSON.stringify(
        {
          totalCourses: courses.length,
          changedCourses,
          lecturesFilled,
          recordedLectures,
          coursesWithoutRecordedLessons,
        },
        null,
        2,
      ),
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Error backfilling course videos:', error.message);
    process.exit(1);
  }
}

backfillCourseVideos();
