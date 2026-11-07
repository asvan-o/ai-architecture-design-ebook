import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';
import {lesson02ProgramFiles} from './daejeon-file-sorter-assets.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const root='review/daejeon/LESSON02_AUTOMATION_AB';
// Keep the already approved file sorter and test ZIPs unchanged.
export function assertAutomationVerified(){
 const result=JSON.parse(readFileSync(path.join(repositoryRoot,root,'instructor/A/verification.json'),'utf8'));
 assert.equal(result.passed,true,'File sorter verification is missing');
 const files=Object.fromEntries(lesson02ProgramFiles.map(file=>[file.key,file]));
 assert.equal(files.program.sha256,result.artifacts.programZipSha256,'Verified program ZIP changed');
 assert.equal(files.test.sha256,result.artifacts.testZipSha256,'Verified test ZIP changed');
}
const folder=root+'/student/A';
const filenames={
 step1:'DJ-L02_STEP_01.txt',step2:'DJ-L02_STEP_02.txt',step3:'DJ-L02_STEP_03.txt',step4:'DJ-L02_STEP_04.txt',
 integrated:'DJ-L02_INTEGRATED_PROMPT.txt',vibeReadme:'DJ-L02_VIBE_CODING_README.txt',vibePack:'DJ-L02_VIBE_CODING_PRACTICE.zip',
 readme:'A_README.txt',expected:'A_EXPECTED_RESULTS.csv',summary:'A_VERIFICATION_SUMMARY.txt',limits:'A_KNOWN_LIMITS.txt',
 desktop:'A_INPUT_UI_DESKTOP.png',mobile:'A_INPUT_UI_MOBILE.png',pending:'A_INPUT_UI_PENDING.png',automatic:'A_INPUT_UI_AUTOMATIC.png',
};
/** @type {Record<string,Record<string,{file:string,source:string,outputPath:string,sha256:string,bytes:number}>>} */
export const automationFiles={A:{}};
const manifest=JSON.parse(readFileSync(path.join(repositoryRoot,folder,'download-manifest.json'),'utf8'));
for(const [key,file] of Object.entries(filenames)){
 const source=path.join(repositoryRoot,folder,file),bytes=readFileSync(source);
 const entry=manifest.files.find(entry=>entry.file===file);
 assert(entry,'Missing file sorter manifest entry: '+file);
 assert.equal(bytes.length,entry.bytes,file+': size mismatch');
 assert.equal(sha(bytes),entry.sha256,file+': hash mismatch');
 automationFiles.A[key]={file,source,outputPath:'practice/DJ-L02/automation/A/'+file,sha256:sha(bytes),bytes:bytes.length};
}
export const automationAssets=Object.values(automationFiles.A);
