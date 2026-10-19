import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';
import {lesson02ProgramFiles} from './daejeon-file-sorter-assets.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root='review/daejeon/LESSON02_AUTOMATION_AB';
// Exercise downloads become available only after actual program verification.
export function assertAutomationVerified(){
  for(const id of ['A','B']){
    const result=JSON.parse(readFileSync(path.join(repositoryRoot,root,'instructor',id,'verification.json'),'utf8'));
    assert.equal(result.passed,true,`Exercise ${id} has not passed verification`);
    const tested=id==='B'?result.cleanRoom:result.artifacts;
    assert(tested,`Exercise ${id}: missing verified artifact hashes`);
    const files=id==='B'?automationFiles.B:Object.fromEntries(lesson02ProgramFiles.map(file=>[file.key,file]));
    assert.equal(files.program.sha256,tested.programZipSha256,`Exercise ${id}: program ZIP changed after verification`);
    assert.equal(files.test.sha256,tested.testZipSha256,`Exercise ${id}: test ZIP changed after verification`);
    if(id==='B') for(const file of drawingDemoFiles){
      const verified=result.tests.find(test=>test.test==='source runtime unchanged '+file.file);
      assert(verified?.passed,`Unverified demo runtime: ${file.file}`);
      assert.equal(file.sha256,verified.actual,`${file.file}: demo changed after verification`);
    }
  }
}
const groups={
  A:{folder:root+'/student/A',files:{first:'A_FIRST_REQUEST.txt',checklist:'A_STRUCTURE_CHECKLIST.txt',approval:'A_IMPLEMENTATION_APPROVAL.txt',readme:'A_README.txt',expected:'A_EXPECTED_RESULTS.csv',summary:'A_VERIFICATION_SUMMARY.txt',limits:'A_KNOWN_LIMITS.txt',desktop:'A_INPUT_UI_DESKTOP.png',mobile:'A_INPUT_UI_MOBILE.png',pending:'A_INPUT_UI_PENDING.png',automatic:'A_INPUT_UI_AUTOMATIC.png'}},
  B:{folder:'review/daejeon/DRAWING_QUICK_CHECK_STUDENT',files:{program:'DRAWING_QUICK_CHECK_PROGRAM.zip',test:'DRAWING_QUICK_CHECK_TEST.zip',readme:'DRAWING_QUICK_CHECK_README.txt',first:'DRAWING_QUICK_CHECK_FIRST_REQUEST.txt',approval:'DRAWING_QUICK_CHECK_IMPLEMENTATION_APPROVAL.txt',csv:'DRAWING_QUICK_CHECK_SAMPLE_RESULTS.csv',samples:'sample-manifest.json',desktop:'DRAWING_QUICK_CHECK_DESKTOP.png',mobile:'DRAWING_QUICK_CHECK_MOBILE.png'}},
};
/** @type {Record<string,Record<string,{file:string,source:string,outputPath:string,sha256:string,bytes:number}>>} */
export const automationFiles={};
for(const [id,group] of Object.entries(groups)){
  const manifest=JSON.parse(readFileSync(path.join(repositoryRoot,group.folder,'download-manifest.json'),'utf8'));
  automationFiles[id]={};
  for(const [key,file] of Object.entries(group.files)){
    const source=path.join(repositoryRoot,group.folder,file),bytes=readFileSync(source);
    const entry=manifest.files.find(entry=>entry.file===file);
    assert(entry,`Missing ${id} manifest entry: ${file}`);
    assert.equal(bytes.length,entry.bytes,`${file}: size mismatch`);
    assert.equal(sha(bytes),entry.sha256,`${file}: hash mismatch`);
    automationFiles[id][key]={file,source,outputPath:`practice/DJ-L02/automation/${id}/${file}`,sha256:sha(bytes),bytes:bytes.length};
  }
}
export const automationPrompts=Object.fromEntries(['A','B'].map(id=>[id,{first:readFileSync(automationFiles[id].first.source,'utf8'),approval:readFileSync(automationFiles[id].approval.source,'utf8')}]));
export const drawingDemoPath='practice/DJ-L02-B/demo/index.html';
export const drawingDemoFiles=['index.html','app.js','rules.js','style.css','sample-data.js','sample-manifest.json','README.txt'].map(file=>{
  const source=path.join(repositoryRoot,'review/daejeon/DRAWING_QUICK_CHECK',file),bytes=readFileSync(source);
  return {file,source,outputPath:'practice/DJ-L02/automation/B/demo/'+file,sha256:sha(bytes),bytes:bytes.length};
});
export const automationAssets=[...Object.values(automationFiles).flatMap(group=>Object.values(group)),...drawingDemoFiles];
