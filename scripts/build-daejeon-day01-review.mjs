import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getCourseProfile,courseBuildEnvironment} from './course-registry.mjs';
import {reviewOutput,repositoryRoot} from './daejeon-review-assets.mjs';
import {writeDaejeonLocalAssets} from './daejeon-local-assets.mjs';
import {verifyDraftOutput} from './draft-output.mjs';
export async function buildDaejeonDay01Review(){
  const profile=getCourseProfile('daejeon-2026');
  assert.equal(profile.course.contentStatus,'design-pending');assert.deepEqual(profile.course.lessons,[]);assert.deepEqual(profile.release.releasedStudentLessonIds,[]);
  const head=spawnSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:repositoryRoot,encoding:'utf8',windowsHide:true}).stdout.trim();
  const portalBase=process.env.PORTAL_BASE_PATH||process.env.BASE_PATH||'/ai-architecture-design-ebook';
  const env={...courseBuildEnvironment(profile,'student',head),PORTAL_BASE_PATH:portalBase,BASE_PATH:portalBase.replace(/\/$/,'')+'/daejeon',PUBLIC_DAEJEON_REVIEW_ASSETS:'true',PUBLIC_ENABLE_DAEJEON_PREVIEW:'true',PUBLIC_PDF_DOWNLOADS_ENABLED:'false'};
  const result=spawnSync(process.execPath,[path.join(repositoryRoot,'node_modules/astro/bin/astro.mjs'),'build','--outDir',reviewOutput,'--mode','student'],{cwd:repositoryRoot,env,stdio:'inherit',windowsHide:true});
  assert.equal(result.status,0,'Integrated Daejeon local review build failed');
  const files=writeDaejeonLocalAssets(reviewOutput);
  writeFileSync(path.join(reviewOutput,'course-build.json'),JSON.stringify({courseId:profile.course.courseId,mode:'local-review',basePath:env.BASE_PATH,localOnly:true},null,2)+'\n');
  const routes=verifyDraftOutput(profile.course,reviewOutput,{localReviewAssets:true});
  console.log('[local review] Overview + lessons 01/02/03/04/05/06/07/08: '+files.length+' assets; '+routes.length+' routes; original bytes preserved; no public release');
  return {output:reviewOutput,files,routes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildDaejeonDay01Review();
