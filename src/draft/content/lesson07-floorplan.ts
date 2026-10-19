import source from './lesson07-floorplan-source.json';
const neutral=(text:string)=>text.replaceAll('1차 분석 초안입니다.','1차 분석 결과입니다.').replaceAll('검토가 필요한 초안입니다.','검토가 필요한 1차 분석 결과입니다.');
export const floorplanPrompts={
 notebookPlanAnalysisPrompt:neutral(source.notebookPlanAnalysisPrompt),
 floorPlanCriteriaPrompt:neutral(source.floorPlanCriteriaPrompt),
 topViewPrompt:source.topViewPrompt,
 spatialAnalysisPrompt:source.spatialAnalysisPrompt,
 validationPrompt:source.validationPrompt,
 graphvizPrompt:source.graphvizPrompt,
};
export const actualDotCode=source.actualDotCode;
export const reviewRows=source.reviewRows;
export const functionGroups=source.functionGroups;
export const sourcePrinciples=[
 ['01','원문 기준','선을 정리하기 전에 원도면의 공간명·개구부·계단·코어 정보를 기준표로 분리합니다.'],
 ['02','확인 불가 유지','원자료에서 확인되지 않는 높이·재질·조명·성능은 추정하지 않고 확인 불가로 남깁니다.'],
 ['03','결과 재검토','분석표와 이미지를 만든 뒤에도 원도면으로 돌아가 공간명·벽체·문·창·계단·코어를 대조합니다.'],
] as const;
export const criteriaStates=[
 ['KEEP','원본에서 직접 확인되어 유지할 정보','원본 근거를 남기고 후속 작업의 유지 조건으로 사용합니다.'],
 ['REVIEW','흔적·표기는 있으나 단일 평면도로 확정하기 어려운 정보','경계·의미·접근 방식은 점선이나 주석으로 남깁니다.'],
 ['UNKNOWN','현재 도면에서 확인할 수 없는 정보','확인되지 않는 관계·높이·성능은 임의로 만들지 않습니다.'],
] as const;
export const relationshipRules=[
 ['KEEP 직접 연결','원본에서 확인한 직접문·개방 연속만 실선으로 표현합니다.'],
 ['직접 연결 금지','인접해 있어도 직접문이 없으면 연결 통로를 만들지 않습니다. 필요하면 직접문 없음으로 주석을 남깁니다.'],
 ['REVIEW','탕비실·창고 경계, 통로 측 개방영역, P.S 보행 접근과 복도 전체 경계는 추가 확인으로 남깁니다.'],
 ['별도 동선','계단 UP/DN과 엘리베이터 상·하층 이동을 구별합니다. 승강기 출입면의 수평 접근과도 분리합니다.'],
] as const;
export const floorplanDeliverables=[
 '원본 평면도 분석과 최종 확정 도면 기준표',
 '클린 선화 및 Top View 3D 원도면 비교표',
 '검증된 공간 기능·인접 관계·동선 데이터',
 'Graphviz DOT 코드와 2D 공간 관계 다이어그램',
];
export const floorplanPreparationTracks=[
 {title:'트랙 A · 글자·관계 정보 추출',platform:'Google NotebookLM → ChatGPT',text:'글자가 살아 있는 원본 평면도 PDF를 NotebookLM 소스로 올려 실명·문·창호를 1차 판독합니다. ChatGPT에서 원도면과 교차검수하고 사람이 확인해 최종 확정 도면 기준표(텍스트 표)를 만듭니다.'},
 {title:'트랙 B · 클린 선화 준비',platform:'CAD 레이어 정리 / ChatGPT 이미지 편집 · Google AI Studio (Nano Banana)',text:'CAD에서 치수·주석 레이어를 끄거나 이미지 편집 AI로 외곽 축선·치수선·마감표·단면 지시선을 정리합니다. 제공된 01-clean-line.jpg는 자체 제작 도면에 교육용 문자 오류를 의도적으로 넣은 비교본입니다. 모형실 → 이사실, 13인승 → 13연승을 원본·기준표로 교정합니다. 실제 AI 실행에서 같은 오류가 발생했다는 증빙은 아닙니다. NotebookLM의 판독 표와 선화 이미지는 서로 다른 산출물입니다.'},
 {title:'트랙 A + B · 검토용 이미지로 결합',platform:'ChatGPT 이미지 생성 / Google AI Studio (Nano Banana)',text:'원본 PDF를 사실 기준으로 두고, 최종 확정 도면 기준표 텍스트와 클린 선화 이미지를 함께 입력해 구조 검토용 Top View 3D를 만듭니다. 선화만으로 방의 용도를 확정하지 않습니다. 공간 관계 데이터는 원본 PDF와 기준표만 사실 기준으로 사용하며, 생성한 3D 이미지는 제외합니다.'},
] as const;
export const floorplanPlatformFlow=[
 ['Google NotebookLM','원본 PDF → 근거가 있는 1차 분석'],
 ['ChatGPT / Gemini','원도면 교차검수 → 최종 확정 도면 기준표'],
 ['ChatGPT / Gemini','공간 관계 분석·검증 → DOT 코드 생성'],
 ['Viz.js / WebGraphviz','DOT 코드 붙여넣기 → 공간 관계 다이어그램'],
] as const;
export const floorplanStageIO:Record<string,{platform:string;input:string;output:string}>={
 'l07-notebooklm-plan':{platform:'Google NotebookLM',input:'원본 1층 평면도 PDF를 새 노트북의 소스로 업로드',output:'원본 근거 위치와 확인 불가 항목이 있는 1차 분석'},
 'l07-clean-line-criteria':{platform:'ChatGPT / Gemini 텍스트 대화 → ChatGPT 이미지 편집 / Google AI Studio',input:'원본 PDF + NotebookLM 분석으로 기준표 작성 → 원본 도면 이미지로 선화 정리 시도. Top View에는 PDF·기준표·검수한 선화를 함께 첨부',output:'최종 확정 도면 기준표 · 직접 정리한 선화 또는 제공 샘플 · 선택한 경우 구조 검토용 Top View 3D'},
 'l07-spatial-validation':{platform:'ChatGPT / Gemini 텍스트 대화',input:'원본 PDF + 최종 확정 도면 기준표만 사실 기준으로 사용 (3D 이미지 제외)',output:'원도면과 대조한 최종 공간 목록·인접 관계·동선 데이터'},
 'l07-graphviz-diagram':{platform:'ChatGPT / Gemini → Viz.js / WebGraphviz',input:'최종 검증 데이터로 DOT 코드 생성 → 생성된 digraph 코드 전체를 웹 도구에 붙여넣기',output:'DOT 코드와 원도면 근거로 검토한 공간 관계 다이어그램'},
};
export const cleanLinePrompt=`목적
첨부한 원본 1층 오피스 평면도에서 구조와 공간 배치를 유지하면서, 선을 읽기 쉬운 2D 흑백 클린 선화(Clean Line)를 만들어 주세요.

맥락
복잡한 도면을 확대하는 것만으로는 치수선·단면 지시선·벽선의 겹침과 글자 왜곡을 해결할 수 없습니다. 이 선화는 후속 검토용 입력 보조자료이며 원도면과 최종 확정 도면 기준표를 대체하지 않습니다.

입력자료
원본 도면 이미지 00-office-floorplan-original.png(또는 comfy-reference-before.png)를 사용합니다. 최종 확정 도면 기준표가 있으면 함께 첨부하되, 충돌할 때는 원본의 선·문·창·문자·기호를 우선합니다.

작업 단계
1. 첨부한 교육용 원본은 처음부터 가로 정방향입니다. 원본 PDF·PNG의 방향과 배치를 그대로 유지하고 회전하지 마세요.
2. 도면 바깥의 축선(X1~X4, Y1~Y4와 부가 축 표기), 외곽 치수선, 상하·좌우의 지시선 마감표 박스를 제거합니다.
3. 도면과 겹치는 대각선 단면·지시선만 구분해 제거합니다. 벽선·계단선·구조선까지 함께 지우지 마세요. 겹친 부분이 판독되지 않으면 임의로 복원하지 말고 별도 확인 항목으로 남깁니다.
4. 벽체·문·창호·계단·승강기·코어·외부 휴게데크 경계가 읽히는 흑백 선화로 정리하고 원본과 다시 비교합니다.

조건·제한
벽체 두께, 공간 구획, 출입문 위치·개폐 방향·개폐호, 창호, 계단실, 엘리베이터, P.S, 외부 휴게데크 경계를 임의로 변경·추가·합치지 마세요. 실내 가구 배치도 재설계하지 마세요.
남길 실명과 숫자는 원문대로 유지하세요. 모형실·소장실·계단실·계단참·13인승을 이사실·사장실·계단창·13연승·1.5인승처럼 추측해 다시 쓰지 마세요. 읽기 어려운 글자는 새 글자로 만들지 말고 판독 불가로 별도 기록하세요.
미확정 높이·단차·재질·성능·법규 적합성을 생성하지 마세요. 실측 도면·CAD 원본을 대체하는 결과라고 설명하지 마세요.

출력 형식
정방향 가로 배치의 2D 흑백 클린 선화 이미지 1장과, 제거한 주석 / 유지 확인 / 추가 확인이 필요한 부분을 짧게 정리해 주세요.

검토 기준
원본과 벽·문·창·계단·코어·휴게데크의 위치 관계가 같은지, 문 개폐호가 유지되는지, 주석을 제거하며 구조선까지 사라지지 않았는지 확인하세요. 남은 실명·숫자를 원본 및 기준표와 대조하세요. 글자·선의 완전 보존을 지시만으로 보장했다고 판단하지 마세요.`;
export const floorplanTextChecks=[
 ['모형실','이사실','이사실','원본·기준표·DOT에서는 모형실 사용'],
 ['소장실','소장실','사장실','원본·기준표·DOT에서는 소장실 사용'],
 ['계단참','계단참','계단창','계단참과 계단실의 역할을 원본에서 구분'],
 ['13인승','13연승','1.5인승','원본 표기를 우선하고 이미지에서 승강기 사양을 확정하지 않음'],
] as const;
