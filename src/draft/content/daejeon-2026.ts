// Review-only Day 01. Approved curriculum and release arrays remain empty.
export const reviewStatus = 'instructor-review';
export const reviewDate = '2026-10-09';
export const overviewSections = [
  { id: 'learn', title: '이번 과정에서 배우는 것', summary: '실무자료를 읽고 조건을 검증한 뒤, 시각화·도면·3D·결과보고로 연결합니다.' },
  { id: 'roles', title: 'AI와 디자이너의 역할', summary: 'AI는 제안하고, 디자이너는 판단합니다.' },
  { id: 'workflow', title: '전체 48시간 Workflow', summary: '과정의 방향입니다. 후속 차시의 시간·콘텐츠를 새로 확정하는 일정표는 아닙니다.' },
  { id: 'tools', title: '주요 도구 역할', summary: '작업의 목적에 따라 도구를 선택하고 결과를 원자료와 비교합니다.' },
  { id: 'cycle', title: '반복하는 기본 Workflow', summary: '한 번의 생성으로 끝내지 않고, 사람이 확인하고 수정합니다.' },
  { id: 'safe', title: '안전한 AI 활용 원칙', summary: '권한·근거·확인 상태를 기록합니다.' },
  { id: 'project', title: '후반 실무 프로젝트', summary: '사용 권한이 있는 자신의 실무자료로 분석·시각화·검증을 연결합니다.' },
  { id: 'outputs', title: '최종 결과물', summary: '결과와 사람이 판단한 과정을 함께 남깁니다.' },
] as const;
export const roles = [
  { name: 'AI가 잘하는 일', items: ['많은 정보의 빠른 정리', '요청의 표·목록 구조화', '여러 디자인 방향 제안', '결과 비교', '반복 문서 업무 감소', '이미지 초기 대안 생성', '수정 요청과 변경 이력 정리'] },
  { name: '디자이너가 판단할 일', items: ['공간 구성이 실제로 적절한가', '클라이언트 요구에 맞는가', '재료·조명·가구가 공간 의도에 적합한가', 'AI가 원하지 않은 요소를 추가·변경했는가', '운영·유지관리 측면에서 적합한가', '현장 조건과 충돌하지 않는가', '결과를 채택·수정·제외할 것인가'] },
] as const;
export const workflow = [
  ['실무자료', '출처·권한·확인 상태 기록'], ['조건 분석', '원문 조건·미확정 정보 분리'],
  ['Design Brief', '검증된 조건을 실행 기준으로 재구성'], ['이미지 시각화', 'Nano Banana 중심의 초기 탐색'],
  ['도면 활용', '치수·관계·고정 요소 확인'], ['Astra', '도면 해석'],
  ['MCP + Blender', '도면 정보를 활용한 3D 모델링'], ['NotebookLM 법규 검토', '후반 공식 Source 기반 검토'],
  ['GPT 교차검증', '별도 절차로 결과 다시 확인'], ['Portfolio', '선택한 결과물 정리'],
  ['Project Result Report', '입력·판단·수정·검증 과정 정리'],
] as const;
export const tools = [
  ['ChatGPT', '요구 분석·구조화·Prompt 작성·교차검증'],
  ['Nano Banana', '1일차 기본 이미지 도구 · 일반 생성·반복 탐색·대안 생성'],
  ['ChatGPT Image', '이후 정밀 수정·합성·오류 수정'],
  ['Astra', '도면 해석'], ['MCP + Blender', '도면 정보를 활용한 3D 모델링'],
  ['NotebookLM', '후반 법규 단계의 공식 Source 기반 검토'],
] as const;
export const cycle = ['자료 확인', '요구 분석', 'AI 초안', '사람 판단', '수정', '검증', '결과물 정리'] as const;
export const safety = ['AI 오류를 예상하고 원문 근거 확인', '미확정 정보를 사실로 확정하지 않기', '개인정보·기업/발주처 자료의 공개 범위 확인', '도면·사진·문서의 외부 AI 업로드 권한 확인', '저작권과 Reference 사용권 확인', '사람이 최종 판단하고 검토 과정 기록'] as const;
export const lessonTitle = '1일차 · AI 판단에서 RFP와 이미지 전략까지';
export const lessonGoal = '6교시 × 50분. AI의 한계를 이해하고 Prompt를 조립합니다. 첫 이미지 생성·수정 후, RFP 분석과 검증을 거쳐 Design Brief와 서로 다른 디자인 전략으로 연결합니다.';
export const dayGoals = ['AI의 역할과 사람의 판단 영역 구분', 'AI 결과의 한계와 확인 필요성 설명', '좋은 Prompt 7가지 공통 규칙 이해', '7단 공식으로 작업지시 구조화', 'Nano Banana 첫 생성·수정', 'RFP AI 분석', '분석 결과와 원문 비교·검증', '검증된 조건을 Design Brief로 변환', '서로 다른 전략 2개 도출', 'Brief를 이미지 Prompt로 변환'] as const;
export const analysisAreas = ['프로젝트 목표', '주요 사용자와 이용 상황', '필수 요구조건', '유지 조건', '변경 가능 범위', '제외 범위', '미확정 조건', '추가 질문', '전문가 확인 항목', '디자인 대안 비교 기준'] as const;
export const briefAreas = ['프로젝트 목표', '주요 사용자', '핵심 설계 문제', '설계 우선순위 1→2→3', '유지 조건', '변경 가능 범위', '제외 범위', '미확정 조건 / 가정', '디자인 대안 전략 2개', '결과 검토 기준'] as const;
export const resultChecks = ['유지된 요소', '의도대로 변경된 요소', '요청하지 않았는데 변경된 요소', '새로 생성된 요소', '삭제된 요소', '비례 / 공간 관계 오류', '이미지로 확인할 수 없는 조건'] as const;
export const periods = [
  { id: 'period-1', title: 'AI와 디자이너의 판단', output: '판단 구분과 업로드 확인 질문', timing: [['COURSE OVERVIEW',12],['AI 역할 / 사람 판단',10],['Hallucination / Grounding',10],['정보 유형 / 확인 상태',8],['안전한 AI 활용',7],['판단 Quiz',3]], sections: ['goals','roles','grounding','types','safety'] },
  { id: 'period-2', title: 'Prompt를 작업지시서로 만들기', output: '3교시에 사용할 구조화 Prompt 1개', timing: [['Prompt 핵심 설명',15],['실습 1 · 잘못된 Prompt',10],['실습 2 · 작업지시서 조립',15],['실습 3 · Interior / Exterior',10]], sections: ['prompt-basics','rules','formula','short-structured','bad-prompt','assemble','apply'] },
  { id: 'period-3', title: 'Nano Banana 이미지 생성·수정', output: '첫 Prompt·이미지·검토·수정 Prompt', timing: [['Prompt 최종 확인',5],['첫 이미지 생성',15],['원본 / 결과 비교',10],['수정 Prompt',10],['두 번째 생성 또는 비교',10]], sections: ['first-generation','result-review','revision'] },
  { id: 'period-4', title: 'RFP를 AI로 분석하기', output: '프로젝트 선택과 근거가 있는 10개 영역 분석', timing: [['RFP 직접 읽기',10],['도면 / 이미지 역할',5],['분석 Prompt 확인·입력',10],['AI 분석',15],['핵심 10개 영역 정리',10]], sections: ['rfp-guide','projects','read-rfp','analysis'] },
  { id: 'period-5', title: 'AI 분석 검증 + Design Brief', output: '검증된 조건·추가 질문·간단 Brief', timing: [['AI 분석 / 원문 비교',15],['추가 질문 / 전문가 확인',10],['Brief Prompt 입력',10],['간단 Brief 작성',15]], sections: ['verify-conditions','brief','priorities'] },
  { id: 'period-6', title: 'Brief를 이미지 전략으로 연결', output: '전략 2개와 Prompt 2개 · 이미지 A/B는 생성 여건에 따라', timing: [['Brief 최종 확인',10],['전략 2개 결정',10],['7단 Prompt',10],['짧은 실행 Prompt',5],['A/B 이미지 생성',12],['비교 / 선택 / 다음 수정',3]], sections: ['strategies','learning-prompt','execution-prompt','ab-generation','compare','outputs'] },
] as const;
export const sections = [
  ['goals','1일차 학습 목표'], ['roles','AI와 디자이너의 역할'], ['grounding','Hallucination / Grounding'], ['types','사실·추론·가정·제안과 확인 상태'], ['safety','안전한 AI 활용과 판단 Quiz'],
  ['prompt-basics','Prompt란 무엇인가'], ['rules','좋은 Prompt의 7가지 공통 규칙'], ['formula','Prompt 작성 7단 공식'], ['short-structured','짧은 요청 vs 구조화 요청'], ['bad-prompt','실습 1 · 잘못된 Prompt 찾기'], ['assemble','실습 2 · 작업지시서 조립'], ['apply','실습 3 · Interior / Exterior 적용'],
  ['first-generation','Nano Banana 첫 생성'], ['result-review','원본과 결과 검토'], ['revision','수정 Prompt와 재생성'], ['rfp-guide','RFP 실습 안내'], ['projects','Interior / Exterior 프로젝트 선택'], ['read-rfp','RFP 원문과 자료의 역할'], ['analysis','AI 분석과 핵심 10개 영역'], ['verify-conditions','핵심조건 검증과 추가 질문'], ['brief','Design Brief 작성'], ['priorities','디자인 우선순위'], ['strategies','서로 다른 전략 2개'], ['learning-prompt','학습용 7단 Prompt'], ['execution-prompt','실행용 짧은 Prompt'], ['ab-generation','A/B 이미지 생성과 강사 예시'], ['compare','결과 비교·선택'], ['outputs','1일차 결과물 정리'],
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
