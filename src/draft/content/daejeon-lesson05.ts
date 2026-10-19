export const lesson05Title = '제5차시 · 초기 기획 레이아웃 검토를 위한 2D 평면도 판독과 도면 인페인팅 실무';
export const lesson05Schedule='2026-10-29(목) · 18:00~21:00 · 3시간';
export const lesson05Sections=[
 {id:'l05-recap',title:'사진 인페인팅에서 2D 도면 인페인팅으로 이어가기',minutes:5,action:'사진과 도면의 수정 기준을 구분합니다.',reason:'도면은 이미지의 인상과 함께 선·문자·기호의 연결을 확인해야 합니다.',next:'도면의 고정 기준'},
 {id:'l05-elements',title:'평면도의 구성 요소 읽기',minutes:10,action:'벽·기둥·문과 개폐호·창·가구·치수·기호를 찾습니다.',reason:'수정 뒤 대조할 원본 기준을 먼저 확보하기 위해서입니다.',next:'판독 항목 목록'},
 {id:'l05-inputs',title:'원본 CAD/PDF와 이미지의 역할·비식별화',minutes:10,action:'기준 파일과 업로드할 범위를 구분합니다.',reason:'원본과 식별정보를 보호하며 필요한 자료만 제공하기 위해서입니다.',next:'허용된 입력자료'},
 {id:'l05-reading',title:'AI로 평면도 분석하기',minutes:15,action:'직접 확인·AI 해석·판독 불가를 분리합니다.',reason:'추정한 값을 확인된 정보와 구분하기 위해서입니다.',next:'원본과 대조할 분석 초안'},
 {id:'l05-correct',title:'문자·치수 오독과 개구부 누락을 원도면과 대조',minutes:10,action:'원자료를 보며 빠진 정보와 오독을 정리합니다.',reason:'치수·축선·문·창의 위치를 같은 기준으로 읽기 위해서입니다.',next:'검토한 도면 읽기 메모'},
 {id:'l05-principle',title:'유지 영역과 부분 수정 영역 나누기',minutes:8,action:'변경 대상과 원본으로 남길 선을 구분합니다.',reason:'가구를 바꾸는 동안 주변 벽·치수·문자의 변화를 함께 살펴야 합니다.',next:'가구 수정의 경계'},
 {id:'l05-mask',title:'유지할 구조선과 바꿀 가구 영역 지정',minutes:10,action:'수정 대상을 표시하고 실제 편집 영역을 정합니다.',reason:'범위 안내 이미지와 편집 도구의 선택 영역을 맞추기 위해서입니다.',next:'부분 입력과 마스크'},
 {id:'l05-prompt-a',title:'가구·집기 부분 수정 Prompt',minutes:10,action:'선택한 도면의 가구 수정 요청을 준비합니다.',reason:'가구 수·중심·크기와 주변 유지 조건을 함께 전달하기 위해서입니다.',next:'내 실행 요청'},
 {id:'l05-run-a',title:'가구 부분 수정 실행·벽체·개구부·치수선 검수',minutes:22,action:'부분 출력과 전체 재반영 결과를 원본과 대조합니다.',reason:'목표 가구와 수정 영역 밖의 선을 함께 확인하기 위해서입니다.',next:'실제 출력과 비교 메모'},
 {id:'l05-crop-flow',title:'전체 확인 → 부분 확대 → 영역 지정 → 부분 수정 → 전체 재반영',minutes:10,action:'선택한 평면도에서 다섯 단계의 입력과 결과를 연결합니다.',reason:'부분 도면의 원래 위치와 전체 도면의 관계를 유지하기 위해서입니다.',next:'수정 부분의 위치·경계'},
 {id:'l05-door',title:'6석 회의실 결과에 출입문 D2 이동 이어가기',minutes:15,action:'가구 수정 결과에서 기존 D2를 닫고 같은 경량벽체 아래쪽으로 옮깁니다.',reason:'앞 단계의 6석과 새 문 위치를 하나의 도면에 연결하기 위해서입니다.',next:'문·개폐호·D2 표기와 6석 검토'},
 {id:'l05-overlay',title:'전체 재반영과 원본 중첩 비교',minutes:15,action:'같은 위치·방향으로 맞추고 경계와 주변을 대조합니다.',reason:'부분 결과와 전체 도면의 선이 이어지는지 확인하기 위해서입니다.',next:'정합·불일치 기록'},
 {id:'l05-next',title:'도면 인페인팅의 적용 범위와 다음 단계',minutes:10,action:'검토 메모·실제 Prompt·결과·원본을 함께 보존합니다.',reason:'검토한 평면을 다음 입체화·조닝 단계에 전달하기 위해서입니다.',next:'3D 입체화·조닝으로 넘길 기준'},
] as const;
export const lesson05Periods=[
 {id:'l05-period-1',title:'평면도 읽기·판독 검증',time:'18:00~18:50',sections:lesson05Sections.slice(0,5)},
 {id:'l05-period-2',title:'구조는 고정하고 가구 부분 수정',time:'19:00~19:50',sections:lesson05Sections.slice(5,9)},
 {id:'l05-period-3',title:'부분 확대·문 이동·전체 재반영',time:'20:00~20:50',sections:lesson05Sections.slice(9)},
] as const;
export const lesson05Boundary='이미지 기반 도면 수정은 초기 기획·레이아웃 대안 검토에 사용합니다. 실제 설계 적용에는 원도면·현장 치수와 법규·구조·소방·설비 등 해당 분야의 검토가 필요합니다.';
