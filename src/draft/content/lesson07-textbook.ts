// Teaching explanations adapted from the protected Gwangju Lesson07/08 source.
// Downloaded files and provenance metadata remain unchanged.
export const gaussianProperties = [
 ['위치','공간 안에서 어디에 놓이는지를 나타냅니다.'],
 ['크기','얼마나 넓은 영역에 영향을 주는지 나타냅니다.'],
 ['회전·방향','길쭉하거나 납작한 요소가 향하는 방향입니다.'],
 ['색상','카메라 화면에서 보이는 색을 표현합니다.'],
 ['투명도','앞뒤 요소가 얼마나 겹쳐 보이는지 결정합니다.'],
] as const;
export const gaussianErrors = ['벽이 끊기거나 얇아짐','가구 뒤쪽 형태 변형','바닥·벽 경계가 녹아 보임','빈 공간을 임의로 채움','카메라를 돌리면 형태 변화','입력에 없던 구조가 생김'];
export const stabilityRoles = ['패키지 설치·업데이트','각 패키지 환경 분리','공유 모델 폴더 관리','ComfyUI 실행 관리'];
export const installationSteps = [
 'https://lykos.ai/에 접속해 Stability Matrix 항목을 엽니다.',
 'Windows 10/11 64-bit 환경에 맞는 StabilityMatrix-win-x64.zip을 내려받습니다.',
 'ZIP 압축을 풀고 StabilityMatrix.exe를 실행한 뒤 실습용 저장 위치를 정합니다.',
 'Stability Matrix를 실행합니다.',
 'Packages 화면에서 ComfyUI를 선택합니다.',
 'Install을 실행하고 설치가 끝날 때까지 기다립니다.',
 'ComfyUI를 Launch하여 브라우저 화면이 열리는지 확인합니다.',
 'Workflow 메뉴에서 실습용 TripoSplat 템플릿 JSON을 불러옵니다.',
 '필요한 모델·사용자 노드 안내가 있으면 지정된 항목을 확인합니다.',
 '로컬 CUDA 경로는 기준 이미지를 넣고 낮은 설정으로 먼저 Queue합니다. 내장 그래픽 환경은 CPU·웹 실습 경로를 선택합니다.',
];
export const hardwareRecommendations = [
 ['OS','Windows 11 · 설치 전 장치와 실행 경로 확인'],
 ['로컬 CUDA · GPU','NVIDIA RTX 외장 GPU 권장'],
 ['로컬 CUDA · VRAM','8GB급은 제한적 · 12GB 이상은 비교적 여유'],
 ['로컬 CUDA · RAM','16GB 이상 권장 · 가능하면 32GB'],
 ['CPU·웹 · 노트북','AMD Ryzen · Intel CPU + 16GB RAM 환경은 CPU·웹 경로 선택'],
 ['CPU·웹 · 실행','Web Demo → ChatGPT / Gemini → OpenVINO SR1033 CPU 또는 웹 업스케일러'],
 ['STORAGE','로컬 모델 저장과 실행을 위해 SSD 권장'],
] as const;
export const practiceRouteOptions = [
 {title:'경로 A · NVIDIA RTX 외장 GPU',description:'CUDA와 모델·노드가 준비된 PC에서 선택합니다. VRAM 8GB급은 제한적이며 12GB 이상은 비교적 여유가 있습니다. 모델과 설정에 따라 실행 가능 범위가 달라집니다.',flow:'Stability Matrix + ComfyUI → TripoSplat 로컬 생성 → ComfyUI Upscale 실행 → OpenVINO SR1033 CPU 결과 비교'},
 {title:'경로 B · 일반 실습 노트북 · CPU·웹',description:'예: Windows 11 · AMD Ryzen 7 5800H · 16GB RAM(사용 가능 약 15.3GB) · Radeon Graphics. 외장 NVIDIA GPU가 없으면 이 경로를 선택합니다.',flow:'설치 과정·노드 구조 이해 → TripoSplat Web Demo 또는 제공 캡처 → ChatGPT / Gemini 현실화·부분 보정 → OpenVINO SR1033 CPU 3배 확대 또는 웹 업스케일러'},
] as const;
export const tripoNodes = [
 ['INPUT','LoadImage','Gaussian으로 변환할 기준 이미지를 선택합니다.'],
 ['OPTION','auto_remove_background','배경 자동 제거 여부를 정합니다. 공간의 벽·바닥까지 제거되지 않는지 확인합니다.'],
 ['CORE','Image to Gaussian Splat','단일 이미지를 바탕으로 Gaussian 표현을 추정합니다.'],
 ['PREVIEW','Create Video / Orbit','카메라 회전 영상에서 큰 형태 오류를 살핍니다.'],
 ['OUTPUT','SPZ / GLB 저장','Gaussian 저장과 Mesh 변환 경로를 구별합니다. 활성화된 저장 노드를 확인합니다.'],
] as const;
export const tripoSettings = [
 ['num_gaussians / sampling_num_gaussians','장면에 사용할 Gaussian 수입니다.','값을 늘리면 GPU 메모리와 처리 부담이 커집니다. 입력에 없는 사실이 복원되지는 않습니다.'],
 ['seed','생성 변화를 재현하거나 바꾸는 값입니다.','다른 seed는 다른 추정 결과를 만들 수 있습니다. 비교할 때 사용한 값을 기록합니다.'],
 ['auto_remove_background','입력의 배경 자동 제거 옵션입니다.','배경이 정리된 입력은 끌 수 있습니다. 공간을 구성하는 벽·바닥이 남는지 살핍니다.'],
 ['model selector','사용할 모델 파일을 선택합니다.','템플릿의 기본 선택부터 확인하고 해당 모델 파일을 준비합니다.'],
] as const;
export const viewpointChecks = ['공간의 중심 관계와 주요 벽체가 읽히는가?','가구·개구부가 심하게 무너지지 않은 시점인가?','발표 이미지로 사용할 구도가 확보되는가?','가장자리의 비어 있는 영역이나 부유물이 후속 작업을 방해하지 않는가?'];
export const renderCriteria = [
 ['구조 보존','벽체·개구부·공간 관계가 입력과 얼마나 일치하는지 확인합니다.'],
 ['가구','위치·수량·형태가 의도 없이 달라지지 않았는지 확인합니다.'],
 ['재질','반복 무늬와 경계가 자연스럽게 이어지는지 확인합니다.'],
 ['조명','공간을 과도하게 재해석하거나 정보 확인을 방해하지 않는지 확인합니다.'],
 ['추가 오브젝트','원본에 없던 가구·창·문·장식이 생기지 않았는지 확인합니다.'],
 ['후속 활용','크롭·보드·제안 이미지로 활용할 만큼 안정적인지 확인합니다.'],
] as const;
export const candidateSelection = ['구조 보존이 우선 기준을 통과하는지 확인합니다.','전체 현실감·재질·조명을 함께 봅니다.','추가 오류의 수와 수정 난이도를 기록합니다.','후속 크롭·보드·제안 이미지에 활용하기 좋은 한 장을 선택합니다.'];
export const partialChecks = ['수정 영역 밖의 벽·창·문·가구가 바뀌지 않았는가?','오류를 없애면서 새로운 오브젝트를 만들지 않았는가?','수정 경계의 재질·조명·원근이 자연스럽게 이어지는가?'];
export const upscaleMethods = [
 ['RESIZE','Bicubic · Lanczos','기존 픽셀 사이를 계산해 크기를 늘립니다. 흐림과 계단 현상이 남을 수 있습니다.'],
 ['GENERAL AI SR','RealESRGAN · ESRGAN 계열','학습한 패턴으로 경계와 질감을 재구성합니다. 원본에 없던 세부 표현이 생길 수 있습니다.'],
 ['OPENVINO SR','SR1033','저해상도 BGR 이미지와 Bicubic 3배 입력을 함께 사용해 3배 결과를 만듭니다.'],
 ['GENERATIVE SR','생성형 재구성 방식','세부를 적극적으로 재구성할 수 있습니다. 시각적 품질과 원본 정보 보존을 따로 검토합니다.'],
] as const;
export const floorPlanChecks = ['작은 문자 획이 다른 글자로 바뀌지 않았는가?','벽선 두께와 끊김이 달라지지 않았는가?','가구선이 합쳐지거나 새 선이 생기지 않았는가?','치수 숫자·기호가 원본과 같은가?'];
export const upscaleNodes = [
 ['01','VHS_LoadImages','지정 폴더의 이미지를 불러옵니다. Video Helper Suite 사용자 노드가 필요합니다.'],
 ['02','ImageScale','Lanczos, 1120 × 1074, crop disabled로 기준 크기를 맞추는 연결입니다. 실행 전 입력 비율에 맞게 조정합니다.'],
 ['03A','RealESRGAN_x2.pth','UpscaleModelLoader → ImageUpscaleWithModel 경로로 2배 결과를 만듭니다.'],
 ['03B','4x-UltraSharp.pth','같은 입력을 별도 모델 경로로 처리해 질감과 왜곡을 비교합니다.'],
 ['04','SaveImage','Lanczos 기준 결과와 두 모델 결과를 각각 저장합니다.'],
] as const;
export const srFacts = [
 ['MODEL','SR1033 · FP16','single-image-super-resolution-1033 OpenVINO IR 모델을 사용합니다.'],
 ['INPUT','BGR 3채널 × 2','원본 입력과 그 이미지의 Bicubic 3배 입력을 함께 사용합니다.'],
 ['OUTPUT','3× Super Resolution','가로·세로를 각각 세 배로 확대합니다.'],
 ['DEVICE','CPU','외장 NVIDIA GPU나 CUDA 없이 CPU에서 실행합니다.'],
] as const;
export const hitlItems = ['외곽선','내부 벽','창호','문','계단','가구','문자','치수','재질 패턴'];
export const comparisonMethods = [
 ['A','원본','판단의 기준입니다. 확대 결과보다 항상 우선합니다.'],
 ['B','Bicubic · Lanczos','일반 Resize의 흐림과 선 보존 상태를 봅니다.'],
 ['C','일반 AI SR','RealESRGAN·4x-UltraSharp 결과의 질감과 왜곡을 봅니다.'],
 ['D','OpenVINO SR1033','Bicubic 3배 결과와 선·문자·경계 변화를 대조합니다.'],
] as const;
export const deliverables = ['Gaussian 기반 현실형 렌더 후보','도구별 결과 비교 기록','선택한 최종 렌더','Upscale 결과','Before · After 검토 기록'];
export const closingPrinciples = ['AI가 원본에 없는 구조·재질·디테일을 만들 수 있습니다.','Upscale은 실제 디테일 복원을 보장하지 않습니다.','실제 치수·구조·법규·설비·시공성은 별도로 확인합니다.','서비스·모델·요금제·UI는 변경될 수 있습니다.'];

// Display captions are separate from immutable asset/provenance records.
export const lesson07ImageCopy: Record<string,{title?:string;description:string}> = {
 'gaussian-plan-source':{title:'① 원본 2D 평면도 · 거실·주방',description:'도면 2.png 계열의 거실·다이닝·주방 배치를 확인합니다. 공간·문·창의 관계를 후속 입체 이미지와 대조하는 사실 기준입니다.'},
 'gaussian-isometric-source':{title:'② 3D 아이소메트릭 · 같은 거실·주방',description:'같은 도면에서 이어진 입체화 참고본입니다. 현재 문·개구부 교정본과 보관된 Gaussian 캡처의 세부가 완전히 같다고 가정하지 않고 원도면과 대조합니다.'},
 gaussian:{title:'Gaussian 시점 캡처 · 현실화 기준 입력',description:'벽체·소파·식탁의 관계와 가장자리 번짐을 관찰합니다. 이 화면을 현실화 이미지와 비교하는 기준으로 사용합니다.'},
 'input-candidate':{title:'Gaussian 시점 탐색용 입력 · 제6차시 오피스',description:'새 Gaussian 생성에 사용할 오피스 입체 이미지입니다. 주요 벽과 가구의 위치를 먼저 기록합니다.'},
 'gs-input-128':{description:'세부 정보가 적은 입력에서 외곽과 가구 관계가 얼마나 읽히는지 살핍니다.'},
 'gs-input-256':{description:'다른 입력 크기와 비교하며 경계·가구·공간 관계의 차이를 살핍니다.'},
 'gs-input-512':{description:'더 많은 세부가 보이는 입력도 숨은 면은 추정 대상임을 기억합니다.'},
 'gs-lecture-input':{title:'교육용 오피스 입체 입력 · JPEG',description:'새 교육용 도면 기반 입체 예시의 JPEG 파생본입니다. LoadImage에 넣을 후보이며 Gaussian 실행 결과가 아닙니다.'},
 'gs-topview':{title:'교육용 오피스 Top View 입력',description:'새 교육용 오피스의 외곽·공간 배치를 대조하며 Gaussian 입력 역할을 익힙니다. 문자는 의도적 오류 비교 항목입니다.'},
 'gs-3d-reference':{title:'교육용 오피스 입체 비교 기준',description:'같은 입체 원본에서 만든 비교 기준 이미지입니다. 별도 시점에서 실제 관측한 자료는 아닙니다.'},
 'comfy-source':{description:'확대 비교의 원본입니다. 창틀·의자·소파 직물에서 비교할 위치를 정합니다.'},
 'comfy-lanczos':{description:'일반 리사이즈의 기준 결과입니다. 원본과 선의 흐림·계단 현상을 비교합니다.'},
 'comfy-realesrgan':{description:'RealESRGAN_x2 결과입니다. 질감 개선과 경계·반복 무늬 변화를 함께 살핍니다.'},
 'comfy-ultrasharp':{description:'4x-UltraSharp 결과입니다. 미세 패턴·밝은 테두리·과한 선명화가 생기는지 살핍니다. 확대 보기와 다운로드로 원본 PNG를 확인합니다.'},
 'comfy-before':{title:'교육용 평면도 BEFORE · 원본',description:'자체 제작 가로 정방향 도면입니다. 텍스트 PDF와 같은 선·문자·치수의 기준으로 사용합니다.'},
 'comfy-after':{title:'교육용 평면도 AFTER · 2배 일반 확대',description:'같은 원본의 Lanczos 2배 리사이즈입니다. AI 재실행 결과나 사실 정보 복원으로 해석하지 않습니다.'},
 'sr-input':{title:'SR1033 비교 · 입력 원본',description:'현실화 이미지를 CPU 업스케일의 입력으로 사용합니다. 같은 위치의 창틀과 직물 표현을 비교합니다.'},
 'sr-bicubic':{description:'일반 Bicubic 3배 결과입니다. AI 결과와 같은 크기에서 선과 질감을 비교합니다.'},
 'sr-output':{description:'CPU 기반 SR1033 3배 결과입니다. 선명도 개선과 원본에 없던 경계·패턴 변화를 구별합니다.'},
};
for (const key of ['upscale-input-256','upscale-input-low','upscale-input-photo']) lesson07ImageCopy[key]={title:'교육용 오피스 입체 · 선택 입력',description:'새 입체 예시의 축소·저품질·전체 입력 파생본입니다. 같은 위치를 확대해 경계·선·문자 변화를 비교합니다.'};
for (const [key,description] of [
 ['route-01','왼쪽 창틀·천장 조명·식탁 앞 의자를 Gaussian 입력과 대조합니다.'],
 ['route-02','창 분할·우측 뒤 개구부와 식탁 재질의 변화를 살핍니다.'],
 ['route-03','천장·주방 상부장·창틀의 추가 및 재해석을 확인합니다.'],
 ['route-04','카메라·가구 수와 재질 경계의 일관성을 확인합니다.'],
 ['route-05','밝기와 함께 구조·재질이 달라지지 않았는지 살핍니다.'],
]) lesson07ImageCopy[key]={description};
