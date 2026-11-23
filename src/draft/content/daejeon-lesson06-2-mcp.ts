// 제7-2차시 (리뉴얼): 평면도 3D 입체화 영상(Veo) · 3DGS 핵심 · 올인원 건축 MCP 통합 설치 & 실전 시나리오 · 건축 스킬

export const lesson062Title =
  '제7-2차시 · [리뉴얼] 평면도 영상화(Veo) · 3DGS 핵심 · 건축 MCP 올인원 셋팅 & 실전 시나리오';

export const lesson062Lead =
  '평면도 입체화 영상(Veo First→Last)과 3DGS·건축 프로그램 개념을 간단히 짚은 뒤, 체크박스형 PowerShell 올인원 빌더로 환경 구축을 한 번에 끝내고 옵션 A·B 실무 시나리오와 Codex 건축 스킬까지 순서대로 연결합니다.';

export const lesson062Sections = [
  {
    id: 'l062-video-principle',
    title: '6차시 복습 · 평면도 입체화 영상(Veo First → Last) 원리',
    minutes: 15,
    action: '2D 평면도를 바로 영상 AI에 넣지 않고 45도 종이 도면(First)과 같은 각도 3D 모형(Last) 2장으로 제어하는 이유를 정리합니다.',
    reason: '평면도 수직 이미지 1장만 넣으면 벽이 솟아오를 Z축 공간이 없어 화면이 녹아내리기(Morphing) 때문입니다.',
    next: 'ChatGPT 키프레임 2장 생성과 Veo 1샷 프롬프트',
  },
  {
    id: 'l062-video-prompts',
    title: '실습 · ChatGPT 키프레임 2장 & Veo 무료(Veo Fast) 한글 프롬프트',
    minutes: 35,
    action: 'ChatGPT로 45도 종이 도면(First)과 같은 각도 3D 모형(Last)을 만들고, Veo Frames to Video 1샷으로 입체화 영상을 완성합니다.',
    reason: '중간 클립 분할 없이 무료 크레딧을 절약하면서 벽선이 도면 위에서 물리적으로 솟아오르는 영상을 얻기 위해서입니다.',
    next: '3DGS 핵심 개념과 건축 프로그램 역할 정리',
  },
  {
    id: 'l062-3dgs-summary',
    title: '7차시 핵심 연결 · 3D Gaussian Splatting(3DGS) 이해와 업스케일 배치 전략',
    minutes: 15,
    action: 'Polygon Mesh · Point Cloud · 3DGS의 차이와 실무 한계를 짚고, 이미지 업스케일을 MCP 최종 결과물 마감 단계로 연결합니다.',
    reason: '3DGS는 편집 가능한 CAD/BIM이 아닌 시각적 시점 탐색 표현이므로, 설계 데이터 제어는 MCP로 넘기고 업스케일은 최종 결과물 고화질화에 집중하기 위해서입니다.',
    next: '건축 소프트웨어 4대장과 설치할 프로그램 개념 이해',
  },
  {
    id: 'l062-arch-software',
    title: '설치 전 개념만 한눈에 보기 · 건축 4대장, DWG vs DXF, 오늘 준비할 도구 역할',
    minutes: 15,
    action: '복잡한 설치 명령어에 들어가기 전에 AutoCAD · SketchUp · BIM 호환 구조와 오늘 설치할 프로그램(공통 엔진 · 옵션 A · 옵션 B · Blender)이 각각 무슨 역할을 하는지만 명확히 이해합니다.',
    reason: '각 도구의 역할과 무료 표준 포맷(.dxf · .step · .obj · .ifc) 구조를 먼저 이해해야 내 PC와 업무에 필요한 항목만 골라 깔끔하게 설치할 수 있기 때문입니다.',
    next: '내 PC 맞춤 올인원 통합 설치 빌더 (PowerShell 1회 실행)',
  },
  {
    id: 'l062-all-in-one-setup',
    title: '올인원 통합 설치 빌더 · 사양·항목 체크 후 PowerShell 한 번에 세팅하기',
    minutes: 25,
    action: '내 PC 그래픽 사양(내장형 GPU용 Blender 3.6 LTS 추천 vs 최신 버전)과 필요한 항목을 체크해 생성된 PowerShell 명령어를 한 번에 실행합니다.',
    reason: 'Git · Node.js · Python · uv부터 프로그램 설치, 플러그인 자동 복사, 선택한 MCP만 Codex config.toml에 병합하는 과정까지 수동 파일 이동 없이 한 번에 끝내기 위해서입니다.',
    next: '샘플 자료 3종으로 옵션 A · 옵션 B 실무 시나리오 바로 실습',
  },
  {
    id: 'l062-mcp-scenarios',
    title: '실전 실습 · 연결 확인 & 샘플 3종으로 옵션 A(2D 도면) · 옵션 B(3D CAD) 바로 써 보기',
    minutes: 45,
    action: '간단한 연결 확인 후 샘플 3종(평면도 PNG · 표준 DXF · 대지 조건서 TXT)을 활용해 2D 도면 작도, 수정 비교, 3D 건물 압출, 3층 기획 매스 검토를 바로 수행합니다.',
    reason: '설치 직후 실제 사무실 업무 흐름 그대로 자연어 요청문을 실행해 보고, 생성된 DXF·FCStd·OBJ 파일을 뷰어와 3D 툴에서 직접 검증하기 위해서입니다.',
    next: '반복 업무 품질을 고정하는 Codex 건축 스킬(Skill) 확장 활용',
  },
  {
    id: 'l062-codex-skills',
    title: '심화 확장 · 작업 흐름에 Codex 건축 스킬(Skill) 더하기',
    minutes: undefined,
    action: '올인원 설치로 준비된 건축 스킬 4종($cad-drawings · $architectural-concept-design · Gridline · $my-arch-dxf)을 필요한 상황에 맞춰 호출합니다.',
    reason: 'MCP가 도면·3D 프로그램을 움직이는 손발이라면, 스킬(SKILL.md)은 도면 검수·개념 설계·면적표 양식을 일관된 기준으로 자동 수행하게 해 주는 업무 매뉴얼이기 때문입니다.',
    next: '제8·9차시 Blender MCP 공간 모델링 및 제7차시 최종 업스케일 마감으로 연결',
  },
] as const;

export const lesson062Periods = [
  {
    id: 'l062-part-1',
    title: '6차시 복습과 평면도 → 3D 입체화 영상(Veo First → Last)',
    sections: lesson062Sections.slice(0, 2),
  },
  {
    id: 'l062-part-2',
    title: '7차시 핵심(3DGS) & 설치할 프로그램 개념 정리',
    sections: lesson062Sections.slice(2, 4),
  },
  {
    id: 'l062-part-3',
    title: '올인원 통합 설치 빌더 & 옵션 A·B 실전 MCP 시나리오',
    sections: lesson062Sections.slice(4, 6),
  },
  {
    id: 'l062-part-4',
    title: '심화 확장 · Codex 건축 스킬(Skill) 활용과 나만의 매뉴얼 만들기',
    sections: lesson062Sections.slice(6),
  },
] as const;

export const veoFirstFramePrompt = `첨부한 2D 평면도를 밝은 원목 책상 위의 깨끗한 흰색 제도 용지에 인쇄된 모습으로 만들어 주세요.
카메라는 종이 정면 위 45도 각도에서 비스듬히 내려다보는 구도로 잡아 주세요.
평면도의 벽선·창문·문·공간 비율은 원본 그대로 선명하게 유지하고, 손이나 연필 같은 소품은 넣지 마세요.
부드러운 자연광이 들어오는 사실적인 스튜디오 사진 스타일, 가로 와이드(16 대 9) 비율로 만들어 주세요.`;

export const veoLastFrameOpenTopPrompt = `첨부한 45도 종이 도면의 카메라 각도, 원목 책상, 흰 종이 위치와 바깥 치수선은 절대 바꾸지 말고 그대로 유지하세요.
종이에 인쇄된 검은 벽선 바로 위에 지붕이 열려 내부가 내려다보이는 오픈형 3D 단면 오피스 모형을 올려 주세요.
외벽과 내부 칸막이벽, 유리 창호, 중앙 목재 계단·화장실, 원목 책상과 회의실 테이블, 외부 우드 휴게데크, 보도블록과 따뜻한 실내·외부 조명을 사실적으로 표현해 주세요.
원본과 같은 부드러운 자연광, 글자나 워터마크는 넣지 마세요.`;

export const veoLastFrameExteriorPrompt = `첨부한 45도 종이 도면의 카메라 각도, 책상, 종이 위치와 크기는 절대 바꾸지 말고 그대로 유지하세요.
종이에 인쇄된 검은 벽선 바로 위에 사실적인 3D 건축 축소 모형(단독주택 또는 카페)이 완성된 모습으로 올려 주세요.
외벽 마감, 유리 창호, 지붕 슬래브, 외부 우드 데크와 조경 플랜터, 은은한 외부 조명, 전면 도로까지 디테일하게 표현해 주세요.
원본과 같은 부드러운 주간 자연광, 글자나 워터마크는 넣지 마세요.`;

export const veoAnimOpenTopPrompt = `첫 프레임의 책상 위 2D 오피스 평면도에서 마지막 프레임의 위가 열린 3D 단면 건축 모형으로 이어지는 8초 시공 타임랩스 영상입니다.
화면이 흐리게 겹치거나(크로스페이드) 녹아내리지 말고, 종이에 인쇄된 검은 벽선 위에서 물리적으로 솟아오르듯(스톱모션 모형 조립 느낌) 움직여 주세요.
지붕은 덮지 않고 천장이 열린 오픈형 단면 모형 상태를 끝까지 유지합니다.
- 0~2.5초: 종이 위 인쇄된 벽선을 따라 외벽, 내부 칸막이벽, 유리 창호, 출입문 틀이 수직으로 깔끔하게 솟아오릅니다.
- 2.5~5.5초: 중앙 목재 계단과 승강기·화장실이 먼저 조립되고, 이어서 원목 책상과 의자, 회의실 테이블, 수납장이 바닥에서 순차적으로 올라와 자리 잡습니다.
- 5.5~8초: 외부 우드 휴게데크와 보도블록·도로가 펼쳐지고, 실내 화분과 가로수가 자라나며 따뜻한 실내 조명과 보도 볼라드 등이 켜지며 완성됩니다.
카메라, 원목 책상, 흰 종이, 바깥 치수선은 처음부터 끝까지 절대 흔들리지 않게 고정하세요.`;

export const veoAnimExteriorPrompt = `첫 프레임의 종이 위 2D 평면도 선에서 마지막 프레임의 3D 건축 모형으로 이어지는 8초 건축 시공 타임랩스 영상입니다.
화면이 흐리게 겹치거나(크로스페이드) 녹아내리지 말고, 종이에 인쇄된 벽선을 따라 물리적으로 수직 솟아오르듯(스톱모션 모형 조립 느낌) 움직여 주세요.
- 0~2초: 종이 위 검은 외벽 선에서 외벽이 수직으로 깔끔하게 솟아오릅니다.
- 2~5초: 내부 칸막이벽, 계단, 창틀과 문틀이 도면 위치에 맞춰 순차적으로 올라옵니다.
- 5~8초: 지붕 슬래브, 외장 마감재, 데크와 조경, 은은한 조명, 전면 도로가 자연스럽게 자리 잡으며 완성됩니다.
카메라는 처음부터 끝까지 45도 부감 각도로 흔들림 없이 고정하고, 밝고 일정한 자연광을 유지하세요.`;

export const setupConceptCards = [
  {
    badge: '공통 기반 3종',
    title: 'Git · Node.js LTS · Python 3.12 + uv/uvx',
    role: '보이지 않는 뒤편에서 도구 배달과 실행을 맡는 기본 엔진입니다.',
    points: [
      'Git: 공개 MCP 서버와 건축 스킬 파일을 인터넷에서 내려받습니다.',
      'Node.js LTS: 제2차시 로컬 자동화 생성기와 스킬 자동 설치기(npx)를 구동합니다.',
      'Python + uv(uvx): 버전 충돌 없이 명령 한 줄로 각 건축 MCP 서버를 실행합니다.',
    ],
  },
  {
    badge: '옵션 A · 2D 도면',
    title: 'LibreCAD + aiblueprint-mcp',
    role: '유료 AutoCAD 없이 표준 2D 평면도(.dxf)를 만들고 눈으로 검수하는 조합입니다.',
    points: [
      'aiblueprint-mcp: Codex가 외벽·내벽·문·창·치수 레이어를 나눠 .dxf 파일을 생성·수정합니다.',
      'LibreCAD: 완성된 .dxf 도면을 열어 선·레이어·치수를 무료로 바로 확인합니다.',
      '창을 미리 켜 둘 필요 없이 Codex에 요청하면 백그라운드에서 즉시 도면 파일이 완성됩니다.',
    ],
  },
  {
    badge: '옵션 B · 3D CAD/BIM',
    title: 'FreeCAD + freecad-mcp',
    role: '정확한 치수(mm) 기반 3D 벽체·기획 매스를 세우고 부피·면적을 검증하는 조합입니다.',
    points: [
      'FreeCADCmd 백그라운드 엔진(execute_code_headless)으로 화면 깜빡임이나 GUI 오류 없이 3D 파일을 생성합니다.',
      '결과물을 .FCStd · .step · .obj 3가지 표준 포맷으로 저장해 Blender·SketchUp으로 바로 넘깁니다.',
      '열린 FreeCAD 창을 직접 조작할 때만 v1-1\\Mod에 자동 복사된 Part Design ▾ → MCP Addon → Start RPC Server를 켭니다.',
    ],
  },
  {
    badge: '메인 3D · 8·9차시 연결',
    title: 'Blender (3.6 LTS 추천 / 최신판) + blender-mcp',
    role: '실내외 공간 모델링·재질·조명·카메라 동선을 다루는 메인 3D 환경입니다.',
    points: [
      '내장형 GPU 노트북·교육장 PC에서는 가볍고 안정적인 Blender 3.6 LTS Portable을 추천합니다.',
      '외장 그래픽(RTX 등) 고사양 PC에서는 설치 시점 최신 Blender를 선택할 수 있습니다.',
      '올인원 설치가 애드온 등록·활성화까지 자동으로 끝내 주므로, 실습 때는 N키 → Connect to MCP server만 누르면 됩니다.',
    ],
  },
] as const;

export const fastPromptRules = [
  {
    title: '원칙 1 · 화면 클릭(Computer Use) 대신 백그라운드 파일 생성',
    bad: '프로그램 창을 띄워서 마우스로 메뉴를 눌러 그려 줘.',
    good: '화면 조작(Computer Use)이나 프로그램 창 직접 실행 없이, 백그라운드 도구(aiblueprint · execute_code_headless)로만 파일과 미리보기를 만들고 경로를 알려 줘.',
  },
  {
    title: '원칙 2 · FreeCAD는 순수 Part 솔리드만 사용 (GUI 열람 오류 원천 차단)',
    bad: 'FreeCADGui나 Arch 벽체 모듈로 만들고 FreeCAD.exe 창을 띄워 줘.',
    good: 'execute_code_headless 안에서 순수 Part 솔리드(Part::Feature)로만 형상을 만들고(.FCStd · .step · .obj 저장), FreeCADGui·Draft·Arch 호출이나 FreeCAD.exe 실행은 하지 마.',
  },
  {
    title: '원칙 3 · 한 선씩 왕복 호출하지 말고 코드 1회 일괄 실행',
    bad: '벽 1 만들고 보여 주고, 벽 2 만들고 또 미리보기 찍어 줘.',
    good: '중간 미리보기를 반복하지 말고, 전체 벽체·개구부·치수를 1회 일괄 처리한 뒤 마지막에 딱 한 번만 저장·검수 결과를 알려 줘.',
  },
] as const;

export const freeCadHeadlessPrompt = `FreeCAD MCP의 execute_code_headless 도구를 사용해 화면 조작 없이 가로 6000mm × 세로 4000mm × 높이 3000mm 매스를 만드세요.
FreeCADGui·Draft·Arch 모듈이나 FreeCAD.exe 실행 없이 순수 Part 솔리드(Part::Feature)로만 작성합니다.
한 MCP 세션에서 3회 연속 실행하고, 회차별로 새 폴더를 만들어 FCStd와 STEP으로 각각 저장하세요.
각 회차에서 저장한 두 파일을 다시 읽고 유효한 솔리드 1개인지, 외곽 치수 6000 × 4000 × 3000mm와 부피 72m³가 맞는지 검증하세요.`;

export const l062QuickIndex = [
  { code: '01', label: 'Veo 평면 입체화 원리', href: '#l062-video-principle' },
  { code: '02', label: 'Veo 한글 프롬프트 5종', href: '#l062-video-prompts' },
  { code: '03', label: '3DGS 핵심 & 업스케일', href: '#l062-3dgs-summary' },
  { code: '04', label: '설치 프로그램 개념 한눈에 보기', href: '#l062-arch-software' },
  { code: '05-1', label: '올인원 통합 설치 빌더', href: '#l062-all-in-one-setup' },
  { code: '05-2', label: 'MCP·스킬 일반 설치 & 옵션 B 경로', href: '#l062-manual-guide' },
  { code: '06-1', label: '연결 확인 & 오류 방지 3원칙', href: '#l062-verify-tests' },
  { code: '06-2', label: '실습 샘플 3종 다운로드', href: '#l062-sample-pack' },
  { code: '06-3', label: '[옵션 A] 사진·PDF → DXF 작도', href: '#l062-scenario-a1' },
  { code: '06-4', label: '[옵션 A] 기존 DXF 수정·비교표', href: '#l062-scenario-a2' },
  { code: '06-5', label: '[옵션 B] 2D DXF → 3D 건물 세우기', href: '#l062-scenario-b1' },
  { code: '06-6', label: '[옵션 B] 대지 조건서 → 3층 매스', href: '#l062-scenario-b2' },
  { code: '07-1', label: '건축 스킬 개념 & 호출법', href: '#l062-codex-skills' },
  { code: '07-2', label: '$cad-drawings (DXF 검수)', href: '#l062-skill-cad-drawings' },
  { code: '07-3', label: '$architectural-concept-design', href: '#l062-skill-concept-design' },
  { code: '07-4', label: 'Gridline 3종 (도면·시각화)', href: '#l062-skill-gridline' },
  { code: '07-5', label: '나만의 스킬 직접 제작 · 전역 호출', href: '#l062-custom-skill' },
] as const;

export const generalMcpSteps = [
  {
    step: 'STEP 1',
    title: '실행기 & 대상 프로그램 먼저 설치',
    body: 'Python 기반 MCP는 uv(uvx), Node 기반 MCP는 Node.js(npx)가 실행기 역할을 합니다. 제어할 본체 프로그램(LibreCAD · FreeCAD · Blender 등)도 먼저 PC에 설치합니다.',
  },
  {
    step: 'STEP 2',
    title: 'MCP 서버 준비 (2가지 방식 구분)',
    body: '① 즉시 실행형(uvx · npx): blender-mcp · freecad-mcp처럼 별도 소스 폴더 없이 실행 시 자동 호출합니다. ② 로컬 폴더형(git clone + uv sync): aiblueprint-mcp처럼 C:\\mcp\\<폴더명>에 코드를 내려받아 가상환경을 만듭니다.',
  },
  {
    step: 'STEP 3',
    title: 'Codex 주소록(config.toml) 등록 후 재실행',
    body: 'C:\\Users\\<내계정>\\.codex\\config.toml에 [mcp_servers.<도구이름>] 블록을 추가하고 Codex 앱을 완전히 껐다 다시 켭니다. 윈도우 경로(C:\\...)는 반드시 작은따옴표(\'...\')로 감싸야 역슬래시 오류가 나지 않습니다.',
  },
] as const;

export const manualMcpToolGuides = [
  {
    badge: '옵션 A · 2D 도면 수동 설치',
    title: 'LibreCAD + aiblueprint-mcp (애드온 없음 · 폴더 내려받기형)',
    addonNote: 'LibreCAD는 완성된 DXF 도면을 열어 보는 뷰어이므로 프로그램 안에 따로 애드온을 설치할 필요가 없습니다.',
    steps: [
      '1) 프로그램 설치: LibreCAD 공식 사이트에서 설치하고, 공통 실행기(Git · Python 3.12 · uv)를 준비합니다.',
      '2) MCP 폴더 내려받기: PowerShell에서 git clone https://github.com/thebossnow/aiblueprint-mcp.git C:\\mcp\\aiblueprint-mcp 를 실행합니다. (Git이 없으면 GitHub에서 Code → Download ZIP으로 받아 C:\\mcp\\aiblueprint-mcp 폴더에 압축을 풉니다.)',
      '3) 전용 부품 설치: PowerShell에서 uv --directory C:\\mcp\\aiblueprint-mcp sync 를 실행해 필요한 라이브러리를 자동 준비합니다.',
      '4) Codex 연결: 탐색기 주소창에 %USERPROFILE%\\.codex 를 입력해 config.toml을 메모장으로 열고, 아래 [mcp_servers.aiblueprint] 4줄을 붙여넣어 저장한 뒤 Codex를 완전히 껐다 다시 켭니다.',
    ],
  },
  {
    badge: '옵션 B · 3D CAD 수동 설치',
    title: 'FreeCAD + freecad-mcp (폴더 복사 붙여넣기 + 경로 지정형)',
    addonNote: '화면 없이 파일만 만들 때는 4)번 config.toml 연결만 맞아도 작동하며, 열린 FreeCAD 창을 실시간으로 움직일 때만 2)번 폴더 복사가 필요합니다.',
    steps: [
      '1) 프로그램 설치: FreeCAD 공식 사이트에서 1.1 버전을 설치하고 uv(uvx)를 준비합니다.',
      '2) 애드온 폴더 복사 · 붙여넣기: git clone https://github.com/neka-nat/freecad-mcp.git C:\\mcp\\freecad-mcp (또는 ZIP 압축 해제) 후, 안쪽의 addon\\FreeCADMCP 폴더를 복사합니다. 그다음 파일 탐색기 주소창에 %APPDATA%\\FreeCAD\\v1-1\\Mod 를 입력해 열고 그대로 붙여넣습니다.',
      '3) 내 PC 엔진 경로 확인: 아래 1줄 확인 명령어로 내 PC에 실제로 깔린 freecadcmd.exe 주소를 복사합니다.',
      '4) Codex 연결 & 실행: config.toml에 [mcp_servers.freecad] 블록과 3)번 주소를 작은따옴표(\'...\')로 감싸 붙여넣고 Codex를 재실행합니다. (열린 FreeCAD 창 제어 시에만 상단 Part Design ▾ → MCP Addon → Start RPC Server 클릭)',
    ],
  },
  {
    badge: '메인 3D · Blender 수동 설치',
    title: 'Blender + blender-mcp (앱 안에서 애드온 파일 직접 설치형)',
    addonNote: 'Blender는 파일 복사 대신 프로그램 내부 설정 메뉴에서 .py 애드온 파일 1개를 골라 체크박스만 켜면 끝납니다.',
    steps: [
      '1) 프로그램 설치: 내장형 GPU PC는 Blender 3.6 LTS 포터블 압축을 C:\\tools\\blender-3.6-lts에 풀고, 외장 GPU PC는 공식 최신 Blender를 설치합니다. uv(uvx)도 함께 준비합니다.',
      '2) 애드온 파일 받기: 제8차시 상단 다운로드 버튼(또는 GitHub ahujasid/blender-mcp)에서 blender_mcp_addon.py 파일 1개를 내 PC(예: C:\\mcp\\blender-mcp\\)에 저장합니다.',
      '3) Blender 안에서 애드온 설치 · 켜기: Blender를 열고 상단 Edit → Preferences → Add-ons → Install...(또는 Install from Disk) 클릭 → blender_mcp_addon.py 선택 → 목록에서 Interface: MCP for Blender 체크박스를 켜고 저장(Save Preferences)합니다.',
      '4) Codex 연결 & 버튼 켜기: config.toml에 [mcp_servers.blender] 4줄을 붙여넣고 Codex를 재실행합니다. 실습할 때마다 Blender 3D 화면에서 키보드 N → 우측 MCP for Blender 탭 → Connect to MCP server(Start MCP Server)를 눌러 연결합니다.',
    ],
  },
] as const;

export const optionBPathMap = [
  {
    badge: '경로 1 · 실행 엔진',
    name: 'FreeCADCmd.exe (백그라운드 엔진)',
    location: '관리자 설치: C:\\Program Files\\FreeCAD 1.1\\bin\\freecadcmd.exe\n일반 사용자 설치: C:\\Users\\<내계정>\\AppData\\Local\\Programs\\FreeCAD 1.1\\bin\\freecadcmd.exe',
    role: 'FreeCAD 화면을 띄우지 않고 백그라운드(execute_code_headless)로 3D 파일(.FCStd · .step · .obj)을 만드는 핵심 실행 파일입니다.',
    whereUsed: '④번 config.toml 안의 --freecadcmd 바로 뒤에 내 PC 실제 경로를 넣습니다.',
  },
  {
    badge: '경로 2 · 소스 창고',
    name: 'C:\\mcp\\freecad-mcp (다운로드 폴더)',
    location: 'C:\\mcp\\freecad-mcp\\addon\\FreeCADMCP',
    role: 'GitHub(neka-nat/freecad-mcp)에서 내려받은 원본 폴더입니다. 이 안의 addon\\FreeCADMCP가 FreeCAD에 끼워 넣을 플러그인 원본입니다.',
    whereUsed: '직접 실행하지 않고, 안쪽의 addon\\FreeCADMCP 폴더를 ③번 폴더로 복사할 때 원본으로 사용합니다.',
  },
  {
    badge: '경로 3 · 플러그인 인식',
    name: '%APPDATA%\\FreeCAD\\v1-1\\Mod\\FreeCADMCP',
    location: 'C:\\Users\\<내계정>\\AppData\\Roaming\\FreeCAD\\v1-1\\Mod\\FreeCADMCP',
    role: 'FreeCAD 1.1 이상이 창을 켤 때 플러그인을 읽어 오는 전용 폴더입니다. 여기에 복사해 두어야 상단 메뉴에 Part Design ▾ → MCP Addon → Start RPC Server가 나타납니다.',
    whereUsed: '열려 있는 FreeCAD 화면을 실시간 제어할 때만 필요합니다. (백그라운드 파일 생성만 쓸 때는 ①+④만 맞아도 동작합니다.)',
  },
  {
    badge: '경로 4 · Codex 주소록',
    name: '%USERPROFILE%\\.codex\\config.toml',
    location: 'C:\\Users\\<내계정>\\.codex\\config.toml',
    role: 'Codex가 freecad 도구를 호출할 때 어떤 실행기(uvx.exe)와 어떤 엔진(경로 1)을 쓸지 알려 주는 연결 설정 파일입니다.',
    whereUsed: '[mcp_servers.freecad] 섹션을 추가하고 작은따옴표(\'...\')로 경로를 감싸 UTF-8(BOM 없음)로 저장합니다.',
  },
] as const;

export const optionBPathFindCmd = `@('C:\\Program Files', "$env:LOCALAPPDATA\\Programs") | ForEach-Object { Get-ChildItem -Path (Join-Path $_ 'FreeCAD*') -Recurse -Filter 'freecadcmd.exe' -ErrorAction SilentlyContinue } | Select-Object -ExpandProperty FullName`;

export const manualConfigTomlSnippet = `# 위치: C:\\Users\\<내계정>\\.codex\\config.toml (UTF-8, BOM 없음)
# 핵심 규칙: 윈도우 경로(C:\\...)는 큰따옴표(") 대신 반드시 작은따옴표('...')로 감쌉니다.

# [옵션 A] 로컬 폴더형 MCP (C:\\mcp\\aiblueprint-mcp에 다운로드 후 uv sync 완료 기준)
[mcp_servers.aiblueprint]
command = 'C:\\Users\\<내계정>\\.local\\bin\\uv.exe'
args = ["run", "--directory", 'C:\\mcp\\aiblueprint-mcp', "aiblueprint-mcp"]
startup_timeout_sec = 60

# [옵션 B] 즉시 실행형(uvx) + 내 PC의 freecadcmd.exe 경로 연결
[mcp_servers.freecad]
command = 'C:\\Users\\<내계정>\\.local\\bin\\uvx.exe'
args = ["freecad-mcp", "--host", "127.0.0.1", "--freecadcmd", 'C:\\Users\\<내계정>\\AppData\\Local\\Programs\\FreeCAD 1.1\\bin\\freecadcmd.exe']
startup_timeout_sec = 60

# [메인 3D] 즉시 실행형(uvx) · Blender 안에서는 N키 -> Start MCP Server 클릭
[mcp_servers.blender]
command = 'C:\\Users\\<내계정>\\.local\\bin\\uvx.exe'
args = ["blender-mcp"]
startup_timeout_sec = 60`;

export const generalSkillMethods = [
  {
    badge: '방법 1 · 공개 스킬 1줄 설치 (권장)',
    title: 'GitHub 공개 스킬을 npx skills 명령으로 바로 추가하기',
    summary: '다른 사람이 공개한 건축·도면·문서 스킬을 터미널 명령 한 줄로 내려받아 Codex에 자동 등록하는 표준 방법입니다.',
    code: 'npx --yes skills add <GitHub작성자/저장소> -g --skill <스킬이름> -a codex --copy -y',
    notes: [
      '-g 옵션을 붙이면 사용자 전역 폴더(%USERPROFILE%\\.agents\\skills\\)에 설치되어 어느 작업 폴더를 열어도 $스킬이름으로 호출할 수 있습니다.',
      '-g 옵션을 빼면 현재 터미널이 열려 있는 프로젝트 폴더(<작업폴더>\\.agents\\skills\\) 안에서만 동작합니다.',
    ],
  },
  {
    badge: '방법 2 · 직접 만든 스킬 · 파일 수동 배치',
    title: 'SKILL.md 문서 1장을 지정 폴더에 넣어 나만의 스킬 등록하기',
    summary: '우리 사무실만의 도면 레이어 규칙이나 면적표 양식을 마크다운 파일(SKILL.md) 1장으로 만들어 폴더에 넣기만 하면 바로 스킬이 됩니다.',
    code: `# 전역 등록 (어느 프로젝트에서나 $스킬이름 호출)
C:\\Users\\<내계정>\\.agents\\skills\\<스킬폴더명>\\SKILL.md

# 특정 프로젝트 전용 등록 (해당 작업 폴더에서만 호출)
<작업폴더>\\.agents\\skills\\<스킬폴더명>\\SKILL.md`,
    notes: [
      'SKILL.md 맨 위에 YAML 머리말(--- / name: 스킬이름 / description: 설명 / ---)을 적고 저장합니다.',
      '파일 배치 후 Codex 앱을 다시 열거나 새 대화를 시작하면 채팅창에서 $스킬이름으로 즉시 자동완성됩니다.',
    ],
  },
] as const;

export const mcpPracticeScenarios = [
  {
    id: 'l062-scenario-a1',
    optionTag: '옵션 A · 2D 도면',
    optionTone: 'teal',
    sampleTag: '사용 샘플: ① 오피스 평면도 PNG (PLAN-BASE-01)',
    title: '시나리오 A-1 · CAD 파일 없이 평면도 사진·PDF만 받았을 때 → 도면(DXF)과 면적표 만들기',
    situation: '발주처나 부동산에서 캐드 원본(.dwg)은 없고 평면도 이미지나 PDF 한 장만 보내줬습니다. 처음부터 일일이 선을 다시 그리는 대신 AI로 초안 DXF와 면적표를 빠르게 뽑아냅니다.',
    whereToUseSample: '다운로드한 ① 오피스 평면도 이미지(PLAN-BASE-01 PNG)를 Codex 채팅창의 파일 첨부(+) 버튼으로 올리고 아래 1단계부터 시작합니다.',
    steps: [
      '이미지를 첨부하고 먼저 치수와 방 크기만 표로 읽게 합니다. (바로 그리라고 하면 치수가 틀어지기 쉽습니다.)',
      '표에서 잘못 읽은 숫자 1~2개만 확인해 채팅으로 바로잡습니다.',
      '확정된 표로 DXF 도면 + 엑셀 면적표(CSV) + 미리보기 이미지를 한 번에 뽑아 LibreCAD로 열어 확인합니다.',
    ],
    prompts: [
      {
        label: '1단계 프롬프트 · 평면도 이미지 첨부 후 치수표 먼저 읽기',
        text: `첨부한 평면도 이미지를 보고, 아직 도면은 그리지 말고 아래 내용만 표로 정리해 줘.
- 건물 전체 가로·세로 길이(mm)
- 방(실) 이름과 각각의 가로·세로 크기, 예상 면적(㎡·평)
- 출입문과 창문의 위치와 대략적인 폭
글씨가 흐려서 정확히 안 보이는 숫자는 '추정'이라고 표시해 줘.`,
      },
      {
        label: '2단계 프롬프트 · 치수 확인 후 2D DXF 도면과 면적표 한 번에 생성',
        text: `정리해 준 표대로 aiblueprint MCP를 사용해 2D DXF 평면도(office_plan.dxf)를 만들어 줘.
(고칠 숫자가 있으면 여기에 한 줄 추가: 예) 회의실 문 폭은 900mm로 맞춰 줘.)

- 단위는 mm로 맞추고, AutoCAD나 LibreCAD에서 바로 수정할 수 있게 외벽·내벽·문·창문·가구·치수·실명 레이어를 나눠 줘.
- 화면을 마우스로 클릭하지 말고 백그라운드에서 한 번에 파일로 만들어 줘.
- 끝나면 도면 미리보기 이미지 1장이랑, 엑셀에서 한글 안 깨지는 실별 면적표(CSV)도 같이 저장해 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-a2',
    optionTag: '옵션 A · 2D 도면 수정·비교',
    optionTone: 'teal',
    sampleTag: '사용 샘플: ② 06_sample_office_plan_v1.dxf',
    title: '시나리오 A-2 · 발주처 수정 요청 대응 → 기존 DXF 고치고 “바뀐 점 & 면적 변화표” 뽑기',
    situation: '어제 보낸 평면도를 본 발주처가 “업무공간을 조금 넓히고, 창문도 더 키워 주세요. 그리고 면적이 몇 평 바뀌었는지 알려 주세요”라고 요청했습니다.',
    whereToUseSample: '다운로드한 ② 06_sample_office_plan_v1.dxf를 연습용 작업 폴더(예: C:\\work\\mcp-practice)에 넣어 두고, Codex에서 그 폴더를 연 뒤 실행합니다.',
    steps: [
      '원본 DXF는 그대로 보존하고, 수정한 내용을 새 파일(office_plan_v2.dxf)로 저장하게 합니다.',
      '원본과 수정본의 치수·레이어를 대조해 어디가 바뀌었고 방별 면적(㎡·평)이 얼마나 달라졌는지 보고서를 받습니다. (아래 Part 4의 $cad-drawings 스킬이 설치되어 있으면 함께 활용해도 좋습니다.)',
      'LibreCAD에서 두 파일을 직접 열어 수정된 가벽과 창문 폭을 최종 육안 확인합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 기존 DXF 수정 + 원본 vs 수정본 면적 변화표 보고',
        text: `작업 폴더에 있는 06_sample_office_plan_v1.dxf 원본은 그대로 두고, 아래 두 가지를 반영해 office_plan_v2.dxf로 새로 저장해 줘.
1) 회의실 안쪽 가벽을 오른쪽으로 600mm 옮겨서 업무공간을 넓혀 줘.
2) 위쪽 창문(W2) 폭을 600mm 더 넓혀 줘.

저장이 끝나면 원본(06_sample_office_plan_v1.dxf)과 수정본(office_plan_v2.dxf)을 다시 읽어 비교한 뒤,
변경된 부위와 방별 면적(㎡·평) 증감을 발주처에게 보내기 좋게 표로 정리하고 수정본 미리보기 PNG도 1장 저장해 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-b1',
    optionTag: '옵션 B · 3D CAD/BIM (FreeCAD)',
    optionTone: 'navy',
    sampleTag: '사용 샘플: ② 06_sample_office_plan_v1.dxf (또는 A-2의 v2)',
    title: '시나리오 B-1 · 2D 도면(DXF) → 문·창문 뚫린 3D 건물로 바로 세우기 (GUI 오류 방지 적용)',
    situation: '2D 평면도는 확정됐는데, 발주처에게 입체감을 보여 주거나 나중에 Blender·SketchUp으로 넘겨 인테리어할 정확한 치수의 3D 벽체 모델이 필요합니다.',
    whereToUseSample: '작업 폴더에 있는 ② 06_sample_office_plan_v1.dxf(또는 A-2에서 만든 office_plan_v2.dxf)를 그대로 사용합니다. FreeCAD 창을 켜지 않고 백그라운드(execute_code_headless)로 안전하게 실행됩니다.',
    steps: [
      'DXF 파일의 외벽·내벽·기둥·문·창문 좌표를 읽어 FreeCAD가 백그라운드에서 3m 높이의 순수 Part 솔리드 벽체를 세웁니다.',
      '문·창문 자리를 정확히 뚫고 유리까지 넣은 뒤, .FCStd · .step · .obj(Blender/SketchUp 임포트용) 3가지로 저장합니다.',
      '저장된 파일을 다시 열어 가로·세로·높이 치수와 벽체 전체 부피(m³)를 자동 검수한 뒤, 사용자가 직접 FreeCAD나 Blender에서 열어 확인합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 2D DXF 평면도를 FreeCAD 3D 건물(FCStd · STEP · OBJ)로 무오류 1회 생성',
        text: `작업 폴더에 있는 06_sample_office_plan_v1.dxf 평면도를 읽고 FreeCAD MCP의 execute_code_headless 도구로 3D 건물을 한 번에 세워 줘.
- 중요: 나중에 FreeCAD 창으로 열 때 GUI ViewObject 오류가 나지 않도록 FreeCADGui·Draft·Arch 모듈이나 FreeCAD.exe 창 실행은 절대 쓰지 말고, 순수 Part 솔리드(Part::Feature)로만 형상을 만들어 저장해 줘.
- 바닥 두께 200mm, 천장(벽체) 높이 3,000mm로 올려 줘.
- 문 자리는 높이 2,100mm로 뚫고, 창문 자리는 바닥에서 900mm 띄우고 높이 1,500mm로 뚫어서 유리 솔리드까지 끼워 줘.
- 결과물은 office_3d.FCStd, office_3d.step, 그리고 Blender·SketchUp에서 바로 불러올 office_3d.obj 3가지로 저장해 줘.
- 저장 후 파일을 헤드리스로 다시 열어서 전체 외곽 치수와 벽체 부피(m³)가 맞는지 검증하고 저장 경로만 알려 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-b2',
    optionTag: '옵션 B · 3D 기획 매스 (FreeCAD)',
    optionTone: 'navy',
    sampleTag: '사용 샘플: ③ 07_sample_site_brief_3f_commercial.txt',
    title: '시나리오 B-2 · 대지·기획 조건서만 보고 → 3층 건물 기획 매스 & 건폐율·용적률 검토하기',
    situation: '새 신축 프로젝트 의뢰가 들어와 땅 크기와 층별 조건(1층 필로티, 2~3층 사무실, 북쪽 일조권 후퇴)을 받았습니다. 본격 설계 전에 땅 위에 건물이 어느 정도 덩어리로 올라가는지 3D로 확인하고, 건폐율·용적률 숫자도 빠르게 검토합니다.',
    whereToUseSample: '다운로드한 ③ 07_sample_site_brief_3f_commercial.txt 파일을 작업 폴더에 넣거나 Codex 채팅창에 첨부(+)한 뒤 아래 프롬프트를 보냅니다.',
    steps: [
      '메모장으로 조건서(TXT)를 한 번 열어 대지 크기(12×18m)와 층별 조건을 눈으로 확인합니다.',
      'Codex에 조건서를 첨부(또는 폴더 경로 지정)하고 FreeCAD 백그라운드 Part 솔리드로 3층 기획 3D 매스를 생성합니다.',
      '생성된 mass_study.FCStd / .obj를 직접 FreeCAD나 Blender에서 열어 덩어리감을 보고, 건폐율(50.0%)·용적률(99.77%) 계산표를 확인합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 대지 조건서(TXT) 첨부 → 3층 기획 3D 매스 & 법규 면적표 자동 계산',
        text: `첨부한 07_sample_site_brief_3f_commercial.txt 조건서를 읽고, FreeCAD MCP의 execute_code_headless 도구로 3층 근린생활시설 기획 3D 매스를 한 번에 만들어 줘.
- 중요: FreeCADGui·Draft·Arch 모듈이나 FreeCAD.exe 창 실행 없이, 순수 Part 솔리드(Part::Feature)로만 층별 객체를 구분해 만들어 나중에 FreeCAD GUI로 열 때 오류가 없게 해 줘.
- 조건서에 적힌 대지 판(12×18m), 1층 필로티 기둥 6개와 계단실 코어, 2층 매스, 북쪽 2m 후퇴를 반영한 3층 매스, 옥상 난간(파라펫 1.2m)까지 모두 반영해 줘.
- 결과물은 mass_study.FCStd, mass_study.step, mass_study.obj 3가지로 저장해 줘.
- 층별 바닥면적(㎡·평), 건축면적, 연면적, 건폐율(%), 용적률(%)도 계산해서 법규 상한(건폐율 60%, 용적률 200%) 이내인지 표로 정리해 줘.`,
      },
    ],
  },
] as const;

export const customSkillTemplate = `---
name: my-arch-dxf
description: 우리 사무실 표준 건축 레이어로 2D DXF 평면도를 1회 일괄 생성하고, 실별 면적표(㎡·평) CSV까지 자동 출력하는 전용 스킬
---

# 우리 사무실 표준 2D DXF 생성 및 면적 산출 절차

1. 입력 확인
   - 외곽 가로·세로(mm), 실별 이름과 분할 위치, 출입문·창문 조건을 먼저 정리하고 빠진 치수는 가정값으로 표기합니다.
2. 표준 레이어 규칙 (INSUNITS = 4, mm)
   - 외벽: A-WALL / 내부 경량벽체: A-WALL-INT / 기둥: A-COL
   - 출입문·개폐호: A-DOOR / 창호: A-WIN / 가구: A-FURN
   - 실별 폐합 경계: A-AREA / 실명 문자: A-TEXT / 치수선: A-DIM
3. 고속 일괄 실행
   - 도구를 여러 번 왕복 호출하지 말고, Python ezdxf 스크립트 1회 실행(uv run --with ezdxf)으로 표준 .dxf 파일과 UTF-8-BOM 실별 면적표 CSV(㎡ 및 평 환산: ㎡ / 3.305785)를 한 번에 생성합니다.
4. 자동 검수 보고
   - 생성 직후 파일을 다시 읽어 외곽 치수, 실별 면적 합계, 레이어 목록, 기본 레이어 '0' 오배치 여부를 표로 보고합니다.`;

export const customSkillCallPrompt = `$my-arch-dxf로 가로 14,400mm × 세로 8,400mm 소형 오피스 평면도(업무공간 · 6석 회의실 · 탕비실) DXF와 실별 면적표 CSV를 한 번에 생성하고, 외곽 치수와 레이어 누락 여부를 검수해 줘.`;

export const customSkillBriefElements = [
  {
    num: '01',
    title: '스킬 이름 & 호출 조건 (명찰)',
    detail: '영문 소문자·하이픈으로 이름을 정하고(예: my-proposal-pack), 어떤 업무·입력 파일이 들어올 때 이 스킬을 써야 하는지 1~2문장으로 적습니다.',
    example: '예) "대지 조건서나 평면도를 받아 우리 사무실 양식의 건축 기획 제안서와 면적표를 만들 때 사용"',
  },
  {
    num: '02',
    title: '원하는 기능 & 작업 순서 (워크플로)',
    detail: 'AI가 매번 똑같은 절차로 일하도록 "1단계 무엇을 읽고 → 2단계 무엇을 계산·작도하고 → 3단계 무엇을 검수할지" 순서를 번호로 적습니다.',
    example: '예) "1) 조건서 치수·법규 요약 → 2) 누락 항목 확인 표시 → 3) 면적표 CSV + 요약 보고서 생성 → 4) 건폐율·용적률 재검산"',
  },
  {
    num: '03',
    title: '참조할 디자인 · 문서 폼 · 기준표 (핵심!)',
    detail: '우리 사무실의 기존 제안서(PDF·DOCX·HTML), 표준 레이어표(CSV), 브랜드 컬러·폰트 가이드, 선호 인테리어·투시도 레퍼런스 이미지를 채팅창(+)에 첨부하거나 폴더 경로로 알려 줍니다.',
    example: '예) "첨부한 회사_제안서_샘플.pdf의 목차·표 구성과 네이비(#1E3A8A) 톤을 스킬 안 references/ 폴더에 저장해 매번 그대로 따르게 해 줘"',
  },
  {
    num: '04',
    title: '출력 파일 형식 & 절대 금지 규칙',
    detail: '최종 파일 확장자, 단위(mm / ㎡·평 병기), 한글 깨짐 방지(UTF-8-BOM), 절대 하면 안 되는 실수(추정값 임의 확정 금지 등)를 못 박아 둡니다.',
    example: '예) "엑셀 CSV는 UTF-8-BOM, 면적은 ㎡와 평 동시 표기, 도면에 안 적힌 치수는 임의로 채우지 말고 [확인 필요]로 표기"',
  },
  {
    num: '05',
    title: '전역 폴더 저장 지시 (어느 폴더에서나 호출)',
    detail: '만든 스킬을 내 PC 사용자 전역 폴더(%USERPROFILE%\\.agents\\skills\\<스킬이름>\\)에 저장하라고 명시하면, 앞으로 어떤 프로젝트 폴더를 열어도 $스킬이름으로 바로 호출됩니다.',
    example: '예) "전역 스킬 폴더(.agents\\skills 및 .codex\\skills)에 UTF-8(BOM 없음)로 저장하고 참고 파일도 references\\에 복사해 줘"',
  },
] as const;

export const customSkillFolderTree = `C:\\Users\\<내계정>\\.agents\\skills\\<내스킬이름>\\
├── SKILL.md           ← Codex가 읽는 업무 매뉴얼 (상단 name·description 명찰 + 작업 순서 + 출력 규칙)
├── references\\        ← 참조할 문서 폼(PDF·HTML·표 양식) · 표준 레이어표 · 브랜드 컬러/디자인 가이드
└── scripts\\           ← (선택) 반복 계산·도면 변환에 쓰는 Python 스크립트`;

export const customSkillCreatorPrompt = `우리 사무실 전용 Codex 전역 스킬을 하나 새로 만들어서 내 PC에 바로 등록해 줘.
(참고할 기존 문서 폼·레이어표·디자인 레퍼런스 파일이 있다면 이 채팅창 + 버튼으로 함께 첨부했습니다.)

[1. 스킬 이름과 언제 쓸지]
- 스킬 이름(영문 소문자·하이픈): my-office-brief   ← 원하는 이름으로 수정
- 호출 상황(description): 건축 대지 조건서, 평면도, 또는 발주처 요구사항을 받아 우리 사무실 표준 양식의 기획 검토서와 면적표를 작성할 때 사용

[2. 원하는 기능과 작업 순서]
1) 입력 자료에서 대지 크기, 용도, 층수, 실별 요구사항을 먼저 표로 정리한다.
2) 빠졌거나 불명확한 치수·법규 조건은 임의로 추정해 확정하지 말고 [확인 필요] 항목으로 분리한다.
3) 확정된 수치로 ① 실별 면적표 CSV(㎡·평 동시 표기, 엑셀 한글 안 깨지는 UTF-8-BOM)와 ② 발주처 전달용 요약 보고서(HTML 또는 Markdown)를 생성한다.
4) 생성 직후 총 연면적·건폐율·용적률 합계가 입력 조건과 일치하는지 스스로 검산해 보고한다.

[3. 참조할 디자인 · 문서 폼 · 기준 규칙]
- 첨부한 파일(또는 지정 경로의 회사 양식·디자인 가이드)이 있다면 이 스킬 폴더 안의 references\\ 폴더에 복사해 두고, SKILL.md에서 항상 그 문서 구조·표 머리글·톤앤매너(예: 네이비 #1E3A8A 포인트, 깔끔한 표 중심, 과장된 수식어 금지)를 참조하도록 적어 줘.
- 첨부 파일이 없으면 위 항목을 기준으로 깔끔한 표준 양식 파일(references\\report-template.md)을 함께 만들어 줘.

[4. 전역 셋팅 및 검증]
- 스킬 파일은 C:\\Users\\<내계정>\\.agents\\skills\\<스킬이름>\\SKILL.md 와 호환용 C:\\Users\\<내계정>\\.codex\\skills\\<스킬이름>\\SKILL.md 두 곳에 모두 UTF-8(BOM 없음)로 저장해 줘.
- 상단 YAML 머리말(name, description)이 정확한지 확인하고, 저장된 폴더 구조와 바로 테스트해 볼 수 있는 $스킬이름 호출 문장 1개를 알려 줘.`;

export const customSkillUsageExamples = [
  {
    badge: '사용 예시 1 · 새 프로젝트에서 바로 호출하기',
    title: '방금 만든 전역 스킬($my-office-brief)로 기획 검토서 & 면적표 뽑기',
    prompt: `$my-office-brief로 작업 폴더의 07_sample_site_brief_3f_commercial.txt를 읽고, 우리 사무실 표준 양식(references 참고)에 맞춰 기획 검토 요약서와 실별 면적표 CSV(㎡·평)를 만들어 줘.`,
  },
  {
    badge: '사용 예시 2 · 기존 체험 스킬($my-arch-dxf) + 공개 검수 스킬 연결',
    title: '내 스킬로 DXF를 만들고 공개 스킬($cad-drawings)로 제3자 검수까지 한 번에',
    prompt: `1) 먼저 $my-arch-dxf로 가로 14,400mm × 세로 8,400mm 소형 오피스 평면도(업무공간 · 6석 회의실 · 탕비실) DXF와 면적표 CSV를 생성해 줘.
2) 이어서 $cad-drawings로 방금 만든 DXF를 읽기 전용 검수해서 외곽 치수·레이어 누락 여부와 PNG 미리보기를 보고해 줘.`,
  },
  {
    badge: '사용 예시 3 · 만든 스킬을 말로 수정·업그레이드하기',
    title: '직접 파일을 고치지 않고 Codex에게 내 스킬 규칙 업데이트 시키기',
    prompt: `전역에 등록된 $my-office-brief 스킬을 수정해 줘.
- 출력 면적표 CSV 마지막 열에 '예상 공사비 참고(비고)' 칸을 추가하고,
- 보고서 디자인 톤은 references 폴더에 새로 첨부한 brand_guide.pdf의 제목 스타일을 따르도록 SKILL.md와 references 폴더를 함께 갱신해 줘.`,
  },
] as const;

export const customSkillEditCmd = `notepad "$env:USERPROFILE\\.agents\\skills\\my-arch-dxf\\SKILL.md"`;

export const cadDoctorCmd = 'python "$env:USERPROFILE\\.agents\\skills\\cad-drawings\\scripts\\doctor.py"';

export const cadSkillExamples = [
  {
    id: 'cad-drawings',
    badge: '도면 자동 검수관 · 입문 1순위',
    prepBadge: '준비물: 기존 DXF 파일 1개 필요',
    prepNeedsDxf: true,
    title: 'cad-drawings · 기존 DXF 정밀 검수와 버전 비교',
    plainSummary: '이미 그려진 DXF 도면이 치수·단위·레이어·폐합 경계대로 제대로 만들어졌는지, 그리고 수정 전(v1)과 수정 후(v2)가 어디가 바뀌었는지 CAD 창을 켜지 않고 자동으로 점검해 주는 검수 스킬입니다.',
    source: 'https://github.com/numikel/cad-drawings#quick-start',
    sourceLabel: 'numikel/cad-drawings',
    skillFolders: ['cad-drawings'],
    install: 'npx --yes skills add numikel/cad-drawings -g --skill cad-drawings -a codex --copy -y',
    fit: 'aiblueprint로 만든 DXF나 외부 도면의 치수·단위·레이어를 확인하거나, 같은 도면의 두 버전이 어떻게 달라졌는지 비교할 때 씁니다.',
    logic: 'DXF를 ezdxf로 읽어 모델 공간과 레이아웃의 객체를 조사합니다. 면적은 닫힌 경계가 확보된 경우에 계산하며, 버전 비교는 저장할 때 바뀌는 객체 번호를 걸러 내고 실제 형상과 속성의 변경만 보여 줍니다.',
    result: '단위·객체 수·레이어 목록, 치수·면적·둘레, 수정 전후 차이, PNG 미리보기를 얻습니다.',
    limit: 'DXF는 CAD 창 없이 읽습니다. DWG는 DXF로 먼저 변환해 사용합니다.',
    scenarioTitle: '실무 시나리오 S1 · 10 × 6m 도면 면적 검수 & v1 vs v2 변경점 자동 비교',
    scenarioSteps: [
      '앞선 시나리오 A에서 만든 DXF(예: 06_sample_office_plan_v1.dxf)가 있는 작업 폴더를 Codex에서 엽니다.',
      '아래 요청문으로 단위·레이어·폐합 경계·면적과 PNG 미리보기를 검수합니다.',
      '수정본(office_plan_v2.dxf)이 있다면 "$cad-drawings로 v1과 v2의 실제 형상·속성 변경점만 비교 표로 정리해 줘"라고 이어서 요청합니다.',
    ],
    prompt: `$cad-drawings로 이 DXF를 읽기 전용으로 검수해 주세요. 도면 단위와 외곽 레이어를 확인하고, 닫힌 경계 기준으로 가로·세로 외곽 치수, 면적, 둘레를 계산해 알려 주고 PNG 미리보기 한 장을 만들어 주세요.`,
  },
  {
    id: 'concept-design',
    badge: '개념 설계 자동 생성기 · 빈 대지 초안용',
    prepBadge: '준비물: 도면 파일 불필요 · 빈 폴더 + 텍스트 조건',
    prepNeedsDxf: false,
    title: 'Architectural Concept Design · 요구사항에서 개념 도면 세트로',
    plainSummary: '아직 도면이 전혀 없는 빈 대지 단계에서 "땅 크기, 도로 방향, 방 개수, 연면적 한도"만 말로 적으면, 규칙 검사(동선·가구 간섭·면적)를 거쳐 평면·입면·단면 도면(DXF/PDF)과 3D 웹 뷰어까지 한 번에 뽑아 주는 설계 스킬입니다.',
    source: 'https://github.com/Mhrnqaruni/ai-agent-skill-architectural-concept-design#install',
    sourceLabel: 'Mhrnqaruni/ai-agent-skill-architectural-concept-design',
    skillFolders: ['architectural-concept-design'],
    install: 'npx --yes skills add Mhrnqaruni/ai-agent-skill-architectural-concept-design -g --skill architectural-concept-design -a codex --copy -y',
    fit: '빈 대지에서 필요한 실과 목표 면적, 진입 방향, 이격 조건을 바탕으로 첫 주택 평면과 단면·입면을 구성할 때 씁니다.',
    logic: '대지·실·벽·개구부·가구를 미터 단위 design.json에 작성하고, Python 엔진의 check로 문 간섭·동선·면적을 점검한 뒤 도면 세트와 면적표를 일괄 생성합니다.',
    result: '개념 평면·입면·단면 DXF/PDF/PNG, 면적표 CSV, HTML 3D 뷰어, 검사 결과 JSON을 얻습니다.',
    limit: '직교 벽과 평탄한 대지 중심의 초기 개념 설계용이며, 국내 인허가 법규 최종 확인은 별도로 수행합니다.',
    scenarioTitle: '실무 시나리오 S2 · 16 × 24m 빈 대지 단층 2침실 주택 개념 세트 일괄 생성',
    scenarioSteps: [
      '빈 작업 폴더를 Codex에서 열고 아래 조건 요청문을 입력합니다.',
      'Codex가 design.json을 작성하고 check 단계에서 문 열림 간섭·동선·목표 면적 초과 여부를 자동 점검하는 과정을 확인합니다.',
      '생성된 평면·입면·단면 DXF/PDF와 면적표 CSV, HTML 3D 뷰어를 열어 보고 확정 치수를 FreeCAD/Blender로 이어갑니다.',
    ],
    prompt: `$architectural-concept-design으로 16 × 24m 대지의 단층 2침실 주택 개념안을 만들어 주세요. 남쪽이 도로이고 연면적은 95m² 이하입니다. 실별 목표 면적과 남은 제약을 먼저 정리하고, 미제공 이격 기준은 확인 항목으로 표시하세요. design.json 검사 후 평면·입면·단면 DXF/PDF와 면적표를 만들어 주세요.`,
  },
  {
    id: 'gridline',
    badge: '프로젝트 조정 매니저 · 다단계 실무용',
    prepBadge: '준비물: 도면 파일 불필요 · 빈 폴더 + 텍스트 조건',
    prepNeedsDxf: false,
    title: 'Gridline · 공간 프로그램부터 도면·일람표·시각화 계획까지 연동',
    plainSummary: '방 목록 기획 → 평면도·실/문/창 일람표 생성 → Blender 시각화 계획까지 여러 단계의 산출물 버전을 서로 어긋나지 않게 맞춰 주는 모듈형 건축 스킬 묶음입니다.',
    source: 'https://github.com/MakeItEzzz555/Gridline#coordinated-cad-drawings',
    sourceLabel: 'MakeItEzzz555/Gridline',
    skillFolders: ['architecture-programming', 'architectural-drawing-generation', 'visualization-rendering'],
    install: 'npx --yes skills add MakeItEzzz555/Gridline -g --skill architecture-programming --skill architectural-drawing-generation --skill visualization-rendering -a codex --copy -y',
    fit: '실 목록과 인접 조건을 정리하고 도면과 일람표 버전을 맞춘 뒤, 같은 설계안을 Blender 제안 컷으로 연결할 때 씁니다.',
    logic: 'architecture-programming으로 실 목표 면적·인접표를 짜고, architectural-drawing-generation으로 평면 DXF·일람표를 생성한 뒤, visualization-rendering으로 카메라·조명 계획을 맞춥니다.',
    result: '정리된 공간 프로그램, 레이어를 가진 평면 DXF와 벡터 PDF, 실·문·창 일람표 및 Blender 촬영 계획을 얻습니다.',
    limit: '로컬 도면 생성기는 평면 중심이며, 연결된 Blender MCP에 촬영 계획을 넘겨 3D 장면에 적용할 수 있습니다.',
    scenarioTitle: '실무 시나리오 S3 · 텍스트 조건 → 공간 프로그램 → 평면 DXF·일람표 → Blender 시각화 계획',
    scenarioSteps: [
      '빈 연습 폴더를 Codex에서 열고 아래 3단계 통합 요청문을 입력합니다.',
      '$architecture-programming이 정리한 실 목록·인접 관계 표를 확인합니다.',
      '이어서 생성된 평면 DXF·벡터 PDF·일람표와 Blender 제안 컷 3장 계획을 확인합니다.',
    ],
    prompt: `설계 조건: 대지 12m × 15m, 연면적 80m² 이내 단층 주택(현관 · 거실 · 주방/식당 · 침실 2 · 욕실 1).
1) $architecture-programming으로 실 ID, 목표 면적, 필수 인접 관계 표를 정리하고 미정 치수는 표준 가정값으로 제안해 주세요.
2) 승인한 실·벽·문·창 치수만 사용해 $architectural-drawing-generation으로 평면 DXF, 벡터 PDF, 실·문·창 일람표를 만들고 명세 일치 검사(check) 결과를 첨부해 주세요.
3) 확정된 도면 버전 기준으로 $visualization-rendering의 Blender 제안 컷 3장(외관 정면 · 거실 투시 · 주방 시선) 카메라·조명·재료 계획도 정리해 주세요.`,
  },
] as const;

export const archSoftwareRows = [
  {
    role: '① 2D CAD',
    analogy: '디지털 제도판 (자와 펜으로 선 그리기)',
    paid: 'AutoCAD',
    freeMcp: 'LibreCAD + aiblueprint-mcp',
    ext: '.dwg / .dxf',
    usage: '정확한 평면·입면·단면 작도, 인허가·현장 시공 도면',
  },
  {
    role: '② 3D 모델러',
    analogy: '디지털 우드락 모형 (입체 덩어리 만들기)',
    paid: 'SketchUp · Rhino',
    freeMcp: 'Blender (3.6 LTS / 최신판) + blender-mcp',
    ext: '.skp · .fbx · .dae · .obj',
    usage: '건물 형태(매스), 실내 공간감·가구 배치 검토',
  },
  {
    role: '③ 렌더러',
    analogy: '가상 사진 스튜디오 (재질·햇빛 입혀 촬영)',
    paid: 'Enscape · D5 · V-Ray',
    freeMcp: 'Blender(Cycles/Eevee) · Twinmotion(무료판)',
    ext: '.png · .mp4',
    usage: '발주처 설득용 실사 투시도·조감도·영상 제작',
  },
  {
    role: '④ BIM',
    analogy: '도면+3D+물량이 연동된 스마트 레고',
    paid: 'Revit · ArchiCAD',
    freeMcp: 'FreeCAD + freecad-mcp (--freecadcmd)',
    ext: '.rvt / .ifc · .FCStd · .step',
    usage: '정밀 솔리드 벽·창·문 생성, 치수·부피·면적 검증',
  },
] as const;

export const troubleshootingRows = [
  {
    symptom: 'Codex를 껐다 다시 켤 때 JavaScript error — Connection for host ID local not found 팝업이 뜸',
    cause: 'config.toml 문법 오류가 아니라, 이전 Codex 백그라운드 프로세스가 완전히 내려가기 전에 바로 재실행해 종료 중인 프로세스와 충돌한 현상',
    fix: '오류 창의 확인을 누른 뒤 PowerShell에서 Get-Process Codex,codex,codex-computer-use,node_repl -ErrorAction SilentlyContinue | Stop-Process -Force 실행 후 3초 뒤 Codex를 다시 켭니다. (최신 올인원 빌더 [구간 7]에는 이 안전 종료 과정이 이미 자동 포함되어 있습니다.)',
  },
  {
    symptom: '설치 요약표에서 FreeCADCmd 미검출 또는 Blender 경로 미검출로 표시됨',
    cause: '32비트 Windows PowerShell (x86) 창에서 실행해 64비트 C:\\Program Files 경로 대신 Program Files (x86)만 조회한 경우',
    fix: '최신 올인원 빌더는 (x86) 창에서도 64비트 경로와 레지스트리를 자동 탐색합니다. 빌더에서 [자동 병합 · Codex 설정]을 체크해 다시 실행하면 재다운로드 없이 즉시 연결됩니다.',
  },
  {
    symptom: '설치는 끝났는데 Codex 채팅창에 MCP 도구나 $스킬이 안 보임',
    cause: '설치 전에 이미 켜 두었던 Codex 앱이 이전 설정을 물고 있음',
    fix: '작업표시줄 오른쪽 아래 트레이 아이콘까지 Codex 앱을 완전히 종료(Quit)하고 3초 정도 기다린 뒤 다시 실행합니다.',
  },
  {
    symptom: 'FreeCAD로 만든 .FCStd 파일을 열 때 GUI / ViewObject 오류가 남',
    cause: '백그라운드에서 FreeCADGui·Draft·Arch 객체를 호출했거나 내장 그래픽 OpenGL 충돌 발생',
    fix: '올인원 빌더의 [구간 5·7]이 자동 등록한 규칙(순수 Part 솔리드만 생성)을 적용하고, 내장형 GPU PC에서는 바탕화면의 FreeCAD (내장GPU 안전실행).cmd로 엽니다.',
  },
  {
    symptom: '내장 그래픽 노트북에서 최신 Blender가 실행되지 않거나 멈춤',
    cause: 'Blender 4.0 이상은 OpenGL 4.3을 요구해 구형·내장 GPU에서 호환 문제가 생길 수 있음',
    fix: '올인원 빌더에서 [내장형 GPU 추천 · Blender 3.6 LTS Portable]을 선택해 C:\\tools\\blender-3.6-lts 버전으로 실행합니다.',
  },
  {
    symptom: '열린 Blender / FreeCAD 화면을 실시간으로 움직이는 명령이 연결 거부됨',
    cause: '프로그램 내부의 실시간 수신 버튼을 켜지 않았음 (파일만 생성하는 옵션 A·B 백그라운드 작업은 무관)',
    fix: 'Blender는 3D 뷰포트에서 N키 → MCP for Blender 탭 → Connect to MCP server(Start MCP Server), FreeCAD 열린 문서 제어는 Part Design ▾ → MCP Addon → Start RPC Server를 켭니다.',
  },
  {
    symptom: '수동으로 config.toml을 고친 뒤 구문 오류(TOML parse error)가 뜸',
    cause: '같은 [mcp_servers.xxx] 섹션이 두 번 들어갔거나 큰따옴표 안에 역슬래시(\\)를 그대로 넣음',
    fix: '올인원 빌더에서 [자동 병합 · Codex 설정]만 체크해 다시 실행하면 중복 섹션을 자동 정리하고 UTF-8(BOM 없음) 표준 형식으로 복구합니다.',
  },
] as const;
