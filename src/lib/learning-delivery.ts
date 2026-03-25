export type LearningDeliveryMode = 'recorded' | 'live' | 'hybrid';

type LessonLike = {
  contentType?: string | null;
  deliveryMode?: string | null;
  videoUrl?: string | null;
  recordingUrl?: string | null;
  meetingUrl?: string | null;
};

type ModuleLike<T extends LessonLike = LessonLike> = {
  deliveryMode?: string | null;
  lectures?: T[] | null;
};

export function normalizeDeliveryMode(value?: string | null): LearningDeliveryMode {
  const normalized = (value || '').trim().toLowerCase();

  if (/(hybrid|mixed|blend|both)/.test(normalized)) {
    return 'hybrid';
  }

  if (/(live|cohort|mentor-led|mentor led|session)/.test(normalized)) {
    return 'live';
  }

  return 'recorded';
}

export function resolveLectureDeliveryMode(lecture: LessonLike): LearningDeliveryMode {
  const explicitMode = (lecture.deliveryMode || lecture.contentType || '').trim();

  if (explicitMode) {
    return normalizeDeliveryMode(explicitMode);
  }

  if (lecture.meetingUrl) {
    return 'live';
  }

  if (lecture.videoUrl || lecture.recordingUrl) {
    return 'recorded';
  }

  return 'recorded';
}

export function resolveModuleDeliveryMode<T extends LessonLike>(module: ModuleLike<T>): LearningDeliveryMode {
  const explicitMode = (module.deliveryMode || '').trim();

  if (explicitMode) {
    return normalizeDeliveryMode(explicitMode);
  }

  const modes = (module.lectures || []).map((lecture) => resolveLectureDeliveryMode(lecture));

  if (!modes.length) {
    return 'recorded';
  }

  return new Set(modes).size === 1 ? modes[0] : 'hybrid';
}

export function getDeliveryLabel(mode: LearningDeliveryMode) {
  if (mode === 'hybrid') return 'Blended';
  if (mode === 'live') return 'Live';
  return 'Recorded';
}

export function summarizeDeliveryModes<T extends LessonLike>(lectures: T[]) {
  return lectures.reduce(
    (summary, lecture) => {
      const mode = resolveLectureDeliveryMode(lecture);
      summary[mode] += 1;
      return summary;
    },
    { recorded: 0, live: 0, hybrid: 0 } as Record<LearningDeliveryMode, number>,
  );
}
