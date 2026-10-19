# revision-7 · 자체 제작 오피스 자료로 교체

오피스 입력 15종은 외부 공유 도면을 대체한 하나의 교육용 가상 공간입니다. 원본은 가로 정방향 텍스트 PDF이며 클린 선화와 입체의 문자 오류는 비교 학습을 위해 의도적으로 구성했습니다. 실제 AI 오류 재현·Gaussian 실행·AI Upscale 성능 증거로 제시하지 않습니다. 입체의 크기·포맷별 파일은 동일 최종 이미지에서 파생했습니다. 기존 거실 현실화 비교와 OpenVINO CPU 입출력·실행 패키지는 보존합니다.

# DJ-L07 · review/draft

## 구성
TripoSplat 실제 수업 JSON 2종·거실 캡처 1장과 자체 제작 오피스 입력 세트, 현실화 5경로, 한국어 국소 보정 Prompt·체크리스트, ComfyUI Upscale JSON 2종과 모델별 실제 출력 원본을 제공합니다. 사전 PLY·실제 6시점·국소 보정 전후 세트는 없으며 임의 생성하지 않았습니다. 거실·주방 원본 평면도 → 3D 아이소메트릭 → 보관된 Gaussian 캡처를 같은 공간의 학습 흐름으로 연결합니다. 현재 교정된 입체화 참고본으로 보관 캡처를 새로 실행했다는 뜻은 아닙니다.

## ComfyUI
workflow_triposplat_modified.json / workflow_triposplat_optimized.json은 아카이브 원본입니다. LoadImage의 과거 파일명을 실제 입력 파일로 바꿉니다. 두 JSON의 배경 제거·생성 옵션은 실제 파일을 기준으로 비교하며 한쪽의 성능 우위를 주장하지 않습니다. 저장 노드는 SplatToFile3D의 SPZ 경로입니다. safetensors 가중치와 실행환경은 포함하지 않습니다.
upscale_basic.json은 LoadImage → 모델 불러오기 → 배치 확대 → 저장 경로입니다. 일부 사용자 노드가 필요합니다. upscale_modified.json은 폴더 입력·크기 조정·RealESRGAN_x2 / 4x-UltraSharp·저장 경로입니다. 실제 출력 비교 PNG와 JSON은 수업 아카이브 자료이며 현재 PC에서 ComfyUI를 재실행한 기록은 아닙니다. 원본 비율과 입력 폴더·모델·노드를 실행 전에 확인합니다. .pth 가중치는 포함하지 않습니다.

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

단일 입력에서 추정한 측면·후면, 현실화 재질, 업스케일 디테일은 CAD/BIM·실측·구조·법규·시공 확정 정보가 아닙니다. Codex 자체 검증 이후 Reviewer 검수와 사용자 최종 승인은 별도입니다.


## 제8차시 전용 패키지
도면 판독·NotebookLM·클린 선화·Graphviz 자료는 DJ-L08-Floorplan-Graphviz-Pack.zip으로 분리했습니다. 제7차시 Starter Pack에는 이를 중복 수록하지 않습니다. Lykos 설치 안내의 시작 주소는 https://lykos.ai/입니다.
