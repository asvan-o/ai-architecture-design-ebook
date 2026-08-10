# Design Project Auto Organizer

설계 프로젝트의 CAD·BIM·3D·그래픽·이미지·영상·문서 파일을 확장자 규칙에 따라 정리하는 Windows용 로컬 데스크톱 프로그램입니다.

기본 프로그램은 Gemini API, OpenAI API, MCP, 클라우드, 로그인이나 외부 서버를 사용하지 않습니다. 파일 내용과 파일명은 바꾸지 않으며 설계 품질·법규·구조·재료 성능·시공 가능성을 판단하지 않습니다.

## 프로그램 역할

- 하나의 ROOT 아래에 여러 PROJECT를 생성·연결합니다.
- 각 PROJECT 최상위에 새로 들어온 파일만 감지합니다.
- 확장자 규칙으로 지정 폴더에 이동합니다.
- ROOT 바로 아래 파일과 이미 분류된 하위폴더는 건드리지 않습니다.
- 같은 이름이 있으면 덮어쓰지 않고 `98_REVIEW`에서 사람이 확인하도록 합니다.
- `.uproject`처럼 폴더와 함께 작동하는 프로젝트 파일은 자동 이동하지 않습니다.

> **작업파일 주의**
>
> 외부 참조(Xref, Link, Texture 등)가 연결된 작업파일 세트는
> 자동정리 대상에 넣지 마세요.
> 파일 위치가 변경되면 참조 경로가 끊어질 수 있습니다.
>
> PROJECT 최상위는 새로 받은 파일 또는 아직 외부 참조 관계를 설정하지 않은 파일을 임시로 넣는 투입 영역입니다. 교육용 테스트 파일로 먼저 작동을 확인하세요.

## 실행 환경

- Windows 10/11
- Node.js 22.x LTS (`>=22 <23`)
- Electron 43.3.0
- Electron Forge 7.11.2
- chokidar 4.0.3
- CommonJS(`main.cjs`, `preload.cjs`, `organizer.cjs`)

[Node.js 공식 다운로드](https://nodejs.org/en/download)에서 Node.js 22.x LTS를 설치합니다. Node.js 24가 잘못된 버전이라는 뜻은 아니며, 이번 수업에서는 설치 환경 차이를 줄이고 결과를 재현하기 위해 22.x로 통일합니다. 일반 Windows 노트북은 Windows Installer(`.msi`) x64, ARM Windows는 ARM64를 선택하고 npm과 Add to PATH 기본 옵션을 유지합니다.

패키지를 설치하기 전에 새 PowerShell에서 확인합니다.

```powershell
node --version
npm --version
where node
```

`node --version`이 `v22.x`가 아니면 `npm install`을 바로 실행하지 말고 Node.js 22.x LTS 설치 또는 전환 후 다시 확인합니다.

## 개발 실행과 테스트

이 README가 있는 폴더에서 실행합니다.

```powershell
npm install
npm test
npm start
```

- `npm install`: npm 자체의 의존성 설치 명령입니다. `package.json`의 script가 아닙니다.
- `npm ci`: `package-lock.json`에 기록된 정확한 버전으로 깨끗하게 재설치합니다.
- `npm test`: 분류·감시·충돌·재실행 안전 규칙을 검사합니다.
- `npm start`: Electron 데스크톱 프로그램을 실행합니다.

최초 설치 후 `package.json`과 `package-lock.json`에서 Electron 43.3.0, Electron Forge 7.11.2, chokidar 4.0.3을 확인합니다. 재설치 검증에는 `npm ci`를 사용합니다.

Electron 43에서는 `npm install`이 패키지를 설치하고, 첫 `npm start`에서 공식 설치 절차가 Electron 바이너리를 내려받습니다. 따라서 아래 두 파일은 첫 실행이 완료된 뒤 확인합니다.

의존성 설치 또는 첫 Electron 실행 중 아무 출력이나 파일 변화 없이 약 5분 이상 진행이 보이지 않으면 계속 기다리거나 같은 명령을 반복하지 않습니다. 실행 프로세스와 npm 로그를 확인하고 다음 파일이 생성됐는지 점검합니다.

```text
node_modules/electron/dist/electron.exe
node_modules/electron/path.txt
```

Electron 설치 실패를 수동 ZIP 압축 해제나 임의 복사로 우회하지 않습니다. `npm install` 직후 두 파일이 없다는 이유만으로 실패라고 단정하지 않고 첫 `npm start` 결과까지 확인합니다.

## Windows 설치 프로그램 만들기

```powershell
npm run make
```

성공하면 다음 위치에 설치 파일이 생성됩니다.

```text
out/make/squirrel.windows/x64/Design Project Auto Organizer Setup.exe
```

교육용 빌드는 코드 서명이 없을 수 있어 Windows SmartScreen 경고가 표시될 수 있습니다. 이 저장소에서 직접 만든 파일인지 확인한 뒤 실행합니다.

## ROOT와 PROJECT

ROOT는 여러 프로젝트를 담는 상위 폴더입니다.

```text
ROOT/
├─ PROJECT_A/
├─ PROJECT_B/
└─ PROJECT_C/
```

자동분류하지 않는 위치:

```text
ROOT/test.dwg
ROOT/image.jpg
```

자동분류하는 위치:

```text
ROOT/PROJECT_A/test.dwg
ROOT/PROJECT_A/image.jpg
```

PROJECT는 Windows 탐색기에서 ROOT 안에 직접 만들거나 프로그램의 `+ 새 프로젝트` 버튼으로 만듭니다. PROJECT 최상위 자체가 신규 파일 투입 영역이며 별도의 `_INBOX` 폴더는 만들지 않습니다.

## 프로젝트 표준 구조

```text
프로젝트명/
├─ 01_CAD/
│  ├─ AUTOCAD/
│  └─ MICROSTATION/
├─ 02_BIM/
│  ├─ REVIT/
│  ├─ ARCHICAD/
│  ├─ VECTORWORKS/
│  └─ EXCHANGE/
├─ 03_SKETCHUP/
├─ 04_3D_WORKFILES/
│  ├─ 3DSMAX/
│  ├─ MAYA/
│  ├─ BLENDER/
│  ├─ RHINO/
│  ├─ CINEMA4D/
│  ├─ HOUDINI/
│  └─ TWINMOTION/
├─ 05_GRAPHIC/
│  ├─ ILLUSTRATOR/
│  ├─ PHOTOSHOP/
│  ├─ INDESIGN/
│  ├─ AFTER_EFFECTS/
│  └─ PREMIERE/
├─ 06_ASSETS/
│  ├─ MODEL/
│  ├─ IMAGE/
│  ├─ VIDEO/
│  └─ OTHER/
├─ 07_DOCUMENT/
└─ 98_REVIEW/
```

## 기본 사용 순서

1. 프로그램을 실행합니다.
2. 처음 실행할 때 ROOT 폴더를 선택합니다.
3. `+ 새 프로젝트`로 프로젝트를 만들거나 ROOT 안의 기존 프로젝트를 사용합니다.
4. Windows 탐색기에서 `ROOT → 프로젝트명` 폴더 최상위에 새로 받은 파일 또는 외부 참조 관계가 없는 테스트 파일을 넣습니다.
5. 프로그램에서 이동 결과와 `98_REVIEW` 알림을 확인합니다.
6. 정리된 폴더에서 실제 설계 작업을 이어갑니다.
7. 사용을 마치면 X 버튼으로 완전히 종료합니다.

## 최소화·종료·재실행

- 최소화(`-`): 창만 숨겨지고 파일 감시는 계속됩니다.
- 닫기(`X`): watcher와 Electron 프로세스를 완전히 종료합니다.
- 재실행: 꺼져 있던 동안 PROJECT 최상위에 들어온 미분류 파일을 먼저 스캔한 뒤 실시간 감시를 시작합니다.

트레이나 숨은 백그라운드 프로세스를 사용하지 않습니다.

## 분류 원칙

- AutoCAD, MicroStation, Revit, Archicad, Vectorworks, SketchUp 파일을 각각 지정 폴더로 이동합니다.
- 3ds Max, Maya, Blender, Rhino, Cinema 4D, Houdini, Twinmotion 원본 작업파일은 `04_3D_WORKFILES` 아래로 이동합니다.
- FBX, OBJ, GLB 등 교환 모델은 `06_ASSETS/MODEL`로 이동합니다.
- Illustrator, Photoshop, InDesign, After Effects, Premiere 프로젝트는 `05_GRAPHIC` 아래로 이동합니다.
- 이미지·영상·문서는 각각 `IMAGE`, `VIDEO`, `07_DOCUMENT`로 이동합니다.
- 등록되지 않은 일반 파일은 `06_ASSETS/OTHER`로 이동합니다.
- 이름 충돌, 권한 오류와 자동 이동하면 안 되는 폴더형 프로젝트만 `98_REVIEW`에서 확인합니다.

전체 확장자 표는 전자책 제4차시와 `src/organizer.cjs`의 `EXTENSION_RULES`를 기준으로 합니다.

## 알려진 한계

- 확장자만으로 분류하며 파일 내용을 분석하지 않습니다.
- 파일 출처, 저작권, 설계 품질과 전문 적합성을 확인하지 않습니다.
- 프로그램은 CAD Xref, Revit Link, SketchUp 외부 파일, 3D Texture, Houdini 외부 참조를 수정하지 않습니다. 그러나 작업파일 자체를 이동하면 상대경로나 링크가 끊어질 수 있으므로 외부 참조가 연결된 파일 세트는 자동정리 대상에 넣지 않습니다.
- Gemini 기반 이미지 의미 분류와 Revision 라벨은 기본 기능이 아니라 별도 검증이 필요한 향후 확장 기능입니다.
