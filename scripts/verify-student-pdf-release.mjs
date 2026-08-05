import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const outputDirectory = path.resolve(process.argv[2] ?? 'dist');
const pdfScope = process.argv[3] ?? 'student';
const releaseConfig = JSON.parse(
  await readFile(path.resolve('data', 'student-release.json'), 'utf8'),
);
const allLessonIds = Array.from({ length: 14 }, (_, index) =>
  String(index + 1).padStart(2, '0'));
const expectedLessonIds = pdfScope === 'instructor'
  ? allLessonIds
  : releaseConfig.releasedPdfLessonIds;
const expectedLessonIdSet = new Set(expectedLessonIds);
const downloadsDirectory = path.join(outputDirectory, 'downloads');
const expectedPdfNames = [
  ...expectedLessonIds.map((lessonId) => `ai-architecture-design-lesson-${lessonId}.pdf`),
  'ai-architecture-design-course.pdf',
].sort();

if (!['student', 'instructor'].includes(pdfScope)) {
  throw new Error(`지원하지 않는 PDF 검증 범위입니다: ${pdfScope}`);
}

const sourceGitSha = (process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
  windowsHide: true,
}).trim()).toLowerCase();

const hashFile = async (filePath) => createHash('sha256')
  .update(await readFile(filePath))
  .digest('hex');

const actualPdfNames = (await readdir(downloadsDirectory))
  .filter((name) => name.toLowerCase().endsWith('.pdf'))
  .sort();
if (actualPdfNames.join('\n') !== expectedPdfNames.join('\n')) {
  throw new Error(
    `PDF 파일 목록이 승인 범위와 다릅니다. expected=${expectedPdfNames.join(', ')} actual=${actualPdfNames.join(', ')}`,
  );
}

const manifestPath = path.join(downloadsDirectory, 'pdf-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.scope !== pdfScope) {
  throw new Error(`PDF manifest scope 불일치: ${manifest.scope}/${pdfScope}`);
}
if (manifest.sourceGitSha !== sourceGitSha) {
  throw new Error(`PDF source Git SHA 불일치: ${manifest.sourceGitSha}/${sourceGitSha}`);
}
if (manifest.releasedLessonIds.join(',') !== expectedLessonIds.join(',')) {
  throw new Error('PDF manifest의 공개 차시 목록이 중앙 설정과 다릅니다.');
}
if (!Array.isArray(manifest.files) || manifest.files.length !== expectedPdfNames.length) {
  throw new Error('PDF manifest 파일 항목 수가 실제 공개 파일 수와 다릅니다.');
}

for (const file of manifest.files) {
  if (!expectedPdfNames.includes(file.fileName)) {
    throw new Error(`PDF manifest에 승인되지 않은 파일이 있습니다: ${file.fileName}`);
  }
  const actualHash = await hashFile(path.join(downloadsDirectory, file.fileName));
  if (file.sha256 !== actualHash) {
    throw new Error(`PDF SHA-256 불일치: ${file.fileName}`);
  }
  if (file.kind === 'lesson') {
    if (!file.lessonId || !expectedLessonIdSet.has(file.lessonId)) {
      throw new Error(`PDF manifest에 승인되지 않은 차시가 있습니다: ${file.lessonId}`);
    }
    if (file.lessonIds.join(',') !== file.lessonId) {
      throw new Error(`차시 PDF manifest lessonId/lessonIds 불일치: ${file.fileName}`);
    }
  }
  if (file.kind === 'course' && file.lessonIds.join(',') !== expectedLessonIds.join(',')) {
    throw new Error('전체 교안 PDF의 포함 차시가 승인 목록과 다릅니다.');
  }
}

if (pdfScope === 'student') {
  const studentHtml = [];
  for (const lessonId of releaseConfig.releasedStudentLessonIds) {
    const lessonHtmlPath = path.join(outputDirectory, 'lessons', lessonId, 'index.html');
    const html = await readFile(lessonHtmlPath, 'utf8');
    studentHtml.push(html);
    const pdfPath = `ai-architecture-design-lesson-${lessonId}.pdf`;
    const hasPdfReference = html.includes(pdfPath);
    if (hasPdfReference !== expectedLessonIdSet.has(lessonId)) {
      throw new Error(`학생 e-book PDF 링크 상태가 중앙 설정과 다릅니다: ${lessonId}`);
    }
  }

  const combinedStudentHtml = studentHtml.join('\n');
  for (const lessonId of allLessonIds) {
    if (expectedLessonIdSet.has(lessonId)) continue;
    const forbiddenPath = `ai-architecture-design-lesson-${lessonId}.pdf`;
    if (combinedStudentHtml.includes(forbiddenPath)) {
      throw new Error(`비공개 PDF 경로가 학생 HTML에 노출되었습니다: ${forbiddenPath}`);
    }
  }
}

console.log(`[pdf-release] ${pdfScope} PDF 공개 경계 검증 성공`);
console.log(`- source Git SHA: ${sourceGitSha}`);
console.log(`- lesson IDs: ${expectedLessonIds.join(', ')}`);
console.log(`- PDFs: ${actualPdfNames.join(', ')}`);
