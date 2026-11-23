import type {Lesson07Section} from './daejeon-lesson07';

export const lesson08Title='제8차시 · 도면 판독·공간 관계도와 Blender MCP 첫 연결';
export const lesson08Meta={revision:'DJ-L08-CLASSROOM-REPRODUCIBILITY-REVISION-15',date:null,schedule:'3교시 × 50분 · 총 150분',durationMinutes:150,status:'design-pending',reviewStatus:'instructor-review'} as const;
export const lesson08Sections:readonly Lesson07Section[]=[
  {
    "id": "l08-plan-prep-why",
    "title": "도면 선을 지우기 전에 원본부터 천천히 읽기",
    "minutes": 15,
    "action": "불필요한 선을 지우기 전에 원본 도면의 방 이름·문·창문·계단·승강기 정보를 먼저 뽑아 둡니다.",
    "reason": "선을 깔끔하게 정리하다가 나중에 꼭 확인해야 할 사실(방 이름·문 위치)까지 같이 날려 버리지 않기 위해서입니다.",
    "next": "원본 우선 · 모르면 보류 · 결과 직접 확인 3원칙"
  },
  {
    "id": "l08-notebooklm-plan",
    "title": "실습 1 · NotebookLM으로 원본 평면도 1차 읽기",
    "minutes": 15,
    "action": "원본 PDF만 NotebookLM에 올려 방·벽·문·계단 목록을 뽑고, AI가 찾은 내용을 원본 도면에서 직접 확인합니다.",
    "reason": "AI가 정리해 준 표에도 틀린 부분이 있을 수 있으므로, 그대로 믿지 않고 원본과 대조해 잡아내는 습관을 익히기 위해서입니다.",
    "next": "원본 위치까지 확인한 1차 판독표와 고칠 항목"
  },
  {
    "id": "l08-clean-line-criteria",
    "title": "실습 2 · 도면 정답 기준표 만들기 & 깔끔한 선화(Clean Line) 정리",
    "minutes": 20,
    "action": "확정(KEEP)·재확인(REVIEW)·미기재(UNKNOWN) 3단계 기준표를 만들고, 치수선을 뺀 깔끔한 선화와 3D 참고 그림의 틀린 글자를 찾아 고칩니다.",
    "reason": "보기 좋게 정리한 그림(선화)과 진짜 정답(원본·기준표)을 구분해 다음 AI 작업에 정확한 조건만 넘기기 위해서입니다.",
    "next": "내가 확정해 둔 도면 기준표와 원본 대조 기록"
  },
  {
    "id": "l08-spatial-validation",
    "title": "실습 3 · 방별 역할 · 문 연결 · 동선 정리하고 AI 착각 바로잡기",
    "minutes": 20,
    "action": "각 방의 역할, 실제로 문이 뚫린 방 연결, 계단·승강기 이동 경로를 원본 도면과 하나씩 맞춰 봅니다.",
    "reason": "벽만 맞닿아 있는 옆 방을 문으로 바로 통하는 방으로 착각하거나, 도면에 없는 길을 AI가 지어내지 못하게 막기 위해서입니다.",
    "next": "검증을 마친 방 목록 · 문 연결표 · 이동 동선 데이터"
  },
  {
    "id": "l08-graphviz-diagram",
    "title": "실습 4 · 방과 문 연결을 화살표 지도(Graphviz)로 자동 그리기",
    "minutes": 20,
    "action": "검증한 방과 문 연결을 짧은 규칙 글(DOT 코드)로 바꾸고, 무료 웹 도구(Viz.js)에 붙여넣어 방 연결 지도를 그립니다.",
    "reason": "그림 AI처럼 글자가 깨지거나 선이 멋대로 바뀌지 않고, 텍스트 한 줄만 고치면 정확하게 수정되는 관계 지도를 얻기 위해서입니다.",
    "next": "수정 가능한 DOT 코드와 원본에 맞춰 검수한 방 연결 지도"
  },
  {
    "id": "l08-part2-handover",
    "title": "1~2부 결과물 한 번에 묶기 · 3D 모델링으로 넘길 준비",
    "minutes": 10,
    "action": "정답 기준표 · 깔끔한 선화 · 방 연결표 · DOT 코드를 한 폴더에 정리합니다.",
    "reason": "다음 3D 모델링 단계에 확실한 치수·연결 정보와 추가 확인이 필요한 항목을 빠짐없이 넘겨주기 위해서입니다.",
    "next": "제9차시 3층 단독주택 3D 모델링 · 재질 · 조명 · 카메라 무빙 준비"
  },
 {id:'l08-mcp-concept-ecosystem',title:'MCP 쉬운 개념 · Codex와 Blender가 대화하는 원리',minutes:15,action:'채팅창(Codex) · 연결 어댑터(MCP) · 3D 프로그램(Blender)이 각각 무슨 일을 하는지 쉽게 구분합니다.',reason:'명령을 어디에 입력하고 실제로 어느 프로그램이 움직이는지 알아야 오류가 나도 바로 원인을 찾을 수 있기 때문입니다.',next:'Blender MCP 연결 구조와 실무 활용 예시'},
 {id:'l08-blender-mcp-setup',title:'실습 5 · Blender + MCP 설치 및 Codex 첫 연결',minutes:20,action:'올인원 빌더(권장) 또는 수동 3단계(uvx → 애드온 → Codex 설정)로 Codex와 Blender를 연결합니다.',reason:'실행기 · 애드온 · 설정 파일 3가지를 차례대로 점검하면 연결 오류를 쉽게 해결할 수 있기 때문입니다.',next:'Codex가 내 PC의 Blender 화면을 바로 읽고 제어할 수 있는 환경'},
 {id:'l08-blender-mcp-hello-world',title:'실습 6 · 첫 연결 테스트 · 말로 창문 뚫린 3D 방 만들기',minutes:15,action:'Blender에서 새 빈 파일을 열고 Codex에 요청해 바닥·벽 3면·뚫린 창문·사람 눈높이 카메라를 자동으로 만듭니다.',reason:'실제로 3D 방과 창문이 정확한 치수로 만들어졌는지 눈으로 확인하고 기본 조작·저장까지 익히기 위해서입니다.',next:'L08_MCP_Hello_Room.blend 저장과 제9차시 본격 모델링 준비'}
];
export const lesson08Parts=[
 {id:'l08-part-1',title:'복잡한 도면 읽기 · 정답 기준표와 깔끔한 선화 만들기',time:'50분',sections:lesson08Sections.slice(0,3)},
 {id:'l08-part-2',title:'방과 문 연결 확인하고 화살표 지도로 그리기',time:'50분',sections:lesson08Sections.slice(3,6)},
 {id:'l08-part-3',title:'MCP 쉬운 이해 · Blender 첫 연결과 3D 방 만들기',time:'50분',sections:lesson08Sections.slice(6,9)},
] as const;
export const lesson08Boundary='모든 작업의 진짜 정답은 원본 도면과 사람이 직접 확인한 기준표입니다. 깔끔하게 정리한 선화 · 3D 참고 그림 · 방 연결 지도는 이해를 돕는 보조 자료일 뿐, 실제 공사 치수나 구조·법규를 확정하지 않습니다.';
