import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { ExamModel } from '@/models/Exam';

export async function GET() {
  try {
    const auth = await requireAuth(['student', 'instructor', 'admin']);
    if ('error' in auth) return auth.error;

    await connectToDatabase();

    const enrollments = await EnrollmentModel.find({ userId: auth.payload.sub }).sort({ updatedAt: -1 }).limit(8).lean();
    const courseIds = enrollments.filter((item) => item.itemType === 'course').map((item) => item.itemId);
    const examIds = enrollments.filter((item) => item.itemType === 'exam').map((item) => item.itemId);

    const [courses, exams] = await Promise.all([
      CourseModel.find({ _id: { $in: courseIds } }).lean(),
      ExamModel.find({ _id: { $in: examIds } }).lean(),
    ]);

    return ok({
      totals: {
        enrolledCourses: courseIds.length,
        enrolledExams: examIds.length,
        completedItems: enrollments.filter((item) => item.progress >= 100).length,
      },
      recentEnrollments: enrollments,
      courseCards: courses,
      examCards: exams,
    });
  } catch (error) {
    return handleError(error);
  }
}

