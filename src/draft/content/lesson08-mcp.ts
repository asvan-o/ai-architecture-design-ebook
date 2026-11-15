export const uvInstallCommand = 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"';
export const codexConfig = String.raw`[mcp_servers.blender]
command = 'C:\Users\<사용자명>\.local\bin\uvx.exe'
args = ["blender-mcp"]
startup_timeout_sec = 60`;
export const mcpRoomPrompt = `목적
Blender MCP로 연결 상태 확인부터 창호 개구부가 있는 3D 간단한 방과 사람 눈높이 카메라 생성까지 한 번에 수행합니다.

맥락
새 빈 실습 파일을 사용합니다. 기존 프로젝트가 열려 있으면 삭제하지 않고 멈춰 주세요. 이 룸은 제9차시 본격 모델링을 준비하는 교육용 연결 예제이며 실제 설계 도면이 아닙니다.

입력자료
현재 Blender 작업 장면과 아래 교육용 치수·좌표 조건입니다. 단위는 미터, X는 동서, Y는 남북, Z는 높이, 북쪽은 +Y입니다.

작업 단계
1. 실제 MCP 도구로 현재 작업 장면 연결 상태·객체 목록·단위를 먼저 확인합니다. 새 실습 작업 장면인지 객체 목록·파일 상태를 먼저 확인합니다. 기본 객체 외에 다른 작업 객체나 같은 이름의 룸 객체가 있으면 삭제·덮어쓰기 없이 멈추고 알려 주세요. 새 실습 작업 장면의 기본 Cube, Light, 기본 Camera 3개만 확인해 모두 삭제한 뒤 단위를 Metric(METERS, 배율 1.0)으로 설정합니다.
2. Floor_Slab: 외곽 가로 6.0m × 세로 4.0m × 두께 0.2m. 중심 X=0, Y=0, 상면 Z=0, 하면 Z=-0.2m.
3. Wall_North: Y=+1.9m, 외곽 X=-3.0~+3.0m, 두께 0.2m, 바닥 상면부터 높이 2.8m.
4. Wall_West·Wall_East: X=-2.9m / +2.9m, 길이는 Y=-2.0~+1.8m, 두께 0.2m, 높이 2.8m. 북측 벽과 모서리를 겹치지 않게 맞추고 남측은 열린 진입부로 둡니다.
5. 북측 벽 중앙에 폭 2.4m × 높이 1.5m의 실제 관통 창 Window_Opening을 만듭니다. X=-1.2~+1.2m, 하단 Z=0.9m, 상단 Z=2.4m. Window_Opening이라는 임시 박스를 사용해 벽을 실제로 뚫어 창문 구멍을 냅니다. 구멍내기 작업을 벽 자체에 적용한 뒤 임시 박스만 완전히 지웁니다. 사선 뷰와 카메라 뷰에서 창문이 막힘없이 관통하는지 확인합니다.
6. Cam_EyeLevel을 위치 (0,-1.5,1.6)m에 두고 북측 창 중앙 (0,1.9,1.65)m을 바라보게 합니다. 초점거리 24mm, 활성 카메라로 지정합니다.
7. Sun Light를 추가합니다. 카메라 뷰와 사선 뷰에서 바닥판·세 벽·관통 창을 확인하고 실제 작업 장면의 치수와 단위를 다시 조회합니다.

조건·제한
남측 벽·문·가구·천장을 추가하지 않습니다. 새 실습 작업 장면의 기본 Cube·Light·Camera 이외의 기존 객체를 임의 삭제하거나 유료 에셋을 호출하지 않습니다. 아직 파일을 저장하거나 내보내지 않습니다. 미확정 조건은 교육용 가정으로 표시합니다.

출력 형식
실제 연결 결과, 정리한 기본 객체, 생성한 객체명·치수, 활성 카메라의 위치·초점거리와 관통 창 확인 결과를 짧게 보고하고 가능한 경우 뷰포트 캡처를 보여 주세요. 실패·미생성을 성공으로 쓰지 않습니다.

검토 기준
외곽 6×4m, 바닥판 상면 0m, 벽 높이 2.8m·두께 0.2m, 남측 개방, 북측 중앙 관통 창 2.4×1.5m·하단 0.9m, 활성 카메라 높이 1.6m·24mm, Metric 배율 1.0을 실제 작업 장면에서 확인합니다.`;
export const blenderShortcutGroups = [
  {
    "title": "1 · 기본 화면 이동",
    "rows": [
      {
        "action": "화면 회전 · Orbit",
        "keys": "마우스 휠(가운데 버튼) 누른 채 드래그",
        "note": "모델 주변을 돌려 벽·창·바닥의 결합을 확인합니다."
      },
      {
        "action": "화면 평행 이동 · Pan",
        "keys": "Shift + 마우스 휠 누른 채 드래그",
        "note": "시점을 돌리지 않고 화면을 위·아래·좌·우로 옮깁니다."
      },
      {
        "action": "확대 / 축소 · Zoom",
        "keys": "마우스 휠 스크롤",
        "note": "개구부 모서리 등 필요한 부분을 가까이 봅니다."
      }
    ]
  },
  {
    "title": "2 · 건축 도면 시점 전환",
    "rows": [
      {
        "action": "활성 카메라 뷰 전환 / 복귀",
        "keys": "Numpad 0",
        "note": "숫자 1 왼쪽의 ~ / ` 키 → View Camera 또는 우측 상단 카메라 아이콘. Cam_EyeLevel이 활성 상태이면 실습의 1.6m 사람 눈높이를 봅니다."
      },
      {
        "action": "평면도 · Top View",
        "keys": "Numpad 7",
        "note": "~ / ` 키 → Top 또는 우측 상단 파란색 +Z 기즈모 클릭. 위에서 수직으로 벽 배치를 확인합니다."
      },
      {
        "action": "정면 / 우측면 입면",
        "keys": "Numpad 1 / Numpad 3",
        "note": "~ / ` 키 → Front / Right 또는 -Y / +X 기즈모 클릭. +Y가 북쪽인 이 실습에서 Front는 남측에서 바라보는 뷰입니다."
      },
      {
        "action": "투시도 ↔ 직교 뷰",
        "keys": "Numpad 5",
        "note": "우측 상단 카메라 아이콘 아래 격자 아이콘. 직교 뷰는 원근 왜곡 없이 형태·치수를 대조할 때 사용합니다."
      },
      {
        "action": "모델을 잃었을 때 · 전체 맞추기",
        "keys": "Home",
        "note": "View → Frame All. 카메라 뷰라면 먼저 Numpad 0으로 나옵니다. 카메라·조명까지 멀리 잡히면 룸 객체만 선택해 선택 맞추기를 사용합니다."
      },
      {
        "action": "선택 객체 중심으로 맞추기",
        "keys": "Numpad .",
        "note": "숫자패드의 소수점 키입니다. 대안: ~ / ` 키 → View Selected 또는 View → Frame Selected."
      }
    ]
  },
  {
    "title": "3 · 표시·투시 모드",
    "rows": [
      {
        "action": "셰이딩 파이 메뉴",
        "keys": "Z",
        "note": "Wireframe: 선화 뼈대 / Solid: 기본 매스 / Material Preview: 재질 / Rendered: 설정한 작업 장면 조명·그림자 확인. 렌더 엔진과 PC 성능에 따라 갱신 속도가 다릅니다."
      },
      {
        "action": "반투명 투시 · X-Ray",
        "keys": "Alt + Z",
        "note": "Solid / Wireframe에서 벽 너머 공간·개구부를 살펴봅니다. 투명하게 보이는 것만으로 관통을 단정하지 말고, 끈 뒤 Solid 사선 뷰에서도 확인합니다."
      }
    ]
  },
  {
    "title": "4 · 패널·객체 숨기기·저장",
    "rows": [
      {
        "action": "우측 사이드바 열기 / 닫기",
        "keys": "N",
        "note": "MCP for Blender 탭 / Item의 치수 / View → View Lock → Camera to View를 찾습니다."
      },
      {
        "action": "선택한 객체 잠시 숨기기",
        "keys": "H",
        "note": "선택한 벽·천장 등 시야를 가리는 객체를 뷰포트에서 숨깁니다. 객체를 삭제하는 명령이 아닙니다."
      },
      {
        "action": "숨긴 객체 다시 보이기",
        "keys": "Alt + H",
        "note": "H로 숨긴 객체를 복구합니다. Outliner의 컬렉션 비활성화나 렌더 표시 설정까지 되돌리는 명령은 아닙니다."
      },
      {
        "action": "선택 객체만 남겨 보기",
        "keys": "Shift + H",
        "note": "선택하지 않은 객체를 숨깁니다. 검수 후 Alt + H로 복구합니다."
      },
      {
        "action": "실행 취소",
        "keys": "Ctrl + Z",
        "note": "직전 작업을 되돌립니다. 취소 후 객체 상태를 다시 확인합니다."
      },
      {
        "action": "저장 / 다른 이름으로 저장",
        "keys": "Ctrl + S / Ctrl + Shift + S",
        "note": ".blend 작업 원본을 저장합니다. 다른 이름으로 저장할 때 폴더·파일명을 확인합니다."
      },
      {
        "action": "렌더 이미지",
        "keys": "F12",
        "note": "활성 카메라로 렌더합니다. 렌더 뒤 Image → Save As에서 PNG를 별도로 저장합니다."
      }
    ]
  }
] as const;
export const cameraViewSteps = [
 {title:'1 · 활성 카메라 뷰로 전환',action:'3D 뷰포트에 마우스를 놓고 Numpad 0. 다시 누르면 일반 뷰로 돌아갑니다. 숫자패드가 없으면 우측 기즈모 아래 카메라 아이콘(Toggle the camera view), 또는 View → Cameras → Active Camera를 사용합니다.',check:'카메라 프레임 안쪽이 최종 구도입니다. 키보드 위쪽의 숫자 0과 Numpad 0은 다릅니다.'},
 {title:'2 · Cam_EyeLevel 활성 지정',action:'Outliner에서 Cam_EyeLevel을 선택한 뒤 3D 뷰포트의 View → Cameras → Set Active Object as Camera(Ctrl + Numpad 0)를 선택합니다. 대안: Scene Properties → Camera에서 Cam_EyeLevel 선택.',check:'기본 Camera는 첫 단계에서 정리하고 Cam_EyeLevel만 활성 카메라로 남았는지 확인합니다. 이 명령은 카메라를 현재 뷰로 이동시키는 명령과 다릅니다.'},
 {title:'3 · 구도 미세 조정 후 잠금 해제',action:'카메라 뷰에서 N → View 탭 → View Lock → Camera to View를 켭니다. 휠로 줌, 휠 클릭 드래그로 회전, Shift + 휠 클릭 드래그로 이동합니다. 완료 후 Camera to View를 반드시 끕니다.',check:'이 조작은 카메라 위치·회전과 구도를 바꿀 수 있습니다. 기본 실습은 높이 1.6m·초점거리 24mm를 유지합니다. 초점거리는 Camera Data Properties → Lens에서 별도로 확인합니다.'},
 {title:'4 · 카메라 화면 PNG 저장',action:'카메라 뷰에서 View → Viewport Render Image로 뷰포트를 렌더하거나, Render → Render Image(F12)로 일반 렌더를 실행합니다. 이미지 창에서 Image → Save As로 PNG를 저장합니다.',check:'뷰포트 렌더는 화면 표현을, F12는 렌더 엔진 결과를 사용하므로 재질·빛이 다를 수 있습니다. 같은 Cam_EyeLevel을 사용하고 저장 파일을 다시 열어 확인합니다.'},
] as const;
export const modelExportFormats = [
 {format:'glTF 2.0 · .glb / .gltf',use:'웹 3D 뷰어·프레젠테이션·범용 3D 공유',tip:'File → Export → glTF 2.0. 단일 파일로 묶는 GLB를 기본으로 권장합니다. 필요한 3D 형상만 선택하고 Selected Objects 옵션을 확인합니다.'},
 {format:'FBX · .fbx',use:'렌더링·게임·영상 도구의 FBX 지원 경로',tip:'File → Export → FBX. 필요 시 Limit to → Selected Objects, Scale=1.00을 확인합니다. Twinmotion·D5 Render·Lumion·Unreal Engine 등 대상 앱의 버전·가져오기 지원을 확인합니다. Enscape는 지원하는 호스트 모델러의 연결 경로를 확인합니다.'},
 {format:'Wavefront · .obj',use:'SketchUp·Rhino 등 다른 모델러에 3D 형상 전달',tip:'File → Export → Wavefront (.obj). 대상 앱의 OBJ 가져오기 지원·확장 기능을 먼저 확인합니다. 재질용 .mtl과 텍스처가 생기면 함께 전달하고 축·단위를 확인합니다.'},
] as const;
export const mcpArchitectureRoles = [
 {layer:'1 · MCP Host (호스트 앱)',examples:'OpenAI Codex, Claude Desktop, Cursor, Antigravity',role:'사용자가 자연어로 목표·범위를 입력하고 결과를 확인하는 AI 작업창입니다.'},
 {layer:'2 · MCP Client (내장 통역기)',examples:'호스트 앱 내부에 기본 탑재된 연결 모듈',role:'AI의 의도를 표준 JSON-RPC 메시지로 바꾸어 지정된 MCP 서버와 1:1로 주고받습니다.'},
 {layer:'3 · MCP Server (중계 어댑터)',examples:'로컬 stdio(uvx blender-mcp, filesystem) / 원격 HTTP 서버',role:'각 실무 프로그램이나 문서함이 이해할 수 있는 전용 명령·조회 기능만 안전하게 노출합니다.'},
 {layer:'4 · 실무 도구·데이터',examples:'Blender(localhost:9876), 로컬 프로젝트 폴더, 브라우저, 협업 문서',role:'실제 3D 객체 생성·치수 조회·문서 열람이 일어나는 현장 도구입니다.'},
] as const;

export const mcpThreePrimitives = [
 {name:'Tools · 손(실행 도구)',summary:'실제 상태를 바꾸거나 계산·조작을 수행하는 실행 기능',example:'Blender 객체 생성·이동·재질 부여, 파일 저장, 카메라 배치',caution:'원본 변경·삭제가 일어날 수 있으므로 새 빈 파일이나 사본에서 실행하고 사람 승인 범위를 정합니다.'},
 {name:'Resources · 눈(열람 자료)',summary:'AI가 판단 근거로 읽어 오는 현재 상태·문서·목록',example:'현재 열린 3D 씬 객체 목록, 프로젝트 조건 JSON, 사내 체크리스트 원문',caution:'읽기 전용 맥락 제공이 목적이며, 허용한 폴더·파일 범위만 열람하도록 제한합니다.'},
 {name:'Prompts · 업무 매뉴얼(표준 지침)',summary:'자주 쓰는 점검 순서나 작업 양식을 미리 묶어 둔 템플릿',example:'단위·축 초기 점검 절차, 눈높이 카메라 검수 보고 양식',caution:'매뉴얼이 있어도 최종 치수·관통 여부 확인은 사람이 뷰포트에서 직접 대조합니다.'},
] as const;

export const mcpOfficeCatalog = [
 {category:'3D 모델링·시각화 제어',server:'Blender MCP (로컬 stdio + 포트 9876)',use:'매스·벽·개구부·재질·카메라 동선 생성 및 씬 객체 치수 역조회',safety:'기존 업무 .blend 대신 새 빈 파일 또는 복사본에서 시작'},
 {category:'로컬 문서함·기준서 열람',server:'Filesystem MCP (로컬 stdio)',use:'지정한 실습·과업 폴더 안의 회의록·조건표·체크리스트 읽기·초안 작성',safety:'바탕화면·전사 공유드라이브 전체가 아닌 단일 실습 폴더만 허용'},
 {category:'법령·공공 고시·웹 확인',server:'Fetch / Browser MCP (로컬·원격)',use:'공공 건축 공고문, 조례 페이지, 기술 자료 웹페이지 본문 조회·비교',safety:'로그인 계정·결제 페이지 접근 금지, 최종 법령 효력은 원문 대조'},
 {category:'팀 협업 문서·일정 연동',server:'Notion / Google Workspace MCP (원격 HTTP)',use:'프로젝트 주간 회의록 요약, 과업 체크리스트·일정표 초안 정리',safety:'읽기 권한 우선 연결, 외부 발송·공유 권한 변경은 사람이 직접 수행'},
] as const;

export const mcpTroubleshootingRows = [
 {symptom:'where.exe uvx 실행 시 아무 경로도 나오지 않음',cause:'uv 미설치 또는 설치 직후 이전 PowerShell 창을 그대로 사용함',fix:'Step 1 설치 명령 실행 후 PowerShell 창을 새로 열어 경로를 다시 조회합니다.'},
 {symptom:'Codex 실행 시 config.toml 구문 오류 표시',cause:'역슬래시(\\)를 큰따옴표 안에 넣어 이스케이프 오류가 나거나 [mcp_servers.blender]가 중복됨',fix:'경로는 작은따옴표(\'C:\\Users\\...\\uvx.exe\')로 감싸고 중복 테이블이 없는지 확인합니다.'},
 {symptom:'도구 호출 시 Connection refused (포트 9876) 발생',cause:'Blender를 켜지 않았거나 N 패널에서 Start MCP Server 버튼을 누르지 않음',fix:'Blender 3D 뷰포트에서 N → MCP for Blender 탭 → Start MCP Server 실행 상태를 확인합니다.'},
 {symptom:'config.toml을 저장했는데 Codex에 Blender 도구가 안 보임',cause:'설정 파일 변경 후 대화창만 새로 열고 앱 프로세스를 재시작하지 않음',fix:'Codex 앱을 완전히 종료한 뒤 다시 실행해 MCP 서버 목록을 새로 불러옵니다.'},
 {symptom:'기존에 작업하던 3D 모델이 사라질까 우려됨',cause:'열려 있는 현재 Blender 씬에 곧바로 객체 정리·생성 명령이 전달됨',fix:'실습 전 반드시 File → New → General로 새 빈 파일을 열고, 요청문에 기존 객체 발견 시 중단 조건을 넣습니다.'},
] as const;

const terminalGuide={kind:'terminal' as const,platform:'Windows PowerShell',howToUse:'명령은 PowerShell에서, TOML 설정은 텍스트 편집기에서 사용합니다.'};
const agentGuide={kind:'code' as const,platform:'Blender MCP가 연결된 Codex',howToUse:'Blender의 MCP 서버를 켜 두고 Codex 채팅창에 입력합니다.'};
export const mcpBlocks=[
 {id:'l08-mcp-uv-install',title:'uv 설치 명령 · PowerShell에서 실행',prompt:uvInstallCommand,filename:'uv-install.txt',guide:{...terminalGuide,purpose:'로컬 MCP 서버를 실행할 uv·uvx를 준비합니다.',derivation:'실행환경 준비를 먼저 끝낸 뒤 애드온과 Codex를 연결해 오류 위치를 나눕니다.',variables:'설치가 허용된 PC인지 확인합니다. 공식 설치 주소는 임의로 바꾸지 않습니다.',aiPromptTip:'내 Windows에서 uv·uvx 설치 여부를 먼저 조회하고, 없을 때만 공식 설치 명령과 확인 방법을 안내해 줘.'}},
 {id:'l08-mcp-codex-config',title:'Codex 설정 예시 · config.toml에 추가',prompt:codexConfig,filename:'codex-config.example.toml',guide:{...terminalGuide,platform:'텍스트 편집기 · Codex의 config.toml',howToUse:'기존 설정을 보존하고 아래 blender 테이블만 추가합니다. 같은 이름의 테이블이 있으면 중복 추가하지 않습니다.',purpose:'Codex가 uvx로 Blender MCP 서버를 시작하게 합니다.',derivation:'실행 파일 경로 → 서버 패키지 → 시작 대기 시간을 분리해 연결합니다.',variables:'<사용자명>을 실제 Windows 사용자명으로 바꾸고 uvx.exe가 있는 경로인지 확인합니다.',aiPromptTip:'내 기존 config.toml을 지우지 말고 Blender MCP 항목만 추가할 설정안을 만들어 줘. uvx 경로와 중복 테이블부터 확인해 줘.'}},
 {id:'l08-mcp-room',title:'실습 6 · 한 번에 만드는 6m × 4m 룸과 사람 눈높이 카메라',prompt:mcpRoomPrompt,filename:'MCP-01-hello-room.txt',guide:{...agentGuide,purpose:'숫자로 정의한 바닥판·벽·관통 창과 카메라가 실제로 생성되는지 확인합니다.',derivation:'작업 장면 조회·기본 객체 정리·단위 → 바닥 → 외벽 → 관통 창 → 카메라·빛 → 실제 치수 검증을 한 요청으로 연결합니다.',variables:'기본 예제는 제시 치수를 그대로 사용합니다. 이후 크기를 바꿀 때 벽 위치·모서리 길이·창 위치도 함께 계산합니다.',aiPromptTip:'6×4m 외곽 룸과 높이 2.8m 벽, 북측 중앙 창, 남측 사람 눈높이 카메라의 MCP 요청문을 작성해 줘. 바닥판 상면·창 하단·좌표·검증 기준을 명시하고 저장은 별도 확인하게 해 줘.'}},
] as const;
export const mcpReferences=[['Codex MCP','https://developers.openai.com/codex/mcp/'],['uv 설치','https://docs.astral.sh/uv/getting-started/installation/'],['Blender MCP · 외부 오픈소스','https://github.com/ahujasid/blender-mcp']] as const;
