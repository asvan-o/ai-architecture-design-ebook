import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {repositoryRoot} from './course-registry.mjs';
import {verifyLesson07Assets} from './build-daejeon-lesson07-assets.mjs';
import {verifyLesson07FloorplanAssets} from './daejeon-lesson07-floorplan-assets.mjs';
import {verifyLesson08Assets} from './daejeon-lesson08-assets.mjs';
const platform16Audit=path.join(repositoryRoot,'review/daejeon/DJ-L08-CLAUDE-ANTIGRAVITY-REVISION-16');
if(fs.existsSync(path.join(platform16Audit,'check-ebook.mjs'))){execFileSync(process.execPath,[path.join(platform16Audit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const classroom15Audit=path.join(repositoryRoot,'review/daejeon/DJ-L08-CLASSROOM-REPRODUCIBILITY-REVISION-15');
if(fs.existsSync(path.join(classroom15Audit,'check-ebook.mjs'))){execFileSync(process.execPath,[path.join(classroom15Audit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const revision15Audit=path.join(repositoryRoot,'review/daejeon/DJ-L08-BLENDER-SHORTCUTS-REVISION-15');
if(fs.existsSync(path.join(revision15Audit,'check-ebook.mjs'))){execFileSync(process.execPath,[path.join(revision15Audit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const revision14Audit=path.join(repositoryRoot,'review/daejeon/DJ-L08-BLENDER-MCP-PART3-REVISION-14');
if(fs.existsSync(path.join(revision14Audit,'check-ebook.mjs'))){execFileSync(process.execPath,[path.join(revision14Audit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const revision13Audit=path.join(repositoryRoot,'review/daejeon/DJ-L08-BLENDER-MCP-SETUP-AND-L06-SUBVIEW-RESTORE/revision-13');
if(fs.existsSync(path.join(revision13Audit,'check-ebook.mjs'))){execFileSync(process.execPath,[path.join(revision13Audit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const hotfixAudit=path.join(repositoryRoot,"review/daejeon/DJ-L06-OFFICE-SUBVIEW-AND-HOUSE-DOOR-HOTFIX/revision-12");
if(fs.existsSync(path.join(hotfixAudit,'verify-protection.mjs'))){execFileSync(process.execPath,[path.join(hotfixAudit,'check-ebook.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});process.exit(0);}
const restructureAudit=path.join(repositoryRoot,'review/daejeon/DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11');
const hasRestructure=fs.existsSync(path.join(restructureAudit,'verify-protection.mjs'));
const precisionAudit=path.join(repositoryRoot,"review/daejeon/DJ-L06-L07-ORIGINAL-HOUSE-PLAN-AND-DOOR-STAIR-PRECISION-FIX/revision-10");
const hasPrecision=fs.existsSync(path.join(precisionAudit,"verify-protection.mjs"));
const doorAudit=path.join(repositoryRoot,'review/daejeon/DJ-L07-DOOR-GEOMETRY-AND-3D-TOPVIEW-FIX/revision-8');
const allDoorAudit=path.join(repositoryRoot,'review/daejeon/DJ-ALL-LESSONS-FLOORPLAN-STAIR-AND-DOOR-AUDIT-FIX/revision-9');
const hasAllDoors=fs.existsSync(path.join(allDoorAudit,'verify-protection.mjs'));
const hasDoors=fs.existsSync(path.join(doorAudit,'floorplan-manifest.json'));
const syntheticAudit=path.join(repositoryRoot,'review/daejeon/DJ-L01-L07-PROMPT-DERIVATION-AND-L07-SYNTHETIC-PLAN/revision-7');
const hasSynthetic=fs.existsSync(path.join(syntheticAudit,'before.json'));
const cleanlineAudit=path.join(repositoryRoot,'review/daejeon/DJ-L07-CLEANLINE-SIMULATION-AND-FLOW-FIX/revision-6');
const hasCleanline=fs.existsSync(path.join(cleanlineAudit,'before.json'));
const platformAudit=path.join(repositoryRoot,'review/daejeon/DJ-L01-L07-PLATFORM-BADGES-AND-L07-CLARITY/revision-5');
const hasPlatform=fs.existsSync(path.join(platformAudit,'before.json'));
const cleanupAudit=path.join(repositoryRoot,'review/daejeon/DJ-L07-DEDUP-AND-WORDING-CLEANUP/revision-4');
const hasCleanup=fs.existsSync(path.join(cleanupAudit,'before.json'));
const appendAudit=path.join(repositoryRoot,'review/daejeon/DJ-L07-PART2-FLOORPLAN-GRAPHVIZ-APPEND/revision-3');
const hasAppend=fs.existsSync(path.join(appendAudit,'before.json'));
const originalAudit=path.join(repositoryRoot,'review/daejeon/LESSON07_IMPLEMENTATION');
const alignmentAudit=path.join(repositoryRoot,'review/daejeon/DJ-TOPIC-TITLE-ALIGNMENT/revision-1');
const textbookRevision=fs.existsSync(path.join(repositoryRoot,'review/daejeon/DJ-L07-GWANGJU-TEXTBOOK-REFINEMENT/revision-2/before.json'))?'revision-2':'revision-1';
const textbookScope='DJ-L07-GWANGJU-TEXTBOOK-REFINEMENT/'+textbookRevision;
const textbookAudit=path.join(repositoryRoot,'review/daejeon',textbookScope);
const hasTextbook=fs.existsSync(path.join(textbookAudit,'before.json'));
const hasAlignment=fs.existsSync(path.join(alignmentAudit,'before.json'));
const audit=hasRestructure?restructureAudit:hasPrecision?precisionAudit:hasAllDoors?allDoorAudit:hasDoors?doorAudit:hasSynthetic?syntheticAudit:hasCleanline?cleanlineAudit:hasPlatform?platformAudit:hasCleanup?cleanupAudit:hasAppend?appendAudit:hasTextbook?textbookAudit:hasAlignment?alignmentAudit:originalAudit;
const before=JSON.parse(fs.readFileSync(path.join(originalAudit,'before.json'),'utf8'));
const allowed=new Set(['astro.config.mjs','package.json','data/courses/daejeon-2026/course.json','scripts/course-registry.mjs','scripts/daejeon-local-assets.mjs','scripts/daejeon-local-assets-plugin.mjs','scripts/draft-output.mjs','scripts/build-daejeon-day01-review.mjs','src/draft/content/review-navigation.ts','src/draft/layouts/ReviewLayout.astro']);
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const changed=[],protectedChanges=[];
let checkedFileCount=before.daejeon.length;
let generatedEvidenceChanges=0;let latestProtection=null;
if(hasRestructure){
 execFileSync(process.execPath,[path.join(restructureAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const result=JSON.parse(fs.readFileSync(path.join(restructureAudit,'protection-report.json'),'utf8'));latestProtection=result;
 assert.equal(result.revision,'DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11');assert.equal(result.passed,true);
 changed.push(...result.changedSourceFiles);generatedEvidenceChanges=result.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(restructureAudit,'before.json'),'utf8')).files.length-result.changedAssetsAndManifest.length;
}else if(hasPrecision){
 execFileSync(process.execPath,[path.join(precisionAudit,"verify-protection.mjs")],{cwd:repositoryRoot,windowsHide:true});
 const result=JSON.parse(fs.readFileSync(path.join(precisionAudit,"protection-report.json"),"utf8"));assert.equal(result.passed,true);changed.push(...result.changedSourceFiles);generatedEvidenceChanges=result.generatedEvidenceChanges;checkedFileCount=JSON.parse(fs.readFileSync(path.join(precisionAudit,"before.json"),"utf8")).files.length-result.changedAssetsAndManifest.length;
}else if(hasAllDoors){
 execFileSync(process.execPath,[path.join(allDoorAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const result=JSON.parse(fs.readFileSync(path.join(allDoorAudit,'protection-report.json'),'utf8'));assert.equal(result.passed,true);
 changed.push(...result.changedSourceFiles);generatedEvidenceChanges=result.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(allDoorAudit,'before.json'),'utf8')).files.length-result.changedAssetsAndManifest.length;
}else if(hasDoors){
 execFileSync(process.execPath,[path.join(doorAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const doors=JSON.parse(fs.readFileSync(path.join(doorAudit,'protection-report.json'),'utf8'));assert.equal(doors.passed,true);
 changed.push(...doors.changedSourceFiles);generatedEvidenceChanges=doors.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(doorAudit,'before.json'),'utf8')).files.length-doors.changedAssetsAndManifest.length;
}else if(hasSynthetic){
 execFileSync(process.execPath,[path.join(syntheticAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const synthetic=JSON.parse(fs.readFileSync(path.join(syntheticAudit,'protection-report.json'),'utf8'));assert.equal(synthetic.passed,true);
 changed.push(...synthetic.changedSourceFiles);generatedEvidenceChanges=synthetic.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(syntheticAudit,'before.json'),'utf8')).files.length-synthetic.changedAssetsAndManifest.length;
}else if(hasCleanline){
 execFileSync(process.execPath,[path.join(cleanlineAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const cleanline=JSON.parse(fs.readFileSync(path.join(cleanlineAudit,'protection-report.json'),'utf8'));
 assert.equal(cleanline.revision,'DJ-L07-CLEANLINE-SIMULATION-AND-FLOW-FIX/revision-6');assert.equal(cleanline.passed,true);
 changed.push(...cleanline.changedSourceFiles);generatedEvidenceChanges=cleanline.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(cleanlineAudit,'before.json'),'utf8')).files.length;
}else if(hasPlatform){
 execFileSync(process.execPath,[path.join(platformAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const platform=JSON.parse(fs.readFileSync(path.join(platformAudit,'protection-report.json'),'utf8'));
 assert.equal(platform.revision,'DJ-L01-L07-PLATFORM-BADGES-AND-L07-CLARITY/revision-5');assert.equal(platform.passed,true);
 changed.push(...platform.changedSourceFiles);generatedEvidenceChanges=platform.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(platformAudit,'before.json'),'utf8')).files.length;
}else if(hasCleanup){
 execFileSync(process.execPath,[path.join(cleanupAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const cleanup=JSON.parse(fs.readFileSync(path.join(cleanupAudit,'protection-report.json'),'utf8'));
 assert.equal(cleanup.revision,'DJ-L07-DEDUP-AND-WORDING-CLEANUP/revision-4');assert.equal(cleanup.passed,true);
 changed.push(...cleanup.changedSourceFiles);generatedEvidenceChanges=cleanup.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(cleanupAudit,'before.json'),'utf8')).files.length;
}else if(hasAppend){
 execFileSync(process.execPath,[path.join(appendAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const append=JSON.parse(fs.readFileSync(path.join(appendAudit,'protection-report.json'),'utf8'));
 assert.equal(append.revision,'DJ-L07-PART2-FLOORPLAN-GRAPHVIZ-APPEND/revision-3');assert.equal(append.passed,true);
 changed.push(...append.changedSourceFiles);generatedEvidenceChanges=append.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(appendAudit,'before.json'),'utf8')).files.length;
}else if(hasTextbook){
 // A new explicit authorization expands only Lesson07 teaching presentation.
 // Preserve older one-off audit records and check against the new full snapshot.
 execFileSync(process.execPath,[path.join(textbookAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const textbook=JSON.parse(fs.readFileSync(path.join(textbookAudit,'protection-report.json'),'utf8'));
 assert.equal(textbook.revision,textbookScope);assert.equal(textbook.passed,true);
 changed.push(...textbook.changedSourceFiles);
 generatedEvidenceChanges=textbook.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(textbookAudit,'before.json'),'utf8')).files.length;
}else if(hasAlignment){
 // Preserve the historical audit. Its full-file freeze predates the explicitly
 // authorized title/UI revision; the new guard verifies that narrow delta,
 // unchanged lesson bodies, original binary assets and canonical repository.
 execFileSync(process.execPath,[path.join(alignmentAudit,'verify-protection.mjs')],{cwd:repositoryRoot,windowsHide:true});
 const alignment=JSON.parse(fs.readFileSync(path.join(alignmentAudit,'protection-report.json'),'utf8'));
 assert.equal(alignment.revision,'DJ-TOPIC-TITLE-ALIGNMENT/revision-1');assert.equal(alignment.passed,true);
 changed.push(...alignment.changedSourceFiles);
 generatedEvidenceChanges=alignment.generatedEvidenceChanges;
 checkedFileCount=JSON.parse(fs.readFileSync(path.join(alignmentAudit,'before.json'),'utf8')).files.length;
}else for(const row of before.daejeon){if(!fs.existsSync(path.join(repositoryRoot,row.file))||sha(path.join(repositoryRoot,row.file))!==row.sha256){changed.push(row.file);if(!allowed.has(row.file))protectedChanges.push(row.file);}}
assert.deepEqual(protectedChanges,[],'Pre-existing protected file changed');
for(const row of before.gwangju)assert.equal(sha(path.join(repositoryRoot,'../gwangju',row.file)),row.sha256,'Canonical Gwangju changed: '+row.file);
const archive=JSON.parse(fs.readFileSync(path.join(originalAudit,'archive-before.json'),'utf8'));
for(const row of archive.files)assert.equal(sha(path.join(archive.root,row.file)),row.sha256,'Read-only archive changed: '+row.file);
assert.equal(execFileSync('git',['rev-parse','HEAD']).toString().trim(),before.head);assert.equal(execFileSync('git',['branch','--show-current']).toString().trim(),before.branch);
const manifest=verifyLesson07Assets();
const supplement=hasRestructure?verifyLesson08Assets():hasAppend?verifyLesson07FloorplanAssets():{files:[]};
for(const lesson of hasRestructure?['07','08']:['07'])for(const mode of ['student','review']){
 const file='dist/daejeon-2026/'+mode+'/lessons/'+lesson+'/index.html';assert(fs.existsSync(file),'Build required: '+file);
 const html=fs.readFileSync(file,'utf8');assert(html.includes('noindex')&&html.includes('design-pending')&&html.includes('instructor-review'),file);
 const expected=lesson==='08'?{sections:6,parts:3,minutes:150}:hasRestructure?{sections:16,parts:6,minutes:300}:{sections:hasAppend?22:16,parts:hasAppend?8:6,minutes:300};
 assert.equal([...html.matchAll(new RegExp('data-review-section="l'+lesson+'-','g'))].length,expected.sections,file);
 const sectionMinutes=[...html.matchAll(/data-section-minutes="(\d+)"/g)].map(m=>Number(m[1]));assert.equal(sectionMinutes.length,expected.sections,file);
 assert.equal(sectionMinutes.reduce((sum,n)=>sum+n,0),expected.minutes,file);
 const partMinutes=[...html.matchAll(/data-teaching-minutes="(\d+)"/g)].map(m=>Number(m[1]));assert.equal(partMinutes.length,expected.parts,file);if(hasRestructure)assert(partMinutes.every(n=>n===50),file);
 if(lesson==='07'&&hasRestructure){assert(!/data-review-section="l07-(?:plan-prep-why|notebooklm-plan|clean-line-criteria|spatial-validation|graphviz-diagram|part2-handover)"/.test(html),file);assert(!html.includes('DJ-L07-Floorplan-Graphviz-Pack.zip'),file);}
}
for(const output of ['dist/gwangju-2026/student','dist/daejeon-2026/student','dist/site/gwangju','dist/site/daejeon'])for(const lesson of hasRestructure?['07','08']:['07'])for(const folder of ['images/daejeon/lesson-'+lesson,'downloads/daejeon/lesson-'+lesson])assert(!fs.existsSync(path.join(output,folder)),'Review package leaked to '+output);
const local=JSON.parse(fs.readFileSync('dist/daejeon-2026/review/review-assets.json','utf8'));
for(const asset of [...manifest.files,...supplement.files]){const item=local.files.find(f=>f.path===asset.outputPath);assert(item&&item.sha256===asset.sha256);assert.equal(sha(path.join('dist/daejeon-2026/review',asset.outputPath)),asset.sha256);}
const report={passed:true,protectionScope:hasRestructure?'DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11':hasPrecision?"DJ-L06-L07-ORIGINAL-HOUSE-PLAN-AND-DOOR-STAIR-PRECISION-FIX/revision-10":hasAllDoors?"DJ-ALL-LESSONS-FLOORPLAN-STAIR-AND-DOOR-AUDIT-FIX/revision-9":hasDoors?'DJ-L07-DOOR-GEOMETRY-AND-3D-TOPVIEW-FIX/revision-8':hasSynthetic?'DJ-L01-L07-PROMPT-DERIVATION-AND-L07-SYNTHETIC-PLAN/revision-7':hasCleanline?'DJ-L07-CLEANLINE-SIMULATION-AND-FLOW-FIX/revision-6':hasPlatform?'DJ-L01-L07-PLATFORM-BADGES-AND-L07-CLARITY/revision-5':hasCleanup?'DJ-L07-DEDUP-AND-WORDING-CLEANUP/revision-4':hasAppend?'DJ-L07-PART2-FLOORPLAN-GRAPHVIZ-APPEND/revision-3':hasTextbook?textbookScope:hasAlignment?'DJ-TOPIC-TITLE-ALIGNMENT/revision-1':'LESSON07_IMPLEMENTATION',existingFileChanges:changed,protectedChanges,generatedEvidenceChanges,gwangjuCanonicalFiles:before.gwangju.length,gwangjuCanonicalChanges:0,archiveFilesChecked:hasRestructure?latestProtection.archiveFiles:archive.files.length,archiveChanges:0,priorDaejeonFilesProtected:checkedFileCount-changed.length-generatedEvidenceChanges,lessonCount:hasRestructure?8:7,sections:hasRestructure?{lesson07:16,lesson08:6}:hasAppend?22:16,assetCount:manifest.files.length+supplement.files.length,archiveScopeImplemented:true,limitations:manifest.gaps,approval:'Codex self-check only; Reviewer and user approval pending'};
fs.writeFileSync(path.join(audit,'protection-and-ebook.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(audit,'status-after.txt'),execFileSync('git',['status','--short']));
console.log(JSON.stringify(report,null,2));
