import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
const directory='review/daejeon/SORT_TEST';fs.mkdirSync(directory,{recursive:true});
const fixtures=[
 ['office_floorplan.png','01_CAD도면','review/daejeon/DJ-CF-01/DJ-CF-01_existing-plan.png','유효 PNG · 기존 교육용 카페 평면도. 파일명은 분류 테스트용이며 오피스 실측도면이 아님.'],
 ['front_elevation.pdf','01_CAD도면','review/daejeon/DJ-CF-02/DJ-CF-02_existing-elevation.pdf','유효 PDF · 기존 교육용 입면도 원본 동일 복사.'],
 ['material_ref_oak.png','03_레퍼런스','src/assets/lessons/04/material-reference-review/m-23-white-oak.png','유효 PNG · 기존 White Oak 원본 동일 복사.'],
 ['lighting_ref_3000K.jpg','03_레퍼런스','src/assets/lessons/02/empty-space-sample/02-base-images/base-01.jpeg','유효 JPEG · 기존 공간 이미지. lighting/3000K는 분류 키워드 테스트명이며 실제 색온도 참고자료가 아님.'],
 ['render_A_v01.png','04_이미지결과','review/daejeon/DJ-CF-01/DJ-CF-01_example-A.png','유효 PNG · 기존 강사 결과 예시 원본 동일 복사.'],
 ['project_brief.docx','07_문서',null,'유효 DOCX · 한 페이지 분류 테스트 문서. 교육과정 Design Brief 정답이 아님.'],
 ['building_model.blend','05_3D모델',null,'classification test stub · 실제 Blender 파일이 아니며 Blender에서 열지 않음.'],
 ['animation_cache.abc','05_3D모델',null,'classification test stub · 실제 Alembic cache가 아니며 DCC에서 열지 않음.'],
 ['walkthrough.mp4','08_영상',null,'유효 MP4 · 기존 JPEG를 사용한 1초 정지영상. 실제 walkthrough가 아님.'],
 ['image001.png','99_분류확인','review/daejeon/DJ-ML-01/BEFORE-BASE/DJ-ML-01_BEFORE_BASE_03_consultation-lounge.png','유효 PNG · 기존 공간 이미지 원본 동일 복사. 파일명에 분류 근거 없음.'],
 ['scan003.pdf','99_분류확인','review/daejeon/DJ-CF-01/DJ-CF-01_participant-worksheet-draft.pdf','유효 PDF · 기존 기록지. 실제 스캔 문서가 아니며 파일명에 분류 근거 없음.'],
];
for(const [file,,source] of fixtures){assert(!fs.existsSync(path.join(directory,file)),'Do not overwrite existing test fixtures: '+file);if(source)fs.copyFileSync(source,path.join(directory,file),fs.constants.COPYFILE_EXCL);}
for(const name of ['building_model.blend','animation_cache.abc'])fs.writeFileSync(path.join(directory,name),'CLASSIFICATION TEST STUB\nNot a valid '+(name.endsWith('.blend')?'Blender':'Alembic')+' file.\nFixture: '+name+'\n','utf8');
const python=process.argv[2];
assert(python,'Bundled Python path required for creating a valid DOCX fixture');
const docScript="from docx import Document\nfrom pathlib import Path\np=Path('review/daejeon/SORT_TEST/project_brief.docx')\ndoc=Document()\ndoc.add_heading('File Sorting Test Document',0)\ndoc.add_paragraph('This is a valid DOCX fixture for filename and extension classification. It is not an approved lecture Design Brief.')\ndoc.save(p)\nassert Document(p).paragraphs[0].text == 'File Sorting Test Document'\n";
let result=spawnSync(python,['-c',docScript],{cwd:process.cwd(),encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);
result=spawnSync('C:/ffmpeg/bin/ffmpeg.exe',['-hide_banner','-loglevel','error','-loop','1','-i',fixtures[3][2],'-t','1','-vf','scale=160:-2','-c:v','libx264','-pix_fmt','yuv420p','-an','-movflags','+faststart',path.join(directory,'walkthrough.mp4')],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);
const probe=spawnSync('C:/ffmpeg/bin/ffprobe.exe',['-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',path.join(directory,'walkthrough.mp4')],{encoding:'utf8',windowsHide:true});assert.equal(probe.status,0,probe.stderr);
const files=fixtures.map(([file,expectedFolder,source,description])=>{
 const bytes=fs.readFileSync(path.join(directory,file));
 if(source)assert(bytes.equals(fs.readFileSync(source)));
 return {file,type:file.endsWith('.blend')||file.endsWith('.abc')?'classification test stub':'valid format',description,source:source||'authorized test-fixture generation',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),expectedFolder,actualFolder:null,result:'미검증'};
});
fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify({status:'review/draft',localOnly:true,lectureMaterial:false,generatedAt:new Date().toISOString(),generationTools:{docx:'bundled python-docx (authoring only)',mp4:'local ffmpeg (authoring only)'},videoProbe:JSON.parse(probe.stdout),files},null,2)+'\n');
fs.writeFileSync(path.join(directory,'README.txt'),'SORT_TEST · 분류 로직 검수용 파일 11개\n\n파일 11개만 AI_파일자동정리/00_수집함에 복사하세요. manifest.json과 README.txt는 넣지 않습니다.\n.blend와 .abc는 classification test stub이며 실제 모델/캐시가 아닙니다.\n나머지 9개는 유효 형식입니다. 이름의 office/3000K/walkthrough/scan은 테스트명이며 내용의 실무 사실을 보증하지 않습니다.\n각 출처·SHA·예상/실제 결과는 manifest.json에 기록합니다.\nimage001.png와 scan003.pdf는 99_분류확인에 남겨야 합니다.\n같은 파일 재투입은 중복 안내 후 수집함에 그대로 남는 것이 정상입니다.\n');
console.log(JSON.stringify({files:files.length,valid:files.filter(file=>file.type==='valid format').length,stubs:files.filter(file=>file.type==='classification test stub').map(file=>file.file)}));
