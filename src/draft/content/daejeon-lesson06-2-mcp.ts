// 제6-2차시 (리뉴얼): 평면도 3D 입체화 영상(Veo) · 3DGS 핵심 · 무료 건축 MCP 3종 공식 설치 가이드

export const lesson062Title =
  '제6-2차시 · [리뉴얼] 평면도 영상화(Veo) · 3DGS 핵심 · 무료 건축 MCP 셋팅';

export const lesson062Lead =
  '기존 제6·7·8차시 원본을 그대로 보존한 채, 실무 수요에 맞춰 평면도 입체화 영상(Veo First→Last) → 3DGS 핵심 개념 → 무료 건축 MCP 3종(aiblueprint · FreeCAD · Blender) 공식 설치까지 한 번에 연결하는 리뉴얼 실습 페이지입니다.';

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
    next: '완성된 8초 입체화 영상과 3DGS 시점 탐색 비교',
  },
  {
    id: 'l062-3dgs-summary',
    title: '7차시 핵심 연결 · 3D Gaussian Splatting(3DGS) 이해와 업스케일 배치 전략',
    minutes: 15,
    action: 'Polygon Mesh · Point Cloud · 3DGS의 차이와 실무 한계를 짚고, 이미지 업스케일을 MCP 최종 결과물 마감 단계로 연결합니다.',
    reason: '3DGS는 편집 가능한 CAD/BIM이 아닌 시각적 시점 탐색 표현이므로, 설계 데이터 제어는 MCP로 넘기고 업스케일은 최종 결과물 고화질화에 집중하기 위해서입니다.',
    next: '건축 소프트웨어 4대장과 DWG vs DXF 이해',
  },
  {
    id: 'l062-arch-software',
    title: '건축 소프트웨어 4대장(CAD · 3D · 렌더러 · BIM) & DWG vs DXF',
    minutes: 15,
    action: 'AutoCAD · SketchUp · 렌더러 · Revit(BIM)의 역할 차이와 DWG/DXF 호환 구조를 이해합니다.',
    reason: '무료 오픈소스 MCP로 작업한 표준 파일(.dxf · .fbx · .dae · .ifc)이 회사 정품 CAD/SketchUp/BIM과 어떻게 호환되는지 알기 위해서입니다.',
    next: '내 PC 사전 점검 및 무료 건축 MCP 3종 설치',
  },
  {
    id: 'l062-precheck',
    title: '설치 전 PC 사전 점검 · 필수 용어(uv · 계정명) & Python·uv 설치',
    minutes: 15,
    action: 'PowerShell에서 중복 설치 여부와 계정명을 먼저 확인하고, 공통 필수 기반인 Python과 uv(uvx)를 공식 경로로 설치합니다.',
    reason: '모든 파이썬 기반 MCP 서버가 uv(uvx)를 공통 실행기로 사용하며, 중복 설치와 경로 오타를 미리 막아야 이후 설치가 매끄럽기 때문입니다.',
    next: '옵션 A · 2D 도면 MCP(LibreCAD + aiblueprint-mcp) 설치',
  },
  {
    id: 'l062-opt-a',
    title: '[옵션 A · 2D 도면 MCP] LibreCAD + aiblueprint-mcp 공식 설치',
    minutes: 15,
    action: '무료 2D CAD 뷰어 LibreCAD와 공개 2D DXF MCP 서버(aiblueprint-mcp)를 GitHub 공식 경로에서 내려받아 uv sync로 준비합니다.',
    reason: '유료 AutoCAD 없이도 표준 .dxf 도면을 AI로 생성·편집하고 LibreCAD 및 회사 AutoCAD에서 그대로 열어 확인하기 위해서입니다.',
    next: '옵션 B · 무료 CAD·BIM MCP(FreeCAD + freecad-mcp) 설치',
  },
  {
    id: 'l062-opt-b',
    title: '[옵션 B · 무료 CAD·BIM MCP] FreeCAD 1.1 + freecad-mcp 공식 설치',
    minutes: 20,
    action: 'FreeCAD를 설치·1회 실행한 뒤 freecad-mcp 애드온 폴더를 Mod 경로(v1-1\\Mod)에 복사하고, MCP Addon에서 Start RPC Server를 켭니다.',
    reason: '정밀 치수(mm) 기반 파라메트릭 3D 모델링과 2D 도면(.dxf) · BIM(.ifc) 내보내기를 무료 환경에서 체험하기 위해서입니다.',
    next: '메인 3D 모델링 MCP(Blender + blender-mcp) 확인',
  },
  {
    id: 'l062-blender-mcp',
    title: '[메인 3D · 모델링 MCP] Blender + blender-mcp 공식 설치',
    minutes: 10,
    action: 'Blender 4.x에 addon.py를 등록하고 N키 사이드바의 BlenderMCP 탭에서 Connect to MCP server를 활성화합니다.',
    reason: '실내 가구·재질·조명·카메라 무빙과 SketchUp 호환(.fbx/.dae) 내보내기를 수행하는 8·9차시 메인 3D MCP 환경이기 때문입니다.',
    next: 'AI 클라이언트(Codex · Claude Desktop) 통합 연결과 10초 검증',
  },
  {
    id: 'l062-client-connect',
    title: 'AI 클라이언트(Codex · Claude Desktop) 3종 통합 연결 & 오류 해결',
    minutes: 10,
    action: 'config.toml(또는 Claude Desktop JSON)에 aiblueprint · freecad · blender 3종을 등록하고 완전 재시작 후 연결을 검증합니다.',
    reason: '하나의 대화창에서 2D 도면 · BIM · 3D 모델링 도구를 자유롭게 호출할 준비를 끝내고, 다음 단계 실무 MCP 시나리오와 최종 업스케일로 넘어가기 위해서입니다.',
    next: '실무 건축 MCP 시나리오 실습 및 최종 이미지 업스케일 마감',
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
    title: '7차시 핵심(3DGS) · 건축 소프트웨어 4대장 & DWG vs DXF',
    sections: lesson062Sections.slice(2, 4),
  },
  {
    id: 'l062-part-3',
    title: '무료 건축 MCP 3종 공식 설치 & 클라이언트 통합 연결',
    sections: lesson062Sections.slice(4, 9),
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

export const precheckCommands = `$env:USERNAME
python --version
where.exe uv
where.exe uvx`;

export const uvInstallCmd = `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`;

export const optAFullCmd = `mkdir C:\\mcp
cd C:\\mcp
git clone https://github.com/thebossnow/aiblueprint-mcp.git
cd aiblueprint-mcp
uv sync`;

export const optAInsideCmd = `git clone https://github.com/thebossnow/aiblueprint-mcp.git
cd aiblueprint-mcp
uv sync`;

export const optBCloneCmd = `cd C:\\mcp
git clone https://github.com/neka-nat/freecad-mcp.git`;

export const freeCadModPathCmd = `import os; print(os.path.join(FreeCAD.getUserAppDataDir(), "Mod"))`;

export const codexUnifiedConfig = `[mcp_servers.aiblueprint]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uv.exe'
args = ["run", "--directory", 'C:\\mcp\\aiblueprint-mcp', "aiblueprint-mcp"]
startup_timeout_sec = 60

[mcp_servers.freecad]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uvx.exe'
args = ["freecad-mcp"]
startup_timeout_sec = 60

[mcp_servers.blender]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uvx.exe'
args = ["blender-mcp"]
startup_timeout_sec = 60`;

export const claudeUnifiedConfig = `{
  "mcpServers": {
    "aiblueprint": {
      "command": "C:\\\\Users\\\\<본인계정명>\\\\.local\\\\bin\\\\uv.exe",
      "args": ["run", "--directory", "C:\\\\mcp\\\\aiblueprint-mcp", "aiblueprint-mcp"]
    },
    "freecad": {
      "command": "C:\\\\Users\\\\<본인계정명>\\\\.local\\\\bin\\\\uvx.exe",
      "args": ["freecad-mcp"]
    },
    "blender": {
      "command": "C:\\\\Users\\\\<본인계정명>\\\\.local\\\\bin\\\\uvx.exe",
      "args": ["blender-mcp"]
    }
  }
}`;

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
    freeMcp: 'Blender + blender-mcp',
    ext: '.skp · .fbx · .dae',
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
    analogy: '도면+3D+견적서가 연동된 스마트 레고',
    paid: 'Revit · ArchiCAD',
    freeMcp: 'FreeCAD 1.1 + freecad-mcp',
    ext: '.rvt / .ifc',
    usage: '벽·창·문 객체 속성 연동, 도면·물량 자동 산출',
  },
] as const;

export const troubleshootingRows = [
  {
    symptom: 'where.exe uvx 실행 시 아무 경로도 나오지 않음',
    cause: 'uv 설치 직후 기존 PowerShell 창을 그대로 사용함',
    fix: '기존 창을 닫고 새 PowerShell을 열어 where.exe uvx를 다시 실행합니다.',
  },
  {
    symptom: 'Codex 실행 시 config.toml 구문 오류 표시',
    cause: 'Windows 경로의 역슬래시(\\)를 큰따옴표("...") 안에 넣어 깨짐',
    fix: "경로는 반드시 작은따옴표('C:\\Users\\...')로 감싸서 저장합니다.",
  },
  {
    symptom: 'FreeCAD 상단 Part Design ▾ 목록에 MCP Addon이 안 보임',
    cause: 'FreeCAD 1.1에서 v1-1\\Mod가 아닌 상위 Mod 폴더에 복사했거나 addon 폴더 통째로 복사함',
    fix: '파이썬 명령창에서 Mod 경로를 확인하고, 그 안에 FreeCADMCP 폴더(InitGui.py 포함)가 직접 들어가게 둔 뒤 FreeCAD를 재실행합니다.',
  },
  {
    symptom: 'config.toml을 저장했는데 Codex에 MCP 도구가 안 보임',
    cause: '설정 파일 저장 후 대화창만 새로 열고 앱을 완전 재시작하지 않음',
    fix: '작업표시줄 트레이 아이콘까지 앱을 완전히 종료했다가 다시 실행합니다.',
  },
  {
    symptom: 'Blender / FreeCAD MCP 호출 시 연결 실패 또는 시간 초과',
    cause: '각 프로그램 안에서 서버 대기 버튼을 켜지 않았음',
    fix: 'FreeCAD는 MCP Addon → Start RPC Server, Blender는 N키 → BlenderMCP → Connect to MCP server를 먼저 켭니다.',
  },
] as const;
