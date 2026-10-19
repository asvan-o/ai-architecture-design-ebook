import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createHash,randomUUID} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),root=process.cwd();
const source=path.join(root,'review/daejeon/AI_파일자동정리');
const fixtures=path.join(root,'review/daejeon/SORT_TEST');
const scratch=path.join(root,'tmp/file-sorter-implementation');
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){const input=path.join(from,entry.name),output=path.join(to,entry.name);if(entry.isDirectory())copyTree(input,output);else{assert(entry.isFile(),'copy excludes links');fs.copyFileSync(input,output,fs.constants.COPYFILE_EXCL);}}}
const runRoot=path.join(scratch,'run 한글 공백 '+randomUUID());
console.log('Preparing isolated runtime test:',runRoot);
copyTree(source,runRoot);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,label,timeout=18000){const start=Date.now();for(;;){try{const value=await predicate();if(value)return value;}catch{}if(Date.now()-start>timeout)throw new Error('Timeout: '+label);await pause(80);}}
async function freePort(){const s=http.createServer();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));const port=s.address().port;await new Promise(resolve=>s.close(resolve));return port;}
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(fixtures,'manifest.json'),'utf8'));
const rules=JSON.parse(fs.readFileSync(path.join(runRoot,'app/rules.json'),'utf8'));
rules.port=await freePort();rules.pollMs=80;rules.stableMs=800;
fs.writeFileSync(path.join(runRoot,'app/rules.json'),JSON.stringify(rules,null,2));
fs.copyFileSync(path.join(root,'scripts/file-sorter-fs-audit.cjs'),path.join(runRoot,'app/_audit.cjs'));
const origin='http://127.0.0.1:'+rules.port;
const get=async()=>{const response=await fetch(origin+'/api/state');if(!response.ok)throw new Error('State '+response.status);return response.json();};
const post=async(route,body,extra={})=>{const state=await get();return fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json','X-Sorter-Token':state.token,...extra},body:JSON.stringify(body||{})});};
const put=(name,data)=>{const dest=path.join(runRoot,'00_수집함',name);assert(!fs.existsSync(dest),'inbox already exists '+name);fs.writeFileSync(dest,data);return dest;};
const receipt=async(name,status)=>until(async()=>{const s=await get();return s.recent.find(r=>r.name===name&&(!status||r.status===status));},name+' '+status);
const cases=[],rows=[],ui=[],pageErrors=[];
const pass=(name,details)=>{cases.push({name,passed:true,details});console.log('PASS: '+name);};
let child,browser,sentinel,passed=false,errorText='',stdout='',stderr='';
try{
 const {classify,ignored}=require(path.join(source,'app/classifier.js'));
 for(const group of rules.direct)for(const ext of group.extensions)assert.equal(classify('test'+ext,rules).folder,group.folder);
 for(const group of rules.keywords)for(const word of group.words)assert.equal(classify(word+'.png',rules).folder,group.folder);
 assert.equal(classify('plan_render.png',rules).folder,'99_분류확인');
 assert.equal(classify('planting.png',rules).folder,'99_분류확인');
 assert.equal(classify('office_plan.xyz',rules).folder,'99_분류확인');
 for(const name of ['copy.tmp','download.part','download.crdownload','~$temp.docx'])assert(ignored(name));
 pass('모든 확장자·키워드 및 충돌·.xyz·임시파일 규칙');
 child=spawn(process.execPath,['--require',path.join(runRoot,'app/_audit.cjs'),path.join(runRoot,'app/app.js')],{cwd:runRoot,windowsHide:true,stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
 await until(async()=>(await get()).status==='watching','startup');
 pass('실제 Node HTTP 서버 시작',{node:process.versions.node,port:rules.port});
 for(const file of manifest.files){assert.equal(hash(path.join(fixtures,file.file)),file.sha256);put(file.file,fs.readFileSync(path.join(fixtures,file.file)));}
 const initial=await until(async()=>{const state=await get();return state.automaticCount===9&&state.pendingCount===2&&state;},'11 fixtures');
 for(const file of manifest.files){
  const record=initial.recent.find(r=>r.name===file.file);assert(record);
  assert.equal(record.folder,file.expectedFolder);assert.equal(record.sha256,file.sha256);
  assert.equal(hash(path.join(runRoot,record.originalPath)),file.sha256);
  assert.equal(hash(path.join(runRoot,record.outputPath)),file.sha256);
  assert(!fs.existsSync(path.join(runRoot,'00_수집함',file.file)));
  rows.push({file:file.file,expected:file.expectedFolder,actual:record.folder,status:record.status,sha256:file.sha256,backupVerified:true,outputVerified:true,type:file.type});
 }
 pass('11개 실제 파일: 자동 9·확인 대기 2, 입출력·보관 SHA 동일',rows);
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#pending-count')?.textContent==='2');
  await page.locator('#pending img').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('#pending img')].every(i=>i.complete&&i.naturalWidth>0));
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert(overflow.scroll<=overflow.client,'overflow '+width);
  assert.equal(await page.locator('.file-card').count(),2);
  await page.screenshot({path:path.join(scratch,'file-sorter-ui-'+width+'.png'),fullPage:true});
  ui.push({width,height:900,overflow:false,pendingCards:2,previewDecoded:true});
 }
 pass('UI 1440/390/320px·이미지 미리보기·overflow',ui);
 await page.setViewportSize({width:1440,height:900});
 let state=await get();const image=state.pending.find(r=>r.name==='image001.png');
 const card=page.locator('[data-record-id="'+image.id+'"]');
 await card.locator('select').selectOption('07_문서');await page.locator('#refresh').focus();await page.locator('#refresh').click();assert.equal(await card.locator('select').inputValue(),'07_문서');await card.locator('button').click();
 const manual=await receipt('image001.png','manual');assert.equal(manual.folder,'07_문서');assert.equal(hash(path.join(runRoot,manual.outputPath)),image.sha256);assert.equal(hash(path.join(runRoot,image.originalPath)),image.sha256);
 const scan=(await get()).pending.find(r=>r.name==='scan003.pdf');
 assert.equal((await post('/api/manual',{id:scan.id,folder:'99_분류확인'})).status,200);
 assert((await get()).pending.some(r=>r.id===scan.id));
 pass('실제 UI 수동 분류 및 기타 유지·원본보관 유지');
 assert.equal((await post('/api/manual',{id:scan.id,folder:'../outside'})).status,400);
 assert.equal((await post('/api/manual',{id:scan.id,folder:'07_문서'},{'X-Sorter-Token':'wrong'})).status,403);
 assert.equal((await post('/api/manual',{id:scan.id,folder:'07_문서'},{Origin:'https://example.invalid'})).status,403);
 const invalidHost=await new Promise((resolve,reject)=>{const request=http.get(origin+'/api/state',{headers:{Host:'example.invalid'}},response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);});
 assert.equal(invalidHost,403);
 assert.equal((await fetch(origin+'/data/registry.json')).status,404);
 pass('경로·제어 token·Origin·Host·정적 파일 접근 제한');
 const countOriginal=()=>fs.readdirSync(path.join(runRoot,'00_원본보관')).length;
 const countOutput=()=>rules.folders.reduce((n,f)=>n+fs.readdirSync(path.join(runRoot,f.folder)).length,0);
 const originalsBefore=countOriginal(),outputsBefore=countOutput();
 put('office_floorplan.png',fs.readFileSync(path.join(fixtures,'office_floorplan.png')));
 await receipt('office_floorplan.png','duplicate');assert.equal(countOriginal(),originalsBefore);assert.equal(countOutput(),outputsBefore);assert(fs.existsSync(path.join(runRoot,'00_수집함/office_floorplan.png')));
 const duplicates=(await get()).duplicateCount;await pause(1100);assert.equal((await get()).duplicateCount,duplicates);
 pass('SHA 중복: 추가 보관·출력 없음, 입력 유지, 반복 알림 억제');
 for(const [i,text] of ['first version','second version','third version'].entries()){
  put('same_name.txt',text);await until(async()=>{const s=await get();return s.recent.filter(r=>r.name==='same_name.txt'&&r.status==='automatic').length===i+1;},'versions');
 }
 for(const [name,text] of [['same_name.txt','first version'],['same_name_v02.txt','second version'],['same_name_v03.txt','third version']])assert.equal(fs.readFileSync(path.join(runRoot,'07_문서',name),'utf8'),text);
 for(const [i,text] of ['custom one','custom two'].entries()){put('custom_v01.txt',text);await until(async()=>{const s=await get();return s.recent.filter(r=>r.name==='custom_v01.txt'&&r.status==='automatic').length===i+1;},'existing suffix');}
 assert.equal(fs.readFileSync(path.join(runRoot,'07_문서/custom_v02.txt'),'utf8'),'custom two');
 pass('같은 이름 다른 내용: _v02/_v03, 기존 _v01 처리·덮어쓰기 없음');
 const slow=path.join(runRoot,'00_수집함/report_slow.txt');let slowText='';
 const handle=fs.openSync(slow,'wx');
 for(let i=0;i<12;i++){const chunk='chunk-'+i+' '+randomUUID()+'\n';slowText+=chunk;fs.writeSync(handle,chunk);fs.fsyncSync(handle);await pause(100);assert(!fs.existsSync(path.join(runRoot,'00_원본보관/report_slow.txt')),'copied before stable');}
 fs.closeSync(handle);const finished=Date.now();
 const slowRecord=await receipt('report_slow.txt','automatic');assert(Date.now()-finished>=rules.stableMs-180);assert.equal(fs.readFileSync(path.join(runRoot,slowRecord.outputPath),'utf8'),slowText);
 pass('복사 중 12회 크기·mtime 변경 대기, 안정 구간 후 처리',{testStableMs:rules.stableMs,defaultStableMs:2000});
 for(const name of ['copy.tmp','download.part','download.crdownload','~$temp.docx'])put(name,'ignore '+name);
 await pause(1000);for(const name of ['copy.tmp','download.part','download.crdownload','~$temp.docx']){assert(fs.existsSync(path.join(runRoot,'00_수집함',name)));assert(!(await get()).recent.some(r=>r.name===name));}
 pass('임시파일 4종 무시·수집함 유지');
 const materialFiles=fs.readdirSync(path.join(root,'src/assets/lessons/04/material-reference-review')).filter(n=>n.endsWith('.png')&&!n.includes('m-23')).sort();
 for(const [i,name] of ['plan_render.png','planting.png','render_failure.png'].entries())put(name,fs.readFileSync(path.join(root,'src/assets/lessons/04/material-reference-review',materialFiles[i])));
 for(const name of ['plan_render.png','planting.png'])assert.equal((await receipt(name,'pending')).folder,'99_분류확인');
 put('office_plan.xyz','1 2 3\n4 5 6');assert.equal((await receipt('office_plan.xyz','pending')).folder,'99_분류확인');
 put('unknown.bin','unknown format '+randomUUID());assert.equal((await receipt('unknown.bin','pending')).folder,'99_분류확인');
 const fail=await receipt('render_failure.png','failed');assert(fs.existsSync(path.join(runRoot,fail.sourcePath)));assert.equal(hash(path.join(runRoot,fail.sourcePath)),fail.sha256);assert.equal(hash(path.join(runRoot,fail.originalPath)),fail.sha256);assert(!fs.existsSync(path.join(runRoot,'04_이미지결과/render_failure.png')));
 await page.locator('#refresh').click();await page.waitForFunction(()=>document.querySelector('#failed-count')?.textContent==='1');assert((await page.locator('#errors').innerText()).includes('EACCES'));
 pass('모호성·알 수 없는 확장자 및 저장 실패: 입력·보관 유지, log/UI 실패',{failure:'EACCES fault injection, not a physical disk failure'});
 const outsideDir=path.join(scratch,'outside '+randomUUID());fs.mkdirSync(outsideDir);const outsideFile=path.join(outsideDir,'secret.txt');fs.writeFileSync(outsideFile,'external test '+randomUUID());const outsideHash=hash(outsideFile);
 const link=path.join(runRoot,'00_수집함/outside_link.txt'),junction=path.join(runRoot,'00_수집함/outside_junction');
 fs.linkSync(outsideFile,link);fs.symlinkSync(outsideDir,junction,'junction');
 await until(async()=>(await get()).errors.some(e=>e.name==='outside_link.txt'),'hardlink rejected');
 await until(async()=>(await get()).errors.some(e=>e.name==='outside_junction'),'junction rejected');
 assert.equal(hash(outsideFile),outsideHash);assert(!fs.existsSync(path.join(runRoot,'00_원본보관/outside_link.txt')));
 pass('외부 hardlink/junction 입력 제외·외부 파일 SHA 유지');
 const collisionRoot=path.join(scratch,'collision '+randomUUID());copyTree(source,collisionRoot);
 fs.writeFileSync(path.join(collisionRoot,'app/rules.json'),JSON.stringify(rules,null,2));
 const collision=spawnSync(process.execPath,[path.join(collisionRoot,'app/app.js')],{cwd:collisionRoot,encoding:'utf8',windowsHide:true,timeout:12000});
 assert.equal(collision.status,1);assert(collision.stderr.includes('이미 사용 중'));assert(!fs.existsSync(path.join(collisionRoot,'data/runtime.json')));
 pass('localhost 포트 충돌: 명확한 오류·자동 대체/실행 없음');
 sentinel=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'});
 await page.locator('#stop').click();await until(()=>child.exitCode!==null,'UI shutdown');
 assert.equal(child.exitCode,0,stderr);assert(!fs.existsSync(path.join(runRoot,'data/runtime.json')));assert(!fs.existsSync(path.join(runRoot,'data/instance.lock')));
 put('stopped_input.txt','after stop '+randomUUID());await pause(1000);assert(fs.existsSync(path.join(runRoot,'00_수집함/stopped_input.txt')));assert.equal(sentinel.exitCode,null);
 const audit=JSON.parse(fs.readFileSync(path.join(runRoot,'data/fs-audit.json'),'utf8'));assert.deepEqual(audit.outsideAttempts,[]);
 pass('UI 종료: 감시·서버 중단, 다른 Node 프로세스 유지');
 pass('명시적 fs 호출 감사: 자체 root 밖 시도 0',{accessedPaths:audit.accesses.length,scope:'application fs calls; excludes OS/runtime/browser internals'});
 // Remove only verification-created directory entry / hardlink, never their external targets.
 for(const p of [link,junction]){assert(path.relative(runRoot,p).startsWith('00_수집함'+path.sep));fs.unlinkSync(p);}
 const relocated=path.join(scratch,'복사 이동 검증 '+randomUUID());copyTree(runRoot,relocated);
 const movedRules=JSON.parse(fs.readFileSync(path.join(relocated,'app/rules.json'),'utf8'));movedRules.port=await freePort();movedRules.pollMs=250;movedRules.stableMs=2000;fs.writeFileSync(path.join(relocated,'app/rules.json'),JSON.stringify(movedRules,null,2));
 function bat(name){return spawnSync('cmd.exe',['/d','/c',name,'--noninteractive'],{cwd:relocated,encoding:'utf8',windowsHide:true,timeout:35000});}
 const start=bat('START.bat');assert.equal(start.status,0,start.stdout+'\n'+start.stderr);
 const moved=await fetch('http://127.0.0.1:'+movedRules.port+'/api/state').then(r=>r.json());assert.equal(moved.root,fs.realpathSync(relocated));
 assert.equal(moved.stableMs,2000);
 await until(()=>fs.existsSync(path.join(relocated,'07_문서/stopped_input.txt')),'production stable 2000ms');
 const duplicateStart=bat('START.bat');assert.equal(duplicateStart.status,0,duplicateStart.stderr);
 const stop=bat('STOP.bat');assert.equal(stop.status,0,stop.stdout+'\n'+stop.stderr);assert(!fs.existsSync(path.join(relocated,'data/runtime.json')));assert.equal(sentinel.exitCode,null);
 assert.equal(fs.readFileSync(path.join(relocated,'07_문서/same_name_v03.txt'),'utf8'),'third version');
 pass('한글·공백 폴더 복사 후 START/STOP.bat·중복 START·자체 instance 종료',{root:relocated});
 assert.deepEqual(pageErrors,[]);pass('브라우저 JavaScript 오류 없음');
 for(const item of manifest.files){const row=rows.find(r=>r.file===item.file);Object.assign(item,{actualFolder:row.actual,result:'통과',backupSha256Verified:true,outputSha256Verified:true});}
 manifest.verification={verifiedAt:new Date().toISOString(),node:process.versions.node,platform:process.platform,testStableMs:rules.stableMs,productionStableMs:2000,initialClassification:true};
 fs.writeFileSync(path.join(fixtures,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 passed=true;
}catch(error){errorText=error.stack||String(error);console.error(errorText);process.exitCode=1;}
finally{
 if(browser)await browser.close();
 if(child&&child.exitCode===null){try{await post('/api/stop');await until(()=>child.exitCode!==null,'cleanup shutdown',7000);}catch{child.kill();}}
 if(sentinel&&sentinel.exitCode===null)sentinel.kill();
 const result={passed,verifiedAt:new Date().toISOString(),node:process.versions.node,platform:process.platform,runRoot,rows,cases,ui,pageErrors,error:errorText,serverStdout:stdout,serverStderr:stderr};
 fs.writeFileSync(path.join(scratch,'runtime-verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed,cases:cases.length,fixtures:rows.length,ui,report:'tmp/file-sorter-implementation/runtime-verification.json'}));
}
