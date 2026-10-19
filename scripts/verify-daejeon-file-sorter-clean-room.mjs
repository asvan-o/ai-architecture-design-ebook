import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {createHash,randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';import {chromium} from 'playwright';
const root=process.cwd(),scratch=path.join(root,'tmp/file-sorter-student-release'),distribution=path.join(root,'review/daejeon/FILE_SORTER_STUDENT');
fs.mkdirSync(scratch,{recursive:true});
const cleanRoot=path.join(os.tmpdir(),'DJ_L02_CLEAN_ROOM_'+randomUUID()+'_한글 공백'),program=path.join(cleanRoot,'AI_파일자동정리');
fs.mkdirSync(cleanRoot);
const python=process.env.SORT_AUTHOR_PYTHON;if(!python)throw new Error('SORT_AUTHOR_PYTHON authoring runtime path required');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=18000){const start=Date.now();for(;;){try{const result=await fn();if(result)return result;}catch{}if(Date.now()-start>timeout)throw new Error('Timeout '+label);await pause(100);}}
const ps=spawnSync('powershell.exe',['-NoProfile','-Command',"$identity=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent());[pscustomobject]@{elevated=$identity.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator);node=(Get-Command node).Source}|ConvertTo-Json -Compress"],{encoding:'utf8',windowsHide:true});
assert.equal(ps.status,0);const user=JSON.parse(ps.stdout.trim());assert.equal(user.elevated,false);assert.equal(path.resolve(user.node).toLowerCase(),path.resolve(process.execPath).toLowerCase());assert(!process.execPath.includes('codex-runtimes'));
const combined=JSON.parse(fs.readFileSync(path.join(distribution,'DJ-L02_FILE_SORTER_MANIFEST.json'),'utf8'));for(const row of combined.files)assert.equal(hash(path.join(distribution,row.file)),row.sha256);
const report={passed:false,root:cleanRoot,programRoot:program,systemNode:process.execPath,node:process.versions.node,elevated:false,absoluteRepositoryDependency:false,initialEmptyData:false,steps:[],rows:[],duplicateRepeated:false,duplicateObservationMs:6000,programDeleted:false,cleanRootDeleted:false};
const pass=(step,details)=>{report.steps.push({step,passed:true,details});console.log('PASS: '+step);};
const extract='import sys,zipfile,pathlib\nroot=pathlib.Path(sys.argv[1]).resolve()\nfor raw in sys.argv[2:]:\n with zipfile.ZipFile(raw) as z:\n  assert z.testzip() is None\n  for e in z.infolist():\n   assert (root/e.filename).resolve().is_relative_to(root)\n   assert ((e.external_attr>>16)&0o170000)!=0o120000\n  z.extractall(root)\n';
const extraction=spawnSync(python,['-c',extract,cleanRoot,path.join(distribution,'DJ-L02_FILE_SORTER_PROGRAM.zip'),path.join(distribution,'DJ-L02_SORT_TEST.zip')],{encoding:'utf8',windowsHide:true});
assert.equal(extraction.status,0,extraction.stderr);pass('완성된 2개 ZIP을 별도 TEMP 경로에 새로 압축 해제');
const reg=()=>JSON.parse(fs.readFileSync(path.join(program,'data/registry.json'),'utf8')),log=()=>JSON.parse(fs.readFileSync(path.join(program,'data/log.json'),'utf8'));
assert.deepEqual(reg().records,[]);assert.deepEqual(log().events,[]);report.initialEmptyData=true;
for(const row of JSON.parse(fs.readFileSync(path.join(program,'manifest.json'),'utf8')).files)assert.equal(hash(path.join(program,row.file)),row.sha256);
const fixtures=path.join(cleanRoot,'SORT_TEST'),manifest=JSON.parse(fs.readFileSync(path.join(fixtures,'manifest.json'),'utf8'));
assert.equal(manifest.files.length,11);for(const row of manifest.files)assert.equal(hash(path.join(fixtures,row.file)),row.sha256);
pass('개발 data/registry/log 참조 없음·압축 해제 파일 SHA 일치');
const rules=JSON.parse(fs.readFileSync(path.join(program,'app/rules.json'),'utf8')),origin='http://127.0.0.1:'+rules.port;
const get=async()=>{const r=await fetch(origin+'/api/state');assert(r.ok);return r.json();};
const bat=name=>spawnSync('cmd.exe',['/d','/c',name,'--noninteractive'],{cwd:program,encoding:'utf8',windowsHide:true,timeout:35000});
let started=false,browser;
try{
 const start=bat('START.bat');assert.equal(start.status,0,start.stdout+'\n'+start.stderr);started=true;
 const state=await until(async()=>{const s=await get();return s.status==='watching'&&s;},'START');
 assert.equal(state.root,fs.realpathSync(program));assert.equal(state.automaticCount,0);assert.equal(state.pendingCount,0);
 pass('비관리자·시스템 Node로 START.bat 실행',{port:rules.port});
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#status')?.textContent==='감시 중');pass('localhost UI 실제 Chromium 표시');
 for(const row of manifest.files)fs.copyFileSync(path.join(fixtures,row.file),path.join(program,'00_수집함',row.file),fs.constants.COPYFILE_EXCL);
 const first=await until(async()=>{const s=await get();return s.automaticCount===9&&s.pendingCount===2&&s;},'11 files',30000);
 for(const row of manifest.files){const receipt=first.recent.find(r=>r.name===row.file);assert(receipt);assert.equal(receipt.folder,row.expectedFolder);assert.equal(hash(path.join(program,receipt.originalPath)),row.sha256);assert.equal(hash(path.join(program,receipt.outputPath)),row.sha256);report.rows.push({file:row.file,expected:row.expectedFolder,actual:receipt.folder,sha256:row.sha256,backupVerified:true,outputVerified:true});}
 assert(first.pending.some(r=>r.name==='image001.png'));assert(first.pending.some(r=>r.name==='scan003.pdf'));pass('11개 일치·자동9/99확인2·보관/출력 SHA 일치');
 await page.locator('#refresh').click();await page.waitForFunction(()=>document.querySelector('#pending-count')?.textContent==='2');
 const image=first.pending.find(r=>r.name==='image001.png'),card=page.locator('[data-record-id="'+image.id+'"]');
 await card.locator('select').selectOption('07_문서');await card.locator('button').click();
 const manual=await until(()=>reg().records.find(r=>r.id===image.id&&r.status==='manual'),'manual');assert.equal(manual.folder,'07_문서');assert.equal(hash(path.join(program,manual.originalPath)),image.sha256);assert.equal(hash(path.join(program,manual.outputPath)),image.sha256);pass('실제 UI 수동분류 1건·보관 유지');
 const originals=fs.readdirSync(path.join(program,'00_원본보관')).length,outputs=rules.folders.reduce((n,f)=>n+fs.readdirSync(path.join(program,f.folder)).length,0);
 fs.copyFileSync(path.join(fixtures,'office_floorplan.png'),path.join(program,'00_수집함/office_floorplan.png'),fs.constants.COPYFILE_EXCL);
 await until(()=>reg().records.some(r=>r.name==='office_floorplan.png'&&r.status==='duplicate'),'duplicate');
 assert.equal(fs.readdirSync(path.join(program,'00_원본보관')).length,originals);assert.equal(rules.folders.reduce((n,f)=>n+fs.readdirSync(path.join(program,f.folder)).length,0),outputs);assert(fs.existsSync(path.join(program,'00_수집함/office_floorplan.png')));
 const recordCount=reg().records.length,eventCount=log().events.length;await pause(6000);assert.equal(reg().records.length,recordCount);assert.equal(log().events.length,eventCount);report.duplicateRecords=reg().records.filter(r=>r.status==='duplicate').length;report.duplicateLogEventsStable=true;pass('중복 입력 유지·추가 저장 없음·6초(24 poll) 기록 증가 없음',{recordCount,eventCount});
 fs.writeFileSync(path.join(program,'00_수집함/same_name.txt'),'first clean-room version',{flag:'wx'});await until(()=>reg().records.find(r=>r.name==='same_name.txt'&&r.status==='automatic'),'first version');
 fs.writeFileSync(path.join(program,'00_수집함/same_name.txt'),'second clean-room version',{flag:'wx'});await until(()=>reg().records.filter(r=>r.name==='same_name.txt'&&r.status==='automatic').length===2,'second version');
 assert.equal(fs.readFileSync(path.join(program,'07_문서/same_name.txt'),'utf8'),'first clean-room version');assert.equal(fs.readFileSync(path.join(program,'07_문서/same_name_v02.txt'),'utf8'),'second clean-room version');pass('_v02 생성·기존 파일 불변');
 await page.locator('#refresh').click();await page.screenshot({path:path.join(scratch,'clean-room-ui.png'),fullPage:true});
 const stop=bat('STOP.bat');assert.equal(stop.status,0,stop.stdout+'\n'+stop.stderr);started=false;
 assert(!fs.existsSync(path.join(program,'data/runtime.json')));assert(!fs.existsSync(path.join(program,'data/instance.lock')));await assert.rejects(()=>fetch(origin+'/api/state'));
 fs.writeFileSync(path.join(program,'00_수집함/after_stop.txt'),'after stop',{flag:'wx'});await pause(1000);assert(fs.existsSync(path.join(program,'00_수집함/after_stop.txt')));assert(!fs.existsSync(path.join(program,'07_문서/after_stop.txt')));pass('STOP.bat 종료·서버/감시 중단·새 입력 미처리');
 await browser.close();browser=null;
 const deletion=spawnSync('powershell.exe',['-NoProfile','-File',path.join(root,'scripts/verify-daejeon-clean-room-delete.ps1'),'-Root',cleanRoot],{encoding:'utf8',windowsHide:true,timeout:20000});
 assert.equal(deletion.status,0,deletion.stderr);const removed=JSON.parse(deletion.stdout.trim());assert(removed.programDeleted&&removed.cleanRootDeleted);report.programDeleted=true;report.cleanRootDeleted=true;pass('프로그램 파일·data·log 실제 삭제, 검증 전용 TEMP 폴더 삭제');report.passed=true;
}catch(error){report.error=error.stack;console.error(error);process.exitCode=1;}
finally{if(browser)await browser.close();if(started)report.cleanupStopExit=bat('STOP.bat').status;fs.writeFileSync(path.join(scratch,'clean-room-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,steps:report.steps.length,files:report.rows.length,root:cleanRoot,deleted:report.programDeleted,node:report.node,elevated:report.elevated}));}
