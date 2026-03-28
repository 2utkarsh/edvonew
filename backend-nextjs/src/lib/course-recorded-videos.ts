type CurriculumLectureLike = {
  title?: string;
  contentType?: string;
  videoUrl?: string;
  assetSource?: string;
  assetLabel?: string;
};

type CurriculumModuleLike = {
  title?: string;
  lectures?: CurriculumLectureLike[];
};

type CurriculumSubjectLike = {
  name?: string;
  modules?: CurriculumModuleLike[];
};

const SAMPLE_RECORDED_VIDEO_URLS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

function normalizeSegment(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeContentType(value?: string) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized || 'recorded';
}

export function buildRecordedVideoUrl(courseKey: string, lectureTitle: string, lectureIndex = 0) {
  const seed = [normalizeSegment(courseKey), normalizeSegment(lectureTitle), lectureIndex].join(':');
  const hash = hashSeed(seed);
  return SAMPLE_RECORDED_VIDEO_URLS[hash % SAMPLE_RECORDED_VIDEO_URLS.length];
}

export function fillCurriculumRecordedVideoUrls<T extends CurriculumSubjectLike[]>(
  courseKey: string,
  curriculum: T,
) {
  let recordedLectureCount = 0;
  let lecturesWithVideoCount = 0;
  let addedCount = 0;

  const nextCurriculum = (Array.isArray(curriculum) ? curriculum : []).map((subject, subjectIndex) => ({
    ...subject,
    modules: Array.isArray(subject.modules)
      ? subject.modules.map((module, moduleIndex) => ({
          ...module,
          lectures: Array.isArray(module.lectures)
            ? module.lectures.map((lecture, lectureIndex) => {
                const contentType = normalizeContentType(lecture.contentType);
                if (contentType !== 'recorded') {
                  return lecture;
                }

                recordedLectureCount += 1;

                const videoUrl = String(lecture.videoUrl || '').trim();
                if (videoUrl) {
                  lecturesWithVideoCount += 1;
                  return lecture;
                }

                lecturesWithVideoCount += 1;
                addedCount += 1;

                return {
                  ...lecture,
                  contentType,
                  videoUrl: buildRecordedVideoUrl(
                    `${courseKey}-${subject.name || subjectIndex + 1}-${module.title || moduleIndex + 1}`,
                    lecture.title || `lecture-${lectureIndex + 1}`,
                    lectureIndex,
                  ),
                  assetSource: lecture.assetSource || 'link',
                  assetLabel: lecture.assetLabel || 'Recorded lesson',
                };
              })
            : [],
        }))
      : [],
  })) as T;

  return {
    curriculum: nextCurriculum,
    recordedLectureCount,
    lecturesWithVideoCount,
    addedCount,
  };
}
