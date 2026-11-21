// 제7-2차시 (리뉴얼): 평면도 3D 입체화 영상(Veo) · 3DGS 핵심 · 무료 건축 MCP 3종 공식 설치 가이드

export const lesson062Title =
  '제7-2차시 · [리뉴얼] 평면도 영상화(Veo) · 3DGS 핵심 · 무료 건축 MCP 셋팅';

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
    action: 'FreeCAD를 설치합니다. 열린 모델을 제어하는 실습에서는 애드온을 복사해 Start RPC Server를 켜고, 파일만 처리할 때는 FreeCADCmd로 실행합니다.',
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
    title: 'AI 클라이언트 3종 통합 연결 · FreeCAD 백그라운드 빠른 설정',
    minutes: 10,
    action: 'config.toml(또는 Claude Desktop JSON)에 aiblueprint · freecad · blender 3종을 등록하고 완전 재시작 후 연결을 검증합니다.',
    reason: '하나의 대화창에서 2D 도면 · BIM · 3D 모델링 도구를 자유롭게 호출할 준비를 끝내고, 다음 단계 실무 MCP 시나리오와 최종 업스케일로 넘어가기 위해서입니다.',
    next: '도면 검수와 개념 설계에 필요한 선택 스킬 확인',
  },
  {
    id: 'l062-codex-skills',
    title: '선택 실습 · 현재 작업 흐름에 Codex 건축 스킬 더하기',
    minutes: undefined,
    action: 'DXF 검수, 개념 설계, 건축 문서 조정 중 지금 필요한 작업을 정하고, 대응하는 스킬 하나를 프로젝트에 적용합니다.',
    reason: '반복되는 입력 확인, 산출물 생성, 검수 절차를 같은 기준으로 수행할 수 있습니다.',
    next: '검증한 DXF와 매스를 바탕으로 옵션 A·B 실무 시나리오 실습으로 연결',
  },
  {
    id: 'l062-mcp-scenarios',
    title: '실전 실습 · 샘플 자료로 옵션 A(2D 도면) · 옵션 B(3D CAD) 바로 써 보기',
    minutes: undefined,
    action: '제공되는 샘플 3종(평면도 PNG · 표준 DXF · 대지 조건서 TXT)을 내려받아 실제 사무실 상황 그대로 2D 도면 작도·수정 비교·3D 건물 압출·기획 매스 검토를 체험합니다.',
    reason: '빈 상자 테스트를 넘어, 첨부자료를 기반으로 실제 건축 실무에 바로 투입할 수 있는 자연어 요청 흐름을 익히기 위해서입니다.',
    next: '생성한 .obj / .FCStd 3D 모델을 제8·9차시 Blender MCP와 제7차시 업스케일로 연결',
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
    sections: lesson062Sections.slice(4),
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

export const optAOneClickCmd = `# 1) 무료 2D 도면 뷰어 LibreCAD 설치 (이미 있으면 자동 건너뜀)
winget install -e --id LibreCAD.LibreCAD --accept-package-agreements --accept-source-agreements

# 2) 도면 MCP 내려받기 + 부품 자동 설치
New-Item -ItemType Directory -Force 'C:\\mcp' | Out-Null
if (-not (Test-Path 'C:\\mcp\\aiblueprint-mcp')) {
  git clone https://github.com/thebossnow/aiblueprint-mcp.git 'C:\\mcp\\aiblueprint-mcp'
}
Set-Location 'C:\\mcp\\aiblueprint-mcp'
uv sync

# 3) 성공 확인 (True가 나오면 옵션 A 설치 끝!)
Test-Path 'C:\\mcp\\aiblueprint-mcp\\.venv\\Scripts\\aiblueprint-mcp.exe'`;

export const optBOneClickCmd = `# 1) 무료 3D CAD/BIM FreeCAD 설치 (이미 있으면 자동 건너뜀)
winget install -e --id FreeCAD.FreeCAD --accept-package-agreements --accept-source-agreements

# 2) FreeCAD MCP 내려받기
New-Item -ItemType Directory -Force 'C:\\mcp' | Out-Null
if (-not (Test-Path 'C:\\mcp\\freecad-mcp')) {
  git clone https://github.com/neka-nat/freecad-mcp.git 'C:\\mcp\\freecad-mcp'
}

# 3) FreeCAD 플러그인 폴더(AppData\\Roaming\\FreeCAD\\v1-1\\Mod)에 자동 복사
$modDir = "$env:APPDATA\\FreeCAD\\v1-1\\Mod"
New-Item -ItemType Directory -Force $modDir | Out-Null
Copy-Item -Recurse -Force 'C:\\mcp\\freecad-mcp\\addon\\FreeCADMCP' "$modDir\\"

# 4) 성공 확인 (둘 다 True가 나오면 옵션 B 설치 끝!)
Write-Host "플러그인 복사 확인:" (Test-Path "$modDir\\FreeCADMCP\\InitGui.py")
Write-Host "백그라운드 엔진 확인:" (Test-Path 'C:\\Program Files\\FreeCAD 1.1\\bin\\FreeCADCmd.exe')`;

export const codexAutoConfigCmd = `$u = $env:USERNAME
$fc = (Get-ChildItem 'C:\\Program Files\\FreeCAD*' -Recurse -Filter FreeCADCmd.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
if (-not $fc) { $fc = 'C:\\Program Files\\FreeCAD 1.1\\bin\\FreeCADCmd.exe' }
@"
[mcp_servers.aiblueprint]
command = 'C:\\Users\\$u\\.local\\bin\\uv.exe'
args = ["run", "--directory", 'C:\\mcp\\aiblueprint-mcp', "aiblueprint-mcp"]
startup_timeout_sec = 60

[mcp_servers.freecad]
command = 'C:\\Users\\$u\\.local\\bin\\uvx.exe'
args = ["freecad-mcp", "--host", "127.0.0.1", "--freecadcmd", '$fc']
startup_timeout_sec = 60

[mcp_servers.blender]
command = 'C:\\Users\\$u\\.local\\bin\\uvx.exe'
args = ["blender-mcp"]
startup_timeout_sec = 60
"@
# 출력된 내용을 복사한 뒤 아래 한 줄로 config.toml을 바로 열어 붙여넣고 저장:
# notepad "$env:USERPROFILE\\.codex\\config.toml"`;

export const codexUnifiedConfig = `[mcp_servers.aiblueprint]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uv.exe'
args = ["run", "--directory", 'C:\\mcp\\aiblueprint-mcp', "aiblueprint-mcp"]
startup_timeout_sec = 60

[mcp_servers.freecad]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uvx.exe'
args = ["freecad-mcp", "--host", "127.0.0.1"]
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
      "args": ["freecad-mcp", "--host", "127.0.0.1"]
    },
    "blender": {
      "command": "C:\\\\Users\\\\<본인계정명>\\\\.local\\\\bin\\\\uvx.exe",
      "args": ["blender-mcp"]
    }
  }
}`;

export const optADirectExeCheck = String.raw`Test-Path -LiteralPath 'C:\mcp\aiblueprint-mcp\.venv\Scripts\aiblueprint-mcp.exe'`;

export const optADirectExeConfig = `[mcp_servers.aiblueprint]
command = 'C:\\mcp\\aiblueprint-mcp\\.venv\\Scripts\\aiblueprint-mcp.exe'
startup_timeout_sec = 30`;

export const freeCadCmdCheck = String.raw`Test-Path -LiteralPath 'C:\Program Files\FreeCAD 1.1\bin\FreeCADCmd.exe'`;

export const freeCadHeadlessArgs = String.raw`args = ["freecad-mcp", "--host", "127.0.0.1", "--freecadcmd", 'C:\Program Files\FreeCAD 1.1\bin\FreeCADCmd.exe']`;

export const freeCadHeadlessFullBlock = `[mcp_servers.freecad]
command = 'C:\\Users\\<본인계정명>\\.local\\bin\\uvx.exe'
args = ["freecad-mcp", "--host", "127.0.0.1", "--freecadcmd", 'C:\\Program Files\\FreeCAD 1.1\\bin\\FreeCADCmd.exe']
startup_timeout_sec = 60`;

export const fastPromptRules = [
  {
    title: '원칙 1 · 화면 클릭(Computer Use) 피하고 백그라운드 도구 사용',
    bad: 'LibreCAD 창을 띄워서 마우스로 확인해 줘.',
    good: '화면 조작(Computer Use)을 쓰지 말고, 백그라운드 파일 도구(execute_code_headless · DXF 저장 · screenshot)로만 처리하고 결과 경로를 알려 줘.',
  },
  {
    title: '원칙 2 · 2D 도면(aiblueprint)은 중간 미리보기 반복 금지',
    bad: '벽 하나 그릴 때마다 미리보기 이미지를 보여 줘.',
    good: '중간마다 미리보기 PNG를 렌더링하지 말고, 모든 벽·창·문·치수 작업을 끝낸 뒤 마지막에 딱 한 번만 DXF 저장과 미리보기를 실행해 줘.',
  },
  {
    title: '원칙 3 · 3D(FreeCAD · Blender)는 코드 실행 도구 1회 일괄 생성',
    bad: '벽 1 만들고, 벽 2 만들고, 창문 1 만들고 하나씩 따로 호출해 줘.',
    good: '개별 도구를 여러 번 왕복 호출하지 말고, 코드 실행 도구(execute_code_headless 또는 execute_blender_code) 단 1회 호출로 전체 벽체·개구부·바닥·카메라를 한꺼번에 생성해 줘.',
  },
] as const;

export const cadDoctorCmd = 'python .agents/skills/cad-drawings/scripts/doctor.py';

export const skillVerifyCmd = `# 방금 설치 명령을 실행한 같은 PowerShell 창에서 확인
Test-Path .\\.agents\\skills\\architectural-concept-design\\SKILL.md
# 파일 탐색기로 .agents\\skills 폴더 바로 열기
explorer .\\.agents\\skills`;

export const l062QuickIndex = [
  { code: '01', label: 'Veo 평면 입체화 원리', href: '#l062-video-principle' },
  { code: '02', label: 'Veo 한글 프롬프트 5종', href: '#l062-video-prompts' },
  { code: '03', label: '3DGS 핵심 & 업스케일', href: '#l062-3dgs-summary' },
  { code: '04', label: '건축 4대장 & DWG vs DXF', href: '#l062-arch-software' },
  { code: '05', label: 'PC 사전 점검 & uv 설치', href: '#l062-precheck' },
  { code: '06', label: '옵션 A · aiblueprint', href: '#l062-opt-a' },
  { code: '07', label: '옵션 B · FreeCAD MCP', href: '#l062-opt-b' },
  { code: '08', label: '메인 3D · Blender MCP', href: '#l062-blender-mcp' },
  { code: '09-1', label: 'Codex·Claude 통합 설정', href: '#l062-client-config' },
  { code: '09-2', label: 'FreeCAD 백그라운드 빠른 설정', href: '#l062-freecad-headless' },
  { code: '09-3', label: '느림 방지 프롬프트 3원칙', href: '#l062-fast-prompt-rules' },
  { code: '09-4', label: '연결 확인 테스트 3종', href: '#l062-verify-tests' },
  { code: '09-5', label: '자주 만나는 오류 해결', href: '#l062-troubleshooting' },
  { code: '10-1', label: '스킬 3단계 설치·폴더 확인', href: '#l062-skills-guide' },
  { code: '10-2', label: '$cad-drawings (DXF 검수)', href: '#l062-skill-cad-drawings' },
  { code: '10-3', label: '$architectural-concept-design', href: '#l062-skill-concept-design' },
  { code: '10-4', label: 'Gridline 3종 (도면·시각화)', href: '#l062-skill-gridline' },
  { code: '10-5', label: '$my-arch-dxf (직접 제작)', href: '#l062-custom-skill' },
  { code: '11-1', label: '실습 샘플 3종 다운로드 & 위치', href: '#l062-sample-pack' },
  { code: '11-2', label: '[옵션 A] 사진·PDF → DXF 작도', href: '#l062-scenario-a1' },
  { code: '11-3', label: '[옵션 A] 기존 DXF 수정·비교표', href: '#l062-scenario-a2' },
  { code: '11-4', label: '[옵션 B] 2D DXF → 3D 건물 세우기', href: '#l062-scenario-b1' },
  { code: '11-5', label: '[옵션 B] 대지 조건서 → 3층 매스', href: '#l062-scenario-b2' },
] as const;

export const mcpPracticeScenarios = [
  {
    id: 'l062-scenario-a1',
    optionTag: '옵션 A · 2D 도면',
    optionTone: 'teal',
    sampleTag: '사용 샘플: ① 오피스 평면도 PNG (PLAN-BASE-01)',
    title: '시나리오 A-1 · CAD 파일 없이 평면도 사진·PDF만 받았을 때 → 도면(DXF)과 면적표 만들기',
    situation: '발주처나 부동산에서 캐드 원본(.dwg)은 없고 평면도 이미지나 PDF 한 장만 보내줬습니다. 이걸 보고 캐드에서 처음부터 다시 따라 그리면 반나절이 걸립니다.',
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
        text: `정리해 준 표대로 2D DXF 평면도(office_plan.dxf)를 만들어 줘.
(고칠 숫자가 있으면 여기에 한 줄 추가: 예) 회의실 문 폭은 900mm로 맞춰 줘.)

- 단위는 mm로 맞추고, 회사 AutoCAD나 LibreCAD에서 바로 수정할 수 있게 외벽·내벽·문·창문·가구·치수·실명 레이어를 나눠 줘.
- 화면을 마우스로 클릭하지 말고 백그라운드에서 한 번에 파일로 만들어 줘.
- 끝나면 도면 미리보기 이미지 1장이랑, 엑셀에서 한글 안 깨지는 실별 면적표(CSV)도 같이 저장해 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-a2',
    optionTag: '옵션 A · 2D 도면 + $cad-drawings',
    optionTone: 'teal',
    sampleTag: '사용 샘플: ② 06_sample_office_plan_v1.dxf',
    title: '시나리오 A-2 · 발주처 수정 요청 대응 → 기존 DXF 고치고 “바뀐 점 보고서” 뽑기',
    situation: '어제 보낸 평면도를 본 발주처가 “업무공간을 조금 넓히고, 창문도 더 키워 주세요. 그리고 면적이 몇 평 바뀌었는지 알려 주세요”라고 요청했습니다.',
    whereToUseSample: '다운로드한 ② 06_sample_office_plan_v1.dxf를 작업 폴더(예: C:\\work\\mcp-practice)에 넣어 두고, Codex에서 그 폴더를 연 뒤 실행합니다. (시나리오 A-1을 건너뛰고 바로 시작할 수 있습니다.)',
    steps: [
      '원본 DXF는 그대로 보존하고, 수정한 내용을 새 파일(office_plan_v2.dxf)로 저장하게 합니다.',
      '$cad-drawings 스킬로 원본과 수정본을 자동 비교해 변경된 선·치수와 방별 면적 변화표를 받습니다.',
      'LibreCAD에서 두 파일을 열어 수정된 가벽과 창문 폭을 최종 육안 확인합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 기존 DXF 수정 + 원본 vs 수정본 면적 변화표 보고',
        text: `작업 폴더에 있는 06_sample_office_plan_v1.dxf를 수정해서 office_plan_v2.dxf로 새로 저장해 줘.
수정할 부분은 두 가지야:
1) 회의실 안쪽 가벽을 오른쪽으로 600mm 옮겨서 업무공간을 넓혀 줘.
2) 위쪽 창문(W2) 폭을 600mm 더 넓혀 줘.

저장이 끝나면 $cad-drawings로 원본(06_sample_office_plan_v1.dxf)과 수정본(office_plan_v2.dxf)을 비교해서,
어디가 바뀌었고 방별 면적(㎡·평)이 얼마나 달라졌는지 발주처에게 보내기 좋게 표로 정리해 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-b1',
    optionTag: '옵션 B · 3D CAD/BIM (FreeCAD)',
    optionTone: 'navy',
    sampleTag: '사용 샘플: ② 06_sample_office_plan_v1.dxf (또는 A-2의 v2)',
    title: '시나리오 B-1 · 2D 도면(DXF) → 문·창문 뚫린 3D 건물로 바로 세우기',
    situation: '2D 평면도는 확정됐는데, 발주처에게 입체감을 보여 주거나 나중에 Blender·SketchUp으로 넘겨 인테리어할 정확한 치수의 3D 벽체 모델이 필요합니다.',
    whereToUseSample: '작업 폴더에 있는 ② 06_sample_office_plan_v1.dxf(또는 A-2에서 만든 office_plan_v2.dxf)를 그대로 사용합니다. FreeCAD 창을 켜지 않고 백그라운드(execute_code_headless)로 실행됩니다.',
    steps: [
      'DXF 파일의 외벽·내벽·기둥·문·창문 레이어를 읽어 FreeCAD가 백그라운드에서 3m 높이로 3D 벽체를 세웁니다.',
      '문·창문 자리를 정확히 뚫고 유리까지 넣은 뒤, .FCStd · .step · .obj(Blender/SketchUp 임포트용) 3가지로 저장합니다.',
      '저장된 파일을 다시 열어 가로·세로·높이 치수와 벽체 전체 부피(m³)를 자동 검수합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 2D DXF 평면도를 FreeCAD 3D 건물(FCStd · STEP · OBJ)로 1회 생성',
        text: `작업 폴더에 있는 06_sample_office_plan_v1.dxf 평면도를 가지고 FreeCAD MCP(execute_code_headless)로 3D 건물을 한 번에 세워 줘.
- 화면 조작 없이 백그라운드에서 코드 1회 실행으로 처리해 줘.
- 바닥 두께 200mm, 천장(벽체) 높이 3,000mm로 올려 줘.
- 문 자리는 높이 2,100mm로 뚫고, 창문 자리는 바닥에서 900mm 띄우고 높이 1,500mm로 뚫어서 유리까지 끼워 줘.
- 결과물은 FreeCAD 파일(office_3d.FCStd), 정밀 CAD(office_3d.step), 그리고 Blender·SketchUp에서 불러올 office_3d.obj 파일까지 3가지로 저장해 줘.
- 끝나면 파일을 다시 열어서 전체 가로·세로·높이가 맞는지, 벽체 전체 부피(m³)가 얼마인지 알려 줘.`,
      },
    ],
  },
  {
    id: 'l062-scenario-b2',
    optionTag: '옵션 B · 3D 기획 매스 (FreeCAD)',
    optionTone: 'navy',
    sampleTag: '사용 샘플: ③ 07_sample_site_brief_3f_commercial.txt',
    title: '시나리오 B-2 · 대지·기획 조건서만 보고 → 3층 건물 기획 매스 & 건폐율·용적률 검토하기',
    situation: '새 신축 프로젝트 의뢰가 들어와 땅 크기와 층별 조건(1층 필로티, 2~3층 사무실, 북쪽 일조권 후퇴)을 받았습니다. 본격 설계 전에 땅 위에 건물이 어느 정도 덩어리로 올라가는지 3D로 확인하고, 건폐율·용적률 숫자도 빠르게 검토하고 싶습니다.',
    whereToUseSample: '다운로드한 ③ 07_sample_site_brief_3f_commercial.txt 파일을 작업 폴더에 넣거나 Codex 채팅창에 첨부(+)한 뒤 아래 프롬프트를 보냅니다.',
    steps: [
      '메모장으로 조건서(TXT)를 한 번 열어 대지 크기(12×18m)와 층별 조건을 눈으로 확인합니다.',
      'Codex에 조건서를 첨부(또는 폴더 경로 지정)하고 FreeCAD 백그라운드로 3층 기획 3D 매스를 생성합니다.',
      '생성된 mass_study.FCStd / .obj를 FreeCAD나 Blender에서 열어 덩어리감을 보고, 건폐율(50.0%)·용적률(99.77%) 계산표를 확인합니다.',
    ],
    prompts: [
      {
        label: '실전 프롬프트 · 대지 조건서(TXT) 첨부 → 3층 기획 3D 매스 & 법규 면적표 자동 계산',
        text: `첨부한 07_sample_site_brief_3f_commercial.txt 조건서를 읽고, FreeCAD MCP(execute_code_headless)로 3층 근린생활시설 기획 3D 매스를 한 번에 만들어 줘.
- 화면 조작 없이 백그라운드에서 코드 1회 실행으로 처리해 줘.
- 조건서에 적힌 대지 판(12×18m), 1층 필로티 기둥 6개와 계단실 코어, 2층 매스, 북쪽 2m 후퇴를 반영한 3층 매스, 옥상 난간(파라펫 1.2m)까지 모두 반영해 줘.
- 결과물은 mass_study.FCStd, mass_study.step, mass_study.obj로 저장해 줘.
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

export const freeCadHeadlessPrompt = `FreeCAD MCP의 execute_code_headless 도구를 사용해 화면 조작 없이 가로 6000mm × 세로 4000mm × 높이 3000mm 매스를 만드세요.
한 MCP 세션에서 3회 연속 실행하고, 회차별로 새 폴더를 만들어 FCStd와 STEP으로 각각 저장하세요.
각 회차에서 저장한 두 파일을 다시 읽고 유효한 솔리드 1개인지, 외곽 치수 6000 × 4000 × 3000mm와 부피 72m³가 맞는지 검증하세요.
첫 연결 시간, 회차별 도구 실행 시간, 전체 시간과 결과 경로를 알려 주세요.`;

export const freeCadHeadlessTimings = [
  { run: '1회', duration: '0.516초' },
  { run: '2회', duration: '0.599초' },
  { run: '3회', duration: '0.600초' },
] as const;

export const cadSkillExamples = [
  {
    id: 'cad-drawings',
    badge: '도면 자동 검수관 · 입문 1순위',
    prepBadge: '준비물: 기존 DXF 파일 1개 필요',
    prepNeedsDxf: true,
    title: 'cad-drawings · 기존 DXF 검수에 우선 추천',
    plainSummary: '이미 그려진 DXF 도면이 치수·단위·레이어·폐합 경계대로 제대로 만들어졌는지, 그리고 수정 전(v1)과 수정 후(v2)가 어디가 바뀌었는지 CAD 창을 켜지 않고 자동으로 점검해 주는 검수 스킬입니다.',
    source: 'https://github.com/numikel/cad-drawings#quick-start',
    sourceLabel: 'numikel/cad-drawings',
    skillFolders: ['cad-drawings'],
    install: 'npx skills add numikel/cad-drawings --skill cad-drawings -a codex --copy',
    fit: 'aiblueprint로 만든 DXF나 외부 도면의 치수·단위·레이어를 확인하거나, 같은 도면의 두 버전이 어떻게 달라졌는지 비교할 때 씁니다.',
    logic: 'DXF를 ezdxf로 읽어 모델 공간과 레이아웃의 객체를 조사합니다. 면적은 닫힌 경계가 확보된 경우에 계산합니다. 서로 맞닿는 선으로 이루어진 단순 외곽은 먼저 연결할 수 있습니다. 버전 비교는 저장할 때 바뀌는 객체 번호를 걸러 내고 실제 형상과 속성의 변경을 보여 줍니다.',
    result: '단위·객체 수·레이어 목록, 치수·면적·둘레, 수정 전후 차이, PNG 미리보기를 얻습니다. aiblueprint로 생성하고, 이 스킬로 파일을 검수한 후 필요할 때 LibreCAD에서 직접 열어 봅니다.',
    limit: 'DXF는 CAD 창 없이 읽습니다. DWG는 변환기 또는 설정된 Windows AutoCAD가 필요합니다. 파일에서 그린 PNG는 실제 CAD 플롯과 다를 수 있습니다. 단순한 사각형 한 장은 aiblueprint 자체 측정과 미리보기로도 충분합니다.',
    setup: 'Python 3.10 이상이 필요합니다. 설치 후 아래 doctor.py 진단 명령으로 DXF 판독·미리보기에 필요한 패키지 상태를 확인합니다. 진단 스크립트는 패키지를 자동 설치하지 않으므로 부족한 항목 안내를 보고 설치합니다.',
    scenarioTitle: '실무 시나리오 S1 · 10 × 6m 도면 면적 검수 & v1 vs v2 변경점 자동 비교',
    scenarioSteps: [
      'aiblueprint MCP로 만든 기본 10 × 6m 평면 DXF(v1)를 프로젝트 폴더에 준비합니다.',
      '아래 1차 검수 요청으로 단위·OUTLINE 레이어·폐합 경계·면적(60m²)·둘레(32m)와 PNG 미리보기를 확인합니다.',
      '도면의 문 위치나 벽선을 수정해 v2.dxf로 저장한 뒤, "$cad-drawings로 v1.dxf와 v2.dxf의 실제 형상·속성 변경점만 비교 표로 정리해 줘"라고 이어서 요청합니다.',
    ],
    prompt: `$cad-drawings로 이 DXF를 읽기 전용으로 검수해 주세요. 도면 단위와 OUTLINE 레이어를 확인하고, 외곽이 네 개의 선이라면 끝점을 연결해 닫힌 경계를 확인하세요. 가로 10m, 세로 6m, 면적 60m², 둘레 32m인지 알려 주고 PNG 미리보기 한 장을 만들어 주세요.`,
  },
  {
    id: 'concept-design',
    badge: '개념 설계 자동 생성기 · 빈 대지 초안용',
    prepBadge: '준비물: 도면 파일 불필요 · 빈 폴더 + 텍스트 조건',
    prepNeedsDxf: false,
    title: 'Architectural Concept Design · 요구사항에서 개념 도면으로',
    plainSummary: '아직 도면이 전혀 없는 빈 대지 단계에서 "땅 크기, 도로 방향, 방 개수, 연면적 한도"만 말로 적으면, 규칙 검사(동선·가구 간섭·면적)를 거쳐 평면·입면·단면 도면(DXF/PDF)과 3D 웹 뷰어까지 한 번에 뽑아 주는 설계 스킬입니다.',
    source: 'https://github.com/Mhrnqaruni/ai-agent-skill-architectural-concept-design#install',
    sourceLabel: 'Mhrnqaruni/ai-agent-skill-architectural-concept-design',
    skillFolders: ['architectural-concept-design'],
    install: 'npx skills add Mhrnqaruni/ai-agent-skill-architectural-concept-design --skill architectural-concept-design -a codex --copy',
    fit: '빈 대지에서 필요한 실과 목표 면적, 진입 방향, 이격 조건을 바탕으로 첫 주택 평면과 단면·입면을 구성할 때 씁니다.',
    logic: '요구사항의 출처와 미정 사항을 정리한 뒤 대지, 실, 벽, 개구부, 가구를 미터 단위 design.json에 작성합니다. Python 엔진의 check로 출입·문과 가구의 간섭·이격·면적 등을 확인하고, 같은 모델에서 build로 도면과 면적표를 생성합니다.',
    result: '개념 평면·입면·단면 DXF/PDF/PNG, 면적표 CSV, HTML 3D 뷰어, 검사 결과 JSON을 얻습니다. DXF는 LibreCAD 또는 cad-drawings로 확인하고, 필요한 정밀 모델은 FreeCAD에서 치수를 바탕으로 작성합니다.',
    limit: '직교 벽과 평탄한 대지 중심의 개념 설계입니다. HTML 뷰어는 웹에서 모델을 확인하는 산출물입니다. IFC 내보내기와 국내 건축 법규 검증은 별도입니다.',
    setup: 'Python 3.10 이상과 ezdxf·PyMuPDF·Pillow가 필요합니다. uv가 설치되어 있으면 에이전트가 스킬 폴더 안의 scripts/concept.py를 uv run으로 실행해 의존성을 자동 준비합니다. 선택 렌더에는 Chrome·Edge·Chromium 중 하나가 필요합니다.',
    scenarioTitle: '실무 시나리오 S2 · 16 × 24m 빈 대지 단층 2침실 주택 개념 세트 일괄 생성',
    scenarioSteps: [
      '발주처 조건(대지 16 × 24m, 남측 도로, 단층 2침실, 연면적 95m² 이하)을 아래 요청문으로 입력합니다.',
      'Codex가 design.json을 작성하고 check 단계에서 문 열림 간섭·동선·목표 면적 초과 여부를 자동 점검하는 과정을 확인합니다.',
      '생성된 평면·입면·단면 DXF/PDF와 면적표 CSV, HTML 3D 뷰어를 열어 보고, 확정 치수만 골라 FreeCAD/Blender로 정밀화합니다.',
    ],
    prompt: `$architectural-concept-design으로 16 × 24m 대지의 단층 2침실 주택 개념안을 만들어 주세요. 남쪽이 도로이고 연면적은 95m² 이하입니다. 실별 목표 면적과 남은 제약을 먼저 정리하고, 미제공 이격 기준은 확인 항목으로 표시하세요. design.json 검사 후 평면·입면·단면 DXF/PDF와 면적표를 만들어 주세요.`,
  },
  {
    id: 'gridline',
    badge: '프로젝트 조정 팀 매니저 · 다단계 실무용',
    prepBadge: '준비물: 도면 파일 불필요 · 빈 폴더 + 텍스트 조건',
    prepNeedsDxf: false,
    title: 'Gridline · 여러 작업을 조정할 때 필요한 스킬만 선택',
    plainSummary: '방 목록 기획 → 평면도·실/문/창 일람표 생성 → Blender 시각화 계획까지 여러 단계의 산출물 버전을 서로 어긋나지 않게 맞춰 주는 모듈형 건축 스킬 묶음입니다. 30여 개 중 지금 필요한 3개만 골라 설치합니다.',
    source: 'https://github.com/MakeItEzzz555/Gridline#coordinated-cad-drawings',
    sourceLabel: 'MakeItEzzz555/Gridline',
    skillFolders: ['architecture-programming', 'architectural-drawing-generation', 'visualization-rendering'],
    install: 'npx skills add MakeItEzzz555/Gridline --skill architecture-programming --skill architectural-drawing-generation --skill visualization-rendering -a codex --copy',
    fit: '실 목록과 인접 조건을 정리하고 도면과 일람표 버전을 맞춘 뒤, 같은 설계안을 Blender 제안 컷으로 연결하는 등 작업이 여러 단계일 때 씁니다.',
    logic: 'architecture-programming으로 실 ID·목표 면적·인접 조건을 정리합니다. architectural-drawing-generation은 확정한 벽·문·창·실·치수를 건물 JSON 명세에 넣어 평면, 일람표, 도면 목록을 생성하고 check로 명세와 산출물의 일부 항목을 대조합니다. visualization-rendering은 현재 도면 버전에 맞춘 카메라·재료·조명·필요한 컷을 계획합니다.',
    result: '정리된 공간 프로그램, 레이어를 가진 평면 DXF와 벡터 PDF, 실·문·창 일람표를 얻습니다. Blender MCP가 연결돼 있으면 시각화 스킬이 정한 카메라·조명 계획을 실제 장면에 적용할 수 있습니다.',
    limit: '현재 로컬 도면 생성기는 평면 중심이며, 제공된 검사는 지원 항목의 일치 여부를 확인합니다. Revit·AutoCAD·Rhino를 직접 편집하려면 해당 프로그램과 별도 연결이 필요합니다. 단순한 DXF 검수부터 시작한다면 cad-drawings 하나면 충분합니다.',
    setup: '세 스킬 중 필요한 것만 설치하려면 명령에 해당 --skill 옵션만 남깁니다. DXF/PDF 생성까지 할 때는 원 저장소에 안내된 Python 의존성(ezdxf·matplotlib·pypdf)을 별도 환경에 설치하고 예제 명세로 build·check를 먼저 실행합니다.',
    scenarioTitle: '실무 시나리오 S3 · 빈 폴더에서 텍스트 조건 → 공간 프로그램 → 평면 DXF·일람표 → Blender 시각화 계획',
    scenarioSteps: [
      '기존 도면 파일은 필요 없습니다. 빈 작업 폴더(예: gridline-test)에서 터미널을 열어 3개 스킬을 설치한 뒤, Codex에서 그 폴더를 엽니다.',
      '아래 요청처럼 건물 조건(대지 12 × 15m, 연면적 80m² 이내 단층 주택)을 붙여 $architecture-programming으로 실 목록·목표 면적·필수 인접 관계 표를 먼저 확정합니다.',
      '승인한 실·벽·문·창 치수로 $architectural-drawing-generation이 평면 DXF·벡터 PDF·일람표와 check 검사 결과를 생성하면, 같은 도면 버전으로 $visualization-rendering의 Blender 카메라·조명 계획을 받아 연결된 Blender MCP에 적용합니다.',
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
    symptom: '열린 Blender / FreeCAD 장면을 조작하는 MCP 호출이 연결되지 않음',
    cause: '각 프로그램 안에서 서버 대기 버튼을 켜지 않았음',
    fix: 'FreeCAD는 MCP Addon → Start RPC Server, Blender는 N키 → BlenderMCP → Connect to MCP server를 먼저 켭니다.',
  },
  {
    symptom: 'FreeCAD 백그라운드 호출에 freecadcmd not found 표시',
    cause: 'MCP 실행 환경의 PATH에서 FreeCADCmd.exe를 찾지 못함',
    fix: '설치 경로를 Test-Path로 확인한 뒤 FreeCAD 서버 args의 --freecadcmd 다음에 전체 경로를 한 항목으로 넣습니다.',
  },
] as const;
