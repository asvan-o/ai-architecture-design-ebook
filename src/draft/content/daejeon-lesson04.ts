import {lesson04Base01Prompts} from './lesson04-generation-prompts';
export const lesson04Title = '제4차시 · 건축 외관 인페인팅 실무와 초기 기획 래피드 대안 도출·비교';
export const lesson04Schedule='2026-10-28(수) · 18:00~21:00 · 3시간';
export const lesson04Sections=[
  {id:'l04-recap',title:'실내에서 외관으로 이어가기',minutes:5,action:'실내의 유지·변경 원칙을 외관으로 연결합니다.',reason:'외관에서는 개구부와 주변 맥락까지 함께 보존해야 합니다.',next:'외관 기준 이미지'},
  {id:'l04-base',title:'기준 건물과 자료의 역할 읽기',minutes:8,action:'기준 건물 하나와 필요한 참고자료를 고릅니다.',reason:'구조 기준과 표면 참고를 혼동하지 않기 위해서입니다.',next:'오늘 계속 사용할 같은 원본'},
  {id:'l04-scope',title:'클린업 제거와 유지·변경 경계 설정',minutes:12,action:'방해물만 제거한 뒤 표면 변경과 고정 영역을 구분합니다.',reason:'정돈 단계와 디자인 변경 단계를 섞지 않기 위해서입니다.',next:'클린업 결과와 표면 수정 범위'},
  {id:'l04-prompt-a',title:'외장 마감과 포털을 바꾸는 7단 Prompt',minutes:10,action:'자료 역할과 수정 범위를 요청문에 연결합니다.',reason:'말로 정한 조건을 실행 가능한 요청으로 만들기 위해서입니다.',next:'첫 수정안 요청'},
  {id:'l04-run-a',title:'외관 부분 수정 A 실행',minutes:15,action:'선택한 원본에서 첫 수정안을 생성합니다.',reason:'목표한 표면 수정과 원본 유지 여부를 함께 보기 위해서입니다.',next:'첫 결과 또는 실행 상태'},
  {id:'l04-check-a',title:'첫 결과에서 요청 밖 변화 보기',minutes:8,action:'원본·Prompt·결과를 나란히 대조합니다.',reason:'원하는 변화가 보여도 다른 부분이 달라질 수 있습니다.',next:'유지 불일치 메모'},
  {id:'l04-strategy-b',title:'다른 외관 전략의 범위 정하기',minutes:10,action:'같은 원본에서 다른 재료 조합과 표면 전략을 정합니다.',reason:'색만 다른 결과보다 재료 조합과 목적을 비교하기 위해서입니다.',next:'독립된 두 번째 수정 범위'},
  {id:'l04-prompt-b',title:'교체형 B와 캐노피 국소 보완 A2',minutes:12,action:'같은 원본의 B와 A의 한 면 보완 A2를 읽습니다.',reason:'독립 대안 비교와 선택한 결과의 보완은 입력 역할이 다릅니다.',next:'교체·국소 보완의 실제 조건'},
  {id:'l04-run-b',title:'A/B 비교와 조경·보행부 추가 합성',minutes:20,action:'A/B를 비교한 뒤 A에 식재를 추가합니다.',reason:'표면 교체와 새 요소 추가를 분리하기 위해서입니다.',next:'주간 조경 완성안'},
  {id:'l04-gemini',title:'주간 완성안에서 석양·경관조명으로 확장',minutes:10,action:'같은 주간 완성안의 시간대와 빛을 비교합니다.',reason:'시각 제안과 실제 조명 성능 검토를 구분하기 위해서입니다.',next:'주간·석양 비교 세트'},
  {id:'l04-refine',title:'스케치 래피드 콘셉트와 다각도 뷰',minutes:15,action:'선화·부분 보완과 입구·코너·보행자·반조감 시점을 비교합니다.',reason:'새 시점의 재료 일관성과 형상 재추정을 따로 보기 위해서입니다.',next:'메인·다각도 대조 메모'},
  {id:'l04-compare',title:'기준 건물·수정안·보완안 한눈에 비교',minutes:15,action:'목적 달성·유지 조건·요청 밖 변화로 비교합니다.',reason:'보완안이 항상 더 낫다고 가정하지 않기 위해서입니다.',next:'선택 이유와 남은 한계'},
  {id:'l04-next',title:'선택 확장과 다음 차시 예고',minutes:10,action:'실제 자료·요청문·결과·상태를 정리합니다.',reason:'다음 설계 단계에서 판단 근거를 이어가기 위해서입니다.',next:'검토한 외관 수정 기록'},
] as const;
export const lesson04Periods=[
  {id:'l04-period-1',title:'클린업 → 표면 교체 A',time:'18:00~18:50',sections:lesson04Sections.slice(0,5)},
  {id:'l04-period-2',title:'교체 B·국소 보완 → 조경 추가',time:'19:00~19:50',sections:lesson04Sections.slice(5,9)},
  {id:'l04-period-3',title:'석양 조명 → 스케치·서브 시점 → 선별',time:'20:00~20:50',sections:lesson04Sections.slice(9)},
] as const;
export const lesson04Next='다음 차시에는 사진에서 2D 평면도로 대상을 옮겨, 도면을 읽고 지정 영역만 부분 수정한 뒤 전체 원본과 대조합니다.';
export interface ExteriorBase {id:string;type:string;keep:string;change:string;}
export function exteriorWorkPrompt(base:ExteriorBase,variant:'A'|'B'){
 if(base.id==='EXT-BASE-01')return lesson04Base01Prompts[variant];
 const targets:Record<string,[string,string]>={
  'EXT-BASE-02':['좌측 진입부의 기존 수직 루버 마감만 Natural Oak 방향으로 바꾼다. 부재의 위치·간격·수를 바꾸지 않는다.','좌측 진입부의 루버는 원본 그대로 두고, 정면 기존 불투명 벽 한 구획만 밝은 웜그레이 스톤 인상으로 바꾼다. 새 루버와 창을 만들지 않는다.'],
  'EXT-BASE-03':['코너 입구 양옆 기존 불투명 포털 벽 한 구획만 따뜻한 목재 인상으로 바꾼다.','코너 포털과 캐노피는 원본 그대로 두고, 양쪽 쇼윈도 위 기존 빈 사인 면의 색만 짙은 무채색으로 정리한다. 글자와 새 간판 구조는 넣지 않는다.'],
 };
 const target=targets[base.id][variant==='A'?0:1];
 return `첨부 이미지: ${base.id}.png (편집 대상·건물과 카메라 기준)${base.id==='EXT-BASE-02'&&variant==='A'?' + m-24-natural-oak.png (색·결 참고)':''}

목적
${base.type}의 기존 외관 일부를 수정한 대안 ${variant}를 만든다.

맥락
기준 건물은 바꾸지 않고 기존 표면의 적용 범위와 인상을 비교하는 교육용 시각 제안이다.

입력자료
선택한 ${base.id} 원본이 유일한 건물·카메라 기준이다. A/B 모두 이 원본에서 독립 실행한다. Reference를 실제로 첨부했다면 파일 이름과 색·무늬·질감 또는 요소 참고 역할을 적는다.

작업 단계
원본에서 기존 표면의 시작과 끝을 먼저 확인한다. ${target} 수정 범위 밖은 원본으로 남긴다.

조건·제한
유지: ${base.keep}
새 층·문·창·루버·기둥·조명·조경·사람·차량·글자·로고를 추가하지 않는다. Reference의 건물 구조와 배치를 옮기지 않는다.
이미지로 법규 적합성·구조 안전·실제 시공비·단열·방화·내후 성능을 확정하지 않는다.

출력 형식
원본과 같은 시점·프레이밍의 현실적인 외관 이미지 한 장. 주석·비교판 없음.

검토 기준
지정한 표면만 달라졌는가? 매스·층수·문·창·카메라·주변 맥락이 유지됐는가? 요청 밖 변화는 무엇인가?`;
}
