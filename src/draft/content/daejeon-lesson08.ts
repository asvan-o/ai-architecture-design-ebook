import type {Lesson07Section} from './daejeon-lesson07';

export const lesson08Title='제8차시 · 도면 판독·공간 관계도와 Blender MCP 첫 연결';
export const lesson08Meta={revision:'DJ-L08-CLASSROOM-REPRODUCIBILITY-REVISION-15',date:null,weekday:'월요일',schedule:'18:00~21:00',operationBuffer:'20:50~21:00 · 운영·질의·파일 저장·다음 차시 안내(수업 150분에 미포함)',durationMinutes:150,status:'design-pending',reviewStatus:'instructor-review'} as const;
export const lesson08Sections:readonly Lesson07Section[]=[
  {
    "id": "l08-plan-prep-why",
    "title": "불필요한 도면 선을 정리하기 전에 원본부터 읽기",
    "minutes": 15,
    "action": "선을 정리하기 전에 원본의 공간·개구부·코어 정보를 분리합니다.",
    "reason": "클린 선화를 만들면서 사실 확인의 근거까지 지우지 않도록 합니다.",
    "next": "원문 기준·확인 불가 유지·결과 재검토 원칙"
  },
  {
    "id": "l08-notebooklm-plan",
    "title": "실습 1 · NotebookLM 원본 평면도 1차 판독",
    "minutes": 15,
    "action": "원본 PDF만으로 도면 정보를 분석하고 원도면에서 근거를 다시 찾습니다.",
    "reason": "AI가 정리한 내용을 곧바로 확정하지 않고 오독을 확인하기 위해서입니다.",
    "next": "원본 근거가 표시된 1차 분석과 교정 항목"
  },
  {
    "id": "l08-clean-line-criteria",
    "title": "실습 2 · 최종 확정 도면 기준표 작성과 클린 선화(Clean Line) 준비",
    "minutes": 20,
    "action": "KEEP·REVIEW·UNKNOWN 기준표와 클린 선화·Top View 비교표를 작성합니다.",
    "reason": "정리된 입력과 사실 기준을 구별해 후속 생성의 조건으로 넘기기 위해서입니다.",
    "next": "도면 기준표와 원도면 대조 기록"
  },
  {
    "id": "l08-spatial-validation",
    "title": "실습 3 · 공간 기능·인접 관계·주요 동선 분석과 오독 교차검증",
    "minutes": 20,
    "action": "공간 기능·직접 연결·수직동선을 원본 근거와 대조합니다.",
    "reason": "가까운 공간을 직접 연결로 오해하거나 확인되지 않은 동선을 만들지 않도록 합니다.",
    "next": "검증된 공간 목록·인접 관계·주요 동선 데이터"
  },
  {
    "id": "l08-graphviz-diagram",
    "title": "실습 4 · Graphviz(DOT) 구조화 데이터와 2D 공간 관계 다이어그램 시각화",
    "minutes": 20,
    "action": "검증한 공간·관계 데이터를 DOT 코드로 표현하고 다이어그램을 비교합니다.",
    "reason": "노드와 연결선의 근거를 읽고 고칠 수 있는 시각자료를 만들기 위해서입니다.",
    "next": "DOT 코드와 원본 근거에 맞춰 검토한 관계도"
  },
  {
    "id": "l08-part2-handover",
    "title": "도면 판독·관계도 산출물 정리와 MCP 3D 모델링 연결 브릿지",
    "minutes": 10,
    "action": "기준표·선화·관계 데이터·DOT를 함께 정리합니다.",
    "reason": "후속 3D 모델링에 사실 기준과 추가 확인 정보를 함께 전달하기 위해서입니다.",
    "next": "도면 기반 Step 1~3 모델링·재질·조명·Step 4 카메라 무빙 준비"
  },
 {id:'l08-mcp-concept-ecosystem',title:'MCP 개념과 Codex·Blender의 역할',minutes:15,action:'Codex·MCP 서버·Blender의 역할을 구분합니다.',reason:'자연어를 어디에 입력하고 실제로 어떤 도구가 움직이는지 이해하기 위해서입니다.',next:'Blender를 기본 실습 도구로 쓰는 이유와 연결 구조'},
 {id:'l08-blender-mcp-setup',title:'실습 5 · Blender + MCP 설치 및 Codex 연결',minutes:20,action:'uvx → 애드온 → Codex 설정의 3단계로 연결합니다.',reason:'설치·서버·클라이언트 오류를 나눠 연결을 준비하기 위해서입니다.',next:'씬 조회가 가능한 로컬 Blender MCP 환경'},
 {id:'l08-blender-mcp-hello-world',title:'실습 6 · 첫 MCP 연결과 간단한 3D 공간 예제',minutes:15,action:'새 실습 파일에서 연결을 확인하고 창이 있는 방과 카메라를 만듭니다.',reason:'실제 객체·치수·개구부를 조회해 첫 자동 모델링을 검증하기 위해서입니다.',next:'L08_MCP_Hello_Room.blend 저장과 제9차시 모델링 준비'}
];
export const lesson08Parts=[
 {id:'l08-part-1',title:'실무 도면 전처리·NotebookLM 1차 판독과 클린 선화 기준표',time:'18:00~18:50',sections:lesson08Sections.slice(0,3)},
 {id:'l08-part-2',title:'공간 연결을 다시 확인하고 점과 선으로 그리기',time:'19:00~19:50',sections:lesson08Sections.slice(3,6)},
 {id:'l08-part-3',title:'MCP 이해와 Blender 연결·첫 3D 예제 생성',time:'20:00~20:50',sections:lesson08Sections.slice(6,9)},
] as const;
export const lesson08Boundary='원본 도면과 사람이 검토한 기준표를 사실 기준으로 사용합니다. 클린 선화·Top View·공간 관계 다이어그램은 검토 보조자료이며 실측·구조·법규·시공 정보를 확정하지 않습니다.';
