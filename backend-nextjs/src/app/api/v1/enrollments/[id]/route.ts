import { requireAuth } from '@/lib/auth';
import { buildEnrollmentSnapshot, countCourseLectures, deriveLiveSessionStatus } from '@/lib/course-runtime';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { EnrollmentModel } from '@/models/Enrollment';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const { id } = await params;

    const enrollment = await EnrollmentModel.findOne({ _id: id, userId }).populate('courseId certificateId');
    if (!enrollment) {
      return toResponse(fail('Enrollment not found', 'NOT_FOUND', undefined, 404));
    }

    const course: any = enrollment.courseId;
    const snapshot = buildEnrollmentSnapshot(course.toObject ? course.toObject() : course, enrollment.toObject());
    const completedSet = new Set(enrollment.completedLectures || []);
    const now = new Date();

    const curriculum = Array.isArray(course.curriculum)
      ? course.curriculum.map((subject: any) => ({
          id: String(subject._id),
          name: subject.name,
          description: subject.description,
          modules: Array.isArray(subject.modules)
            ? subject.modules.map((module: any) => ({
                id: String(module._id),
                label: module.label,
                title: module.title,
                description: module.description,
                estimatedMinutes: module.estimatedMinutes,
                completedLectures: Array.isArray(module.lectures)
                  ? module.lectures.filter((lecture: any) => completedSet.has(String(lecture._id))).length
                  : 0,
                lectures: Array.isArray(module.lectures)
                  ? module.lectures.map((lecture: any) => ({
                      id: String(lecture._id),
                      title: lecture.title,
                      description: lecture.description,
                      duration: lecture.duration,
                      videoUrl: lecture.videoUrl,
                      resourceUrl: lecture.resourceUrl,
                      assetSource: lecture.assetSource,
                      assetLabel: lecture.assetLabel,
                      notes: lecture.notes,
                      isFree: lecture.isFree,
                      contentType: lecture.contentType || 'recorded',
                      completed: completedSet.has(String(lecture._id)),
                    }))
                  : [],
              }))
            : [],
        }))
      : [];

    const liveSessions = Array.isArray(course.liveSessions)
      ? course.liveSessions.map((session: any) => ({
          id: String(session._id),
          title: session.title,
          description: session.description,
          hostName: session.hostName,
          roomName: session.roomName,
          startTime: session.startTime,
          endTime: session.endTime,
          timezone: session.timezone,
          meetingUrl: deriveLiveSessionStatus(session, now) === 'live' ? session.meetingUrl : '',
          recordingUrl: session.recordingUrl,
          attendanceRequired: session.attendanceRequired,
          status: deriveLiveSessionStatus(session, now),
        }))
      : [];

    return toResponse(success({
      enrollment: {
        id: String(enrollment._id),
        progress: enrollment.progress,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        planName: enrollment.planName,
        amountPaid: enrollment.amountPaid,
        completedLectures: enrollment.completedLectures,
        totalLectures: countCourseLectures(course),
        attendance: snapshot.attendanceSummary,
        performance: snapshot.performanceSummary,
        participation: snapshot.participationSummary,
        certificateEligible: snapshot.certificateEligible,
        lastAccessedAt: enrollment.lastAccessedAt || enrollment.updatedAt,
      },
      course: {
        id: String(course._id),
        title: course.title,
        slug: course.slug,
        description: course.description,
        category: course.category,
        instructorName: course.instructorName,
        thumbnail: course.thumbnail,
        banner: course.banner,
        deliveryMode: course.deliveryMode || course.delivery || 'recorded',
        duration: course.duration,
        language: course.language,
        cohortLabel: course.cohortLabel,
        supportEmail: course.supportEmail,
        startDate: course.startDate,
        certificateSettings: course.certificateSettings,
      },
      curriculum,
      liveSessions,
      certificate: enrollment.certificateId ? {
        id: String((enrollment.certificateId as any)._id),
        certificateNumber: (enrollment.certificateId as any).certificateNumber,
        issuedAt: (enrollment.certificateId as any).issuedAt,
        credentialUrl: (enrollment.certificateId as any).credentialUrl,
      } : null,
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch enrollment', 'FETCH_ENROLLMENT_FAILED', undefined, 500));
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const auth = await requireAuth(['student']);
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const { id } = await params;
    const body = await request.json();

    const enrollment = await EnrollmentModel.findOne({ _id: id, userId }).populate('courseId');
    if (!enrollment) {
      return toResponse(fail('Enrollment not found', 'NOT_FOUND', undefined, 404));
    }

    const action = String(body.action || 'touch');
    if (action === 'join-live-session' && body.sessionId) {
      const sessionId = String(body.sessionId);
      const existing = Array.isArray(enrollment.attendanceRecords)
        ? enrollment.attendanceRecords.find((record: any) => String(record.sessionId) === sessionId)
        : null;

      if (existing) {
        existing.status = 'attended';
        existing.markedAt = new Date();
        existing.minutesPresent = existing.minutesPresent || 90;
      } else {
        enrollment.attendanceRecords.push({
          sessionId,
          status: 'attended',
          markedAt: new Date(),
          minutesPresent: 90,
        } as any);
      }
    }

    if (body.currentLectureId) {
      enrollment.currentLectureId = String(body.currentLectureId);
    }

    enrollment.lastAccessedAt = new Date();
    if (enrollment.participationSummary) {
      enrollment.participationSummary.lastActiveAt = new Date();
      enrollment.participationSummary.discussionCount = Number(enrollment.participationSummary.discussionCount || 0);
    }

    const snapshot = buildEnrollmentSnapshot((enrollment.courseId as any).toObject(), enrollment.toObject());
    enrollment.attendanceSummary = snapshot.attendanceSummary as any;
    enrollment.performanceSummary = snapshot.performanceSummary as any;
    enrollment.participationSummary = snapshot.participationSummary as any;
    enrollment.certificateEligible = snapshot.certificateEligible;
    await enrollment.save();

    return toResponse(success({
      attendance: snapshot.attendanceSummary,
      performance: snapshot.performanceSummary,
      participation: snapshot.participationSummary,
    }));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to update enrollment', 'UPDATE_ENROLLMENT_FAILED', undefined, 500));
  }
}
