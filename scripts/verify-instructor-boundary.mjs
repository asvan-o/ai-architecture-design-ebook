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
const privateNoteDirectory = path.resolve(
  process.env.INSTRUCTOR_CONTENT_DIR ?? path.join('instructor-content', 'lessons'),
);
const privateNotePath = path.join(privateNoteDirectory, '01.yaml');
const requiredSlots = [
  'l01-opening',
  'l01-generative-ai',
  'l01-ai-human-role',
  'l01-before-gemini-demo',
  'l01-after-gemini-response',
  'l01-response-analysis',
  'l01-fallback-response',
  'l01-student-practice',
  'l01-answer-key',
  'l01-closing',
];

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
const privateBodies = existsSync(privateNotePath)
  ? parsePrivateBodies(await readFile(privateNotePath, 'utf8'))
  : [];

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
} else {
  if (yamlFiles.length > 0) {
    errors.push('강사용 정적 결과물에 원본 YAML 파일이 포함됐습니다.');
  }
  const lessonOnePath = path.join(outputPath, 'lessons', '01', 'index.html');
  if (!existsSync(lessonOnePath)) {
    errors.push('강사용 결과물에 제1차시 페이지가 없습니다.');
  }
  const lessonOneSource = existsSync(lessonOnePath)
    ? await readFile(lessonOnePath, 'utf8')
    : '';
  const lessonOneSlots =
    lessonOneSource.match(/data-instructor-note-slot="[^"]+"/g) ?? [];
  if (lessonOneSlots.length !== requiredSlots.length) {
    errors.push(
      `강사용 제1차시의 메모 슬롯이 ${requiredSlots.length}개가 아닙니다: ${lessonOneSlots.length}개`,
    );
  }
  if (
    combinedSource.includes('data-instructor-note-template') ||
    combinedSource.includes('INSTRUCTOR_NOTE_SLOT')
  ) {
    errors.push('강사용 결과물에 변환되지 않은 강사 메모 슬롯 템플릿이 남아 있습니다.');
  }
  for (const slot of requiredSlots) {
    if (!lessonOneSource.includes(`data-instructor-note-slot="${slot}"`)) {
      errors.push(`강사용 제1차시에 메모 슬롯 ${slot}이 없습니다.`);
    }
  }
  for (let day = 2; day <= 14; day += 1) {
    const lessonId = String(day).padStart(2, '0');
    const lessonPath = path.join(outputPath, 'lessons', lessonId, 'index.html');
    if (!existsSync(lessonPath)) {
      errors.push(`강사용 결과물에 제${day}차시 페이지가 없습니다.`);
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

  const lessonOneConsolePath = path.join(
    outputPath,
    'instructor-console',
    'lessons',
    '01',
    'index.html',
  );
  const lessonOneConsoleSource = existsSync(lessonOneConsolePath)
    ? await readFile(lessonOneConsolePath, 'utf8')
    : '';
  const lessonOneConsoleSlots =
    lessonOneConsoleSource.match(/data-instructor-note-slot="[^"]+"/g) ?? [];
  if (lessonOneConsoleSlots.length !== requiredSlots.length) {
    errors.push(
      `강사용 제1차시 콘솔의 메모 슬롯이 ${requiredSlots.length}개가 아닙니다: ${lessonOneConsoleSlots.length}개`,
    );
  }

  const lessonTwoConsolePath = path.join(
    outputPath,
    'instructor-console',
    'lessons',
    '02',
    'index.html',
  );
  const lessonTwoConsoleSource = existsSync(lessonTwoConsolePath)
    ? await readFile(lessonTwoConsolePath, 'utf8')
    : '';
  if (!lessonTwoConsoleSource.includes('현재 섹션에 등록된 강사 메모가 없습니다.')) {
    errors.push('강사용 제2차시 콘솔에 메모 없음 안내가 없습니다.');
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
      presentationSource.includes('INSTRUCTOR_NOTE_SLOT')
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

if (existsSync(privateNotePath)) {
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
  console.log('- 강사 메모 슬롯·UI·누락 안내·로컬 메모 본문·YAML 파일 없음');
} else {
  console.log(`- 제1차시 강사 메모 슬롯 ${requiredSlots.length}개 표시`);
  console.log('- 제2–14차시 정적 페이지 존재');
  console.log('- 제1–14차시 강사 콘솔·프레젠테이션 route 존재');
  console.log('- 프레젠테이션 화면에 강사 메모·자산 관리 카드 없음');
}
console.log('- 실제 강사 메모 파일 Git 제외 확인');
