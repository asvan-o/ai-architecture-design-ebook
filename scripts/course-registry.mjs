import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Astro bundles this server-side module into its temporary output directory.
// Builds run from the repository root; do not resolve data relative to the bundle.
export const repositoryRoot = path.resolve(process.env.EBOOK_REPOSITORY_ROOT || process.cwd());
export const baselineCommit = 'cdc99d788b9506344872c865730cd9cf002f16ec';
const root = path.join(repositoryRoot, 'data', 'courses');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (items) => new Set(items).size === items.length;

export function validateCourseProfiles(profiles) {
  assert(unique(profiles.map((item) => item.course.courseId)), 'Duplicate courseId');
  assert(unique(profiles.map((item) => item.course.routeSlug)), 'Duplicate course route');
  for (const { course, release, pdfs } of profiles) {
    const id = course.courseId;
    assert(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(id), `Invalid courseId: ${id}`);
    assert(/^[a-z][a-z0-9-]*$/.test(course.routeSlug), `${id}: invalid routeSlug`);
    assert(!['lessons', 'downloads', 'print', 'presentation', 'instructor-console', '_astro', 'portal', 'site', 'course-overview', 'curriculum', 'ebook-downloads', 'glossary', 'guide', 'prompts', 'troubleshooting', 'updates'].includes(course.routeSlug), `${id}: reserved route`);
    assert(course.schemaVersion === 1 && release.schemaVersion === 1 && pdfs.schemaVersion === 1, `${id}: invalid schemaVersion`);
    assert(release.courseId === id && pdfs.courseId === id, `${id}: profile identity mismatch`);
    assert(['approved', 'design-pending'].includes(course.contentStatus), `${id}: invalid contentStatus`);
    assert(typeof course.regionLabel === 'string' && course.regionLabel.length > 0, `${id}: missing regionLabel`);
    assert(typeof course.siteTitle === 'string' && course.siteTitle && course.noindex === true, `${id}: missing title/noindex policy`);
    assert(course.access && typeof course.access.legacyGwangjuCompatibility === 'boolean', `${id}: missing access policy`);
    assert(course.access.passwordConfig === null || /^src\/config\/[a-z0-9_-]+\.json$/.test(course.access.passwordConfig), `${id}: unsafe password config path`);
    assert(Array.isArray(course.lessons) && Array.isArray(course.topicNumbers), `${id}: missing selection`);
    const ids = course.lessons.map((lesson) => lesson.id);
    assert(unique(ids), `${id}: duplicate lesson id`);
    assert(unique(course.lessons.map((lesson) => lesson.day)), `${id}: duplicate lesson order`);
    for (const list of [release.releasedStudentLessonIds, release.releasedPdfLessonIds]) {
      assert(Array.isArray(list) && unique(list) && list.every((lessonId) => ids.includes(lessonId)), `${id}: invalid release selection`);
    }
    assert(release.releasedPdfLessonIds.every((lessonId) => release.releasedStudentLessonIds.includes(lessonId)), `${id}: PDF outside student release`);
    assert(pdfs.policy === 'preserve-approved-artifact' || pdfs.policy === 'not-issued', `${id}: invalid PDF policy`);
    assert(Array.isArray(pdfs.lessons) && Array.isArray(pdfs.targets), `${id}: invalid PDF metadata`);
    const names = [...pdfs.lessons, ...(pdfs.course ? [pdfs.course] : [])].map((item) => item.pdfFilename);
    assert(unique(names) && names.every((name) => /^[a-z0-9_-]+\.pdf$/.test(name)), `${id}: unsafe/duplicate PDF name`);
    if (course.contentStatus === 'design-pending') {
      assert(ids.length === 0 && course.totalMinutes === null && course.baseline === null && course.topicNumbers.length === 0, `${id}: draft must not inherit curriculum`);
      assert(release.releasedStudentLessonIds.length === 0 && release.releasedPdfLessonIds.length === 0, `${id}: draft cannot release lessons`);
      assert(pdfs.lessons.length === 0 && pdfs.targets.length === 0 && pdfs.course === null && pdfs.approvedManifest === null && pdfs.policy === 'not-issued', `${id}: draft cannot issue PDFs`);
      if (course.reviewDraft !== undefined) {
        const review = course.reviewDraft;
        assert(id === 'daejeon-2026' && review?.status === 'instructor-review' && review.courseOverview === true, `${id}: invalid review draft`);
        assert(Array.isArray(review.lessons) && review.lessons.length === 1 && review.lessons[0].id === '01' && review.lessons[0].durationMinutes === 300, `${id}: review draft exceeds authorized lesson 01 scope`);
      }
    } else {
      assert(course.reviewDraft === undefined, `${id}: approved curriculum cannot carry a review draft`);
      assert(course.lessons.length > 0 && course.totalMinutes === course.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0), `${id}: duration mismatch`);
      assert(course.lessons.every((lesson, index) => lesson.day === index + 1 && lesson.title && lesson.durationMinutes > 0), `${id}: invalid lesson plan`);
      assert(course.baseline?.gitSha === baselineCommit && course.baseline?.contentRoot === 'src/content/lessons', `${id}: unsupported/unpinned content source`);
      assert(pdfs.lessons.map((item) => item.lessonId).join(',') === ids.join(','), `${id}: incomplete PDF metadata`);
      assert(pdfs.course && pdfs.approvedManifest?.sourceGitSha === baselineCommit, `${id}: PDF baseline missing`);
      const manifest = pdfs.approvedManifest;
      assert(manifest.files.length === names.length && unique(manifest.files.map((file) => file.fileName)), `${id}: PDF artifact count mismatch`);
      assert(manifest.files.every((file) => names.includes(file.fileName) && /^[a-f0-9]{64}$/.test(file.sha256) && Number.isInteger(file.sizeBytes) && file.sizeBytes > 0 && Number.isInteger(file.pageCount) && file.pageCount > 0), `${id}: invalid approved PDF artifact`);
      assert(typeof manifest.generatedAt === 'string' && !Number.isNaN(Date.parse(manifest.generatedAt)), `${id}: invalid PDF generation date`);
      assert(manifest.releasedLessonIds.join(',') === release.releasedPdfLessonIds.join(','), `${id}: approved PDF release mismatch`);
    }
  }
  return profiles;
}

export function getCourseProfiles() {
  return validateCourseProfiles(readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const directory = path.join(root, entry.name);
      const course = readJson(path.join(directory, 'course.json'));
      assert(course.courseId === entry.name, `${entry.name}: courseId/directory mismatch`);
      return { course, release: readJson(path.join(directory, 'release.json')), pdfs: readJson(path.join(directory, 'pdfs.json')) };
    }));
}

export function getCourseProfile(courseId = process.env.COURSE_ID || 'gwangju-2026') {
  const profile = getCourseProfiles().find((item) => item.course.courseId === courseId);
  assert(profile, `Unknown courseId: ${courseId}`);
  return profile;
}

export const courseOutput = (courseId, mode) => {
  getCourseProfile(courseId);
  assert(['student', 'instructor', 'pdf-review'].includes(mode), `Invalid mode: ${mode}`);
  return path.join(repositoryRoot, 'dist', courseId, mode);
};

export const courseBuildEnvironment = (profile, mode, head) => {
  const { course } = profile;
  const portalBase = (process.env.PORTAL_BASE_PATH || process.env.BASE_PATH || '/').replace(/\/+$/, '');
  return {
    ...process.env,
    COURSE_ID: course.courseId,
    PUBLIC_COURSE_ID: course.courseId,
    EBOOK_REPOSITORY_ROOT: repositoryRoot,
    EBOOK_MODE: mode,
    BUILD_TARGET: 'course',
    PORTAL_BASE_PATH: portalBase || '/',
    BASE_PATH: `${portalBase}/${course.routeSlug}`,
    PUBLIC_LECTURE_BUILD_ID: `${course.courseId}:${mode}:${head}:${createHash('sha256').update(JSON.stringify(profile)).digest('hex').slice(0, 12)}`,
    PUBLIC_BASELINE_BUILD_ID: course.baseline?.gitSha || '',
    INSTRUCTOR_CONTENT_DIR: process.env.INSTRUCTOR_CONTENT_DIR || path.join(repositoryRoot, 'instructor-content', 'courses', course.courseId, 'lessons'),
    INSTRUCTOR_PROFILE_DIR: process.env.INSTRUCTOR_PROFILE_DIR || path.join(repositoryRoot, 'instructor-content', 'courses', course.courseId, 'assets', 'profile'),
  };
};
