export interface PortfolioTimeItem {
  label: string;
  minutes: number;
  mode: 'guide' | 'practice' | 'review';
}

export const lesson12TimePlan: readonly PortfolioTimeItem[] = [
  { label: '통합 프로젝트와 두 산출물 이해', minutes: 20, mode: 'guide' },
  { label: '프로젝트 선정과 공개 범위 점검', minutes: 25, mode: 'practice' },
  { label: '실무 데이터 수집·역할 분류', minutes: 35, mode: 'practice' },
  { label: '포트폴리오와 결과보고서 구조 비교', minutes: 25, mode: 'guide' },
  { label: '분야별 구성 참고', minutes: 25, mode: 'guide' },
  { label: '제13차시 제작팩 정리', minutes: 35, mode: 'practice' },
  { label: '누락·권리·식별정보 검토', minutes: 15, mode: 'review' },
] as const;

export const lesson13TimePlan: readonly PortfolioTimeItem[] = [
  { label: '표지의 목적과 실제 Source 확인', minutes: 20, mode: 'guide' },
  { label: '입력 이미지·문구 준비', minutes: 25, mode: 'practice' },
  { label: '범용 프롬프트와 실제 프롬프트 비교', minutes: 30, mode: 'guide' },
  { label: 'Nano Banana 표지 시안 제작', minutes: 40, mode: 'practice' },
  { label: '결과 시안 비교와 선택', minutes: 20, mode: 'review' },
  { label: 'GPT 텍스트 검증', minutes: 20, mode: 'practice' },
  { label: '재질·가구 프롬프트 라이브러리 실습', minutes: 20, mode: 'practice' },
  { label: '결과 정리', minutes: 5, mode: 'review' },
] as const;

export const lesson14TimePlan: readonly PortfolioTimeItem[] = [
  { label: '최종 산출물과 제출 기준 확인', minutes: 30, mode: 'guide' },
  { label: '포트폴리오 최종 편집', minutes: 80, mode: 'practice' },
  { label: '결과보고서 자료·AI 활용 과정 정리', minutes: 70, mode: 'practice' },
  { label: '프롬프트·판단·검증 기록 작성', minutes: 55, mode: 'practice' },
  { label: '최종 제출 패키지 구성', minutes: 55, mode: 'practice' },
  { label: '발표 준비와 상호 검토', minutes: 40, mode: 'review' },
  { label: '최종 수정·제출 점검', minutes: 30, mode: 'review' },
] as const;

export const commonPortfolioStructure = [
  ['Cover', '프로젝트의 첫인상과 식별정보를 전달한다.'],
  ['Intro', '프로젝트를 선택한 배경과 핵심 메시지를 짧게 설명한다.'],
  ['Project Overview', '범위·역할·기간·사용 자료를 정리한다.'],
  ['Process / Analysis', '분석·대안·수정·검증 과정을 필요한 만큼 제시한다.'],
  ['Key Output', '가장 중요한 결과를 우선 보여준다.'],
  ['Final', '성과와 다음 확인사항을 정리한다.'],
] as const;

export const portfolioFieldExamples = [
  {
    label: '디자인형 · 인테리어형',
    items: ['공간 이미지', '무드보드', '재질', '콘셉트', '평면도·아이소메트릭', '하이라이트 이미지'],
  },
  {
    label: '설계사무소형',
    items: ['디자인 브리프', '대지·공간 분석', '조닝·동선·다이어그램', '법규 검토 요약', '설계 스케치', '평면·입면·단면', '최종 투시도'],
  },
  {
    label: '기타 제안형 · 전문건설형',
    items: ['현황 및 문제점', '대안 제안', 'Before·After', '재료·사양', '적용 결과'],
  },
] as const;

export const projectApplicationDesignColumns = [
  '프로젝트',
  '원본 자료',
  '해결할 과제',
  '사용할 AI',
  '선택한 이전 차시·Workflow',
  '최종 산출물',
  '검증 방법',
] as const;

export const projectApplicationDesignExample = [
  '직접 수행한 실제 프로젝트',
  '사용 권한이 확인된 도면·사진·문서',
  '현재 업무에서 줄이거나 개선할 일',
  '과제에 필요한 도구만 선택',
  '필요한 분석·이미지·검증 단계만 선택',
  '포트폴리오 + 결과보고서',
  '원본 대조 + 사람의 판단 + 필요시 전문가 확인',
] as const;

export const projectDataRoles = [
  ['원자료', '도면·사진·문서처럼 프로젝트 사실을 확인하는 기준'],
  ['작업 입력', 'AI 작업에 실제로 넣을 이미지·문구·요청 조건'],
  ['생성 결과', 'AI가 만든 후보 이미지·문장·구성안'],
  ['검토 기록', '오류·수정 이유·선택 근거·확인 불가 항목'],
  ['최종 산출물', '포트폴리오와 결과보고서에 실제 포함할 승인본'],
] as const;

export const coverTextFields = [
  ['PROJECT TYPE', 'ARCHITECTURE DESIGN'],
  ['PROJECT TITLE', 'K-PROJECT'],
  ['SUB TITLE', 'Architecture, Interior'],
  ['DESIGNER / COMPANY', 'KS / ASVAN'],
] as const;

export const coverReviewChecks = [
  '대표 이미지가 프로젝트 성격을 전달하는가?',
  '로고가 원본 형태를 유지하고 주변 여백이 확보됐는가?',
  '프로젝트명과 부제의 위계가 분명한가?',
  '가장자리와 텍스트 사이의 안전 여백이 충분한가?',
  '실제 사용 프롬프트에 적은 문구와 결과 이미지의 문구가 일치하는가?',
  'AI가 만든 이상 문자·중복 문구·불필요한 추가 문구가 없는가?',
] as const;

export const reportBasicInformation = ['과정명', '팀(개인)', '소속', '성명', '기간', '주강사', '멘토'] as const;

export const reportSections = [
  ['목적 및 배경', '주제 선정 배경, 기존 업무의 문제, AI를 적용하려는 목적을 설명한다.'],
  ['방법 및 내용', '계획 → 진행 → 결과 순으로 작성하고, 수정·검증 과정과 단계별 사진을 연결한다.'],
  ['활용 도구 및 데이터', '사용한 실무 데이터, AI 도구, 핵심 프롬프트, 데이터 처리·비식별화 여부를 기록한다.'],
] as const;

export const reportWritingGuides = [
  ['목적 및 배경', ['주제 선정 배경', '기존 업무의 문제', 'AI를 적용하려는 목적']],
  ['방법 및 내용', ['계획', '진행', '수정·검증 과정', '최종 결과', '프로젝트 수행 단계별 사진']],
  ['활용 도구 및 데이터', ['활용한 실무 데이터', 'AI 활용 방법', '사용 프롬프트', '데이터 처리·비식별화 여부']],
  ['마무리 검토', ['한계 및 실무 적용 가능성', '최종 제출 패키지 검수']],
] as const;

export const finalPackageStructure = [
  '01_PORTFOLIO · 최종 포트폴리오 PDF 또는 승인된 제출 형식',
  '02_RESULT_REPORT · 결과보고서 PDF 또는 지정 양식',
  '03_PROMPTS · 실제 사용한 프롬프트 원문과 버전',
  '04_EVIDENCE · 공개·제출이 허용된 근거와 검토 기록',
  '05_ASSETS · 제출이 허용된 이미지와 보조자료',
] as const;

export const practicalKpiItems = [
  '기존 예상 작업시간과 AI 활용 작업시간',
  '생성하고 실제로 비교한 대안 수',
  '수정·재생성·보완 횟수',
  '최종 결과물 수와 사용 범위',
  '사람이 직접 대조·확인한 항목',
] as const;

export const presentationReviewQuestions = [
  '결과가 실제 원도면·원문과 일치하는가?',
  'AI가 원자료에 없는 요소를 만들어내지 않았는가?',
  '법규·기준은 어떤 공식 Source와 대조했는가?',
  '이미지만 보고 구조·성능·시공 가능성을 확정하지 않았는가?',
  '확인된 사실·분석·디자인 제안을 구분했는가?',
  '추가 확인 또는 관련 전문가 검토가 필요한 항목은 무엇인가?',
] as const;

export const presentationAnswerLabels = [
  '확인된 사실',
  '분석·추론',
  '디자인 제안',
  '추가 검증 필요',
  '전문가 검증 필요',
] as const;

export const commonEvaluationCriteria = [
  '원본 자료 활용과 출처·권한 관리',
  '과제에 맞는 AI 활용 범위 선택',
  '최종 산출물의 전달력과 완성도',
  '원본 대조·수정·검증 과정',
  '실제 사용 프롬프트와 사람의 판단 기록',
] as const;

export const materialKeywordGroups = [
  {
    label: '재질',
    items: ['노출콘크리트', '프리캐스트 콘크리트', '화강석', '대리석', '트래버틴', '석회석', '현무암', '테라조', '화이트 오크', '월넛', '목재 루버', '알루미늄', '스테인리스 스틸', '블랙 스틸', '코르텐 스틸', '테라코타', '포세린 타일', '저반사 유리', '마이크로 시멘트', '라탄', '코르크'],
  },
  {
    label: '색상',
    items: ['웜 뉴트럴', '쿨 뉴트럴', '모노크롬', '저채도', '톤온톤', '보색 포인트', '밝은 베이스', '어두운 포인트', '자연색 팔레트'],
  },
  {
    label: '조명',
    items: ['부드러운 자연광', '확산광', '골든아워', '이른 아침', '흐린 날', '간접조명', '코브 조명', '월워셔', '스포트라이트', '웜 화이트 조명'],
  },
  {
    label: '환경',
    items: ['맑은 날', '흐린 날', '비 오는 날', '눈이 쌓인 겨울', '봄', '여름', '가을', '겨울', '도시 맥락', '교외 맥락', '해안 환경'],
  },
  {
    label: '조경',
    items: ['교목', '관목', '그라스류', '지피식물', '화단', '플랜터', '자갈', '잔디', '중정', '옥상정원', '수경 요소'],
  },
  {
    label: '내부 스타일링',
    items: ['소파', '라운지 체어', '암체어', '벤치', '다이닝 테이블', '사이드 테이블', '커피 테이블', '책장', '수납장', '전시대', '리셉션 카운터', '러그', '커튼', '식물', '오브제'],
  },
  {
    label: '외부 스타일링',
    items: ['현관 캐노피', '외부 벤치', '사인', '우편함', '외부 조명', '플랜터', '볼라드', '자전거 거치대', '야외 테이블', '파라솔'],
  },
  {
    label: '사람·활동',
    items: ['보행자', '대화하는 사람', '휴식', '업무', '회의', '독서', '식사', '전시 관람', '아이와 보호자', '접근 가능한 이용 장면'],
  },
  {
    label: '분위기·디자인 언어',
    items: ['모던', '미니멀', '웜 모던', '컨템퍼러리', '스칸디나비안', '재팬디', '미드센추리 모던', '인더스트리얼', '오가닉 모던', '차분한 고급감', '편안한 라운지'],
  },
  {
    label: '카메라·시점',
    items: ['아이레벨', '정면', '3/4 시점', '탑뷰', '아이소메트릭', '와이드 앵글', '표준 렌즈 느낌', '50mm 렌즈 느낌', '대칭 구도', '원근 왜곡을 줄인 시점'],
  },
  {
    label: '렌더링 표현',
    items: ['사실적인 건축 시각화', '자연스러운 재질 스케일', '균형 잡힌 노출', '부드러운 그림자', '미세한 표면 질감', '건축 사진 스타일', '연필 스케치', '수채화', '클레이 렌더', '콜라주'],
  },
] as const;

export const commonGeometryPrompt = `원본 이미지의 건축 구조를 기준으로 사용한다. 새로운 건축적 요소를 임의로 생성하거나 기존 요소를 삭제·이동하지 않는다. 창문과 문의 위치 및 크기, 벽체 위치, 층고, 계단, 발코니, 지붕, 기둥, 건물 규모, 파사드 개구부, 공간 크기 및 층수를 원본과 동일하게 유지한다. 아래에서 명시한 변경 대상 이외의 요소는 수정하지 않는다.

명시하지 않은 영역은 원본의 위치, 형태, 크기, 재질, 색상 및 디자인을 그대로 유지한다. AI가 디자인을 개선한다는 이유로 새로운 구조나 장식 요소를 추가하지 않는다.`;

export const materialChangePrompt = `기존 건축 Geometry와 공간 구성을 그대로 유지한다. 아래 대상 영역의 재질만 목표 재질로 변경한다. 재질의 실제 물성, 표면 질감, 반사도 및 스케일이 현실적으로 표현되도록 한다. 다른 요소는 변경하지 않는다.`;

export const furnitureChangePrompt = `내부 건축 구조와 주요 동선은 유지한다. 가구와 스타일링만 [목표 방향]으로 변경한다. 가구의 크기와 비율은 실제 공간에 맞게 현실적으로 설정한다.`;

export const twoElementPrompt = `[원본 구조 고정 명령]

변경 1 · [대상 영역]의 [요소]를 [목표 재질·색상·가구·환경]으로 변경한다.
변경 2 · [조명·분위기·활동·표현 방식]을 [목표 방향]으로 조정한다.

위 두 항목 이외의 구조, 창호, 문, 벽체, 카메라 시점과 비율은 원본과 동일하게 유지한다.`;

export const threeElementPrompt = `[원본 구조 고정 명령]

변경 1 · [대상 영역]의 [요소]를 [목표 방향]으로 변경한다.
변경 2 · [가구·조경·활동]을 [목표 방향]으로 조정한다.
변경 3 · [조명·계절·렌더링 표현]을 [목표 방향]으로 조정한다.

명시하지 않은 영역과 건축 Geometry는 원본과 동일하게 유지한다.`;

export const photorealismKeywords = [
  'photorealistic architectural visualization',
  'physically based material appearance',
  'global illumination look',
  'ray-traced reflection look',
  'natural material scale',
  'balanced exposure',
  'soft contact shadows',
  'subtle surface imperfections',
] as const;

export const photorealismPrompts = [
  `원본의 구조와 카메라 시점을 유지한다. 자연스러운 재질 스케일, 균형 잡힌 노출, 부드러운 접촉 그림자, 미세한 표면 불균일을 표현한 사실적인 건축 시각화로 정리한다. 과도한 광택과 플라스틱 같은 표면은 피한다.`,
  `원본의 창호·벽체·가구 배치를 유지한다. physically based material appearance, global illumination look, natural reflections, soft contact shadows를 시각적 단서로 사용해 실내 건축 사진처럼 표현한다.`,
  `원본의 외관 Geometry를 유지한다. photorealistic architectural visualization, balanced exposure, realistic weathering, natural material scale, ray-traced reflection look를 참고해 외부 마감의 깊이와 주변광을 표현한다.`,
] as const;

export const promptCompositionFormula = '원본 고정 + 변경 1 + 변경 2 + 필요시 변경 3 + 변경 금지';
