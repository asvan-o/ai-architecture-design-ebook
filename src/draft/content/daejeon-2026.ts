// Review-only Day 01. Approved curriculum and release arrays remain empty.
export const reviewStatus = 'instructor-review';
export const reviewDate = '2026-10-09';
export const overviewSections = [
  { id: 'learn', title: '이번 과정에서 배우는 것', summary: '교육용 예제로 기본을 익히고, 이미지에서 도면과 3D로 단계적으로 확장합니다.' },
  { id: 'roles', title: 'AI와 디자이너의 역할', summary: 'AI는 제안하고, 디자이너는 판단합니다.' },
  { id: 'workflow', title: '전체 과정 Workflow', summary: '하나의 실습이 다음 작업으로 어떻게 이어지는지 살펴봅니다.' },
  { id: 'tools', title: '작업에 맞는 도구 선택', summary: '사용할 도구는 해당 작업을 배우는 차시에서 소개합니다.' },
  { id: 'cycle', title: '확인하고 다시 수정하기', summary: '첫 결과를 확인하고 필요한 부분을 고칩니다.' },
  { id: 'safe', title: '안전하게 시작하기', summary: '자료를 올리기 전에 사용 권한을 확인합니다.' },
  { id: 'project', title: '예제에서 자신의 프로젝트로', summary: '기본을 익힌 뒤 사용할 수 있는 자신의 자료로 범위를 넓힙니다.' },
  { id: 'outputs', title: '최종 결과물', summary: '결과와 사람이 판단한 과정을 함께 남깁니다.' },
] as const;
export const roles = [
  { name: 'AI가 잘하는 일', items: ['많은 정보의 빠른 정리', '요청의 표·목록 구조화', '여러 디자인 방향 제안', '결과 비교', '반복 문서 업무 감소', '이미지 초기 대안 생성', '수정 요청과 변경 이력 정리'] },
  { name: '디자이너가 판단할 일', items: ['공간 구성이 실제로 적절한가', '클라이언트 요구에 맞는가', '재료·조명·가구가 공간 의도에 적합한가', 'AI가 원하지 않은 요소를 추가·변경했는가', '운영·유지관리 측면에서 적합한가', '현장 조건과 충돌하지 않는가', '결과를 채택·수정·제외할 것인가'] },
] as const;
export const workflow = [
  ['교육용 실습 예제', '제공된 예제로 작업을 시작합니다.'], ['요청·조건 이해', '원하는 것과 아직 모르는 것을 나눕니다.'],
  ['디자인 기준 정리', '실제 작업에 사용할 기준을 정합니다.'], ['이미지 생성·수정', '첫 제안을 만들고 필요한 부분을 고칩니다.'],
  ['도면 활용', '치수와 공간의 관계를 살펴봅니다.'], ['AI 해석', '도면 해석을 돕고 원자료와 대조합니다.'],
  ['3D 모델링', '공간의 형태와 관계를 입체로 표현합니다.'], ['법규 확인', '관련 공식 자료와 전문가 판단을 확인합니다.'],
  ['독립 교차검증', '별도 자료와 절차로 결과를 다시 확인합니다.'], ['결과 정리', '결과와 선택 이유를 함께 남깁니다.'],
] as const;
export const workflowSummary = workflow.map(([title]) => title).join(' → ');
export const tools = [
  ['ChatGPT', '요구 분석·구조화·Prompt 작성·교차검증'],
  ['Nano Banana', '1일차 기본 이미지 도구 · 일반 생성·반복 탐색·대안 생성'],
  ['ChatGPT Image', '이후 정밀 수정·합성·오류 수정'],
  ['Astra', '도면 해석'], ['MCP + Blender', '도면 정보를 활용한 3D 모델링'],
  ['NotebookLM', '후반 법규 단계의 공식 Source 기반 검토'],
] as const;
export const cycle = ['자료 확인', '요구 분석', 'AI 초안', '사람 판단', '수정', '검증', '결과물 정리'] as const;
export const safety = ['AI 오류를 예상하고 원문 근거 확인', '미확정 정보를 사실로 확정하지 않기', '개인정보·기업/발주처 자료의 공개 범위 확인', '도면·사진·문서의 외부 AI 업로드 권한 확인', '저작권과 Reference 사용권 확인', '사람이 최종 판단하고 검토 과정 기록'] as const;
export const lessonTitle = '제1차시 · 생성형 AI 리터러시·시각화 기초와 실무 시나리오 맞춤형 제안 이미지 생성';
export const lessonGoal = 'AI가 만든 내용을 확인하고 작업지시를 작성합니다. 이미지를 생성·수정한 뒤, 의뢰서를 분석하고 디자인 기준과 서로 다른 제안 방향을 정합니다.';
export const dayGoals = ['AI의 역할과 사람이 판단할 일 구분', 'AI 결과의 한계와 확인 필요성 설명', '좋은 Prompt 7가지 공통 규칙 이해', '7단 공식으로 작업지시 작성', 'Nano Banana 첫 생성·수정', 'AI로 의뢰서 분석', '분석 결과와 원문 비교·검증', '검증된 조건을 디자인 작업 기준으로 정리', '서로 다른 전략 2개 도출', '작업 기준을 이미지 생성 요청으로 변환'] as const;
export const analysisAreas = ['실습 목표', '주요 사용자와 이용 상황', '필수 요구조건', '유지 조건', '변경 가능 범위', '제외 범위', '미확정 조건', '추가 질문', '전문가 확인 항목', '디자인 대안 비교 기준'] as const;
export const briefAreas = ['실습 목표', '주요 사용자', '핵심 설계 문제', '설계 우선순위 1→2→3', '유지 조건', '변경 가능 범위', '제외 범위', '미확정 조건 / 가정', '디자인 대안 전략 2개', '결과 검토 기준'] as const;
export const resultChecks = ['유지된 요소', '의도대로 변경된 요소', '요청하지 않았는데 변경된 요소', '새로 생성된 요소', '삭제된 요소', '비례 / 공간 관계 오류', '이미지로 확인할 수 없는 조건'] as const;
export const periods = [
  { id: 'period-1', title: 'AI와 디자이너의 판단', output: '기본 원칙 4개와 업로드 확인 질문', timing: [['이번 학습의 방향',8],['생성형 AI 기본 개념',8],['AI 역할 / 사람 판단',10],['Hallucination / Grounding',10],['사용 전 확인과 판단 퀴즈',10],['기본 원칙',4]], sections: ['goals','ai-basics','roles','grounding','safety','principles'] },
  { id: 'period-2', title: 'Prompt를 작업지시서로 만들기', output: 'Part 3에 사용할 구조화 Prompt 1개', timing: [['Prompt 핵심 설명',15],['실습 1 · 잘못된 Prompt',10],['실습 2 · 작업지시서 조립',15],['실습 3 · 실내 공간 / 건물 외관',10]], sections: ['prompt-basics','rules','formula','short-structured','bad-prompt','assemble','apply'] },
  { id: 'period-3', title: 'Nano Banana 이미지 생성·수정', output: '첫 Prompt·이미지·검토·수정 Prompt', timing: [['Prompt 최종 확인',5],['첫 이미지 생성',15],['원본 / 결과 비교',10],['수정 Prompt',10],['두 번째 생성 또는 비교',10]], sections: ['first-generation','result-review','revision'] },
  { id: 'period-4', title: '의뢰서를 AI로 분석하기', output: '실습 선택과 10개 영역 분석·근거·확인 상태 기록', timing: [['의뢰서 직접 읽기',5],['실습 선택',5],['도면 / 이미지 역할',5],['AI 조건 분석',15],['정리한 내용 구분',10],['근거와 확인 상태',7],['다음 단계 검증 준비',3]], sections: ['rfp-guide','projects','read-rfp','analysis','types','evidence','next-verification'] },
  { id: 'period-5', title: 'AI 분석을 확인하고 작업 기준서 만들기', output: '검증된 조건·추가 질문·작업 기준서', timing: [['AI 분석 / 원문 비교',15],['추가 질문 / 전문가 확인',10],['작업 기준서 Prompt 입력',10],['작업 기준서 작성',15]], sections: ['verify-conditions','brief','priorities'] },
  { id: 'period-6', title: '작업 기준서를 이미지 전략으로 연결하기', output: '전략 2개와 Prompt 2개 · 이미지 또는 실행 상태 기록', timing: [['작업 기준서 최종 확인',10],['전략 2개 결정',10],['7단 Prompt',10],['짧은 실행 Prompt',5],['A/B 이미지 생성',12],['비교 / 선택 / 다음 수정',3]], sections: ['strategies','learning-prompt','execution-prompt','ab-generation','compare','outputs'] },
] as const;
export const sections = [
  ['goals','이번 학습의 방향'], ['ai-basics','생성형 AI는 어떤 도구인가'], ['roles','AI가 잘하는 일과 사람이 판단할 일'], ['grounding','AI는 왜 틀릴 수 있을까?'], ['safety','AI를 사용하기 전에 확인할 것'], ['principles','오늘부터 사용할 기본 원칙'],
  ['prompt-basics','AI 작업 요청문(Prompt)'], ['rules','좋은 Prompt의 7가지 공통 규칙'], ['formula','Prompt 작성 7단 공식'], ['short-structured','짧은 요청 vs 구조화 요청'], ['bad-prompt','실습 1 · 잘못된 Prompt 찾기'], ['assemble','실습 2 · 작업지시서 조립'], ['apply','실습 3 · 실내 공간 / 건물 외관 적용'],
  ['first-generation','Nano Banana 첫 생성'], ['result-review','원본과 결과 검토'], ['revision','수정 Prompt와 재생성'], ['rfp-guide','의뢰서란?'], ['projects','실습 A / 실습 B 선택'], ['read-rfp','의뢰서와 도면·현황 이미지의 역할'], ['analysis','AI에게 의뢰서 분석 요청'], ['types','AI가 정리한 내용을 구분해보기'], ['evidence','근거와 확인 상태 표시'], ['next-verification','다음 단계 원문 대조·검증으로 연결'], ['verify-conditions','핵심조건 검증과 추가 질문'], ['brief','작업 기준서 만들기'], ['priorities','디자인 우선순위'], ['strategies','서로 다른 전략 2개'], ['learning-prompt','학습용 7단 Prompt'], ['execution-prompt','실행용 짧은 Prompt'], ['ab-generation','A/B 이미지 생성과 예시 비교'], ['compare','결과 비교·선택'], ['outputs','제1차시 결과물 정리'],
].map(([id,title]) => ({id,title}));
export const revisionPrompt = `첨부한 원본과 첫 결과를 비교한 검토 기록을 기준으로 수정해 주세요.
[유지] 원본의 [고정 요소]와 [카메라 시점]을 유지합니다.
[수정] 첫 결과의 [문제 요소]를 [수정 방향]으로 바꿉니다.
[변경하지 않을 것] 만족한 [요소]는 그대로 둡니다.
[금지] 요청하지 않은 구조·개구부·문자·로고를 추가하지 않습니다.
[출력] 같은 시점의 수정 이미지 1장.
[검토] 원본 대비 고정 조건과 수정 범위를 다시 비교합니다. 실제 치수·구조·법규는 이미지로 확정하지 않습니다.`;
export const provenance = [
  ['KEEP','GW overview · src/lib/course-overview.ts','AI 초안→사람 검토, 역할 분리, 판단 기록'],
  ['KEEP','GW 01 · src/content/lessons/01.mdx §04–07,15','생성형 AI/LLM/Multimodal, 역할, Hallucination/Grounding/HITL, 정보 유형과 확인 상태 분리, 검증 체크리스트'],
  ['KEEP','GW 02 · src/lib/lesson02-ebook.ts / Lesson02Ebook.astro §04–13','7가지 규칙 원문·상세 설명·Before/After, 7단 공식, 빈칸 Template, 문장 분석, 반복 검토 원칙'],
  ['ADAPT','GW 01/02/03 → Day 01 6×50','이론은 복습 펼침에 보존, 교시 흐름 재배치, Interior/Exterior 선택 실습, 원문 대조·질의·Brief'],
  ['DAEJEON ADD','사용자 승인 Day 01 · review/daejeon/DJ-CF-01,02','선택형 패키지, 10개 영역 분석·10항목 간단 Brief, Nano Banana 중심 생성, 전략별 짧은 실행 Prompt'],
] as const;
