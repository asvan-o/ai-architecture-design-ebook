import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Source IDs and approved assets keep their historical identity. Only public paths change.
export function workbookAssetPath(value){
  return value.replace(/^downloads\/daejeon\/pdf\/ai-architecture-design-daejeon-/,'downloads/pdf/ai-architecture-design-')
    .replace(/^downloads\/daejeon\//,'downloads/').replace(/^images\/daejeon\//,'images/')
    .replace(/^practice\/gwangju-lesson02-reuse\//,'practice/shared-reference/');
}
export function legacyWorkbookAssetPath(value){
  return value.replace(/^downloads\/pdf\/ai-architecture-design-/,'downloads/daejeon/pdf/ai-architecture-design-daejeon-')
    .replace(/^downloads\/(lesson-\d+\/)/,'downloads/daejeon/$1').replace(/^images\/(lesson-\d+\/)/,'images/daejeon/$1')
    .replace(/^practice\/shared-reference\//,'practice/gwangju-lesson02-reuse/');
}
export function publicReleasePath(value){
  return value.startsWith('daejeon/')?'workbook/'+workbookAssetPath(value.slice(8)):value;
}
export function legacyReleasePath(value){
  return value.startsWith('workbook/')?'daejeon/'+legacyWorkbookAssetPath(value.slice(9)):value;
}
export function workbookReferences(text){
  return text.replaceAll('downloads/daejeon/pdf/ai-architecture-design-daejeon-','downloads/pdf/ai-architecture-design-')
    .replaceAll('downloads/daejeon/','downloads/').replaceAll('images/daejeon/','images/')
    .replaceAll('practice/gwangju-lesson02-reuse/','practice/shared-reference/')
    .replaceAll('ai-architecture-design-daejeon-','ai-architecture-design-')
    .replaceAll('/ai-architecture-design-ebook/daejeon/','/ai-architecture-design-ebook/workbook/')
    .replace(/(["'(=])\/daejeon\//g,'$1/workbook/');
}
export function rewriteWorkbookReferences(text){
  // Also cover JSON-escaped URLs without changing workflow/prompt data files.
  return workbookReferences(text).replace(/(?:downloads|images)\\\/daejeon\\\//g,m=>m.replace('\\/daejeon',''));
}
export function neutralizeWorkbookOutput(output){
  const root=path.resolve(output);
  assert(root.split(path.sep).includes('dist')&&root.split(path.sep).includes('daejeon-2026'),'Only the generated workbook output may be normalized');
  const files=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):[path.join(d,e.name)]);
  const all=files(root),renames=all.map(file=>{const old=path.relative(root,file).replaceAll('\\','/');const next=workbookAssetPath(old).replace(/(^|\/)Daejeon(?=[^/]*\.(?:js|css|mjs)$)/gi,'$1Workbook');return{file,old,next};});
  assert.equal(new Set(renames.map(f=>f.next)).size,renames.length,'Public asset path collision');
  const changedNames=renames.filter(f=>f.old!==f.next);
  for(const f of renames){
    if(/\.(?:html|js|mjs|css)$/i.test(f.old)){
      const original=readFileSync(f.file,'utf8');let text=rewriteWorkbookReferences(original);
      for(const n of changedNames){text=text.replaceAll(n.old,n.next);if(/daejeon/i.test(path.posix.basename(n.old)))text=text.replaceAll(path.posix.basename(n.old),path.posix.basename(n.next));}
      if(text!==original)writeFileSync(f.file,text);
    }
  }
  for(const f of changedNames){const target=path.resolve(root,f.next);assert(target.startsWith(root+path.sep));mkdirSync(path.dirname(target),{recursive:true});renameSync(f.file,target);}
  const manifestFile=path.join(root,'review-assets.json'),manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
  manifest.files=manifest.files.map(({source,...f})=>{const p=workbookAssetPath(f.path),bytes=readFileSync(path.join(root,p));return{...f,path:p,sizeBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});
  writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
  return{renamedFiles:changedNames.length};
}
