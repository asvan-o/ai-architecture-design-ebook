import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,readFile,stat,cp,link,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {defaultConfig,isLocalReleaseMirror,makeReleasePlan,preparePages,rewriteAssetUrl,rewriteText} from '../pages-release-assets.mjs';
import {legacyReleasePath,publicReleasePath} from '../workbook-public-paths.mjs';

const mirror='workbook/practice/DJ-L04/application/DJ-L04-exterior-applications.zip';
const legacy=legacyReleasePath(mirror);
const releaseUrl='https://github.com/asvan-o/ai-architecture-design-ebook/releases/download/course-materials-2026-10-19-v1/DJ-L04-exterior-applications.zip';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('지역 중립 경로와 기존 경로의 정확한 L04 ZIP 한 종만 Pages 미러로 분류한다',()=>{
 assert(isLocalReleaseMirror(mirror));assert(isLocalReleaseMirror(legacy));assert.equal(publicReleasePath(legacy),mirror);
 for(const other of [
  'gwangju/practice/DJ-L04/application/DJ-L04-exterior-applications.zip',
  'workbook/practice/DJ-L04/application/other.zip',mirror+'/index.html',mirror+'?download=1',
  'workbook/practice/DJ-L04/application/DJ-L04-exterior-applications.ZIP',
  'https://other.example/'+mirror,'/'+mirror,'workbook/downloads/lesson-04/DJ-L04-exterior-applications.zip',
 ])assert.equal(isLocalReleaseMirror(other),false,other);
});

test('L04 미러 링크는 쿼리·앵커와 JSON 표기를 유지하고 다른 다운로드의 Release 치환은 보존한다',()=>{
 const other='gwangju/downloads/other.zip';
 const plan={...defaultConfig,files:[{path:mirror,url:releaseUrl},{path:other,url:'https://github.com/asvan-o/ai-architecture-design-ebook/releases/download/tag/other.zip'}]};
 const local=plan.basePath+'/'+mirror,otherLocal=plan.basePath+'/'+other;
 for(const value of [local,local+'?download=1#sample','https://asvan-o.github.io'+local, '../../practice/DJ-L04/application/DJ-L04-exterior-applications.zip']){
  assert.equal(rewriteAssetUrl(value,'workbook/lessons/04/index.html',plan),value);
 }
 const foreign='https://other.example'+local;assert.equal(rewriteAssetUrl(foreign,'index.html',plan),foreign);
 assert.equal(rewriteAssetUrl(otherLocal,'index.html',plan),plan.files[1].url);
 const source=`<a href="${local}">ZIP</a><script>{"url":"${local.replaceAll('/','\\/')}"}</script><a href="${otherLocal}">기존 광주 자료</a>`;
 const out=rewriteText(source,'workbook/lessons/04/index.html',plan);
 assert(out.includes('href="'+local+'"'));assert(out.includes(local.replaceAll('/','\\/')));assert(out.includes('href="'+plan.files[1].url+'"'));assert(!out.includes(releaseUrl));
 const legacyPlan={...plan,files:[{path:legacy,url:releaseUrl}]};
 const oldLocal=plan.basePath+'/'+legacy;assert.equal(rewriteText(`<a href="${oldLocal}">ZIP</a>`,'index.html',legacyPlan),`<a href="${oldLocal}">ZIP</a>`);
 assert.equal(rewriteAssetUrl(releaseUrl,'index.html',plan),releaseUrl);
});

test('Pages 산출물에는 승인된 ZIP 실제 바이너리를 유지하고 용량·해시·기존 Release 행을 함께 검증한다',async()=>{
 const repository=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
 const approvedPlan=JSON.parse(await readFile(path.join(repository,'data/deployment/release-assets.json'),'utf8'));
 const approved=approvedPlan.files.find(file=>file.path===legacy);assert(approved,'기존 Release 승인 행');
 const source=path.join(repository,'review/daejeon/DJ-L04-EXTERIOR-PLAN/application-05-techniques/DJ-L04-exterior-applications.zip');
 const sandbox=await mkdtemp(path.join(os.tmpdir(),'ebook-local-release-mirror-'));
 assert.equal(path.dirname(path.resolve(sandbox)),path.resolve(os.tmpdir()));assert(path.basename(sandbox).startsWith('ebook-local-release-mirror-'));
 try{
  const root=path.join(sandbox,'dist/site'),output=path.join(sandbox,'dist/pages'),manifest=path.join(sandbox,'release-assets.json');
  const target=path.join(root,mirror);await mkdir(path.dirname(target),{recursive:true});
  // Reuse the real approved bytes; do not create a new large fixture asset.
  try{await link(source,target);}catch(error){if(!['EXDEV','EPERM','EACCES','ENOTSUP'].includes(error.code))throw error;await cp(source,target);}
  const pdfs=path.join(root,'workbook/downloads/pdf');await mkdir(pdfs,{recursive:true});
  for(let i=0;i<14;i++)await writeFile(path.join(pdfs,'fixture-'+i+'.pdf'),'%PDF-1.7\n');
  const other='workbook/downloads/mirror-test-other.zip';await mkdir(path.dirname(path.join(root,other)),{recursive:true});await writeFile(path.join(root,other),'other binary');
  const local=defaultConfig.basePath+'/'+mirror;
  await writeFile(path.join(root,'index.html'),`<a href="${local}">L04 ZIP</a><a href="${defaultConfig.basePath+'/'+other}">다른 ZIP</a>`);
  const plan=await makeReleasePlan(root);assert.equal(plan.files.length,2);
  const mirrorEntry=plan.files.find(file=>file.path===mirror);assert.equal(mirrorEntry.sha256,approved.sha256);assert.equal(mirrorEntry.bytes,approved.bytes);assert.equal(mirrorEntry.url,approved.url);
  const movedBytes=plan.files.filter(file=>!isLocalReleaseMirror(file.path)).reduce((sum,file)=>sum+file.bytes,0);
  assert.equal(plan.pagesBytesBeforeMetadata,plan.sourceBytes-movedBytes);assert(plan.pagesBytesBeforeMetadata>=approved.bytes);
  await writeFile(manifest,JSON.stringify({...plan,files:plan.files.map(file=>({...file,path:legacyReleasePath(file.path)}))}));
  const report=await preparePages({root,output,manifest});assert.equal(report.passed,true);assert.equal(report.releasePaths,2);assert.equal(report.releaseFiles,2);assert.equal(report.localReleaseMirrors.length,1);
  const copied=path.join(output,mirror);assert((await stat(copied)).isFile());const bytes=await readFile(copied);assert.equal(bytes.subarray(0,2).toString(),'PK');assert.equal(bytes.length,approved.bytes);assert.equal(sha(bytes),approved.sha256);
  const html=await readFile(path.join(output,'index.html'),'utf8');assert(html.includes('href="'+local+'"'));assert(!html.includes(approved.url));
  assert((await stat(path.join(output,other,'index.html'))).isFile(),'기타 ZIP은 기존 Release 리다이렉트를 유지합니다.');
  assert(report.pagesBytes>=approved.bytes);assert.equal(report.workbookPdfs,14);
 }finally{
  // Only this explicitly created, resolved scratch directory is removed.
  assert.equal(path.dirname(path.resolve(sandbox)),path.resolve(os.tmpdir()));assert(path.basename(sandbox).startsWith('ebook-local-release-mirror-'));
  await rm(sandbox,{recursive:true,force:true});
 }
});
