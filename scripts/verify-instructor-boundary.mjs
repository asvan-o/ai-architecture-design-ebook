import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [mode, outputDirectory] = process.argv.slice(2);
if (!['student', 'instructor'].includes(mode) || !outputDirectory) {
  console.error('사용법: node scripts/verify-instructor-boundary.mjs <student|instructor> <output>');
  process.exit(1);
}

const outputPath = path.resolve(outputDirectory);
const studentRelease = JSON.parse(
  await readFile(path.resolve('data', 'student-release.json'), 'utf8'),
);
const releasedStudentLessonIds = new Set(studentRelease.releasedStudentLessonIds);
const privateNoteDirectory = path.resolve(
  process.env.INSTRUCTOR_CONTENT_DIR ?? path.join('instructor-content', 'lessons'),
);
const requiredSlotsByLesson = {
  '01': ['l01-opening', 'l01-generative-ai', 'l01-ai-human-role', 'l01-before-gemini-demo', 'l01-after-gemini-response', 'l01-response-analysis', 'l01-fallback-response', 'l01-student-practice', 'l01-answer-key', 'l01-closing'],
  '02': ['l02-opening', 'l02-timing', 'l02-first-result-criteria', 'l02-revision-demo', 'l02-empty-space-practice', 'l02-fallback', 'l02-common-errors', 'l02-next-lesson'],
  '03': ['l03-opening', 'l03-timing', 'l03-evidence-priority', 'l03-requirement-matrix', 'l03-client-questions', 'l03-gemini-compare', 'l03-fallback', 'l03-design-brief', 'l03-image-mismatch', 'l03-next-lesson'],
  '04': ['l04-opening', 'l04-timing', 'l04-alternative-difference', 'l04-evaluation', 'l04-tool-selection', 'l04-node-install', 'l04-manager-demo', 'l04-fallback', 'l04-local-errors', 'l04-final-check'],
};
const privateNotePaths = Object.keys(requiredSlotsByLesson)
  .map((lessonId) => path.join(privateNoteDirectory, `${lessonId}.yaml`));

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  }));
  return nested.flat();
};

const normalizeText = (source) =>
  source
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();

const parsePrivateBodies = (source) => {
  const bodies = [];
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s{4}body:\s*\|\s*$/.test(lines[index])) continue;
    const bodyLines = [];
    index += 1;
    while (index < lines.length && !/^\s{2}- slot:/.test(lines[index])) {
      if (lines[index].startsWith('      ')) bodyLines.push(lines[index].slice(6));
      index += 1;
    }
    index -= 1;
    const body = normalizeText(bodyLines.join('\n'));
    if (body) bodies.push(body);
  }
  return bodies;
};

const readDeckManifest = (source, deckId) => {
  const escapedDeckId = deckId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`<script type="application/json" data-deck-manifest="${escapedDeckId}">([^<]+)</script>`));
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const files = await collectFiles(outputPath);
const textFiles = files
  .filter((filePath) => /\.(?:html|js|mjs|css|json|map|txt|xml)$/i.test(filePath));
const yamlFiles = files.filter((filePath) => /\.ya?ml$/i.test(filePath));
const combinedSource = (await Promise.all(textFiles.map((filePath) => readFile(filePath, 'utf8'))))
  .join('\n');
const clientScriptSource = (
  await Promise.all(
    textFiles
      .filter((filePath) => /\.(?:js|mjs|map)$/i.test(filePath))
      .map((filePath) => readFile(filePath, 'utf8')),
  )
).join('\n');
const normalizedOutput = normalizeText(combinedSource);
const normalizedClientScripts = normalizeText(clientScriptSource);
const privateNoteSources = new Map();
for (const privateNotePath of privateNotePaths) {
  if (existsSync(privateNotePath)) {
    privateNoteSources.set(privateNotePath, await readFile(privateNotePath, 'utf8'));
  }
}
const privateBodies = [...privateNoteSources.values()].flatMap(parsePrivateBodies);

const errors = [];
const instructorConsolePath = path.join(outputPath, 'instructor-console');
const presentationPath = path.join(outputPath, 'presentation');
const presenterOnlyMarkers = [
  'ai-architecture-presenter',
  'data-presenter-console',
  'INSTRUCTOR CONSOLE · LOCAL ONLY',
  '프로젝터 화면 열기',
  '현재 섹션에 등록된 강사 메모가 없습니다.',
  '/instructor-console/lessons/',
  '/presentation/lessons/',
  'instructor-content/',
  'ai-architecture-slide-overrides-v1',
  'data-quick-edit',
  'LOCAL QUICK EDIT',
  'instructor-introduction',
  'data-instructor-introduction',
  'lecture-start',
  'data-deck-first-lesson',
  '주요 경력 및 전시·프로젝트',
  '힐꼼의 이중생활',
  'Bambeol Brew & Bloom',
  'instructor-assets/profile',
  'ai-architecture-instructor-progress-v1',
  'data-instructor-progress',
  'completedCheckpoints',
  'checkpointOverrides',
  '시간 운영 기록 JSON',
];

if (mode === 'student') {
  if (existsSync(instructorConsolePath) || existsSync(presentationPath)) {
    errors.push('학생용 결과물에 강사 콘솔 또는 로컬 프레젠테이션 route가 포함됐습니다.');
  }
  for (const marker of presenterOnlyMarkers) {
    if (combinedSource.includes(marker)) {
      errors.push(`학생용 결과물에 발표자 모드 전용 문자열이 포함됐습니다: ${marker}`);
    }
  }
  if (yamlFiles.length > 0) {
    errors.push('학생용 결과물에 YAML 파일이 포함됐습니다.');
  }
  if (combinedSource.includes('data-instructor-note-slot')) {
    errors.push('학생용 결과물에 강사 메모 슬롯 마커가 포함됐습니다.');
  }
  if (
    combinedSource.includes('INSTRUCTOR ONLY · LOCAL BUILD') ||
    combinedSource.includes('class="instructor-note"')
  ) {
    errors.push('학생용 결과물에 강사 전용 UI가 포함됐습니다.');
  }
  if (combinedSource.includes('이 슬롯의 로컬 강사 메모가 없습니다.')) {
    errors.push('학생용 결과물에 강사 메모 누락 안내가 포함됐습니다.');
  }
  if (
    combinedSource.includes('data-instructor-note-template') ||
    combinedSource.includes('INSTRUCTOR_NOTE_SLOT')
  ) {
    errors.push('학생용 결과물에 빌드 전 강사 메모 슬롯 템플릿이 남아 있습니다.');
  }
  for (const body of privateBodies) {
    if (normalizedOutput.includes(body)) {
      errors.push('학생용 결과물에 로컬 강사 메모 본문이 포함됐습니다.');
      break;
    }
  }
  for (let day = 1; day <= 14; day += 1) {
    const lessonId = String(day).padStart(2, '0');
    const shouldExist = releasedStudentLessonIds.has(lessonId);
    const lessonPath = path.join(outputPath, 'lessons', lessonId, 'index.html');
    const printPath = path.join(outputPath, 'print', 'lessons', lessonId, 'index.html');
    if (existsSync(lessonPath) !== shouldExist) {
      errors.push(`학생용 제${day}차시 route 공개 상태가 중앙 설정과 다릅니다.`);
    }
    if (existsSync(printPath) !== shouldExist) {
      errors.push(`학생용 제${day}차시 인쇄 route 공개 상태가 중앙 설정과 다릅니다.`);
    }
    if (!shouldExist) {
      const lessonLinkPattern = new RegExp(`href=["'][^"']*/lessons/${lessonId}/?["']`);
      if (lessonLinkPattern.test(combinedSource)) {
        errors.push(`학생용 결과물에 비공개 제${day}차시 직접 링크가 포함됐습니다.`);
      }
    }
  }
  const coursePrintPath = path.join(outputPath, 'print', 'course', 'index.html');
  const coursePrintSource = existsSync(coursePrintPath)
    ? await readFile(coursePrintPath, 'utf8')
    : '';
  for (let day = 1; day <= 14; day += 1) {
    const lessonId = String(day).padStart(2, '0');
    const shouldExist = releasedStudentLessonIds.has(lessonId);
    const markerExists = coursePrintSource.includes(`data-print-lesson-id="${lessonId}"`);
    if (markerExists !== shouldExist) {
      errors.push(`학생용 전체 교안의 제${day}차시 포함 상태가 중앙 설정과 다릅니다.`);
    }
  }
} else {
  const introductionConsolePath = path.join(outputPath, 'instructor-console', 'instructor-introduction', 'index.html');
  const introductionPresentationPath = path.join(outputPath, 'presentation', 'instructor-introduction', 'index.html');
  const lectureStartConsolePath = path.join(outputPath, 'instructor-console', 'lecture-start', 'index.html');
  const lectureStartPresentationPath = path.join(outputPath, 'presentation', 'lecture-start', 'index.html');
  const profileAssetPath = path.join(outputPath, 'instructor-assets', 'profile', '오경식.jpg');
  const logoAssetPath = path.join(outputPath, 'instructor-assets', 'profile', 'inforest-logo.png');
  for (const requiredPath of [lectureStartConsolePath, lectureStartPresentationPath, introductionConsolePath, introductionPresentationPath, profileAssetPath, logoAssetPath]) {
    if (!existsSync(requiredPath)) errors.push(`강사용 결과물에 필수 강사 소개 파일이 없습니다: ${requiredPath}`);
  }
  const portfolioFiles = files.filter((filePath) => /(?:포폴|portfolio).*\.pdf$/i.test(filePath));
  if (portfolioFiles.length > 0) errors.push('강사용 결과물에 포트폴리오 PDF가 포함됐습니다.');
  if (yamlFiles.length > 0) {
    errors.push('강사용 정적 결과물에 원본 YAML 파일이 포함됐습니다.');
  }
  if (
    combinedSource.includes('data-instructor-note-template') ||
    combinedSource.includes('INSTRUCTOR_NOTE_SLOT')
  ) {
    errors.push('강사용 결과물에 변환되지 않은 강사 메모 슬롯 템플릿이 남아 있습니다.');
  }
  for (let day = 1; day <= 14; day += 1) {
    const lessonId = String(day).padStart(2, '0');
    const lessonPath = path.join(outputPath, 'lessons', lessonId, 'index.html');
    if (!existsSync(lessonPath)) {
      errors.push(`강사용 결과물에 제${day}차시 페이지가 없습니다.`);
      continue;
    }
    if (requiredSlotsByLesson[lessonId]) {
      const lessonSource = await readFile(lessonPath, 'utf8');
      const actualSlots = lessonSource.match(/data-instructor-note-slot="[^"]+"/g) ?? [];
      if (actualSlots.length !== requiredSlotsByLesson[lessonId].length) {
        errors.push(`강사용 제${day}차시 메모 슬롯 수가 다릅니다: 예상 ${requiredSlotsByLesson[lessonId].length}개, 실제 ${actualSlots.length}개`);
      }
      for (const slot of requiredSlotsByLesson[lessonId]) {
        if (!lessonSource.includes(`data-instructor-note-slot="${slot}"`)) {
          errors.push(`강사용 제${day}차시에 메모 슬롯 ${slot}이 없습니다.`);
        }
      }
    }
  }
  for (let day = 1; day <= 14; day += 1) {
    const lessonId = String(day).padStart(2, '0');
    const consolePath = path.join(
      outputPath,
      'instructor-console',
      'lessons',
      lessonId,
      'index.html',
    );
    const localPresentationPath = path.join(
      outputPath,
      'presentation',
      'lessons',
      lessonId,
      'index.html',
    );
    if (!existsSync(consolePath)) {
      errors.push(`강사용 결과물에 제${day}차시 강사 콘솔이 없습니다.`);
    }
    if (!existsSync(localPresentationPath)) {
      errors.push(`강사용 결과물에 제${day}차시 프레젠테이션 화면이 없습니다.`);
    }
  }

  const manifestTargets = [
    {
      deckId: 'lecture-start',
      consolePath: path.join(outputPath, 'instructor-console', 'lecture-start', 'index.html'),
      presentationPath: path.join(outputPath, 'presentation', 'lecture-start', 'index.html'),
    },
    {
      deckId: 'instructor-introduction',
      consolePath: path.join(outputPath, 'instructor-console', 'instructor-introduction', 'index.html'),
      presentationPath: path.join(outputPath, 'presentation', 'instructor-introduction', 'index.html'),
    },
    {
      deckId: 'course-overview',
      consolePath: path.join(outputPath, 'instructor-console', 'course-overview', 'index.html'),
      presentationPath: path.join(outputPath, 'presentation', 'course-overview', 'index.html'),
    },
    ...Array.from({ length: 14 }, (_, index) => {
      const lessonId = String(index + 1).padStart(2, '0');
      return {
        deckId: `lesson-${lessonId}`,
        consolePath: path.join(outputPath, 'instructor-console', 'lessons', lessonId, 'index.html'),
        presentationPath: path.join(outputPath, 'presentation', 'lessons', lessonId, 'index.html'),
      };
    }),
  ];
  for (const target of manifestTargets) {
    if (!existsSync(target.consolePath) || !existsSync(target.presentationPath)) continue;
    const [consoleSource, presentationSource] = await Promise.all([
      readFile(target.consolePath, 'utf8'),
      readFile(target.presentationPath, 'utf8'),
    ]);
    const consoleManifest = readDeckManifest(consoleSource, target.deckId);
    const presentationManifest = readDeckManifest(presentationSource, target.deckId);
    if (!consoleManifest || !presentationManifest) {
      errors.push(`${target.deckId}: 고정 slide manifest가 양쪽 화면에 없습니다.`);
      continue;
    }
    if (JSON.stringify(consoleManifest) !== JSON.stringify(presentationManifest)) {
      errors.push(`${target.deckId}: 강사 콘솔과 프로젝터의 slide manifest가 다릅니다.`);
      continue;
    }
    const slides = consoleManifest.slides ?? [];
    const ids = slides.map((slide) => slide.id);
    if (
      consoleManifest.schemaVersion !== 1
      || consoleManifest.deckId !== target.deckId
      || consoleManifest.referenceViewport?.width !== 1280
      || consoleManifest.referenceViewport?.height !== 720
      || ids.length === 0
      || new Set(ids).size !== ids.length
      || slides.some((slide, slideIndex) => slide.slideIndex !== slideIndex)
    ) errors.push(`${target.deckId}: 고정 slide manifest 식별자 또는 순서가 올바르지 않습니다.`);
  }

  for (const [lessonId, requiredSlots] of Object.entries(requiredSlotsByLesson)) {
    const consolePath = path.join(outputPath, 'instructor-console', 'lessons', lessonId, 'index.html');
    const consoleSource = existsSync(consolePath) ? await readFile(consolePath, 'utf8') : '';
    const consoleSlots = consoleSource.match(/data-instructor-note-slot="[^"]+"/g) ?? [];
    if (consoleSlots.length !== requiredSlots.length) {
      errors.push(`강사용 제${Number(lessonId)}차시 콘솔 메모 슬롯 수가 다릅니다: 예상 ${requiredSlots.length}개, 실제 ${consoleSlots.length}개`);
    }
  }

  if (existsSync(presentationPath)) {
    const presentationFiles = (await collectFiles(presentationPath))
      .filter((filePath) => filePath.endsWith('.html'));
    const presentationSource = (
      await Promise.all(presentationFiles.map((filePath) => readFile(filePath, 'utf8')))
    ).join('\n');
    if (
      presentationSource.includes('data-instructor-note-slot') ||
      presentationSource.includes('INSTRUCTOR ONLY · LOCAL BUILD') ||
      presentationSource.includes('INSTRUCTOR_NOTE_SLOT') ||
      presentationSource.includes('data-instructor-progress') ||
      presentationSource.includes('ai-architecture-instructor-progress-v1') ||
      presentationSource.includes('completedCheckpoints') ||
      presentationSource.includes('checkpointOverrides')
    ) {
      errors.push('프레젠테이션 화면에 강사 메모 또는 메모 슬롯이 포함됐습니다.');
    }
    if (
      presentationSource.includes('class="lesson-asset"') ||
      presentationSource.includes('data-asset-id=')
    ) {
      errors.push('프레젠테이션 화면에 자산 관리 카드가 포함됐습니다.');
    }
    for (const body of privateBodies) {
      if (normalizeText(presentationSource).includes(body)) {
        errors.push('프레젠테이션 화면에 로컬 강사 메모 본문이 포함됐습니다.');
        break;
      }
    }
  }
  if (privateBodies.length > 0) {
    for (const body of privateBodies) {
      if (!normalizedOutput.includes(body)) {
        errors.push('강사용 결과물에 로컬 강사 메모 본문 일부가 누락됐습니다.');
        break;
      }
      if (normalizedClientScripts.includes(body)) {
        errors.push('강사용 client JavaScript에 로컬 강사 메모 본문이 포함됐습니다.');
        break;
      }
    }
  }
}

for (const privateNotePath of privateNotePaths) {
  if (!existsSync(privateNotePath)) {
    if (mode === 'instructor') {
      errors.push(`로컬 강사 메모 파일이 없습니다: ${privateNotePath}`);
    }
    continue;
  }
  const source = privateNoteSources.get(privateNotePath) ?? '';
  if (mode === 'instructor') {
    const lessonId = path.basename(privateNotePath, '.yaml');
    const actualSlots = [...source.matchAll(/^\s{2}- slot:\s*"([^"]+)"\s*$/gm)].map((match) => match[1]);
    const requiredSlots = requiredSlotsByLesson[lessonId] ?? [];
    if (actualSlots.length !== requiredSlots.length || requiredSlots.some((slot) => !actualSlots.includes(slot))) {
      errors.push(`로컬 제${Number(lessonId)}차시 YAML 슬롯 ID가 코드 정의와 일치하지 않습니다.`);
    }
  }
  try {
    execFileSync('git', ['check-ignore', '--quiet', privateNotePath], { stdio: 'ignore' });
  } catch {
    errors.push('실제 강사 메모 파일이 .gitignore로 제외되지 않았습니다.');
  }
}

if (errors.length > 0) {
  console.error(`${mode} 빌드 강사 메모 경계 검사 실패`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`${mode} 빌드 강사 메모 경계 검사 성공`);
if (mode === 'student') {
  if (privateNoteSources.size === 0) {
    console.log('- CI/공개 학생 빌드: 로컬 강사 메모 파일 부재 허용');
  } else {
    console.log('- 로컬 강사 메모 본문 유출 검사 완료');
    console.log('- 실제 강사 메모 파일 Git 제외 확인');
  }
  console.log('- 학생용 결과물에 강사 메모 슬롯·UI·누락 안내·본문·YAML 파일 없음');
} else {
  console.log('- 제1–4차시 강사 메모 슬롯 38개와 로컬 YAML ID 일치');
  console.log('- 제1–14차시 정적 페이지 존재');
  console.log('- 제1–14차시 강사 콘솔·프레젠테이션 route 존재');
  console.log('- 프레젠테이션 화면에 강사 메모·자산 관리 카드 없음');
  console.log('- 실제 강사 메모 파일 Git 제외 확인');
}
