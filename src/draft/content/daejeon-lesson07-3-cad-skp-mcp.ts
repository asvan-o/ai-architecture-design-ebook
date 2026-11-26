// 제7-3차시 · AutoCAD & SketchUp MCP 올인원 · 왕초보 일반 설치 완전 가이드 데이터

export interface Lesson073Section {
  readonly id: string;
  readonly title: string;
  readonly action: string;
  readonly reason: string;
  readonly next: string;
}

export interface Lesson073Period {
  readonly id: string;
  readonly title: string;
  readonly sections: readonly Lesson073Section[];
}

export const lesson073Title = '제7-3차시 · AutoCAD & SketchUp MCP 올인원 체크박스 셋팅 & 일반 설치 가이드';
export const lesson073Lead =
  '상용 건축 프로그램(AutoCAD · SketchUp) 체험판 안내부터, 체크박스 선택만으로 MCP와 플러그인을 한 번에 연동하는 올인원 빌더, 그리고 왕초보가 한 단계씩 직접 따라 하는 일반(수동) 설치·검증까지 모두 담은 실전 가이드입니다.';

export const lesson073Periods: readonly Lesson073Period[] = [
  {
    id: 'l073-part-1',
    title: '올인원 체크박스 자동 셋팅 (맨 위쪽 빠른 시작)',
    sections: [
      {
        id: 'l073-all-in-one-setup',
        title: '올인원 체크박스 MCP 자동 셋팅 빌더 (AutoCAD + SketchUp)',
        action: '상용 본체 설치 여부를 먼저 확인한 뒤, 필요한 MCP와 AI 클라이언트만 체크해 맞춤 PowerShell 명령어나 더블클릭 .bat 파일을 실행합니다.',
        reason: '이미 설치된 프로그램과 기존 MCP 설정은 보존하고, 흔한 폴더 이중 중첩·JSON 문법 실수 없이 한 번에 연결하기 위해서입니다.',
        next: '설치 완료 후 SketchUp Start Server와 AutoCAD 도면 창을 열고 AI 도구에서 바로 테스트합니다.',
      },
    ],
  },
  {
    id: 'l073-part-2',
    title: '일반(수동) 설치 안내 · 개념 이해 · 상용 체험판 · 사전 도구',
    sections: [
      {
        id: 'l073-concept-and-trials',
        title: '10초 개념 이해(무전기 구조) & AutoCAD · SketchUp 체험판 직접 설치 안내',
        action: 'AI와 캐드·스케치업이 어떻게 대화하는지 구조도로 이해하고, 아직 미설치 상태라면 공식 체험판을 직접 설치합니다.',
        reason: 'AutoCAD와 SketchUp은 계정 인증이 필요한 상용 프로그램이므로 본체는 공식 홈페이지에서 직접 받아야 합니다.',
        next: '본체 준비가 끝났다면 공통 실행 도구인 uv / uvx를 설치합니다.',
      },
      {
        id: 'l073-common-uv',
        title: '공통 사전 도구(uv / uvx) 일반 설치 및 버전 확인',
        action: 'PowerShell(또는 Mac 터미널)에서 uv를 설치하고 창을 새로 열어 uvx --version을 확인합니다.',
        reason: 'AutoCAD MCP(autocad-mcp-pro)와 SketchUp MCP(sketchup-mcp) 모두 uvx 하나로 별도 가상환경 없이 실행되기 때문입니다.',
        next: 'uvx가 준비되면 아래 AutoCAD MCP와 SketchUp MCP 수동 연동을 차례로 진행합니다.',
      },
    ],
  },
  {
    id: 'l073-part-3',
    title: '일반(수동) 설치 안내 · AutoCAD · SketchUp 단계별 연동 · 검증 · 오류 구급상자',
    sections: [
      {
        id: 'l073-autocad-manual',
        title: 'AutoCAD MCP 일반(수동) 설치 및 연동 (COM 실시간 + ezdxf 듀얼 엔진)',
        action: 'AI 클라이언트 설정 파일에 autocad-mcp-pro[com]을 등록하고, AutoCAD 일반판 실행 순서와 권한 규칙을 맞춰 테스트합니다.',
        reason: '일반 AutoCAD는 Windows COM으로 화면에 실시간 작도하고, AutoCAD LT나 미설치 환경에서도 ezdxf로 표준 .dxf 도면을 뽑을 수 있습니다.',
        next: 'AutoCAD 연동이 확인되면 SketchUp MCP 수동 설치로 넘어갑니다.',
      },
      {
        id: 'l073-sketchup-manual',
        title: 'SketchUp MCP 일반(수동) 설치 및 연동 (이중 중첩 방지 + 9876 검증)',
        action: 'su_mcp 루비 플러그인을 정확한 1계층 구조로 배치하고, 확장(X) > MCP Server > Start Server와 포트 9876 통신을 검증합니다.',
        reason: '최신 SketchUp(2024~2027)의 메뉴 위치 변화와 su_mcp 폴더 이중 중첩 실수를 막아야 첫 시도에 바로 연결됩니다.',
        next: '체크리스트와 오류 구급상자로 내 PC 연동 상태를 최종 점검합니다.',
      },
      {
        id: 'l073-verify-and-faq',
        title: '왕초보 최종 체크리스트 & 자주 막히는 오류 구급상자 (TOP 8)',
        action: '8개 항목을 차례로 점검하고, 막히는 증상이 있으면 오류 구급상자 표에서 원인과 해결책을 즉시 찾습니다.',
        reason: '콘솔 창 미표시, 권한 불일치, LT COM 제한 같은 현장 최다 오류를 스스로 해결할 수 있어야 실무에서 끊김 없이 활용할 수 있습니다.',
        next: '연동이 끝났다면 제8차시·제9차시 3D 시각화·모델링 실습으로 자연스럽게 이어갑니다.',
      },
    ],
  },
];

export const lesson073Sections: readonly Lesson073Section[] = lesson073Periods.flatMap((p) => p.sections);

export const l073QuickIndex = [
  { code: '01', label: '올인원 체크박스 빌더 (빠른 시작)', href: '#l073-all-in-one-setup' },
  { code: '01-2', label: '설치 직후 실행 규칙 3가지', href: '#l073-after-rules' },
  { code: '02', label: '10초 무전기 구조도 (SVG)', href: '#l073-concept-and-trials' },
  { code: '02-2', label: 'AutoCAD · SketchUp 체험판 설치법', href: '#l073-trial-howto' },
  { code: '03', label: '공통 사전 도구 (uv / uvx)', href: '#l073-common-uv' },
  { code: '04', label: 'AutoCAD MCP 일반(수동) 연동', href: '#l073-autocad-manual' },
  { code: '05', label: 'SketchUp MCP 일반(수동) 연동', href: '#l073-sketchup-manual' },
  { code: '05-2', label: '이중 중첩 방지 & 9876 검증', href: '#l073-skp-verify' },
  { code: '06', label: '체크리스트 & 오류 구급상자 TOP 8', href: '#l073-verify-and-faq' },
] as const;

export const commercialTrialRows = [
  {
    name: 'Autodesk AutoCAD',
    period: '15일 무료 체험 (학생·교원 1년 무료)',
    billing: '기본 만료 시 종료 (카드 입력 화면이 나온 경우 만료 전 자동갱신 해제 확인)',
    mcpCondition: '실시간 화면 제어는 Windows 일반 AutoCAD 필요 · LT/미설치 PC도 auto/ezdxf 모드로 .dxf 파일 생성 가능',
    url: 'https://www.autodesk.co.kr/products/autocad/free-trial',
    urlLabel: 'AutoCAD 공식 체험판',
  },
  {
    name: 'SketchUp Pro / Studio',
    period: '7일 무료 체험 (실습 직전 설치 권장)',
    billing: '신용카드 등록 불필요 · 자동결제 없음 (V-Ray 체크는 렌더링 테스트 시에만 선택, 무료 체험 가능)',
    mcpCondition: 'PC 설치형 데스크톱 버전 필수 · 무료 웹 버전(app.sketchup.com)은 루비 플러그인 설치 불가',
    url: 'https://www.sketchup.com/ko-kr/try-sketchup',
    urlLabel: 'SketchUp 공식 체험판',
  },
] as const;

export const autocadTrialSteps = [
  '오토데스크 코리아 AutoCAD 무료 체험판 페이지에 접속해 [무료 체험판 다운로드]를 누릅니다.',
  '제품 선택에서 일반 [AutoCAD]를 고릅니다. (AutoCAD LT는 Windows COM 실시간 제어를 지원하지 않습니다.)',
  'Autodesk 계정으로 로그인하거나 무료 가입을 마친 뒤, 국가(대한민국)와 사용 목적을 입력합니다.',
  '언어(한국어 또는 English)를 골라 설치 파일(.exe)을 받고 우클릭 → [관리자 권한으로 실행]으로 설치합니다. (여유 공간 10GB 이상 권장)',
  '설치가 끝나면 AutoCAD를 실행해 Autodesk 계정으로 로그인하면 15일 무료 체험이 자동 활성화됩니다. (학생·교원은 Autodesk 교육용 액세스에서 1년 무료 신청 가능)',
] as const;

export const sketchupTrialSteps = [
  '스케치업 코리아 무료 체험판 페이지에서 [무료 체험판 시작]을 누릅니다. (신용카드 불필요, 7일 뒤 자동결제 없음)',
  'Trimble ID를 만들거나 Google · Apple 계정으로 간편 로그인한 뒤 이메일 인증을 마칩니다.',
  'OS에 맞는 설치 파일(Windows .exe / Mac .dmg)을 내려받아 실행합니다. Windows는 [언어 설치 > 변경]에서 한국어를 확인할 수 있습니다.',
  '설치 중 V-Ray 체크 화면이 나오면: 실사 렌더링까지 체험할 경우 체크(무료 체험 가능), MCP 모델링 실습만 가볍게 진행할 경우 체크 해제 후 설치해도 됩니다.',
  '설치 후 SketchUp을 최소 1회 실행해 로그인하고 [체험판 시작(Begin Trial)]을 누릅니다. (1회 실행해야 Plugins 폴더가 생성됩니다.)',
] as const;

export const uvInstallWinCmd = 'winget install astral-sh.uv';
export const uvInstallWinFallbackCmd = 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"';
export const uvInstallMacCmd = 'brew install uv';
export const uvVerifyCmd = 'uvx --version';

export const manualAutoCadJson = `{
  "mcpServers": {
    "autocad": {
      "command": "uvx",
      "args": [
        "--from",
        "autocad-mcp-pro[com]",
        "autocad-mcp"
      ],
      "env": {
        "AUTOCAD_MCP_BACKEND": "auto",
        "DISCOVERY_MODE": "search"
      }
    }
  }
}`;

export const manualAutoCadToml = `[mcp_servers.autocad]
command = "uvx"
args = ["--from", "autocad-mcp-pro[com]", "autocad-mcp"]
startup_timeout_sec = 90

[mcp_servers.autocad.env]
AUTOCAD_MCP_BACKEND = "auto"
DISCOVERY_MODE = "search"`;

export const manualSketchUpJson = `{
  "mcpServers": {
    "sketchup": {
      "command": "uvx",
      "args": ["sketchup-mcp"]
    }
  }
}`;

export const manualSketchUpToml = `[mcp_servers.sketchup]
command = "uvx"
args = ["sketchup-mcp"]
startup_timeout_sec = 60`;

export const manualBothJson = `{
  "mcpServers": {
    "autocad": {
      "command": "uvx",
      "args": ["--from", "autocad-mcp-pro[com]", "autocad-mcp"],
      "env": {
        "AUTOCAD_MCP_BACKEND": "auto",
        "DISCOVERY_MODE": "search"
      }
    },
    "sketchup": {
      "command": "uvx",
      "args": ["sketchup-mcp"]
    }
  }
}`;

export const port9876CheckCmd = 'netstat -ano | findstr 9876';

export const sketchUpRpcTestCmd = `$c = New-Object Net.Sockets.TcpClient('127.0.0.1', 9876)
$s = $c.GetStream()
$w = New-Object IO.StreamWriter($s); $w.AutoFlush = $true
$r = New-Object IO.StreamReader($s)
$w.WriteLine('{"jsonrpc":"2.0","method":"resources/list","id":1}')
$r.ReadLine()
$c.Close()`;

export const autocadTestPrompt =
  'AutoCAD MCP에 연결해서 A-WALL 레이어를 만들고, 가로 6000mm × 세로 4000mm 사각형 외곽 벽체와 네 모서리에 400x400 기둥을 그려줘.';

export const sketchupTestPrompt =
  '스케치업 현재 씬 정보를 확인하고, 가로 3000, 세로 3000, 높이 3000 정육면체 박스를 하나 만들어줘.';

export const practiceChecklistItems = [
  {
    id: 'c1',
    title: '1. AutoCAD 또는 SketchUp 데스크톱 직접 설치 완료',
    desc: '체험판 로그인 활성화 완료 (SketchUp은 무료 웹 버전이 아닌 PC 설치형)',
  },
  {
    id: 'c2',
    title: '2. uv / uvx 설치 및 버전 확인 완료',
    desc: 'PowerShell에서 uvx --version 실행 시 버전 숫자가 정상 출력됨',
  },
  {
    id: 'c3',
    title: '3. SketchUp su_mcp 플러그인 1계층 구조 확인',
    desc: 'Plugins\\su_mcp.rb 와 Plugins\\su_mcp\\main.rb 정상 배치 (su_mcp\\su_mcp 이중 중첩 없음)',
  },
  {
    id: 'c4',
    title: '4. SketchUp 재시작 후 [확장(X) > MCP Server > Start Server] 클릭',
    desc: '확장 관리자에서 Sketchup MCP가 [사용] 상태인지 함께 확인',
  },
  {
    id: 'c5',
    title: '5. 포트 9876 열림(LISTENING) 확인',
    desc: 'netstat -ano | findstr 9876 실행 시 127.0.0.1:9876 LISTENING 확인',
  },
  {
    id: 'c6',
    title: '6. AI 클라이언트 설정 파일에 MCP 등록 및 저장',
    desc: '올인원 빌더 또는 수동 편집으로 Codex · Antigravity · Claude · Cursor 중 1개 이상 저장',
  },
  {
    id: 'c7',
    title: '7. AI 클라이언트 완전 종료 후 재시작',
    desc: '재실행 후 MCP 도구 목록에 autocad / sketchup 서버가 정상 인식됨',
  },
  {
    id: 'c8',
    title: '8. 첫 실습 성공 (도면선 또는 3D 박스 실시간 생성)',
    desc: 'AI 채팅 명령으로 AutoCAD 외곽선 또는 SketchUp 3D 박스가 화면에 그려짐',
  },
] as const;

export const troubleshootingFaq = [
  {
    q: 'Q1. 스케치업 상단 [창(W)] 메뉴에 확장 관리자가 안 보여요!',
    a: '구버전(2020 이하) 기준 자료를 본 경우입니다. SketchUp 2021.1 ~ 2027에서는 옆 메뉴인 [확장(X) → 확장 관리자]로 이동했습니다. Ruby 콘솔도 [확장(X) → 개발자 → Ruby 콘솔]에 있습니다.',
  },
  {
    q: 'Q2. 확장 관리자에는 Sketchup MCP [사용]으로 뜨는데, [확장(X)]에 MCP Server 메뉴가 안 나와요!',
    a: '가장 흔한 폴더 이중 중첩 문제입니다. Plugins\\su_mcp 안에 su_mcp 폴더가 한 겹 더 들어가 main.rb를 못 찾는 상태이므로, main.rb를 한 단계 위로 옮겨 Plugins\\su_mcp\\main.rb로 맞춘 뒤 SketchUp을 재시작하세요. (올인원 스크립트를 실행하면 자동으로 수정합니다.)',
  },
  {
    q: 'Q3. Start Server를 눌렀는데 콘솔 창이 안 떠요. 실패한 건가요?',
    a: '정상일 가능성이 높습니다. 최신 SketchUp(2024~2027)에서는 Ruby 콘솔이 자동으로 팝업되지 않을 수 있습니다. [확장(X) → 개발자 → Ruby 콘솔]을 직접 열거나 PowerShell에서 netstat -ano | findstr 9876을 쳐서 LISTENING이 보이면 정상 작동 중입니다.',
  },
  {
    q: 'Q4. AI가 스케치업에 Connection refused(연결 거부) 오류를 내요!',
    a: 'SketchUp MCP 서버는 SketchUp을 새로 켤 때마다 꺼져 있습니다. SketchUp을 실행할 때마다 상단 메뉴 [확장(X) → MCP Server → Start Server]를 한 번 눌러 무전기를 켜 주세요.',
  },
  {
    q: 'Q5. AutoCAD 연결 시 Windows COM 오류(GetActiveObject / Dispatch)가 떠요!',
    a: '① AutoCAD LT는 COM 미지원이므로 ezdxf 모드를 사용하세요. ② 일반 AutoCAD를 먼저 실행해 빈 도면 창까지 열어 두세요. ③ AutoCAD와 AI 프로그램 둘 다 동일한 일반 사용자 권한으로 실행해야 Windows 보안이 COM 연결을 차단하지 않습니다.',
  },
  {
    q: 'Q6. AI가 uvx 명령을 찾을 수 없다(ENOENT / not found)고 해요!',
    a: 'AI 앱이 시스템 PATH를 못 읽을 때 발생합니다. PowerShell에서 where.exe uvx로 나온 전체 경로(예: C:\\Users\\내계정\\.local\\bin\\uvx.exe)를 command 칸에 넣으세요. JSON에서는 역슬래시를 두 번(\\\\) 적고, TOML에서는 작은따옴표(\'...\')로 감싸면 됩니다.',
  },
  {
    q: 'Q7. Sketchup MCP 아래에 [서명되지 않음] 경고가 뜨는데 괜찮나요?',
    a: '정상입니다. 공식 유료 스토어가 아닌 GitHub 공개 오픈소스 플러그인을 설치하면 항상 서명되지 않음으로 표시되며, [사용] 상태를 그대로 유지하시면 됩니다.',
  },
  {
    q: 'Q8. 설정 파일(JSON/TOML)을 고쳤는데 AI에 도구가 전혀 안 떠요!',
    a: 'JSON 문법 실수(중괄호 누락, 마지막 줄 쉼표, 단일 역슬래시) 또는 AI 앱의 완전 재시작 누락이 가장 흔합니다. 맨 위쪽 [올인원 체크박스 빌더]의 PowerShell 스크립트를 실행하면 기존 설정을 .bak으로 백업한 뒤 문법 오류 없이 자동 병합합니다.',
  },
] as const;
