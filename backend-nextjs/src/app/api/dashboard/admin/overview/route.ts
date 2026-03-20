import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { BlogCategoryModel, BlogModel } from '@/models/Blog';
import { ContactMessageModel } from '@/models/ContactMessage';
import { CourseCategoryChildModel, CourseCategoryModel } from '@/models/CourseCategory';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { ExamCategoryModel } from '@/models/ExamCategory';
import { ExamModel } from '@/models/Exam';
import { FooterModel } from '@/models/Footer';
import { InstructorModel } from '@/models/Instructor';
import { JobModel } from '@/models/Job';
import { NavbarModel } from '@/models/Navbar';
import { NewsletterModel } from '@/models/Newsletter';
import { PageModel } from '@/models/Page';
import { PageSectionModel } from '@/models/PageSection';
import { SubscriptionModel } from '@/models/Subscription';
import { UserModel } from '@/models/User';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const [users, courses, exams, jobs, enrollments, subscriptions, instructors, blogs, blogCategories, navbars, footers, pages, pageSections, examCategories, courseCategories, courseCategoryChildren, newsletters, contactMessages] = await Promise.all([
      UserModel.countDocuments(),
      CourseModel.countDocuments(),
      ExamModel.countDocuments(),
      JobModel.countDocuments(),
      EnrollmentModel.countDocuments(),
      SubscriptionModel.countDocuments(),
      InstructorModel.countDocuments(),
      BlogModel.countDocuments(),
      BlogCategoryModel.countDocuments(),
      NavbarModel.countDocuments(),
      FooterModel.countDocuments(),
      PageModel.countDocuments(),
      PageSectionModel.countDocuments(),
      ExamCategoryModel.countDocuments(),
      CourseCategoryModel.countDocuments(),
      CourseCategoryChildModel.countDocuments(),
      NewsletterModel.countDocuments(),
      ContactMessageModel.countDocuments(),
    ]);

    return ok({
      metrics: { users, courses, exams, jobs, enrollments, subscriptions, instructors, blogs, blogCategories, navbars, footers, pages, pageSections, examCategories, courseCategories, courseCategoryChildren, newsletters, contactMessages },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
