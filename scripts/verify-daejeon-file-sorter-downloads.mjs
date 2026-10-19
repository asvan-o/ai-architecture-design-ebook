import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {chromium} from 'playwright';
import {reviewOutput} from './daejeon-review-assets.mjs';import {lesson02ProgramAssets} from './daejeon-file-sorter-assets.mjs';import {createStaticServer,listen,closeServer,findAvailablePorts} from './lecture-kit-static.mjs';
const clean=JSON.parse(readFileSync('tmp/file-sorter-student-release/clean-room-verification.json','utf8'));assert(clean.passed&&clean.programDeleted&&!clean.elevated);
const base=JSON.parse(readFileSync(path.join(reviewOutput,'course-build.json'),'utf8')).basePath,[port]=await findAvailablePorts(1,4550,4599);
const server=createStaticServer(reviewOutput,base);await listen(server,port,'127.0.0.1');const browser=await chromium.launch({headless:true}),report={passed:false,files:[],viewports:[],cleanRoomPassed:true};
try{const page=await browser.newPage({acceptDownloads:true});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:'+port+base+'/lessons/02/');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('[data-sorter-downloads] a[download]').count(),3);await page.locator('[data-sorter-integrity]').evaluate(d=>d.open=true);
  for(const file of lesson02ProgramAssets){
   const link=page.locator('[data-sorter-download="'+file.key+'"]');assert.equal(await link.getAttribute('download'),file.file);
   assert.equal(await link.getAttribute('href'),base+'/'+file.outputPath);
   const [download]=await Promise.all([page.waitForEvent('download'),link.click()]);assert.equal(download.suggestedFilename(),file.file);
   const bytes=readFileSync(await download.path());assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);assert(bytes.equals(readFileSync(file.source)));
   if(width===1440)report.files.push({file:file.file,bytes:bytes.length,sha256:file.sha256,download:true});
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.viewports.push({width,overflow:false,downloads:4});await page.locator('[data-sorter-downloads]').screenshot({path:'tmp/file-sorter-student-release/downloads-'+width+'.png'});
 }
 report.passed=true;
}finally{await browser.close();await closeServer(server);writeFileSync('tmp/file-sorter-student-release/download-verification.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
