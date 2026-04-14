import { getAdminCourseDemoPayload } from '@/lib/admin-course-demo-store';
import { buildEnrollmentSnapshot } from '@/lib/course-runtime';

type AnyObject = Record<string, any>;

export type AdminReportScope = 'courses' | 'enrollments' | 'payments';

type ReportSummary = {
  totalStudents: number;
  activeStudentAccounts: number;
  enrolledStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  courseCompletions: number;
  averageProgress: number;
  averageCompletionRate: number;
  paidEnrollments: number;
  pendingFeeEnrollments: number;
  totalCollectedFees: number;
  totalRefundedFees: number;
};

export type AdminReportPayload = {
  summary: ReportSummary;
  tables: {
    courses: AnyObject[];
    enrollments: AnyObject[];
    payments: AnyObject[];
  };
  generatedAt: string;
};

function asNumber(input: unknown, fallback = 0) {
  const value = Number(input);
  return Number.isFinite(value) ? value : fallback;
}

function asString(input: unknown, fallback = '') {
  return typeof input === 'string' ? input.trim() : fallback;
}

function toId(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const objectValue = value as AnyObject;
    return String(objectValue._id || objectValue.id || '');
  }
  return String(value);
}

function toIsoDate(value: unknown) {
  if (!value) return '';
  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function sortByNewestDate<T extends AnyObject>(rows: T[], key: keyof T) {
  return [...rows].sort((left, right) => {
    const leftValue = toIsoDate(left[key]);
    const rightValue = toIsoDate(right[key]);
    return rightValue.localeCompare(leftValue);
  });
}

function normalizePaymentStatus(payment: AnyObject | null, enrollment: AnyObject | null) {
  const paymentStatus = asString(payment?.status).toLowerCase();
  const enrollmentStatus = asString(enrollment?.paymentStatus).toLowerCase();

  if (paymentStatus) return paymentStatus;
  if (enrollmentStatus === 'paid') return 'completed';
  if (enrollmentStatus) return enrollmentStatus;
  return 'pending';
}

function resolveEnrollmentAmount({
  enrollment,
  payment,
  course,
}: {
  enrollment?: AnyObject | null;
  payment?: AnyObject | null;
  course?: AnyObject | null;
}) {
  const enrollmentAmount = asNumber(enrollment?.amountPaid, NaN);
  if (!Number.isNaN(enrollmentAmount)) return enrollmentAmount;

  const paymentAmount = asNumber(payment?.amount, NaN);
  if (!Number.isNaN(paymentAmount)) return paymentAmount;

  const paymentStatus = normalizePaymentStatus(payment || null, enrollment || null);
  if (paymentStatus === 'completed' || paymentStatus === 'authorized') {
    return asNumber(course?.price, 0);
  }

  return 0;
}

function defaultSnapshot(progress = 0) {
  return {
    attendanceSummary: {
      totalSessions: 0,
      attendedSessions: 0,
      overallPercentage: 100,
    },
    performanceSummary: {
      averageQuizScore: Math.max(0, Math.min(100, progress)),
      assignmentScore: Math.max(0, Math.min(100, progress)),
      finalScore: Math.max(0, Math.min(100, progress)),
      streakDays: 0,
      completionRate: Math.max(0, Math.min(100, progress)),
    },
    participationSummary: {
      discussionCount: 0,
      questionsAsked: 0,
      resourcesDownloaded: 0,
      lastActiveAt: undefined,
    },
    certificateEligible: false,
  };
}

function buildSafeEnrollmentSnapshot(course: AnyObject | null, enrollment: AnyObject) {
  const progress = asNumber(enrollment?.progress, 0);
  if (!course) {
    return defaultSnapshot(progress);
  }

  try {
    return buildEnrollmentSnapshot(course, enrollment);
  } catch (_error) {
    return defaultSnapshot(progress);
  }
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const normalized = String(value).replace(/\r?\n|\r/g, ' ').trim();
  return /[",]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function getRowsForScope(payload: AdminReportPayload, scope: AdminReportScope) {
  if (scope === 'courses') return payload.tables.courses;
  if (scope === 'payments') return payload.tables.payments;
  return payload.tables.enrollments;
}

export function buildAdminReportCsv(payload: AdminReportPayload, scope: AdminReportScope) {
  const rows = getRowsForScope(payload, scope);
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','));
  return [headers.join(','), ...lines].join('\n');
}

export function buildAdminReportFallbackPayload(): AdminReportPayload {
  const { courses } = getAdminCourseDemoPayload();
  const generatedAt = new Date().toISOString();

  const courseRows = courses
    .map((course) => {
      const totalEnrollments = asNumber(course.studentMetrics?.totalStudents, asNumber(course.studentsEnrolled, 0));
      const averageProgress = asNumber(course.studentMetrics?.averageProgress, 0);
      const listedFee = asNumber(course.price, 0);

      return {
        courseId: toId(course._id || course.id),
        courseTitle: asString(course.title, 'Untitled Course'),
        category: asString(course.category, 'General'),
        listedFee,
        totalEnrollments,
        activeEnrollments: totalEnrollments,
        completedEnrollments: 0,
        refundedEnrollments: 0,
        paidEnrollments: totalEnrollments,
        pendingFeeEnrollments: 0,
        averageProgress,
        averageCompletionRate: averageProgress,
        totalCollectedFees: listedFee * totalEnrollments,
        totalRefundedFees: 0,
        lastEnrollmentAt: '',
      };
    })
    .sort((left, right) => {
      if (right.totalEnrollments !== left.totalEnrollments) {
        return right.totalEnrollments - left.totalEnrollments;
      }
      return left.courseTitle.localeCompare(right.courseTitle);
    });

  const totalEnrollments = courseRows.reduce((sum, row) => sum + row.totalEnrollments, 0);
  const totalCollectedFees = courseRows.reduce((sum, row) => sum + row.totalCollectedFees, 0);

  return {
    summary: {
      totalStudents: totalEnrollments,
      activeStudentAccounts: totalEnrollments,
      enrolledStudents: totalEnrollments,
      totalCourses: courseRows.length,
      totalEnrollments,
      courseCompletions: 0,
      averageProgress:
        totalEnrollments > 0
          ? round(courseRows.reduce((sum, row) => sum + row.averageProgress * row.totalEnrollments, 0) / totalEnrollments)
          : 0,
      averageCompletionRate:
        totalEnrollments > 0
          ? round(courseRows.reduce((sum, row) => sum + row.averageCompletionRate * row.totalEnrollments, 0) / totalEnrollments)
          : 0,
      paidEnrollments: totalEnrollments,
      pendingFeeEnrollments: 0,
      totalCollectedFees,
      totalRefundedFees: 0,
    },
    tables: {
      courses: courseRows,
      enrollments: [],
      payments: [],
    },
    generatedAt,
  };
}

export function buildAdminReportPayload({
  students,
  courses,
  enrollments,
  payments,
}: {
  students: AnyObject[];
  courses: AnyObject[];
  enrollments: AnyObject[];
  payments: AnyObject[];
}): AdminReportPayload {
  const generatedAt = new Date().toISOString();
  const courseById = new Map<string, AnyObject>();
  const paymentById = new Map<string, AnyObject>();
  const courseAggregates = new Map<string, AnyObject>();

  courses.forEach((course) => {
    const courseId = toId(course._id || course.id);
    if (!courseId) return;

    courseById.set(courseId, course);
    courseAggregates.set(courseId, {
      courseId,
      courseTitle: asString(course.title, 'Untitled Course'),
      category: asString(course.category, 'General'),
      listedFee: asNumber(course.price, 0),
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      refundedEnrollments: 0,
      paidEnrollments: 0,
      pendingFeeEnrollments: 0,
      averageProgressAccumulator: 0,
      averageCompletionAccumulator: 0,
      averageProgress: 0,
      averageCompletionRate: 0,
      totalCollectedFees: 0,
      totalRefundedFees: 0,
      lastEnrollmentAt: '',
    });
  });

  payments.forEach((payment) => {
    paymentById.set(toId(payment._id || payment.id), payment);
  });

  const enrollmentRows = enrollments.map((enrollment) => {
    const courseId = toId(enrollment.courseId);
    const course = courseById.get(courseId) || null;
    const user = (enrollment.userId as AnyObject) || {};
    const payment = paymentById.get(toId(enrollment.paymentId)) || null;
    const snapshot = buildSafeEnrollmentSnapshot(course, enrollment);
    const progress = asNumber(enrollment.progress, 0);
    const completionRate = asNumber(snapshot.performanceSummary?.completionRate, progress);
    const amountPaid = resolveEnrollmentAmount({ enrollment, payment, course });
    const paymentStatus = normalizePaymentStatus(payment, enrollment);
    const isCompleted =
      asString(enrollment.status).toLowerCase() === 'completed' ||
      progress >= 100 ||
      completionRate >= 100;
    const isRefunded =
      asString(enrollment.status).toLowerCase() === 'refunded' || paymentStatus === 'refunded';
    const isPaid = paymentStatus === 'completed' || paymentStatus === 'authorized';
    const isPendingFee =
      !isPaid &&
      !isRefunded &&
      (paymentStatus === 'pending' || asNumber(course?.price, 0) > 0 || amountPaid > 0);

    const row = {
      enrollmentId: toId(enrollment._id || enrollment.id),
      studentId: toId(user._id || user.id || enrollment.userId),
      studentName: asString(user.name, 'Student'),
      studentEmail: asString(user.email),
      studentMobile: asString(user.mobile),
      courseId,
      courseTitle: asString(course?.title, asString(enrollment.courseTitle, 'Unknown Course')),
      category: asString(course?.category, 'General'),
      listedFee: asNumber(course?.price, 0),
      planName: asString(enrollment.planName),
      amountPaid,
      paymentStatus,
      enrollmentStatus: asString(enrollment.status, 'active'),
      progress: round(progress),
      completionRate: round(completionRate),
      attendancePercentage: round(asNumber(snapshot.attendanceSummary?.overallPercentage, 100)),
      finalScore: round(asNumber(snapshot.performanceSummary?.finalScore, progress)),
      certificateEligible: Boolean(snapshot.certificateEligible),
      isCompleted,
      enrolledAt: toIsoDate(enrollment.enrolledAt || enrollment.createdAt),
      completedAt: toIsoDate(enrollment.completedAt),
      lastAccessedAt: toIsoDate(enrollment.lastAccessedAt || enrollment.updatedAt),
    };

    const aggregate =
      courseAggregates.get(courseId) ||
      {
        courseId,
        courseTitle: row.courseTitle,
        category: row.category,
        listedFee: row.listedFee,
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        refundedEnrollments: 0,
        paidEnrollments: 0,
        pendingFeeEnrollments: 0,
        averageProgressAccumulator: 0,
        averageCompletionAccumulator: 0,
        averageProgress: 0,
        averageCompletionRate: 0,
        totalCollectedFees: 0,
        totalRefundedFees: 0,
        lastEnrollmentAt: '',
      };

    aggregate.totalEnrollments += 1;
    aggregate.averageProgressAccumulator += row.progress;
    aggregate.averageCompletionAccumulator += row.completionRate;

    if (row.enrollmentStatus === 'active') aggregate.activeEnrollments += 1;
    if (isCompleted) aggregate.completedEnrollments += 1;
    if (isRefunded) aggregate.refundedEnrollments += 1;
    if (isPaid) {
      aggregate.paidEnrollments += 1;
      aggregate.totalCollectedFees += amountPaid;
    }
    if (isPendingFee) aggregate.pendingFeeEnrollments += 1;
    if (isRefunded) aggregate.totalRefundedFees += amountPaid;
    if (row.enrolledAt && row.enrolledAt > aggregate.lastEnrollmentAt) {
      aggregate.lastEnrollmentAt = row.enrolledAt;
    }

    courseAggregates.set(courseId, aggregate);

    return row;
  });

  const courseRows = Array.from(courseAggregates.values())
    .map((aggregate) => {
      const averageProgress =
        aggregate.totalEnrollments > 0
          ? round(aggregate.averageProgressAccumulator / aggregate.totalEnrollments)
          : 0;
      const averageCompletionRate =
        aggregate.totalEnrollments > 0
          ? round(aggregate.averageCompletionAccumulator / aggregate.totalEnrollments)
          : 0;

      return {
        courseId: aggregate.courseId,
        courseTitle: aggregate.courseTitle,
        category: aggregate.category,
        listedFee: aggregate.listedFee,
        totalEnrollments: aggregate.totalEnrollments,
        activeEnrollments: aggregate.activeEnrollments,
        completedEnrollments: aggregate.completedEnrollments,
        refundedEnrollments: aggregate.refundedEnrollments,
        paidEnrollments: aggregate.paidEnrollments,
        pendingFeeEnrollments: aggregate.pendingFeeEnrollments,
        averageProgress,
        averageCompletionRate,
        totalCollectedFees: round(aggregate.totalCollectedFees, 2),
        totalRefundedFees: round(aggregate.totalRefundedFees, 2),
        lastEnrollmentAt: aggregate.lastEnrollmentAt,
      };
    })
    .sort((left, right) => {
      if (right.totalEnrollments !== left.totalEnrollments) {
        return right.totalEnrollments - left.totalEnrollments;
      }
      if (right.totalCollectedFees !== left.totalCollectedFees) {
        return right.totalCollectedFees - left.totalCollectedFees;
      }
      return left.courseTitle.localeCompare(right.courseTitle);
    });

  const paymentRows = sortByNewestDate(
    payments
      .filter((payment) => asString(payment.purpose, 'course') === 'course')
      .map((payment) => {
        const courseId = toId(payment.courseId);
        const course = courseById.get(courseId) || null;
        const user = (payment.userId as AnyObject) || {};

        return {
          paymentId: toId(payment._id || payment.id),
          transactionId: asString(payment.transactionId),
          studentId: toId(user._id || user.id || payment.userId),
          studentName: asString(user.name, payment.customerName || 'Student'),
          studentEmail: asString(user.email, payment.customerEmail || ''),
          courseId,
          courseTitle: asString(course?.title, payment.courseTitle || 'Unknown Course'),
          amount: round(asNumber(payment.amount, 0), 2),
          currency: asString(payment.currency, 'INR'),
          paymentStatus: normalizePaymentStatus(payment, null),
          paymentMethod: asString(payment.paymentMethod, 'manual'),
          provider: asString(payment.provider, 'manual'),
          createdAt: toIsoDate(payment.createdAt),
          refundedAt: toIsoDate(payment.refundedAt),
        };
      }),
    'createdAt',
  );

  const enrolledStudentIds = new Set(
    enrollmentRows.map((row) => row.studentId).filter(Boolean),
  );
  const totalCollectedFees = courseRows.reduce((sum, row) => sum + row.totalCollectedFees, 0);
  const totalRefundedFees = courseRows.reduce((sum, row) => sum + row.totalRefundedFees, 0);
  const averageProgress =
    enrollmentRows.length > 0
      ? round(enrollmentRows.reduce((sum, row) => sum + row.progress, 0) / enrollmentRows.length)
      : 0;
  const averageCompletionRate =
    enrollmentRows.length > 0
      ? round(enrollmentRows.reduce((sum, row) => sum + row.completionRate, 0) / enrollmentRows.length)
      : 0;

  return {
    summary: {
      totalStudents: students.length,
      activeStudentAccounts: students.filter((student) => student.isActive !== false).length,
      enrolledStudents: enrolledStudentIds.size,
      totalCourses: courses.length,
      totalEnrollments: enrollmentRows.length,
      courseCompletions: enrollmentRows.filter((row) => row.isCompleted).length,
      averageProgress,
      averageCompletionRate,
      paidEnrollments: enrollmentRows.filter((row) => row.paymentStatus === 'completed' || row.paymentStatus === 'authorized').length,
      pendingFeeEnrollments: enrollmentRows.filter((row) => row.paymentStatus === 'pending').length,
      totalCollectedFees: round(totalCollectedFees, 2),
      totalRefundedFees: round(totalRefundedFees, 2),
    },
    tables: {
      courses: courseRows,
      enrollments: sortByNewestDate(enrollmentRows, 'enrolledAt'),
      payments: paymentRows,
    },
    generatedAt,
  };
}
