export type Lesson04Material = {
  id: string;
  name: string;
  category?: string;
  description: string;
  sourceVideo: '0번.mp4' | '1번.mp4' | '2번.mp4' | '3번.mp4';
  timestamp: string;
  fileName: string;
};

export const lesson04Materials: Lesson04Material[] = [
  { id: 'M-01', name: 'Oyster Quartzite', category: 'Quartzite', description: '밝은 회백색 바탕에 길게 흐르는 결이 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:00.5', fileName: 'm-01-oyster-quartzite.png' },
  { id: 'M-02', name: 'Almond Limestone', category: 'Limestone', description: '아몬드빛 베이지 톤과 잔잔한 입자가 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:00.5', fileName: 'm-02-almond-limestone.png' },
  { id: 'M-03', name: 'Azul Blue Marble', category: 'Marble', description: '청회색 바탕과 밝은 선형 무늬가 대비되는 표면', sourceVideo: '0번.mp4', timestamp: '00:04.5', fileName: 'm-03-azul-blue-marble.png' },
  { id: 'M-04', name: 'Pearl White Porcelain', category: 'Porcelain', description: '밝은 백색 바탕에 옅은 회색 무늬가 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:04.5', fileName: 'm-04-pearl-white-porcelain.png' },
  { id: 'M-05', name: 'Rosso Levanto Marble', category: 'Marble', description: '짙은 적갈색 바탕과 밝은 결이 강하게 대비되는 표면', sourceVideo: '0번.mp4', timestamp: '00:08.5', fileName: 'm-05-rosso-levanto-marble.png' },
  { id: 'M-06', name: 'Sand Beige Porcelain', category: 'Porcelain', description: '모래빛 베이지 톤이 비교적 고르게 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:08.5', fileName: 'm-06-sand-beige-porcelain.png' },
  { id: 'M-07', name: 'Silver Travertine', category: 'Travertine', description: '회갈색 계열의 가로 줄무늬가 반복되는 표면', sourceVideo: '0번.mp4', timestamp: '00:13.5', fileName: 'm-07-silver-travertine.png' },
  { id: 'M-08', name: 'Taupe Microcement', category: 'Microcement', description: '차분한 회갈색 톤과 미세한 질감이 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:13.5', fileName: 'm-08-taupe-microcement.png' },
  { id: 'M-09', name: 'Verde Alpi Marble', category: 'Marble', description: '짙은 녹색 바탕과 밝은 망상형 결이 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:18.5', fileName: 'm-09-verde-alpi-marble.png' },
  { id: 'M-10', name: 'Charcoal Microcement', category: 'Microcement', description: '짙은 숯빛 톤과 고르지 않은 미세 질감이 보이는 표면', sourceVideo: '0번.mp4', timestamp: '00:18.5', fileName: 'm-10-charcoal-microcement.png' },
  { id: 'M-11', name: 'Travertine Beige', category: 'Travertine', description: '따뜻한 베이지 바탕에 수평 결이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:00.5', fileName: 'm-11-travertine-beige.png' },
  { id: 'M-12', name: 'Soft Cream Micro Cement', category: 'Microcement', description: '부드러운 크림 톤과 미세한 얼룩 질감이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:00.5', fileName: 'm-12-soft-cream-micro-cement.png' },
  { id: 'M-13', name: 'Dark Grey Marble', category: 'Marble', description: '짙은 회색 바탕과 밝은 선형 결이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:04.5', fileName: 'm-13-dark-grey-marble.png' },
  { id: 'M-14', name: 'Ivory Travertine', category: 'Travertine', description: '밝은 아이보리 톤에 수평 줄무늬가 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:04.5', fileName: 'm-14-ivory-travertine.png' },
  { id: 'M-15', name: 'Light Grey Marble', category: 'Marble', description: '밝은 회색 바탕에 부드러운 결이 퍼지는 표면', sourceVideo: '1번.mp4', timestamp: '00:08.5', fileName: 'm-15-light-grey-marble.png' },
  { id: 'M-16', name: 'Warm Beige Porcelain', category: 'Porcelain', description: '따뜻한 베이지 톤과 잔잔한 무늬가 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:08.5', fileName: 'm-16-warm-beige-porcelain.png' },
  { id: 'M-17', name: 'Dark Grey Slate', category: 'Slate', description: '짙은 회색 층과 거친 결이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:12.5', fileName: 'm-17-dark-grey-slate.png' },
  { id: 'M-18', name: 'Green Marble', category: 'Marble', description: '녹색 계열 바탕에 불규칙한 밝은 결이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:12.5', fileName: 'm-18-green-marble.png' },
  { id: 'M-19', name: 'Walnut Wood', category: 'Wood', description: '짙은 갈색과 곧게 흐르는 목재 결이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:16.5', fileName: 'm-19-walnut-wood.png' },
  { id: 'M-20', name: 'Light Grey Microcement', category: 'Microcement', description: '밝은 회색 톤과 미세한 시멘트 질감이 보이는 표면', sourceVideo: '1번.mp4', timestamp: '00:16.5', fileName: 'm-20-light-grey-microcement.png' },
  { id: 'M-21', name: 'Dark Walnut', category: 'Wood', description: '짙은 갈색 바탕과 선명한 목재 결이 보이는 표면', sourceVideo: '2번.mp4', timestamp: '00:00.5', fileName: 'm-21-dark-walnut.png' },
  { id: 'M-22', name: 'Taj Mahal', description: '밝은 크림빛 바탕에 부드러운 흐름 무늬가 보이는 표면', sourceVideo: '2번.mp4', timestamp: '00:00.5', fileName: 'm-22-taj-mahal.png' },
  { id: 'M-23', name: 'White Oak', category: 'Wood', description: '밝은 황갈색과 곧은 목재 결이 보이는 표면', sourceVideo: '2번.mp4', timestamp: '00:04.5', fileName: 'm-23-white-oak.png' },
  { id: 'M-24', name: 'Natural Oak', category: 'Wood', description: '자연스러운 중간 밝기의 갈색 목재 결이 보이는 표면', sourceVideo: '2번.mp4', timestamp: '00:08.5', fileName: 'm-24-natural-oak.png' },
  { id: 'M-25', name: 'Taupe', description: '회색과 갈색 사이의 차분한 단색 톤이 보이는 표면', sourceVideo: '2번.mp4', timestamp: '00:12.5', fileName: 'm-25-taupe.png' },
  { id: 'M-26', name: 'Calacatta Viola Marble', category: 'Marble', description: '밝은 바탕 위에 자주색 계열의 굵은 결이 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:00.5', fileName: 'm-26-calacatta-viola-marble.png' },
  { id: 'M-27', name: 'Warm Ivory Porcelain', category: 'Porcelain', description: '따뜻한 아이보리 톤과 옅은 무늬가 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:00.5', fileName: 'm-27-warm-ivory-porcelain.png' },
  { id: 'M-28', name: 'Light Taupe Porcelain', category: 'Porcelain', description: '밝은 회갈색 톤과 잔잔한 무늬가 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:04.5', fileName: 'm-28-light-taupe-porcelain.png' },
  { id: 'M-29', name: 'Matte Black Porcelain', category: 'Porcelain', description: '광택이 적어 보이는 짙은 검정 계열 표면', sourceVideo: '3번.mp4', timestamp: '00:08.5', fileName: 'm-29-matte-black-porcelain.png' },
  { id: 'M-30', name: 'Breccia Capraia Marble', category: 'Marble', description: '밝은 바탕에 회색과 적갈색 조각형 무늬가 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:13.5', fileName: 'm-30-breccia-capraia-marble.png' },
  { id: 'M-31', name: 'Champagne Porcelain', category: 'Porcelain', description: '샴페인빛 베이지 톤과 은은한 무늬가 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:13.5', fileName: 'm-31-champagne-porcelain.png' },
  { id: 'M-32', name: 'Lilac Marble', category: 'Marble', description: '밝은 바탕에 라일락·회색 계열 결이 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:16.5', fileName: 'm-32-lilac-marble.png' },
  { id: 'M-33', name: 'Pearl Grey Porcelain', category: 'Porcelain', description: '진주빛 회색 톤과 미세한 무늬가 보이는 표면', sourceVideo: '3번.mp4', timestamp: '00:16.5', fileName: 'm-33-pearl-grey-porcelain.png' },
];

export const lesson04MaterialAudit = {
  checkedAt: '2026-08-08',
  videos: [
    { file: '0번.mp4', duration: '00:22.5', discovered: 10 },
    { file: '1번.mp4', duration: '00:20.1', discovered: 10 },
    { file: '2번.mp4', duration: '00:20.3', discovered: 5 },
    { file: '3번.mp4', duration: '00:21.5', discovered: 10 },
  ],
  beforeDeduplication: 35,
  duplicates: ['Rosso Levanto Marble', 'Verde Alpi Marble'],
  afterDeduplication: 33,
} as const;

const reviewInputPrompt = `첨부한 현장사진과 재질 참고 이미지를 분석하고,
아래 Mini Design Brief에 맞는
Nano Banana용 이미지 제작 프롬프트를 작성해줘.

입력자료 역할:

- 현장사진 A:
  현재 공간 구조, 시점, 창호,
  주요 고정 요소의 기준

- 재질 이미지 B:
  주요 마감 참고

- 재질 이미지 C:
  일부 포인트 마감 참고

조건:

1. 현장사진의 기본 구조와 카메라 시점을 가능한 유지
2. Design Brief의 GOAL / KEEP / CHANGE /
   MATERIAL / OPEN QUESTIONS / REVIEW 반영
3. 재질 이미지의 시각적 특징만 참고
4. 실제 제품 규격·성능은 추정 금지
5. 유지 조건 / 변경 조건 / 금지 조건 구분
6. Nano Banana용 최종 프롬프트 작성
7. 마지막에 검토 기준 포함`;

const reviewOutputPrompt = `목적
[선택한 공간]의 디자인 콘셉트 이미지를 제작한다.

맥락
Mini Design Brief의 목표와 대상 사용자를 반영한다.

입력자료
- 현장사진 A: 공간 구조, 카메라 시점, 창호와 주요 고정 요소의 기준
- 재질 이미지 B: 주요 마감의 색상·무늬·질감 참고
- 재질 이미지 C: 포인트 마감의 색상·무늬·질감 참고

작업 단계
1. KEEP 항목은 가능한 유지한다.
2. CHANGE 항목을 디자인 방향에 맞게 조정한다.
3. 선택한 Option의 가구 구성, 분위기, 조명과 재질 비율을 반영한다.

조건·제한
- 실제 제품 규격·성능은 추정하지 않는다.
- OPEN QUESTIONS에 해당하는 조건은 확정하지 않는다.
- 구조·치수·법규·설비·시공 가능성을 이미지로 단정하지 않는다.

출력 형식
현장사진과 같은 화면 비율의 공간 콘셉트 이미지 1장.

검토 기준
현장사진의 기본 구조와 시점이 유지되는지, Design Brief와 선택한 Option의 차이가 읽히는지 확인한다.`;

export const lesson04FinalContent = {
  reviewInputPrompt,
  reviewOutputPrompt,
  antigravity: {
    checkedAt: '2026-08-08',
    overview: 'Antigravity 2.0은 로컬 폴더를 Project로 연결하고 에이전트가 그 범위 안에서 파일과 코드를 만들고 수정하도록 돕는 개발 환경이다. 이번 실습에서는 바탕화면의 빈 폴더에서 시작한다.',
    projectSteps: [
      'Windows 바탕화면에 DesignProjectAutoOrganizer 폴더를 만든다.',
      'Antigravity 2.0에서 New Project를 선택한다.',
      'Add Folder로 바탕화면의 DesignProjectAutoOrganizer를 선택한다.',
      'Create를 누른 뒤 Local Mode를 선택한다.',
    ],
    settings: [
      { name: 'Artifact Review Policy', value: 'Always Proceed', note: '계획·코드 변경 과정의 중간 승인 대기를 줄인다.' },
      { name: 'Terminal Command Auto Execution', value: 'Always Proceed', note: '수업 중 반복 명령을 계속 실행하되 Deny list와 프로젝트 경계를 함께 확인한다.' },
      { name: 'Project 밖 접근', value: '제한 유지 / 필요 시 확인', note: 'Full Machine 또는 Unrestricted를 수업 기본값으로 권장하지 않는다.' },
    ],
    safetyMessage: '반복 작업은 계속 진행시키되 컴퓨터 전체 권한까지 무조건 풀지 않는다.',
    slashCommands: [
      { command: '/grill-me', description: '구현 전에 빠진 조건을 질문하도록 한다.', example: '/grill-me 아래 자동 분류 프로그램 요구사항에서 빠진 조건을 질문해줘.' },
      { command: '/goal', description: '조건을 확정한 뒤 목표 완료까지 진행하도록 한다.', example: '/goal 승인한 구조대로 구현하고 테스트가 통과할 때까지 진행해줘.' },
    ],
    shortcuts: [
      ['Ctrl + K', '대화 선택기 열기'],
      ['Ctrl + P', '파일 검색 열기'],
      ['Ctrl + L', '입력창으로 이동'],
      ['Ctrl + N', '새 대화 시작'],
      ['Alt + ↑ / ↓', '이전·다음 대화로 이동'],
    ],
    sources: [
      ['Antigravity 2.0 시작하기', 'https://www.antigravity.google/docs/editor'],
      ['Artifact Review Policy', 'https://www.antigravity.google/docs/artifact-review'],
      ['Agent Settings', 'https://www.antigravity.google/docs/agent-settings'],
    ],
  },
  organizer: {
    name: 'Design Project Auto Organizer',
    koreanName: '설계 프로젝트 자동 정리 프로그램',
    purpose: '하나의 ROOT 아래에서 여러 설계 프로젝트를 만들고, 각 프로젝트 최상위에 새로 들어온 파일을 확장자 규칙에 따라 정해진 폴더로 이동하는 Windows 로컬 프로그램이다.',
    aiBoundary: 'AI Agent는 프로그램을 만드는 과정을 돕는다. 완성된 기본 프로그램의 자동분류는 Gemini API나 API Key 없이 고정된 확장자 규칙으로 작동한다.',
    rootExample: `ROOT/
├─ PROJECT_A/
├─ PROJECT_B/
└─ PROJECT_C/`,
    rootScopeExample: `분류하지 않음
ROOT/test.dwg
ROOT/image.jpg

자동분류 대상
ROOT/PROJECT_A/test.dwg
ROOT/PROJECT_A/image.jpg`,
    projectTree: `프로젝트명/
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
└─ 98_REVIEW/`,
    whyExamples: ['plan.dwg', 'lobby.skp', 'building.rvt', 'scene.hip', 'chair.fbx', 'render.jpg', 'presentation.ai', 'movie.mp4', 'proposal.pdf'],
    creationMethods: [
      'Windows 탐색기에서 ROOT 안에 프로젝트 폴더를 직접 만든다.',
      '프로그램의 “+ 새 프로젝트”에서 이름을 입력하면 프로젝트와 표준 하위폴더가 함께 생성된다.',
    ],
    operationFlow: ['PROJECT 최상위', '새 파일 감지', '확장자 확인', '분류 규칙 확인', '해당 폴더로 이동'],
    usageSteps: [
      'Design Project Auto Organizer를 실행한다.',
      '처음 사용하는 경우 ROOT 폴더를 연결한다.',
      '“+ 새 프로젝트”를 선택하고 프로젝트 이름을 입력한다.',
      '새 자료를 ROOT 자체가 아니라 ROOT → 프로젝트명 폴더 최상위에 넣는다.',
      '자동분류 결과와 98_REVIEW 알림을 확인한다.',
      '정리된 폴더 안의 파일을 열어 실제 작업을 진행한다.',
      '사용을 마치면 X 버튼으로 프로그램을 완전히 종료한다.',
    ],
    lifecycle: [
      ['프로그램 실행', '실시간 감시 ON'],
      ['최소화 (-)', '프로그램 실행·감시 유지'],
      ['닫기 (X)', '프로그램·watcher 완전 종료'],
      ['다시 실행', '꺼져 있던 동안 들어온 파일을 한 번 스캔한 뒤 감시 시작'],
    ],
    workfileAssetExamples: [
      ['lobby_scene.max', '04_3D_WORKFILES/3DSMAX', '내가 프로그램에서 열어 계속 수정하는 원본 작업파일'],
      ['sofa.fbx', '06_ASSETS/MODEL', '다른 작업에 가져다 사용하는 외부 모델·교환 에셋'],
    ],
    extensionRules: [
      ['DWG · DXF · DWT · DWS', '01_CAD/AUTOCAD'],
      ['DGN', '01_CAD/MICROSTATION'],
      ['RVT · RFA · RTE · RFT', '02_BIM/REVIT'],
      ['PLN · PLA · TPL · BPN', '02_BIM/ARCHICAD'],
      ['VWX', '02_BIM/VECTORWORKS'],
      ['IFC', '02_BIM/EXCHANGE'],
      ['SKP', '03_SKETCHUP'],
      ['MAX', '04_3D_WORKFILES/3DSMAX'],
      ['MA · MB', '04_3D_WORKFILES/MAYA'],
      ['BLEND', '04_3D_WORKFILES/BLENDER'],
      ['3DM', '04_3D_WORKFILES/RHINO'],
      ['C4D', '04_3D_WORKFILES/CINEMA4D'],
      ['HIP · HIPLC · HIPNC', '04_3D_WORKFILES/HOUDINI'],
      ['TM', '04_3D_WORKFILES/TWINMOTION'],
      ['FBX · OBJ · GLB · GLTF · DAE · 3DS · STL · 3MF · STEP · STP · IGES · IGS · SAT', '06_ASSETS/MODEL'],
      ['AI · AIT', '05_GRAPHIC/ILLUSTRATOR'],
      ['PSD · PSB', '05_GRAPHIC/PHOTOSHOP'],
      ['INDD · INDT · IDML', '05_GRAPHIC/INDESIGN'],
      ['AEP · AEPX · AET', '05_GRAPHIC/AFTER_EFFECTS'],
      ['PRPROJ · PPROJ', '05_GRAPHIC/PREMIERE'],
      ['JPG · JPEG · PNG · WEBP · TIF · TIFF · BMP · GIF · EXR · HDR', '06_ASSETS/IMAGE'],
      ['MP4 · MOV · AVI · MKV · WEBM · M4V · WMV · MPEG · MPG · MTS · M2TS', '06_ASSETS/VIDEO'],
      ['PDF · DOC · DOCX · XLS · XLSX · PPT · PPTX · TXT · CSV · HWP · HWPX', '07_DOCUMENT'],
      ['그 밖의 일반 파일', '06_ASSETS/OTHER'],
    ],
    safetyRules: [
      'ROOT 바로 아래 파일과 이미 분류된 하위폴더의 파일은 이동하지 않는다.',
      '파일 내용·파일명·CAD Xref·Revit Link·SketchUp 및 Houdini 참조 경로를 수정하지 않는다.',
      '대상 폴더에 같은 이름이 있으면 덮어쓰지 않고 새 파일을 98_REVIEW로 보낸다.',
      '분류 규칙에 없는 일반 파일은 OTHER로 보내고, 실제 오류·충돌·권한 문제만 REVIEW로 보낸다.',
      'Unreal Engine의 .uproject처럼 폴더와 함께 작동하는 프로젝트 파일은 자동 이동하지 않는다.',
    ],
    stack: ['Electron', 'Node.js', 'HTML', 'CSS', 'JavaScript', 'chokidar', 'Electron Forge'],
    excludedStack: ['React', 'Next.js', 'Express', 'Cloud DB', '서버', '회원가입', '로그인', 'Gemini API', 'OpenAI API', 'MCP'],
    developmentCommands: [
      ['npm install', '필요한 패키지 설치'],
      ['npm test', '분류·감시·안전 규칙 자동 검사'],
      ['npm start', '개발 중 Electron 프로그램 실행'],
      ['npm run make', 'Windows 설치 프로그램 제작'],
    ],
    futureExtensions: [
      '이미지 내용을 Gemini API로 분석해 MATERIAL·REFERENCE·SITE_PHOTO 등으로 나누는 기능은 API Key와 별도 검증이 필요한 향후 확장 기능이다.',
      '작업파일 Revision 라벨은 파일 복원이나 백업과 다르므로, 기본 자동분류가 안정된 뒤 별도 기능으로 검토한다.',
    ],
    checks: [
      'ROOT 선택·저장·재로드와 여러 프로젝트 생성이 작동하는가?',
      'ROOT 바로 아래 파일은 그대로 두고 PROJECT 최상위 파일만 감지하는가?',
      '분류된 하위폴더를 다시 감시하거나 무한 이동하지 않는가?',
      'CAD·BIM·SketchUp·3D·Graphic·Image·Video·Document·Other가 지정 폴더로 이동하는가?',
      '같은 이름 충돌과 폴더형 프로젝트는 덮어쓰지 않고 REVIEW로 안내하는가?',
      '최소화 중에는 감시하고 X 종료 후에는 watcher와 앱 프로세스가 남지 않는가?',
      '다시 실행하면 종료 중 들어온 미분류 파일을 스캔하는가?',
      'npm start와 npm run make가 성공하고 Windows Setup.exe가 만들어지는가?',
    ],
  },
} as const;

export type Lesson04ProgramIdea = {
  number: number;
  title: string;
  description: string;
  features: string[];
  prompt: string;
};

export const lesson04ProgramIdeas: Lesson04ProgramIdea[] = [
  {
    number: 1, title: 'AI 프로젝트 파일 자동분류 도구 만들어보기', description: '여러 프로젝트의 작업파일과 이미지를 실제 폴더 기준으로 정리한다.', features: ['다중 프로젝트 ROOT', '확장자 규칙 분류', 'Gemini 이미지 용도 분류', 'REVIEW 확인'],
    prompt: `건축·인테리어 디자이너가 여러 프로젝트의 작업파일과 에셋을 자동으로 정리할 수 있는 Windows용 로컬 프로그램을 만들고 싶어.

사용자가 ROOT 폴더를 하나 정하고,
그 안에서 여러 프로젝트를 생성하고 전환해서 사용할 수 있어야 해.

각 프로젝트 폴더 최상위에 파일을 넣으면
DWG / DXF → CAD,
SKP → SketchUp,
RVT / RFA → Revit,
FBX / OBJ / GLB 등 → Model,
문서 → Document
로 자동 분류하고,

JPG / PNG 등의 이미지는 Gemini API로 내용을 분석해
Material / Reference / Site Photo / Drawing Image /
Design Output / Other 등으로 자동 분류하고 싶어.

애매한 이미지만 사용자가 확인하도록 해줘.

파일을 프로그램 내부에 복사하거나 ZIP으로 계속 생성하지 말고
실제 프로젝트 폴더 자체가 항상 기준이 되어야 해.

아직 구현하지 말고,
화면 구조, 데이터 구조, 자동화 흐름과
적절한 기술 스택부터 설계해줘.`
  },
  {
    number: 2, title: '공간 면적·Space Program 계산기 만들어보기', description: '프로젝트별 공간 면적과 대안별 배분을 비교한다.', features: ['전체·공간별 면적', '잔여 면적', '초과 경고', '대안 A/B/C'],
    prompt: `건축·인테리어 디자이너가 여러 프로젝트의 공간 면적 계획을 관리하는 프로그램을 만들고 싶어.

프로젝트를 여러 개 생성하고,
각 프로젝트마다 전체 사용 가능 면적과 필요한 공간을 등록할 수 있게 해줘.

각 공간의 목표 면적을 입력하면
전체 면적,
공간별 면적 비율,
잔여 면적,
계획 면적 초과 여부를 자동 계산하고 싶어.

대안 A/B/C를 만들어
서로 다른 면적 배분도 비교할 수 있으면 좋겠어.

아직 구현하지 말고
먼저 필요한 기능과 화면 구성을 제안해줘.`
  },
  {
    number: 3, title: '인터랙티브 조닝 보드 만들어보기', description: '공간 카드를 배치하며 초기 조닝 관계를 비교한다.', features: ['공간 카드', '면적·사용자·성격', '공개성', '인접·분리 관계'],
    prompt: `건축·인테리어 디자이너가 여러 프로젝트의 초기 공간 조닝을 빠르게 검토할 수 있는 인터랙티브 프로그램을 만들고 싶어.

프로젝트를 생성하고,
필요한 공간을 카드 형태로 만들 수 있게 해줘.

공간 카드를 드래그해 배치하고
각 공간에 면적, 사용자, 공간 성격,
Public / Semi-public / Private 정보를 지정하고 싶어.

공간끼리 가까워야 하는 관계와
분리해야 하는 관계도 표현하고 싶어.

실제 CAD 도면 제작 프로그램이 아니라
초기 조닝 아이디어 비교 도구야.

먼저 프로그램 구조와
가장 단순한 MVP를 설계해줘.`
  },
  {
    number: 4, title: 'Design Brief → 이미지 프롬프트 생성기 만들어보기', description: 'Design Brief와 참고 이미지를 구조화된 이미지 작업지시로 바꾼다.', features: ['7개 Brief 필드', '입력자료 역할', '7단계 프롬프트', '검토 기준'],
    prompt: `건축·인테리어 프로젝트의 Design Brief를 이미지 생성 작업지시로 변환해주는 프로그램을 만들고 싶어.

여러 프로젝트를 만들고 각 프로젝트마다:

PROJECT
GOAL
KEEP
CHANGE
MATERIAL
OPEN QUESTIONS
REVIEW

형태의 Design Brief를 저장하게 해줘.

현장사진과 재질 참고 이미지를 추가하면
Gemini API가 Design Brief와 입력자료의 역할을 바탕으로
Nano Banana용 구조화된 이미지 제작 프롬프트를
자동 작성하게 하고 싶어.

최종 프롬프트는:

목적
맥락
입력자료
작업 단계
조건·제한
출력 형식
검토 기준

구조를 사용한다.

아직 구현하지 말고
전체 워크플로우와 화면 구성을 설계해줘.`
  },
  {
    number: 5, title: '다중 프로젝트 Material Palette 제작 도구 만들어보기', description: '공용 재질 라이브러리에서 프로젝트별 팔레트를 만든다.', features: ['Global Library', '재질 범주', '적용 용도', 'Material Board'],
    prompt: `건축·인테리어 디자이너를 위한 Material Palette 프로그램을 만들고 싶어.

여러 프로젝트에서 공통으로 사용할 수 있는
Global Material Library를 만들고,

Stone
Wood
Porcelain
Travertine
Microcement
Metal
Fabric

등으로 재질을 관리하고 싶어.

프로젝트를 선택하고 공용 Library에서 재질을 골라

Floor
Wall
Ceiling
Furniture
Counter
Accent

용도를 지정하면
프로젝트별 Material Palette가 만들어지게 해줘.

Material Board도 자동 구성하고 싶어.

먼저 프로그램 구조와 기능을 설계해줘.`
  },
  {
    number: 6, title: 'AI 레퍼런스 이미지 검색 프로그램 만들어보기', description: '공용 레퍼런스 라이브러리를 태그와 자연어로 검색한다.', features: ['공용 Library', 'AI 태그', '자연어 검색', '중복 없는 프로젝트 연결'],
    prompt: `내가 모아둔 건축·인테리어 레퍼런스 이미지를
AI로 검색할 수 있는 개인 레퍼런스 프로그램을 만들고 싶어.

하나의 공용 Reference Library를 만들고
여러 프로젝트에서 사용할 수 있어야 해.

이미지를 추가하면 Gemini API가:

공간 유형
주요 재질
색감
분위기
가구 특징
조명 특징

등을 분석해 검색용 태그를 생성하게 해줘.

자연어 검색으로 관련 이미지를 찾고,
선택한 이미지를 현재 프로젝트 Reference와 연결하고 싶어.

원본 이미지를 프로젝트마다 복사해 중복시키지 않는 구조를 우선 검토해줘.

먼저 기술 구조와 검색 방식을 설계해줘.`
  },
  {
    number: 7, title: 'Before / Option A·B·C 설계안 비교 프로그램 만들어보기', description: '기존 상태와 여러 대안을 같은 기준으로 비교한다.', features: ['Before/After 슬라이더', 'A/B/C 병렬 비교', '비교 메모', '수정사항'],
    prompt: `건축·인테리어 디자인 대안을 비교하는 프로그램을 만들고 싶어.

여러 프로젝트와 공간을 등록하고,
각 공간에:

Before
Option A
Option B
Option C

이미지를 등록하게 해줘.

Before / After는 슬라이더,
A/B/C는 병렬 비교를 사용하고 싶어.

디자인 방향,
재질,
가구 구성,
동선,
조명,
장점,
수정사항

도 기록하고 싶어.

먼저 화면 구조와 MVP를 설계해줘.`
  },
  {
    number: 8, title: 'RFP / Design Brief 요구조건 검토 도구 만들어보기', description: '요구조건과 설계안 검토 상태를 근거 중심으로 관리한다.', features: ['요구조건 분류', '검토 상태', '판단 한계', 'Human-in-the-loop'],
    prompt: `여러 건축·인테리어 프로젝트의
RFP와 Design Brief 요구조건을 관리하고
설계안을 검토하는 프로그램을 만들고 싶어.

프로젝트마다:

확정 조건
디자인 제안 가능
추가 확인 필요
검토 기준

을 등록한다.

검토 결과는:

충족
미충족
추가 확인
판단 보류

로 관리하고 싶어.

Gemini API를 사용하더라도
실측·법규·구조·성능처럼
이미지만으로 판단할 수 없는 정보는
AI가 확정하지 않게 해줘.

Human-in-the-loop를 포함해
전체 구조를 설계해줘.`
  },
  {
    number: 9, title: '건축 프레젠테이션 보드 자동 제작기 만들어보기', description: '선택한 이미지와 정보를 정돈된 보드로 구성한다.', features: ['이미지 선택', '자동 배치', '캡션·팔레트', 'PNG/PDF 출력'],
    prompt: `건축·인테리어 프로젝트의 이미지로
프레젠테이션 보드를 빠르게 만드는 프로그램을 만들고 싶어.

여러 프로젝트를 관리하고,
각 프로젝트에서:

Before
Concept
Option A
Option B
Option C
Material
Reference

이미지를 선택할 수 있게 해줘.

선택한 이미지를 정돈된 Presentation Board에 자동 배치하고
프로젝트명, 공간명, 캡션, Material Palette도
자동 구성하고 싶어.

여러 레이아웃 템플릿과
PNG/PDF 출력 기능도 고려하고 싶어.

먼저 가장 단순한 MVP를 설계해줘.`
  },
  {
    number: 10, title: 'AI 현장사진 관찰·분석 도구 만들어보기', description: '사진에서 보이는 요소와 확인할 수 없는 조건을 분리한다.', features: ['보이는 요소 관찰', '판단 한계', 'KEEP/CHANGE/CHECK', 'Grounding·HITL'],
    prompt: `건축·인테리어 현장사진을
AI가 관찰하고 정리해주는 프로그램을 만들고 싶어.

여러 프로젝트를 생성하고
각 프로젝트의 현장사진을 등록할 수 있게 해줘.

Gemini API는 이미지에서
실제로 확인 가능한 요소만 정리한다.

예:

창호
바닥
벽
천장
기둥
가구
조명
출입구

반대로:

실제 치수
구조체 여부
전기 용량
법규 적합성
재료 성능
시공 가능성

등은 이미지로 확정하지 않게 해줘.

결과를 사용자가:

KEEP
CHANGE
CHECK

로 분류할 수 있게 해줘.

Grounding과 Human-in-the-loop를 중요하게 설계해줘.

아직 구현하지 말고
프로그램 구조와 데이터 흐름부터 제안해줘.`
  },
];
