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
  ['표지', '프로젝트의 첫인상과 식별정보를 전달한다.'],
  ['프로젝트 소개', '목적과 배경을 짧게 설명한다.'],
  ['프로젝트 개요', '범위·역할·기간·사용 자료를 정리한다.'],
  ['핵심 결과', '가장 중요한 결과를 우선 보여준다.'],
  ['과정·보조자료', '분석·대안·수정·검증 과정을 필요한 만큼 제시한다.'],
  ['최종 요약', '성과와 다음 확인사항을 정리한다.'],
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

export const materialKeywordGroups = [
  {
    label: '재질',
    items: ['노출콘크리트', '프리캐스트 콘크리트', '화강석', '대리석', '트래버틴', '석회석', '현무암', '테라조', '화이트 오크', '월넛', '목재 루버', '알루미늄', '스테인리스 스틸', '블랙 스틸', '코르텐 스틸', '테라코타', '포세린 타일', '저반사 유리', '마이크로 시멘트', '라탄', '코르크'],
  },
  {
    label: '내부 가구',
    items: ['소파', '라운지 체어', '암체어', '벤치', '다이닝 테이블', '사이드 테이블', '커피 테이블', '업무용 데스크', '회의 테이블', '책장', '수납장', '전시대', '리셉션 카운터'],
  },
  {
    label: '가구 스타일·재질',
    items: ['모던', '미니멀', '웜 모던', '컨템퍼러리', '스칸디나비안', '재팬디', '미드센추리 모던', '인더스트리얼', '오가닉 모던', '밝은 목재', '어두운 목재', '패브릭', '부클레', '가죽', '메탈', '유리', '라탄', '석재'],
  },
  {
    label: '배치 목적',
    items: ['대화 중심', '휴식 중심', '업무 중심', '회의 중심', '전시 중심', '카페형', '라운지형', '커뮤니티형', '유연한 다목적 배치'],
  },
] as const;

export const commonGeometryPrompt = `원본 이미지의 건축 구조를 기준으로 사용한다. 새로운 건축적 요소를 임의로 생성하거나 기존 요소를 삭제·이동하지 않는다. 창문과 문의 위치 및 크기, 벽체 위치, 층고, 계단, 발코니, 지붕, 기둥, 건물 규모, 파사드 개구부, 공간 크기 및 층수를 원본과 동일하게 유지한다. 아래에서 명시한 변경 대상 이외의 요소는 수정하지 않는다.

명시하지 않은 영역은 원본의 위치, 형태, 크기, 재질, 색상 및 디자인을 그대로 유지한다. AI가 디자인을 개선한다는 이유로 새로운 구조나 장식 요소를 추가하지 않는다.`;

export const materialChangePrompt = `기존 건축 Geometry와 공간 구성을 그대로 유지한다. 아래 대상 영역의 재질만 목표 재질로 변경한다. 재질의 실제 물성, 표면 질감, 반사도 및 스케일이 현실적으로 표현되도록 한다. 다른 요소는 변경하지 않는다.`;

export const furnitureChangePrompt = `내부 건축 구조와 주요 동선은 유지한다. 가구와 스타일링만 [목표 방향]으로 변경한다. 가구의 크기와 비율은 실제 공간에 맞게 현실적으로 설정한다.`;

export const promptCompositionFormula = '원본 고정 + 변경 1 + 변경 2 + 필요시 변경 3 + 변경 금지';
