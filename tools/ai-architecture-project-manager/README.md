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

## 실행 환경

- Windows 10/11
- Node.js 22 이상
- 수업에서는 설치 시점의 최신 Node.js LTS 권장

[Node.js 공식 다운로드](https://nodejs.org/en/download)에서 Current가 아니라 LTS를 선택합니다. 일반 Windows 노트북은 Windows Installer(`.msi`) x64, ARM Windows는 ARM64를 선택하고 npm과 Add to PATH 기본 옵션을 유지합니다.

설치 후 새 PowerShell에서 확인합니다.

```powershell
node --version
npm --version
```

## 개발 실행과 테스트

이 README가 있는 폴더에서 실행합니다.

```powershell
npm install
npm test
npm start
```

- `npm install`: 필요한 패키지를 설치합니다.
- `npm test`: 분류·감시·충돌·재실행 안전 규칙을 검사합니다.
- `npm start`: Electron 데스크톱 프로그램을 실행합니다.

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

PROJECT는 Windows 탐색기에서 ROOT 안에 직접 만들거나 프로그램의 `+ 새 프로젝트` 버튼으로 만듭니다.

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
4. Windows 탐색기에서 `ROOT → 프로젝트명` 폴더 최상위에 파일을 넣습니다.
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
- CAD Xref, Revit Link 또는 다른 프로그램의 외부 참조가 이동 후 유효한지는 사용자가 확인해야 합니다.
- Gemini 기반 이미지 의미 분류와 Revision 라벨은 기본 기능이 아니라 별도 검증이 필요한 향후 확장 기능입니다.
