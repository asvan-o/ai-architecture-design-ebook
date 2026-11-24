import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {repositoryRoot} from './course-registry.mjs';

const bandabi=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson10-bandabi-materials.json'),'utf8'));
const downloadNames=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson10-downloads.json'),'utf8'));
const lesson10NamedDownloads=new Set([...Object.values(downloadNames.renames),downloadNames.promptGuide].map(file=>'downloads/daejeon/lesson-10/'+file));
const bandabiAllowed=new Set(bandabi.items.map(item=>'downloads/daejeon/lesson-10/'+item.file));
// One self-created house animation is approved for direct download. Keep all
// unrelated Blender/source drawing files excluded from the public inventory.
export const houseWalkthroughBlendPath='downloads/daejeon/lesson-09/House_3F_B_Walkthrough_160s_Astra.blend';

const lesson09ExteriorStyleImages=[
 'images/daejeon/lesson-09/l09-reference-grounding-flow.svg',
 'images/daejeon/lesson-09/ext-01-modern-minimal.jpg',
 'images/daejeon/lesson-09/ext-02-exposed-concrete.jpg',
 'images/daejeon/lesson-09/ext-03-modern-brick.jpg',
 'images/daejeon/lesson-09/ext-04-nordic-wood.jpg',
 'images/daejeon/lesson-09/ext-05-modern-hanok.jpg',
 'images/daejeon/lesson-09/ext-06-california-midcentury.jpg',
 'images/daejeon/lesson-09/ext-07-dark-zinc-corten.jpg',
 'images/daejeon/lesson-09/ext-08-mediterranean-villa.jpg',
 'images/daejeon/lesson-10/l10-dual-notebook-flow.svg',
];

// Explicit local-review inventory. Never traverse a simulation/source drawing folder.
export function getLesson0910Assets(){
 const baseEntries=['09','10'].flatMap(lesson=>{
  const relative=`downloads/daejeon/lesson-${lesson}/manifest.json`;
  const source=path.join(repositoryRoot,'public',relative);
  const bytes=fs.readFileSync(source);
  const manifest=JSON.parse(bytes.toString('utf8'));
  assert(manifest.lesson===lesson&&manifest.localOnly===true);
  if(lesson==='10')assert(manifest.originalDrawingsIncluded===true&&manifest.bandabiPublicSourceDocumentsIncluded===true&&manifest.originalDrawingsScope==='seosan-bandabi-public-competition-only'&&manifest.hwangInsuOriginalDrawingsIncluded===false);
  else assert(manifest.originalDrawingsIncluded===false);
  const entries=[...manifest.files,{outputPath:relative,sha256:createHash('sha256').update(bytes).digest('hex')}];
  return entries.map(item=>{
   const safeNamed=lesson==='10'&&lesson10NamedDownloads.has(item.outputPath)&&!/[\\\x00-\x1f]/.test(item.outputPath)&&!item.outputPath.split('/').includes('..');
   assert(safeNamed||new RegExp(`^(?:images|downloads)/daejeon/lesson-${lesson}/(?:house-drawings/)?[a-zA-Z0-9._-]+$`).test(item.outputPath),'Unsafe Lesson09/10 asset path');
   assert(!/\.(?:blend|dwg|pdf|docx|hwp|hwpx)$/i.test(item.outputPath)||bandabiAllowed.has(item.outputPath)||(lesson==='09'&&item.outputPath===houseWalkthroughBlendPath),'Only explicitly authorized teaching documents/models are review downloads');
   return {outputPath:item.outputPath,source:path.join(repositoryRoot,'public',item.outputPath),sha256:item.sha256};
  });
 });
 return [...baseEntries,...lesson09ExteriorStyleImages.map(outputPath=>({outputPath,source:path.join(repositoryRoot,'public',outputPath)}))];
}
