// Commands retained from protected Gwangju Lesson08, section 15.
export const openVinoWingetCheck = 'winget --version';
export const openVinoPythonInstall = 'winget install -e --id Python.Python.3.12 --source winget --scope user --accept-source-agreements --accept-package-agreements';
export const openVinoPythonCheck = ['python --version', 'python -m pip --version'].join('\n');
export const openVinoProjectSetup = [
  '$Desktop = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)',
  '$Project = Join-Path $Desktop "OpenVINO_SR1033"',
  '',
  'New-Item -ItemType Directory -Force -Path $Project | Out-Null',
  'Set-Location $Project',
  '',
  'Write-Host "현재 작업 위치:" (Get-Location)',
  'explorer .',
].join('\n');
export const openVinoVenvSetup = ['python -m venv .venv', 'Test-Path .\\.venv\\Scripts\\python.exe'].join('\n');
export const openVinoPackageSetup = [
  '.\\.venv\\Scripts\\python.exe -m pip install --upgrade pip',
  '.\\.venv\\Scripts\\python.exe -m pip install openvino opencv-python numpy',
].join('\n');
export const openVinoFolderSetup = [
  'New-Item -ItemType Directory -Force -Path ".\\model" | Out-Null',
  'New-Item -ItemType Directory -Force -Path ".\\input" | Out-Null',
  'New-Item -ItemType Directory -Force -Path ".\\output" | Out-Null',
  '',
  'Get-ChildItem -Directory',
].join('\n');
export const openVinoCpuCheck = '.\\.venv\\Scripts\\python.exe -c "import cv2, numpy; from openvino import Core, get_version; print(\'OpenVINO OK:\', get_version()); print(\'Device:\', Core().available_devices); print(\'OpenCV OK:\', cv2.__version__); print(\'NumPy OK:\', numpy.__version__)"';
export const openVinoDownloadCommands = [
  '$BaseUrl = "https://storage.openvinotoolkit.org/repositories/open_model_zoo/2023.0/models_bin/1/single-image-super-resolution-1033/FP16"',
  '',
  'Invoke-WebRequest `',
  '-Uri "$BaseUrl/single-image-super-resolution-1033.xml" `',
  '-OutFile ".\\model\\single-image-super-resolution-1033.xml"',
  '',
  'Invoke-WebRequest `',
  '-Uri "$BaseUrl/single-image-super-resolution-1033.bin" `',
  '-OutFile ".\\model\\single-image-super-resolution-1033.bin"',
  '',
  'Write-Host "=== SR1033 모델 다운로드 완료 ==="',
  'Get-ChildItem ".\\model"',
].join('\n');
export const openVinoScriptCheck = 'Test-Path .\\run_sr1033.py';
export const openVinoInputOpen = 'explorer .\\input';
export const openVinoRun = [
  '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
  '$env:PYTHONIOENCODING = "utf-8"',
  '.\\.venv\\Scripts\\python.exe .\\run_sr1033.py',
].join('\n');
export const openVinoOutputOpen = 'explorer .\\output';
export const openVinoReuse = [
  '$Desktop = [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)',
  'Set-Location (Join-Path $Desktop "OpenVINO_SR1033")',
  openVinoRun,
].join('\n');



export const openVinoTroubleshooting = [
  ['winget 인식 안 됨', 'App Installer와 WinGet 상태를 확인합니다.'],
  ['Python 설치 후 python 인식 안 됨', 'PowerShell을 완전히 종료한 뒤 새로 실행합니다.'],
  ['폴더 위치를 찾기 어려움', 'DesktopDirectory 명령과 explorer . 실행 여부를 확인합니다.'],
  ['No module named openvino', '.\\.venv\\Scripts\\python.exe를 사용했는지 확인합니다.'],
  ['모델 없음', 'model 폴더의 XML과 BIN 파일을 확인합니다.'],
  ['입력 이미지 없음', 'input 폴더에 지원 형식 이미지가 있는지 확인합니다.'],
  ['처리시간이 오래 걸림', '원본 이미지 해상도와 CPU 성능에 따라 시간이 달라질 수 있습니다.'],
  ['결과가 원본과 달라짐', 'AI 결과를 확정 정보로 사용하지 말고 원본과 대조합니다.'],
] as const;

export const openVinoSteps = [
 {title:'PowerShell과 WinGet 확인',description:'Windows 시작 메뉴에서 PowerShell 또는 터미널을 열고 버전 정보가 표시되는지 확인합니다.',commands:[{title:'WinGet 확인',text:openVinoWingetCheck}]},
 {title:'Python 3.12 설치와 새 터미널 확인',description:'Python이 없으면 사용자 범위에 설치합니다. 설치 후 현재 PowerShell 창을 완전히 닫고 새 창에서 확인합니다. Python 3.12.x와 pip 버전을 확인한 뒤 계속합니다.',commands:[{title:'Python 3.12 설치',text:openVinoPythonInstall},{title:'새 PowerShell에서 Python과 pip 확인',text:openVinoPythonCheck}]},
 {title:'바탕화면에 프로젝트 폴더 생성',description:'DesktopDirectory로 Windows가 인식하는 실제 바탕화면을 찾습니다. OneDrive 바탕화면에서도 같은 방식으로 작업 위치를 정합니다.',commands:[{title:'OpenVINO_SR1033 만들기와 폴더 열기',text:openVinoProjectSetup}]},
 {title:'독립 가상환경 생성',description:'프로젝트 폴더에서 실행합니다. Test-Path 결과가 True인지 확인합니다. Activate 대신 가상환경 Python을 직접 호출합니다.',commands:[{title:'.venv 생성과 실행 파일 확인',text:openVinoVenvSetup}]},
 {title:'OpenVINO · OpenCV · NumPy 설치',description:'OpenVINO는 AI 모델 실행, OpenCV는 이미지 읽기·크기 변경·저장, NumPy는 이미지 배열 처리를 담당합니다.',commands:[{title:'pip 업데이트와 패키지 설치',text:openVinoPackageSetup}]},
 {title:'model · input · output 폴더 생성',description:'모델, 원본 입력, 결과를 서로 다른 폴더에 보관합니다.',commands:[{title:'실습 폴더 생성',text:openVinoFolderSetup}]},
 {title:'설치와 CPU 인식 확인',description:'OpenVINO·OpenCV·NumPy 버전과 장치 목록을 확인합니다. 목록에 CPU가 있어야 합니다. 실행 스크립트는 CPU를 지정합니다.',commands:[{title:'패키지와 실행 장치 확인',text:openVinoCpuCheck}]},
 {title:'SR1033 FP16 모델 다운로드',description:'Open Model Zoo의 XML과 BIN을 같은 model 폴더에 저장합니다. 두 파일의 이름을 바꾸지 않습니다.',commands:[{title:'공식 SR1033 XML · BIN 다운로드',text:openVinoDownloadCommands}]},
 {title:'run_sr1033.py 실행 스크립트 확인',description:'CPU 실행 패키지(ZIP)를 압축 해제했다면 폴더 안에 이미 run_sr1033.py가 들어 있습니다. 빈 폴더에서 직접 시작한 경우에만 아래 run_sr1033.py 파일을 해당 폴더에 저장한 뒤 Test-Path 결과가 True인지 확인합니다.',commands:[{title:'실행 스크립트 존재 확인',text:openVinoScriptCheck}]},
 {title:'input 폴더에 원본 이미지 넣기',description:'열린 폴더에 원본 이미지를 넣습니다. PNG·TIFF·BMP를 권장합니다. JPG의 압축 손실도 비교 결과에 영향을 줄 수 있습니다.',commands:[{title:'입력 폴더 열기',text:openVinoInputOpen}]},
 {title:'SR1033 CPU 업스케일 실행',description:'프로젝트 폴더에서 UTF-8 출력 인코딩을 설정한 뒤 실행합니다. Python 한글 로그를 확인합니다. 원본 크기와 CPU 성능에 따라 처리 부담이 달라집니다.',commands:[{title:'UTF-8 설정과 CPU 업스케일 실행',text:openVinoRun}]},
 {title:'Bicubic 3배 · SR1033 3배 결과 비교',description:'output의 *_Bicubic_3x.png와 *_SR1033_3x.png를 원본과 함께 엽니다. 같은 위치에서 문자·가는 선·벽선·새 패턴·전체 선명도를 비교합니다.',commands:[{title:'출력 폴더 열기',text:openVinoOutputOpen}]},
] as const;

export const openVinoPackageFlow = [
 ['준비 · 최초 1회','DJ-L07-OpenVINO-SR1033-Pack.zip을 바탕화면 OpenVINO_SR1033 폴더에 압축 해제합니다. 그 폴더에서 가상환경(.venv)·패키지 설치·모델 다운로드(download-sr1033-model.ps1 또는 STEP 08 명령)를 처음 한 번 준비합니다. run_sr1033.py·run_sr1033.bat·샘플 input/render-source.png는 이미 들어 있어 따로 옮길 필요가 없습니다.'],
 ['① INPUT · 확대할 이미지 넣기','OpenVINO_SR1033\\input 폴더에 확대할 이미지를 넣습니다. 기본 샘플 render-source.png가 이미 들어 있어 샘플로 바로 실행할 수 있습니다.'],
 ['② 실행 · CPU 3배 업스케일','폴더 안의 run_sr1033.bat을 더블클릭하거나, 해당 폴더의 PowerShell에서 .\\.venv\\Scripts\\python.exe .\\run_sr1033.py 명령을 실행합니다.'],
 ['③ OUTPUT · 결과 비교','OpenVINO_SR1033\\output 폴더에서 일반 확대본(*_Bicubic_3x.png)과 AI 초해상화본(*_SR1033_3x.png)을 원본과 비교합니다.'],
] as const;
