import { access, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

const lessonsDirectory = path.resolve('src/content/lessons');
const assetManifestPath = path.resolve('data/asset-manifest.yaml');
const studentReleaseConfigPath = path.resolve('data/student-release.json');
const lessonTopicsPath = path.resolve('src/lib/lesson-topics.ts');
const glossaryPath = path.resolve('src/content/glossary/index.mdx');
const toolCatalogPath = path.resolve('data/tool-catalog.yaml');
const instructorNoteMapPath = path.resolve('src/lib/instructor-notes.ts');
const printStylePath = path.resolve('src/styles/print.css');
const lessonTwoPromptPath = path.resolve(
  'src/assets/lessons/02/empty-space-sample/01-generation-prompts/prompt-02.txt',
);
const lessonThreeRfpPath = path.resolve(
  'src/assets/lessons/03/rfp/lesson-03-campus-lounge-rfp-v1.2.pdf',
);
const lessonThreePromptPath = path.resolve(
  'src/assets/lessons/03/rfp/gemini-rfp-analysis-prompt-v1.2.txt',
);
const approvedLessonThreeRfpSha256 =
  '95B9756FD818D8F86847CA72D1E094B9DD6C2E4B9D1DFBC029169D057E638C2E';
const requiredIds = Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'));
const approvedLessons = [
  { title: '제1차시 · AI가 할 일과 디자이너가 판단할 일', durationMinutes: 180 },
  { title: '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치', durationMinutes: 180 },
  { title: '제3차시 · 실무 의뢰와 RFP를 디자인 브리프로 바꾸기', durationMinutes: 180 },
  {
    title: '제4차시 · RFP 기반 공간구성 대안 개발과 프로젝트 산출물 자동 정리',
    durationMinutes: 360,
  },
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
const approvedRoadmapTitles = [
  '제1차시 · AI가 할 일과 디자이너가 판단할 일',
  '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치',
  '제3차시 · 실무 의뢰와 RFP를 디자인 브리프로 바꾸기',
  '제4차시 · RFP 기반 공간구성 대안 개발과 프로젝트 산출물 자동 정리',
  '제5차시 · AI로 실무 문서와 반복 정리 업무 줄이기',
  '제6차시 · 클라이언트 의뢰를 디자인 브리프로 변환하기',
  '제7차시 · 메인 이미지 설정과 공간 디자인 일관성 관리',
  '제8차시 · 서브 이미지 확장과 고도화 수정',
  '제9차시 · 3D 콘셉트 이미지에서 2D 개념 조닝 역추출',
  '제10차시 · 실무 데이터 비식별화와 도면·PDF 전처리',
  '제11차시 · 2D 도면 기반 3D 콘셉트 시각화와 오류 탐지',
  '제12차시 · 다차원 검증 체크리스트와 교차검증',
  '제13차시 · 제안서 고도화와 KPI·제출 패키지',
  '제14차시 · AI 공간디자인 콘셉트 제안서 롤플레잉 최종 발표',
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
    title: '메인–서브 통합 워크플로우 및 2D 역추출 브릿지 실습',
    subtitle: '(이미지 일관성과 공간 관계 확장)',
    lessonIds: ['07', '08', '09'],
  },
  {
    number: '5',
    title: '실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초',
    subtitle: '(도면과 데이터 기반 3D 시각화)',
    lessonIds: ['10', '11'],
  },
  {
    number: '6',
    title: 'AI 생성 결과물 다차원 실무 검증 및 제안서 고도화',
    subtitle: '(결과물 검증과 제안서 완성)',
    lessonIds: ['12', '13'],
  },
  {
    number: '7',
    title: '실무 검증형 설계 제안서 롤플레잉 최종 발표 및 수료',
    subtitle: '(최종 제안과 발표)',
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
const detailedLessonSections = {
  '01': ['차시 소개', '오늘의 핵심 질문', '학습 목표', '생성형 AI(Generative AI)의 기본 개념', 'AI가 할 일과 디자이너가 판단할 일', '안전하게 사용하기 위한 핵심 용어', '원문·추론·가정·디자인 제안 구분', '북카페 가상 의뢰', 'Gemini 첫 번째 입력', 'Gemini 3.6 Flash 실제 응답', '실제 응답 분석', '개선된 요청문', '수강생 실습', '결과물 작성', 'AI 활용·검증 체크리스트', '차시 마무리'],
  '02': ['차시 소개', '직관적인 핵심 질문', '학습 목표', '핵심 개념', '실무형 가상 문제', '제공 자료', '플라워 카페 작업 과정', '수강생 실습', '제출 결과물', '수강생이 판단할 항목', 'AI 오류 확인 체크리스트', '필요한 이미지·영상·문서', '확인 또는 검증이 필요한 내용'],
  '03': ['차시 소개', '오늘의 프로젝트와 제출 결과물', '실습자료 다운로드 및 현황자료', 'RFP와 디자인 브리프 핵심 개념', 'RFP를 읽을 때 확인할 핵심 질문', 'RFP 구조 함께 확인하기', '요구조건 매트릭스 작성', '발주기관 추가 질의 작성', 'Gemini 분석 및 사람 분석과 비교', '디자인 브리프 작성', '현황 이미지 검토와 제4차시 평가기준', '제출 결과물 점검', '검증 필요와 정리'],
  '04': ['차시 소개', '오늘의 프로젝트와 제출 결과물', '제공 자료와 제3차시 작업물 가져오기', '공간구성 대안의 의미', '대안 A·B 운영전략과 조닝 작성', 'Nano Banana 대안 이미지 생성', 'RFP 기준 비교와 선택', '선택안 수정', 'Antigravity 도구 유형과 모델 선택', '고정 프로젝트 경로와 핵심 계층구조', '동일 프롬프트로 관리 프로그램 제작 과정', '산출물 자동 정리와 제출 준비', '제출 결과물·검증·다음 차시'],
};
const lessonThreeFourOutputs = ['요구조건 매트릭스', '발주기관 추가 질의', '디자인 브리프', '평면도 기반 현황 이미지 생성 결과', '현황 이미지 수정 결과', '평면도와 이미지의 불일치 기록', '제4차시 대안 평가기준'];

const errors = [];
const dayToFiles = new Map();
const lessonAssetIds = new Map();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const objectValidationKeyPattern = (key) =>
  new RegExp(`\\bvalidationKey\\s*:\\s*['\"]${escapeRegExp(key)}['\"]`);
const hasObjectValidationKey = (source, key) => objectValidationKeyPattern(key).test(source);
const requireObjectValidationKey = (source, key, context) => {
  if (!hasObjectValidationKey(source, key)) {
    errors.push(`${context}: 구조 검증 키 '${key}'가 없습니다.`);
    return;
  }

  const keyLine = source.split(/\r?\n/).find((line) => hasObjectValidationKey(line, key));
  const naturallyRewordedLine = keyLine?.replace(
    /text:\s*'[^']*'/,
    "text: '표현을 자연스럽게 바꾼 안전 안내 문장이다.'",
  );
  const naturallyRewordedSource =
    keyLine && naturallyRewordedLine ? source.replace(keyLine, naturallyRewordedLine) : source;
  if (!hasObjectValidationKey(naturallyRewordedSource, key)) {
    errors.push(`${context}: 문구 변경 양성 테스트에 실패했습니다.`);
  }

  const sourceWithoutItem = source
    .split(/\r?\n/)
    .filter((line) => !hasObjectValidationKey(line, key))
    .join('\n');
  if (hasObjectValidationKey(sourceWithoutItem, key)) {
    errors.push(`${context}: 구조 항목 제거 음성 테스트에 실패했습니다.`);
  }
};
const promptValidationMarker = (key) => `<!-- validation-key: ${key} -->`;
const hasPromptValidationItem = (source, key) => {
  const marker = promptValidationMarker(key);
  const line = source.split(/\r?\n/).find((candidate) => candidate.includes(marker));
  if (!line) return false;
  const itemText = line.replace(marker, '').replace(/^\s*-\s*/, '').trim();
  return itemText.length >= 20;
};
const requirePromptValidationItem = (source, key, context) => {
  if (!hasPromptValidationItem(source, key)) {
    errors.push(`${context}: 구조 검증 키 '${key}'가 연결된 안전 항목이 없습니다.`);
    return;
  }

  const marker = promptValidationMarker(key);
  const keyLine = source.split(/\r?\n/).find((line) => line.includes(marker));
  const naturallyRewordedSource = keyLine
    ? source.replace(
        keyLine,
        `- 표현을 자연스럽게 바꿔도 원문 추적성 검증 의미를 유지합니다. ${marker}`,
      )
    : source;
  if (!hasPromptValidationItem(naturallyRewordedSource, key)) {
    errors.push(`${context}: 문구 변경 양성 테스트에 실패했습니다.`);
  }

  const sourceWithoutItem = source
    .split(/\r?\n/)
    .filter((line) => !line.includes(marker))
    .join('\n');
  if (hasPromptValidationItem(sourceWithoutItem, key)) {
    errors.push(`${context}: 안전 항목 제거 음성 테스트에 실패했습니다.`);
  }
};

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
    /\{\s*number:\s*'(\d+)'\s*,\s*title:\s*'([^']+)'\s*,(?:\s*subtitle:\s*'([^']+)'\s*,)?\s*lessonIds:\s*\[([^\]]*)\]\s*,\s*lessonCount:\s*(\d+)\s*,?\s*\}/g,
  ),
].map((match) => ({
  number: match[1],
  title: match[2],
  subtitle: match[3],
  lessonIds: [...match[4].matchAll(/'(\d{2})'/g)].map((lessonMatch) => lessonMatch[1]),
  lessonCount: Number(match[5]),
}));

const parsedRoadmap = [...lessonTopicsSource.matchAll(
  /\{\s*id:\s*'(\d{2})'\s*,\s*day:\s*(\d+)\s*,\s*title:\s*'([^']+)'\s*\}/g,
)].map((match) => ({ id: match[1], day: Number(match[2]), title: match[3] }));

if (parsedRoadmap.length !== 14) {
  errors.push(`과정 로드맵 차시 수: 예상 14개, 실제 ${parsedRoadmap.length}개`);
}
for (const [index, approvedTitle] of approvedRoadmapTitles.entries()) {
  const lessonId = String(index + 1).padStart(2, '0');
  const roadmapLesson = parsedRoadmap.find((lesson) => lesson.id === lessonId);
  if (!roadmapLesson) {
    errors.push(`과정 로드맵에 제${index + 1}차시가 없습니다.`);
    continue;
  }
  if (roadmapLesson.day !== index + 1 || roadmapLesson.title !== approvedTitle) {
    errors.push(`과정 로드맵 제${index + 1}차시 번호 또는 승인 제목이 다릅니다.`);
  }
}

try {
  const studentRelease = JSON.parse(await readFile(studentReleaseConfigPath, 'utf8'));
  const releasedIds = studentRelease.releasedStudentLessonIds;
  if (!Array.isArray(releasedIds)) {
    errors.push('학생 공개 설정의 releasedStudentLessonIds는 배열이어야 합니다.');
  } else {
    const expectedContiguousRelease = requiredIds.slice(0, releasedIds.length);
    if (releasedIds.join(',') !== expectedContiguousRelease.join(',')) {
      errors.push('학생 공개 차시는 01부터 순서가 끊기지 않는 연속 목록이어야 합니다.');
    }
    if (new Set(releasedIds).size !== releasedIds.length) {
      errors.push('학생 공개 설정에 중복 차시 ID가 있습니다.');
    }
    for (const id of releasedIds) {
      if (!requiredIds.includes(id)) errors.push(`학생 공개 설정에 허용되지 않은 차시 ID가 있습니다: ${id}`);
    }
  }
} catch {
  errors.push('data/student-release.json을 읽거나 해석할 수 없습니다.');
}

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
  if (actualTopic.subtitle !== approvedTopic.subtitle) {
    errors.push(`주제 ${approvedTopic.number}: 승인된 보조 설명과 일치하지 않습니다.`);
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
  const isDetailedPublicLesson = Number(id) <= 4;
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
  if (isDetailedPublicLesson) {
    if (unquote(getScalar(frontmatter, 'publicationStatus')) !== 'detailed') {
      errors.push(`${fileName}: 완성된 제1~4차시는 publicationStatus detailed여야 합니다.`);
    }
    if (!/^sources:\s*\r?\n\s{2}- id:/m.test(frontmatter)) {
      errors.push(`${fileName}: 완성된 제1~4차시는 출처 항목이 필요합니다.`);
    }
    if (lastVerified === 'null') {
      errors.push(`${fileName}: 완성된 제1~4차시는 lastVerified가 필요합니다.`);
    }
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
  if (id === '02') {
    const requiredLessonTwoStructures = [
      { marker: '02-original-result.jpeg', label: '실제 인코딩과 일치하는 최초 이미지 확장자' },
      { marker: '04-revised-result.jpeg', label: '실제 인코딩과 일치하는 수정 이미지 확장자' },
      { marker: 'reviewFramework: {', label: '관찰·변경·후속 대응 분류 구조' },
      { marker: '이미지에서 직접 관찰되는 내용', label: '이미지 관찰 결과 구분' },
      { marker: '의도하지 않은 변경', label: 'AI 변경 유형 구분' },
      { marker: '고양이처럼 보이는 동물 1마리', label: '최초 이미지 관찰 기록' },
      { marker: '고양이도 함께 제거됨', label: '의도하지 않은 수정 기록' },
      { marker: 'errorCheckDetails={[', label: 'e-book 상세 오류 체크리스트' },
      { marker: '제2차시 생성 이미지는 제3차시의 필수 입력', label: '제3차시 연결 경계' },
    ];
    for (const { marker, label } of requiredLessonTwoStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제2차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    requireObjectValidationKey(source, 'source-image-comparison', `${fileName} 제2차시 후속 대응`);
    for (const retiredLessonTwoText of [
      '소형 매장의 분위기도 더 안정적으로 유지되었다',
      '카메라 왜곡 없음',
      '02-original-result.png',
      '04-revised-result.png',
    ]) {
      if (source.includes(retiredLessonTwoText)) {
        errors.push(`${fileName}: 제2차시에서 수정 대상 표현 '${retiredLessonTwoText}'이 남아 있습니다.`);
      }
    }
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
      { marker: 'RFP PDF 4쪽의 “현황 사진”', label: 'RFP 현황 사진 정정 안내' },
      { marker: '주목적은 사람이 먼저 RFP를 분석하고 디자인 브리프를 만드는 것', label: '이미지 보조 실습 범위' },
      { marker: '수업 중 최소 3건을 반드시 작성', label: '불일치 최소 기록 수' },
      { marker: '출처 추적 정보: 페이지·절·REQ ID', label: '디자인 브리프 출처 추적' },
      { marker: '제3차시 결과물 → 제4차시 사용 위치', label: '제3·4차시 결과물 대응표' },
      { marker: '개인정보·기업 기밀·비공개 RFP·권한 없는 도면', label: '외부 AI 업로드 보안 안내' },
      { marker: 'Gemini 3.6 Flash는 API 모델명', label: 'Gemini API 모델과 Apps 구분' },
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
    for (const output of lessonThreeFourOutputs) {
      if (!source.includes(output)) errors.push(`${fileName}: 제3차시 공식 결과물 '${output}'이 없습니다.`);
    }
  }
  if (id === '04') {
    const requiredLessonFourStructures = [
      { marker: 'sectionLayout="project-workflow"', label: '제4차시 전용 프로젝트 워크플로우 레이아웃' },
      { marker: 'projectWorkflow={{', label: '제4차시 프로젝트 워크플로우 데이터 연결' },
      { marker: '공간 조닝(Spatial Zoning)', label: '공간구성 대안 용어' },
      { marker: 'antigravity-manager-build-prompt.txt', label: 'Antigravity 관리 프로그램 제작 요청문' },
      { marker: 'antigravity-manager-approval-prompt.txt', label: '프로그램 제작 승인 요청문' },
      { marker: 'AI_건축_캠퍼스라운지_복구본.zip', label: '관리 프로그램 복구 ZIP' },
      { marker: 'campus-lounge-existing-plan.png', label: '제3차시 공통 현황 평면도 재사용' },
      { marker: 'campus-lounge-existing-view-01.jpeg', label: '제3차시 공통 현황 이미지 재사용' },
      { marker: 'lesson-03-campus-lounge-rfp-v1.2.pdf', label: '제3차시 공통 RFP 재사용' },
      { marker: '프로젝트 밖 접근 금지', label: '프로젝트 루트 보안 조건' },
      { marker: '같은 파일을 다시 등록하면 알림', label: '같은 파일 재등록 알림' },
      { marker: '등록 파일 목록을 자동으로 갱신', label: '등록 파일 목록' },
      { marker: '등록목록의 파일만 ZIP에 포함', label: '등록 파일 전용 ZIP 안내' },
      { marker: 'ZIP 전 포함 목록·미등록 제외 수·누락 항목 표시', label: '제출 전 사람 검토 안내' },
      { marker: '제출 ZIP', label: '제출 패키지 생성' },
    ];
    for (const { marker, label } of requiredLessonFourStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제4차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    requireObjectValidationKey(source, 'available-agent-capability', `${fileName} 제4차시 모델 선택 원칙`);
    if (source.includes('개념 구획(조닝)')) {
      errors.push(`${fileName}: '개념 구획(조닝)' 대신 '공간구성(Spatial Zoning) 대안'을 사용해야 합니다.`);
    }
    const requiredLessonFourFiles = [
      'tools/ai-architecture-project-manager/package.json',
      'tools/ai-architecture-project-manager/server.mjs',
      'tools/ai-architecture-project-manager/package-lock.json',
      'src/assets/lessons/04/workspace/antigravity-manager-build-prompt.txt',
      'src/assets/lessons/04/workspace/antigravity-manager-approval-prompt.txt',
      'src/assets/lessons/04/workspace/AI_건축_캠퍼스라운지_복구본.zip',
    ];
    for (const filePath of requiredLessonFourFiles) {
      try {
        await access(path.resolve(filePath));
      } catch {
        errors.push(`${fileName}: 제4차시 필수 파일을 찾을 수 없습니다: ${filePath}`);
      }
    }
    for (const output of lessonThreeFourOutputs) {
      if (!source.includes(output)) errors.push(`${fileName}: 제4차시 입력자료 '${output}'이 없습니다.`);
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
  if (detailedLessonSections[id]) {
    for (const [index, label] of detailedLessonSections[id].entries()) {
      const sectionId = `section-${String(index + 1).padStart(2, '0')}`;
      if (!frontmatter.includes(`{ id: "${sectionId}", label: "${label}" }`)) {
        errors.push(`${fileName}: ${sectionId} 제목이 실제 상세 섹션과 일치하지 않습니다.`);
      }
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
  if (id === '04' && practiceMinutes !== 255) {
    errors.push(`${fileName}: 승인된 제4차시 실습시간 255분과 일치하지 않습니다.`);
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

try {
  const rfpBuffer = await readFile(lessonThreeRfpPath);
  const actualRfpSha256 = createHash('sha256').update(rfpBuffer).digest('hex').toUpperCase();
  if (actualRfpSha256 !== approvedLessonThreeRfpSha256) {
    errors.push(
      `제3차시 승인 RFP PDF SHA-256 불일치: 예상 ${approvedLessonThreeRfpSha256}, 실제 ${actualRfpSha256}`,
    );
  }
} catch {
  errors.push('제3차시 승인 RFP PDF를 읽을 수 없습니다.');
}

try {
  const lessonThreePrompt = await readFile(lessonThreePromptPath, 'utf8');
  const promptMarkers = [
    'RFP 페이지, 장·절과 요구조건 ID(REQ ID)',
    '근거가 되는 짧은 원문 인용',
    '‘판독 불가’ 또는 ‘미확정’',
    '행정·입찰 조건과 공간 디자인 요구를 분리',
    '실제 회사 자료, 비공개 RFP, 개인정보, 기업 기밀 또는 사용 권한이 없는 도면',
    '출처 추적 정보: 페이지·절·REQ ID',
  ];
  for (const marker of promptMarkers) {
    if (!lessonThreePrompt.includes(marker)) {
      errors.push(`제3차시 Gemini 요청문에 '${marker}' 안내가 없습니다.`);
    }
  }
  requirePromptValidationItem(
    lessonThreePrompt,
    'rfp-source-traceability',
    '제3차시 Gemini 요청문 원문 추적성',
  );
} catch {
  errors.push('제3차시 Gemini 분석 요청문을 읽을 수 없습니다.');
}

let glossarySource = '';
try {
  glossarySource = await readFile(glossaryPath, 'utf8');
} catch {
  errors.push('src/content/glossary/index.mdx를 읽을 수 없습니다.');
}
const glossaryTerms = ['생성형 AI', '대규모 언어 모델', '멀티모달 AI', '할루시네이션', '그라운딩', '인간 개입형 검토', '프롬프트 또는 요청문', '제안요청서', '요구사항', '제약조건', '출처 추적성', '요구조건 매트릭스', '디자인 브리프', '공간구성 또는 공간 조닝', '대안', '평가기준', '명령줄 인터페이스', '터미널 사용자 인터페이스', '헤드리스 실행', '로컬호스트', 'IP 주소 127.0.0.1', '포트', 'JSON', 'Express', '순수 HTML/CSS/JavaScript', '패키지 잠금 파일', '프로토타입', '원문에서 직접 확인된 내용', '추론', '가정', '디자인 제안', '근거', '검증', 'AI 모델', 'AI 서비스', '기능', 'thinking level'];
if (/placeholder|내용 검토 예정|준비 중/i.test(glossarySource)) {
  errors.push('용어 사전에 placeholder 또는 준비 중 문구가 남아 있습니다.');
}
for (const term of glossaryTerms) {
  if (!glossarySource.includes(`term="${term}"`)) errors.push(`용어 사전에 '${term}' 항목이 없습니다.`);
}
if (!/^verificationStatus:\s*"mixed-verification"/m.test(glossarySource)) {
  errors.push('용어 사전 문서 상태가 mixed-verification이 아닙니다.');
}
const glossaryEntries = [...glossarySource.matchAll(/<GlossaryEntry\b[^>]*\/>/g)].map((match) => match[0]);
if (glossaryEntries.length !== glossaryTerms.length) {
  errors.push(`용어 사전 항목 수: 예상 ${glossaryTerms.length}개, 실제 ${glossaryEntries.length}개`);
}
for (const [index, entry] of glossaryEntries.entries()) {
  if (!/definitionBasis="(?:official-source|standard-public-reference|course-definition)"/.test(entry)) {
    errors.push(`용어 사전 ${index + 1}번 항목에 유효한 definitionBasis가 없습니다.`);
  }
  if (!/verificationBasis="[^"]+"/.test(entry)) {
    errors.push(`용어 사전 ${index + 1}번 항목에 verificationBasis가 없습니다.`);
  }
  if (/verificationStatus=/.test(entry)) {
    errors.push(`용어 사전 ${index + 1}번 항목에 이전 verificationStatus 속성이 남아 있습니다.`);
  }
}

let toolCatalog = '';
try {
  toolCatalog = await readFile(toolCatalogPath, 'utf8');
} catch {
  errors.push('data/tool-catalog.yaml을 읽을 수 없습니다.');
}
const toolBlocks = toolCatalog.split(/\r?\n(?=  - id:\s*")/).filter((block) => block.trimStart().startsWith('- id:'));
const expectedToolIds = [
  'gemini',
  'nano-banana',
  'veo',
  'antigravity',
  'chatgpt-images',
  'midjourney',
  'adobe-firefly',
  'krea',
  'veras',
  'seedance',
  'higgsfield',
  'runway',
  'claude-artifacts',
];
for (const toolId of expectedToolIds) {
  const block = toolBlocks.find((candidate) => candidate.trimStart().startsWith(`- id: "${toolId}"`));
  if (!block) {
    errors.push(`tool-catalog에 '${toolId}'가 없습니다.`);
    continue;
  }
  for (const field of ['name', 'category', 'officialUrl', 'courseRole', 'lessonIds', 'modelOrFamily', 'runtime', 'lastVerified', 'changeNotice']) {
    if (!new RegExp(`^\\s{4}${field}:`, 'm').test(block)) errors.push(`tool-catalog ${toolId}: '${field}'가 없습니다.`);
  }
  if (!/^\s{4}officialUrl:\s*"https:\/\//m.test(block)) errors.push(`tool-catalog ${toolId}: officialUrl이 유효하지 않습니다.`);
  if (!/^\s{4}lastVerified:\s*"\d{4}-\d{2}-\d{2}"/m.test(block)) errors.push(`tool-catalog ${toolId}: lastVerified가 유효하지 않습니다.`);
  if (!/^\s{4}lessonIds:\s*\[[^\]]*"01"/m.test(block)) errors.push(`tool-catalog ${toolId}: lessonIds에 '01'이 없습니다.`);
  if (/^\s{4}(?:price|pricing|credit|credits|cost):/mi.test(block)) errors.push(`tool-catalog ${toolId}: 가격 또는 크레딧 필드를 기록할 수 없습니다.`);
}
if (toolBlocks.length !== expectedToolIds.length) errors.push(`tool-catalog 도구 수: 예상 ${expectedToolIds.length}개, 실제 ${toolBlocks.length}개`);
if (!toolCatalog.includes('officialUrl: "https://help.openai.com/en/articles/11084440-images-in-chatgpt"')) {
  errors.push('ChatGPT Images 공식 URL이 현재 Help 문서와 일치하지 않습니다.');
}
if (!toolCatalog.includes('officialUrl: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them"')) {
  errors.push('Claude 공식 URL이 현재 support.claude.com 문서와 일치하지 않습니다.');
}

let lessonOneSource = '';
try {
  lessonOneSource = await readFile(path.join(lessonsDirectory, '01.mdx'), 'utf8');
} catch {
  errors.push('제1차시 본문을 읽을 수 없습니다.');
}
for (const toolName of ['Gemini', 'Nano Banana', 'Veo', 'Antigravity', 'ChatGPT Images', 'Midjourney', 'Adobe Firefly', 'Krea', 'Veras', 'Seedance', 'Higgsfield', 'Runway', 'Claude']) {
  if (!lessonOneSource.includes(toolName)) errors.push(`제1차시 도구 지형도에 '${toolName}'가 없습니다.`);
}
for (const contentKey of [
  'lesson-01/tools-overview',
  'lesson-01/practice-tools',
  'lesson-01/use-case-examples',
  'lesson-01/safety-terms',
  'lesson-01/source-inference-assumption-proposal',
  'lesson-01/response-analysis',
  'lesson-01/follow-up-actions',
]) {
  const matches = lessonOneSource.match(new RegExp(`data-content-key=["']${contentKey.replaceAll('/', '\\/')}["']`, 'g')) ?? [];
  if (matches.length !== 1) errors.push(`제1차시 공통 content key '${contentKey}': 예상 1개, 실제 ${matches.length}개`);
}
if (/Claude\s+Artifacts?/.test(lessonOneSource)) {
  errors.push('제1차시 학생 노출 콘텐츠에 Claude Artifact(s) 표기가 남아 있습니다. 도구명은 Claude로 표기합니다.');
}
for (const fieldName of ['응답 원문 또는 핵심 문장', '판단 구분', '근거 여부', '확인이 필요한 부분', '후속 조치']) {
  if (!lessonOneSource.includes(`<th>${fieldName}</th>`)) errors.push(`제1차시 대표 응답 분석표에 '${fieldName}' 필드가 없습니다.`);
}
if (lessonOneSource.includes('<th>분리한 주장</th>')) errors.push('제1차시 대표 응답 분석표에 실제 분석과 불일치하는 분리한 주장 필드가 남아 있습니다.');
if (!lessonOneSource.includes('생성형 디자인 도구 지형도')) errors.push('제1차시에 생성형 디자인 도구 지형도가 없습니다.');
if (!/label: '25~33분', detail: '생성형 디자인 도구 지형도', minutes: 8/.test(lessonOneSource)) {
  errors.push('제1차시 도구 지형도 시간이 승인된 25~33분 구간과 일치하지 않습니다.');
}
if (!/data-representative-statements="6"/.test(lessonOneSource)) {
  errors.push('제1차시에 대표 문장 6개 공동 분석 블록이 없습니다.');
}
for (const statement of ['따로 또 같이', '도심 속 거실', '동반 이용자', '2&#126;4인', '창가 배치', '중앙 기둥 또는 벽면', '주광색(주황빛)']) {
  if (!lessonOneSource.includes(statement)) errors.push(`제1차시 대표 문장 '${statement}'이 없습니다.`);
}
const rawGeminiBlock = lessonOneSource.match(/<div class="lesson-ai-response">([\s\S]*?)<\/div>/)?.[1] ?? '';
const rawGeminiParagraphs = [...rawGeminiBlock.matchAll(/<p(?:\s|>)/g)].length;
if (rawGeminiParagraphs !== 22) errors.push(`제1차시 Gemini 실제 응답 원문: 예상 22문단, 실제 ${rawGeminiParagraphs}문단`);
for (const informationType of ['원문에서 직접 확인된 내용', '추론', '가정', '디자인 제안']) {
  if (!lessonOneSource.includes(`<li>${informationType}</li>`)) errors.push(`제1차시 정보 유형 '${informationType}'이 없습니다.`);
}
for (const followUp of ['유지', '질문', '현장 확인', '전문가 확인', '수정', '제외']) {
  if (!lessonOneSource.includes(`<li>${followUp}</li>`)) errors.push(`제1차시 후속 대응 '${followUp}'이 없습니다.`);
}
if (lessonOneSource.includes('사용자 추론')) errors.push('제1차시에 문맥 없는 사용자 추론 표현이 남아 있습니다.');
if (!lessonOneSource.includes('너는 건축디자인 초기 기획을 돕는 분석 보조자다.')) {
  errors.push('제1차시 개선 요청문에 AI 역할이 명시되지 않았습니다.');
}
if (!lessonOneSource.includes('결과 공유 메모')) errors.push('제1차시에 결과 공유 메모 공간이 없습니다.');
for (const forbiddenPhrase of ['최고의 도구', '가장 정확한 도구', '저작권 문제가 없음', '상업적 사용을 보장', '건축 설계를 자동 완성', '법규·시공 가능성을 자동 검증', '전문가 검토를 대체']) {
  if (lessonOneSource.includes(forbiddenPhrase)) errors.push(`제1차시 도구 지형도 금지 표현: '${forbiddenPhrase}'`);
}

let instructorNoteMap = '';
let printStyle = '';
try { instructorNoteMap = await readFile(instructorNoteMapPath, 'utf8'); } catch { errors.push('강사 메모 슬롯 맵을 읽을 수 없습니다.'); }
try { printStyle = await readFile(printStylePath, 'utf8'); } catch { errors.push('인쇄 스타일을 읽을 수 없습니다.'); }
for (const lessonId of ['02', '03', '04']) {
  if (!instructorNoteMap.includes(`'${lessonId}': {`)) errors.push(`제${Number(lessonId)}차시 강사 메모 슬롯 맵이 없습니다.`);
}
if (!/\.time-plan__print-table[\s\S]*display:\s*table/.test(printStyle) || !/table-header-group/.test(printStyle)) {
  errors.push('PDF 시간표 인쇄 테이블 또는 반복 열 제목 스타일이 없습니다.');
}

for (let day = 1; day <= 14; day += 1) {
  const matchingFiles = dayToFiles.get(day) ?? [];
  if (matchingFiles.length === 0) errors.push(`누락된 day: ${day}`);
  if (matchingFiles.length > 1) errors.push(`중복 day ${day}: ${matchingFiles.join(', ')}`);
}

try {
  const lessonTwoPrompt = await readFile(lessonTwoPromptPath, 'utf8');
  if (lessonTwoPrompt.includes('카메라 왜곡 없음')) {
    errors.push('제2차시 prompt-02에 결과를 보장하는 카메라 왜곡 없음 표현이 남아 있습니다.');
  }
  if (!lessonTwoPrompt.includes('과도한 카메라 왜곡을 줄인 아이레벨 시점')) {
    errors.push('제2차시 prompt-02에 조건부 카메라 시점 표현이 없습니다.');
  }
} catch {
  errors.push('제2차시 prompt-02 파일을 읽을 수 없습니다.');
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
    if (!['cleared', 'review-required'].includes(rightsStatus)) {
      errors.push(`asset-manifest ${id}: 공개 자산의 rights_status는 cleared 또는 review-required여야 합니다.`);
    }
    if (rightsStatus === 'review-required') {
      const publicScope = block.match(/^\s{4}public_scope:\s*"([^"]+)"\s*$/m)?.[1];
      const provenanceNote = block.match(/^\s{4}provenance_note:\s*"([^"]+)"\s*$/m)?.[1];
      const rightsReviewNote = block.match(/^\s{4}rights_review_note:\s*"([^"]+)"\s*$/m)?.[1];
      if (!publicScope) {
        errors.push(`asset-manifest ${id}: rights_status review-required에는 public_scope가 필요합니다.`);
      }
      if (!provenanceNote) {
        errors.push(`asset-manifest ${id}: rights_status review-required에는 provenance_note가 필요합니다.`);
      }
      if (!rightsReviewNote) {
        errors.push(`asset-manifest ${id}: rights_status review-required에는 rights_review_note가 필요합니다.`);
      }
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
