import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const lessonsDirectory = path.resolve('src/content/lessons');
const assetManifestPath = path.resolve('data/asset-manifest.yaml');
const lessonTopicsPath = path.resolve('src/lib/lesson-topics.ts');
const requiredIds = Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'));
const approvedLessons = [
  { title: '제1차시 · AI가 할 일과 디자이너가 판단할 일', durationMinutes: 180 },
  { title: '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치', durationMinutes: 180 },
  { title: '제3차시 · 실무 의뢰와 RFP를 디자인 브리프로 바꾸기', durationMinutes: 180 },
  { title: '제4차시 · 무드보드에서 공간 콘셉트 보드까지', durationMinutes: 360 },
  { title: '제5차시 · AI로 실무 문서와 반복 정리 업무 줄이기', durationMinutes: 180 },
  { title: '제6차시 · 클라이언트 의뢰를 디자인 브리프로 변환하기', durationMinutes: 180 },
  { title: '제7차시 · 공간을 유지하며 재료·조명·가구 수정하기', durationMinutes: 180 },
  { title: '제8차시 · 클라이언트 피드백 대응과 수정 제안서 만들기', durationMinutes: 180 },
  { title: '제9차시 · 여러 공간 이미지의 디자인 일관성 관리', durationMinutes: 180 },
  { title: '제10차시 · 도면·PDF에서 정보 찾기와 AI 오독 확인', durationMinutes: 180 },
  { title: '제11차시 · 공간 이미지를 짧은 영상으로 만들기', durationMinutes: 180 },
  { title: '제12차시 · AGY로 프로젝트 자료 구조 만들기', durationMinutes: 180 },
  { title: '제13차시 · AGY 기반 반복 점검과 제출 패키지 만들기', durationMinutes: 180 },
  { title: '제14차시 · AI 공간디자인 콘셉트 패키지 완성', durationMinutes: 360 },
];
const approvedTopics = [
  {
    number: '1',
    title: '생성형 AI 리터러시 기초 및 건축 디자인 시각화 실습',
    lessonIds: ['01', '02'],
  },
  {
    number: '2',
    title: '실무 시나리오 기반 맞춤형 제안 이미지 생성 및 워크플로우 자동화',
    lessonIds: ['03', '04'],
  },
  {
    number: '3',
    title: '초기 기획을 위한 래피드 컨셉 도출 및 인페인팅 실무',
    lessonIds: ['05', '06'],
  },
  {
    number: '4',
    title: '메인-서브 통합 워크플로우 및 2D 역추출 브릿지(Bridge) 실습',
    lessonIds: ['07', '08', '09'],
  },
  {
    number: '5',
    title: '실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초',
    lessonIds: ['10', '11'],
  },
  {
    number: '6',
    title: 'AI 생성 결과물 다차원 실무 검증 및 제안서 고도화',
    lessonIds: ['12', '13'],
  },
  {
    number: '7',
    title: '실무 검증형 설계 제안서 롤플레잉 최종 발표 및 수료',
    lessonIds: ['14'],
  },
];
const requiredFields = [
  'title',
  'day',
  'date',
  'durationMinutes',
  'lastVerified',
  'draft',
  'contentType',
  'authorship',
  'verificationStatus',
  'freshness',
  'riskLevel',
  'professionalReviewStatus',
  'professionalReviewScope',
  'sources',
];
const lessonOneInstructorSlots = [
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

const errors = [];
const dayToFiles = new Map();
const lessonAssetIds = new Map();

const readFrontmatter = (source, fileName) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push(`${fileName}: frontmatter 블록이 없습니다.`);
    return '';
  }
  return match[1];
};

const getScalar = (frontmatter, field) => {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
  return match?.[1].trim();
};

const unquote = (value = '') => value.replace(/^(['"])(.*)\1$/, '$2');

const getList = (frontmatter, field) => {
  const inline = getScalar(frontmatter, field);
  if (inline === '[]') return [];
  const block = frontmatter.match(
    new RegExp(`^${field}:\\s*\\r?\\n((?:\\s{2}-\\s*.+(?:\\r?\\n|$))*)`, 'm'),
  )?.[1] ?? '';
  return [...block.matchAll(/^\s{2}-\s*["']?(.+?)["']?\s*$/gm)]
    .map((match) => match[1].replace(/["']$/, '').trim())
    .filter(Boolean);
};

const files = (await readdir(lessonsDirectory))
  .filter((fileName) => fileName.endsWith('.mdx'))
  .sort();

if (files.length !== 14) {
  errors.push(`강의 파일 수: 예상 14개, 실제 ${files.length}개`);
}

const actualIds = files.map((fileName) => path.basename(fileName, '.mdx'));
for (const id of requiredIds) {
  if (!actualIds.includes(id)) errors.push(`누락된 강의 ID: ${id}`);
}
for (const id of actualIds) {
  if (!requiredIds.includes(id)) errors.push(`허용되지 않은 강의 ID: ${id}`);
}

let lessonTopicsSource = '';
try {
  lessonTopicsSource = await readFile(lessonTopicsPath, 'utf8');
} catch {
  errors.push('src/lib/lesson-topics.ts를 읽을 수 없습니다.');
}

const parsedTopics = [
  ...lessonTopicsSource.matchAll(
    /\{\s*number:\s*'(\d+)'\s*,\s*title:\s*'([^']+)'\s*,\s*lessonIds:\s*\[([^\]]*)\]\s*,\s*lessonCount:\s*(\d+)\s*,?\s*\}/g,
  ),
].map((match) => ({
  number: match[1],
  title: match[2],
  lessonIds: [...match[3].matchAll(/'(\d{2})'/g)].map((lessonMatch) => lessonMatch[1]),
  lessonCount: Number(match[4]),
}));

if (parsedTopics.length !== 7) {
  errors.push(`상위 주제 수: 예상 7개, 실제 ${parsedTopics.length}개`);
}

for (const approvedTopic of approvedTopics) {
  const matches = parsedTopics.filter((topic) => topic.number === approvedTopic.number);
  if (matches.length === 0) {
    errors.push(`누락된 상위 주제 번호: ${approvedTopic.number}`);
    continue;
  }
  if (matches.length > 1) {
    errors.push(`중복된 상위 주제 번호: ${approvedTopic.number}`);
    continue;
  }

  const [actualTopic] = matches;
  if (actualTopic.title !== approvedTopic.title) {
    errors.push(`주제 ${approvedTopic.number}: 승인된 주제명과 일치하지 않습니다.`);
  }
  if (actualTopic.lessonIds.join(',') !== approvedTopic.lessonIds.join(',')) {
    errors.push(
      `주제 ${approvedTopic.number}: 승인된 차시 연결 ${approvedTopic.lessonIds.join(', ')}와 일치하지 않습니다.`,
    );
  }
  if (actualTopic.lessonCount !== actualTopic.lessonIds.length) {
    errors.push(
      `주제 ${approvedTopic.number}: lessonCount ${actualTopic.lessonCount}와 실제 연결 수 ${actualTopic.lessonIds.length}가 다릅니다.`,
    );
  }
}

const connectedLessonIds = parsedTopics.flatMap((topic) => topic.lessonIds);
for (const id of requiredIds) {
  const occurrences = connectedLessonIds.filter((lessonId) => lessonId === id).length;
  if (occurrences === 0) {
    errors.push(`상위 주제를 찾을 수 없는 차시: ${id}`);
  }
  if (occurrences > 1) {
    errors.push(`여러 상위 주제에 중복 연결된 차시: ${id}`);
  }
}
for (const id of connectedLessonIds) {
  if (!requiredIds.includes(id)) {
    errors.push(`상위 주제에 허용되지 않은 차시 ID가 연결됐습니다: ${id}`);
  }
}

for (const fileName of files) {
  const id = path.basename(fileName, '.mdx');
  const isDetailedLessonOne = id === '01';
  const source = await readFile(path.join(lessonsDirectory, fileName), 'utf8');
  const frontmatter = readFrontmatter(source, fileName);

  for (const field of requiredFields) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
      errors.push(`${fileName}: 필수 metadata '${field}'가 없습니다.`);
    }
  }

  const title = unquote(getScalar(frontmatter, 'title'));
  if (!title) errors.push(`${fileName}: title은 빈 문자열일 수 없습니다.`);

  const day = Number(getScalar(frontmatter, 'day'));
  if (!Number.isInteger(day) || day < 1 || day > 14) {
    errors.push(`${fileName}: day는 1부터 14 사이의 정수여야 합니다.`);
  } else {
    const matchingFiles = dayToFiles.get(day) ?? [];
    matchingFiles.push(fileName);
    dayToFiles.set(day, matchingFiles);
    if (id !== String(day).padStart(2, '0')) {
      errors.push(`${fileName}: 파일 ID ${id}와 day ${day}가 일치하지 않습니다.`);
    }
  }

  const date = unquote(getScalar(frontmatter, 'date'));
  if (date !== 'pending' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push(`${fileName}: date는 YYYY-MM-DD 또는 pending이어야 합니다.`);
  }

  const duration = getScalar(frontmatter, 'durationMinutes');
  if (duration !== 'null' && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
    errors.push(`${fileName}: durationMinutes는 양의 정수 또는 null이어야 합니다.`);
  }

  const approved = approvedLessons[day - 1];
  if (approved && title !== approved.title) {
    errors.push(`${fileName}: 승인된 제목과 일치하지 않습니다.`);
  }
  if (approved && Number(duration) !== approved.durationMinutes) {
    errors.push(
      `${fileName}: 승인된 수업시간 ${approved.durationMinutes}분과 일치하지 않습니다.`,
    );
  }

  const lastVerified = unquote(getScalar(frontmatter, 'lastVerified'));
  if (lastVerified !== 'null' && !/^\d{4}-\d{2}-\d{2}$/.test(lastVerified)) {
    errors.push(`${fileName}: lastVerified는 YYYY-MM-DD 또는 null이어야 합니다.`);
  }

  const professionalReviewStatus = unquote(getScalar(frontmatter, 'professionalReviewStatus'));
  const professionalReviewScope = getList(frontmatter, 'professionalReviewScope');
  if (
    (professionalReviewStatus === 'required' || professionalReviewStatus === 'completed') &&
    professionalReviewScope.length === 0
  ) {
    errors.push(`${fileName}: 전문 검토 상태에는 professionalReviewScope가 필요합니다.`);
  }
  if (
    professionalReviewStatus !== 'required' &&
    professionalReviewStatus !== 'completed' &&
    professionalReviewScope.length > 0
  ) {
    errors.push(`${fileName}: 전문 검토 범위는 required 또는 completed 상태에서만 작성합니다.`);
  }

  if (isDetailedLessonOne) {
    const requiredLessonOneStructures = [
      { marker: '<LessonSection', label: 'LessonSection' },
      { marker: '<LessonTimePlan', label: 'LessonTimePlan' },
      { marker: 'export const lessonAssetIds', label: '자산 ID 선언' },
      { marker: 'data-instructor-note-template', label: '강사 메모 슬롯' },
    ];
    for (const { marker, label } of requiredLessonOneStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제1차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    const actualInstructorSlots = [
      ...source.matchAll(/data-instructor-note-template="([^"]+)"/g),
    ].map((match) => match[1]);
    for (const slot of lessonOneInstructorSlots) {
      if (!actualInstructorSlots.includes(slot)) {
        errors.push(`${fileName}: 강사 메모 슬롯 ${slot}이 없습니다.`);
      }
    }
    const duplicateInstructorSlots = actualInstructorSlots.filter(
      (slot, index) => actualInstructorSlots.indexOf(slot) !== index,
    );
    for (const slot of new Set(duplicateInstructorSlots)) {
      errors.push(`${fileName}: 강사 메모 슬롯 ${slot}이 중복됐습니다.`);
    }
  } else if (!source.includes('<LessonOutline')) {
    errors.push(`${fileName}: LessonOutline 골격이 없습니다.`);
  }
  if (id === '03') {
    const requiredLessonThreeStructures = [
      { marker: '지역혁신대학교 중앙도서관 1층 캠퍼스 라운지', label: '캠퍼스 라운지 가상 프로젝트' },
      { marker: 'lesson-03-campus-lounge-rfp-v1.2.pdf', label: 'RFP PDF 다운로드' },
      { marker: 'campus-lounge-existing-plan.png', label: '공통 프로젝트 현황 평면도' },
      { marker: 'campus-lounge-existing-view-01.jpeg', label: '공통 프로젝트 현황 이미지' },
      { marker: 'lesson-03-04-campus-lounge-existing-plan.png', label: '현황 평면도 다운로드 파일명' },
      { marker: 'lesson-03-04-campus-lounge-existing-view-01.jpeg', label: '현황 이미지 다운로드 파일명' },
      { marker: 'gemini-rfp-analysis-prompt-v1.2.txt', label: 'Gemini 분석 요청문 다운로드' },
      { marker: 'questionsTitle="핵심 질문"', label: '핵심 질문 섹션 제목' },
      { marker: 'scenarioTitle="교육용 가상 RFP 원문"', label: '교육용 가상 RFP 섹션 제목' },
      { marker: '요구조건 매트릭스', label: '요구조건 매트릭스 실습' },
      { marker: '발주기관 추가 질의', label: '발주기관 추가 질의 실습' },
      { marker: '제4차시 대안 평가 기준', label: '제4차시 인계 기준' },
      { marker: 'RFP에서 직접 확인되는 내용', label: 'RFP 근거 구분' },
      { marker: '평면도에서 확인되는 내용', label: '평면도 근거 구분' },
      { marker: '이미지에서 시각적으로 참고할 수 있는 내용', label: '현황 이미지 참고 구분' },
      { marker: '현재 자료만으로 확인할 수 없는 내용', label: '미확정 내용 구분' },
      { marker: '발주기관에 추가로 물어볼 내용', label: '발주기관 추가 질의 구분' },
      { marker: '관련 전문가가 확인해야 하는 내용', label: '전문가 확인 구분' },
      { marker: '실제 Gemini 응답 원문은 사용자가 제공하기 전까지', label: '실제 Gemini 응답 비생성 원칙' },
      { marker: 'resourceDownloads={[', label: '공개 실습 자료 다운로드 구조' },
      { marker: 'assetNotes={[', label: '학생용 내부 자산 카드 차단 구조' },
      { marker: 'assetsTitle="실습 자료 다운로드"', label: '실습 자료 다운로드 섹션 제목' },
    ];
    for (const { marker, label } of requiredLessonThreeStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제3차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    for (const disallowedTool of ['나노바나나', 'Nano Banana', 'Veo']) {
      if (source.includes(disallowedTool)) {
        errors.push(`${fileName}: 제3차시 본문에서 사용하지 않는 도구 '${disallowedTool}'를 제거해야 합니다.`);
      }
    }
    for (const retiredScenarioText of [
      '지역 생활브랜드 소형 쇼룸',
      '소형 쇼룸 겸 상담 라운지',
      '상품 전시와 2~4인 상담',
    ]) {
      if (source.includes(retiredScenarioText)) {
        errors.push(`${fileName}: 폐기된 기존 쇼룸 사례 '${retiredScenarioText}'가 남아 있습니다.`);
      }
    }
    if (source.includes('lesson-03-campus-lounge-rfp-v1.2.docx')) {
      errors.push(`${fileName}: 학생용 본문에서 source DOCX 원본을 공개 다운로드로 연결할 수 없습니다.`);
    }
  }
  if (source.includes("category: '전문가 판단 필요'")) {
    errors.push(
      `${fileName}: 포괄적인 '전문가 판단 필요' 대신 구체적인 판단·검증 분류를 사용해야 합니다.`,
    );
  }

  if (!isDetailedLessonOne) {
    const structuralCategoryChecks = [
      { property: 'goals', nextProperty: 'concepts', expected: '학습 목표' },
      { property: 'deliverables', nextProperty: 'judgments', expected: '수업 산출물' },
    ];
    for (const { property, nextProperty, expected } of structuralCategoryChecks) {
      const block = source.match(
        new RegExp(`  ${property}=\\{\\[([\\s\\S]*?)\\]\\}\\s*\\n  ${nextProperty}=`),
      )?.[1] ?? '';
      const categories = [...block.matchAll(/category:\s*'([^']+)'/g)]
        .map((match) => match[1]);
      if (categories.length === 0 || categories.some((category) => category !== expected)) {
        errors.push(`${fileName}: ${property} 항목은 '${expected}' 교육 구조 분류를 사용해야 합니다.`);
      }
    }
  }

  const expectedSectionCount = isDetailedLessonOne ? 16 : 13;
  for (let section = 1; section <= expectedSectionCount; section += 1) {
    const sectionId = `section-${String(section).padStart(2, '0')}`;
    if (!frontmatter.includes(`id: "${sectionId}"`)) {
      errors.push(`${fileName}: 로컬 목차에 ${sectionId}가 없습니다.`);
    }
  }

  const timePlan = source.match(/timePlan=\{\[([\s\S]*?)\]\}\s*\/>/)?.[1] ?? '';
  const allocatedMinutes = [...timePlan.matchAll(/minutes:\s*(\d+)/g)]
    .reduce((sum, match) => sum + Number(match[1]), 0);
  const timePlanEntries = [...timePlan.matchAll(/\{[^{}]*minutes:\s*(\d+)[^{}]*\}/g)];
  const practiceMinutes = timePlanEntries
    .filter((match) => (
      isDetailedLessonOne
        ? /practiceRelated:\s*true/.test(match[0])
        : /mode:\s*'practice'/.test(match[0])
    ))
    .reduce((sum, match) => sum + Number(match[1]), 0);

  if (allocatedMinutes !== Number(duration)) {
    errors.push(`${fileName}: 시간 배분 합계 ${allocatedMinutes}분이 수업시간과 다릅니다.`);
  }
  if (practiceMinutes < Number(duration) / 2) {
    errors.push(`${fileName}: 실습시간 ${practiceMinutes}분이 전체의 절반보다 적습니다.`);
  }

  const assetBlock =
    source.match(/assetIds=\{\[([\s\S]*?)\]\}/)?.[1] ??
    source.match(/export const lessonAssetIds\s*=\s*\[([\s\S]*?)\];/)?.[1] ??
    '';
  const assetIds = [...assetBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  if (assetIds.length === 0) {
    errors.push(`${fileName}: assetIds 항목이 없습니다.`);
  }
  lessonAssetIds.set(fileName, assetIds);
}

for (let day = 1; day <= 14; day += 1) {
  const matchingFiles = dayToFiles.get(day) ?? [];
  if (matchingFiles.length === 0) errors.push(`누락된 day: ${day}`);
  if (matchingFiles.length > 1) errors.push(`중복 day ${day}: ${matchingFiles.join(', ')}`);
}

let manifest = '';
try {
  manifest = await readFile(assetManifestPath, 'utf8');
} catch {
  errors.push('data/asset-manifest.yaml을 읽을 수 없습니다.');
}

const manifestAssetIds = [...manifest.matchAll(/^\s+- id:\s*"([^"]+)"/gm)]
  .map((match) => match[1]);
const duplicateManifestIds = manifestAssetIds.filter(
  (id, index) => manifestAssetIds.indexOf(id) !== index,
);
for (const id of new Set(duplicateManifestIds)) {
  errors.push(`asset-manifest 중복 ID: ${id}`);
}
for (const [fileName, assetIds] of lessonAssetIds) {
  for (const id of assetIds) {
    if (!manifestAssetIds.includes(id)) {
      errors.push(`${fileName}: 자산 ${id}가 asset-manifest에 없습니다.`);
    }
  }
}
const requiredAssetFields = [
  'lesson',
  'priority',
  'source_type',
  'production_owner',
  'lesson_usage',
  'title',
  'type',
  'purpose',
  'required_files',
  'recommended_tool',
  'status',
  'public_use',
  'alt',
  'verification_note',
];
const assetFieldEnums = {
  priority: ['required', 'optional', 'reference-only'],
  source_type: ['original', 'external-reference', 'template'],
  production_owner: ['codex', 'instructor', 'nano-banana', 'veo'],
  lesson_usage: ['demonstration', 'practice-input', 'result-sample', 'checklist'],
};
const manifestBlocks = manifest
  .split(/\r?\n(?=  - id:\s*")/)
  .filter((block) => block.trimStart().startsWith('- id:'));
const referencedAssetIds = new Set([...lessonAssetIds.values()].flat());
for (const block of manifestBlocks) {
  const id = block.match(/^\s+- id:\s*"([^"]+)"/)?.[1] ?? 'unknown';
  for (const field of requiredAssetFields) {
    if (!new RegExp(`^\\s{4}${field}:`, 'm').test(block)) {
      errors.push(`asset-manifest ${id}: 필수 필드 '${field}'가 없습니다.`);
    }
  }
  const lesson = Number(block.match(/^\s{4}lesson:\s*(\d+)\s*$/m)?.[1]);
  const lessonFromId = Number(id.match(/^l(\d{2})-/)?.[1]);
  if (lesson !== lessonFromId) {
    errors.push(`asset-manifest ${id}: lesson ${lesson}이 자산 ID의 차시와 일치하지 않습니다.`);
  }

  const enumValues = {};
  for (const [field, allowedValues] of Object.entries(assetFieldEnums)) {
    const value = block.match(new RegExp(`^\\s{4}${field}:\\s*"([^"]+)"\\s*$`, 'm'))?.[1];
    enumValues[field] = value;
    if (value && !allowedValues.includes(value)) {
      errors.push(
        `asset-manifest ${id}: '${field}' 값 '${value}'은 허용 목록(${allowedValues.join(', ')})에 없습니다.`,
      );
    }
  }
  if (
    (enumValues.priority === 'reference-only') !==
    (enumValues.source_type === 'external-reference')
  ) {
    errors.push(
      `asset-manifest ${id}: reference-only 우선순위와 external-reference 출처 유형은 함께 사용해야 합니다.`,
    );
  }

  const status = block.match(/^\s{4}status:\s*"([^"]+)"\s*$/m)?.[1];
  const publicUseValue = block.match(/^\s{4}public_use:\s*(true|false)\s*$/m)?.[1];
  const publicUse = publicUseValue === 'true';
  if (!publicUseValue) {
    errors.push(`asset-manifest ${id}: public_use는 true 또는 false여야 합니다.`);
  }
  if (publicUse && status !== 'ready') {
    errors.push(`asset-manifest ${id}: public_use true는 status ready에서만 허용됩니다.`);
  }
  if (publicUse && enumValues.source_type === 'external-reference') {
    errors.push(`asset-manifest ${id}: 외부 참고 자산은 public_use false를 유지해야 합니다.`);
  }
  if (publicUse) {
    const sourceNote = block.match(/^\s{4}source_note:\s*"([^"]+)"\s*$/m)?.[1];
    const rightsStatus = block.match(/^\s{4}rights_status:\s*"([^"]+)"\s*$/m)?.[1];
    const verifiedAt = block.match(/^\s{4}verified_at:\s*"([^"]+)"\s*$/m)?.[1];
    const verificationNote = block.match(/^\s{4}verification_note:\s*"([^"]+)"\s*$/m)?.[1];
    if (!sourceNote) {
      errors.push(`asset-manifest ${id}: 공개 자산에는 source_note가 필요합니다.`);
    }
    if (rightsStatus !== 'cleared') {
      errors.push(`asset-manifest ${id}: 공개 자산의 rights_status는 cleared여야 합니다.`);
    }
    if (!verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(verifiedAt)) {
      errors.push(`asset-manifest ${id}: 공개 자산에는 YYYY-MM-DD verified_at이 필요합니다.`);
    }
    if (!verificationNote) {
      errors.push(`asset-manifest ${id}: 공개 자산에는 verification_note가 필요합니다.`);
    }
  }

  const filePath = block.match(/^\s{4}file_path:\s*"([^"]+)"\s*$/m)?.[1];
  if (filePath) {
    const allowedAssetRoot = path.resolve('src/assets');
    const resolvedFilePath = path.resolve(filePath);
    const relativeToAssetRoot = path.relative(allowedAssetRoot, resolvedFilePath);
    if (relativeToAssetRoot.startsWith('..') || path.isAbsolute(relativeToAssetRoot)) {
      errors.push(`asset-manifest ${id}: file_path는 src/assets 내부 파일이어야 합니다.`);
    } else {
      try {
        await access(resolvedFilePath);
      } catch {
        errors.push(`asset-manifest ${id}: file_path 파일을 찾을 수 없습니다: ${filePath}`);
      }
    }
  }

  const referencedBy = [...lessonAssetIds.entries()]
    .filter(([, ids]) => ids.includes(id))
    .map(([fileName]) => fileName);
  if (enumValues.priority === 'reference-only' && referencedBy.length > 0) {
    errors.push(`asset-manifest ${id}: reference-only 자산은 학생용 MDX에 연결할 수 없습니다.`);
  }
  if (enumValues.priority !== 'reference-only' && !referencedAssetIds.has(id)) {
    errors.push(`asset-manifest ${id}: 학생용 차시의 assetIds에 연결되지 않았습니다.`);
  }
  if (
    enumValues.priority !== 'reference-only' &&
    (referencedBy.length !== 1 || referencedBy[0] !== `${String(lesson).padStart(2, '0')}.mdx`)
  ) {
    errors.push(`asset-manifest ${id}: 자산은 해당 차시 MDX 한 곳에만 연결해야 합니다.`);
  }
}

if (errors.length > 0) {
  console.error('콘텐츠 무결성 검사 실패');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('콘텐츠 무결성 검사 성공');
console.log('- 강의 파일: 14개');
console.log('- ID: 01–14 누락·중복 없음');
console.log('- day: 1–14 누락·중복 없음');
console.log('- ID/day 일치');
console.log('- 승인된 제목·수업시간 일치');
console.log('- 승인된 상위 주제 7개·차시 연결 14개 일치');
console.log('- 제1차시 16개 섹션, 제2–14차시 13개 섹션');
console.log('- 모든 차시 실습시간 50% 이상');
console.log(`- 자산 manifest: ${manifestAssetIds.length}개, 필수 필드·연결 ID·공개 조건 확인`);
console.log(`- 필수 metadata: ${requiredFields.join(', ')}`);
