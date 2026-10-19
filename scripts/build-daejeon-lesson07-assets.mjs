import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {repositoryRoot} from './course-registry.mjs';
import {lesson06Image} from './daejeon-lesson06-assets.mjs';
const revision='DJ-L07-GAUSSIAN-UPSCALE/revision-1';
const root=path.join(repositoryRoot,'review/daejeon',revision);
const imagePrefix='images/daejeon/lesson-07/',downloadPrefix='downloads/daejeon/lesson-07/';
const manifestPath=path.join(repositoryRoot,'review/daejeon/manifest.json');
const archiveRoot=process.env.DAEJEON_L07_ARCHIVE||JSON.parse(fs.readFileSync(path.join(root,'archive-location.json'),'utf8')).root;
const archiveSource=file=>path.join(archiveRoot,file);
const sha=b=>createHash('sha256').update(b).digest('hex');
export function assertKoreanLesson07Prompt(text){
 const clean=text.replace(/[A-Za-z0-9_./-]+\.(?:png|jpe?g|txt|md)/g,'').replace(/Gaussian Splatting|Polygon Mesh|Point Cloud|OpenVINO SR1033|AI Upscale|Top View 3D/g,'');
 assert(!/\b[A-Za-z]{2,}(?:[ \t]+[A-Za-z]{2,}){4,}\b/.test(clean),'English sentence in Lesson07 Prompt');
}
export function getLesson07Manifest(){const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));assert.equal(m.lessons['07'].revision,revision);return m.lessons['07'];}
export function getLesson07Assets(){return getLesson07Manifest().files.map(f=>({...f,source:path.join(repositoryRoot,'public',f.outputPath)}));}
export function verifyLesson07Assets(){
 const manifest=getLesson07Manifest();
 for(const f of manifest.files){assert(f.outputPath.startsWith(imagePrefix)||f.outputPath.startsWith(downloadPrefix));const b=fs.readFileSync(path.join(repositoryRoot,'public',f.outputPath));assert(b.length>0,f.outputPath);assert.equal(sha(b),f.sha256,f.outputPath);if(f.originalSource){const original=f.originalSource.startsWith('archive://')?archiveSource(f.originalSource.slice(10)):path.join(repositoryRoot,f.originalSource);if(fs.existsSync(original)){
 const originBytes=fs.readFileSync(original);
 if(sha(originBytes)!==f.sha256 && /\.(?:json|txt|md|py|ps1|bat)$/i.test(original)){
  // Git checks text out with platform-specific EOLs. The distributed bytes are
  // still checked above; provenance permits only an LF/CRLF difference.
  assert.equal(originBytes.toString('utf8').replaceAll('\r\n','\n'),b.toString('utf8').replaceAll('\r\n','\n'),'Reused text source changed beyond line endings: '+f.originalSource);
 }else assert.equal(sha(originBytes),f.sha256,'Reused source changed: '+f.originalSource);
}}}
 return manifest;
}
async function build(){
 const hotfix="review/daejeon/DJ-L06-OFFICE-SUBVIEW-AND-HOUSE-DOOR-HOTFIX/revision-12";if(fs.existsSync(path.join(repositoryRoot,hotfix,'manifest.json'))){const run=spawnSync(process.execPath,[path.join(repositoryRoot,hotfix,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});assert.equal(run.status,0,'Revision12 asset synchronization failed');return;}
 const current="review/daejeon/DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11";
 if(fs.existsSync(path.join(repositoryRoot,current,'before.json'))){const result=spawnSync(process.execPath,[path.join(repositoryRoot,current,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});assert.equal(result.status,0,'Revision11 asset packaging failed');return;}
 const precise="review/daejeon/DJ-L06-L07-ORIGINAL-HOUSE-PLAN-AND-DOOR-STAIR-PRECISION-FIX/revision-10";
 if(fs.existsSync(path.join(repositoryRoot,precise,"floorplan-manifest.json"))){const result=spawnSync(process.execPath,[path.join(repositoryRoot,precise,"assemble-assets.mjs")],{cwd:repositoryRoot,stdio:"inherit",windowsHide:true});assert.equal(result.status,0,"Revision10 asset packaging failed");return;}
 const allDoors='review/daejeon/DJ-ALL-LESSONS-FLOORPLAN-STAIR-AND-DOOR-AUDIT-FIX/revision-9';
 if(fs.existsSync(path.join(repositoryRoot,allDoors,'floorplan-manifest.json'))){const result=spawnSync(process.execPath,[path.join(repositoryRoot,allDoors,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});assert.equal(result.status,0,'Revision9 asset packaging failed');return;}
 const doors='review/daejeon/DJ-L07-DOOR-GEOMETRY-AND-3D-TOPVIEW-FIX/revision-8';
 if(fs.existsSync(path.join(repositoryRoot,doors,'floorplan-manifest.json'))){const result=spawnSync(process.execPath,[path.join(repositoryRoot,doors,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});assert.equal(result.status,0,'Door-corrected asset packaging failed');return;}
 const synthetic='review/daejeon/DJ-L01-L07-PROMPT-DERIVATION-AND-L07-SYNTHETIC-PLAN/revision-7';
 if(fs.existsSync(path.join(repositoryRoot,synthetic,'floorplan-manifest.json'))){const result=spawnSync(process.execPath,[path.join(repositoryRoot,synthetic,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});assert.equal(result.status,0,'Synthetic asset packaging failed');return;}
 const files=[];
 function add(outputPath,bytes,metadata={}){const file=path.join(repositoryRoot,'public',outputPath);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);const row={outputPath,sha256:sha(bytes),sizeBytes:bytes.length,...metadata};files.push(row);return row;}
 const copy=(outputPath,source,metadata={})=>add(outputPath,fs.readFileSync(source),{...metadata,originalSource:path.resolve(source).startsWith(path.resolve(archiveRoot)+path.sep)?'archive://'+path.relative(archiveRoot,source).replaceAll('\\','/'):path.relative(repositoryRoot,source).replaceAll('\\','/')});
 const text=(name,value)=>add(downloadPrefix+name,Buffer.from(value.trim()+'\n'),{kind:'document',title:name});
 const dimensions=b=>{if(b.subarray(1,4).toString()==='PNG')return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)};let i=2;while(i<b.length){if(b[i++]!==255)continue;let marker=b[i++];if(marker===216||marker===217)continue;const length=b.readUInt16BE(i);if([192,193,194].includes(marker))return{height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5)};i+=length;}throw Error('Unknown image dimensions');};
 const image=(key,file,source,title,description)=>{const b=fs.readFileSync(source);return copy(imagePrefix+file,source,{kind:'image',key,title,description,...dimensions(b)});};
 const gw=path.join(repositoryRoot,'src/assets/lessons/08');
 image('gaussian','gaussian-source.png',path.join(gw,'gaussian-render-comparison/01-gaussian-source.png'),'확보된 Gaussian 시점 캡처 · 1장','거실·주방 원본 평면도와 입체화 참고본으로 연결되는 보관 캡처입니다. 개별 카메라·실행 로그나 사전 PLY를 제공한다는 뜻은 아닙니다.');
 const routeFiles=['02-chatgpt-render.png','03-gemini-nano-banana-prompt.jpeg','04-gemini-nano-banana-agent.jpeg','05-vibe3d-render.png','06-vibe3d-relight-render.png'];
 const titles=['ChatGPT 이미지 경로','Gemini · Nano Banana 프롬프트 경로','Gemini · Nano Banana 에이전트 경로','VIBE3D 렌더 경로','VIBE3D Relight 경로'];
 routeFiles.forEach((file,i)=>image('route-0'+(i+1),'route-0'+(i+1)+(i===1||i===2?'.jpeg':'.png'),path.join(gw,'gaussian-render-comparison',file),titles[i],'원본 수업 자료에서 이 경로의 결과로 구분한 이미지입니다. 동일 Prompt·모델·생성시간을 통제한 성능 시험은 아닙니다.'));
 image('input-candidate','input-candidate-office.png',lesson06Image['office-topview'].source,'새 Gaussian 생성용 입력 후보 · 제6차시 오피스','제6차시의 실제 이미지입니다. 위 기존 Gaussian 캡처를 만든 원래 입력이라고 주장하지 않습니다.');
 const gsDir='99. 기타자료/5. ComfyUI 모델/Gaussian splat/';
 for(const size of [128,256,512])image('gs-input-'+size,'gaussian-input-'+size+'.jpg',archiveSource(gsDir+size+'.jpg'),'실제 수업 입력 샘플 · '+size,'아카이브의 원본 JPG를 그대로 제공합니다. 입력의 세부 정보 차이를 비교하며 보이지 않는 면은 추정 영역으로 구분합니다.');
 image('gs-lecture-input','gaussian-lecture-input.jpeg',archiveSource('2. 수업별 강의 내용/7차시 실습/가우시안 실습자료/Architectural_floor_plan_3D_rend…_202608121934.jpeg'),'실제 수업의 3D 평면 입력 샘플','독립 입력 샘플입니다. 거실·주방 연결 자료와 구분되는 별도 입력 예시입니다.');
 image('gs-topview','gaussian-topview-input.png',archiveSource('2. 수업별 강의 내용/7차시 실습/신영은대표님 자료/7차시_06_전체평면도_TopView3D.png'),'실제 수업 Top View 3D 입력','현장 원본 PDF는 배포하지 않습니다. 수업용 입체 이미지로 Gaussian의 입력 역할을 설명합니다.');
 image('gs-3d-reference','gaussian-3d-reference.png',archiveSource('2. 수업별 강의 내용/7차시 실습/신영은대표님 자료/7차시_06_전체평면도_3D 입체화 참고용.png'),'실제 수업 3D 입체화 참고 이미지','Top View 입력과 공간 관계를 대조하는 참고 자료입니다. 정밀 모델이나 실측 도면이 아닙니다.');
 for(const [key,file] of [['256','256.png'],['low','low.png'],['photo','photo_2026-08-12_22-22-40.png']])image('upscale-input-'+key,'upscale-input-'+key+'.png',archiveSource('99. 기타자료/3. 업스케일 평면 입체화/'+file),'저해상도 평면 입체화 입력 · '+key,'아카이브 원본입니다. 확대 후 새 패턴과 경계·문자 변화를 비교할 때 선택합니다.');
 const comfyDir='99. 기타자료/1. 3D가우시안/GPT_업스케일/';
 for(const [key,file,title] of [['comfy-source','2. ChatGPT_RENDER.png','ComfyUI 비교 · 입력 원본'],['comfy-lanczos','lanczos__00002_.png','ComfyUI 비교 · Lanczos 기준'],['comfy-realesrgan','realesrgan__00002_.png','ComfyUI 비교 · RealESRGAN_x2'],['comfy-ultrasharp','lanczos_UltraSharp__00002_.png','ComfyUI 비교 · 4x-UltraSharp']]){
  const original=copy(downloadPrefix+'comfy-originals/'+file,archiveSource(comfyDir+file),{kind:'original-image',title});
  const full=await sharp(archiveSource(comfyDir+file)).metadata();
  const {data,info}=await sharp(archiveSource(comfyDir+file)).resize({width:1440,withoutEnlargement:true}).webp({quality:86}).toBuffer({resolveWithObject:true});
  add(imagePrefix+key+'-preview.webp',data,{kind:'image',key,title,description:'웹 표시용 축소 미리보기입니다. 실제 수업 원본 '+full.width+'×'+full.height+' PNG는 별도 다운로드·확대 보기로 제공합니다. 현재 PC에서 ComfyUI를 재실행한 결과로 표시하지 않습니다.',width:info.width,height:info.height,downloadPath:original.outputPath,originalWidth:full.width,originalHeight:full.height,derivedFrom:original.outputPath});
 }
 image('comfy-before','comfy-reference-before.png',path.join(gw,'floor-plan-upscale/01-floor-plan-before-upscale.png'),'기존 업스케일 비교 · 원본','기존 수업의 도면 확대 비교 자료입니다. 새 CPU 실행 입력과 구분합니다.');
 image('comfy-after','comfy-reference-after-2x.png',path.join(gw,'floor-plan-upscale/02-floor-plan-after-upscale-2x.png'),'기존 업스케일 비교 · 2배 결과','기존 수업에서 2배 결과로 표기한 자료입니다. 현재 환경에서 ComfyUI를 재실행한 결과는 아닙니다.');
 image('sr-input','render-source.png',path.join(root,'runtime/input/render-source.png'),'CPU 검증 입력 · 현실화 결과','기존 ChatGPT 경로 이미지를 변경 없이 입력했습니다.');
 image('sr-bicubic','render-source_Bicubic_3x.png',path.join(root,'runtime/output/render-source_Bicubic_3x.png'),'일반 Bicubic 세 배 확대','원본 스크립트가 실제 CPU 검증에서 함께 저장한 일반 보간 결과입니다.');
 image('sr-output','render-source_SR1033_3x.png',path.join(root,'runtime/output/render-source_SR1033_3x.png'),'OpenVINO SR1033 세 배 확대','원본 스크립트의 실제 CPU 출력입니다. NPU·iGPU 실행 결과가 아닙니다.');
 const prompts=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson07-prompts.json'),'utf8'));
 const labels=['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'];
 for(const p of prompts){assert.deepEqual([...p.learning.matchAll(/^\[(.+)\]$/gm)].map(m=>m[1]),labels);for(const mode of ['learning','execution']){assertKoreanLesson07Prompt(p[mode]);text(p.key+'-'+mode+'.txt',p[mode]);}}
 for(const [name,file] of [['workflow_triposplat_modified.json','(수정)3d_triposplat_image_to_gaussian_splat.json'],['workflow_triposplat_optimized.json','(최적화)3d_triposplat_image_to_gaussian_splat.json']])copy(downloadPrefix+name,archiveSource(gsDir+file),{kind:'workflow',title:'실제 수업 TripoSplat · '+file});
 for(const [name,file] of [['upscale_basic.json','upscale_basic.json'],['upscale_modified.json','업스케일러(수정).json']])copy(downloadPrefix+name,archiveSource('99. 기타자료/5. ComfyUI 모델/Upscale/업스케일 json/'+file),{kind:'workflow',title:'실제 수업 Upscale · '+file});
 copy(downloadPrefix+'lesson-08-upscale-workflow.json',path.join(gw,'upscale-workflow/lesson-08-upscale-workflow.json'),{kind:'workflow',title:'기존 ComfyUI Upscale JSON'});
 copy(downloadPrefix+'run_sr1033.py',path.join(gw,'openvino-sr1033/run_sr1033.py'),{kind:'runtime',title:'원본 CPU 실행 스크립트'});
 text('download-sr1033-model.ps1',`$ErrorActionPreference = 'Stop'\n$ModelDir = Join-Path $PSScriptRoot 'model'\nNew-Item -ItemType Directory -Force -Path $ModelDir | Out-Null\n$ModelBase = 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2023.0/models_bin/1/single-image-super-resolution-1033/FP16'\nforeach ($ModelExtension in @('xml','bin')) {\n  $ModelName = 'single-image-super-resolution-1033.' + $ModelExtension\n  Invoke-WebRequest -Uri ($ModelBase+'/'+$ModelName) -OutFile (Join-Path $ModelDir $ModelName)\n}\nGet-ChildItem -LiteralPath $ModelDir`);
 for(const f of ['workflow-templates-LICENSE','open-model-zoo-LICENSE','sources.json'])copy(downloadPrefix+'provenance/'+f+(f.endsWith('LICENSE')?'.txt':''),path.join(root,'external',f),{kind:'provenance'});
 for(const f of ['execution.json','cpu-run.log'])copy(downloadPrefix+'provenance/'+f,path.join(root,'runtime',f),{kind:'evidence'});
 const run=JSON.parse(fs.readFileSync(path.join(root,'runtime/execution.json'),'utf8'));
 assert.equal(run.testedDevice,'CPU');assert.equal(run.outputs.length,2);for(const o of run.outputs){assert.equal(o.width,run.inputs[0].width*3);assert.equal(o.height,run.inputs[0].height*3);}
 text('requirements-verified.txt',`openvino==${run.openvinoPackage}\nopencv-python==${run.opencvPackage}\nnumpy==${run.numpy}`);
 text('run_sr1033.bat','@echo off\r\nsetlocal\r\npushd "%~dp0"\r\nif not exist ".venv\\Scripts\\python.exe" (\r\n echo Run the README setup first.\r\n pause\r\n exit /b 1\r\n)\r\n".venv\\Scripts\\python.exe" "run_sr1033.py"\r\nset "SR_EXIT=%ERRORLEVEL%"\r\npopd\r\npause\r\nexit /b %SR_EXIT%');
 const gaps=[
  {id:'gaussian-ply',status:'not-provided-by-approved-scope',detail:'사용자 확인: 아카이브에도 사전 PLY가 없어 배포에서 제외. 실제 수업 JSON 2종과 입력·캡처로 구성. 저장 노드는 SPZ 경로.'},
  {id:'gaussian-six-views',status:'not-provided-by-approved-scope',detail:'사용자 확인: 실제 6시점 세트 없음. 확보한 캡처 1장만 사용하고 가상 시점을 만들지 않음.'},
  {id:'partial-fix-pair',status:'prompt-and-checklist-only',detail:'사용자 지시: 별도 원본 전후 세트가 없어 추가 합성 이미지를 배포하지 않음. 한국어 Prompt·체크리스트 중심.'},
  {id:'comfyui-execution',status:'not-run',detail:'현재 PC에서 TripoSplat 및 ComfyUI Upscale GPU 실행 미검증. 모델 가중치·사용자 노드가 ZIP에 포함된 실행환경이라고 주장하지 않음.'},
 ];
 text('ASSET-READINESS.md',`# 제7차시 자료 구성과 실행 범위\n\n실제 수업 아카이브를 읽기 전용으로 확인했습니다. TripoSplat JSON 2종, 입력 이미지, Gaussian 캡처 1장, 현실화 5경로, Upscale JSON 2종과 실제 모델별 출력 원본을 제공합니다. 웹 미리보기는 별도 최적화본이며 원본 PNG를 함께 보존합니다.\n\nSR1033은 원본 스크립트·실제 CPU 검증 입출력·로그와 공식 모델 다운로드 명령을 제공합니다. 모델 XML·BIN, 대형 safetensors·pth 가중치, 현장 원본 PDF는 ZIP에 넣지 않습니다.\n\n${gaps.map(g=>'- '+g.detail).join('\n')}\n\n거실·주방 원본 평면도와 입체화 참고본을 보관된 Gaussian 캡처의 같은 공간 학습 흐름으로 연결합니다. 별도 오피스 입력 예시와 구별합니다. 현재의 Prompt 템플릿은 기존 5경로의 실제 생성 원문 증빙이 아닙니다.`);
 const checklist=`# 제7차시 체크리스트와 한국어 Prompt\n\n${prompts.map(p=>'## '+p.title+'\n\n'+p.learning+'\n\n### 짧은 실행 요청\n'+p.execution).join('\n\n')}\n\n## 네 단계 검수\n- Gaussian: 실제 입력·시점·추정 영역·실제 생성 상태 기록\n- 현실화: 카메라·매스·개구부·가구 수와 새 요소 확인\n- 부분 보정: 대상 안과 대상 밖의 변화 각각 기록\n- 업스케일: 동일 위치에서 일반 확대와 AI 확대의 윤곽·무늬·색 비교\n\n실측·법규·구조·시공 판단은 원자료와 전문 검토를 기준으로 합니다. 없는 PLY·6시점·GPU 실행을 완료했다고 기록하지 않습니다.`;
 text('DJ-L07-Checklist-And-Prompts.md',checklist);
 text('README.md',"# DJ-L07 · review/draft\n\n## 구성\nTripoSplat 실제 수업 JSON 2종과 입력·캡처 1장, 현실화 5경로, 한국어 국소 보정 Prompt·체크리스트, ComfyUI Upscale JSON 2종과 모델별 실제 출력 원본을 제공합니다. 사전 PLY·실제 6시점·국소 보정 전후 세트는 없으며 임의 생성하지 않았습니다. 거실·주방 원본 평면도 → 3D 입체화 참고본 → 보관된 Gaussian 캡처로 연결합니다. 현재 교정된 입체화 참고본으로 보관 캡처를 다시 실행한 기록은 아닙니다.\n\n## ComfyUI\nworkflow_triposplat_modified.json / workflow_triposplat_optimized.json은 아카이브 원본입니다. LoadImage의 과거 파일명을 실제 입력 파일로 바꿉니다. 두 JSON의 배경 제거·생성 옵션은 실제 파일을 기준으로 비교하며 한쪽의 성능 우위를 주장하지 않습니다. 저장 노드는 SplatToFile3D의 SPZ 경로입니다. safetensors 가중치와 실행환경은 포함하지 않습니다.\nupscale_basic.json은 LoadImage → 모델 불러오기 → 배치 확대 → 저장 경로입니다. 일부 사용자 노드가 필요합니다. upscale_modified.json은 폴더 입력·크기 조정·RealESRGAN_x2 / 4x-UltraSharp·저장 경로입니다. 실제 출력 비교 PNG와 JSON은 수업 아카이브 자료이며 현재 PC에서 ComfyUI를 재실행한 기록은 아닙니다. 원본 비율과 입력 폴더·모델·노드를 실행 전에 확인합니다. .pth 가중치는 포함하지 않습니다.\n\n## CPU 준비\n이번 검증: Windows / Python 3.14.6 / OpenVINO 패키지 2026.4.1 / OpenCV 패키지 5.0.0.93 / NumPy 2.5.4. 특정 PC의 실제 실행 조합이며 모든 환경의 최소 요구조건이나 속도를 보장하지 않습니다. NPU·iGPU 실행은 검증하지 않았습니다.\n\nOpenVINO 패키지를 풀고 PowerShell에서 그 폴더로 이동합니다.\n\n```powershell\npython -m venv .venv\n.\\.venv\\Scripts\\python.exe -m pip install -r requirements-verified.txt\n$ModelDir = Join-Path (Get-Location) 'model'\nNew-Item -ItemType Directory -Force -Path $ModelDir | Out-Null\n$ModelBase = 'https://storage.openvinotoolkit.org/repositories/open_model_zoo/2023.0/models_bin/1/single-image-super-resolution-1033/FP16'\nInvoke-WebRequest -Uri ($ModelBase+'/single-image-super-resolution-1033.xml') -OutFile (Join-Path $ModelDir 'single-image-super-resolution-1033.xml')\nInvoke-WebRequest -Uri ($ModelBase+'/single-image-super-resolution-1033.bin') -OutFile (Join-Path $ModelDir 'single-image-super-resolution-1033.bin')\n```\n\n동일 명령은 download-sr1033-model.ps1에도 있습니다. PowerShell 실행정책을 변경할 필요 없이 위 명령을 직접 붙여넣어도 됩니다. ZIP에는 모델 XML·BIN이 포함되지 않습니다. 공식 주소에서 모델을 준비한 뒤 input에 이미지를 넣고 run_sr1033.bat를 실행합니다. output의 Bicubic·SR1033 결과를 원본과 비교합니다. 기존 output에는 이번 CPU 검증 결과가 포함되어 있으며 재실행 시 같은 이름은 덮어쓸 수 있으므로 먼저 별도 보관합니다. Python·인터넷·저장 공간이 필요하며 Runtime 포함 Portable 프로그램이 아닙니다.\n\n## 원본·미리보기·출처\nComfyUI 비교의 웹 미리보기는 축소 WebP이며, 원본 PNG는 comfy-originals에 byte-identical로 보존합니다. UltraSharp 원본은 약 31MB이므로 확대·다운로드에 시간이 걸릴 수 있습니다. 미리보기는 원본 해상도 비교의 대체 증거가 아닙니다.\n원본 source와 SHA-256은 manifest에 기록합니다. 아카이브 원본 PDF·개인 프로젝트 도면은 배포하지 않습니다. 부분 보정은 선택 후보를 수강생이 직접 실행하고 결과를 기록하는 실습이며 제공된 전후 세트가 있다고 설명하지 않습니다.\n공식 참고: https://docs.comfy.org/tutorials/3d/triposplat / https://docs.openvino.ai/2023.3/omz_models_model_single_image_super_resolution_1033.html\n\n단일 입력에서 추정한 측면·후면, 현실화 재질, 업스케일 디테일은 CAD/BIM·실측·구조·법규·시공 확정 정보가 아닙니다. Codex 자체 검증 이후 Reviewer 검수와 사용자 최종 승인은 별도입니다.");
 const zipScript=`import json,sys,zipfile\nfrom pathlib import Path\nr=Path(sys.argv[1]); specs=json.loads(sys.argv[2])\nfor name,items in specs.items():\n with zipfile.ZipFile(r/name,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:\n  for source,target in items:\n   info=zipfile.ZipInfo(target,(2026,10,16,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644<<16; z.writestr(info,Path(source).read_bytes())\n`;
 const toEntry=(f,target)=>[path.join(repositoryRoot,'public',f.outputPath),target||f.outputPath.split('/').pop()];
 const documents=files.filter(f=>/\/(?:README|ASSET-READINESS)\.md$/.test(f.outputPath));
 const common=documents.map(f=>toEntry(f));
 const images=files.filter(f=>f.kind==='image');
 const specs={
  'DJ-L07-Gaussian-Views-Pack.zip':[...common,...images.filter(f=>['gaussian','input-candidate'].includes(f.key)||f.key.startsWith('gs-')).map(f=>toEntry(f)),...files.filter(f=>/workflow_triposplat_(?:modified|optimized)\.json$|workflow-templates-LICENSE\.txt$|gaussian-inspection-/.test(f.outputPath)).map(f=>toEntry(f))],
  'DJ-L07-Realistic-Render-Pack.zip':[...common,...images.filter(f=>f.key==='gaussian'||f.key.startsWith('route-')||f.key.startsWith('comfy-')||f.key.startsWith('upscale-input-')).map(f=>toEntry(f)),...files.filter(f=>f.kind!=='image'&&/realistic-render-|partial-fix-|Checklist-And-Prompts|\/comfy-originals\/|upscale_(?:basic|modified)\.json$/.test(f.outputPath)).map(f=>toEntry(f,f.outputPath.slice(downloadPrefix.length)))],
  'DJ-L07-OpenVINO-SR1033-Pack.zip':[...common,...images.filter(f=>f.key.startsWith('sr-')).map(f=>toEntry(f,(f.key==='sr-input'?'input/':'output/')+f.outputPath.split('/').pop())),...files.filter(f=>/run_sr1033\.(?:py|bat)$|download-sr1033-model\.ps1$|requirements-verified\.txt$|\/provenance\/(?:execution\.json|cpu-run\.log|sources\.json|open-model-zoo-LICENSE\.txt)$/.test(f.outputPath)).map(f=>toEntry(f,f.outputPath.slice(downloadPrefix.length)))],
 };
 const publicDownloads=path.join(repositoryRoot,'public',downloadPrefix);
 const zipped=spawnSync('python',['-c',zipScript,publicDownloads,JSON.stringify(specs)],{encoding:'utf8',windowsHide:true});assert.equal(zipped.status,0,zipped.stderr);
 for(const file of Object.keys(specs)){const b=fs.readFileSync(path.join(publicDownloads,file));files.push({outputPath:downloadPrefix+file,sha256:sha(b),sizeBytes:b.length,kind:'zip',title:file});}
 // Keep the three self-contained exercise packages once each; do not duplicate
 // their large image bytes again as loose files inside the integrated ZIP.
 const starter=files.filter(f=>f.kind==='zip'||/\/(?:README|ASSET-READINESS|DJ-L07-Checklist-And-Prompts)\.md$/.test(f.outputPath)).map(f=>toEntry(f));
 const pack=spawnSync('python',['-c',zipScript,publicDownloads,JSON.stringify({'DJ-L07-Starter-Pack.zip':starter})],{encoding:'utf8',windowsHide:true});assert.equal(pack.status,0,pack.stderr);
 const b=fs.readFileSync(path.join(publicDownloads,'DJ-L07-Starter-Pack.zip'));files.push({outputPath:downloadPrefix+'DJ-L07-Starter-Pack.zip',sha256:sha(b),sizeBytes:b.length,kind:'zip',title:'제7차시 전체 통합 실습팩 · 준비 상태 포함'});
 const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{schemaVersion:1,localOnly:true,lessons:{}};
 const previous=manifest.lessons['07'];
 for(const old of previous?.files||[]){if(files.some(f=>f.outputPath===old.outputPath))continue;assert(old.outputPath.startsWith(imagePrefix)||old.outputPath.startsWith(downloadPrefix));const target=path.resolve(repositoryRoot,'public',old.outputPath);assert(target.startsWith(path.resolve(repositoryRoot,'public')+path.sep));if(fs.existsSync(target)){assert.equal(sha(fs.readFileSync(target)),old.sha256,'Refuse to remove modified previous generated asset');fs.unlinkSync(target);}}
 manifest.lessons['07']={revision,durationMinutes:300,sectionCount:16,partCount:6,courseStatus:'design-pending',reviewStatus:'instructor-review',readiness:'archive-backed-review-draft',gaps,archiveReadOnly:true,sourceComponents:['src/components/content/Lesson07PdfToGaussian.astro','src/components/content/Lesson08GaussianUpscale.astro'],runtime:run,files};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest.lessons['07'],null,2)+'\n');
 fs.writeFileSync(path.join(root,'SHA256SUMS.txt'),files.map(f=>f.sha256+'  public/'+f.outputPath).join('\n')+'\n');
 verifyLesson07Assets();console.log('[DJ-L07] '+files.length+' files verified; CPU 3x PASS; genuine PLY / six views missing (not fabricated)');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
