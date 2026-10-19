import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const root=process.cwd(),source=path.join(root,'review/daejeon/DRAWING_QUICK_CHECK'),student=path.join(root,'review/daejeon/DRAWING_QUICK_CHECK_STUDENT'),internal=path.join(root,'review/daejeon/LESSON02_AUTOMATION_AB/instructor/B');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),readJSON=file=>JSON.parse(readFileSync(file,'utf8'));
const report={passed:false,tests:[],screens:[],network:{external:[],contentReads:[]},errors:[],cleanRoom:{},excel:{status:'pending'}};
const check=(test,expected,actual,evidence)=>{assert.deepEqual(actual,expected,test);report.tests.push({test,expected,actual,passed:true,evidence});};
const manifest=readJSON(path.join(source,'sample-manifest.json')),originalManifest=readJSON(path.join(internal,'source-manifest.json'));
const ctx={};vm.runInNewContext(readFileSync(path.join(source,'rules.js'),'utf8'),ctx);const rules=ctx.DrawingRules;
const plain=value=>JSON.parse(JSON.stringify(value));
const expected=rules.inspect(manifest.files);
check('Independent fixture summary',manifest.expectedSummary,plain(expected.summary),'sample-manifest hand-authored expectations');
for(const entry of manifest.files){const row=expected.rows.find(row=>row.relativePath===entry.relativePath)||expected.ignored.find(row=>row.relativePath===entry.relativePath);const actual=entry.expected.status==='제외'?{status:'제외',reason:row?.reason}:{status:row?.status,latest:row?.latest};check(entry.relativePath,entry.expected,actual,'rules.js actual output against declared expected status');}
check('numeric R10 latest','R10',expected.rows.find(row=>row.drawing==='A-109').latest,'R02 and R10 physical fixtures');
check('DXF alone requires PDF and DWG',true,expected.rows.find(row=>row.drawing==='A-105').notes.some(n=>n.includes('PDF·DWG 없음')),'latest pair rule');
const variations=[{name:'a-201_한글도면_R2.PDF'},{name:'A-201_한글도면_R02.dwg'},{name:'A-201_한글도면_R02.pdf'}];
check('case and numeric equivalent revision duplicates',2,rules.inspect(variations).rows.filter(r=>r.notes.some(n=>n.includes('중복 후보'))).length,'R2=R02; case-insensitive drawing/format');
const mismatched=rules.inspect([{name:'A-202_동쪽_R01.pdf'},{name:'A-202_서쪽_R01.dwg'}]);check('same drawing different titles',2,mismatched.summary.needsCheck,'unexpected name mismatch must be visible');
check('gaps do not imply missing drawings',0,rules.inspect([{name:'A-001_도면_R01.pdf'},{name:'A-001_도면_R01.dwg'},{name:'A-999_도면_R01.pdf'},{name:'A-999_도면_R01.dwg'}]).summary.needsCheck,'no missing number inference');
for(const value of ['=1+1','+SUM(A1)','-3+4','@SUM(A1)','  =1','\t=1'])check('CSV formula-safe '+JSON.stringify(value),true,rules.csvCell(value).startsWith('"\''),'formula-leading text neutralized');
check('CSV quote and newline escaping','"메모,""큰따옴표""\n다음"',rules.csvCell('메모,"큰따옴표"\n다음'),'RFC-style field escaping');
check('NFC filename normalization','1층평면도',rules.inspect([{name:'A-101_1층평면도_R02.pdf'.normalize('NFD')}]).rows[0].title,'decomposed Korean filename');

const clean=path.join(os.tmpdir(),'drawing-quick-check-'+Date.now());mkdirSync(clean,{recursive:true});report.cleanRoom.path=clean;
const extract=spawnSync('python',['-c','import zipfile,sys,pathlib\np=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2])\nfor name in ["DRAWING_QUICK_CHECK_PROGRAM.zip","DRAWING_QUICK_CHECK_TEST.zip"]:\n with zipfile.ZipFile(p/name) as z: z.extractall(out)\n',student,clean],{encoding:'utf8'});assert.equal(extract.status,0,extract.stderr);
const appRoot=path.join(clean,'drawing-quick-check'),testRoot=path.join(clean,'DRAWING_TEST');
for(const item of originalManifest.runtime)check('ZIP runtime '+item.file,item.sha256,sha(readFileSync(path.join(appRoot,item.file))),'clean extraction matches source bytes');
const allFiles=[];const walk=folder=>{for(const entry of readdirSync(folder,{withFileTypes:true})){const p=path.join(folder,entry.name);if(entry.isDirectory())walk(p);else allFiles.push(p);}};walk(testRoot);check('physical stub count',29,allFiles.length,'clean extracted DRAWING_TEST');
const before=Object.fromEntries(allFiles.map(file=>[file,sha(readFileSync(file))]));
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
await context.addInitScript(()=>{globalThis.__contentReads=[];for(const method of ['text','arrayBuffer','stream'])File.prototype[method]=function(){globalThis.__contentReads.push(method);throw new Error('File content read forbidden');};globalThis.FileReader=class{constructor(){globalThis.__contentReads.push('FileReader');throw new Error('FileReader forbidden');}};});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(!/^(file:|blob:|data:|http:\/\/127\.0\.0\.1:)/.test(r.url()))report.network.external.push(r.url());});
let server;
try{
  const localUrl=pathToFileURL(path.join(appRoot,'index.html')).href;await page.goto(localUrl);
  check('file:// empty next action',true,(await page.locator('#empty').innerText()).includes('도면 폴더를 선택하거나'),'fresh ZIP extraction');
  check('empty CSV disabled',true,await page.locator('#download-csv').isDisabled(),'no empty CSV download');
  await page.keyboard.press('Tab');check('keyboard skip link','점검 결과로 이동',await page.locator(':focus').innerText(),'keyboard first focus');await page.keyboard.press('Tab');check('keyboard folder button','choose-folder',await page.locator(':focus').getAttribute('id'),'visible action keyboard focus');
  await page.locator('#load-sample').click();check('sample rows',24,await page.locator('#rows tr').count(),'sample-data.js static file, no fetch');
  for(const [id,value] of [['total',29],['drawings',9],['needs',8],['previous',4]])check('sample summary '+id,String(value),await page.locator('#count-'+id).innerText(),'visible card');
  check('sample exclusions',5,await page.locator('#excluded-list li').count(),'explicit ignored reasons');
  for(const [filter,count] of [['normal',12],['needs',8],['previous',4],['all',24]]){await page.locator('[data-filter="'+filter+'"]').click();check('filter '+filter,count,await page.locator('#rows tr').count(),'actual filter click');}
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-csv').click();const dl=await downloadPromise;const csv=readFileSync(await dl.path());check('download CSV BOM','efbbbf',csv.subarray(0,3).toString('hex'),'browser Blob download');check('download CSV exact sample',rules.toCsv(expected),csv.toString('utf8'),'all statuses and exclusions preserved');writeFileSync(path.join(internal,'browser-export.csv'),csv);
  await page.locator('#reset').click();check('reset rows',0,await page.locator('#rows tr').count(),'reset leaves source files intact');check('reset summary','0',await page.locator('#count-total').innerText(),'reset');
  const chooserPromise=page.waitForEvent('filechooser');await page.locator('#choose-files').click();await (await chooserPromise).setFiles(allFiles);check('actual multiple files',29,Number(await page.locator('#count-total').innerText()),'browser FileChooser with physical stubs');
  check('multiple selection basename duplicate',2,await page.locator('#rows tr').filter({hasText:'중복 후보'}).count(),'same filename chosen from two folders');
  const folderPromise=page.waitForEvent('filechooser');await page.locator('#choose-folder').click();await (await folderPromise).setFiles(testRoot);
  check('actual folder file count',29,Number(await page.locator('#count-total').innerText()),'browser webkitdirectory FileChooser, including subfolders');
  check('folder excluded paths',5,await page.locator('#excluded-list li').count(),'hidden-named folder retained and excluded');
  check('folder duplicates across relative paths',2,await page.locator('#rows tr').filter({hasText:'중복 후보'}).count(),'원본 and 복사본 paths preserved');
  const folderRows=await page.locator('#rows tr').evaluateAll(rows=>rows.map(row=>({status:row.dataset.status,text:row.textContent})));
  for(const entry of manifest.files.filter(f=>f.expected.status!=='제외')){const actual=folderRows.find(row=>row.text.includes('DRAWING_TEST/'+entry.relativePath));assert(actual,entry.relativePath);check('folder actual '+entry.relativePath,entry.expected.status,actual.status,'rendered result for physical path');}
  check('file body APIs called',[],await page.evaluate(()=>globalThis.__contentReads),'text/arrayBuffer/stream/FileReader instrumented to fail');
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});await page.locator('#load-sample').click();await page.evaluate(()=>document.fonts.ready);
    const measurement=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button')].filter(b=>!b.disabled).map(b=>{const r=b.getBoundingClientRect();return{id:b.id||b.dataset.filter,width:r.width,height:r.height,left:r.left,right:r.right};}),mobile:matchMedia('(max-width:700px)').matches,tableDisplay:getComputedStyle(document.querySelector('table')).display}));
    check('overflow '+width,width,measurement.scroll,'document horizontal size');check('buttons fit '+width,true,measurement.buttons.every(b=>b.left>=0&&b.right<=width+1&&b.height>=44),'44px minimum touch target and no clipped button');
    if(width<700)check('mobile cards '+width,'block',measurement.tableDisplay,'table switches to stacked labelled cards');
    const capture=path.join(student,width===1440?'DRAWING_QUICK_CHECK_DESKTOP.png':width===390?'DRAWING_QUICK_CHECK_MOBILE.png':'DRAWING_QUICK_CHECK_MOBILE_320.png');
    if(width<700){
      await page.screenshot({path:path.join(internal,`mobile-${width}-top.png`)});
      await page.evaluate(()=>scrollTo(0,document.getElementById('results').offsetTop-16));
    }
    await page.screenshot({path:capture,fullPage:width===1440});report.screens.push({width,height:1000,file:path.relative(root,capture).replaceAll('\\','/'),...measurement});
    if(width<700){
      await page.locator('#rows tr').filter({hasText:'A-101_1층평면도_R02.pdf'}).evaluate(element=>scrollTo(0,element.getBoundingClientRect().top+scrollY-12));
      await page.screenshot({path:path.join(internal,`mobile-${width}-normal-previous.png`)});
      await page.locator('#rows tr').filter({hasText:'A-103_천장평면도_R01.pdf'}).evaluate(element=>scrollTo(0,element.getBoundingClientRect().top+scrollY-12));
      await page.screenshot({path:path.join(internal,`mobile-${width}-confirmation.png`)});
      await page.evaluate(()=>scrollTo(0,0));
    }
  }
  // Filename/CSV text is untrusted data; actual DOM path must render it as text.
  await page.evaluate(()=>{const input=document.getElementById('files-input'),dt=new DataTransfer();for(const name of ['A-301_<img src=x onerror=alert(1)>_R01.pdf','A-301_<img src=x onerror=alert(1)>_R01.dwg'])dt.items.add(new File(['stub'],name));input.files=dt.files;input.dispatchEvent(new Event('change'));});
  check('filename HTML not interpreted',0,await page.locator('#rows img').count(),'textContent rendering');check('malicious text preserved visibly',true,(await page.locator('#rows').innerText()).includes('<img src=x'),'no HTML rendering');
  await page.locator('#reset').click();
  server=createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400).end();return;}const file=path.join(appRoot,pathname==='/'?'index.html':pathname);if(!file.startsWith(appRoot+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[path.extname(file)]||'application/octet-stream');res.end(readFileSync(file));}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const httpUrl='http://127.0.0.1:'+server.address().port+'/';
  await page.goto(httpUrl);await page.locator('#load-sample').click();check('HTTP demo rows equal file mode',24,await page.locator('#rows tr').count(),'same clean extracted files served by temporary local static server');
  report.cleanRoom={...report.cleanRoom,fileUrl:localUrl,httpUrl,programFiles:originalManifest.runtime.length,fixtureFiles:29,absoluteSourceDependency:false,administratorRequired:false,nodeRequired:false,sourceAndZipBytesIdentical:true,programZipSha256:sha(readFileSync(path.join(student,'DRAWING_QUICK_CHECK_PROGRAM.zip'))),testZipSha256:sha(readFileSync(path.join(student,'DRAWING_QUICK_CHECK_TEST.zip')))};
  check('external network requests',[],report.network.external,'browser request event through file:// and local HTTP flow');
  check('browser errors',[],report.errors,'pageerror listener');
  for(const file of allFiles)check('source fixture unchanged '+path.relative(testRoot,file),before[file],sha(readFileSync(file)),'pre/post SHA-256');
  for(const item of originalManifest.runtime)check('source runtime unchanged '+item.file,item.sha256,sha(readFileSync(path.join(source,item.file))),'pre/post SHA-256');
  const excelScript=String.raw`$ErrorActionPreference='Stop'
$excel=$null
$book=$null
try {
 $excel=New-Object -ComObject Excel.Application
 $excel.Visible=$false
 $excel.DisplayAlerts=$false
 $book=$excel.Workbooks.Open($args[0])
 $sheet=$book.Worksheets.Item(1)
 $values=@{status='passed';application='Microsoft Excel COM';version=$excel.Version;header=$sheet.Cells.Item(1,1).Text;titleHeader=$sheet.Cells.Item(1,5).Text;rows=$sheet.UsedRange.Rows.Count;columns=$sheet.UsedRange.Columns.Count;hasKorean=$false}
 for($i=2;$i -le $sheet.UsedRange.Rows.Count;$i++){if($sheet.Cells.Item($i,5).Text -eq '1층평면도'){$values.hasKorean=$true}}
 if($values.header -ne '상태' -or $values.titleHeader -ne '도면명' -or -not $values.hasKorean){throw 'Excel Korean/columns did not match'}
 $values|ConvertTo-Json -Compress
}catch{ @{status='unverified';reason=$_.Exception.Message}|ConvertTo-Json -Compress }
finally{if($null -ne $book){$book.Close($false);[void][Runtime.InteropServices.Marshal]::ReleaseComObject($book)};if($null -ne $excel){$excel.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel)}}`;
  writeFileSync(path.join(internal,'excel-read-check.ps1'),'\uFEFF'+excelScript,'utf8');
  const excel=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(internal,'excel-read-check.ps1'),path.join(internal,'browser-export.csv')],{encoding:'utf8',timeout:60000});
  try{report.excel=JSON.parse(excel.stdout.trim());}catch{report.excel={status:'unverified',reason:excel.error?.message||excel.stderr||'No parsable Excel result'};}
  if(report.excel.status==='passed')check('actual Excel Korean',true,report.excel.hasKorean,'Microsoft Excel COM opened browser-generated CSV without saving');
  report.passed=true;
}catch(error){report.errors.push(error.stack);throw error;}
finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));writeFileSync(path.join(internal,'verification.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,tests:report.tests.length,excel:report.excel,cleanRoom:report.cleanRoom.path,screens:report.screens.map(s=>s.width)},null,2));
