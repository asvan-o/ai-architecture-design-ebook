import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {drawingExamples,drawingExplanation,drawingDetails} from '../src/draft/content/lesson02-drawing-rules.ts';
const output='review/daejeon/LESSON02_DRAWING_EXPLANATION/instructor';fs.mkdirSync(output,{recursive:true});
const source='review/daejeon/DRAWING_QUICK_CHECK/rules.js',context={};
vm.runInNewContext(fs.readFileSync(source,'utf8'),context);const rules=context.DrawingRules;
const plain=v=>JSON.parse(JSON.stringify(v)),report={passed:false,source,sha256:createHash('sha256').update(fs.readFileSync(source)).digest('hex'),cases:[],examples:[],sourceAudit:[],discrepancies:[],bugs:[]};
const files=(...names)=>names.map(name=>({name}));
const status=(names,value,latest='')=>names.map(name=>({name,status:value,latest}));
const cases=[
 ['정상 PDF/DWG',files('A-201_평면_R02.pdf','A-201_평면_R02.dwg'),status(['A-201_평면_R02.pdf','A-201_평면_R02.dwg'],'정상','R02')],
 ['DXF와 PDF/DWG',files('A-201_평면_R02.pdf','A-201_평면_R02.dwg','A-201_평면_R02.dxf'),status(['A-201_평면_R02.pdf','A-201_평면_R02.dwg','A-201_평면_R02.dxf'],'정상','R02')],
 ['DXF만 있음',files('A-201_평면_R02.dxf'),[{name:'A-201_평면_R02.dxf',status:'확인 필요',latest:'R02',note:'PDF·DWG 없음'}]],
 ['PDF만 있음',files('A-201_평면_R02.pdf'),[{name:'A-201_평면_R02.pdf',status:'확인 필요',latest:'R02',note:'DWG 없음'}]],
 ['DWG만 있음',files('A-201_평면_R02.dwg'),[{name:'A-201_평면_R02.dwg',status:'확인 필요',latest:'R02',note:'PDF 없음'}]],
 ['R01/R02/R03',files('A-201_평면_R01.pdf','A-201_평면_R02.dwg','A-201_평면_R03.pdf','A-201_평면_R03.dwg'),[
  ...status(['A-201_평면_R01.pdf','A-201_평면_R02.dwg'],'이전 리비전','R03'),...status(['A-201_평면_R03.pdf','A-201_평면_R03.dwg'],'정상','R03')]],
 ['숫자 R02/R10',files('A-201_평면_R02.pdf','A-201_평면_R10.pdf','A-201_평면_R10.dwg'),[
  ...status(['A-201_평면_R02.pdf'],'이전 리비전','R10'),...status(['A-201_평면_R10.pdf','A-201_평면_R10.dwg'],'정상','R10')]],
 ['대소문자/R2=R02 중복',files('a-201_평면_R2.PDF','A-201_평면_R02.pdf','A-201_평면_R02.dwg'),[
  {name:'a-201_평면_R2.PDF',status:'확인 필요',latest:'R02',note:'중복 후보'},
  {name:'A-201_평면_R02.pdf',status:'확인 필요',latest:'R02',note:'중복 후보'},...status(['A-201_평면_R02.dwg'],'정상','R02')]],
 ['같은 번호 도면명 차이',files('A-201_동쪽_R01.pdf','A-201_서쪽_R02.pdf','A-201_서쪽_R02.dwg'),status(['A-201_동쪽_R01.pdf','A-201_서쪽_R02.pdf','A-201_서쪽_R02.dwg'],'확인 필요','R02')],
 ['이전 리비전 중복 상태 우선',files('A-201_평면_R1.pdf','A-201_평면_R01.pdf','A-201_평면_R02.pdf','A-201_평면_R02.dwg'),[
  {name:'A-201_평면_R1.pdf',status:'확인 필요',latest:'R02',previous:true,note:'중복 후보'},
  {name:'A-201_평면_R01.pdf',status:'확인 필요',latest:'R02',previous:true,note:'중복 후보'},...status(['A-201_평면_R02.pdf','A-201_평면_R02.dwg'],'정상','R02')]],
 ['번호 구조 오류',files('A101_평면최종.pdf'),status(['A101_평면최종.pdf'],'파일명 확인')],
 ['리비전 없음',files('A-201_평면.pdf'),status(['A-201_평면.pdf'],'파일명 확인')],
 ['도면명 없음/공백',files('A-201__R01.pdf','A-201_   _R01.pdf'),status(['A-201__R01.pdf','A-201_   _R01.pdf'],'파일명 확인')],
 ['소수/음수/큰 리비전',files('A-201_평면_R1.5.pdf','A-201_평면_R-1.pdf','A-201_평면_R9007199254740992.pdf'),status(['A-201_평면_R1.5.pdf','A-201_평면_R-1.pdf','A-201_평면_R9007199254740992.pdf'],'파일명 확인')],
 ['0 리비전/도면명 밑줄',files('A1-201_1층_평면_R0.pdf','A1-201_1층_평면_R00.dwg'),status(['A1-201_1층_평면_R0.pdf','A1-201_1층_평면_R00.dwg'],'정상','R00')],
 ['지원하지 않는 확장자',files('A-201_평면_R01.png','A-201_평면_R01.rvt'),[{name:'A-201_평면_R01.png',excluded:'지원하지 않는 형식'},{name:'A-201_평면_R01.rvt',excluded:'지원하지 않는 형식'}]],
 ['임시/백업',files('~$A-201_평면_R01.pdf','~A-201_평면_R01.pdf','A-201_평면_R01.pdf.tmp','A-201_평면_R01.pdf.part','A-201_평면_R01.pdf.crdownload','A-201_평면_R01.pdf.bak','A-201_평면_R01.pdf~'),[
  '~$A-201_평면_R01.pdf','~A-201_평면_R01.pdf','A-201_평면_R01.pdf.tmp','A-201_평면_R01.pdf.part','A-201_평면_R01.pdf.crdownload','A-201_평면_R01.pdf.bak','A-201_평면_R01.pdf~'].map(name=>({name,excluded:'임시·백업 파일'}))],
 ['숨김 이름/폴더', [{name:'.A-201_평면_R01.pdf'},{name:'A-201_평면_R01.pdf',relativePath:'.hidden/A-201_평면_R01.pdf'}],[{name:'.A-201_평면_R01.pdf',excluded:'숨김 이름 또는 숨김 폴더'},{name:'A-201_평면_R01.pdf',excluded:'숨김 이름 또는 숨김 폴더'}]],
 ['수정시각/크기 미사용', [{name:'A-201_평면_R01.pdf',size:99999,lastModified:9000},{name:'A-201_평면_R02.pdf',size:1,lastModified:1},{name:'A-201_평면_R02.dwg',size:1,lastModified:1}], [...status(['A-201_평면_R01.pdf'],'이전 리비전','R02'),...status(['A-201_평면_R02.pdf','A-201_평면_R02.dwg'],'정상','R02')]],
 ['같은 이름 다른 도면번호',files('A-001_평면_R01.pdf','A-001_평면_R01.dwg','A-999_평면_R01.pdf','A-999_평면_R01.dwg'),status(['A-001_평면_R01.pdf','A-001_평면_R01.dwg','A-999_평면_R01.pdf','A-999_평면_R01.dwg'],'정상','R01')],
];
try {
 for(const [label,input,expected] of cases){const result=plain(rules.inspect(input));for(const want of expected){const row=[...result.rows,...result.ignored].find(r=>r.name===want.name);assert(row,label+' '+want.name);if(want.excluded)assert.equal(row.reason,want.excluded,label);else{assert.equal(row.status,want.status,label);assert.equal(row.latest,want.latest,label);if(want.note)assert(row.notes.some(n=>n.includes(want.note)),label);if(want.previous)assert(row.previous,label);}}report.cases.push({label,input,expected,actual:result,passed:true});}
 for(const example of drawingExamples){const result=plain(rules.inspect(example.files));for(const item of example.files){const row=result.rows.find(r=>r.relativePath===('relativePath' in item?item.relativePath:item.name));assert.equal(row.status,item.status,example.id);assert.equal(row.latest,item.latest,example.id);}report.examples.push({id:example.id,explanation:example.result,actual:result,passed:true});}
 const manifest=JSON.parse(fs.readFileSync('review/daejeon/DRAWING_QUICK_CHECK/sample-manifest.json','utf8')),sample=plain(rules.inspect(manifest.files));assert.deepEqual(sample.summary,manifest.expectedSummary);
 for(const file of manifest.files){const row=[...sample.rows,...sample.ignored].find(r=>r.relativePath===file.relativePath);assert(row);assert.deepEqual(file.expected,file.expected.status==='제외'?{status:'제외',reason:row.reason}:{status:row.status,latest:row.latest});}
 const csv=rules.toCsv(sample);assert(csv.startsWith('\uFEFF'));assert.equal(csv.split('\r\n').filter(Boolean).length,30);assert.equal(csv.split('\r\n')[0].split(',').length,11);assert.equal(csv.split('\r\n').filter(line=>line.startsWith('"제외"')).length,5);
 report.csv={BOM:true,columns:11,rowsIncludingHeader:30,excluded:5,allRowsRegardlessOfFilter:true};report.sample={files:manifest.files.length,summary:sample.summary,passed:true};
 assert.equal(drawingExplanation.rules.length,8);assert.equal(drawingDetails.length,10);
 report.discrepancies=[{type:'설명 보완',before:'기존 본문은 최신 후보와 이전 리비전의 개요만 설명했습니다.',actual:'최신 후보는 별도 열이며 상태는 정상·확인 필요·이전 리비전·파일명 확인입니다.',change:'상태 우선순위와 정상 ≠ 제출 승인을 설명했습니다.'},{type:'설명 보완',before:'기존 대표 표는 중복 후보를 요약했습니다.',actual:'SHA나 내용 비교 없이 같은 번호·숫자 리비전·형식으로 판단하며 도면명 차이도 확인 대상입니다.',change:'숫자 동등성·도면명 차이·이전 리비전의 확인 필요 우선 표시·이름 기반 제외·CSV 전체 범위를 보완했습니다.'}];
 report.sourceAudit={parser:'rules.js inspect',group:'drawing uppercase',revision:'safe nonnegative integer from R digits',latest:'numeric maximum per drawing, padded at least two digits',titles:'exact NFC title equality; no trimming except empty validation',pair:'latest PDF and DWG; DXF supplementary',duplicates:'drawing + numeric revision + format, across relative paths',states:['정상','확인 필요','이전 리비전','파일명 확인'],latestIsColumn:true,metadataNotRanking:true,contentReads:false};
 report.passed=true;
}finally{fs.writeFileSync(output+'/program-audit.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,cases:report.cases.length,examples:report.examples.length,sample:report.sample,csv:report.csv,bugs:report.bugs}));
