# Blender MCP 시작 가이드 · 핵심 3단계
review/draft · instructor-review · design-pending
확인일: 2026-10-19

## Step 1 · uv(uvx) 설치
Windows PowerShell에서 실행합니다.
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
설치가 끝났으면 새 PowerShell 창을 열고 `where.exe uvx`를 입력해 보세요. 내 컴퓨터의 윈도우 아이디(<사용자명>)가 포함된 정확한 설치 위치(예: C:\Users\홍길동\.local\bin\uvx.exe)가 화면에 한 줄로 출력됩니다. 이 주소를 그대로 복사해서 다음 Step 3의 command = '...' 자리에 붙여넣으면 됩니다.

## Step 2 · Blender 애드온 설치와 서버 켜기
Edit → Preferences → Add-ons → Install from Disk → blender_mcp_addon.py → Interface: MCP for Blender 활성화.
3D 뷰포트에서 N → MCP for Blender → Start MCP Server(localhost:9876).
버전에 따라 버튼명이 다를 수 있습니다. 실행 중인 다른 실습 서버는 임의 종료하거나 중복으로 켜지 않습니다.

## Step 3 · Codex 설정과 재시작
C:\Users\<사용자명>\.codex\config.toml을 메모장으로 엽니다.
기존 설정을 보존하고 같은 테이블을 중복 추가하지 않습니다. 실제 uvx 경로로 사용자명을 바꿉니다.
```toml
[mcp_servers.blender]
command = 'C:\Users\<사용자명>\.local\bin\uvx.exe'
args = ["blender-mcp"]
startup_timeout_sec = 60
```
저장 후 Codex를 완전히 종료하고 재실행합니다. 도구 목록과 실제 작업 장면 조회를 확인합니다.
TOML은 PowerShell에서 실행하는 명령이 아닙니다.

## 첫 연결 확인
새 빈 실습 파일에서 MCP-01-hello-room.txt를 Codex 채팅창에 입력합니다.
기존 프로젝트가 있으면 삭제하지 않고 멈춥니다. 생성 객체·단위·실제로 뚫린 창문·활성 카메라를 다시 조회합니다.
파일 저장은 Blender File → Save As(Ctrl+Shift+S), 카메라 뷰는 Numpad 0입니다.
숫자패드가 없으면 백틱(~) View 파이 메뉴 → View Camera 또는 우측 카메라 아이콘을 사용합니다.
회전: 가운데 버튼 드래그 / 이동: Shift+가운데 버튼 드래그 / 확대: 휠.
Top: Numpad 7 / Front: Numpad 1 / Right: Numpad 3 / 직교↔투시: Numpad 5.
Z: 셰이딩 메뉴 / Alt+Z: X-Ray / N: 사이드바 / H: 숨기기 / Alt+H: 복구.
PNG: View → Viewport Render Image 또는 F12 → Image → Save As.
3D 사본: File → 다른 프로그램용 파일 저장(Export) → glTF 2.0 / FBX / Wavefront OBJ. 내보낸 파일의 크기·축·개구부를 재확인합니다.

참고: [Codex MCP](https://developers.openai.com/codex/mcp/) · [uv 설치](https://docs.astral.sh/uv/getting-started/installation/) · [Blender MCP 외부 오픈소스](https://github.com/ahujasid/blender-mcp).
배포 애드온·라이선스는 보존했습니다. upstream의 새 명칭은 mcp-for-blender이며 이 패키지는 기존 blender-mcp 호환 명령을 사용합니다.
