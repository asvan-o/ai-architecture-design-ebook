import prompts from './lesson07-prompts.json';
export const lesson07Title = '제7차시 · 3D Gaussian Splatting 시점 탐색과 이미지 고도화·고화질 렌더링';
export const lesson07Meta={revision:'DJ-L07-GAUSSIAN-UPSCALE/revision-1',date:'2026.05.16 (토)',schedule:'10:00~17:00 · 점심 12:00~13:00',durationMinutes:300,status:'design-pending',reviewStatus:'instructor-review'} as const;
export interface Lesson07Section {id:string;title:string;minutes:number;action:string;reason:string;next:string;}
export const lesson07Sections: readonly Lesson07Section[]=[
 {id:'l07-recap',title:'제6차시에서 다각도 시점 탐색으로',minutes:15,action:'같은 평면에서 만든 입체·분해도·조닝과 대조 메모를 돌아봅니다.',reason:'이미지 한 장은 카메라를 자유롭게 돌릴 수 있는 3D 데이터와 다릅니다.',next:'시점을 확장할 기준 이미지와 고정할 공간 관계'},
 {id:'l07-mesh-vs-gs',title:'Polygon Mesh · Point Cloud · Gaussian Splatting',minutes:20,action:'면·점·부드러운 3D 요소로 장면을 표현하는 방식을 비교합니다.',reason:'겉보기 입체감과 편집 가능한 설계정보를 구별하기 위해서입니다.',next:'목적에 맞는 3D 표현 선택 기준'},
 {id:'l07-gs-role',title:'Gaussian의 역할 · 시점을 탐색하는 중간 다리',minutes:15,action:'입력에서 보이는 면과 새 시점에서 추정되는 면을 나눕니다.',reason:'시점 탐색 결과를 실제 후면·측면의 증거로 오해하지 않기 위해서입니다.',next:'후속 현실화에 사용할 시점 선정 기준'},
 {id:'l07-comfyui-env',title:'Stability Matrix · ComfyUI 설치와 실행 환경 구축',minutes:25,action:'패키지를 설치하고 템플릿의 입력·모델·미리보기·저장 경로를 확인합니다.',reason:'브라우저 화면과 연산을 수행하는 로컬 서버의 역할을 구분하기 위해서입니다.',next:'실행 환경과 입력 이미지를 연결한 워크플로우'},
 {id:'l07-gs-practice',title:'실습 1 · TripoSplat 템플릿 읽기와 Gaussian 시점 탐색',minutes:15,action:'입력 이미지를 선택하고 템플릿 설정과 시점 캡처를 관찰합니다.',reason:'기준 이미지의 공간 관계가 새 시점에서 어떻게 보이는지 살피기 위해서입니다.',next:'후속 작업에 사용할 시점과 관찰 메모'},
 {id:'l07-gs-inspection',title:'Gaussian 결과에서 후속 작업용 시점 선택과 검수',minutes:10,action:'번짐·늘어짐·빈 곳을 표시하고 사용할 시점과 제외할 시점을 정리합니다.',reason:'보기 좋은 구도와 근거가 충분한 구도는 다를 수 있습니다.',next:'현실화에 사용할 캡처와 불확실성 메모'},
 {id:'l07-render-bridge',title:'거친 캡처를 현실형 제안 이미지로 연결하기',minutes:15,action:'카메라·볼륨을 유지할 기준과 정돈할 재질 표현을 나눕니다.',reason:'입자 번짐 제거가 공간 재설계로 바뀌지 않도록 합니다.',next:'유지·정돈·금지 조건'},
 {id:'l07-five-routes',title:'실제 비교 자산 5경로 · 같은 기준으로 읽기',minutes:20,action:'다섯 경로의 카메라·개구부·가구·조명 차이를 대조합니다.',reason:'도구 이름보다 관찰 가능한 결과를 기준으로 선택하기 위해서입니다.',next:'선택 이유와 유지되지 않은 요소 기록'},
 {id:'l07-render-compare',title:'캡처 원본과 현실화 결과의 형태·질감 대조',minutes:15,action:'선명도와 함께 벽·문·창·가구 위치의 변화를 기록합니다.',reason:'질감 개선이 형태 보존을 증명하지 않습니다.',next:'선택 후보와 다시 고칠 위치'},
 {id:'l07-render-prompt',title:'실습 2 · ChatGPT · Gemini로 Gaussian 캡처 현실화하기',minutes:25,action:'실제 캡처를 첨부하고 같은 구도의 현실형 이미지를 요청합니다.',reason:'구조화한 조건을 실행과 비교에 함께 사용하기 위해서입니다.',next:'실제 실행 Prompt와 첫 결과 또는 실행 상태'},
 {id:'l07-partial-fix',title:'실습 3 · ChatGPT · Gemini 인페인팅으로 오류 영역만 부분 보정하기',minutes:25,action:'선택한 의자 연결부를 좁게 보정하고 주변 영역도 대조합니다.',reason:'작은 수정 요청도 전체 이미지 변화를 일으킬 수 있습니다.',next:'보정 전후와 수정 대상 밖의 변화 메모'},
 {id:'l07-upscale-principle',title:'단순 확대와 AI 초해상화의 차이',minutes:20,action:'보간·학습 기반 초해상화·생성형 보완의 차이를 읽습니다.',reason:'늘어난 이미지 크기와 사실 정보의 증가를 구분하기 위해서입니다.',next:'업스케일 검수 위치와 비교 기준'},
 {id:'l07-comfyui-upscale',title:'ComfyUI Upscale 경로와 같은 위치 확대 비교',minutes:30,action:'실제 워크플로우의 입력·크기 조정·두 모델·저장을 읽습니다.',reason:'서로 다른 전처리와 모델 결과를 공정하게 비교하기 위해서입니다.',next:'전체 구도와 같은 부분의 확대 비교 메모'},
 {id:'l07-openvino-sr1033',title:'실습 4 · OpenVINO SR1033 CPU 세 배 확대',minutes:30,action:'독립 실행환경에서 input → 실행 → output을 확인합니다.',reason:'외장 GPU가 없는 환경에서도 CPU 초해상화 결과를 비교합니다.',next:'원본·Bicubic·SR1033 세 장과 실행 기록'},
 {id:'l07-final-check',title:'동일 원본 해상도 비교와 사람 직접 대조(HITL) 검수',minutes:15,action:'단계별 입력·실제 결과·변화·미확정 항목을 함께 정리합니다.',reason:'후처리할수록 원자료와의 차이를 추적해야 합니다.',next:'제안용 이미지와 추가 전문 검토 항목'},
 {id:'l07-handover',title:'시점 탐색·현실화·업스케일 산출물 정리와 도면 판독 연결',minutes:5,action:'표현 자료와 실제 도면 데이터를 구별해 다음 단계의 준비물을 정리합니다.',reason:'이미지의 완성도를 모델·설계정보의 완성도로 오해하지 않기 위해서입니다.',next:'실무 도면 클린 선화 전처리와 판독 기준표 작성'},
];
export const lesson07Parts=[
 {id:'l07-part-1',title:'제6차시 연결 복습과 3D Gaussian Splatting 원리 이해',time:'10:00~10:50',sections:lesson07Sections.slice(0,3)},
 {id:'l07-part-2',title:'ComfyUI 기반 생성 흐름과 다각도 시점 탐색',time:'11:00~11:50',sections:lesson07Sections.slice(3,6)},
 {id:'l07-part-3',title:'크로스 제너레이션 · 현실화 경로와 형태·품질 비교',time:'13:00~13:50',sections:lesson07Sections.slice(6,9)},
 {id:'l07-part-4',title:'현실화 렌더링 실행과 국부 오류 인페인팅 보정',time:'14:00~14:50',sections:lesson07Sections.slice(9,11)},
 {id:'l07-part-5',title:'제안서용 고화질 렌더링 · ComfyUI Upscale',time:'15:00~15:50',sections:lesson07Sections.slice(11,13)},
 {id:'l07-part-6',title:'OpenVINO CPU 초해상화와 최종 렌더링 검수',time:'16:00~16:50',sections:lesson07Sections.slice(13,16)},
] as const;
export const lesson07Prompts=prompts;
export const lesson07Boundary='Gaussian 결과는 단일 이미지에서 추정한 시점 탐색용 표현입니다. 보이지 않던 측면·후면은 실제 공간의 증거가 아닙니다. 현실화·부분 보정·업스케일 결과는 제안용 시각자료이며 CAD/BIM 정밀 모델, 실측 도면, 구조·법규 검토나 시공 확정안을 대신하지 않습니다.';
export const lesson07Routes=[
 ['route-01','ChatGPT 이미지 경로','왼쪽 창틀·천장 조명·식탁 앞 의자를 입력과 대조합니다.'],
 ['route-02','Gemini · Nano Banana 프롬프트 경로','창 분할·우측 뒤 개구부와 식탁 재질의 변화를 살핍니다.'],
 ['route-03','Gemini · Nano Banana 에이전트 경로','천장·주방 상부장·창틀의 추가 및 재해석을 확인합니다.'],
 ['route-04','VIBE3D 렌더 경로','카메라·가구 수와 재질 경계의 일관성을 확인합니다.'],
 ['route-05','VIBE3D Relight 경로','밝기와 함께 구조·재질이 달라지지 않았는지 살핍니다.'],
] as const;
export const lesson07Checks=[
 ['3DGS 캡처','원래 입력·시점·추정 영역','후면·측면의 실제 형상 및 실측 치수'],
 ['현실화','카메라·매스·주요 개구부·가구 수','선명해진 재질의 실제 제품·성능'],
 ['부분 보정','수정 대상과 대상 밖의 변화','지시만으로 보장되는 원본 보존'],
 ['세 배 업스케일','같은 위치의 윤곽·무늬·색·문자 변화','실측·시공·법적 적합성의 복원'],
] as const;
