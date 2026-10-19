// Authorized Lesson 02 review draft. Educational program linked; no curriculum release.
export const lesson02Title = '제2차시 · 실무 시나리오 기반 설계 워크플로우 자동화와 Vibe Coding 실습';
export const lesson02Lead = '공간과 가구를 유지한 이미지 수정부터, 사람이 판단할 범위를 정하는 파일 자동정리 계획까지 입력자료·작업 범위·결과 확인 기준을 연결합니다.';
export const lesson02Goals = [
  '작업 전 공간 이미지와 재질·조명 참고 이미지의 역할을 구분한다.',
  '선택한 기존 벽면의 재질과 조명 인상만 바꾸는 Prompt를 작성한다.',
  '색온도 비교자료와 실습 입력자료의 역할 및 한계를 설명한다.',
  'Vibe Coding에서 사람이 먼저 정할 조건을 설명한다.',
  '프로그램의 큰 구조와 실제 폴더·파일 구조를 구분한다.',
  '자연어 첫 요청 → 구조 검토 → 상세 구현 명세 순서로 작업을 준비한다.',
  '확실한 파일은 자동분류하고 애매한 파일은 사람이 판단하도록 규칙을 정한다.',
  '실제 검사 결과와 아직 실행하지 않은 테스트 계획을 구분한다.',
] as const;
export const lesson02Topics = [
  '생성형 AI 리터러시 기초 및 건축 디자인 시각화 실습',
  '실무 시나리오 기반 맞춤형 제안 이미지 생성 및 워크플로우 자동화',
  '초기 기획을 위한 래피드 콘셉트 도출 및 인페인팅 실무',
  '메인-서브 통합 워크플로우 및 2D 역추출 브릿지 실습',
  '실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초',
  'AI 생성 결과물 다차원 실무 검증 및 제안서 고도화',
  '실무 검증형 설계 제안서 롤플레잉 최종 발표 및 수료',
] as const;

export const lesson02Sections = [
  {id:'l02-recap',title:'새로운 예제로 Prompt 복습',minutes:12},
  {id:'l02-reference',title:'오늘 실습 이해와 작업 전 공간 선택',minutes:10},
  {id:'l02-temperature',title:'재질 선택과 조명 인상 이해',minutes:13},
  {id:'l02-material-practice',title:'선택한 벽면의 재질·조명만 바꾸기',minutes:15},
  {id:'l02-vibe-coding',title:'Vibe Coding이란?',minutes:8},
  {id:'l02-architecture',title:'프로그램의 큰 구조 · Architecture',minutes:12},
  {id:'l02-hierarchy',title:'기능을 실제 폴더와 파일로 나누기 · Hierarchy',minutes:10},
  {id:'l02-process',title:'프로그램 개발 접근 순서',minutes:8},
  {id:'l02-codex',title:'그 다음 Codex로 프로젝트 작업하기',minutes:12},
  {id:'l02-rules',title:'사람이 먼저 정하는 자동분류 규칙',minutes:10},
  {id:'l02-plan',title:'먼저 원하는 프로그램을 말해보기',minutes:7},
  {id:'l02-plan-review',title:'AI가 제안한 큰 구조 검토하기',minutes:8},
  {id:'l02-implementation',title:'요구조건을 보완하고 구현 승인하기',minutes:12},
  {id:'l02-tests',title:'구현 뒤 확인할 Test 계획',minutes:8},
  {id:'l02-handover',title:'결과 검토와 다음 차시 연결',minutes:5},
] as const;
export const lesson02Periods = [
  {id:'l02-period-1',title:'오피스 공간의 재질·조명 바꾸기',time:'18:00~18:50',output:'선택한 공간·재질·벽면과 실행 Prompt, 첫 결과 또는 실행 상태 기록',sectionIds:['l02-recap','l02-reference','l02-temperature','l02-material-practice']},
  {id:'l02-period-2',title:'프로그램을 만들기 전에 구조부터',time:'19:00~19:50',output:'기능의 역할·관계와 폴더·파일 구조를 구분한 개발 순서',sectionIds:['l02-vibe-coding','l02-architecture','l02-hierarchy','l02-process','l02-codex']},
  {id:'l02-period-3',title:'자연어 첫 요청에서 구현 명세까지',time:'20:00~20:50',output:'자연어 요청, 사람이 검토한 구조와 상세 구현 명세, 테스트 계획',sectionIds:['l02-rules','l02-plan','l02-plan-review','l02-implementation','l02-tests','l02-handover']},
] as const;
export const recapChecks = ['목적','입력자료','유지','변경','금지','결과 확인'] as const;
export const recapPrompt = `아래 작은 요청에서 빠진 조건을 찾아주세요. 의뢰서와 작업 기준서의 조건을 이미지 수정 요청으로 옮기는 연습입니다.
요청: “회의 테이블 뒤 기존 벽면의 색만 밝게 바꾸고 싶습니다.”
유지: 공간 구조, 문·창호, 천장, 테이블·의자의 형태와 위치, 조명과 카메라.
변경: 회의 테이블 뒤 기존 벽면의 색.
금지: 새 벽·가구·등기구 추가, 가구 재배치, 벽면 밖의 마감 변경.
색과 적용 범위가 아직 명확하지 않다면 추가 질문으로 남기세요.
이미지는 아직 수정하지 말고, 유지 / 변경 / 금지 / 추가 질문을 나누어 적어주세요.`;
export const materialPrompt = `[목적]
선택한 작업 전 공간의 기존 벽면 한 곳에 재질을 적용하고 기존 조명의 인상만 따뜻하게 조정한 제안 이미지 1장을 만듭니다.

[맥락]
공간과 가구는 이미 사용 가능한 상태입니다. 전체 공간을 새로 디자인하거나 가구 배치를 설계하는 과제가 아닙니다.

[입력자료]
작업 전 공간: [선택한 작업 전 공간]
재질 참고 이미지: [선택한 재질]
조명 참고 이미지: [Lighting Reference]
재질 적용 위치: [적용할 위치]

[작업 단계]
1. 작업 전 공간에서 구조·문·창호·천장·가구·카메라·광원 위치를 확인합니다.
2. [적용할 위치]에만 [선택한 재질]의 색상·무늬·질감을 참고하여 적용합니다.
3. [Lighting Reference]의 약 3000K 방향의 따뜻한 색감과 부드러운 밝기 인상만 참고합니다.
4. 원본과 비교하여 요청 밖 변경이 있는지 확인합니다.

[조건·제한]
구조·문·창호·천장·가구 형태와 위치·카메라·광원 위치를 유지합니다. 새 등기구를 추가하거나 광원을 옮기지 않습니다.
재질 참고 이미지의 영문 재질명·라벨·글자를 공간 이미지에 복사하지 않습니다. 참고 이미지의 공간 구조나 가구 배치를 가져오지 않습니다.
지정 벽면 밖의 벽·바닥·천장·가구 마감은 변경하지 않습니다. 사람·텍스트·로고·새 장식을 추가하지 않습니다.
재질은 색상·무늬·질감 참고용이며 실제 제품 규격·가격·두께·내구성·난연성·방수성·미끄럼 성능·시공법·성능을 확정하지 않습니다.
조명 참고 이미지는 실제 색온도·조도·CRI·성능 보증 자료가 아닙니다.

[출력 형식]
작업 전 공간과 같은 시점·구도의 적용 결과 이미지 1장.

[검토 기준]
고정 요소가 유지되었는가? 선택한 재질이 지정 벽면에만 적용되었는가? 기존 광원 위치를 유지하며 조명 인상만 조정했는가?
요청 밖 변경과 재질 라벨 복사가 없는가? 확인하지 못한 조건을 실제 설계 사실로 확정하지 않았는가?`;
export const materialExecutionPrompt = `작업 전 공간 [선택한 작업 전 공간], 재질 참고 이미지 [선택한 재질], 조명 참고 이미지 [Lighting Reference]를 첨부합니다.
[적용할 위치]에만 선택한 재질의 색상·무늬·질감을 적용하고, 조명 참고 이미지의 약 3000K 방향의 따뜻한 색감·부드러운 밝기 인상만 참고하세요.
구조·문·창호·천장·가구 형태와 위치·카메라·광원 위치는 유지하세요. 새 등기구와 장식을 추가하지 말고 지정 벽면 밖의 마감은 바꾸지 마세요.
재질의 영문명·라벨·텍스트나 참고 이미지의 공간 배치를 복사하지 마세요. 같은 시점의 적용 결과 이미지 1장을 만드세요. 실제 제품·조명 성능은 이미지로 확정하지 않습니다.`;
export const materialPracticeAssets = [
  {key:'base',title:'적용 예시',purpose:'적용 예시 · 정답 이미지가 아닌 비교 자료',description:'공간 구조와 가구 위치를 유지하면서 지정한 재질과 조명 인상만 제한적으로 바꾼 예시입니다. BASE 01은 이 기존 예시를 중립화하여 만든 교육용 입력입니다. BASE 01에서 이 예시가 실제 Prompt로 생성되었다고 검증된 쌍은 아니며, BASE 02~05의 결과 쌍도 아닙니다.',alt:'리셉션 벽면의 재질과 따뜻한 조명 인상을 살펴보는 적용 예시'},
  {key:'lighting-reference',title:'조명 참고 이미지',purpose:'실습 입력용 · 약 3000K 방향의 조명 분위기',description:'따뜻한 색감과 부드러운 밝기 인상만 참고합니다. 이 이미지의 벽·천장 형상과 광원 위치는 복사하지 않습니다. 실제 색온도·조도·CRI·성능을 보증하는 자료가 아닙니다.',alt:'단순한 벽과 천장 일부에 비치는 따뜻하고 부드러운 간접조명 참고 이미지'},
] as const;
export const referenceRoles = [
  ['작업 전 공간 이미지 (BASE Image)','공간 구조·가구·카메라·기존 광원 위치','유지할 조건의 기준'],
  ['재질 참고 이미지 (Material Reference)','색상·무늬·질감','지정 벽면에만 참고; 공간 구조·배치·라벨을 복사하지 않음'],
  ['조명 참고 이미지 (Lighting Reference)','따뜻한 색감·부드러운 밝기 인상','공간 구조와 실제 조명 수치·성능을 확정하지 않음'],
] as const;
export const environmentRequired = [
  ['ChatGPT Desktop + Codex','본인 계정에서 프로젝트 폴더를 연결하고 작업 범위를 확인합니다.'],
  ['실습용 프로젝트 폴더','사용자가 넣은 파일만 처리하도록 AI_파일자동정리 폴더를 연결합니다.'],
  ['Node.js LTS','Codex가 만든 로컬 프로그램을 실행하고 테스트하기 위한 실행환경입니다.'],
] as const;
export const environmentOptional = ['Codex CLI','Git','VS Code','WSL'] as const;
export const workflowSteps = [
  ['01','문제 정의','어떤 반복 작업을 줄일지 정합니다.'],
  ['02','요구사항','입력·출력·원본 보호·오류 처리 조건을 적습니다.'],
  ['03','자동 / 사람 판단 구분','확실한 처리는 자동화하고 애매한 판단은 사람에게 남깁니다.'],
  ['04','Architecture','기능의 역할과 연결 관계를 정합니다.'],
  ['05','Hierarchy','역할을 실제 폴더·파일 구조로 나눕니다.'],
  ['06','구현','사람이 검토·승인한 범위를 코드로 만듭니다.'],
  ['07','Test','기대 결과와 실제 결과를 비교합니다.'],
  ['08','수정','실패 원인을 고치고 해당 조건을 다시 확인합니다.'],
] as const;
export const architectureRoles = [
  ['INPUT','00_수집함','사용자가 의도적으로 넣은 파일'],
  ['WATCHER','새 파일 감지','복사 완료·임시파일 여부 확인'],
  ['CLASSIFIER','확장자 / 파일명 판단','사람이 정한 규칙으로 후보 판단'],
  ['DECISION','자동분류 / 사람확인','불확실하면 99_분류확인'],
  ['FILE MANAGER','원본 보관 / 이동 / 버전','먼저 원본 보관, 기존 파일 보존'],
  ['DATA','registry / log','처리 상태·결과·오류 기록'],
  ['UI','현재 상태 / 분류확인','확인 대기 파일의 유형 선택'],
] as const;
export const hierarchyTree = `AI_파일자동정리/
├─ app/
│  ├─ watcher
│  ├─ classifier
│  ├─ file-manager
│  └─ ui
├─ data/
│  ├─ rules
│  ├─ registry
│  └─ log
├─ 00_수집함/
└─ 99_분류확인/`;
export const planChecks = [
  '필요한 기능이 빠졌는가?',
  '프로그램 폴더 밖에 접근하는가?',
  '원본을 삭제하거나 기존 파일을 덮어쓰는가?',
  '애매한 파일을 강제 분류하는가?',
  '외부 서비스나 불필요한 설치가 필요한가?',
  '실행·종료 방식이 분명한가?',
  '오류를 어떻게 기록하는가?',
  '테스트 항목과 기대 결과가 있는가?',
] as const;
export const folderChoices = [
  ['CAD도면', '01_CAD도면'], ['BIM건축모델', '02_BIM건축모델'], ['Reference', '03_레퍼런스'],
  ['이미지결과', '04_이미지결과'], ['3D모델', '05_3D모델'], ['포인트클라우드', '06_포인트클라우드'],
  ['문서', '07_문서'], ['영상', '08_영상'], ['데이터', '09_데이터'], ['압축파일', '10_압축파일'],
  ['디자인소스', '11_디자인소스'], ['기타', '99_분류확인'],
] as const;
export const classificationRules = [
  { label: 'CAD / 도면', folder: '01_CAD도면', extensions: ['.dwg', '.dxf', '.dgn', '.dwf', '.dwfx'] },
  { label: 'BIM / 건축 모델', folder: '02_BIM건축모델', extensions: ['.rvt', '.rfa', '.rte', '.ifc', '.ifczip', '.pln', '.pla', '.gsm', '.skp'] },
  { label: '일반 3D / DCC / 교환 모델', folder: '05_3D모델', extensions: ['.blend', '.fbx', '.obj', '.abc', '.glb', '.gltf', '.3ds', '.dae', '.stl', '.ply', '.usd', '.usda', '.usdc', '.usdz', '.3dm', '.c4d', '.max', '.ma', '.mb', '.step', '.stp', '.iges', '.igs', '.sat'] },
  { label: '포인트클라우드 / Scan', folder: '06_포인트클라우드', extensions: ['.e57', '.las', '.laz', '.rcp', '.rcs', '.pts', '.pcd'] },
  { label: '문서', folder: '07_문서', extensions: ['.doc', '.docx', '.hwp', '.hwpx', '.txt', '.md', '.rtf', '.odt', '.ppt', '.pptx'] },
  { label: '영상', folder: '08_영상', extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'] },
  { label: '데이터', folder: '09_데이터', extensions: ['.xlsx', '.xls', '.csv', '.json', '.xml', '.yaml', '.yml'] },
  { label: '압축', folder: '10_압축파일', extensions: ['.zip', '.7z', '.rar', '.tar', '.gz', '.tgz'] },
  { label: '디자인 Source', folder: '11_디자인소스', extensions: ['.psd', '.ai', '.eps', '.indd'] },
] as const;
export const ambiguousExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.bmp', '.gif', '.heic', '.svg', '.pdf'] as const;
export const keywordRules = [
  { label: '도면 후보', folder: '01_CAD도면', keywords: ['floorplan', 'plan', 'elevation', 'section', 'drawing', 'detail', 'cad', '평면', '평면도', '입면', '입면도', '단면', '단면도', '도면', '상세도'] },
  { label: 'Reference 후보', folder: '03_레퍼런스', keywords: ['ref', 'reference', 'material', 'texture', 'lighting', 'moodboard', 'mood', '재질', '텍스처', '조명', '레퍼런스', '무드보드'] },
  { label: '이미지 결과 후보', folder: '04_이미지결과', keywords: ['render', 'output', 'result', 'generated', 'concept', 'selected', 'final', '렌더', '결과', '시안', '콘셉트', '선택안'] },
  { label: '문서 후보', folder: '07_문서', keywords: ['rfp', 'brief', 'report', 'proposal', 'contract', '제안서', '보고서', '계약서', '브리프'] },
] as const;
export const programTree = hierarchyTree;
export const processingFlow = [
  '00_수집함에 사용자가 파일 투입', '새 파일 감지', '크기·수정시간의 연속 안정 확인', '임시파일 제외',
  '확장자 판정', '명확한 확장자는 자동 분류 / 애매한 확장자는 파일명 keyword 확인',
  '확실하면 해당 폴더 / 불확실·충돌이면 99_분류확인', '사람이 UI에서 유형 선택', '최종 폴더 저장과 registry / log 기록',
] as const;
export const uiRequirements = [
  '프로그램 상태: 감시 중 / 정지', '00_수집함 경로', '각 분류 폴더의 파일 수', '최근 처리 파일',
  '자동 / 수동 분류 여부', '99_분류확인 목록', '이미지일 경우 가능한 범위의 thumbnail',
  '수동 분류 버튼', '프로그램 종료 버튼',
] as const;
export const portableForbidden = [
  '프로그램 루트 밖 사용자 파일 접근·검색·변경', 'Windows Registry', 'Windows Service', '시작프로그램 등록',
  'Scheduled Task 등록', 'AppData 사용', '사용자 홈의 다른 위치에 설정 저장', '외부 database', 'cloud upload', 'telemetry',
] as const;
export const exceptionScenarios = [
  ['image001.png', '의미 판정 불가', '99_분류확인'],
  ['floorplan.pdf', '도면 keyword 있음', '01_CAD도면'],
  ['material_ref.jpg', 'Reference keyword 있음', '03_레퍼런스'],
  ['scan003.pdf', '의미 불명확', '99_분류확인'],
  ['같은 이름 + 다른 내용', '기존 파일 보존', '_v02 / _v03로 구분; 덮어쓰기 금지'],
  ['같은 파일 재투입', '동일 SHA-256', '“이미 처리된 동일 파일입니다.” 안내; 추가 저장하지 않음'],
  ['.tmp / .part / .crdownload', '복사·다운로드 중 임시파일', '처리하지 않음'],
  ['~$로 시작하는 Office 파일', 'Office 임시파일', '처리하지 않음'],
  ['서로 다른 분류의 keyword 충돌', '분류를 확정할 수 없음', '99_분류확인; 사람이 선택'],
  ['처리 중 오류', '성공으로 표시하지 않음', '원본보관 유지와 오류 기록'],
  ['.xyz', '좌표 데이터 / 포인트클라우드 등 용도가 다양함', '초기 기본값: 99_분류확인'],
] as const;
export const testScenarios = [
  ['office_floorplan.png', '01_CAD도면', 'floorplan'],
  ['front_elevation.pdf', '01_CAD도면', 'elevation'],
  ['material_ref_oak.png', '03_레퍼런스', 'material / ref'],
  ['lighting_ref_3000K.jpg', '03_레퍼런스', 'lighting / ref'],
  ['render_A_v01.png', '04_이미지결과', 'render'],
  ['project_brief.docx', '07_문서', '.docx의 명확한 확장자'],
  ['building_model.blend', '05_3D모델', '.blend의 명확한 확장자'],
  ['animation_cache.abc', '05_3D모델', '.abc의 명확한 확장자'],
  ['walkthrough.mp4', '08_영상', '.mp4의 명확한 확장자'],
  ['image001.png', '99_분류확인', '용도를 알 수 없음'],
  ['scan003.pdf', '99_분류확인', '용도를 알 수 없음'],
] as const;
const extensionSpecification = classificationRules.map((rule) => `${rule.extensions.join(', ')} → ${rule.folder}`).join('\n');
const keywordSpecification = keywordRules.map((rule) => `${rule.keywords.join(', ')} → ${rule.folder}`).join('\n');
export const planPrompt = `바탕화면에 폴더 하나로 사용할 수 있는
파일 자동정리 프로그램을 만들고 싶어.

00_수집함에 여러 파일을 넣으면
파일 종류에 맞는 폴더로 자동으로 정리됐으면 좋겠어.

다만 PNG, JPG, PDF처럼 용도가 애매한 파일은
마음대로 분류하지 말고
사용자가 확인해서 선택할 수 있게 해줘.

원본은 보관하고,
같은 이름의 파일은 덮어쓰지 않았으면 좋겠고,
프로그램 폴더 전체를 옮기거나 삭제하기 쉬운 형태였으면 해.

아직 만들지는 말고,
먼저 어떤 구조로 만들면 좋을지 설명해줘.
필요한 기능, 폴더 구조, 예외 처리,
테스트해야 할 항목도 같이 제안해줘.`;
export const approvalPrompt = `이 Prompt는 첫 질문이 아니라, 사람이 Architecture와 Hierarchy를 검토한 뒤 작성하는 상세 구현 명세입니다. 빈칸을 채우고 승인한 범위에서만 구현하세요.
[승인한 계획] [계획 버전 또는 해당 답변]
[작업 폴더] [내가 연결한 AI_파일자동정리 폴더]
[승인 파일] [검토한 생성·수정 파일 목록]
[미확정 항목의 결정] [keyword 경계·중복 재투입 처리 등 사람이 정한 규칙]
빈칸·미확정 조건이 남으면 구현 전에 질문하세요. 새 범위나 삭제·외부 전송·추가 설치가 필요하면 먼저 설명하고 사람의 판단을 받으세요.

[목적과 범위]
사용자가 바탕화면의 AI_파일자동정리/00_수집함에 의도적으로 넣은 파일만 처리합니다. 시스템 전체를 감시하지 않습니다. 프로그램 루트 밖 사용자 파일에 접근·검색·변경하지 않습니다. 모든 설정·상태·로그와 작업 파일은 프로그램 폴더 안에 둡니다. 프로그램 종료 시 감시와 프로세스도 종료합니다.

[기술]
Node.js LTS의 기본 module(fs, path, crypto, http)을 우선합니다. 외부 npm package와 npm install에 의존하지 않는 구조로 구현하세요. Express, React, Electron, database를 사용하지 않습니다. 로컬 UI는 http://127.0.0.1:4174 를 기본으로 하고 포트 충돌은 명확한 오류로 알려주세요. 임의 다른 포트로 자동 변경하지 않습니다. START.bat / STOP.bat, app/watcher.js, app/classifier.js, app/file-manager.js, app/app.js, app/ui/, app/rules.json, data/registry.json, data/log.json과 README로 역할을 나눕니다. README에는 node --version 확인과 START.bat 사용 방법을 포함합니다. runtime 바이너리를 다운로드·추가하거나 Portable 배포본을 만들지 않습니다.

[분류 폴더]
${folderChoices.map(([label, folder]) => `${label}: ${folder}`).join('\n')}

[명확한 확장자 규칙]
${extensionSpecification}
.xyz는 초기 기본값에서 99_분류확인입니다. 미등록 확장자도 사람이 확인하도록 둡니다.
위 목록의 명확한 확장자는 직접 분류 규칙을 우선하고 파일명 keyword로 다른 분류를 덮어쓰지 않습니다. 파일명 keyword 판정은 아래 11개 애매한 확장자에만 적용합니다.

[애매한 확장자와 파일명 규칙]
${ambiguousExtensions.join(', ')}는 확장자만으로 최종 분류하지 않습니다. 파일명 keyword를 추가로 확인합니다.
${keywordSpecification}
서로 다른 분류의 keyword가 충돌하거나 의미를 알 수 없으면 99_분류확인입니다. 같은 분류의 여러 keyword는 충돌이 아닙니다. 영문 keyword는 대소문자를 구분하지 않되 파일명의 단어 경계에 맞춰 판정하고, plan이 planting의 일부라는 이유로 도면으로 분류하지 않습니다. 구체적인 구분자와 한글 keyword 매칭 방식은 계획에서 설명하세요.

[원본·복사·중복 보호]
파일 크기와 수정시간이 연속된 검사에서 안정된 뒤 처리합니다. .tmp, .part, .crdownload, ~$로 시작하는 Office 임시파일은 처리하지 않습니다. 처리 시작 시 수집함 파일을 00_원본보관에 byte-identical로 복사한 뒤 수집함의 작업 파일을 분류 폴더로 이동합니다. 원본보관 파일을 자동 삭제하지 않습니다. 같은 이름과 다른 내용은 기존 파일을 덮어쓰지 않고 _v02, _v03 등으로 저장합니다. 기존 _v01 같은 이름의 다음 version도 합리적으로 계산합니다. SHA-256이 동일하면 “이미 처리된 동일 파일입니다.”를 알리고 중복 저장하지 않습니다. 중복 재투입 후 수집함 파일의 처리 방식은 먼저 제안하고 사람에게 확인받으세요. 오류 시 보관 원본을 유지하고 오류를 기록하며 성공으로 표시하지 않습니다.

[UI]
감시 중/정지 상태, 수집함 경로, 각 분류 폴더 파일 수, 최근 처리 파일, 자동/수동 분류 여부, 99_분류확인 목록, 가능한 이미지 thumbnail, 수동 분류 버튼과 종료 버튼을 표시합니다. 유형 선택은 CAD도면/BIM건축모델/Reference/이미지결과/3D모델/포인트클라우드/문서/영상/데이터/압축파일/디자인소스/기타를 제공합니다. 기타는 99_분류확인 안에 두어도 됩니다.

[금지]
Windows Registry, Windows Service, 시작프로그램, Scheduled Task, AppData, 사용자 홈 다른 위치의 설정, 외부 DB, cloud upload, telemetry, 프로젝트 밖 검색을 금지합니다. 종료 뒤 다른 위치나 USB로 폴더 전체를 옮겨 사용하는 구조를 지향하되 Node runtime 동봉 배포는 별도 검토합니다. 운영체제·브라우저 자체 기록과 캐시의 완전 삭제를 보장하지 않습니다.

[구현 보고]
1. 이해한 요구조건과 아직 결정되지 않은 항목
2. 변경한 파일 목록·폴더 구조·각 파일의 역할
3. 감시 → 복사 안정 확인 → 원본보관 → 분류 → 사람 판단 → 기록 흐름
4. 루트 밖 접근, 덮어쓰기, 중복, 부분 오류, 종료, 포트 충돌 방지 방법
5. 실습용 테스트 시나리오와 기대 결과
6. 실제 수행한 검사와 통과·실패·미검증 항목
미제공 이미지·테스트 파일·바이너리를 임의 생성하지 말고, 구현하지 않은 기능을 완료한 것으로 표시하지 마세요.`;
export const testPrompt = `준비된 프로그램과 실습파일을 사용해 직접 실행한 결과를 검토하세요. 새 테스트 파일이나 이미지를 임의로 만들지 않습니다.
내가 제공한 실행 기록만 근거로 기대 결과 / 실제 결과 / 통과·실패·미검증 / 근거를 표로 적습니다. 실행 기록이 없는 항목은 미검증으로 남기고 다음 확인 방법을 제안하세요.
${testScenarios.map(([file, folder]) => `${file} → ${folder}`).join('\n')}
image001.png과 scan003.pdf는 처음에 99_분류확인으로 가는지 확인합니다. 수동 선택 후 결과는 별도로 기록합니다.
원본보관 SHA-256 일치, 같은 이름·다른 내용의 버전 저장, 동일 SHA 중복 안내와 반복 기록 여부, 임시파일 제외, 종료도 실제 수행한 범위에서 확인합니다.
building_model.blend와 animation_cache.abc는 classification test stub이며 실제 모델/캐시가 아닙니다. lighting_ref_3000K.jpg는 실제 색온도 보증 자료가 아닙니다.
교사의 검증 결과를 내 PC의 실행 결과로 대신 적지 않습니다. 파일 삭제·외부 접근·추가 구현은 요청하지 않습니다.`;
export const reviewOutputs = [
  '선택한 공간·재질·적용 위치와 실행 Prompt',
  '첫 결과 또는 실행 상태, 원본/결과 비교 메모',
  '자연어 첫 요청과 AI가 제안한 큰 구조',
  '사람의 8항목 검토와 미확정 조건의 결정',
  '검토 뒤 보완한 상세 구현 명세',
  '11개 실습파일의 기대·실제 결과와 통과·실패·미검증을 구분한 실행 기록',
] as const;
export const instructorRisks = [
  ['Keyword 오판', '영문 token 경계·대소문자 처리를 먼저 정하고 plan과 무관한 단어가 도면으로 분류되지 않는지 확인합니다.'],
  ['중복 재투입', '추가 저장하지 않는 규칙은 확정되어 있지만 수집함의 재투입 파일을 어떻게 남길지는 계획에서 결정합니다. 원본 자동 삭제를 추정하지 않습니다.'],
  ['복사 중 파일', '연속 size/mtime 안정 확인 방식과 검사 간격을 계획에 적습니다. 복사·hash 전후 변경과 오류도 테스트합니다.'],
  ['경로·링크', '수집함·보관·분류·UI 접근이 실제 루트 안인지 확인합니다. 외부로 연결된 symlink/junction과 경로 탈출을 처리하지 않도록 검토합니다.'],
  ['중간 종료·저장 오류', '원본보관 유지, 실패 기록, registry/log의 일관성과 재시작 후 상태를 확인합니다. 성공 판정 시점을 명시합니다.'],
  ['프로그램 종료', 'watcher·timer·http server 종료를 확인합니다. STOP.bat이 다른 Node 프로그램까지 종료하지 않아야 합니다.'],
  ['로컬 UI', '127.0.0.1에서만 접근하고 포트 충돌을 알리며 UI에서 파일명과 경로를 안전하게 처리하는지 확인합니다.'],
  ['Thumbnail 한계', '브라우저가 지원하지 않는 이미지 형식은 표시하지 못할 수 있습니다. thumbnail이 없는 파일도 수동 판단할 수 있어야 합니다.'],
  ['Portable 사용', '한글·공백 경로와 폴더 이동을 검토합니다. 개발본 실행용 Node와 선택적 동봉 runtime을 구분하고 runtime 배포는 이번 단계에서 하지 않습니다.'],
] as const;
