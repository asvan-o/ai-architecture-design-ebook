import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {packages,originalPath,generatedPrompts,repositoryRoot} from './daejeon-review-assets.mjs';
import {reusedLesson02Files} from './daejeon-gwangju-reuse.mjs';
import {lesson02Images} from './daejeon-lesson02-assets.mjs';
import {lesson02ProgramAssets} from './daejeon-file-sorter-assets.mjs';
import {automationAssets,assertAutomationVerified,drawingDemoFiles} from './daejeon-automation-ab-assets.mjs';
import {lesson03SampleImages,lesson03SamplePrompts,lesson03WarmAnalysis} from './daejeon-lesson03-assets.mjs';
import {lesson04Assets} from './daejeon-lesson04-assets.mjs';
import {lesson04ApplicationAssets} from './daejeon-lesson04-applications.mjs';
import {lesson05Assets} from './daejeon-lesson05-assets.mjs';
import {lesson06Assets} from './daejeon-lesson06-assets.mjs';
import {getLesson07Assets} from './build-daejeon-lesson07-assets.mjs';
import {getLesson08Assets} from './daejeon-lesson08-assets.mjs';
import {getLesson0910Assets} from './daejeon-lesson0910-assets.mjs';
import {getLesson111213Assets} from './daejeon-lesson111213-assets.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const textbookPdfNames=[
  'ai-architecture-design-daejeon-course-overview.pdf',
  ...Array.from({length:13},(_,i)=>`ai-architecture-design-daejeon-lesson-${String(i+1).padStart(2,'0')}.pdf`),
];
export function getDaejeonTextbookPdfs(){
  const pdfDir=path.join(repositoryRoot,'review','daejeon','PDF_TEXTBOOKS');
  return textbookPdfNames
    .map(name=>({outputPath:'downloads/daejeon/pdf/'+name,source:path.join(pdfDir,name)}))
    .filter(item=>{try{return readFileSync(item.source).length>0;}catch{return false;}});
}
export function getDaejeonLocalAssets(){
  assertAutomationVerified();
  const sourceFiles=packages.flatMap(p=>p.assets.map(a=>({outputPath:'practice/'+p.id+'/'+a.file,source:originalPath(p.id,a.file)})));
  const prompts=generatedPrompts().map(p=>({outputPath:p.file,text:p.text+'\n'}));
  const reused=reusedLesson02Files.map(f=>({outputPath:f.outputPath||'practice/GW-L02/'+f.file,source:path.join(repositoryRoot,f.source)}));
  const aliases=drawingDemoFiles.map(f=>({...f,outputPath:'practice/DJ-L02-B/demo/'+f.file}));
  const items=[...sourceFiles,...prompts,...reused,...lesson02Images,...lesson02ProgramAssets,...automationAssets,...aliases,...lesson03SampleImages,...lesson03SamplePrompts,lesson03WarmAnalysis,...lesson04Assets,...lesson04ApplicationAssets,...lesson05Assets,...lesson06Assets,...getLesson07Assets(),...getLesson08Assets(),...getLesson0910Assets(),...getLesson111213Assets(),...getDaejeonTextbookPdfs()];
  const entries=new Map();
  for(const item of items){
    const bytes=item.source?readFileSync(item.source):Buffer.from(item.text);
    assert(bytes.length>0,item.outputPath);if(item.sha256)assert.equal(sha(bytes),item.sha256,item.outputPath);
    assert(!entries.has(item.outputPath),'Duplicate local asset '+item.outputPath);
    entries.set(item.outputPath,{path:item.outputPath,source:'source' in item?path.relative(repositoryRoot,item.source).replaceAll('\\','/'):'generated local review Prompt',sha256:sha(bytes),sizeBytes:bytes.length,bytes});
  }
  return entries;
}
export function writeDaejeonLocalAssets(output){
  const entries=getDaejeonLocalAssets();
  const files=[];
  for(const asset of entries.values()){
    const target=path.join(output,asset.path);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,asset.bytes);
    const {bytes,...entry}=asset;files.push(entry);
  }
  writeFileSync(path.join(output,'review-assets.json'),JSON.stringify({localOnly:true,pdfsIssued:false,courseStatus:'design-pending',files},null,2)+'\n');
  return files;
}
