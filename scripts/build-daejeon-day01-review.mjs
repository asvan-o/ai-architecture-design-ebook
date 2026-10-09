import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync,writeFileSync,mkdirSync,copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import {getCourseProfile,courseBuildEnvironment} from './course-registry.mjs';
import {packages,originalPath,generatedPrompts,reviewOutput,repositoryRoot} from './daejeon-review-assets.mjs';
import {reusedLesson02Files} from './daejeon-gwangju-reuse.mjs';
import {verifyDraftOutput} from './draft-output.mjs';
const profile=getCourseProfile('daejeon-2026');
assert.equal(profile.course.contentStatus,'design-pending');
assert.deepEqual(profile.course.lessons,[]);
assert.deepEqual(profile.release.releasedStudentLessonIds,[]);
const sourceFiles=packages.flatMap((p)=>p.assets.map((a)=>({id:p.id,...a,source:originalPath(p.id,a.file)})));
// Read everything before building; a missing original must not leave a partial package.
for (const file of sourceFiles) assert(readFileSync(file.source).length>0,file.source);
for (const file of reusedLesson02Files) assert(readFileSync(path.join(repositoryRoot,file.source)).length>0,file.source);
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:repositoryRoot,encoding:'utf8',windowsHide:true}).stdout.trim();
const env={...courseBuildEnvironment(profile,'student',head),PUBLIC_DAEJEON_REVIEW_ASSETS:'true',PUBLIC_PDF_DOWNLOADS_ENABLED:'false'};
const result=spawnSync(process.execPath,[path.join(repositoryRoot,'node_modules/astro/bin/astro.mjs'),'build','--outDir',reviewOutput,'--mode','student'],{cwd:repositoryRoot,env,stdio:'inherit',windowsHide:true});
assert.equal(result.status,0,'Isolated review build failed');
const files=[];
for (const file of sourceFiles) {
  const relative=`practice/${file.id}/${file.file}`;
  const target=path.join(reviewOutput,relative); mkdirSync(path.dirname(target),{recursive:true}); copyFileSync(file.source,target);
  const bytes=readFileSync(target);
  files.push({path:relative,source:path.relative(repositoryRoot,file.source).replaceAll('\\','/'),sha256:createHash('sha256').update(bytes).digest('hex'),sizeBytes:bytes.length});
}
for (const file of generatedPrompts()) {
  const target=path.join(reviewOutput,file.file);writeFileSync(target,file.text+'\n','utf8');
  const bytes=readFileSync(target);files.push({path:file.file,source:'Day 01 approved 10-item adaptation',sha256:createHash('sha256').update(bytes).digest('hex'),sizeBytes:bytes.length});
}
for (const file of reusedLesson02Files) {
  const relative=`practice/GW-L02/${file.file}`,target=path.join(reviewOutput,relative);
  mkdirSync(path.dirname(target),{recursive:true});copyFileSync(path.join(repositoryRoot,file.source),target);
  const bytes=readFileSync(target);
  files.push({path:relative,source:file.source,sha256:createHash('sha256').update(bytes).digest('hex'),sizeBytes:bytes.length});
}
writeFileSync(path.join(reviewOutput,'review-assets.json'),JSON.stringify({localOnly:true,pdfsIssued:false,courseStatus:'design-pending',files},null,2)+'\n');
writeFileSync(path.join(reviewOutput,'course-build.json'),JSON.stringify({courseId:profile.course.courseId,mode:'local-review',basePath:env.BASE_PATH,localOnly:true},null,2)+'\n');
verifyDraftOutput(profile.course,reviewOutput,{localReviewAssets:true});
console.log(`[local review] ${reviewOutput}: ${files.length} files; original bytes preserved; not in dist/site`);
