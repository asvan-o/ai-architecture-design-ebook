import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {inflateSync} from 'node:zlib';
import ts from 'typescript';
const root='review/daejeon/DJ-L04-EXTERIOR-PLAN/';
const implementation=root+'implementation-13/',application=root+'application-05-techniques/';
const read=name=>fs.readFileSync(name);
const text=name=>read(name).toString('utf8');
const json=name=>JSON.parse(text(name));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalize=value=>value.replaceAll('\r\n','\n').trim();
const fixture=json('scripts/tests/fixtures/approved-l04-contrast-renewal.json');
const compile=source=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));

test('L04의 세 기준 건물·A·재질 원본·별도 스케치 분기는 그대로 보존한다',()=>{
 for(const [file,expected] of Object.entries({...fixture.fixedInputs,...fixture.fixedPrompts}))assert.equal(sha(read(file)),expected,file);
});

test('B와 A2는 상층 재료 교체와 1층 국소 루버·빛 보완을 명확히 나눈다',async()=>{
 const b=text(implementation+'prompts/B-7step.txt'),a2=text(implementation+'prompts/A2-7step.txt');
 for(const word of ['2~3층','세로 골','테라코타','바살트','슬레이트','매트 블랙','소핏','3000K','쇼윈도'])assert(b.includes(word),word);
 for(const word of ['상층','크림','고정','다크 월넛','브론즈','수평 루버','라인','포털 프레임'])assert(a2.includes(word),word);
 assert(!a2.includes('m-20-light-grey-microcement.png'));assert(a2.includes('m-21-dark-walnut.png'));
 const prompts=await compile(text('src/draft/content/lesson04-generation-prompts.ts'));
 assert.equal(normalize(prompts.lesson04Base01Prompts.A),normalize(text(implementation+'prompts/A-7step.txt')));
 assert.equal(normalize(prompts.lesson04Base01Prompts.B),normalize(b));
});

test('조경은 A→05→11→12 순서이며 석양·서브 시점도 현재 입력을 이어받는다',()=>{
 const m=json(implementation+'manifest.json'),a=json(application+'manifest.json');
 for(const p of m.prompts.filter(p=>p.key.startsWith('A2-')))assert.deepEqual(p.attachments.map(x=>x.file),['samples/02_partial-edit-a.png','references/m-21-dark-walnut.png']);
 const expected={landscape:['samples/02_partial-edit-a.png'],'surrounding-landscape':['samples/05_landscape-additive.png'],'human-scale':['samples/11_surrounding-landscape-plaza.png'],dusk:['samples/05_landscape-additive.png'],subview:['samples/05_landscape-additive.png'],'angle-corner':['samples/11_surrounding-landscape-plaza.png','samples/12_human-scale-entourage.png'],'angle-streetscape':['samples/12_human-scale-entourage.png'],'angle-elevated':['samples/11_surrounding-landscape-plaza.png','samples/12_human-scale-entourage.png']};
 for(const [key,files] of Object.entries(expected))for(const suffix of ['7step','short'])assert.deepEqual(a.prompts.find(x=>x.key===key+'-'+suffix).attachments.map(x=>x.file),files,key);
 const first=text(application+'prompts/landscape-7step.txt');for(const word of ['다층','천연석','다간형','그라스','초화','하부','진입','보행'])assert(first.includes(word),word);
 const last=text(application+'prompts/human-scale-7step.txt');assert(last.includes('노천 카페'));assert.match(last,/실제.*허가|허가.*확정/);
 const dusk=text(application+'prompts/dusk-7step.txt');assert(dusk.includes('05_landscape-additive.png'));assert(dusk.includes('다층'));assert(dusk.includes('진입 포장'));
});

test('42개 학생용 요청문은 짧은 문안과 7단을 구분하고 해상도·화면 비율을 노출하지 않는다',()=>{
 let pairs=0;
 for(const directory of [implementation,application])for(const file of fs.readdirSync(directory+'prompts').filter(x=>x.endsWith('-7step.txt'))){
  const full=text(directory+'prompts/'+file),short=text(directory+'prompts/'+file.replace('-7step.txt','-short.txt'));
  assert(short.length<full.length,file);assert.notEqual(short,full,file);
  assert(!/해상도|픽셀|\b\d+\s*[x×:]\s*\d+\b|화면\s*비율/.test(full+short),file);
  for(const heading of ['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'])assert(full.includes(heading),file+' '+heading);pairs++;
 }
 assert.equal(pairs,21);
 const ui=text('src/draft/components/Lesson04Techniques.astro')+text('src/draft/pages/lessons/04.astro');
 assert(!/예시 결과 이미지는.*7단 학습용 요청문으로 생성/.test(ui));assert(ui.includes('실제 이미지 도구 호출'));
});

test('새 가이드 문구 병합은 기존 실행 역할·종류·플랫폼·입력 메타데이터를 지우지 않는다',()=>{
 const current=json('src/draft/content/prompt-alignment-overrides.json');
 for(const [id,before] of Object.entries(fixture.guideBaseline)){
  const now=current[id];assert(now,id+' guide missing');
  for(const key of Object.keys(before))if(!fixture.guideAllowedChanges.includes(key))assert.deepEqual(now[key],before[key],id+' '+key);
  assert(now.derivation&&now.aiPromptTip&&now.howToUse,id+' updated explanation');
  assert(!/이미지는 7단 학습용 요청문으로 생성|실제 생성에 사용한 7단 원문은 그대로/.test(now.howToUse+' '+now.derivation),id+' provenance');
 }
});

test('현재 재생성 이미지10종은 실제 도구 기록과 연결하고 모델 버전을 추정하지 않는다',()=>{
 const data=json(root+'instructor/DJ-L04-contrast-generation-log.json'),records=Array.isArray(data)?data:data.records;
 assert.deepEqual(records.map(x=>x.asset).sort(),[...fixture.currentImageAssets].sort());
 for(const record of records){
  assert.equal(record.outputSha256,sha(read(path.join(root,record.asset))),record.asset);
  assert(record.tool&&record.exactToolArguments?.prompt&&Array.isArray(record.exactToolArguments.referenced_image_paths),record.asset+' actual arguments');
  assert.match(record.backendModel,/not exposed|미공개|노출되지/);assert(record.inputSha256&&Object.keys(record.inputSha256).length,record.asset+' input digest');
  for(const [file,digest] of Object.entries(record.inputSha256)){
   const historical=record.historicalInputSnapshots?.[file];
   if(historical){
    assert.equal(historical.commit,fixture.baseCommit,record.asset+' historical commit');assert.equal(historical.sha256,digest);assert(historical.retainedLocalCopy);
    // Deployment checks out the complete history. Read the recorded historical
    // blob, since the same live path now contains the newly generated output.
    const before=execFileSync('git',['cat-file','blob',historical.commit+':'+root+file],{maxBuffer:64*1024*1024,windowsHide:true});
    assert.equal(sha(before),digest,record.asset+' historical input '+file);
   }else{const local=path.join(root,file);if(fs.existsSync(local))assert.equal(sha(read(local)),digest,record.asset+' current input '+file);}
  }
  if(record.refinements?.length)assert.equal(record.refinements.at(-1).outputSha256,record.outputSha256,record.asset+' final refinement');
 }
});

function decodePng(bytes){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),depth=bytes[24],color=bytes[25];
 assert.equal(depth,8,'고정 입력은 8비트 PNG입니다.');assert([2,6].includes(color),'RGB/RGBA PNG만 비교합니다.');assert.equal(bytes[28],0,'비인터레이스 PNG');
 const channels=color===2?3:4,stride=width*channels,chunks=[];
 for(let p=8;p<bytes.length;){const length=bytes.readUInt32BE(p),type=bytes.subarray(p+4,p+8).toString('ascii');if(type==='IDAT')chunks.push(bytes.subarray(p+8,p+8+length));p+=length+12;if(type==='IEND')break;}
 const input=inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(stride*height);assert.equal(input.length,(stride+1)*height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){
  const filter=input[y*(stride+1)],start=y*(stride+1)+1;assert(filter<=4);
  for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;const predicted=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c);pixels[i]=(input[start+x]+predicted)&255;}
 }
 return {width,height,channels,stride,pixels};
}

test('A2 상층 복원 영역은 원본 A 픽셀과 실제로 같고 하부 편집은 남아 있다',()=>{
 const data=json(root+'instructor/DJ-L04-contrast-generation-log.json'),records=Array.isArray(data)?data:data.records;
 const record=records.find(x=>x.asset==='implementation-13/samples/04_revised-concept.png'),restoration=record.referenceRestoration;
 assert.equal(restoration.source,'implementation-13/samples/02_partial-edit-a.png');assert.equal(restoration.pixelExact,true);assert.deepEqual(restoration.rectangle,[0,0,1672,495]);assert.match(record.postProcessing,/restor|복원/i);
 const original=decodePng(read(root+restoration.source)),edited=decodePng(read(root+record.asset));
 assert.deepEqual([edited.width,edited.height,edited.channels],[original.width,original.height,original.channels]);
 const [left,top,right,bottom]=restoration.rectangle;assert(right<=original.width&&bottom<=original.height);
 for(let y=top;y<bottom;y++)assert(original.pixels.subarray(y*original.stride+left*original.channels,y*original.stride+right*original.channels).equals(edited.pixels.subarray(y*edited.stride+left*edited.channels,y*edited.stride+right*edited.channels)),'A2 상층의 원본 픽셀 불일치: '+y+'행');
 assert(!original.pixels.subarray(bottom*original.stride).equals(edited.pixels.subarray(bottom*edited.stride)),'A2 하부 편집이 모두 사라졌습니다.');
});
