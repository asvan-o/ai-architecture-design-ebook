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
    "title": "1 · 화면 움직이기 (가장 많이 쓰는 마우스 조작 3가지)",
    "rows": [
      {
        "action": "화면 빙글 돌리기 (Orbit)",
        "keys": "마우스 휠(가운데 버튼) 누른 채 드래그",
        "note": "모델 주변을 사방으로 돌려 벽·창문·바닥이 잘 맞는지 봅니다."
      },
      {
        "action": "화면 옆·위아래로 옮기기 (Pan)",
        "keys": "Shift + 마우스 휠 누른 채 드래그",
        "note": "각도는 그대로 두고 화면 위치만 상하좌우로 살짝 옮깁니다."
      },
      {
        "action": "확대 / 축소 (Zoom)",
        "keys": "마우스 휠 위아래 굴리기",
        "note": "창문 모서리나 벽 접합부를 가까이 당겨서 봅니다."
      }
    ]
  },
  {
    "title": "2 · 도면처럼 반듯하게 보기 (시점 전환)",
    "rows": [
      {
        "action": "카메라 시선으로 보기 / 나가기",
        "keys": "Numpad 0 (오른쪽 숫자키 0)",
        "note": "노트북 대안: 숫자 1 왼쪽 ~ / ` 키 → View Camera 또는 화면 오른쪽 위 카메라 아이콘 클릭. 사람 눈높이(1.6m) 시선을 봅니다."
      },
      {
        "action": "위에서 수직으로 보기 (평면도 · Top)",
        "keys": "Numpad 7",
        "note": "노트북 대안: ~ / ` 키 → Top 또는 오른쪽 위 파란색 +Z 동그라미 클릭. 벽 배치를 평면도처럼 봅니다."
      },
      {
        "action": "앞면 / 옆면에서 보기 (입면)",
        "keys": "Numpad 1 / Numpad 3",
        "note": "노트북 대안: ~ / ` 키 → Front / Right 또는 -Y / +X 동그라미 클릭."
      },
      {
        "action": "원근감 켜기 ↔ 끄기 (투시 ↔ 직교)",
        "keys": "Numpad 5",
        "note": "노트북 대안: 오른쪽 위 카메라 아이콘 아래 격자 아이콘 클릭. 원근감을 끄면(직교) 도면처럼 반듯하게 치수를 비교하기 좋습니다."
      },
      {
        "action": "건물이 화면 밖으로 사라졌을 때 (전체 보기)",
        "keys": "Home",
        "note": "메뉴 View → Frame All. 카메라 화면 안이라면 먼저 Numpad 0으로 나온 뒤 누르세요."
      },
      {
        "action": "클릭한 물체만 화면 가운데로 당기기",
        "keys": "Numpad . (숫자패드 점)",
        "note": "노트북 대안: ~ / ` 키 → View Selected 또는 메뉴 View → Frame Selected."
      }
    ]
  },
  {
    "title": "3 · 화면 보기 모드 (선만 보기 / 회색 덩어리 / 재질 / 투시)",
    "rows": [
      {
        "action": "보기 모드 바꾸기 (셰이딩 메뉴)",
        "keys": "Z",
        "note": "Wireframe(철사 선) / Solid(기본 회색 덩어리) / Material Preview(재질 색감) / Rendered(햇빛·그림자 포함) 4가지 중 골라 봅니다."
      },
      {
        "action": "벽 속이 비치는 반투명 투시 (X-Ray)",
        "keys": "Alt + Z",
        "note": "벽 너머 방과 창문을 훑어볼 때 켭니다. 창문이 진짜 뚫렸는지 확인할 때는 반드시 Alt + Z를 꺼서 불투명 상태에서 보세요."
      }
    ]
  },
  {
    "title": "4 · 메뉴 열기 · 잠깐 숨기기 · 저장",
    "rows": [
      {
        "action": "오른쪽 보조 패널 열기 / 닫기",
        "keys": "N",
        "note": "MCP 연결 버튼(MCP for Blender 탭), 선택한 물체 크기(Item), 카메라 잠금(View)이 모두 여기에 있습니다."
      },
      {
        "action": "선택한 벽·천장 잠깐 숨기기",
        "keys": "H",
        "note": "안쪽을 보려고 앞 벽만 잠시 안 보이게 가립니다. 삭제되는 게 아니므로 안심하세요."
      },
      {
        "action": "숨긴 물체 모두 다시 꺼내기",
        "keys": "Alt + H",
        "note": "H 키로 숨겨 둔 벽이나 지붕을 한 번에 다시 보이게 되돌립니다."
      },
      {
        "action": "선택한 물체만 남기고 나머지 숨기기",
        "keys": "Shift + H",
        "note": "특정 벽이나 창문만 따로 살펴볼 때 쓰고, 다 본 뒤 Alt + H로 복구합니다."
      },
      {
        "action": "방금 한 작업 되돌리기",
        "keys": "Ctrl + Z",
        "note": "실수로 물체를 움직였거나 지웠을 때 바로 이전 상태로 되돌립니다."
      },
      {
        "action": "작업 원본 저장 / 다른 이름으로 저장",
        "keys": "Ctrl + S / Ctrl + Shift + S",
        "note": ".blend 작업 원본 파일을 저장합니다."
      },
      {
        "action": "완성 사진 찍기 (렌더)",
        "keys": "F12",
        "note": "카메라 시선으로 고화질 이미지를 뽑습니다. 뜬 창에서 Image → Save As를 눌러 PNG로 저장합니다."
      }
    ]
  }
] as const;
export const cameraViewSteps = [
 {title:'1 · 카메라 시선으로 들어가기',action:'가운데 3D 화면 위에 마우스를 두고 Numpad 0을 누릅니다. 숫자패드가 없는 노트북은 오른쪽 위 카메라 아이콘을 클릭하세요. 한 번 더 누르면 일반 화면으로 나옵니다.',check:'화면 가운데 네모 테두리 안쪽이 실제 사진으로 찍히는 범위입니다. 키보드 위쪽 가로 숫자 0과는 다릅니다.'},
 {title:'2 · 사람 눈높이 카메라(Cam_EyeLevel) 지정',action:'화면 오른쪽 위 객체 목록(Outliner)에서 Cam_EyeLevel을 클릭한 뒤, 상단 메뉴 View → Cameras → Set Active Object as Camera(Ctrl + Numpad 0)를 누릅니다.',check:'기본 Camera가 지워지고 Cam_EyeLevel이 대표 카메라로 잡혔는지 확인합니다.'},
 {title:'3 · 구도 살짝 조절하고 반드시 잠금 해제',action:'카메라 화면 안에서 키보드 N → View 탭 → View Lock → Camera to View에 체크하면 마우스 휠·드래그로 카메라 각도를 조절할 수 있습니다. 다 맞췄으면 Camera to View 체크를 꼭 끄세요.',check:'체크를 켜 둔 채 화면을 돌리면 맞춰 둔 카메라 구도가 망가집니다. 기본 실습은 눈높이 1.6m · 24mm 광각을 유지합니다.'},
 {title:'4 · 카메라 화면을 사진(PNG)으로 저장',action:'빠르게 지금 화면 그대로 저장하려면 View → Viewport Render Image, 빛과 그림자까지 정식 촬영하려면 Render → Render Image(F12)를 누른 뒤 뜬 창에서 Image → Save As로 PNG를 저장합니다.',check:'저장한 PNG 파일을 탐색기에서 직접 열어 창문과 구도가 잘 찍혔는지 확인합니다.'},
] as const;
export const modelExportFormats = [
 {format:'GLB / glTF (.glb)',use:'웹 3D 뷰어 · 발표 자료 · 가볍게 공유할 때 (가장 추천)',tip:'File → Export → glTF 2.0 선택. 파일 하나로 묶이는 GLB 형식을 추천하며, 필요한 물체만 보내려면 Selected Objects에 체크하세요.'},
 {format:'FBX (.fbx)',use:'Twinmotion · D5 Render · Lumion · Unreal 등 실사 렌더 프로그램으로 보낼 때',tip:'File → Export → FBX 선택. 선택한 물체만 보내려면 Limit to → Selected Objects, Scale=1.00을 확인합니다.'},
 {format:'OBJ (.obj)',use:'SketchUp · Rhino 등 다른 3D 모델링 프로그램으로 모양만 넘길 때',tip:'File → Export → Wavefront (.obj) 선택. 함께 생기는 .mtl(재질) 파일이 있으면 같은 폴더에 묶어 전달하세요.'},
] as const;
export const mcpArchitectureRoles = [
 {layer:'1 · AI 채팅창 (Host)',examples:'OpenAI Codex, Claude Desktop, Cursor, Antigravity',role:'내가 한국어로 “방 만들어 줘”라고 지시하고 결과를 받아 보는 대화창입니다.'},
 {layer:'2 · 내장 통역기 (Client)',examples:'Codex 같은 AI 앱 안에 이미 들어 있는 자동 기능',role:'내가 쓴 말을 프로그램이 알아듣는 표준 신호(JSON-RPC)로 자동 번역해 전달합니다. (사용자가 따로 설치할 필요 없음)'},
 {layer:'3 · 연결 어댑터 (MCP Server)',examples:'내 PC용(uvx blender-mcp, 폴더 접근) · 인터넷용(Notion 등)',role:'AI가 Blender나 폴더에 안전한 명령만 보낼 수 있게 중간에서 다리 역할을 합니다.'},
 {layer:'4 · 실제 프로그램 · 파일',examples:'Blender(전용 통로 localhost:9876), 내 작업 폴더, 협업 문서',role:'실제로 3D 벽을 세우고, 치수를 재고, 파일을 저장하는 현장 프로그램입니다.'},
] as const;

export const mcpThreePrimitives = [
 {name:'Tools · 손 (직접 실행)',summary:'AI가 실제로 무언가를 만들거나 수정하는 행동 기능',example:'Blender에서 벽·창문 만들기, 카메라 놓기, 파일 저장하기',caution:'원본 파일이 바뀔 수 있으므로 항상 새 빈 파일이나 복사본에서 테스트하세요.'},
 {name:'Resources · 눈 (상태 읽기)',summary:'AI가 현재 작업 상황을 들여다보는 읽기 기능',example:'지금 Blender 화면에 놓인 물체 목록 읽기, 조건표·체크리스트 열람',caution:'읽기 전용으로 참고하는 용도이며, 허용한 작업 폴더만 열어 두는 것이 안전합니다.'},
 {name:'Prompts · 업무 매뉴얼 (고정 절차)',summary:'자주 반복하는 검수 순서나 보고서 양식을 묶어 둔 지침',example:'단위·치수 초기 점검표, 눈높이 카메라 검수 보고 형식',caution:'매뉴얼대로 돌려도 마지막 치수와 창문 관통 여부는 사람이 눈으로 한 번 확인합니다.'},
] as const;

export const mcpOfficeCatalog = [
 {category:'3D 모델링 · 공간 검토',server:'Blender MCP (내 PC 연결)',use:'말로 벽·창문·가구·재질·카메라 동선을 만들고 3D 치수 확인',safety:'실제 회사 프로젝트 대신 새 빈 파일 또는 사본에서 시작'},
 {category:'내 PC 문서함 · 기준서 읽기',server:'Filesystem MCP (내 PC 폴더 연결)',use:'지정한 프로젝트 폴더 안의 회의록·조건표·체크리스트 읽고 초안 정리',safety:'컴퓨터 전체가 아니라 작업 폴더 1곳만 허용'},
 {category:'법령 · 공공 고시 · 웹 자료 확인',server:'Fetch / Browser MCP (웹 연결)',use:'공공 건축 공고문, 지자체 조례, 기술 자료 웹페이지 내용 비교',safety:'로그인·결제 페이지 접근 금지, 최종 법령은 원문 직접 대조'},
 {category:'팀 회의록 · 일정 정리',server:'Notion / Google Workspace MCP (클라우드 연결)',use:'주간 회의록 요약, 프로젝트 체크리스트·일정표 초안 만들기',safety:'먼저 읽기 권한 위주로 연결하고 외부 공유·발송은 사람이 직접 실행'},
] as const;

export const mcpTroubleshootingRows = [
 {symptom:'where.exe uvx를 쳤는데 아무것도 안 나와요',cause:'uv를 아직 안 깔았거나, 설치한 직후에 예전 PowerShell 창을 그대로 쓰고 있음',fix:'Step 1 설치 명령을 실행한 뒤 PowerShell 창을 닫고 새로 열어서 다시 입력해 보세요.'},
 {symptom:'Codex를 켤 때 config.toml 문법 오류가 떠요',cause:'윈도우 경로(C:\\...)를 큰따옴표(")로 감쌌거나 [mcp_servers.blender]가 두 번 들어감',fix:'경로는 반드시 작은따옴표(\'C:\\Users\\...\\uvx.exe\')로 감싸고 중복된 줄을 지우세요.'},
 {symptom:'명령을 보냈는데 연결 거부(Connection refused · 9876)가 떠요',cause:'Blender를 안 켰거나, Blender 안에서 MCP 연결 버튼을 안 눌렀음',fix:'Blender 3D 화면에서 키보드 N → MCP for Blender 탭 → Connect to MCP server(Start MCP Server) 버튼을 눌러 켜세요.'},
 {symptom:'config.toml을 저장했는데 Codex에 Blender 도구가 안 보여요',cause:'설정을 고친 뒤 Codex 앱을 완전히 끄지 않고 창만 새로 염',fix:'작업표시줄 오른쪽 아래 트레이 아이콘까지 Codex를 완전히 종료(Quit)한 뒤 3초 뒤 다시 실행하세요.'},
 {symptom:'기존에 작업하던 3D 모델이 지워질까 봐 걱정돼요',cause:'현재 열려 있는 Blender 화면에 바로 생성·삭제 명령이 전달되기 때문',fix:'실습 전 항상 File → New → General로 새 빈 파일을 열고 시작하세요.'},
] as const;

const terminalGuide={kind:'terminal' as const,platform:'Windows PowerShell',howToUse:'명령은 PowerShell에서, TOML 설정은 텍스트 편집기에서 사용합니다.'};
const agentGuide={kind:'code' as const,platform:'Blender MCP가 연결된 Codex',howToUse:'Blender의 MCP 서버를 켜 두고 Codex 채팅창에 입력합니다.'};
export const mcpBlocks=[
 {id:'l08-mcp-uv-install',title:'uv 설치 명령 · PowerShell에서 실행',prompt:uvInstallCommand,filename:'uv-install.txt',guide:{...terminalGuide,purpose:'로컬 MCP 서버를 실행할 uv·uvx를 준비합니다.',derivation:'실행환경 준비를 먼저 끝낸 뒤 애드온과 Codex를 연결해 오류 위치를 나눕니다.',variables:'설치가 허용된 PC인지 확인합니다. 공식 설치 주소는 임의로 바꾸지 않습니다.',aiPromptTip:'내 Windows에서 uv·uvx 설치 여부를 먼저 조회하고, 없을 때만 공식 설치 명령과 확인 방법을 안내해 줘.'}},
 {id:'l08-mcp-codex-config',title:'Codex 설정 예시 · config.toml에 추가',prompt:codexConfig,filename:'codex-config.example.toml',guide:{...terminalGuide,platform:'텍스트 편집기 · Codex의 config.toml',howToUse:'기존 설정을 보존하고 아래 blender 테이블만 추가합니다. 같은 이름의 테이블이 있으면 중복 추가하지 않습니다.',purpose:'Codex가 uvx로 Blender MCP 서버를 시작하게 합니다.',derivation:'실행 파일 경로 → 서버 패키지 → 시작 대기 시간을 분리해 연결합니다.',variables:'<사용자명>을 실제 Windows 사용자명으로 바꾸고 uvx.exe가 있는 경로인지 확인합니다.',aiPromptTip:'내 기존 config.toml을 지우지 말고 Blender MCP 항목만 추가할 설정안을 만들어 줘. uvx 경로와 중복 테이블부터 확인해 줘.'}},
 {id:'l08-mcp-room',title:'실습 6 · 한 번에 만드는 6m × 4m 룸과 사람 눈높이 카메라',prompt:mcpRoomPrompt,filename:'MCP-01-hello-room.txt',guide:{...agentGuide,purpose:'숫자로 정의한 바닥판·벽·관통 창과 카메라가 실제로 생성되는지 확인합니다.',derivation:'작업 장면 조회·기본 객체 정리·단위 → 바닥 → 외벽 → 관통 창 → 카메라·빛 → 실제 치수 검증을 한 요청으로 연결합니다.',variables:'기본 예제는 제시 치수를 그대로 사용합니다. 이후 크기를 바꿀 때 벽 위치·모서리 길이·창 위치도 함께 계산합니다.',aiPromptTip:'6×4m 외곽 룸과 높이 2.8m 벽, 북측 중앙 창, 남측 사람 눈높이 카메라의 MCP 요청문을 작성해 줘. 바닥판 상면·창 하단·좌표·검증 기준을 명시하고 저장은 별도 확인하게 해 줘.'}},
] as const;
export const mcpReferences=[['Codex MCP','https://developers.openai.com/codex/mcp/'],['uv 설치','https://docs.astral.sh/uv/getting-started/installation/'],['Blender MCP · 외부 오픈소스','https://github.com/ahujasid/blender-mcp']] as const;
