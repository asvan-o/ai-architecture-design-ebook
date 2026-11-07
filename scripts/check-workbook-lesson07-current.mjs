import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import ts from 'typescript';
import sharp from 'sharp';
import {repositoryRoot} from './course-registry.mjs';
import {verifyLesson07Assets} from './build-daejeon-lesson07-assets.mjs';
import {floorplanAudit, floorplanPromptDefinitions, displayFloorplanPrompt, verifyLesson07FloorplanAssets} from './daejeon-lesson07-floorplan-assets.mjs';
import {verifyLesson08Assets} from './daejeon-lesson08-assets.mjs';

const read=file=>fs.readFileSync(path.join(repositoryRoot,file));
const json=file=>JSON.parse(read(file).toString('utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const dimensionFixture='scripts/tests/fixtures/approved-workbook-dimension-correction.json';
const checksumName='SHA256SUMS.txt';

// Read ordinary ZIP central directories in memory. No extraction, report file or
// historical audit program is needed for this current-workbook validation path.
function zipMembers(bytes){
 let end=-1;
 for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--){
  if(bytes.readUInt32LE(offset)===0x06054b50){end=offset;break;}
 }
 assert(end>=0,'ZIP end-of-central-directory missing');
 const count=bytes.readUInt16LE(end+10),members=new Map();
 let offset=bytes.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  assert.equal(bytes.readUInt32LE(offset),0x02014b50,'ZIP central-directory signature');
  const method=bytes.readUInt16LE(offset+10),compressedSize=bytes.readUInt32LE(offset+20);
  const nameLength=bytes.readUInt16LE(offset+28),extraLength=bytes.readUInt16LE(offset+30),commentLength=bytes.readUInt16LE(offset+32);
  const name=bytes.subarray(offset+46,offset+46+nameLength).toString('utf8');
  assert(!members.has(name),'Duplicate ZIP member: '+name);
  assert(!name.startsWith('/')&&!name.split('/').includes('..'),'Unsafe ZIP member: '+name);
  const local=bytes.readUInt32LE(offset+42);
  assert.equal(bytes.readUInt32LE(local),0x04034b50,'ZIP local-header signature');
  const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28);
  const compressed=bytes.subarray(start,start+compressedSize);
  assert(method===0||method===8,'Unsupported ZIP compression method: '+method);
  const member=method===0?compressed:inflateRawSync(compressed);
  assert.equal(member.length,bytes.readUInt32LE(offset+24),'ZIP uncompressed size: '+name);
  members.set(name,member);
  offset+=46+nameLength+extraLength+commentLength;
 }
 return members;
}

function verifyZipChecksum(file){
 const members=zipMembers(read(file));
 assert(members.has(checksumName),'ZIP checksum manifest missing: '+file);
 const lines=members.get(checksumName).toString('utf8').trim().split('\n');
 assert.equal(lines.length,members.size-1,'Every ZIP member needs a checksum: '+file);
 for(const line of lines){
  const match=line.match(/^([a-f0-9]{64})  (.+)$/);assert(match,'Invalid checksum line: '+file);
  assert(members.has(match[2]),'Missing ZIP member: '+match[2]);
  assert.equal(hash(members.get(match[2])),match[1],'ZIP member checksum: '+match[2]);
 }
 return members;
}

async function lessonData(file,replacePrompts=false){
 let source=read(file).toString('utf8');
 if(replacePrompts)source=source.replace("import prompts from './lesson07-prompts.json';",'const prompts='+JSON.stringify(json('src/draft/content/lesson07-prompts.json'))+';');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}

export async function checkCurrentWorkbookLesson07(){
 const approved=json(dimensionFixture);
 assert.equal(approved.baseRevision,'7f5924ca4e47e00c58a20446926819360a424acc');
 assert.equal(approved.files.length,7,'The furniture exception must remain narrowly scoped');
 for(const file of approved.files)assert.equal(hash(read(file.file)),file.afterSha256,'Approved furniture asset: '+file.file);
 const manifest07=verifyLesson07Assets(),manifest08=verifyLesson08Assets(),legacy=verifyLesson07FloorplanAssets();
 const geometry=json('public/downloads/daejeon/lesson-08/office-geometry.json');
 assert.deepEqual(geometry.axisEnvelopeMetres,[24,16]);
 const polygonArea=Math.abs(geometry.outline.reduce((sum,[x,y],i,vertices)=>{const [nx,ny]=vertices[(i+1)%vertices.length];return sum+x*ny-y*nx;},0))/2;
 assert.equal(polygonArea,348);assert.equal(geometry.centerlinePolygonAreaSquareMetres,348);
 assert(Math.abs(geometry.approximatePyeong-348/3.305785)<.01);
 assert.deepEqual(geometry.furniture.directorDesk.dimensionsMillimetres,[1800,800]);
 assert.deepEqual(geometry.furniture.conferenceTable.dimensionsMillimetres,[3200,1200]);
 assert.equal(geometry.furniture.conferenceTable.seatingCapacity,8);
 assert.equal(geometry.furniture.conferenceTable.chairBoundsMetres.length,8);
 assert(geometry.boundsInterpretation.includes('겹치'));assert(geometry.stairAndElevatorInterpretation.includes('교육용'));

 const snapshot=json(floorplanAudit+'/before.json');
 const sourceFiles=['src/draft/content/lesson07-floorplan-source.json','src/draft/content/lesson07-prompts.json'];
 for(const file of sourceFiles){
  const original=snapshot.files.find(row=>row.file===file);assert(original,'Historical prompt baseline missing: '+file);
  assert.equal(hash(read(file)),original.sha256,'Protected original prompt JSON: '+file);
 }
 const protected3D=snapshot.files.filter(row=>/^public\/(?:images|downloads)\/daejeon\/lesson-07\//.test(row.file)&&/(?:02-top-view-3d\.jpeg|gaussian-(?:input-\d+\.jpg|lecture-input\.jpeg|topview-input\.png|3d-reference\.png)|upscale-input-(?:256|low|photo)\.png)$/.test(row.file));
 assert(protected3D.length>=8,'Historical 3D protection snapshot is incomplete');
 for(const row of protected3D)assert.equal(hash(read(row.file)),row.sha256,'Preserved existing 3D image: '+row.file);
 assert.equal(hash(read('public/images/daejeon/lesson-08/floorplan/02-top-view-3d.jpeg')),hash(read('public/images/daejeon/lesson-07/floorplan/02-top-view-3d.jpeg')));

 for(const [a,b] of [
  ['public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf','public/downloads/daejeon/lesson-07/floorplan/DJ-L07-Office-Floorplan-Original.pdf'],
  ['public/downloads/daejeon/lesson-08/00-office-floorplan-original.png','public/images/daejeon/lesson-07/comfy-reference-before.png'],
  ['public/images/daejeon/lesson-08/floorplan/01-clean-line.jpg','public/images/daejeon/lesson-07/floorplan/01-clean-line.jpg'],
  ['public/downloads/daejeon/lesson-08/office-geometry.json','public/downloads/daejeon/lesson-07/floorplan/office-geometry.json'],
 ])assert.equal(hash(read(a)),hash(read(b)),'Active and compatibility aliases differ: '+a);
 assert.equal(read('public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf').subarray(0,5).toString(),'%PDF-');
 for(const [file,width,height] of [['public/images/daejeon/lesson-07/comfy-reference-before.png',1680,1188],['public/images/daejeon/lesson-07/comfy-reference-after-2x.png',3360,2376],['public/images/daejeon/lesson-08/floorplan/01-clean-line.jpg',1680,1188]]){
  const metadata=await sharp(read(file)).metadata();assert.equal(metadata.width,width,file);assert.equal(metadata.height,height,file);
 }

 const content=read('src/draft/components/Lesson07FloorplanPart.astro').toString('utf8');
 const promptIds=['l07-plan-analysis','l07-plan-criteria','l07-clean-line-prompt','l07-plan-topview','l07-spatial-analysis','l07-spatial-validation-prompt','l07-graphviz-prompt','l07-actual-dot'];
 assert.deepEqual([...content.matchAll(/<ReviewPrompt\b[^>]*\bid="([^"]+)"/g)].map(match=>match[1]),promptIds);
 const source=json('src/draft/content/lesson07-floorplan-source.json');
 const workbook=read('src/draft/content/lesson08-workbook-prompts.ts').toString('utf8');
 const topView=JSON.parse(workbook.match(/topViewPrompt:("(?:\\.|[^"\\])*")/)[1]);
 for(const [key,file] of floorplanPromptDefinitions)assert.equal(read('public/downloads/daejeon/lesson-08/'+file+'.txt').toString('utf8'),displayFloorplanPrompt(key==='topViewPrompt'?topView:source[key])+'\n','Active prompt download: '+file);
 const cleanLine=JSON.parse(workbook.match(/export const cleanLinePrompt=("(?:\\.|[^"\\])*")/)[1]);
 assert.equal(read('public/downloads/daejeon/lesson-08/DJ-L07-clean-line-preprocess.txt').toString('utf8'),cleanLine+'\n');
 assert.equal(read('public/downloads/daejeon/lesson-08/Graphviz-DOT-source.txt').toString('utf8'),source.actualDotCode+'\n');

 const lesson07=await lessonData('src/draft/content/daejeon-lesson07.ts',true),lesson08=await lessonData('src/draft/content/daejeon-lesson08.ts');
 for(const [data,prefix,sections,parts,minutes] of [[lesson07,'lesson07',16,6,300],[lesson08,'lesson08',9,3,150]]){
  assert.equal(data[prefix+'Sections'].length,sections);assert.equal(data[prefix+'Parts'].length,parts);
  assert.equal(data[prefix+'Sections'].reduce((sum,section)=>sum+section.minutes,0),minutes);
  assert(data[prefix+'Parts'].every(part=>part.sections.reduce((sum,section)=>sum+section.minutes,0)===50));
  assert.deepEqual(data[prefix+'Parts'].flatMap(part=>part.sections.map(section=>section.id)),data[prefix+'Sections'].map(section=>section.id));
  assert.equal(data[prefix+'Meta'].durationMinutes,minutes);assert.equal(data[prefix+'Meta'].status,'design-pending');assert.equal(data[prefix+'Meta'].reviewStatus,'instructor-review');
 }

 const download07='public/downloads/daejeon/lesson-07/',download08='public/downloads/daejeon/lesson-08/';
 const zipPaths=[...manifest07.files,...manifest08.files,...legacy.files].filter(file=>file.kind==='zip'&&!/Blender-MCP/.test(file.outputPath)).map(file=>'public/'+file.outputPath);
 for(const file of zipPaths){
  const members=verifyZipChecksum(file);
  if(file.endsWith('DJ-L08-Floorplan-Graphviz-Pack.zip')){
   assert.equal(members.size,18);assert.equal(hash(members.get('office-geometry.json')),hash(read(download08+'office-geometry.json')));
   for(const asset of manifest08.files.filter(asset=>asset.kind==='image'||asset.kind==='original-pdf')){
    const member=(asset.kind==='image'?'images/':'')+path.basename(asset.outputPath);
    assert.equal(hash(members.get(member)),asset.sha256,'Packaged corrected asset: '+member);
   }
   assert.equal(hash(members.get(checksumName)),hash(read(download08+checksumName)));
  }
  if(file.endsWith('DJ-L07-Realistic-Render-Pack.zip'))for(const name of ['comfy-reference-before.png','comfy-reference-after-2x.png'])assert.equal(hash(members.get(name)),hash(read('public/images/daejeon/lesson-07/'+name)));
  if(file.endsWith('DJ-L07-Starter-Pack.zip'))for(const name of ['DJ-L07-Gaussian-Views-Pack.zip','DJ-L07-Realistic-Render-Pack.zip','DJ-L07-OpenVINO-SR1033-Pack.zip'])assert.equal(hash(members.get(name)),hash(read(download07+name)),'Nested current package: '+name);
 }
 const report={passed:true,mode:'current-approved-workbook',readOnly:true,historicalReportsWritten:0,approvedDimensionAssets:approved.files.length,lesson07Assets:manifest07.files.length,lesson08Assets:manifest08.files.length,legacyFloorplanAssets:legacy.files.length,protectedPromptJsons:sourceFiles.length,preserved3DImages:protected3D.length,copyBlocks:promptIds.length,zipChecksums:zipPaths.length,sections:{lesson07:16,lesson08:9},parts:{lesson07:6,lesson08:3},minutes:{lesson07:300,lesson08:150},approval:'Codex 자체 기능 검증이며 독립 검수·사용자 최종 승인을 대체하지 않습니다.'};
 console.log(JSON.stringify(report,null,2));
 return report;
}
