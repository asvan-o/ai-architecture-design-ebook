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
const lessonFourFinalContentPath = path.resolve('src/lib/lesson04-final-content.ts');
const lessonFourReviewComponentPath = path.resolve('src/components/content/Lesson04RfpReviewPractice.astro');
const lessonFiveContentPath = path.resolve('src/lib/lesson05-plan-to-isometric.ts');
const lessonFiveComponentPath = path.resolve('src/components/content/Lesson05PlanToIsometric.astro');
const lessonSixContentPath = path.resolve('src/lib/lesson06-dwg-workflow.ts');
const lessonSixComponentPath = path.resolve('src/components/content/Lesson06DwgToExploded.astro');
const lessonSevenComponentPath = path.resolve('src/components/content/Lesson07PdfToGaussian.astro');
const lessonEightComponentPath = path.resolve('src/components/content/Lesson08GaussianUpscale.astro');
const lessonEightSr1033ScriptPath = path.resolve('src/assets/lessons/08/openvino-sr1033/run_sr1033.py');
const lessonNineComponentPath = path.resolve('src/components/content/Lesson09SpatialZoning.astro');
const lessonTenComponentPath = path.resolve('src/components/content/Lesson10GroundedLegalReview.astro');
const lessonTenContentPath = path.resolve('src/lib/lesson10-grounded-legal-review.ts');
const lessonElevenComponentPath = path.resolve('src/components/content/Lesson11LegalCrossValidation.astro');
const lessonElevenContentPath = path.resolve('src/lib/lesson11-legal-cross-validation.ts');
const lessonTwelveComponentPath = path.resolve('src/components/content/Lesson12PortfolioProjectSetup.astro');
const lessonThirteenComponentPath = path.resolve('src/components/content/Lesson13PortfolioCoverPractice.astro');
const lessonFourteenComponentPath = path.resolve('src/components/content/Lesson14ResultReportPackage.astro');
const materialFurnitureLibraryPath = path.resolve('src/components/content/MaterialFurniturePromptLibrary.astro');
const lessonTwelveToFourteenContentPath = path.resolve('src/lib/lesson12-14-portfolio-project.ts');
const approvedLessonThreeRfpSha256 =
  '95B9756FD818D8F86847CA72D1E094B9DD6C2E4B9D1DFBC029169D057E638C2E';
const requiredIds = Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'));
const approvedLessons = [
  { title: '제1차시 · AI가 할 일과 디자이너가 판단할 일', durationMinutes: 180 },
  { title: '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치', durationMinutes: 180 },
  { title: '제3차시 · 실무 의뢰와 제안요청서(RFP)를 디자인 브리프로 바꾸기', durationMinutes: 180 },
  {
    title: '제4차시 · RFP 기반 공간구성 대안 개발과 프로젝트 산출물 자동 정리',
    durationMinutes: 360,
  },
  { title: '제5차시 · 평면도 기반 AI 공간 입체화와 아이소메트릭', durationMinutes: 180 },
  { title: '제6차시 · DWG·평면도 기반 공간 수정과 3D·아이소메트릭 분해도', durationMinutes: 180 },
  { title: '제7차시 · PDF 도면 기반 공간 수정과 Gaussian Splatting 3D 시각화', durationMinutes: 180 },
  { title: '제8차시 · Gaussian 결과 현실화와 AI 업스케일', durationMinutes: 180 },
  { title: '제9차시 · 3D 콘셉트 이미지에서 공간 관계 읽기와 2D 개념 조닝', durationMinutes: 180 },
  { title: '제10차시 · 프로젝트 Grounding과 AI 법규검토 준비', durationMinutes: 180 },
  { title: '제11차시 · AI 법규검토 반복 교차검증 실습', durationMinutes: 180 },
  { title: '제12차시 · 실무 프로젝트 정의와 포트폴리오 자료 구성', durationMinutes: 180 },
  { title: '제13차시 · AI 포트폴리오 표지 페이지 제작 실습', durationMinutes: 180 },
  { title: '제14차시 · 결과보고서와 최종 제출 패키지 완성', durationMinutes: 360 },
];
const approvedRoadmapTitles = [
  '제1차시 · AI가 할 일과 디자이너가 판단할 일',
  '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치',
  '제3차시 · 실무 의뢰와 제안요청서(RFP)를 디자인 브리프로 바꾸기',
  '제4차시 · RFP 기반 공간구성 대안 개발과 프로젝트 산출물 자동 정리',
  '제5차시 · 평면도 기반 AI 공간 입체화와 아이소메트릭',
  '제6차시 · DWG·평면도 기반 공간 수정과 3D·아이소메트릭 분해도',
  '제7차시 · PDF 도면 기반 공간 수정과 Gaussian Splatting 3D 시각화',
  '제8차시 · Gaussian 결과 현실화와 AI 업스케일',
  '제9차시 · 3D 콘셉트 이미지에서 공간 관계 읽기와 2D 개념 조닝',
  '제10차시 · 프로젝트 Grounding과 AI 법규검토 준비',
  '제11차시 · AI 법규검토 반복 교차검증 실습',
  '제12차시 · 실무 프로젝트 정의와 포트폴리오 자료 구성',
  '제13차시 · AI 포트폴리오 표지 페이지 제작 실습',
  '제14차시 · 결과보고서와 최종 제출 패키지 완성',
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
    title: '3D 시각화 결과 검토와 공간 관계·개념 조닝 실습',
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
    title: '실무 데이터 기반 AI 포트폴리오 프로젝트 정의 및 제작',
    subtitle: '(프로젝트 자료 구성과 포트폴리오 제작)',
    lessonIds: ['12', '13'],
  },
  {
    number: '7',
    title: '결과보고서·최종 제출 패키지 완성 및 발표',
    subtitle: '(과정 기록과 최종 발표)',
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
  '02': ['오늘의 학습 안내', '제1차시에서 제2차시로', '프롬프트란 무엇인가', '프롬프트를 작성하기 전에 알아야 할 기본 개념', '정보 확인형 질문과 작업지시형 프롬프트', '좋은 프롬프트의 7가지 공통 규칙', '프롬프트 작성 공통 공식', '짧은 요청과 구조화된 요청 비교', '구조화된 프롬프트 문장 분석', '실습 전 예열과 실습 1 · 작업 조건표', '실습 2 · 조건표를 작업지시서로 조립하기', '실습 3~4 · 프롬프트 다듬기와 A/B 테스트', '응용 실습 · 실제 이미지 생성과 수정'],
  '03': ['차시 소개', '제2차시 복습 · 작업지시서를 다시 만들어보기', '복습 실습 1 · 주민 커뮤니티 쉼터 리모델링', '복습 실습 1 결과 샘플', '미니실습 2 · 고령 입주민을 위한 휴게 쉼터', '미니실습 2 결과 샘플', '두 실습의 차이와 제3차시 본론 연결', '제안요청서(RFP)와 디자인 브리프', '정보 분류와 전체 업무 흐름', '실습 1 · 제안요청서(RFP)를 디자인 브리프로 바꾸기', '공통 마무리 · 오류 확인과 핵심 정리'],
  '04': ['차시 소개', '제3차시 복습 · 제안요청서(RFP)에서 디자인 기준 찾기', '이번 복습에서 한 단계 더 · 재질 참고자료 활용', '복습 실습 · 제안요청서(RFP)를 읽고 디자인 3안 만들기', '복습 실습 결과 정리 · 3안 비교하기', 'Antigravity 2.0 이해와 실습 준비', 'Antigravity 2.0 사용법 · Project, Local Mode, 설정, 단축키, slash command', '무엇을 자동화할 것인가 · 설계 프로젝트 자동 정리 프로그램', '개발 실습 · ROOT와 다중 프로젝트 구조 만들기', '개발 실습 · 파일 감지와 프로그램 작동 흐름', '개발 실습 · CAD·BIM·3D·Graphic·Image·Video·Document 분류', '개발 실습 · Windows 설치 프로그램 만들기', '전체 자동화 검증', 'Antigravity 2.0으로 더 만들어볼 수 있는 건축·디자인 업무 도구'],
  '05': ['차시 소개', '오늘의 학습 흐름', '4차시 복습 확장 · 재질 선택과 무드보드', '평면도는 어떤 정보를 보여주는가', '평면도에서 사람이 먼저 읽을 것', '탑뷰 입체화란 무엇인가', '작은 객실 · 평면도에서 탑뷰 입체화', '아이소메트릭(Isometric)은 무엇인가', '작은 객실 · 탑뷰에서 아이소메트릭으로', '복합 공간 평면도 읽기', '거실·식당·주방 · 인테리어 적용', '원 평면도와 AI 결과 비교', '실습 · 평면도를 입체적으로 읽고 공간 콘셉트까지 확장하기', '결과물 정리와 검토'],
  '06': ['차시 소개', '오늘의 목표와 작업 흐름', '준비 자료 확인', 'DWG와 평면도 읽기', '확인 정보와 추정 정보 구분하기', '수정 영역 지정과 평면도 인페인팅', '수정 결과 검토', 'Top View 3D 입체화', '아이소메트릭이란?', '아이소메트릭 제작', 'Exploded Isometric View란?', '아이소메트릭 분해도 제작', '결과 검토 체크리스트', '마무리 정리'],
  '07': ['차시 소개', '오늘의 목표와 전체 워크플로우', 'STEP 1 · 전체 평면도 확인', 'PDF·이미지 기반 도면 분석', 'STEP 2 · 원하는 공간 확대', 'STEP 3 · 수정 영역 지정', 'STEP 4 · 부분 수정 결과 확인', 'STEP 5 · 전체 평면도에 다시 적용', 'Top View 3D로 연결', '한 장의 Top View 3D에서 다음 단계로', 'Mesh와 Gaussian의 아주 짧은 차이', 'Point에서 Gaussian 느낌 이해하기', 'Gaussian 하나와 많은 Gaussian', 'Splatting이란?', 'Gaussian + Splatting', 'Gaussian Splatting 작동 흐름', '왜 이번 수업에서 Gaussian을 사용하는가?', '일반 3DGS와 Single Image TripoSplat', '단일 이미지 기반 3D의 추정과 오류', 'Stability Matrix란?', 'ComfyUI란?', '설치와 권장 사양', 'TripoSplat 템플릿 읽기', 'Gaussian 개수 등 핵심 설정', 'Gaussian 결과 생성과 출력 이해', '로컬 실행이 어려울 때 · TripoSplat Web Demo', '결과 비교와 마무리'],
  '08': ['차시 소개', '제7차시 결과와 오늘의 목표', '오늘의 전체 워크플로우', 'Gaussian 결과에서 이미지 시점 선택', 'Gaussian 결과를 현실적인 건축 이미지로 변환', 'GPT · Gemini · 유료 보조 도구 결과 비교', '결과 비교 기준과 최종 후보 선택', '선택 결과 부분 보정', 'Upscale이란?', 'Resize · 일반 AI SR · OpenVINO SR1033', 'Upscale의 장점·한계와 Hallucination', '평면도 Before · After 실제 비교', 'ComfyUI Upscale 실습', 'OpenVINO CPU 기반 AI 업스케일', '실습 · SR1033 CPU 환경 구축과 실행', '저사양 PC 대안 · Hugging Face Web Upscale', '동일 원본 비교와 HITL 검수', '최종 결과 정리와 다음 차시 연결'],
  '09': ['차시 소개', '제8차시 복습과 오늘의 질문', '오늘의 전체 워크플로우', '원자료를 먼저 분석하는 이유', 'NotebookLM 원본 평면도 분석', '도면 기준표와 사람이 정리한 입력자료', 'GPT Top View 3D 생성', '원도면과 Top View 3D 검토', '공간 기능·공간 인접 관계·주요 동선 분석', 'NotebookLM 분석 결과 검증', 'Graphviz(DOT) 구조화 데이터 만들기', '2D 공간 관계 다이어그램 시각화', '공간 관계 다이어그램 읽기', '공간 관계에서 개념 조닝으로', 'GPT 개념 조닝 · 구조 확인 후 제작', '결과 정리와 제10차시 연결'],
  '10': ['차시 소개', '실습 프로젝트와 정보 혼합 위험', '왜 NotebookLM을 A와 B로 나누는가', '이번 차시의 두 결과물', 'Notebook A · 프로젝트 원자료의 역할 확인', 'Notebook A · 프로젝트 조건 기준서 만들기', '반드시 잡아야 할 오류와 과도한 해석', 'Project Grounded Reference 결과 예시', 'Notebook B · 현재 자료로 가능한 검토 범위 묻기', 'NotebookLM 분석을 ChatGPT로 교차검증', '공식 Source를 단계적으로 보강하기', 'AI 법규검토 체크리스트 결과 예시', '다음 차시 · 실제 설계자료와 대조'],
  '11': ['지난 시간 워크플로우 복습', 'NotebookLM A 역할 복습', 'B00 상태 확인', 'GPT 법규검토 프로젝트 준비', 'GPT 역할 설정 프롬프트', 'B00 기반 법규 Research', '공식 Source 확보', 'NotebookLM B Source 구성', 'NotebookLM B 1차 체크리스트 생성 프롬프트', '왜 다시 GPT로 검증하는가', 'GPT 독립 교차검증', '교차검증 결과 분기', 'NotebookLM B 보완 프롬프트', 'GPT 재검증 프롬프트', '반복형 교차검증 루프', '반복 종료 기준', '사람의 최종 검수', '교차검증 개념 설명', '3시간 수업 흐름과 마무리'],
  '12': ['차시 소개 · 하나의 실무 프로젝트를 시작한다', '통합 프로젝트와 두 산출물', '프로젝트 선정', '실무 데이터의 공개·사용 범위 점검', '실무 데이터 수집과 역할 분류', '포트폴리오와 결과보고서의 역할 구분', '모든 분야에 적용하는 포트폴리오 공통 구조', '디자인형·인테리어형 참고 구성', '설계사무소형 참고 구성', '기타 제안형·전문건설형 참고 구성', '포트폴리오 페이지를 AI로 제작하는 기본 Workflow', '제13차시 제작팩과 180분 정리'],
  '13': ['차시 소개 · 실제 Source로 표지 한 페이지를 만든다', '오늘 만들 결과와 전체 흐름', 'STEP 1 · 이 페이지의 목적', 'STEP 2 · 준비할 입력자료', 'STEP 3 · 페이지에 들어갈 실제 문구', 'STEP 4 · Nano Banana 예시 프롬프트', 'STEP 5 · Nano Banana 실제 사용 프롬프트', 'STEP 6 · 실제 생성 결과', 'STEP 7 · 생성 결과 확인 포인트', 'STEP 8 · GPT 텍스트 검증', 'STEP 9 · 표지 제작 Workflow 정리', '재질 및 가구 프롬프트 라이브러리', '분야별 적용 방향과 Source 경계', '결과 정리와 180분 운영'],
  '14': ['차시 소개 · 결과와 과정을 하나의 제출 패키지로 묶는다', '최종 산출물 2종과 역할', '프로젝트 결과보고서 · 공식 구조와 작성 가이드', '사용한 실무 데이터 정리', 'AI 활용 과정 정리', '사용 프롬프트 정리', '결과 선택·수정·검증 기록', '포트폴리오 최종 점검', '결과보고서 최종 점검', '최종 제출 패키지 구성', '제출 전 권리·보안·사실성 경계', '발표 준비', '최종 제출 Gate', '360분 운영과 과정 마무리'],
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
  const releasedPdfIds = studentRelease.releasedPdfLessonIds;
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
  if (!Array.isArray(releasedPdfIds)) {
    errors.push('학생 PDF 공개 설정의 releasedPdfLessonIds는 배열이어야 합니다.');
  } else {
    if (new Set(releasedPdfIds).size !== releasedPdfIds.length) {
      errors.push('학생 PDF 공개 설정에 중복 차시 ID가 있습니다.');
    }
    for (const id of releasedPdfIds) {
      if (!requiredIds.includes(id)) {
        errors.push(`학생 PDF 공개 설정에 허용되지 않은 차시 ID가 있습니다: ${id}`);
      }
      if (Array.isArray(releasedIds) && !releasedIds.includes(id)) {
        errors.push(`학생 PDF 공개 차시는 학생 e-book 공개 차시에 포함되어야 합니다: ${id}`);
      }
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
  } else if (id === '06') {
    if (!source.includes('<Lesson06DwgToExploded')) {
      errors.push(`${fileName}: 제6차시 전용 DWG·아이소메트릭 레이아웃이 없습니다.`);
    }
  } else if (id === '07') {
    if (!source.includes('<Lesson07PdfToGaussian')) {
      errors.push(`${fileName}: 제7차시 전용 PDF·Gaussian 레이아웃이 없습니다.`);
    }
  } else if (id === '08') {
    if (!source.includes('<Lesson08GaussianUpscale')) {
      errors.push(`${fileName}: 제8차시 전용 Gaussian 현실화·업스케일 레이아웃이 없습니다.`);
    }
  } else if (id === '09') {
    if (!source.includes('<Lesson09SpatialZoning')) {
      errors.push(`${fileName}: 제9차시 전용 공간 관계·개념 조닝 레이아웃이 없습니다.`);
    }
  } else if (id === '10') {
    if (!source.includes('<Lesson10GroundedLegalReview')) {
      errors.push(`${fileName}: 제10차시 전용 프로젝트 Grounding·법규검토 준비 레이아웃이 없습니다.`);
    }
  } else if (id === '11') {
    if (!source.includes('<Lesson11LegalCrossValidation')) {
      errors.push(`${fileName}: 제11차시 전용 법규검토 반복 교차검증 레이아웃이 없습니다.`);
    }
  } else if (id === '12') {
    if (!source.includes('<Lesson12PortfolioProjectSetup')) {
      errors.push(`${fileName}: 제12차시 전용 실무 프로젝트·자료 구성 레이아웃이 없습니다.`);
    }
  } else if (id === '13') {
    if (!source.includes('<Lesson13PortfolioCoverPractice')) {
      errors.push(`${fileName}: 제13차시 전용 포트폴리오 표지 제작 레이아웃이 없습니다.`);
    }
  } else if (id === '14') {
    if (!source.includes('<Lesson14ResultReportPackage')) {
      errors.push(`${fileName}: 제14차시 전용 결과보고서·제출 패키지 레이아웃이 없습니다.`);
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
      { marker: 'lesson03DesignBrief={{', label: '제안요청서(RFP) 디자인 브리프 통합 실습 연결' },
      { marker: 'lesson03-gemini-rfp-analysis-prompt', label: 'Gemini 분석 요청문 복사 블록' },
      { marker: 'lesson03-campus-lounge-image-brief-prompt', label: 'Design Brief 기반 이미지 작업지시 복사 블록' },
      { marker: 'Design Brief v0.1', label: '디자인 브리프 작업 초안 버전' },
      { marker: "evidenceFlow: ['제안요청서(RFP)', 'Design Brief', '현황자료', '디자인']", label: '근거 수준과 디자인 작업 흐름' },
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
      { marker: '12쪽 교육용 가상 제안요청서(RFP)를 사람이 먼저 읽은 뒤', label: '사람 우선 분석 원칙' },
      { marker: '수업 중 최소 3건을 반드시 작성', label: '불일치 최소 기록 수' },
      { marker: '출처 추적 정보: 페이지·절·REQ ID', label: '디자인 브리프 출처 추적' },
      { marker: '제3차시 결과물 → 제4차시 사용 위치', label: '제3·4차시 결과물 대응표' },
      { marker: '개인정보·기업 기밀·비공개 제안요청서(RFP)·권한 없는 도면', label: '외부 AI 업로드 보안 안내' },
      { marker: 'Gemini 3.6 Flash는 API 모델명', label: 'Gemini API 모델과 Apps 구분' },
      { marker: 'resourceDownloads={[', label: '공개 실습 자료 다운로드 구조' },
      { marker: 'assetNotes={[', label: '학생용 내부 자산 카드 차단 구조' },
      { marker: 'assetsTitle="실습 자료 다운로드"', label: '실습 자료 다운로드 섹션 제목' },
      { marker: 'A_쉼터_정면기준.jpeg', label: '복습 실습 기준 이미지 A' },
      { marker: 'B_쉼터_주변환경참고.jpeg', label: '복습 실습 기준 이미지 B' },
      { marker: 'lesson03-shelter-community-prompt', label: '주민 커뮤니티 쉼터 구조화 프롬프트' },
      { marker: 'lesson03-shelter-senior-prompt', label: '고령 입주민 쉼터 구조화 프롬프트' },
      { marker: "formula: ['목적', '맥락', '입력자료', '작업 단계', '조건·제한', '출력 형식', '검토 기준']", label: '제2차시 공통 공식 복습' },
      { marker: '주민 커뮤니티 쉼터 리모델링', label: '제3차시 복습 실습 1' },
      { marker: '고령 입주민을 위한 휴게 쉼터', label: '제3차시 미니실습 2' },
      { marker: '실제 법규상 통로 폭,', label: '기능 요구 실습 안전 경계' },
    ];
    for (const { marker, label } of requiredLessonThreeStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제3차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    for (const disallowedTool of ['Veo']) {
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
      { marker: 'reviewPractice: {', label: '제3차시 복습 RFP 실습 데이터' },
      { marker: 'ARVEN_Headquarters_Interior_RFP_v1.2.pdf', label: 'ARVEN 교육용 가상 RFP 다운로드' },
      { marker: 'lesson04Materials', label: '33개 재질 데이터 연결' },
      { marker: 'lesson04FinalContent', label: 'Antigravity 2.0 최종 콘텐츠 연결' },
      { marker: 'Option A / B / C', label: '선택 공간 3안 실습' },
      { marker: 'campus-lounge-existing-plan.png', label: '제3차시 공통 현황 평면도 재사용' },
      { marker: 'campus-lounge-existing-view-01.jpeg', label: '제3차시 공통 현황 이미지 재사용' },
      { marker: 'lesson-03-campus-lounge-rfp-v1.2.pdf', label: '제3차시 공통 RFP 재사용' },
      { marker: "'l04-material-reference-review'", label: 'Material Library 자산 ID' },
      { marker: 'antigravity-manager-build-prompt.txt', label: '완성형 자동분류 프로그램 제작 요청문' },
    ];
    for (const { marker, label } of requiredLessonFourStructures) {
      if (!source.includes(marker)) {
        errors.push(`${fileName}: 제4차시 상세 본문에 ${label} 구성이 없습니다.`);
      }
    }
    const requiredLessonFourFiles = [
      'src/assets/lessons/04/review-rfp/ARVEN_Headquarters_Interior_RFP_v1.2.pdf',
      ...Array.from({ length: 33 }, (_, index) => {
        const materialNumber = String(index + 1).padStart(2, '0');
        return `src/assets/lessons/04/material-reference-review/m-${materialNumber}-`;
      }),
    ];
    for (const filePath of requiredLessonFourFiles.slice(0, 1)) {
      try {
        await access(path.resolve(filePath));
      } catch {
        errors.push(`${fileName}: 제4차시 필수 파일을 찾을 수 없습니다: ${filePath}`);
      }
    }
    let lessonFourFinalContent = '';
    let lessonFourReviewComponent = '';
    try { lessonFourFinalContent = await readFile(lessonFourFinalContentPath, 'utf8'); } catch { errors.push('제4차시 최종 콘텐츠 데이터를 읽을 수 없습니다.'); }
    try { lessonFourReviewComponent = await readFile(lessonFourReviewComponentPath, 'utf8'); } catch { errors.push('제4차시 복습 컴포넌트를 읽을 수 없습니다.'); }
    const materialEntries = [...lessonFourFinalContent.matchAll(/id: 'M-\d{2}'/g)].length;
    if (materialEntries !== 33) errors.push(`제4차시 Material Card 데이터: 예상 33개, 실제 ${materialEntries}개`);
    const materialFiles = [...lessonFourFinalContent.matchAll(/fileName: '(m-\d{2}-[^']+\.png)'/g)].map((match) => match[1]);
    if (materialFiles.length !== 33 || new Set(materialFiles).size !== 33) {
      errors.push('제4차시 Material Library 파일명이 33개 고유 항목과 일치하지 않습니다.');
    }
    for (const materialFile of materialFiles) {
      try { await access(path.resolve('src/assets/lessons/04/material-reference-review', materialFile)); }
      catch { errors.push(`제4차시 재질 파일을 찾을 수 없습니다: ${materialFile}`); }
    }
    const programIdeas = [...lessonFourFinalContent.matchAll(/number: \d+, title:/g)].length;
    if (programIdeas !== 10) errors.push(`제4차시 추가 프로그램: 예상 10개, 실제 ${programIdeas}개`);
    for (const auditMarker of ["file: '0번.mp4', duration: '00:22.5', discovered: 10", "file: '1번.mp4', duration: '00:20.1', discovered: 10", "file: '2번.mp4', duration: '00:20.3', discovered: 5", "file: '3번.mp4', duration: '00:21.5', discovered: 10", 'beforeDeduplication: 35', 'afterDeduplication: 33']) {
      if (!lessonFourFinalContent.includes(auditMarker)) errors.push(`제4차시 재질 감사 기록 누락: ${auditMarker}`);
    }
    for (const marker of [
      'Always Proceed',
      '/grill-me',
      '/goal',
      'Ctrl + K',
      '98_REVIEW',
      "koreanName: '설계 프로젝트 자동 정리 프로그램'",
      "stack: ['Electron', 'Node.js', 'HTML', 'CSS', 'JavaScript', 'chokidar', 'Electron Forge']",
      "excludedStack: ['React', 'Next.js', 'Express'",
      "['MP4 · MOV · AVI · MKV · WEBM · M4V · WMV · MPEG · MPG · MTS · M2TS', '06_ASSETS/VIDEO']",
      "['그 밖의 일반 파일', '06_ASSETS/OTHER']",
      'X 종료 후에는 watcher와 앱 프로세스가 남지 않는가?',
    ]) {
      if (!lessonFourFinalContent.includes(marker)) errors.push(`제4차시 최종 콘텐츠에 '${marker}'가 없습니다.`);
    }
    if (!lessonFourReviewComponent.includes('재질 이미지 다운로드')) errors.push('제4차시 재질 다운로드 연결이 없습니다.');
    if (lessonFourReviewComponent.includes('lesson04-material-selection')) errors.push('제4차시에서 제거 대상 재질 체크박스가 남아 있습니다.');
    if (!lessonFourReviewComponent.includes('lesson04-review-output-prompt')) errors.push('제4차시 Nano Banana용 출력 프롬프트 샘플이 없습니다.');
    if (!lessonFourReviewComponent.includes('STEP 8')) errors.push('제4차시 복습 Step 1~8이 완성되지 않았습니다.');
    for (const retiredManagerItem of [
      'antigravity-manager-approval-prompt.txt',
      'AI_건축_캠퍼스라운지_복구본.zip?url',
      "label: 'Gemini API 이미지 용도 분류'",
      "label: '작업파일 Revision 라벨링'",
    ]) {
      if (source.includes(retiredManagerItem)) errors.push(`${fileName}: 제거 대상 이전 관리 프로그램 항목 '${retiredManagerItem}'이 남아 있습니다.`);
    }
    for (const retiredSection of ['제공 자료와 제3차시 작업물 가져오기', '대안 A·B 운영전략과 조닝 작성']) {
      if (source.includes(retiredSection)) errors.push(`${fileName}: 제거 대상 중복 섹션 '${retiredSection}'이 남아 있습니다.`);
    }
  }
  if (id === '05') {
    const requiredLessonFiveSourceMarkers = [
      { marker: 'lesson05PlanToIsometric', label: '제5차시 전용 평면도 입체화 레이아웃' },
      { marker: "'l05-material-moodboard-review'", label: '재질 선택·무드보드 복습 자산' },
      { marker: "'l05-small-room-plan'", label: '작은 객실 교육용 평면도 자산' },
      { marker: "'l05-small-room-topview'", label: '작은 객실 탑뷰 입체화 자산' },
      { marker: "'l05-small-room-isometric'", label: '작은 객실 아이소메트릭 자산' },
      { marker: "'l05-living-kitchen-plan'", label: '복합 공간 교육용 평면도 자산' },
      { marker: "'l05-living-kitchen-isometric'", label: '복합 공간 인테리어 적용 자산' },
    ];
    for (const { marker, label } of requiredLessonFiveSourceMarkers) {
      if (!source.includes(marker)) errors.push(`${fileName}: ${label} 연결이 없습니다.`);
    }

    for (const retiredLessonFiveItem of [
      'l05-doc-pack',
      'l05-workflow-map',
      'l05-demo',
      '회의 메모 분류',
      '클라이언트 수정 요청표',
      '원문 대조 및 오류 확인표',
    ]) {
      if (source.includes(retiredLessonFiveItem)) {
        errors.push(`${fileName}: 제거 대상 이전 제5차시 항목 '${retiredLessonFiveItem}'이 남아 있습니다.`);
      }
    }

    let lessonFiveContent = '';
    let lessonFiveComponent = '';
    try { lessonFiveContent = await readFile(lessonFiveContentPath, 'utf8'); }
    catch { errors.push('제5차시 평면도 입체화 콘텐츠 데이터를 읽을 수 없습니다.'); }
    try { lessonFiveComponent = await readFile(lessonFiveComponentPath, 'utf8'); }
    catch { errors.push('제5차시 평면도 입체화 컴포넌트를 읽을 수 없습니다.'); }

    for (const marker of [
      'lesson05-plan-to-topview-prompt',
      'lesson05-topview-to-isometric-prompt',
      'lesson05-plan-to-interior-isometric-prompt',
      'lesson05-plan-result-comparison-prompt',
      'Lesson05MaterialMoodboardReview',
      '아이소메트릭(Isometric)은 무엇인가',
      '생성형 AI로 공간구조를 이해하고 설명하기 위한 아이소메트릭 스타일 3D',
      '먼저 공간구조를 확인하고, 그 다음 디자인을 적용한다.',
      '평면도 다운로드',
    ]) {
      if (!lessonFiveComponent.includes(marker)) {
        errors.push(`제5차시 평면도 입체화 컴포넌트에 '${marker}'가 없습니다.`);
      }
    }
    for (const marker of [
      'topviewPrompt',
      'isometricPrompt',
      'interiorConceptPrompt',
      'comparisonPrompt',
      'AI의 비교 결과도 정답으로 확정하지 않는다.',
      '정확한 기술도면, 엄밀한 아이소메트릭 투영 또는 BIM 모델',
    ]) {
      if (!lessonFiveContent.includes(marker)) {
        errors.push(`제5차시 평면도 입체화 콘텐츠에 '${marker}'가 없습니다.`);
      }
    }

    const lessonFiveFiles = [
      'src/assets/lessons/05/plan-to-isometric/01-small-room-plan.png',
      'src/assets/lessons/05/plan-to-isometric/02-small-room-topview-3d.png',
      'src/assets/lessons/05/plan-to-isometric/03-small-room-isometric.png',
      'src/assets/lessons/05/plan-to-isometric/04-living-kitchen-plan.png',
      'src/assets/lessons/05/plan-to-isometric/05-living-kitchen-isometric-interior.png',
    ];
    for (const filePath of lessonFiveFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(`${fileName}: 제5차시 필수 파일을 찾을 수 없습니다: ${filePath}`); }
    }
  }
  if (id === '06') {
    const requiredLessonSixSourceMarkers = [
      { marker: 'Lesson06DwgToExploded', label: '제6차시 전용 DWG·아이소메트릭 레이아웃' },
      { marker: "'l06-dwg-source'", label: '원본 DWG 자산' },
      { marker: "'l06-original-plan'", label: '원본 평면도 자산' },
      { marker: "'l06-edit-area-plan'", label: '수정 영역 표시 평면도 자산' },
      { marker: "'l06-modified-plan'", label: '수정 평면도 자산' },
      { marker: "'l06-top-view-3d'", label: 'Top View 3D 자산' },
      { marker: "'l06-isometric'", label: '아이소메트릭 자산' },
      { marker: "'l06-exploded-isometric'", label: '아이소메트릭 분해도 자산' },
    ];
    for (const { marker, label } of requiredLessonSixSourceMarkers) {
      if (!source.includes(marker)) errors.push(`${fileName}: ${label} 연결이 없습니다.`);
    }

    for (const retiredLessonSixItem of [
      'l06-brief-pack',
      'l06-reference-set',
      'l06-demo',
      '클라이언트 의뢰를 디자인 브리프로 변환하기',
      '가상 문의 메일',
      '가상 미팅 메모',
    ]) {
      if (source.includes(retiredLessonSixItem)) {
        errors.push(`${fileName}: 제거 대상 이전 제6차시 항목 '${retiredLessonSixItem}'이 남아 있습니다.`);
      }
    }

    let lessonSixContent = '';
    let lessonSixComponent = '';
    try { lessonSixContent = await readFile(lessonSixContentPath, 'utf8'); }
    catch { errors.push('제6차시 DWG·아이소메트릭 콘텐츠 데이터를 읽을 수 없습니다.'); }
    try { lessonSixComponent = await readFile(lessonSixComponentPath, 'utf8'); }
    catch { errors.push('제6차시 DWG·아이소메트릭 컴포넌트를 읽을 수 없습니다.'); }

    for (const marker of [
      'lesson06-plan-edit-prompt',
      'lesson06-top-view-prompt',
      'lesson06-isometric-prompt',
      'lesson06-exploded-isometric-prompt',
      'DWG와 평면도 이미지를 함께 쓰는 이유',
      'Top View 3D는 평면도를 가능한 유지하면서',
      '아이소메트릭 스타일 시각화',
      'X·Y 위치, 크기, 방향과 회전은 유지하고 Z축 높이만',
      '원본 DWG',
    ]) {
      if (!lessonSixComponent.includes(marker)) {
        errors.push(`제6차시 DWG·아이소메트릭 컴포넌트에 '${marker}'가 없습니다.`);
      }
    }
    const promptBlockCount = (lessonSixComponent.match(/<PromptCopyBlock\b/g) ?? []).length;
    if (promptBlockCount !== 4) {
      errors.push(`제6차시 PromptCopyBlock 수: 예상 4개, 실제 ${promptBlockCount}개`);
    }
    for (const marker of [
      'lesson06LearningGoals',
      'lesson06Deliverables',
      'planEditPrompt',
      'topViewPrompt',
      'isometricPrompt',
      'explodedIsometricPrompt',
      '수직 Z축 방향으로만 분리',
      '실제 치수, 구조 안전, 법규, 설비, 재료 성능과 시공 가능성',
    ]) {
      if (!lessonSixContent.includes(marker)) {
        errors.push(`제6차시 DWG·아이소메트릭 콘텐츠에 '${marker}'가 없습니다.`);
      }
    }

    const lessonSixFiles = [
      'src/assets/lessons/06/dwg-to-exploded/two-story-house-source.dwg',
      'src/assets/lessons/06/dwg-to-exploded/01-original-first-floor-plan.png',
      'src/assets/lessons/06/dwg-to-exploded/02-edit-area-marked-plan.png',
      'src/assets/lessons/06/dwg-to-exploded/03-modified-first-floor-plan.png',
      'src/assets/lessons/06/dwg-to-exploded/04-top-view-3d.png',
      'src/assets/lessons/06/dwg-to-exploded/05-isometric.png',
      'src/assets/lessons/06/dwg-to-exploded/06-exploded-isometric.jpeg',
    ];
    for (const filePath of lessonSixFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(`${fileName}: 제6차시 필수 파일을 찾을 수 없습니다: ${filePath}`); }
    }
  }
  if (id === '07') {
    let lessonSevenComponent = '';
    try { lessonSevenComponent = await readFile(lessonSevenComponentPath, 'utf8'); }
    catch { errors.push('제7차시 PDF·Gaussian 컴포넌트를 읽을 수 없습니다.'); }

    for (const marker of [
      '현장 제공 원본자료 · 공개 e-book 미수록',
      '회사·프로젝트 도면 사용 주의',
      'AI에 업로드할 수 있는 파일과 업로드해도 되는 파일은 같은 의미가 아닙니다.',
      'lesson07-pdf-analysis',
      'lesson07-local-edit',
      'lesson07-composite',
      'Point에서 Gaussian 느낌 이해하기',
      'Single 2D Image → 3D Gaussian Splat',
      'sampling_num_gaussians',
      'https://huggingface.co/spaces/VAST-AI/TripoSplat',
      'data-lesson07-practice-tip="server-browser-ui"',
      'data-lesson07-practice-tip="desktop-shortcut"',
      'http://127.0.0.1:8188',
      '--launch-package ComfyUI',
      '다음 차시에서는 생성된 이미지 결과를 후처리하고 해상도와 디테일을 보완하는 작업으로 확장합니다.',
    ]) {
      if (!lessonSevenComponent.includes(marker)) {
        errors.push(`제7차시 PDF·Gaussian 컴포넌트에 '${marker}'가 없습니다.`);
      }
    }
    const lessonSevenPromptCount = (lessonSevenComponent.match(/<PromptCopyBlock\b/g) ?? []).length;
    if (lessonSevenPromptCount !== 3) {
      errors.push(`제7차시 PromptCopyBlock 수: 예상 3개, 실제 ${lessonSevenPromptCount}개`);
    }
    for (const privateMarker of ['(수강)', 'C:\\Users\\', '7차시_00_', '7차시_02_', '7차시_03_', '7차시_04_', '7차시_05_']) {
      if (source.includes(privateMarker) || lessonSevenComponent.includes(privateMarker)) {
        errors.push(`제7차시 학생용 콘텐츠에 비공개 식별 정보 '${privateMarker}'가 있습니다.`);
      }
    }
    const lessonSevenFiles = [
      'src/assets/lessons/07/floor-plan-edit-example/01-floor-plan-original-example.png',
      'src/assets/lessons/07/floor-plan-edit-example/02-storage-room-original.png',
      'src/assets/lessons/07/floor-plan-edit-example/03-storage-room-edit-area.png',
      'src/assets/lessons/07/floor-plan-edit-example/04-storage-room-edited.png',
      'src/assets/lessons/07/floor-plan-edit-example/05-floor-plan-integrated.png',
    ];
    for (const filePath of lessonSevenFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(fileName + ': 제7차시 공개 예시 파일을 찾을 수 없습니다: ' + filePath); }
    }
  }
  if (id === '08') {
    let lessonEightComponent = '';
    let lessonEightSr1033Script = '';
    try { lessonEightComponent = await readFile(lessonEightComponentPath, 'utf8'); }
    catch { errors.push('제8차시 Gaussian 현실화·업스케일 컴포넌트를 읽을 수 없습니다.'); }
    try { lessonEightSr1033Script = await readFile(lessonEightSr1033ScriptPath, 'utf8'); }
    catch { errors.push('제8차시 OpenVINO SR1033 실행 스크립트를 읽을 수 없습니다.'); }

    for (const marker of [
      '같은 입력 이미지를 사용해도 AI 서비스와 모델에 따라',
      '업스케일은 원본에 숨어 있던 실제 정보를 되찾는 과정이 아니다.',
      '선명해진 것과 정확해진 것은 같은 의미가 아니다.',
      'VHS_LoadImages',
      'RealESRGAN_x2.pth',
      '4x-UltraSharp.pth',
      'https://huggingface.co/spaces/bookbot/Image-Upscaling-Playground',
      'https://huggingface.co/spaces?category=image-upscaling',
      'single-image-super-resolution-1033',
      'data-lesson08-openvino-model="single-image-super-resolution-1033"',
      '저사양 PC에서도 실행하는 SR1033 3× Super Resolution',
      'Python 설치 완료 후 현재 PowerShell 창을 완전히 닫고 새 PowerShell을 다시 실행한다.',
      '[Environment+SpecialFolder]::DesktopDirectory',
      '.\\.venv\\Scripts\\python.exe',
      'lesson08-openvino-winget-check',
      'lesson08-openvino-python-install',
      'lesson08-openvino-project-setup',
      'lesson08-openvino-model-download',
      'lesson08-openvino-create-script',
      'lesson08-openvino-run',
      'lesson08-openvino-reuse',
      '선명해진 것과 정확해진 것은 같은 의미가 아니다.',
      '도면에서는 보기 좋은 결과보다 원본 정보 보존이 우선이다.',
      '유지됨',
      '변화 있음',
      '확인 필요',
    ]) {
      if (!lessonEightComponent.includes(marker)) {
        errors.push(`제8차시 Gaussian 현실화·업스케일 컴포넌트에 '${marker}'가 없습니다.`);
      }
    }
    const lessonEightPromptCount = (lessonEightComponent.match(/<PromptCopyBlock\b/g) ?? []).length;
    if (lessonEightPromptCount !== 15) {
      errors.push(`제8차시 PromptCopyBlock 수: 예상 15개, 실제 ${lessonEightPromptCount}개`);
    }
    for (const scriptMarker of [
      'MODEL_PATH = ROOT / "model" / "single-image-super-resolution-1033.xml"',
      'TILE_W = 640',
      'TILE_H = 360',
      'SCALE = 3',
      'MARGIN = 10',
      'cv2.INTER_CUBIC',
      'core.compile_model(',
      '"CPU"',
      '_SR1033_3x.png',
      '_Bicubic_3x.png',
    ]) {
      if (!lessonEightSr1033Script.includes(scriptMarker)) {
        errors.push(`제8차시 SR1033 실행 스크립트에 '${scriptMarker}'가 없습니다.`);
      }
    }
    for (const removedMarker of [
      'text-image-super-resolution-0001',
      'C:\\OpenVINO_TextSR',
      '$HOME',
      'py -3.12',
      'Activate.ps1',
    ]) {
      if (source.includes(removedMarker) || lessonEightComponent.includes(removedMarker) || lessonEightSr1033Script.includes(removedMarker)) {
        errors.push(`제8차시 OpenVINO 실습에 제거 대상 '${removedMarker}'가 남아 있습니다.`);
      }
    }
    for (const privateMarker of ['(수강)', 'C:\\Users\\', '7차시_00_', '7차시_07_', '3D가우시안']) {
      if (source.includes(privateMarker) || lessonEightComponent.includes(privateMarker)) {
        errors.push(`제8차시 학생용 콘텐츠에 비공개 식별 정보 '${privateMarker}'가 있습니다.`);
      }
    }
    const lessonEightFiles = [
      'src/assets/lessons/08/gaussian-render-comparison/01-gaussian-source.png',
      'src/assets/lessons/08/gaussian-render-comparison/02-chatgpt-render.png',
      'src/assets/lessons/08/gaussian-render-comparison/03-gemini-nano-banana-prompt.jpeg',
      'src/assets/lessons/08/gaussian-render-comparison/04-gemini-nano-banana-agent.jpeg',
      'src/assets/lessons/08/gaussian-render-comparison/05-vibe3d-render.png',
      'src/assets/lessons/08/gaussian-render-comparison/06-vibe3d-relight-render.png',
      'src/assets/lessons/08/floor-plan-upscale/01-floor-plan-before-upscale.png',
      'src/assets/lessons/08/floor-plan-upscale/02-floor-plan-after-upscale-2x.png',
      'src/assets/lessons/08/upscale-workflow/lesson-08-upscale-workflow.json',
      'src/assets/lessons/08/openvino-sr1033/run_sr1033.py',
    ];
    for (const filePath of lessonEightFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(`${fileName}: 제8차시 필수 파일을 찾을 수 없습니다: ${filePath}`); }
    }
  }
  if (id === '09') {
    let lessonNineComponent = '';
    try { lessonNineComponent = await readFile(lessonNineComponentPath, 'utf8'); }
    catch { errors.push('제9차시 공간 관계·개념 조닝 컴포넌트를 읽을 수 없습니다.'); }

    for (const marker of [
      '원본 도면에서 AI 입력에 불필요하다고 판단한 선을 사람이 직접 정리한 수업 예시입니다.',
      'Grounding은 오류를 줄이는 방법이지 이미지 생성 정확도를 보장하는 기능이 아니다.',
      'Graphviz(DOT)는 이번 실습에서 검증된 공간 관계를 노드와 연결선으로 표현하기 위한 텍스트 기반 그래프 정의 방식이다.',
      '개념 설명용 도식 · 실제 AI 생성 결과가 아님',
      'data-lesson09-validation="keep-review-unknown"',
      'data-lesson09-relation-set="final-criteria"',
      '원자료에 근거한 AI 분석도 오독할 수 있으므로, 첫 분석 결과를 바로 확정하지 않고 원본 도면과 다시 대조합니다.',
      '최종 확정 기준표는 후속 AI 작업을 위한 보조 기준이며, 충돌 시 원본 평면도가 우선입니다.',
      '공간 관계 다이어그램은 평면도 분석 내용을 모두 복사하는 것이 아니라, 관계와 동선을 이해하는 데 필요한 정보만 선택해 단순화합니다.',
      'https://viz-js.com/',
      'http://webgraphviz.com/',
      'Lesson09SpatialZoning',
      "'l09-human-cleaned-floor-plan'",
      "'l09-top-view-3d'",
      "'l09-spatial-relationship-diagram-notebooklm'",
      "'l09-spatial-relationship-diagram-chatgpt'",
    ]) {
      if (!source.includes(marker) && !lessonNineComponent.includes(marker)) {
        errors.push(`제9차시 공간 관계·개념 조닝 콘텐츠에 '${marker}'가 없습니다.`);
      }
    }

    const lessonNinePromptCount = (lessonNineComponent.match(/<PromptCopyBlock\b/g) ?? []).length;
    if (lessonNinePromptCount !== 8) {
      errors.push(`제9차시 PromptCopyBlock 수: 예상 8개, 실제 ${lessonNinePromptCount}개`);
    }
    for (const promptIndex of Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'))) {
      if (!lessonNineComponent.includes(`lesson09-prompt-${promptIndex}`)) {
        errors.push(`제9차시 PromptCopyBlock lesson09-prompt-${promptIndex}가 없습니다.`);
      }
    }

    for (const forbiddenMarker of [
      'Bridge 단계',
      '브릿지 단계',
      '공식적인 3D→2D 역추출 단계',
      'C:\\Users\\',
      '* 수정 대상(CHANGE)',
      '계단참 +2,200',
      '(업무 / -30mm)',
      'Deck1 -> Meeting',
      'Deck3 -> Stairs',
      'Office -> Pantry [dir=both',
    ]) {
      if (source.includes(forbiddenMarker) || lessonNineComponent.includes(forbiddenMarker)) {
        errors.push(`제9차시 학생용 콘텐츠에 금지 표현 또는 로컬 경로 '${forbiddenMarker}'가 있습니다.`);
      }
    }

    const lessonNineFiles = [
      'src/assets/lessons/09/spatial-zoning/01-floor-plan-cleaned.jpg',
      'src/assets/lessons/09/spatial-zoning/02-floor-plan-top-view-3d.jpeg',
      'src/assets/lessons/09/spatial-zoning/03-spatial-relationship-diagram-notebooklm.png',
      'src/assets/lessons/09/spatial-zoning/04-spatial-relationship-diagram-chatgpt.png',
    ];
    for (const filePath of lessonNineFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(`${fileName}: 제9차시 필수 공개 이미지를 찾을 수 없습니다: ${filePath}`); }
    }
  }
  if (id === '10') {
    let lessonTenComponent = '';
    let lessonTenContent = '';
    try { lessonTenComponent = await readFile(lessonTenComponentPath, 'utf8'); }
    catch { errors.push('제10차시 프로젝트 Grounding·법규검토 컴포넌트를 읽을 수 없습니다.'); }
    try { lessonTenContent = await readFile(lessonTenContentPath, 'utf8'); }
    catch { errors.push('제10차시 프로젝트 Grounding·법규검토 콘텐츠 데이터를 읽을 수 없습니다.'); }

    for (const marker of [
      'AI에게 프로젝트 문서와 법규를 한꺼번에 넣으면 정확한 설계 검토가 가능할까?',
      '이번 실습의 목표는 AI로 법규 적합 여부를 자동 판정하는 것이 아닙니다.',
      'data-lesson10-workflow',
      'data-lesson10-source-pack="a01-a07"',
      'data-lesson10-normalized-table',
      'data-lesson10-result-sample="a99"',
      'data-lesson10-result-sample="b99"',
      'NotebookLM은 현재 가진 자료 안에서 분석하고, ChatGPT는 그 분석을 외부 정보와 교차검증하는 데 활용합니다.',
      '최종 근거는 AI의 답변이 아니라 사람이 확인한 공식 원문입니다.',
      '현행 법령의 대체 근거로 사용하지 않는다.',
      '저장소와 공개 e-book에 포함하지 않는다.',
    ]) {
      if (!source.includes(marker) && !lessonTenComponent.includes(marker) && !lessonTenContent.includes(marker)) {
        errors.push(`제10차시 프로젝트 Grounding·법규검토 콘텐츠에 '${marker}'가 없습니다.`);
      }
    }

    const projectSourceCodes = [...lessonTenContent.matchAll(/code: 'A0[1-7]'/g)].length;
    if (projectSourceCodes !== 7) {
      errors.push(`제10차시 프로젝트 원자료 Source: 예상 7개, 실제 ${projectSourceCodes}개`);
    }
    for (const sourceCode of ['B03', 'B06', 'B07', 'B08', 'B08-1', 'B05-1', 'B90']) {
      if (!lessonTenContent.includes(`code: '${sourceCode}'`)) {
        errors.push(`제10차시 법규 Source ${sourceCode}가 없습니다.`);
      }
    }
    for (const promptId of [
      'lesson10-prompt-a00',
      'lesson10-prompt-a01',
      'lesson10-prompt-a02',
      'lesson10-prompt-a025',
      'lesson10-prompt-b01',
      'lesson10-prompt-x01',
      'lesson10-prompt-b02',
    ]) {
      if (!lessonTenContent.includes(`id: '${promptId}'`) || !lessonTenComponent.includes(`'${promptId}'`)) {
        errors.push(`제10차시 PromptCopyBlock 데이터 또는 연결 ${promptId}가 없습니다.`);
      }
    }
    for (const column of ['구분', '항목', '최종 확인 내용', '상태', 'Source', '후속 검증 필요 여부']) {
      if (!lessonTenComponent.includes(`<th>${column}</th>`) && !lessonTenContent.includes(column)) {
        errors.push(`제10차시 프로젝트 조건 표 열 '${column}'이 없습니다.`);
      }
    }
    for (const status of ['확정', '계획조건', '예시', '추가 확인 필요']) {
      if (!lessonTenContent.includes(status)) errors.push(`제10차시 프로젝트 상태 '${status}'가 없습니다.`);
    }
    for (const status of ['기준 확인 완료', '적용 여부 확인 필요', '설계자료 필요', '추가 공식 Source 필요']) {
      if (!lessonTenContent.includes(status)) errors.push(`제10차시 법규검토 상태 '${status}'가 없습니다.`);
    }
    for (const forbiddenMarker of [
      'C:\\Users\\',
      'file://',
      '<a download',
      '법규 적합 여부를 자동 판정합니다',
      '법규 적합 판정 결과',
    ]) {
      if (source.includes(forbiddenMarker) || lessonTenComponent.includes(forbiddenMarker) || lessonTenContent.includes(forbiddenMarker)) {
        errors.push(`제10차시 학생용 콘텐츠에 금지 표현·경로·다운로드 '${forbiddenMarker}'가 있습니다.`);
      }
    }
  }
  if (id === '11') {
    let lessonElevenComponent = '';
    let lessonElevenContent = '';
    try { lessonElevenComponent = await readFile(lessonElevenComponentPath, 'utf8'); }
    catch { errors.push('제11차시 법규검토 반복 교차검증 컴포넌트를 읽을 수 없습니다.'); }
    try { lessonElevenContent = await readFile(lessonElevenContentPath, 'utf8'); }
    catch { errors.push('제11차시 법규검토 반복 교차검증 콘텐츠 데이터를 읽을 수 없습니다.'); }

    for (const marker of [
      'data-lesson11-cross-validation',
      '자료를 정리하고, 근거를 찾고, 서로 다른 AI로 반복 검증하되 최종 판단은 사람이 한다.',
      'NotebookLM A는 법규 판단용 Notebook이 아니다.',
      'B00은 법규가 아니라 프로젝트 조건의 기준점이다.',
      'GPT 답변 ≠ 법적 근거 Source',
      '왜 원자료 전체를 다시 넣지 않는가',
      '법규 문제',
      '프로젝트 사실 문제',
      'AI 두 개가 같은 답을 했다고 해서 사실이 되는 것이 아니다.',
      '무료 계정은 파일 업로드 및 사용량에 제한이 있을 수 있으므로 핵심 파일 중심으로 작업합니다.',
      'data-lesson11-b00-checks',
      'data-lesson11-loop-stop',
    ]) {
      if (!source.includes(marker) && !lessonElevenComponent.includes(marker) && !lessonElevenContent.includes(marker)) {
        errors.push(`제11차시 법규검토 반복 교차검증 콘텐츠에 '${marker}'가 없습니다.`);
      }
    }

    const lessonElevenPromptIds = [
      'lesson11-prompt-01',
      'lesson11-prompt-02',
      'lesson11-prompt-03',
      'lesson11-prompt-04',
      'lesson11-prompt-05',
      'lesson11-prompt-06',
    ];
    for (const promptId of lessonElevenPromptIds) {
      if (!lessonElevenContent.includes(`id: '${promptId}'`) || !lessonElevenComponent.includes(`'${promptId}'`)) {
        errors.push(`제11차시 PromptCopyBlock 데이터 또는 연결 ${promptId}가 없습니다.`);
      }
    }
    const lessonElevenPromptCount = [...lessonElevenContent.matchAll(/id: 'lesson11-prompt-\d{2}'/g)].length;
    if (lessonElevenPromptCount !== 6) {
      errors.push(`제11차시 PromptCopyBlock: 예상 6개, 실제 ${lessonElevenPromptCount}개`);
    }
    const lessonElevenTimeTotal = [...lessonElevenContent.matchAll(/minutes:\s*(\d+)/g)]
      .reduce((total, match) => total + Number(match[1]), 0);
    if (lessonElevenTimeTotal !== 180) {
      errors.push(`제11차시 시간표: 예상 180분, 실제 ${lessonElevenTimeTotal}분`);
    }
    for (const status of ['확정', '계획조건', '미확정', '추가 확인 필요']) {
      if (!lessonElevenComponent.includes(status) && !lessonElevenContent.includes(status)) {
        errors.push(`제11차시 B00 상태 '${status}'가 없습니다.`);
      }
    }
    for (const forbiddenMarker of [
      'C:\\Users\\',
      'file://',
      '<a download',
      '법적 적합성을 자동 판정',
      '최종 법적 적합성을 확정합니다',
    ]) {
      if (source.includes(forbiddenMarker) || lessonElevenComponent.includes(forbiddenMarker) || lessonElevenContent.includes(forbiddenMarker)) {
        errors.push(`제11차시 학생용 콘텐츠에 금지 표현·경로·다운로드 '${forbiddenMarker}'가 있습니다.`);
      }
    }
  }
  if (id === '12') {
    let lessonTwelveComponent = '';
    let portfolioProjectContent = '';
    try { lessonTwelveComponent = await readFile(lessonTwelveComponentPath, 'utf8'); }
    catch { errors.push('제12차시 실무 프로젝트·자료 구성 컴포넌트를 읽을 수 없습니다.'); }
    try { portfolioProjectContent = await readFile(lessonTwelveToFourteenContentPath, 'utf8'); }
    catch { errors.push('제12~14차시 통합 프로젝트 콘텐츠 데이터를 읽을 수 없습니다.'); }
    for (const marker of [
      'data-lesson12-project-setup',
      '포트폴리오는 결과를 보여주는 문서이고, 결과보고서는 작업 과정을 설명하는 문서입니다.',
      '사용 권한이 확인되지 않았다면 넣지 않는다.',
      '외부 AI 서비스에 올릴 권한이 있는가?',
      '제13차시 제작팩',
      'data-lesson12-time-total',
    ]) {
      if (!lessonTwelveComponent.includes(marker) && !portfolioProjectContent.includes(marker)) {
        errors.push(`제12차시 실무 프로젝트 콘텐츠에 구조 '${marker}'가 없습니다.`);
      }
    }
    const lessonTwelveTimeBlock = portfolioProjectContent.match(/lesson12TimePlan[\s\S]*?lesson13TimePlan/)?.[0] ?? '';
    const lessonTwelveTimeTotal = [...lessonTwelveTimeBlock.matchAll(/minutes:\s*(\d+)/g)]
      .reduce((total, match) => total + Number(match[1]), 0);
    if (lessonTwelveTimeTotal !== 180) {
      errors.push(`제12차시 시간표: 예상 180분, 실제 ${lessonTwelveTimeTotal}분`);
    }
  }
  if (id === '13') {
    let lessonThirteenComponent = '';
    let materialFurnitureLibrary = '';
    let portfolioProjectContent = '';
    try { lessonThirteenComponent = await readFile(lessonThirteenComponentPath, 'utf8'); }
    catch { errors.push('제13차시 포트폴리오 표지 제작 컴포넌트를 읽을 수 없습니다.'); }
    try { materialFurnitureLibrary = await readFile(materialFurnitureLibraryPath, 'utf8'); }
    catch { errors.push('재질 및 가구 프롬프트 라이브러리 컴포넌트를 읽을 수 없습니다.'); }
    try { portfolioProjectContent = await readFile(lessonTwelveToFourteenContentPath, 'utf8'); }
    catch { errors.push('제12~14차시 통합 프로젝트 콘텐츠 데이터를 읽을 수 없습니다.'); }
    for (const marker of [
      'data-lesson13-cover-practice',
      'data-material-furniture-prompt-library',
      '텍스트 폴더 확인 결과 · 파일 0개',
      '실제 생성 시안 10개',
      '04→05',
      '04→06',
      'data-lesson13-time-total',
    ]) {
      if (!lessonThirteenComponent.includes(marker) && !materialFurnitureLibrary.includes(marker)) {
        errors.push(`제13차시 표지·프롬프트 라이브러리에 구조 '${marker}'가 없습니다.`);
      }
    }
    const promptIds = [
      'lesson13-cover-template-prompt',
      'lesson13-cover-used-prompt',
      'lesson13-cover-text-review-prompt',
      'material-library-common-geometry',
      'material-library-material-change',
      'material-library-furniture-change',
      'material-library-house-front-sequence',
    ];
    for (const promptId of promptIds) {
      if (!lessonThirteenComponent.includes(promptId) && !materialFurnitureLibrary.includes(promptId)) {
        errors.push(`제13차시 PromptCopyBlock '${promptId}'가 없습니다.`);
      }
    }
    for (const textValue of ['ARCHITECTURE DESIGN', 'K-PROJECT', 'Architecture, Interior', 'KS / ASVAN']) {
      if (!portfolioProjectContent.includes(textValue) && !lessonThirteenComponent.includes(textValue)) {
        errors.push(`제13차시 실제 표지 문구 '${textValue}'가 없습니다.`);
      }
    }
    const coverResultImports = [...lessonThirteenComponent.matchAll(/cover-result-\d{2}\.jpeg/g)].length;
    if (coverResultImports !== 10) {
      errors.push(`제13차시 실제 표지 결과 이미지: 예상 10개, 실제 ${coverResultImports}개`);
    }
    const inputImageImports = [...lessonThirteenComponent.matchAll(/portfolio-cover\/inputs\//g)].length;
    if (inputImageImports !== 4) {
      errors.push(`제13차시 표지 입력 이미지: 예상 4개, 실제 ${inputImageImports}개`);
    }
    const lessonThirteenTimeBlock = portfolioProjectContent.match(/lesson13TimePlan[\s\S]*?lesson14TimePlan/)?.[0] ?? '';
    const lessonThirteenTimeTotal = [...lessonThirteenTimeBlock.matchAll(/minutes:\s*(\d+)/g)]
      .reduce((total, match) => total + Number(match[1]), 0);
    if (lessonThirteenTimeTotal !== 180) {
      errors.push(`제13차시 시간표: 예상 180분, 실제 ${lessonThirteenTimeTotal}분`);
    }
    const requiredLessonThirteenFiles = [
      'src/assets/lessons/12-14/portfolio-cover/inputs/01-logo.png',
      'src/assets/lessons/12-14/portfolio-cover/inputs/02-house.png',
      'src/assets/lessons/12-14/portfolio-cover/inputs/03-kitchen-section.jpeg',
      'src/assets/lessons/12-14/portfolio-cover/inputs/04-kitchen-dining.jpeg',
      'src/assets/lessons/12-14/portfolio-cover/prompts/nano-banana-cover-template.txt',
      'src/assets/lessons/12-14/portfolio-cover/prompts/nano-banana-cover-used.txt',
      'src/assets/lessons/12-14/portfolio-cover/prompts/gpt-cover-text-review.txt',
      'src/assets/lessons/12-14/material-furniture/house-front/house-front-prompts.txt',
    ];
    for (const filePath of requiredLessonThirteenFiles) {
      try { await access(path.resolve(filePath)); }
      catch { errors.push(`제13차시 필수 Source 자산을 찾을 수 없습니다: ${filePath}`); }
    }
  }
  if (id === '14') {
    let lessonFourteenComponent = '';
    let portfolioProjectContent = '';
    try { lessonFourteenComponent = await readFile(lessonFourteenComponentPath, 'utf8'); }
    catch { errors.push('제14차시 결과보고서·제출 패키지 컴포넌트를 읽을 수 없습니다.'); }
    try { portfolioProjectContent = await readFile(lessonTwelveToFourteenContentPath, 'utf8'); }
    catch { errors.push('제12~14차시 통합 프로젝트 콘텐츠 데이터를 읽을 수 없습니다.'); }
    for (const marker of [
      'data-lesson14-result-report',
      '프로젝트 결과보고서',
      'reportBasicInformation',
      'reportSections',
      'reportWritingGuides',
      'finalPackageStructure',
      '과정명',
      '팀(개인)',
      '소속',
      '성명',
      '기간',
      '주강사',
      '멘토',
      '목적 및 배경',
      '방법 및 내용',
      '활용 도구 및 데이터',
      '프로젝트 수행 단계별 사진',
      '계획 → 진행 → 결과',
      'data-lesson14-time-total',
    ]) {
      if (!lessonFourteenComponent.includes(marker) && !portfolioProjectContent.includes(marker)) {
        errors.push(`제14차시 결과보고서·제출 패키지에 구조 '${marker}'가 없습니다.`);
      }
    }
    const lessonFourteenTimeBlock = portfolioProjectContent.match(/lesson14TimePlan[\s\S]*?commonPortfolioStructure/)?.[0] ?? '';
    const lessonFourteenTimeTotal = [...lessonFourteenTimeBlock.matchAll(/minutes:\s*(\d+)/g)]
      .reduce((total, match) => total + Number(match[1]), 0);
    if (lessonFourteenTimeTotal !== 360) {
      errors.push(`제14차시 시간표: 예상 360분, 실제 ${lessonFourteenTimeTotal}분`);
    }
    for (const falseClaim of ['기관 공식 결과보고서 양식', '기존 양식과 동일한 최종 서식']) {
      if (lessonFourteenComponent.includes(falseClaim)) {
        errors.push(`제14차시에서 확인되지 않은 양식 주장 '${falseClaim}'을 사용했습니다.`);
      }
    }
  }
  if (source.includes("category: '전문가 판단 필요'")) {
    errors.push(
      `${fileName}: 포괄적인 '전문가 판단 필요' 대신 구체적인 판단·검증 분류를 사용해야 합니다.`,
    );
  }

  if (!isDetailedLessonOne && !['06', '07', '08', '09', '10', '11', '12', '13', '14'].includes(id)) {
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

  const expectedSectionCount = detailedLessonSections[id]?.length ?? (isDetailedLessonOne ? 16 : 13);
  const expectedSectionIds = Array.from(
    { length: expectedSectionCount },
    (_, index) => `section-${String(index + 1).padStart(2, '0')}`,
  );
  for (const sectionId of expectedSectionIds) {
    if (!frontmatter.includes(`id: "${sectionId}"`)) {
      errors.push(`${fileName}: 로컬 목차에 ${sectionId}가 없습니다.`);
    }
  }
  if (detailedLessonSections[id]) {
    for (const [index, label] of detailedLessonSections[id].entries()) {
      const sectionId = expectedSectionIds[index];
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
  if (id === '04' && practiceMinutes !== 280) {
    errors.push(`${fileName}: 승인된 제4차시 실습시간 280분과 일치하지 않습니다.`);
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
    '제안요청서(RFP) 페이지, 장·절과 요구조건 ID(REQ ID)',
    '근거가 되는 짧은 원문 인용',
    '‘판독 불가’ 또는 ‘미확정’',
    '행정·입찰 조건과 공간 디자인 요구를 분리',
    '실제 회사 자료, 비공개 제안요청서(RFP), 개인정보, 기업 기밀 또는 사용 권한이 없는 도면',
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
const glossaryTerms = ['생성형 AI', '대규모 언어 모델', '멀티모달 AI', '할루시네이션', '그라운딩', '인간 개입형 검토', '프롬프트 또는 요청문', '제안요청서', '요구사항', '제약조건', '출처 추적성', '요구조건 매트릭스', '디자인 브리프', '공간구성 또는 공간 조닝', '대안', '명령줄 인터페이스', '헤드리스 실행', '로컬호스트', 'IP 주소 127.0.0.1', '포트', 'JSON', 'Express', '순수 HTML/CSS/JavaScript', '패키지 잠금 파일', '프로토타입', '추론', '검증', 'AI 모델', 'thinking level', '바이브 코딩', '모델 컨텍스트 프로토콜', '랭체인', '계층구조', '감사 로그', '린터', 'MECE', '멱등성', '하네스 엔지니어링'];
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
console.log('- 제1차시 16개, 제2차시 13개, 제3차시 11개, 제4–6차시 14개, 제7차시 27개, 제8차시 18개, 제9차시 16개, 제10차시 13개, 제11차시 19개, 제12차시 12개, 제13·14차시 14개 섹션');
console.log('- 모든 차시 실습시간 50% 이상');
console.log(`- 자산 manifest: ${manifestAssetIds.length}개, 필수 필드·연결 ID·공개 조건 확인`);
console.log(`- 필수 metadata: ${requiredFields.join(', ')}`);
