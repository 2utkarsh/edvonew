import crypto from 'crypto';

type AnyObject = Record<string, any>;

function asArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : [];
}

function asString(input: unknown, fallback = '') {
  return typeof input === 'string' ? input.trim() : fallback;
}

function asBoolean(input: unknown, fallback = false) {
  return typeof input === 'boolean' ? input : fallback;
}

function asNumber(input: unknown, fallback = 0) {
  const value = Number(input);
  return Number.isFinite(value) ? value : fallback;
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
}

export function buildCurriculumFromRows(rows: unknown) {
  const normalizedRows = asArray<AnyObject>(rows)
    .map((row) => ({
      subject: asString(row.subject),
      subjectDescription: asString(row.subjectDescription),
      module: asString(row.module),
      moduleDescription: asString(row.moduleDescription),
      lecture: asString(row.lecture),
      lectureDescription: asString(row.lectureDescription),
      duration: asString(row.duration),
      videoUrl: asString(row.videoUrl),
      resourceUrl: asString(row.resourceUrl),
      notes: asString(row.notes),
      isFree: asBoolean(row.isFree),
      contentType: asString(row.contentType || 'recorded') || 'recorded',
    }))
    .filter((row) => row.subject && row.module && row.lecture);

  const subjects = new Map<string, AnyObject>();

  normalizedRows.forEach((row) => {
    if (!subjects.has(row.subject)) {
      subjects.set(row.subject, {
        name: row.subject,
        description: row.subjectDescription,
        modules: [],
      });
    }

    const subject = subjects.get(row.subject)!;
    let module = subject.modules.find((item: AnyObject) => item.title === row.module);

    if (!module) {
      module = {
        label: `Module ${subject.modules.length + 1}`,
        title: row.module,
        description: row.moduleDescription,
        estimatedMinutes: 0,
        lectures: [],
      };
      subject.modules.push(module);
    }

    module.lectures.push({
      title: row.lecture,
      description: row.lectureDescription,
      duration: row.duration,
      videoUrl: row.videoUrl,
      resourceUrl: row.resourceUrl,
      notes: row.notes,
      isFree: row.isFree,
      contentType: row.contentType,
    });
  });

  return Array.from(subjects.values()).map((subject) => ({
    ...subject,
    modules: asArray<AnyObject>(subject.modules).map((module) => ({
      ...module,
      estimatedMinutes: module.lectures.reduce(
        (total: number, lecture: AnyObject) => total + estimateMinutesFromDuration(lecture.duration),
        0
      ),
    })),
  }));
}

export function flattenCurriculumRows(curriculum: unknown) {
  const rows: AnyObject[] = [];

  asArray<AnyObject>(curriculum).forEach((subject) => {
    asArray<AnyObject>(subject.modules).forEach((module) => {
      asArray<AnyObject>(module.lectures).forEach((lecture) => {
        rows.push({
          id: lecture._id || createId('lecture'),
          subject: asString(subject.name),
          subjectDescription: asString(subject.description),
          module: asString(module.title),
          moduleDescription: asString(module.description),
          lecture: asString(lecture.title),
          lectureDescription: asString(lecture.description),
          duration: asString(lecture.duration),
          videoUrl: asString(lecture.videoUrl),
          resourceUrl: asString(lecture.resourceUrl),
          notes: asString(lecture.notes),
          isFree: Boolean(lecture.isFree),
          contentType: asString(lecture.contentType || 'recorded') || 'recorded',
        });
      });
    });
  });

  return rows;
}

export function normalizeLiveSessions(sessions: unknown) {
  return asArray<AnyObject>(sessions)
    .map((session) => ({
      id: asString(session.id || session._id || createId('session')),
      title: asString(session.title),
      description: asString(session.description),
      hostName: asString(session.hostName),
      startTime: asString(session.startTime),
      endTime: asString(session.endTime),
      timezone: asString(session.timezone || 'Asia/Kolkata') || 'Asia/Kolkata',
      meetingUrl: asString(session.meetingUrl),
      recordingUrl: asString(session.recordingUrl),
      attendanceRequired: session.attendanceRequired === undefined ? true : Boolean(session.attendanceRequired),
      status: asString(session.status || 'scheduled') || 'scheduled',
    }))
    .filter((session) => session.title && session.startTime);
}

export function normalizePlans(plans: unknown) {
  return asArray<AnyObject>(plans)
    .map((plan) => ({
      name: asString(plan.name),
      price: asNumber(plan.price, 0),
      isRecommended: Boolean(plan.isRecommended),
      features: asArray<AnyObject>(plan.features)
        .map((feature) => ({
          label: asString(feature.label),
          value: asString(feature.value),
        }))
        .filter((feature) => feature.label || feature.value),
    }))
    .filter((plan) => plan.name);
}

export function normalizeSimpleItems(items: unknown, keyNames: string[]) {
  return asArray<AnyObject>(items)
    .map((item) => {
      const normalized: AnyObject = {};
      keyNames.forEach((key) => {
        normalized[key] = asString(item[key]);
      });
      return normalized;
    })
    .filter((item) => keyNames.some((key) => item[key]));
}

export function normalizeCareerPaths(items: unknown) {
  return asArray<AnyObject>(items)
    .map((item) => ({
      title: asString(item.title),
      company: asString(item.company),
      location: asString(item.location),
      type: asString(item.type),
      mode: asString(item.mode),
      salary: asString(item.salary),
      applicationUrl: asString(item.applicationUrl || item.applyUrl),
      note: asString(item.note),
    }))
    .filter((item) => item.title || item.company || item.location || item.applicationUrl);
}

export function normalizeCoursePayload(input: AnyObject) {
  const deliveryMode = asString(input.deliveryMode || input.delivery || 'recorded').toLowerCase();
  const plans = normalizePlans(input.plans);
  const liveSessions = normalizeLiveSessions(input.liveSessions);
  const curriculum =
    Array.isArray(input.curriculum) && input.curriculum.length > 0
      ? input.curriculum
      : buildCurriculumFromRows(input.curriculumRows);

  return {
    title: asString(input.title || 'Untitled Course'),
    slug: asString(input.slug),
    shortDescription: asString(input.shortDescription),
    description: asString(input.description),
    category: asString(input.category),
    level: asString(input.level || 'beginner') || 'beginner',
    status: asString(input.status || 'draft') || 'draft',
    order: asNumber(input.order, 0),
    instructorName: asString(input.instructorName),
    thumbnail: asString(input.thumbnail),
    banner: asString(input.banner),
    price: asNumber(input.price, 0),
    originalPrice: asNumber(input.originalPrice, 0) || undefined,
    discount: asNumber(input.discount, 0) || undefined,
    startDate: asString(input.startDate),
    duration: asString(input.duration),
    delivery: deliveryMode,
    deliveryMode,
    language: asString(input.language || 'English'),
    jobAssistance: Boolean(input.jobAssistance),
    bannerTag: asString(input.bannerTag),
    bannerSubtag: asString(input.bannerSubtag),
    bannerExtra: asString(input.bannerExtra),
    cohortLabel: asString(input.cohortLabel),
    supportEmail: asString(input.supportEmail),
    accessDurationMonths: asNumber(input.accessDurationMonths, 12),
    stats: {
      hiringPartners: asString(input.stats?.hiringPartners || input.hiringPartners),
      careerTransitions: asString(input.stats?.careerTransitions || input.careerTransitions),
      highestPackage: asString(input.stats?.highestPackage || input.highestPackage),
    },
    tags: asArray<string>(input.tags).map((item) => asString(item)).filter(Boolean),
    requirements: asArray<string>(input.requirements).map((item) => asString(item)).filter(Boolean),
    whatYouWillLearn: asArray<string>(input.whatYouWillLearn).map((item) => asString(item)).filter(Boolean),
    featuredOutcomes: asArray<string>(input.featuredOutcomes).map((item) => asString(item)).filter(Boolean),
    curriculum,
    liveSessions,
    mentors: normalizeSimpleItems(input.mentors, ['name', 'designation', 'company', 'experience', 'image']),
    plans,
    offerings: normalizeSimpleItems(input.offerings, ['icon', 'title']),
    careerPaths: normalizeCareerPaths(input.careerPaths),
    faqs: normalizeSimpleItems(input.faqs, ['question', 'answer']),
    testimonials: asArray<AnyObject>(input.testimonials)
      .map((item) => ({
        name: asString(item.name),
        role: asString(item.role),
        company: asString(item.company),
        quote: asString(item.quote),
        rating: asNumber(item.rating, 5),
      }))
      .filter((item) => item.name || item.quote),
    certifications: normalizeSimpleItems(input.certifications, ['name', 'provider']),
    certificateSettings: {
      enabled: input.certificateSettings?.enabled === undefined ? true : Boolean(input.certificateSettings?.enabled),
      minProgressPercentage: asNumber(input.certificateSettings?.minProgressPercentage, 100),
      minAttendancePercentage: asNumber(input.certificateSettings?.minAttendancePercentage, 70),
      minPerformanceScore: asNumber(input.certificateSettings?.minPerformanceScore, 60),
      templateName: asString(input.certificateSettings?.templateName || 'EDVO Completion Certificate'),
      badgeLabel: asString(input.certificateSettings?.badgeLabel || 'Course Graduate'),
    },
    notificationSettings: {
      enrollmentConfirmation:
        input.notificationSettings?.enrollmentConfirmation === undefined
          ? true
          : Boolean(input.notificationSettings?.enrollmentConfirmation),
      liveClassReminder:
        input.notificationSettings?.liveClassReminder === undefined
          ? true
          : Boolean(input.notificationSettings?.liveClassReminder),
      certificateIssued:
        input.notificationSettings?.certificateIssued === undefined
          ? true
          : Boolean(input.notificationSettings?.certificateIssued),
    },
  };
}

export function estimateMinutesFromDuration(duration: string) {
  const value = asString(duration).toLowerCase();
  if (!value) return 0;

  const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = value.match(/(\d+(?:\.\d+)?)\s*m/);

  const hours = hourMatch ? Number(hourMatch[1]) * 60 : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours || minutes) {
    return Math.round(hours + minutes);
  }

  const plainNumber = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(plainNumber) ? Math.round(plainNumber) : 0;
}

export function countCourseLectures(course: AnyObject) {
  return asArray<AnyObject>(course.curriculum).reduce(
    (subjectTotal, subject) =>
      subjectTotal +
      asArray<AnyObject>(subject.modules).reduce(
        (moduleTotal, module) => moduleTotal + asArray(module.lectures).length,
        0
      ),
    0
  );
}

export function deriveLiveSessionStatus(session: AnyObject, now = new Date()) {
  if (!session?.startTime) return 'scheduled';

  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date(start.getTime() + 90 * 60 * 1000);

  if (session.status && session.status !== 'scheduled') {
    return session.status;
  }

  if (now >= start && now <= end) return 'live';
  if (now > end) return 'completed';
  return 'scheduled';
}

export function calculateAttendanceSummary(course: AnyObject, enrollment: AnyObject) {
  const liveSessions = asArray<AnyObject>(course.liveSessions);
  const records = asArray<AnyObject>(enrollment.attendanceRecords);
  const attendedIds = new Set(
    records.filter((record) => record.status === 'attended').map((record) => String(record.sessionId))
  );
  const totalSessions = liveSessions.length;
  const attendedSessions = liveSessions.filter((session) => attendedIds.has(String(session._id || session.id))).length;
  const overallPercentage = totalSessions === 0 ? 100 : Math.round((attendedSessions / totalSessions) * 100);

  return {
    totalSessions,
    attendedSessions,
    overallPercentage,
  };
}

export function calculatePerformanceSummary(course: AnyObject, enrollment: AnyObject) {
  const totalLectures = countCourseLectures(course);
  const progress = Math.max(0, Math.min(100, asNumber(enrollment.progress, 0)));
  const completedLectures = asArray<string>(enrollment.completedLectures).length;
  const completionRate = totalLectures === 0 ? progress : Math.round((completedLectures / totalLectures) * 100);
  const averageQuizScore =
    enrollment.performanceSummary?.averageQuizScore !== undefined
      ? asNumber(enrollment.performanceSummary.averageQuizScore)
      : Math.max(60, Math.min(100, progress));
  const assignmentScore =
    enrollment.performanceSummary?.assignmentScore !== undefined
      ? asNumber(enrollment.performanceSummary.assignmentScore)
      : Math.max(55, Math.min(100, progress + 5));
  const finalScore =
    enrollment.performanceSummary?.finalScore !== undefined
      ? asNumber(enrollment.performanceSummary.finalScore)
      : Math.round((averageQuizScore + assignmentScore + progress) / 3);

  return {
    averageQuizScore,
    assignmentScore,
    finalScore,
    streakDays: asNumber(enrollment.performanceSummary?.streakDays, Math.max(1, Math.round(progress / 12))),
    completionRate,
  };
}

export function calculateParticipationSummary(enrollment: AnyObject) {
  const summary = enrollment.participationSummary || {};

  return {
    discussionCount: asNumber(summary.discussionCount, Math.round(asNumber(enrollment.progress, 0) / 8)),
    questionsAsked: asNumber(summary.questionsAsked, Math.round(asNumber(enrollment.progress, 0) / 10)),
    resourcesDownloaded: asNumber(summary.resourcesDownloaded, Math.round(asNumber(enrollment.progress, 0) / 5)),
    lastActiveAt: summary.lastActiveAt || enrollment.lastAccessedAt || enrollment.updatedAt || new Date(),
  };
}

export function calculateCertificateEligibility(course: AnyObject, enrollment: AnyObject) {
  const settings = course.certificateSettings || {};
  const attendance = calculateAttendanceSummary(course, enrollment);
  const performance = calculatePerformanceSummary(course, enrollment);
  const progress = asNumber(enrollment.progress, 0);

  return Boolean(settings.enabled !== false) &&
    progress >= asNumber(settings.minProgressPercentage, 100) &&
    attendance.overallPercentage >= asNumber(settings.minAttendancePercentage, 70) &&
    performance.finalScore >= asNumber(settings.minPerformanceScore, 60);
}

export function buildEnrollmentSnapshot(course: AnyObject, enrollment: AnyObject) {
  const attendanceSummary = calculateAttendanceSummary(course, enrollment);
  const performanceSummary = calculatePerformanceSummary(course, enrollment);
  const participationSummary = calculateParticipationSummary(enrollment);
  const certificateEligible = calculateCertificateEligibility(course, enrollment);
  const now = new Date();
  const nextLiveSession = normalizeLiveSessions(course.liveSessions)
    .map((session) => ({ ...session, status: deriveLiveSessionStatus(session, now) }))
    .filter((session) => session.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  return {
    attendanceSummary,
    performanceSummary,
    participationSummary,
    certificateEligible,
    nextLiveSession: nextLiveSession || null,
  };
}

export function createCertificateNumber(courseTitle: string, userId: string) {
  const slug = courseTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 6) || 'EDVO';
  const suffix = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `${slug}-${suffix}-${Date.now().toString().slice(-6)}`;
}

export function createReceipt(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}
