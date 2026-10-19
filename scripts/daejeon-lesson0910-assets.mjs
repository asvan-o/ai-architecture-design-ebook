import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {repositoryRoot} from './course-registry.mjs';

const bandabi=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson10-bandabi-materials.json'),'utf8'));
const downloadNames=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/draft/content/lesson10-downloads.json'),'utf8'));
const lesson10NamedDownloads=new Set([...Object.values(downloadNames.renames),downloadNames.promptGuide].map(file=>'downloads/daejeon/lesson-10/'+file));
const bandabiAllowed=new Set(bandabi.items.map(item=>'downloads/daejeon/lesson-10/'+item.file));

// Explicit local-review inventory. Never traverse a simulation/source drawing folder.
export function getLesson0910Assets(){
 return ['09','10'].flatMap(lesson=>{
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
   assert(!/\.(?:blend|dwg|pdf|docx|hwp|hwpx)$/i.test(item.outputPath)||bandabiAllowed.has(item.outputPath),'Only explicitly authorized Bandabi public/teaching documents are review downloads');
   return {outputPath:item.outputPath,source:path.join(repositoryRoot,'public',item.outputPath),sha256:item.sha256};
  });
 });
}
