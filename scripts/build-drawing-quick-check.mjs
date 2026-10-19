import {mkdirSync,writeFileSync,readFileSync,copyFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd(),source=path.join(root,'review/daejeon/DRAWING_QUICK_CHECK'),student=path.join(root,'review/daejeon/DRAWING_QUICK_CHECK_STUDENT'),internal=path.join(root,'review/daejeon/LESSON02_AUTOMATION_AB/instructor/B');
for(const folder of [source,student,internal])mkdirSync(folder,{recursive:true});
const fixtures=[
 ['A-101_1층평면도_R01.pdf','이전 리비전','R02'],
 ['A-101_1층평면도_R02.pdf','정상','R02'],['A-101_1층평면도_R02.dwg','정상','R02'],
 ['A-102_2층평면도_R01.pdf','정상','R01'],['A-102_2층평면도_R01.dwg','정상','R01'],['A-102_2층평면도_R01.dxf','정상','R01'],
 ['A-103_천장평면도_R01.pdf','확인 필요','R01'],['A-104_입면도_R01.dwg','확인 필요','R01'],['A-105_단면도_R01.dxf','확인 필요','R01'],
 ['A101_입면도_최종.pdf','파일명 확인',''],['A-106_단면도.pdf','파일명 확인',''],['A-107__R01.pdf','파일명 확인',''],
 ['A-108_상세도_R01.pdf','이전 리비전','R03'],['A-108_상세도_R02.pdf','이전 리비전','R03'],['A-108_상세도_R03.pdf','정상','R03'],['A-108_상세도_R03.dwg','정상','R03'],
 ['A-109_배치도_R02.pdf','이전 리비전','R10'],['A-109_배치도_R10.pdf','정상','R10'],['A-109_배치도_R10.dwg','정상','R10'],
 ['원본/A-110_계단상세_R02.pdf','확인 필요','R02'],['복사본/A-110_계단상세_R02.pdf','확인 필요','R02'],['A-110_계단상세_R02.dwg','정상','R02'],
 ['A-111_로비_벽체상세_R01.pdf','정상','R01'],['A-111_로비_벽체상세_R01.dwg','정상','R01'],
 ['설명.txt','제외','지원하지 않는 형식'],['A-112_임시도면_R01.pdf.tmp','제외','임시·백업 파일'],['.숨김.pdf','제외','숨김 이름 또는 숨김 폴더'],['.숨김폴더/A-113_검토도면_R01.pdf','제외','숨김 이름 또는 숨김 폴더'],['~$A-114_임시도면_R01.dwg','제외','임시·백업 파일']
];
const testRoot=path.join(internal,'test-set/DRAWING_TEST');mkdirSync(testRoot,{recursive:true});
const files=fixtures.map(([relativePath,status,detail])=>{
 const target=path.join(testRoot,relativePath);mkdirSync(path.dirname(target),{recursive:true});
 const bytes=Buffer.from('교육용 파일명 점검 stub\n실제 PDF/DWG/DXF 도면이 아닙니다.\n'+relativePath+'\n','utf8');writeFileSync(target,bytes);
 return {name:path.basename(relativePath),relativePath,size:bytes.length,lastModified:0,purpose:'파일명 점검용 stub · 실제 도면 아님',expected:status==='제외'?{status,reason:detail}:{status,latest:detail}};
});
const manifest={title:'도면 제출 전 빠른 점검 · 교육용 파일명 테스트',notice:'모든 파일은 파일명 점검용 stub이며 실제 도면이 아닙니다.',count:files.length,expectedSummary:{total:29,checked:24,drawings:9,needsCheck:8,previous:4,excluded:5},files};
for(const target of [path.join(source,'sample-manifest.json'),path.join(student,'sample-manifest.json')])writeFileSync(target,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(path.join(source,'sample-data.js'),'globalThis.DrawingSample = '+JSON.stringify(manifest,null,2)+';\n');
const context={};vm.runInNewContext(readFileSync(path.join(source,'rules.js'),'utf8'),context);const result=context.DrawingRules.inspect(files);writeFileSync(path.join(student,'DRAWING_QUICK_CHECK_SAMPLE_RESULTS.csv'),context.DrawingRules.toCsv(result),'utf8');
copyFileSync(path.join(source,'README.txt'),path.join(student,'DRAWING_QUICK_CHECK_README.txt'));
const runtime=['index.html','app.js','rules.js','style.css','sample-data.js','sample-manifest.json','README.txt'];
const zipScript=`import pathlib,zipfile,sys,json\nsource,student,testroot=map(pathlib.Path,sys.argv[1:4])\nfiles=json.loads(sys.argv[4])\nwith zipfile.ZipFile(student/'DRAWING_QUICK_CHECK_PROGRAM.zip','w',zipfile.ZIP_DEFLATED) as z:\n for name in files: z.write(source/name,'drawing-quick-check/'+name)\nwith zipfile.ZipFile(student/'DRAWING_QUICK_CHECK_TEST.zip','w',zipfile.ZIP_DEFLATED) as z:\n for p in sorted(testroot.rglob('*')):\n  if p.is_file(): z.write(p,'DRAWING_TEST/'+str(p.relative_to(testroot)))\n z.write(student/'sample-manifest.json','sample-manifest.json')\n z.write(student/'DRAWING_QUICK_CHECK_README.txt','README.txt')\n`;
const zipped=spawnSync('python',['-',source,student,testRoot,JSON.stringify(runtime)],{input:zipScript,encoding:'utf8'});if(zipped.status!==0)throw new Error(zipped.stderr);
const names=['DRAWING_QUICK_CHECK_PROGRAM.zip','DRAWING_QUICK_CHECK_TEST.zip','DRAWING_QUICK_CHECK_README.txt','DRAWING_QUICK_CHECK_FIRST_REQUEST.txt','DRAWING_QUICK_CHECK_IMPLEMENTATION_APPROVAL.txt','DRAWING_QUICK_CHECK_SAMPLE_RESULTS.csv','sample-manifest.json','DRAWING_QUICK_CHECK_DESKTOP.png','DRAWING_QUICK_CHECK_MOBILE.png','DRAWING_QUICK_CHECK_MOBILE_320.png'];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
writeFileSync(path.join(student,'download-manifest.json'),JSON.stringify({title:'도면 제출 전 빠른 점검',runtimeFiles:runtime,files:names.filter(name=>existsSync(path.join(student,name))).map(file=>{const bytes=readFileSync(path.join(student,file));return {file,bytes:bytes.length,sha256:sha(bytes)};})},null,2)+'\n');
writeFileSync(path.join(internal,'source-manifest.json'),JSON.stringify({runtime:runtime.map(file=>{const bytes=readFileSync(path.join(source,file));return{file,bytes:bytes.length,sha256:sha(bytes)};}),testFiles:files.map(file=>({file:file.relativePath,sha256:sha(readFileSync(path.join(testRoot,file.relativePath)))}))},null,2)+'\n');
console.log(JSON.stringify({runtime:runtime.length,fixtures:files.length,summary:result.summary,student},null,2));
