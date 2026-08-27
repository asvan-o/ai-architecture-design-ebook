import pdfManifest from '../../data/lesson-pdf-manifest.json';

const normalizeLessonId = (lessonId: string | number) => String(lessonId).padStart(2, '0');

export interface LessonPdfMetadata {
  lessonId: string;
  pdfUpdatedAt: string;
  pdfFilename: string;
}

export const lessonPdfMetadata = Object.freeze(
  pdfManifest.lessons.map((item) => Object.freeze({ ...item })),
);

const lessonPdfMap = new Map(lessonPdfMetadata.map((item) => [item.lessonId, item]));

export const getLessonPdfMetadata = (lessonId: string | number) =>
  lessonPdfMap.get(normalizeLessonId(lessonId));

export const coursePdfMetadata = Object.freeze({ ...pdfManifest.course });

export const formatPdfUpdatedAt = (value: string) => value.replaceAll('-', '.');

export const latestPdfUpdatedAt = lessonPdfMetadata
  .map((item) => item.pdfUpdatedAt)
  .sort()
  .at(-1) ?? coursePdfMetadata.pdfUpdatedAt;
