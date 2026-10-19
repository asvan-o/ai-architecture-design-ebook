import {rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
// Source assets live at the requested public paths but are distributed ONLY by
// the isolated Daejeon review writer, never by Gwangju or the public aggregate.
export function lesson07PreviewBoundary(){return{name:'lesson07-preview-boundary',hooks:{'astro:build:done':({dir})=>{
 const output=path.resolve(fileURLToPath(dir)),dist=path.resolve('dist');
 assert(output.startsWith(dist+path.sep),'Refuse to modify output outside repository dist');
 for(const folder of ['practice/DJ-L06','images/daejeon/lesson-07','downloads/daejeon/lesson-07','images/daejeon/lesson-08','downloads/daejeon/lesson-08','images/daejeon/lesson-09','downloads/daejeon/lesson-09','images/daejeon/lesson-10','downloads/daejeon/lesson-10']){
  const target=path.resolve(output,folder);
  assert(target.startsWith(output+path.sep)&&target!==output,'Invalid generated Lesson07 path');
  rmSync(target,{recursive:true,force:true});
 }
}}};}
