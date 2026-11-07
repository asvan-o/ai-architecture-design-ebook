# revision-7 · 자체 제작 오피스 자료로 교체

오피스 입력 15종은 외부 공유 도면을 대체한 하나의 교육용 가상 공간입니다. 원본은 가로 정방향 텍스트 PDF이며 클린 선화와 입체의 문자 오류는 비교 학습을 위해 의도적으로 구성했습니다. 실제 AI 오류 재현·Gaussian 실행·AI Upscale 성능 증거로 제시하지 않습니다. 입체의 크기·포맷별 파일은 동일 최종 이미지에서 파생했습니다. 기존 거실 현실화 비교와 OpenVINO CPU 입출력·실행 패키지는 보존합니다.

# DJ-L07 · 실습자료 사용 안내

## 구성
TripoSplat 실제 수업 JSON 2종·거실 캡처 1장과 자체 제작 오피스 입력 세트, 현실화 5경로, 한국어 국소 보정 Prompt·체크리스트, ComfyUI Upscale JSON 2종과 모델별 실제 출력 원본을 제공합니다. 사전 PLY·실제 6시점·국소 보정 전후 세트는 없으며 임의 생성하지 않았습니다. 거실·주방 원본 평면도 → 3D 아이소메트릭 → 보관된 Gaussian 캡처를 같은 공간의 학습 흐름으로 연결합니다. 현재 교정된 입체화 참고본으로 보관 캡처를 새로 실행했다는 뜻은 아닙니다.

## ComfyUI
workflow_triposplat_modified.json / workflow_triposplat_optimized.json은 아카이브 원본입니다. LoadImage의 과거 파일명을 실제 입력 파일로 바꿉니다. 두 JSON의 배경 제거·생성 옵션은 실제 파일을 기준으로 비교하며 한쪽의 성능 우위를 주장하지 않습니다. 저장 노드는 SplatToFile3D의 SPZ 경로입니다. safetensors 가중치와 실행환경은 포함하지 않습니다.

upscale_basic.json은 LoadImage → Upscale Model Loader → ImageUpscaleWithModelBatched → SaveImageAdvanced 경로입니다. upscale_modified.json은 폴더 입력·크기 조정·RealESRGAN_x2 / 4x-UltraSharp·저장 경로입니다. JSON에 기록된 ComfyUI core 버전은 0.31.0이며 사용자 노드의 버전 식별자도 JSON에 남아 있습니다. 이는 아카이브 저장 당시 정보이며 현재 PC의 실행 검증 결과나 권장 버전 고정값은 아닙니다.

### 사용자 노드의 역할과 설치 확인

| 노드 패키지 | 이 JSON에서 하는 일 | 확보·설치 방법 |
|---|---|---|
| [KJNodes](https://github.com/kijai/ComfyUI-KJNodes) · `ImageUpscaleWithModelBatched` | 기본형에서 작은 배치로 나누어 모델 확대합니다. `per_batch`는 한 번에 처리할 이미지 수입니다. | Manager에서 ComfyUI-KJNodes를 찾습니다. 수동 설치는 원개발자 안내대로 `custom_nodes`에 저장소를 복제하고 ComfyUI가 쓰는 Python으로 `requirements.txt`를 설치합니다. |
| [WAS Node Suite](https://github.com/WASasquatch/was-node-suite-comfyui) · `Upscale Model Loader` | 기본형에서 RealESRGAN_x2.pth를 불러옵니다. 수정형의 `UpscaleModelLoader`는 ComfyUI 기본 노드입니다. | Manager에서 WAS Node Suite를 찾습니다. 현재 배포판과 아카이브 JSON의 노드 호환성을 확인하고 수동 설치·호환 안내는 원개발자 README를 따릅니다. |
| [VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite) · `VHS_LoadImages` | 수정형에서 `ComfyUI/input` 아래 이미지 폴더를 읽습니다. 이 실습에서는 정지 이미지 묶음을 입력합니다. | Manager에서 ComfyUI-VideoHelperSuite를 찾습니다. 설치 후 `directory`를 본인의 입력 하위 폴더로 바꾸고 이미지 수·불러오기 제한을 확인합니다. |

1. 실행 중인 ComfyUI에 기본형 또는 수정형 JSON을 엽니다.
2. [공식 Manager 설치 안내](https://docs.comfy.org/manager/install)로 현재 배포판의 Manager 사용 가능 여부를 확인합니다. Manager의 누락 노드 설치 기능 또는 위 패키지명 검색을 사용합니다. [이전 Manager 화면](https://docs.comfy.org/manager/legacy-ui)의 메뉴명은 `Install Missing Custom Nodes`입니다.
3. 설치 완료 후 ComfyUI를 재시작하고 브라우저를 새로고침합니다. 빨간 누락 노드와 실행 로그의 `import failed`가 남지 않는지 확인합니다. `SaveImageAdvanced`처럼 core로 기록된 노드가 없으면 ComfyUI 버전 호환성을 먼저 확인합니다.
4. 입력·출력 연결과 설정값을 확인합니다. 현재 배포판에서 아카이브 노드가 호환되지 않으면 원본 JSON을 보존하고, 별도 사본에서 [공식 기본 확대 경로](https://docs.comfy.org/tutorials/basic/upscale)인 Load Image → Load Upscale Model → Upscale Image (Using Model) → Save Image로 한 장부터 확인합니다.

### 가중치 출처와 모델 폴더

| 필요 파일·역할 | 원개발자 공개 배포 | 저장 위치 |
|---|---|---|
| `RealESRGAN_x2.pth` · 2배 비교 | [ai-forever Real-ESRGAN 파일](https://huggingface.co/ai-forever/Real-ESRGAN/blob/main/RealESRGAN_x2.pth). 이 구현은 xinntao의 원 논문 구현과 구분합니다. | `ComfyUI/models/upscale_models/RealESRGAN_x2.pth` |
| `4x-UltraSharp.pth` · 4배 확대 | [Kim2091 본인 배포 파일](https://huggingface.co/Kim2091/UltraSharp/blob/main/4x-UltraSharp.pth). [제작자 모델 카드](https://huggingface.co/Kim2091/UltraSharp)의 사용 조건(CC BY-NC-SA 4.0)을 확인합니다. | `ComfyUI/models/upscale_models/4x-UltraSharp.pth` |

[ComfyUI 공식 안내](https://docs.comfy.org/tutorials/basic/upscale)의 기본 모델 경로는 `ComfyUI/models/upscale_models`입니다. Stability Matrix에서는 실제로 실행하는 ComfyUI 패키지 폴더를 기준으로 찾습니다. 파일을 둔 뒤 모델 목록을 새로고침하거나 재시작해 정확한 파일명을 선택합니다. `.pth` 가중치는 ZIP에 포함하지 않습니다. 원본 비율과 입력 폴더·모델·노드를 실행 전에 확인합니다.

위 표는 공식 문서와 원개발자 공개 자료에 근거한 준비 방법입니다. 제공된 JSON·출력 PNG는 수업 아카이브이며 이번 PC에서 ComfyUI를 다시 실행하거나 다운로드 가중치와 아카이브 가중치의 동일성을 검증한 기록은 아닙니다. GPU가 없거나 설치가 어려우면 제공된 원본·Lanczos·RealESRGAN·UltraSharp 결과를 같은 위치에서 비교하고 OpenVINO SR1033 CPU 실습 또는 웹 Image Upscaler · Tile Upscaler로 직접 확대를 이어갑니다. 웹 도구의 모델·설정이 로컬 두 모델과 같다고 가정하지 않습니다.

## CPU 준비
이번 검증: Windows / Python 3.14.6 / OpenVINO 패키지 2026.4.1 / OpenCV 패키지 5.0.0.93 / NumPy 2.5.4. 특정 PC의 실제 실행 조합이며 모든 환경의 최소 요구조건이나 속도를 보장하지 않습니다. NPU·iGPU 실행은 검증하지 않았습니다.

OpenVINO 패키지를 풀고 PowerShell에서 그 폴더로 이동합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-verified.txt
$ModelDir = Join-Path (Get-Location) 'model'
New-Item -ItemType Directory -Force -Path $ModelDir | Out-Null
$ModelBase = 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2023.0/models_bin/1/single-image-super-resolution-1033/FP16'
Invoke-WebRequest -Uri ($ModelBase+'/single-image-super-resolution-1033.xml') -OutFile (Join-Path $ModelDir 'single-image-super-resolution-1033.xml')
Invoke-WebRequest -Uri ($ModelBase+'/single-image-super-resolution-1033.bin') -OutFile (Join-Path $ModelDir 'single-image-super-resolution-1033.bin')
```

동일 명령은 download-sr1033-model.ps1에도 있습니다. PowerShell 실행정책을 변경할 필요 없이 위 명령을 직접 붙여넣어도 됩니다. ZIP에는 모델 XML·BIN이 포함되지 않습니다. 공식 주소에서 모델을 준비한 뒤 input에 이미지를 넣고 run_sr1033.bat를 실행합니다. output의 Bicubic·SR1033 결과를 원본과 비교합니다. 기존 output에는 이번 CPU 검증 결과가 포함되어 있으며 재실행 시 같은 이름은 덮어쓸 수 있으므로 먼저 별도 보관합니다. Python·인터넷·저장 공간이 필요하며 Runtime 포함 Portable 프로그램이 아닙니다.

## 원본·미리보기·출처
ComfyUI 비교의 웹 미리보기는 축소 WebP이며, 원본 PNG는 comfy-originals에 byte-identical로 보존합니다. UltraSharp 원본은 약 31MB이므로 확대·다운로드에 시간이 걸릴 수 있습니다. 미리보기는 원본 해상도 비교의 대체 증거가 아닙니다.
원본 source와 SHA-256은 manifest에 기록합니다. 외부 프로젝트 PDF·수강생 공유 도면은 배포하지 않습니다. 자체 제작 교육용 원본 PDF는 제8차시 도면 판독·Graphviz 실습팩에 포함합니다. 부분 보정은 선택 후보를 수강생이 직접 실행하고 결과를 기록하는 실습이며 제공된 전후 세트가 있다고 설명하지 않습니다.
공식 참고: https://docs.comfy.org/tutorials/3d/triposplat / https://docs.openvino.ai/2023.3/omz_models_model_single_image_super_resolution_1033.html

단일 입력에서 추정한 측면·후면, 현실화 재질, 업스케일 디테일은 CAD/BIM·실측·구조·법규·시공 확정 정보가 아닙니다.


## 제8차시 전용 패키지
도면 판독·NotebookLM·클린 선화·Graphviz 자료는 DJ-L08-Floorplan-Graphviz-Pack.zip으로 분리했습니다. 제7차시 Starter Pack에는 이를 중복 수록하지 않습니다. Lykos 설치 안내의 시작 주소는 https://lykos.ai/입니다.

## 크기와 가구를 읽는 기준
- 축선 기준 최대 범위는 24×16m이고, 중심선 다각형 면적은 348㎡(약 105평)입니다. 최대 외곽 직사각형 384㎡와 혼동하지 않습니다. 이는 교육용 설정이며 법정 바닥면적·실측 면적이 아닙니다. 외부 휴게데크는 별도입니다.
- 소장실 책상은 1,800×800mm, 8인 회의테이블은 3,200×1,200mm입니다. 회의 의자는 북측 4석·남측 4석으로 정돈했습니다. 수정된 2D PDF·PNG·클린 선화 및 office-geometry.json이 가구 치수 기준입니다.
- 기존 Top View·Gaussian 입력과 그 파생 3D 이미지는 그대로 보존한 분위기·공간 관계 참고본입니다. 가구 크기를 수정한 3D 결과로 읽지 않습니다.
- JSON의 room bounds는 위치를 찾는 범위이며 복도·실 경계의 일부 범위가 겹칩니다. bounds 면적의 단순 합산으로 면적을 산정하지 않습니다.
- 계단의 UP/DN·계단참 EL+2,200과 승강기 출입면은 판독·동선 대조를 위한 교육용 설정입니다. 층고·층간 연결·단수·유효높이·승강기 규격·구조·법규 적합성이 검증된 실시설계가 아닙니다.
