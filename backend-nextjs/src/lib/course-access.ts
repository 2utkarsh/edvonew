import { buildEnrollmentSnapshot, createCertificateNumber } from '@/lib/course-runtime';
import { CertificateModel } from '@/models/Certificate';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';
import { NotificationModel } from '@/models/Notification';
import { UserModel } from '@/models/User';

function resolveLearningFocus(course: any) {
  const deliveryMode = String(course?.deliveryMode || course?.delivery || 'recorded').toLowerCase();
  const hasLiveSessions = Array.isArray(course?.liveSessions) && course.liveSessions.length > 0;

  if (deliveryMode === 'live') return 'live';
  if (deliveryMode === 'hybrid' && hasLiveSessions) return 'live';
  return 'recorded';
}

function resolveLearningActionLabel(course: any) {
  return resolveLearningFocus(course) === 'live' ? 'Open live classroom' : 'Start learning';
}

export function buildLearningWorkspaceUrl(enrollmentId: string, course: any) {
  const focus = resolveLearningFocus(course);
  return `/dashboard/student/learn/${enrollmentId}?focus=${focus}`;
}

export async function grantCourseAccess({
  userId,
  course,
  paymentId,
  planName,
  amountPaid,
  currency,
  gatewayOrderId,
}: {
  userId: string;
  course: any;
  paymentId?: string;
  planName?: string;
  amountPaid?: number;
  currency?: string;
  gatewayOrderId?: string;
}) {
  const existingEnrollment = await EnrollmentModel.findOne({ userId, courseId: course._id });
  let isNewEnrollment = false;
  let enrollment = existingEnrollment;

  if (!enrollment) {
    enrollment = await EnrollmentModel.create({
      userId,
      courseId: course._id,
      status: 'active',
      paymentStatus: 'paid',
      paymentId,
      gatewayOrderId,
      planName,
      amountPaid,
      currency: currency || 'INR',
      progress: 0,
      completedLectures: [],
      moduleProgress: [],
      attendanceRecords: [],
      attendanceSummary: { totalSessions: 0, attendedSessions: 0, overallPercentage: 100 },
      performanceSummary: { averageQuizScore: 0, assignmentScore: 0, finalScore: 0, streakDays: 0, completionRate: 0 },
      participationSummary: { discussionCount: 0, questionsAsked: 0, resourcesDownloaded: 0, lastActiveAt: new Date() },
      lastAccessedAt: new Date(),
    });
    isNewEnrollment = true;
  } else {
    enrollment.paymentStatus = 'paid';
    enrollment.paymentId = paymentId as any;
    enrollment.gatewayOrderId = gatewayOrderId;
    enrollment.planName = planName;
    enrollment.amountPaid = amountPaid;
    enrollment.currency = currency || 'INR';
    enrollment.status = enrollment.status === 'refunded' ? 'active' : enrollment.status;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
  }

  const snapshot = buildEnrollmentSnapshot(course, enrollment.toObject());
  enrollment.attendanceSummary = snapshot.attendanceSummary as any;
  enrollment.performanceSummary = snapshot.performanceSummary as any;
  enrollment.participationSummary = snapshot.participationSummary as any;
  enrollment.certificateEligible = snapshot.certificateEligible;
  await enrollment.save();

  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: course._id },
  });

  if (isNewEnrollment) {
    await CourseModel.findByIdAndUpdate(course._id, { $inc: { studentsEnrolled: 1 } });
  }

  if (course.notificationSettings?.enrollmentConfirmation !== false) {
    await NotificationModel.create({
      userId,
      title: 'Course unlocked',
      message: `You now have access to ${course.title}.`,
      type: 'success',
      category: 'enrollment',
      actionUrl: buildLearningWorkspaceUrl(String(enrollment._id), course),
      actionLabel: resolveLearningActionLabel(course),
      metadata: { courseId: String(course._id), enrollmentId: String(enrollment._id) },
    });
  }

  return enrollment;
}

export async function issueCourseCertificateIfEligible({
  course,
  enrollment,
  userName,
}: {
  course: any;
  enrollment: any;
  userName: string;
}) {
  if (!course?.certificateSettings?.enabled || !enrollment) {
    return null;
  }

  const snapshot = buildEnrollmentSnapshot(course, enrollment.toObject ? enrollment.toObject() : enrollment);
  if (!snapshot.certificateEligible || enrollment.certificateId) {
    return null;
  }

  const certificate = await CertificateModel.create({
    certificateNumber: createCertificateNumber(course.title, String(enrollment.userId)),
    userId: enrollment.userId,
    courseId: course._id,
    issuedAt: new Date(),
    grade: snapshot.performanceSummary.finalScore >= 85 ? 'A' : snapshot.performanceSummary.finalScore >= 70 ? 'B' : 'C',
    score: snapshot.performanceSummary.finalScore,
    recipientName: userName,
    courseName: course.title,
    instructorName: course.instructorName,
    credentialUrl: `/certificate/${String(course._id)}/${String(enrollment.userId)}`,
    verified: true,
  });

  enrollment.certificateId = certificate._id;
  enrollment.certificateIssuedAt = new Date();
  enrollment.certificateEligible = true;
  enrollment.status = 'completed';
  enrollment.completedAt = new Date();
  await enrollment.save();

  if (course.notificationSettings?.certificateIssued !== false) {
    await NotificationModel.create({
      userId: enrollment.userId,
      title: 'Certificate issued',
      message: `Your ${course.title} certificate is ready to view.`,
      type: 'success',
      category: 'course',
      actionUrl: '/dashboard/student?tab=certificates',
      actionLabel: 'View certificate',
      metadata: { certificateId: String(certificate._id), courseId: String(course._id) },
    });
  }

  return certificate;
}