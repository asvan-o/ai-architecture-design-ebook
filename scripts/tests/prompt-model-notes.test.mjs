import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const read=file=>fs.readFileSync(file,'utf8');
const alignment=JSON.parse(read('src/draft/content/prompt-alignment-overrides.json'));
const source=read('src/draft/content/prompt-alignment.ts')
 .replace("import alignment from './prompt-alignment-overrides.json';",'const alignment='+JSON.stringify(alignment)+';');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {applyPromptAlignment,promptDerivationModel,hasPromptModelNote,getPromptModelNote}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const standard={kind:'text',platform:'텍스트 분석 도구',howToUse:'준비 자료를 확인합니다.',derivation:'실습 조건을 나누어 읽습니다.',aiPromptTip:'내 자료로 초안 요청문을 만들어 줘.'};

test('모델 안내는 원본 프롬프트 ID가 아닌 실제 제1~10차시 경로에만 표시한다',()=>{
 for(let lesson=1;lesson<=10;lesson++)for(const prefix of ['','/workbook','/ai-architecture-design-ebook/workbook']){
  assert.equal(hasPromptModelNote(prefix+'/lessons/'+String(lesson).padStart(2,'0')+'/'),true);
 }
 for(const route of ['/workbook/','/workbook/course-overview/','/workbook/lessons/00/','/workbook/lessons/11/','/workbook/lessons/12/','/workbook/lessons/13/'])assert.equal(hasPromptModelNote(route),false,route);
 // 광주 제11차시에서 가져온 법규 ID도 실제 제10차시에서는 안내 대상입니다.
 assert.equal(hasPromptModelNote('/workbook/lessons/10'),true);
 assert(getPromptModelNote(applyPromptAlignment('lesson11-prompt-04',standard)).includes(promptDerivationModel));
});

test('텍스트·이미지·코드 요청은 공동 도출 모델과 초안 표현 차이·핵심 조건 대조를 설명한다',()=>{
 assert.equal(promptDerivationModel,'OpenAI Codex (6.1 Sol / 6 Astra)');
 for(const kind of ['text','image','code']){
  const guide=Object.freeze({...standard,kind,role:kind==='image'?'image':kind==='code'?'local':'text'});
  const note=getPromptModelNote(guide);
  for(const text of [promptDerivationModel,'입력자료·고정 조건·구조 규칙','ChatGPT','Google Gemini','다르게 나오는 것이 정상','유지·변경·금지','그대로 복사'])assert(note.includes(text),kind+' '+text);
  assert(!/이미지를 생성한 모델|모든 환경|실행 성공|테스트 통과/.test(note));
 }
});

test('학습 예시와 사람 검수 역할은 실행 환경 종류보다 우선한다',()=>{
 const example=getPromptModelNote({kind:'terminal',role:'example'});
 assert(example.includes('문장 역할·충돌 분석'));assert(example.includes('실행 지시로 사용하지 않습니다'));
 assert(!example.includes('기준 명령어'));
 const human=getPromptModelNote({kind:'diagram',role:'human'});
 assert(human.includes('사람 사후 검수 기준'));assert(human.includes('모델에 실행을 맡기는 지시가 아닙니다'));
 assert(human.includes('원자료와 생성·실행 결과를 사람이 직접 비교'));
 assert(!human.includes('기준 다이어그램 코드'));
});

test('터미널과 DOT 코드는 기준 예시·환경 확인을 설명하며 새 실행 성공을 주장하지 않는다',()=>{
 for(const [kind,label] of [['terminal','명령어'],['diagram','다이어그램 코드']]){
  const note=getPromptModelNote({kind,role:'local'});
  assert(note.includes(promptDerivationModel));assert(note.includes('기준 '+label));
  assert(note.includes('경로·환경 변수'));assert(note.includes('해당 단계의 기록과 내 컴퓨터의 결과'));
  assert(!/실행을 완료|모든 테스트|실행 성공|검증을 완료/.test(note));
 }
});

test('공통 카드의 두 표시 분기 모두 작성 요청 바로 다음에 모델 안내 행을 둔다',()=>{
 const component=read('src/draft/components/PromptPlatformGuide.astro');
 const pairs=[...component.matchAll(/<p data-guide-field="aiPromptTip">[^\n]+<\/p>\s*\{promptModelNote&&<p data-guide-field="promptModelNote">/g)];
 assert.equal(pairs.length,2,'기본 카드와 4단 안내 카드 모두 작성 요청 다음에 안내가 필요합니다.');
 assert(component.includes('hasPromptModelNote(Astro.url.pathname)'));
 const legal=read('src/draft/components/GwangjuLegalPrompt.astro');
 assert(legal.includes('{promptDerivationModel}'));assert(legal.includes('도출·정제'));assert(legal.includes('표현이 달라질 수 있습니다'));
 assert(legal.includes('<PromptPlatformGuide {id} {guide} />'));
 assert(legal.includes('prompt={executionPrompt}'));
});
