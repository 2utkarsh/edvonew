import { requireAuth } from '@/lib/auth';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { bootstrapLegacyCourseCatalog } from '@/lib/ensure-legacy-course-catalog';
import { ok, toResponse } from '@/lib/http';
import { getLegacyAdminCoursesForApi, getLegacyCategoriesForApi } from '@/lib/legacy-course-catalog-fallback';
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

function buildFallbackPayload() {
  return {
    metrics: {
      users: 0,
      courses: getLegacyAdminCoursesForApi().length,
      exams: 0,
      jobs: 0,
      enrollments: 0,
      subscriptions: 0,
      instructors: 0,
      blogs: 0,
      blogCategories: 0,
      navbars: 0,
      footers: 0,
      pages: 0,
      pageSections: 0,
      examCategories: 0,
      courseCategories: getLegacyCategoriesForApi().length,
      courseCategoryChildren: 0,
      newsletters: 0,
      contactMessages: 0,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(buildFallbackPayload()));
    }

    await connectToDatabase();
    await bootstrapLegacyCourseCatalog();

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

    return toResponse(
      ok({
        metrics: { users, courses, exams, jobs, enrollments, subscriptions, instructors, blogs, blogCategories, navbars, footers, pages, pageSections, examCategories, courseCategories, courseCategoryChildren, newsletters, contactMessages },
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Falling back to built-in admin overview metrics', error);
    return toResponse(ok(buildFallbackPayload()));
  }
}
