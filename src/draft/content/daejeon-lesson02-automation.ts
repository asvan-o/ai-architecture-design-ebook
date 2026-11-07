// Lesson 02 automation-only draft. Material/lighting sources remain in daejeon-lesson02.ts.
export { testScenarios } from './daejeon-lesson02';

export const lesson02Title = '제2차시 · 실무 시나리오 기반 설계 워크플로우 자동화와 Vibe Coding 실습';
export const lesson02Lead = '건축 프로젝트 파일 자동 정리 프로그램 하나를 만듭니다. 폴더·감시부터 분류 규칙, 원본 보호, 브라우저 화면까지 AI와 대화하며 단계적으로 구현하고 직접 실행해 확인합니다.';
export const sections = [
  {id:'l02-recap',title:'지난 차시에서 오늘로 이어가기',minutes:12},
  {id:'l02-automation',title:'업무 자동화란?',minutes:10},
  {id:'l02-vibe-coding',title:'Vibe Coding이란?',minutes:10},
  {id:'l02-environment',title:'실습 환경 준비하기',minutes:18},
  {id:'l02-architecture',title:'프로그램의 큰 구조 이해하기 · Architecture',minutes:10},
  {id:'l02-hierarchy',title:'기능을 폴더와 파일로 나누기 · Hierarchy',minutes:8},
  {id:'l02-rules',title:'자동화 규칙과 사람 판단 범위 정하기',minutes:8},
  {id:'l02-first-request',title:'Step 1 · 기본 폴더 구조와 감시 뼈대 만들기',minutes:12},
  {id:'l02-plan-review',title:'Step 2 · 자동 분류와 사람 확인 분리하기',minutes:12},
  {id:'l02-implementation-spec',title:'Step 3 · 원본 보호와 중복·덮어쓰기 방지',minutes:10},
  {id:'l02-implement',title:'Step 4 · 화면·외부 가져오기와 최종 통합 예시문',minutes:15},
  {id:'l02-run',title:'완성 프로그램 실행·기능 확인',minutes:20},
  {id:'l02-wrap-up',title:'핵심 정리와 다음 차시 연결',minutes:5},
] as const;
export const periods = [
  {id:'l02-period-1',title:'업무 자동화 이해하고 실습 환경 준비하기',time:'50분',output:'자동화할 일과 사람이 판단할 일을 구분하고 실습 폴더를 연결합니다.',sections:sections.slice(0,4)},
  {id:'l02-period-2',title:'구조를 이해하고 기본 동작·분류 구현하기',time:'50분',output:'폴더·감시 뼈대를 만들고 자동 분류와 사람 확인 규칙을 이어서 구현합니다.',sections:sections.slice(4,9)},
  {id:'l02-period-3',title:'원본 보호·화면을 완성하고 직접 확인하기',time:'50분',output:'안전장치와 화면·외부 가져오기를 연결하고 SORT_TEST 기준표와 실행 결과를 비교합니다.',sections:sections.slice(9)},
] as const;
export const goals = [
  '사람이 작업 목표와 범위를 정하고, AI에게 작은 기능부터 실제 구현을 요청합니다.',
  '자동화할 반복 작업과 사람이 판단할 예외를 구분합니다.',
  '프로그램의 역할과 폴더·파일 구조를 이해하고 같은 프로그램에 기능을 덧붙입니다.',
  '허용한 폴더에서 만든 프로그램을 실행하고 기대 결과와 실제 결과를 비교합니다.',
];
export const recap = {
  subtitle:'지난 차시의 작업 방식을 짧게 돌아보고, 같은 원칙을 오늘의 업무 자동화에 연결합니다.',
  introduction:[
    '지난 차시에는 AI가 만든 결과를 바로 사용하는 것이 아니라, 요청과 자료를 확인하고 사람이 조건을 정한 뒤 결과를 다시 검토하는 과정을 익혔습니다.',
    '오늘은 같은 원칙을 프로그램 제작과 업무 자동화에 적용합니다.',
  ],
  previousFlow:['요청 확인','필요한 조건 정리','작업 기준 만들기','AI 요청 작성','결과 생성','원본과 비교','사람이 최종 판단'],
  roles:[
    {title:'AI가 도운 일',items:['요청과 자료를 빠르게 정리','여러 초안과 방향 제안','반복적인 작성·정리 지원','수정 요청에 따라 결과 보완']},
    {title:'사람이 판단한 일',items:['작업 목표와 범위 결정','확인되지 않은 조건 구분','원본과 결과 비교','최종 사용·수정·제외 결정']},
  ],
  connection:'프로그램을 만들 때도 같은 원칙을 사용합니다. 목표와 허용 범위를 확인한 뒤 작은 기능부터 구현하고, 실행 결과를 보며 다음 기능을 덧붙입니다.',
  planningFlow:['무엇을 만들 것인지','어디까지 자동화할 것인지','어떤 경우 사람이 확인할 것인지','어떤 구조로 만들 것인지','실제로 제대로 작동하는지'],
  todayFlow:['업무 자동화 이해','Vibe Coding','실습 환경 준비','Step 1~4 단계별 구현','실행','기대 결과와 실제 결과 비교'],
  transition:[
    '지난 차시에는 AI를 활용해 이미지와 작업 기준을 만들고 그 결과를 사람이 확인했습니다.',
    '이번 차시에는 AI와 함께 작은 프로그램을 만들면서, 미리 정한 규칙에 따라 작업을 처리하는 업무 자동화 방식을 알아봅니다.',
  ],
} as const;
export const automationDefinition = '사람이 반복해서 하는 일정한 작업을 미리 정한 규칙에 따라 프로그램이 대신 처리하도록 만드는 것';
export const automationExamples = [
  ['결과 이미지 분류','정해진 파일명 규칙에 맞는 결과 이미지를 모읍니다.'],
  ['지정 폴더 파일 이동','선택한 수집함에서 정해진 목적지로 파일을 보냅니다.'],
  ['반복 파일명 처리','같은 이름이 들어오면 버전 번호를 붙입니다.'],
  ['보고용 목록 생성','정해진 입력 항목으로 파일 목록을 만듭니다.'],
] as const;
export const humanDecisions = ['무엇을 만들 것인가?','어떤 기능이 필요한가?','어디까지 자동화할 것인가?','어떤 경우 사람이 판단할 것인가?','어떤 파일에 접근할 수 있는가?','무엇을 확인해야 성공인가?'];
export const environmentSteps = [
  ['ChatGPT Desktop 실행','앱을 열고 사용할 계정으로 로그인합니다.'],
  ['Codex 사용 가능 여부 확인','앱의 선택 메뉴에서 Codex 작업을 사용할 수 있는지 확인합니다. 표시와 접근 가능 여부는 앱·계정 환경에 따라 다를 수 있습니다.'],
  ['실습 프로젝트 폴더 연결','이번 실습 전용 로컬 폴더를 선택합니다. 대화에 파일을 첨부하는 것과 프로젝트 폴더를 연결하는 것을 구분합니다.'],
  ['현재 작업 경로 확인','선택한 폴더 경로를 읽고 다른 업무 폴더가 연결되지 않았는지 확인합니다.'],
  ['읽기·수정 범위 확인','앱의 권한 설정을 확인하고, 실습 폴더 밖은 접근하지 않는다고 요청에 적습니다. 요청 문구와 실제 권한 설정을 함께 확인합니다.'],
  ['빈 폴더에서 단계별 제작 시작','Step 1에서 작은 폴더·감시 기능을 실제로 만듭니다. 만든 파일과 실행 결과를 보고 Step 2~4로 기능을 이어서 추가합니다.'],
] as const;
export const referenceLinks = {
  openai:[
    {label:'ChatGPT 앱',href:'https://learn.chatgpt.com/docs/app'},
    {label:'Codex 시작 안내',href:'https://learn.chatgpt.com/docs/quickstart'},
    {label:'권한 및 작업 범위 안내',href:'https://learn.chatgpt.com/docs/permission-modes'},
  ],
  runtime:{label:'Node.js 공식 다운로드',href:'https://nodejs.org/en/download'},
};
export const architectureRoles = [
  ['INPUT','입력 파일','사용자가 정리할 파일을 00_수집함에 넣습니다.'],
  ['WATCHER','새 파일 확인','새 파일을 살피고 임시 파일이나 복사 중인 파일은 기다립니다.'],
  ['CLASSIFIER','분류 규칙 확인','확장자와 파일명이 어떤 규칙에 해당하는지 확인합니다.'],
  ['DECISION','자동처리·사람확인 결정','규칙으로 확실하면 자동 처리하고 애매하면 사람에게 돌려줍니다.'],
  ['FILE MANAGER','원본 보관·이동·버전 처리','원본을 먼저 보관하고 목적지로 옮기며 같은 이름은 덮어쓰지 않습니다.'],
  ['DATA','처리 결과 기록','어떤 파일을 처리했는지와 오류를 기록합니다.'],
  ['UI','사용자 확인 화면','결과를 보여주고 사람이 필요한 분류를 선택할 수 있게 합니다.'],
] as const;
export const hierarchyTree = `AI_파일자동정리/
├─ START.bat / STOP.bat    실행·종료
├─ app/                  프로그램 기능
│  ├─ watcher.js         새 파일 확인
│  ├─ classifier.js      분류 규칙 적용
│  ├─ file-manager.js    원본·이동·버전 처리
│  ├─ rules.json         사람이 정한 규칙
│  └─ ui/                사용자 화면
├─ data/                 처리 상태·기록
├─ 00_수집함/            넣을 파일
├─ 00_원본보관/          보관한 원본
├─ 01~11 분류폴더        분류한 결과
└─ 99_분류확인/          사람이 확인할 파일`;
export const representativeRules = [
  ['.dwg','01_CAD도면','확장자 규칙으로 자동 분류'],
  ['.blend','05_3D모델','확장자 규칙으로 자동 분류'],
  ['.mp4','08_영상','확장자 규칙으로 자동 분류'],
  ['PNG / JPG / PDF','파일명 규칙 또는 99_분류확인','알려진 단어가 없거나 여러 분류가 겹치면 사람이 확인'],
  ['.xyz','99_분류확인','현재 기본 자동분류 규칙에 포함되지 않아 사람이 확인'],
] as const;
export const runSteps = [
  '프로그램 ZIP과 SORT_TEST ZIP, 사용방법 README를 내려받습니다.',
  '쓰기 가능한 실습 위치에 프로그램 ZIP을 압축 해제합니다. AI_파일자동정리 폴더 전체를 유지합니다.',
  'START.bat을 더블클릭합니다. 성공 안내에 나온 localhost 주소를 브라우저에서 엽니다.',
  'SORT_TEST ZIP을 별도로 풉니다. 실습파일 11개만 복사해 00_수집함에 넣습니다. README.txt와 manifest.json, 하위 폴더는 넣지 않습니다.',
  '다른 자료 폴더를 사용할 때는 폴더 선택 또는 경로 입력 → 목록 확인 → 파일 가져오기를 사용합니다. 원본은 유지하고 최상위 일반 파일만 수집함으로 복사합니다.',
  '화면의 자동분류 결과와 99_분류확인을 열고 다음 표의 기대 결과와 비교합니다.',
];
export const knownLimits = [
  'Windows 교육용 로컬 프로그램입니다. Node.js 실행환경이 필요하며 Portable Runtime 포함 버전은 아닙니다.',
  '확장자와 파일명 규칙을 사용합니다. 파일 내부의 의미나 설계 사실을 분석하는 AI 분류 프로그램이 아닙니다.',
  '파일 복사 완료는 잠시 상태가 변하지 않는지로 판단합니다. 큰 파일은 복사가 끝난 뒤 넣습니다.',
  '같은 내용의 파일은 중복 안내 후 수집함에 남을 수 있습니다. 필요한 파일인지 확인한 뒤 사용자가 정리합니다.',
  '외부 참조가 연결된 모델 전체를 복구하거나 모든 PC에서 같은 실행 결과를 보증하지 않습니다.',
];
export const takeaways = [
  'AI와 함께 프로그램을 만들 때도 사람이 먼저 요구사항과 허용 범위를 정합니다.',
  '작은 기능부터 구현하고 실행 결과를 보며 같은 프로그램에 기능을 덧붙입니다.',
  '확실한 반복 작업은 자동화할 수 있습니다.',
  '애매한 판단은 사람에게 남길 수 있습니다.',
  '구현한 결과는 직접 실행하고 기대 결과와 비교합니다.',
];
