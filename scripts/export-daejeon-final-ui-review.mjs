// Review-only PDFs: Overview, changed Day01 position display, complete Lesson02.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {reviewOutput} from './daejeon-review-assets.mjs';
import {createStaticServer,listen,closeServer,findAvailablePorts} from './lecture-kit-static.mjs';
const scratch=path.join(process.cwd(),'tmp/pdfs/lesson01-02-final');mkdirSync(scratch,{recursive:true});
assert(JSON.parse(readFileSync('tmp/lesson01-02-final-ui/ui-verification.json','utf8')).passed);
const base=JSON.parse(readFileSync(path.join(reviewOutput,'course-build.json'),'utf8')).basePath,[port]=await findAvailablePorts(1,4550,4599);
const server=createStaticServer(reviewOutput,base);await listen(server,port,'127.0.0.1');
const browser=await chromium.launch({headless:true}),report={renders:[],scope:'Full COURSE OVERVIEW + Day01 title/progress excerpt + full Lesson02; detail implementation closed'};
const css=[
 '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}html{scroll-behavior:auto!important}.skip-link{display:none!important}',
 '.instructor-notes,[data-instructor-reference]{display:none!important}.review-toc{position:static!important;max-height:none!important;overflow:visible!important}',
 '.review-toc li{break-inside:avoid}.review-section-heading,h1,h2,h3,h4,summary{break-after:avoid;break-inside:avoid}',
 'p,li{orphans:3;widows:3}.period-heading{break-before:page;break-inside:avoid;break-after:avoid}.review-section{break-inside:auto}',
 '.review-break,.lesson02-status,.lesson02-decision,.review-callout,.review-question,.review-task,.topic-progress{break-inside:avoid}',
 '.review-break{break-before:avoid;margin:0;padding:.5rem 1.3rem}.pdf-keep-section{break-inside:avoid}',
 'figure,table,.review-prompt,prompt-copy-block,.review-card,.lesson02-asset-card{break-inside:avoid}',
 '.review-download,.lesson02-asset-actions{break-before:avoid;break-inside:avoid}.pdf-large{break-inside:auto!important}',
 '.pdf-large pre{break-inside:auto!important;orphans:4;widows:4}.pdf-large>header{break-after:avoid;break-inside:avoid}',
 'thead{display:table-header-group}tr{break-inside:avoid}prompt-copy-block{display:block!important}',
].join('\n');
try{
 for(const mobile of [false,true]){
  const name=mobile?'mobile':'desktop',viewport=mobile?{width:390,height:844}:{width:1440,height:1000};
  for(const [kind,route] of [['overview','course-overview'],['day01-position','lessons/01'],['lesson02','lessons/02']]){
   const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   assert((await page.goto('http://127.0.0.1:'+port+base+'/'+route+'/')).ok());await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'screen'});
   if(kind==='lesson02'){
    await page.locator('[data-material-all]').evaluate(d=>d.open=true);
    await page.locator('[data-implementation-spec]').evaluate(d=>d.open=false);
    assert.equal(await page.locator('#l02-approval-prompt').isVisible(),false);
   }
   const sourceText=await page.locator('main').textContent();
   await page.locator('main img').evaluateAll(async images=>{for(const img of images){if(img.closest('dialog'))continue;img.loading='eager';await img.decode();assertImage(img); }function assertImage(img){if(!img.naturalWidth)throw Error('missing image '+img.src);}});
   const audit={kind,name,viewport,sections:await page.locator('[data-review-section]').evaluateAll(es=>es.map((e,i)=>({order:i+1,id:e.id,title:e.querySelector('h2').textContent,minutes:+e.dataset.sectionMinutes||null}))),prompts:[],officialTitles:await page.locator('[data-official-title]').allTextContents()};
   if(kind==='lesson02'){
    audit.prompts=await page.locator('.review-prompt:visible').evaluateAll(es=>es.map(e=>({title:e.querySelector('h4').textContent,text:e.querySelector('[data-copy-source]').value})));
    assert.equal(audit.sections.length,15);assert.equal(audit.prompts.length,5);
    audit.implementationCollapsed=true;
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.addStyleTag({content:css});
   if(kind==='day01-position'){
    await page.addStyleTag({content:'.review-toc{display:none!important}.review-shell--toc{display:block!important}main>:not(.review-intro):not([data-topic-progress]){display:none!important}'});
    audit.sections=[];audit.excerpt=true;
   }else{
    const boxes=await page.evaluate(()=>{const shell=document.querySelector('.review-shell'),main=document.querySelector('main'),toc=document.querySelector('.review-toc');return{mainWidth:main.getBoundingClientRect().width,mainInset:main.getBoundingClientRect().left-shell.getBoundingClientRect().left-parseFloat(getComputedStyle(shell).paddingLeft),tocWidth:toc.getBoundingClientRect().width};});
    await page.addStyleTag({content:mobile?'.review-shell--toc{display:block!important}':'.review-shell--toc{display:block!important}.review-toc{float:left;width:'+boxes.tocWidth+'px}.review-shell main{width:'+boxes.mainWidth+'px;max-width:none;margin-left:'+boxes.mainInset+'px;margin-right:0}'});
   }
   const height=(mobile?18:17)*96-.95*96-6;
   await page.locator('.review-section').evaluateAll((items,max)=>items.forEach(e=>{if(e.getBoundingClientRect().height<=max)e.classList.add('pdf-keep-section');}),height);
   await page.locator('figure,table,.review-prompt,prompt-copy-block,.review-card,.lesson02-asset-card,.lesson02-decision,.review-callout,.review-task').evaluateAll((items,max)=>items.forEach(e=>{if(e.getBoundingClientRect().height>max)e.classList.add('pdf-large');}),height);
   assert.equal(await page.locator('main').textContent(),sourceText);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(kind==='lesson02')assert.equal(await page.locator('#l02-approval-prompt').isVisible(),false);
   audit.file=path.join(scratch,kind+'-'+name+'.pdf');
   await page.pdf({path:audit.file,width:mobile?'4.5625in':'16in',height:mobile?'18in':'17in',margin:{top:'0.45in',bottom:'0.5in',left:mobile?'0.25in':'0.5in',right:mobile?'0.25in':'0.5in'},printBackground:true,tagged:true});
   assert.deepEqual(errors,[]);report.renders.push(audit);
   console.log(kind+' '+name+' exported; visible prompts '+audit.prompts.length);await page.close();
  }
 }
 writeFileSync(path.join(scratch,'browser-report.json'),JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();await closeServer(server);}
