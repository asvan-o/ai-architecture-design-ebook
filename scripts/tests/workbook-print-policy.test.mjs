import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const css=fs.readFileSync(new URL('../workbook-print.css',import.meta.url),'utf8');
const exporter=fs.readFileSync(new URL('../export-workbook-textbooks.mjs',import.meta.url),'utf8');
const image='<img width="100" height="100" alt="보존할 예제" src="data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#bb9988"/></svg>')+'">';
const card=(i=0)=>`<article class="l03-asset-card" data-l03-asset="m-${i}">${image}<div class="l03-asset-copy"><h4>재질 ${i}</h4><p>사진과 함께 보존할 재료 설명 ${i}</p></div></article>`;
let browser;
before(async()=>{browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();});
async function fixture(key,html){
 const page=await browser.newPage({viewport:{width:794,height:1123}});
 await page.setContent(`<html data-workbook-print-lesson="${key}"><head><style>.workbook-print-glossary-appendix{display:none}</style></head><body><main>${html}</main></body></html>`);
 const text=await page.locator('main').textContent();await page.emulateMedia({media:'print'});await page.addStyleTag({content:css});return{page,text};
}
const columns=locator=>locator.evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(/\s+/).length);

test('인쇄 재질 카탈로그는 기본8·전체33의 사진·설명을 보존하고 4열로 압축한다',async()=>{
 const {page,text}=await fixture('03',`<div class="l03-asset-grid workbook-print-one-column" data-l03-material-defaults>${Array.from({length:8},(_,i)=>card(i)).join('')}</div><details open data-l03-material-all><summary>전체 재질33</summary><div class="l03-asset-grid workbook-print-one-column">${Array.from({length:33},(_,i)=>card(i)).join('')}</div></details>`);
 try{
  assert.equal(await columns(page.locator('[data-l03-material-defaults]')),4);assert.equal(await columns(page.locator('[data-l03-material-all] .l03-asset-grid')),4);
  assert.equal(await page.locator('.l03-asset-card:visible').count(),41);assert.equal(await page.locator('.l03-asset-copy p:visible').count(),41);
  const styles=await page.locator('[data-l03-material-all] img').first().evaluate(e=>({height:parseFloat(getComputedStyle(e).height),fit:getComputedStyle(e).objectFit}));
  assert(Math.abs(styles.height-28*96/25.4)<1);assert.equal(styles.fit,'contain');assert.equal(await page.locator('main').textContent(),text);
 }finally{await page.close();}
});

test('비교·기준자료·3D·표지 갤러리와 용어 부록은 지정된 다단과 이미지 전체 비율을 유지한다',async()=>{
 const pair=`<figure>${image}<figcaption>기준·결과 설명 전체</figcaption></figure>`;
 const {page,text}=await fixture('11',`
  <div class="l03-comparison workbook-print-one-column">${card(1)+card(2)}</div>
  <div class="l03-reference-pair">${card(3)+card(4)}</div><div class="l03-lighting-pair">${card(5)+card(6)+card(7)}</div>
  <div class="l03-asset-grid" data-l03-spaces>${card(8)+card(9)+card(10)}</div><div class="l03-asset-grid" data-l04-bases-grid>${card(11)+card(12)+card(13)}</div><div class="l03-asset-grid" data-l04-reference-grid>${card(14)+card(15)}</div>
  <div class="modeling-image-row modeling-image-row--pair workbook-print-one-column">${pair+pair}</div><div class="modeling-image-row modeling-image-row--three workbook-print-one-column">${pair+pair+pair}</div>
  <div class="l07-grid workbook-print-one-column">${pair+pair}</div><div class="l07-fp-grid workbook-print-one-column">${pair+pair}</div>
  <details open class="portfolio-legacy"><summary>표지10</summary><div class="portfolio-gallery workbook-print-one-column">${Array.from({length:10},()=>'<figure class="portfolio-asset">'+image+'<figcaption>표지의 전체 설명</figcaption></figure>').join('')}</div></details>
  <aside class="workbook-print-glossary-appendix"><h2>말미 부록</h2><div class="workbook-print-glossary-grid">${Array.from({length:3},(_,i)=>'<article class="workbook-print-glossary-card" data-print-glossary-term="term-'+i+'"><h4>용어</h4><p>정의·맥락·필요성 전체</p></article>').join('')}</div></aside>`);
 try{
  for(const selector of ['.l03-comparison','.l03-reference-pair','.modeling-image-row--pair','.l07-grid','.l07-fp-grid','.workbook-print-glossary-grid'])assert.equal(await columns(page.locator(selector)),2,selector);
  for(const selector of ['.l03-lighting-pair','[data-l03-spaces]','[data-l04-bases-grid]','[data-l04-reference-grid]','.modeling-image-row--three','.portfolio-legacy .portfolio-gallery'])assert.equal(await columns(page.locator(selector)),3,selector);
  assert.equal(await page.locator('.portfolio-gallery img:visible').count(),10);
  assert.equal(await page.locator('.l03-comparison').evaluate(e=>getComputedStyle(e).breakInside),'avoid-page');
  assert.equal(await page.locator('.workbook-print-glossary-appendix').evaluate(e=>getComputedStyle(e).breakBefore),'page');
  assert(await page.locator('.workbook-print-glossary-appendix').isVisible());assert.equal(await page.locator('main').textContent(),text);
 }finally{await page.close();}
});

test('반복 가이드·조작 UI만 숨기고 프롬프트 전문·유지조건·11개 키워드 목록은 인쇄한다',async()=>{
 const guide=(id,note)=>`<aside class="prompt-platform-guide" data-prompt-platform="${id}"><p data-guide-field="role">실행 역할</p><p data-guide-field="platform">실행 플랫폼</p><p data-guide-field="derivation">도출 장문</p><p data-guide-field="aiPromptTip">AI 작성 요청</p><p data-guide-field="promptModelNote" data-workbook-print-model-note="${note}">공동 모델 안내 전문</p></aside>`;
 const keywords=Array.from({length:11},(_,i)=>`<details open><summary>단어 그룹${i}</summary><p>그룹의 학습 설명${i}</p><div class="keyword-options"><label><input type="checkbox"><span>영문·한글 키워드${i}</span></label></div></details>`).join('');
 const {page,text}=await fixture('04',`
  <aside class="term-note">웹 인라인 주석</aside><div class="l03-input-panel" id="scope"><label>입력<input></label><h3>그대로 유지할 부분</h3><ul><li>문·창·벽·시점 고정</li></ul><p>기준 영역의 학습 설명</p></div>
  <div class="review-prompt" id="full">${guide('l04-B-7step','first')}<div class="prompt-attachments">원본·참고 파일</div><pre>7단 프롬프트 전문</pre></div>
  <div class="review-prompt" id="short">${guide('l04-B-short','repeat')}<div class="prompt-attachments">중복 원본·참고 파일</div><pre>짧은 실행 요청문 전문</pre></div>
  <details data-l04-live-prompt><summary>웹 작업대</summary><pre>빈칸 조합용 웹 양식</pre></details>
  <details><summary>닫힌 빈 제목</summary></details><details open data-optional-prompt-template><summary>제1차시 선택 양식</summary><pre>선택 양식 전문도 보존</pre></details>
  <div data-portfolio-keywords><label>위치<input data-keyword-target></label>${keywords}<label>조합<textarea data-keyword-output>웹 메모</textarea></label><p data-keyword-status>선택 상태</p></div>
  <div data-plan-overlay><label>중첩 강도 50%<input type="range"></label><select><option>단계 선택</option></select><p>도면 경계와 치수 대조 설명은 보존합니다.</p></div>`);
 try{
  assert.equal(await page.locator('.term-note').isVisible(),false);assert.equal(await page.locator('#scope > label').isVisible(),false);
  for(const selector of ['#scope h3','#scope ul','#scope > p','#full pre','#short pre','[data-optional-prompt-template] pre'])assert(await page.locator(selector).isVisible(),selector);
  assert(await page.locator('#full [data-guide-field="promptModelNote"]').isVisible());
  for(const selector of ['#short [data-guide-field="derivation"]','#short [data-guide-field="aiPromptTip"]','#short [data-guide-field="promptModelNote"]','#short .prompt-attachments','[data-l04-live-prompt]'])assert.equal(await page.locator(selector).isVisible(),false,selector);
  for(const selector of ['#short [data-guide-field="role"]','#short [data-guide-field="platform"]'])assert(await page.locator(selector).isVisible(),selector);
  assert.equal(await page.locator('[data-portfolio-keywords] details:visible').count(),11);assert.equal(await page.locator('.keyword-options span:visible').count(),11);assert.equal(await page.locator('input[type="checkbox"]:visible').count(),0);
  assert.equal(await page.locator('input:visible,select:visible,textarea:visible').count(),0);assert(await page.locator('[data-plan-overlay] p').isVisible());
  assert.equal(await page.locator('main').textContent(),text);
 }finally{await page.close();}
});

test('법규 카드의 중복 도입문과 반복 모델 안내만 숨기고 첫 안내·표·예제는 유지한다',async()=>{
 const {page,text}=await fixture('10','<div class="legal-derivation"><p class="derivation-intro">중복 도입문</p><p data-guide-field="promptModelNote" data-workbook-print-model-note="first">첫 모델 안내 전문</p><p data-guide-field="promptModelNote" data-workbook-print-model-note="repeat">반복 모델 안내 전문</p><table><tr><th>근거</th><td>원문 대조 내용</td></tr></table><pre>법규 분석 프롬프트 전문</pre></div>');
 try{
  assert.equal(await page.locator('.derivation-intro').isVisible(),false);assert.equal(await page.locator('[data-workbook-print-model-note="repeat"]').isVisible(),false);
  for(const selector of ['[data-workbook-print-model-note="first"]','table','pre'])assert(await page.locator(selector).isVisible(),selector);
  assert.equal(await page.locator('main').textContent(),text);
 }finally{await page.close();}
});

test('내보내기는 본문 불변·핵심 가시성·부록·카탈로그 보존 검증과 다단 예외를 유지한다',()=>{
 assert(exporter.includes("assert.equal(await page.locator('main').textContent(),audit.sourceMainText)"));
 for(const token of ['all core pre text unchanged','all core teaching table text unchanged','all core image nodes retained','all core pre/tables/images print-visible','glossaryAppendix','materials.defaults.length!==8','materials.all.length!==33','legacyCovers.length!==10','keywordGroups.length!==11'])assert(exporter.includes(token),token);
 const closeRule=exporter.match(/const closed=([^;]+);/)[1];assert(!/data-optional-prompt-template|data-implementation-spec|학습용 상세 지시 구조 참고/.test(closeRule));
 assert(closeRule.includes('data-l03-live-prompt')&&closeRule.includes('data-l04-live-prompt'));
 for(const selector of ['.l03-asset-grid','.l03-comparison','.l03-reference-pair','.l03-lighting-pair','.portfolio-gallery','.modeling-image-row--pair','.modeling-image-row--three','.l07-grid','.l07-fp-grid','.workbook-print-glossary-grid'])assert(exporter.includes(selector),selector);
});

test('플라워 카페 비교는 긴 캡션을 자르지 않고 세 단계 전체를 한 행에 유지한다',async()=>{
 const caption='짧은 요청으로 생성한 초기 콘셉트의 사람·문자·가구와 다음 수정의 판단 근거를 끝까지 보존합니다. '.repeat(3);
 const {page,text}=await fixture('01',`<div class="review-cards workbook-print-one-column" data-flower-cafe-comparison>${Array.from({length:3},(_,i)=>`<figure class="review-card workbook-print-large"><h4>단계${i}</h4>${image}<figcaption>${caption}</figcaption><p>각 단계의 설명도 그대로 표시합니다.</p></figure>`).join('')}</div>`);
 try{
  assert.equal(await columns(page.locator('[data-flower-cafe-comparison]')),3);
  assert.equal(await page.locator('[data-flower-cafe-comparison]').evaluate(e=>getComputedStyle(e).breakInside),'avoid-page');
  for(const figure of await page.locator('[data-flower-cafe-comparison] figure').all()){
   const result=await figure.evaluate(e=>({overflow:getComputedStyle(e).overflow,inside:getComputedStyle(e).breakInside,captionVisible:e.querySelector('figcaption').scrollHeight<=e.querySelector('figcaption').clientHeight+1}));
   assert.equal(result.overflow,'visible');assert.equal(result.inside,'avoid-page');assert(result.captionVisible);
  }
  assert.equal(await page.locator('main').textContent(),text);
 }finally{await page.close();}
});
