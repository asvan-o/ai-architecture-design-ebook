import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';
const revision=process.argv.includes('--day01-revision');
const snapshotDirectory=revision?'tmp/day01-revision':'tmp/day01-implementation';
const snapshot=JSON.parse(readFileSync(path.join(repositoryRoot,snapshotDirectory,'before.json'),'utf8'));
const gwangjuRoot=path.join(repositoryRoot,'..','gwangju');
const allowed=new Set(['data/courses/daejeon-2026/course.json','scripts/course-registry.mjs','scripts/run-ebook-mode.mjs','scripts/draft-output.mjs','scripts/verify-daejeon-review.mjs','src/draft/content/daejeon-2026.ts','src/draft/layouts/ReviewLayout.astro','src/draft/pages/index.astro','src/draft/pages/course-overview.astro','src/draft/pages/lessons/01.astro','src/draft/styles/review.css']);
if(revision) for(const file of ['scripts/build-daejeon-day01-review.mjs','scripts/verify-daejeon-protection.mjs',
  ...['RFP-draft.pdf','RFP-source.md','manifest.json','package-report.md','participant-package.zip','review-package.zip','review.html'].map((suffix)=>`review/daejeon/DJ-CF-02/DJ-CF-02_${suffix}`),
  ...['content.json','content.py','documents.py','pdf-layout-check.json','review.py','validate.py'].map((suffix)=>`review/daejeon/DJ-CF-02/source/DJ-CF-02_${suffix}`)]) allowed.add(file);
const digest=(file)=>createHash('sha256').update(readFileSync(file)).digest('hex');
const compare=(root,files)=>Object.entries(files).filter(([file,hash])=>!existsSync(path.join(root,file))||digest(path.join(root,file))!==hash).map(([file])=>file);
const gwangjuChanges=compare(gwangjuRoot,snapshot.gwangju);assert.deepEqual(gwangjuChanges,[],'Gwangju files changed');
const daejeonChanges=compare(repositoryRoot,snapshot.daejeon);
assert(Object.keys(snapshot.daejeon).every((file)=>existsSync(path.join(repositoryRoot,file))),'Existing file deleted');
assert.deepEqual(daejeonChanges.filter((file)=>!allowed.has(file)),[],'Existing unrelated work changed');
const packageFiles=Object.keys(snapshot.daejeon).filter((file)=>/^review\/daejeon\/DJ-CF-0[12]\//.test(file));
const protectedPackageFiles=revision?packageFiles.filter((file)=>!allowed.has(file)):packageFiles;
assert.equal(protectedPackageFiles.filter((file)=>daejeonChanges.includes(file)).length,0,'Protected original packages changed');
if(revision) {
  const old=JSON.parse(readFileSync(path.join(repositoryRoot,snapshotDirectory,'before/review/daejeon/DJ-CF-02/source/DJ-CF-02_content.json'),'utf8'));
  const current=JSON.parse(readFileSync(path.join(repositoryRoot,'review/daejeon/DJ-CF-02/source/DJ-CF-02_content.json'),'utf8'));
  assert.deepEqual(Object.keys(old).filter((key)=>JSON.stringify(old[key])!==JSON.stringify(current[key])),['revision','unknown','deliverables'],'RFP scope expanded');
}
const git=(root,args)=>{const result=spawnSync('git',['--no-optional-locks',...args],{cwd:root,encoding:'utf8',windowsHide:true});assert.equal(result.status,0);return result.stdout.trim();};
assert.equal(git(gwangjuRoot,['status','--porcelain']),'');
assert.equal(git(gwangjuRoot,['rev-parse','HEAD']),'cdc99d788b9506344872c865730cd9cf002f16ec');
assert.equal(git(repositoryRoot,['branch','--show-current']),'refactor/multi-region-ebook');
assert.equal(git(repositoryRoot,['rev-parse','HEAD']),'efc3cb012b34523b86f4fd3f1f822554ebe26f95');
git(repositoryRoot,['diff','--check']);
const report={passed:true,scope:revision?'approved Day 01 revision':'initial Day 01 implementation',gwangjuRoot,gwangjuFilesCompared:Object.keys(snapshot.gwangju).length,gwangjuChanges,originalPackageFilesCompared:protectedPackageFiles.length,originalPackageChanges:[],existingDaejeonFilesCompared:Object.keys(snapshot.daejeon).length,authorizedChanges:daejeonChanges,unrelatedChanges:[],gwangjuClean:true,headsUnchanged:true,gitDiffCheck:true,status:git(repositoryRoot,['status','--short'])};
writeFileSync(path.join(repositoryRoot,snapshotDirectory,'protection-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
