export const lesson03Title = '제3차시 · 초기 기획을 위한 실내 부분 인페인팅과 디자인보드 기반 래피드 콘셉트 도출';
export const lesson03Schedule = '2026-10-27(화) · 18:00~21:00 · 3교시 × 50분';
export const lesson03Lead = '한 공간의 바꿀 부분을 정하고, 수정 이미지에서 읽은 디자인 방향을 보드와 새로운 실내 콘셉트로 이어갑니다.';
export const lesson03Sections = [
  {id:'l03-recap',title:'지난 차시에서 오늘로 이어가기',minutes:5,action:'지난 차시의 작업 원칙을 짧게 돌아봅니다.',reason:'이미지 작업에서도 사람이 기준을 정하고 결과를 확인하기 위해서입니다.',next:'오늘의 연속 작업 흐름'},
  {id:'l03-space',title:'오늘 사용할 기준 공간 선택',minutes:8,action:'다섯 공간 중 하나를 골라 오늘 계속 사용합니다.',reason:'재질이 바뀌어도 같은 공간인지 비교하기 위해서입니다.',next:'구조와 카메라의 기준 이미지'},
  {id:'l03-scope',title:'바꿀 부분과 유지할 부분 정하기',minutes:10,action:'기존 면 한 곳과 유지할 요소를 정합니다.',reason:'전체 재설계 대신 변경 범위를 좁혀 요청하기 위해서입니다.',next:'유지·변경 조건'},
  {id:'l03-material',title:'재질 참고 이미지 선택 및 Prompt 작성',minutes:10,action:'원하는 인상과 적용 목적에 맞는 재질 한 개를 고릅니다.',reason:'참고자료의 색상·무늬·질감을 지정한 면에 연결하기 위해서입니다.',next:'공간 일부 수정 Prompt'},
  {id:'l03-first-edit',title:'공간 일부 수정 실행·원본과 비교',minutes:17,action:'Nano Banana에서 실행하고 원본과 함께 봅니다.',reason:'목표한 수정과 의도하지 않은 변화를 구분하기 위해서입니다.',next:'재질을 적용한 수정 공간'},
  {id:'l03-board',title:'디자인 방향 보드란?',minutes:7,action:'보드에 무엇을 담고 어디에 사용할지 읽습니다.',reason:'공간에서 찾은 디자인 언어를 다음 생성에 전달하기 위해서입니다.',next:'보드의 구성 기준'},
  {id:'l03-analysis',title:'수정된 공간에서 디자인 요소 찾기',minutes:10,action:'관찰·제공 정보·추정·제안을 구분합니다.',reason:'이미지의 인상을 실제 제품 정보로 확정하지 않기 위해서입니다.',next:'보드에 사용할 디자인 요소'},
  {id:'l03-meta',title:'디자인보드용 Prompt를 만드는 Meta Prompt',minutes:10,action:'AI에게 분석과 보드용 요청문 초안을 부탁합니다.',reason:'이미지 생성 전에 디자인 언어와 요청을 정리하기 위해서입니다.',next:'분석 결과와 Prompt 초안'},
  {id:'l03-prompt-review',title:'AI가 만든 Prompt 초안 확인·수정',minutes:8,action:'근거 없는 정보와 유지·변경 조건을 읽고 고칩니다.',reason:'AI의 초안을 사람이 검토한 실행 요청으로 만들기 위해서입니다.',next:'실제 보드 생성 Prompt'},
  {id:'l03-board-generate',title:'디자인 방향 보드 생성·결과 확인',minutes:15,action:'검토한 Prompt로 보드 한 장을 만듭니다.',reason:'재질·색상·조명·분위기를 시각적 기준으로 모으기 위해서입니다.',next:'다음 방향에 사용할 보드'},
  {id:'l03-board-edit-principle',title:'디자인 방향을 보드 전체에 일관되게 적용',minutes:8,action:'대표 공간·재질 카드·팔레트를 같은 방향으로 갱신합니다.',reason:'보드의 시각 제안이 서로 충돌하지 않게 하기 위해서입니다.',next:'다중 표면으로 확장할 디자인 방향'},
  {id:'l03-board-demo',title:'디자인 방향 확장 · Dark Walnut에서 Natural Oak로',minutes:10,action:'대표 공간과 카드·팔레트의 변경을 함께 비교합니다.',reason:'공간과 Reference가 같은 방향을 가리켜야 하기 때문입니다.',next:'따뜻한 전체 공간 콘셉트'},
  {id:'l03-new-concept',title:'수정된 방향을 기준 공간에 다시 적용하기',minutes:20,action:'처음 공간과 보드, 변경 재질을 역할별로 첨부합니다.',reason:'같은 공간에 새로운 디자인 방향을 적용하기 위해서입니다.',next:'새로운 공간 콘셉트'},
  {id:'l03-compare',title:'원본과 새로운 콘셉트 비교',minutes:8,action:'여섯 마감·조명 변화와 공간의 유지 요소를 나란히 봅니다.',reason:'디자인 방향의 적용과 기준 공간 유지를 확인하기 위해서입니다.',next:'다음 작업에 남길 비교 메모'},
  {id:'l03-next',title:'실행 기록과 다음 차시 연결',minutes:4,action:'실제 Prompt·결과·실행 상태를 저장합니다.',reason:'다음 차시에서 수정 과정을 이어갈 수 있도록 하기 위해서입니다.',next:'Exterior Inpainting과 대안 비교'},
] as const;
export type Lesson03Section = typeof lesson03Sections[number];
export const lesson03Periods = [
  {id:'l03-period-1',title:'실내 공간의 한 부분 수정하기',sections:lesson03Sections.slice(0,5)},
  {id:'l03-period-2',title:'수정 공간에서 디자인 방향 보드 만들기',sections:lesson03Sections.slice(5,10)},
  {id:'l03-period-3',title:'보드의 변경 제안으로 새 콘셉트 만들기',sections:lesson03Sections.slice(10)},
] as const;
export const lesson03Flow = ['디자인 적용 전 기준 공간','바꿀 부분과 유지할 부분 정하기','재질을 적용해 공간 일부 수정하기','수정된 공간에서 디자인 요소 찾기','디자인 방향 보드 만들기','보드의 대표 공간·재질·팔레트 함께 갱신 · 심화 예제/선택','수정한 디자인 방향을 공간에 다시 적용하기','결과 확인 및 다음 차시 연결'];
export const commonKeep = ['카메라와 화각','벽·문·창호와 공간 배치','데스크·좌석·주요 가구의 위치와 수','조명기구 위치','다른 마감 영역과 원본 화면 비율'];
export const analysisGroups = [
  {title:'이미지에서 직접 관찰',example:'짙은 갈색 목무늬가 보입니다.',description:'보이는 색·무늬·형태와 그 위치를 말합니다.'},
  {title:'사용자가 제공한 정보',example:'Dark Walnut 참고 이미지를 사용했습니다.',description:'입력자료의 이름과 실제 요청 조건을 구분해 기록합니다.'},
  {title:'이미지로 확정할 수 없는 추정',example:'실제 월넛 제품이 시공됐는지는 알 수 없습니다.',description:'제품·원단·치수·가격·성능·조도·실제 색온도를 확정하지 않습니다.'},
  {title:'다음 작업을 위한 디자인 제안',example:'Natural Oak를 다음 방향에서 적용해봅니다.',description:'현재 관찰한 사실과 다음에 시도할 변경을 구분합니다.'},
];
export const recordStages = [
  {name:'재질을 적용한 수정 공간',promptId:'l03-my-first-edit'},
  {name:'디자인 방향 보드',promptId:'l03-board-example-prompt'},
  {name:'새로운 공간 콘셉트',promptId:'l03-my-new-concept'},
] as const;
export interface WorkInput {space:string;target:string;intent:string;material:string;nextMaterial:string;}
export function workPrompts(input:WorkInput) {
  const target=input.target.trim() || '[바꿀 기존 면 한 곳]';
  const intent=input.intent.trim() || '[원하는 인상과 적용 목적]';
  const space=input.space || '[선택한 기준 공간]';
  const material=input.material || '[선택한 재질]';
  const nextMaterial=input.nextMaterial || '[다음 변경 재질]';
  const first = `목적
${space}의 ${target} 한 곳에 ${material} 참고자료의 색상·무늬·질감을 적용한다.

맥락
${intent}. 실내 공간의 기초 이미지 수정이며 가구 배치나 구조를 새로 설계하지 않는다.

입력자료
이미지 1: 선택한 디자인 적용 전 기준 공간. 구조·카메라·배치의 기준이다.
이미지 2: ${material} 재질 참고자료. 색상·무늬·질감만 참고하고 이미지 안의 글자나 공간 배치는 가져오지 않는다.

작업 단계
1. 원본에서 ${target}의 경계와 가려진 부분을 확인한다.
2. 지정한 기존 면의 재질 표현만 바꾼다.
3. 원본과 같은 시점과 화면 비율의 수정 이미지 한 장을 만든다.

조건·제한
${commonKeep.join(' / ')}을 유지한다.
지정한 면 밖의 가구·조명·마감·공간 형태를 바꾸지 않는다.
새 벽·문·창·가구·장식·사람·글자·로고를 추가하지 않는다.
재질의 실제 제품·규격·가격·성능·시공법을 확정하지 않는다.

출력 형식
원본과 같은 화면 비율의 현실적인 실내 이미지 1장.

검토 기준
지정한 면에 의도한 재질 방향이 적용됐는가?
카메라·문·창호·가구 위치와 수가 유지됐는가?
요청하지 않은 의미 있는 변화나 추가 물체가 있는가?`;
  const final = `목적
${space}에 따뜻한 우드·웜 스톤·오트밀 방향을 적용한 새로운 공간 콘셉트를 만든다. 한 면 수정에서 여러 기존 표면의 마감과 조명 인상으로 범위를 확장한다.

맥락
디자인 방향 보드의 대표 공간·카드·팔레트와 같은 방향을 적용한다. 구조와 가구 배치를 새로 설계하지 않는다.

입력자료
이미지 1: 처음 기준 공간. 구조·카메라·문·창호·가구 배치와 수의 우선 기준이다.
이미지 2: 일관되게 수정한 디자인 방향 보드. 마감·색감·조명 인상만 참고한다.
이미지 3: ${nextMaterial} 재질 Reference. 색상·무늬·질감만 참고한다.

작업 단계
1. 기존 ${target}에 ${nextMaterial} 방향을 적용한다.
2. 기존 데스크가 있다면 외곽과 위치 그대로 밝은 웜 스톤과 우드 디테일로 마감을 바꾼다.
3. 기존 바닥 분할과 높이를 기준으로 샌드 베이지·웜 스톤 타일 인상을 적용한다.
4. 기존 소파·좌석에는 오트밀/웜 크림 패브릭, 기존 테이블에는 내추럴 우드·웜 메탈 인상을 적용한다. 없는 가구는 추가하지 않는다.
5. 기존 문은 같은 문틀·손잡이·위치의 우드 또는 웜 토프 마감으로, 주변 벽은 부드러운 웜 화이트로 정리한다.
6. 기존 기구 위치와 수를 유지하며 약 3000K 방향의 따뜻한 빛과 벽면 워싱 인상을 적용한다.

조건·제한
카메라·화각·공간 높이·벽체·문·창호·주요 가구의 위치와 수·큰 형태를 엄격히 유지한다.
변경은 지정한 기존 표면의 마감·색감·조명 인상에 한정한다. 새 벽·문·창·가구·조명기구·장식·사람·글자·로고를 추가하지 않는다.
보드 속 작은 공간의 구도나 크롭을 복사하지 않고 보드를 공간 안에 붙이지 않는다.
재질의 실제 제품·가격·규격·성능·시공법과 색온도·조도를 이미지로 확정하지 않는다.

출력 형식
원본과 같은 시점의 현실적인 실내 콘셉트 이미지 한 장.

검토 기준
벽뿐 아니라 데스크·바닥·좌석·테이블·문·벽색·조명까지 의도한 방향으로 달라졌는가?
보드의 카드·팔레트와 공간의 방향이 일치하는가?
원본의 구조·카메라·문·창호·가구 위치와 수가 유지됐는가?
요청 밖 변화와 추가 물체·조명기구가 있으면 별도로 기록한다.`;
  return {first,final};
}
