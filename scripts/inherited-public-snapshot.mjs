import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,realpathSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const defaultRepositoryRoot=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
// These files were already inherited from shared public/ by Gwangju and the
// portal. Keep their existing bytes while the workbook uses the current source.
export const inheritedPublicSnapshot=Object.freeze({
 ref:'bc4c7d141ade0c3689cf42ff18f00fe52d13618d',
 prefixes:Object.freeze(['downloads/daejeon/lesson-11','downloads/daejeon/lesson-12','downloads/daejeon/lesson-13','images/daejeon/lesson-12']),
});

export const inheritsPublicSnapshot=({courseId=process.env.PUBLIC_COURSE_ID||process.env.COURSE_ID,buildTarget=process.env.BUILD_TARGET}={})=>courseId==='gwangju-2026'||buildTarget==='portal';

export function getInheritedPublicSnapshotFiles({repositoryRoot=defaultRepositoryRoot,prefixes=inheritedPublicSnapshot.prefixes}={}){
 assert(prefixes.length>0&&prefixes.every(prefix=>inheritedPublicSnapshot.prefixes.includes(prefix)),'Invalid inherited public snapshot scope');
 const tree=execFileSync('git',['ls-tree','-r','-z','-l','--full-tree',inheritedPublicSnapshot.ref,'--',...prefixes.map(prefix=>'public/'+prefix)],{cwd:repositoryRoot,encoding:'utf8',windowsHide:true});
 const files=tree.split('\0').filter(Boolean).map(entry=>{
  const separator=entry.indexOf('\t'),[mode,type,oid,size]=entry.slice(0,separator).trim().split(/\s+/),source=entry.slice(separator+1);
  assert(separator>0&&type==='blob'&&/^100(?:644|755)$/.test(mode)&&/^[a-f0-9]{40}$/.test(oid)&&/^\d+$/.test(size),'Invalid inherited public snapshot entry');
  assert(source.startsWith('public/'),'Snapshot source must be inside public');
  const relative=source.slice('public/'.length);
  assert(prefixes.some(prefix=>relative.startsWith(prefix+'/'))&&!relative.split('/').includes('..')&&!relative.includes('\\'),'Snapshot file outside allowed scope');
  return {path:relative,oid,sizeBytes:Number(size)};
 });
 assert(files.length>0&&new Set(files.map(file=>file.path)).size===files.length,'Inherited public snapshot is missing or duplicated');
 return files;
}

export function preserveInheritedPublicSnapshot(output,{repositoryRoot=defaultRepositoryRoot,prefixes=inheritedPublicSnapshot.prefixes}={}){
 const root=path.resolve(repositoryRoot),dist=path.join(root,'dist'),destination=path.resolve(output);
 assert(destination.startsWith(dist+path.sep),'Refuse to write inherited snapshot outside repository dist');
 assert(realpathSync(destination).startsWith(realpathSync(dist)+path.sep),'Refuse inherited snapshot through an output symlink');
 const safeTarget=relative=>{
  const target=path.resolve(destination,relative);
  assert(target.startsWith(destination+path.sep),'Inherited snapshot target escaped output');
  for(let current=target;current!==destination;current=path.dirname(current)){
   if(existsSync(current))assert(!lstatSync(current).isSymbolicLink(),'Refuse inherited snapshot through a target symlink');
  }
  return target;
 };
 const files=getInheritedPublicSnapshotFiles({repositoryRoot:root,prefixes});
 // Replace only these generated folders, also excluding future workbook-only
 // additions from the inherited Gwangju/portal copy.
 for(const prefix of prefixes)rmSync(safeTarget(prefix),{recursive:true,force:true});
 for(const file of files){
  const bytes=execFileSync('git',['cat-file','blob',file.oid],{cwd:root,maxBuffer:file.sizeBytes+1024,windowsHide:true});
  assert.equal(bytes.length,file.sizeBytes,'Inherited public snapshot blob size mismatch');
  assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),file.oid,'Inherited public snapshot blob hash mismatch');
  const target=safeTarget(file.path);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,bytes);
 }
 return files;
}
