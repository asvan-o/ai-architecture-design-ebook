import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {repositoryRoot} from './course-registry.mjs';
const named=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson111213-assets.json'),'utf8'));
const allowed=new Set(named.map(item=>item.outputPath));
export function getLesson111213Assets(){
 return ['11','12','13'].flatMap(lesson=>{
  const outputPath=`downloads/daejeon/lesson-${lesson}/manifest.json`;
  const file=path.join(repositoryRoot,'public',outputPath),bytes=fs.readFileSync(file),manifest=JSON.parse(bytes);
  assert(manifest.lesson===lesson&&manifest.localOnly&&manifest.status==='design-pending'&&manifest.reviewStatus==='instructor-review');
  assert(manifest.selfCreatedHouseOnly&&manifest.externalHwangInsuDrawingsIncluded===false);
  return [...manifest.files,{outputPath,sha256:createHash('sha256').update(bytes).digest('hex')}].map(item=>{
   assert(item.outputPath===outputPath||allowed.has(item.outputPath),'Unregistered portfolio asset');
   assert(item.outputPath.startsWith(`images/daejeon/lesson-${lesson}/`)||item.outputPath.startsWith(`downloads/daejeon/lesson-${lesson}/`));
   assert(!/[\\\x00-\x1f]/.test(item.outputPath)&&!item.outputPath.split('/').includes('..'));
   assert(/\.(?:png|jpe?g|pdf|pptx|md|txt|csv|json|zip)$/.test(item.outputPath));
   return {...item,source:path.join(repositoryRoot,'public',item.outputPath)};
  });
 });
}
