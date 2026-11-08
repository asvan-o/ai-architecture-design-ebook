import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const read=file=>fs.readFileSync(file,'utf8');
const compile=file=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const {workbookGlossary:terms,glossaryCategories:categories,sectionTermNotes:notes}=await compile('src/draft/content/workbook-glossary.ts');
const {glossaryLessonKey,normalizeGlossaryText,matchesGlossaryQuery}=await compile('src/draft/content/workbook-glossary-ui.ts');
const files={overview:['src/draft/content/daejeon-2026.ts'], '01':['src/draft/content/daejeon-2026.ts'],'02':['src/draft/content/daejeon-lesson02-automation.ts'],'09':['src/draft/content/daejeon-lesson09.ts','src/draft/content/lesson0910-source.json'],'10':['src/draft/content/lesson10-grounded-map.json']};
for(let n=3;n<=8;n++)files[String(n).padStart(2,'0')]=[`src/draft/content/daejeon-lesson${String(n).padStart(2,'0')}.ts`];
for(let n=11;n<=13;n++)files[String(n)]=['src/draft/content/lesson111213.json'];
const sectionExists=(lesson,id)=>files[lesson]?.some(file=>new RegExp('[\'\"]'+id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\'\"]').test(read(file)));

test('워크북 용어 사전은 필수 용어와 정의·맥락·관련 차시·출처를 제공한다',()=>{
 assert.equal(terms.length,50);assert.equal(categories.length,4);
 assert.equal(new Set(terms.map(term=>term.id)).size,terms.length);
 assert.equal(new Set(categories.map(category=>category.id)).size,categories.length);
 const required=['hallucination','token','context-window','system-prompt','negative-prompt','seed','control-words','vision','inpainting','outpainting','reference-lock','soffit','louver','parapet','mullion','piloti','massing','diagram','isometric','context-compositing','vibe-coding','mcp','agent','sha256','manifest','csv','json','markdown','ocr','bcr','far','daylight-setback','setback','space-program','zoning','circulation','core'];
 for(const id of required)assert(terms.some(term=>term.id==='term-'+id),id);
 for(const term of terms){
  assert.match(term.id,/^term-[a-z0-9-]+$/);assert(categories.some(c=>c.id===term.category),term.id+' category');
  for(const field of ['korean','english','definition','context','why'])assert(typeof term[field]==='string'&&term[field].trim(),term.id+' '+field);
  assert(term.lessons.length&&term.sources.length,term.id);assert(term.definition.length<400,term.id+' definition too long');
  for(const source of term.sources){assert(source.title);assert.match(source.url,/^https:\/\//);}
 }
});

test('관련 차시 링크와 인라인 주석은 실제 섹션·용어 앵커를 가리키고 한곳에 최대3개를 둔다',()=>{
 for(const term of terms)for(const lesson of term.lessons){assert(sectionExists(lesson.lessonId,lesson.sectionId),`${term.id} ${lesson.lessonId}#${lesson.sectionId}`);assert(lesson.label);}
 assert(Object.keys(notes).length>=43,'주요 섹션의 주석 연결이 누락됐습니다.');
 for(const [key,ids] of Object.entries(notes)){
  const split=key.indexOf(':'),lesson=key.slice(0,split),id=key.slice(split+1);assert(sectionExists(lesson,id),key);
  assert(ids.length>=1&&ids.length<=3,key+' term count');assert.equal(new Set(ids).size,ids.length,key);
  for(const termId of ids)assert(terms.some(term=>term.id===termId),key+' '+termId);
 }
 assert.deepEqual(notes['04:l04-prompt-b'],['term-soffit','term-louver']);
});

test('검색은 한글·영문·약어·전각·다중 단어를 처리하고 빈 검색은 전체를 보여 준다',()=>{
 const termText=term=>[term.korean,term.english,term.acronym,...(term.aliases||[]),term.definition,term.context,term.why].filter(Boolean).join(' ');
 const search=query=>terms.filter(term=>matchesGlossaryQuery(termText(term),query)).map(term=>term.id);
 assert(search('루버').includes('term-louver'));assert(search('Louver').includes('term-louver'));
 assert(search('ＪＳＯＮ').includes('term-json'));assert(search('sha256').includes('term-sha256'));
 assert.equal(normalizeGlossaryText(' SHA-256 / JSON '),'sha256json');
 assert(matchesGlossaryQuery('JSON 데이터 교환','json 데이터'));assert(!matchesGlossaryQuery('JSON 데이터 교환','json 계단'));
 assert.equal(search('').length,terms.length);assert.deepEqual(search('없는용어검증7391'),[]);
});

test('용어 주석은 실제 워크북 경로에 연결되고 광주 과정에 주입하지 않는다',()=>{
 for(const prefix of ['/workbook','/ai-architecture-design-ebook/workbook','']){
  assert.equal(glossaryLessonKey(prefix+'/lessons/04/'),'04');assert.equal(glossaryLessonKey(prefix+'/course-overview/'),'overview');
 }
 for(const route of ['/workbook/','/workbook/glossary/','/gwangju/lessons/04/','/ai-architecture-design-ebook/gwangju/course-overview/'])assert.equal(glossaryLessonKey(route),undefined,route);
 const termNote=read('src/draft/components/TermNote.astro');assert(termNote.includes('/glossary/#${term.id}'));assert(termNote.includes('data-term-note-id'));
 for(const component of ['ReviewSection.astro','GwangjuLegalSection.astro'])assert(read('src/draft/components/'+component).includes('<TermNote sectionId={id} />'),component);
});

test('용어 사전 화면은 검색·카테고리·카드·빈 결과·관련 차시를 같은 자료로 표시한다',()=>{
 const page=read('src/draft/pages/glossary.astro');
 for(const marker of ['data-glossary-search','data-glossary-count','data-glossary-clear','data-glossary-empty','data-glossary-category','data-glossary-term','data-glossary-search-text'])assert(page.includes(marker),marker);
 assert(page.includes('matchesGlossaryQuery'));assert(page.includes('term.lessons.map'));assert(page.includes('term.sources.map'));
 for(const file of ['src/draft/layouts/ReviewLayout.astro','src/draft/components/DaejeonHomeDesignPreview.astro','src/draft/pages/course-overview.astro'])assert(read(file).includes('/glossary/'),file+' glossary navigation');
});
