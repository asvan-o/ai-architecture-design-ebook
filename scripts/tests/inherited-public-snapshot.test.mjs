import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {getInheritedPublicSnapshotFiles,inheritedPublicSnapshot,inheritsPublicSnapshot,preserveInheritedPublicSnapshot} from '../inherited-public-snapshot.mjs';
import {lesson07PreviewBoundary} from '../lesson07-preview-boundary.mjs';

const root=path.resolve(fileURLToPath(new URL('../../',import.meta.url))),dist=path.join(root,'dist');
const temporaryOutput=()=>{mkdirSync(dist,{recursive:true});return mkdtempSync(path.join(dist,'.inherited-snapshot-test-'));};
const clean=output=>{assert(path.resolve(output).startsWith(dist+path.sep));rmSync(output,{recursive:true,force:true});};

test('Only Gwangju and the portal inherit the fixed shared-public snapshot',()=>{
 assert(inheritsPublicSnapshot({courseId:'gwangju-2026',buildTarget:'course'}));
 assert(inheritsPublicSnapshot({courseId:'daejeon-2026',buildTarget:'portal'}));
 assert(!inheritsPublicSnapshot({courseId:'daejeon-2026',buildTarget:'course'}));
 const files=getInheritedPublicSnapshotFiles();assert.equal(files.length,65);
 assert(files.every(file=>inheritedPublicSnapshot.prefixes.some(prefix=>file.path.startsWith(prefix+'/'))));
});

test('A simulated output receives original blobs while current sources and other output files stay intact',()=>{
 const output=temporaryOutput(),prefixes=['downloads/daejeon/lesson-11'];
 try{
  const files=getInheritedPublicSnapshotFiles({prefixes}),sourceBefore=files.map(file=>readFileSync(path.join(root,'public',file.path)));
  const folder=path.join(output,prefixes[0]);mkdirSync(folder,{recursive:true});
  writeFileSync(path.join(folder,'manifest.json'),'changed workbook copy');writeFileSync(path.join(folder,'workbook-only.txt'),'new workbook file');
  writeFileSync(path.join(output,'unrelated.txt'),'keep');
  const restored=preserveInheritedPublicSnapshot(output,{prefixes});assert.equal(restored.length,3);
  for(const [index,file] of files.entries()){
   const expected=execFileSync('git',['cat-file','blob',file.oid],{cwd:root,windowsHide:true});
   assert.deepEqual(readFileSync(path.join(output,file.path)),expected);
   assert.deepEqual(readFileSync(path.join(root,'public',file.path)),sourceBefore[index]);
  }
  assert.equal(readdirSync(folder).length,3);assert(!existsSync(path.join(folder,'workbook-only.txt')));
  assert.equal(readFileSync(path.join(output,'unrelated.txt'),'utf8'),'keep');
 }finally{clean(output);}
});

test('The workbook build hook keeps its current source copy, and output guards reject source paths',()=>{
 const output=temporaryOutput(),relative='downloads/daejeon/lesson-13/current-workbook.md';
 try{
  mkdirSync(path.dirname(path.join(output,relative)),{recursive:true});writeFileSync(path.join(output,relative),'current workbook');
  for(const courseOnly of ['practice/DJ-L05','practice/DJ-L06']){
   const folder=path.join(output,courseOnly);mkdirSync(folder,{recursive:true});writeFileSync(path.join(folder,'precision.pdf'),'workbook-only public source');
  }
  lesson07PreviewBoundary({courseId:'daejeon-2026',buildTarget:'course'}).hooks['astro:build:done']({dir:pathToFileURL(output+path.sep)});
  assert.equal(readFileSync(path.join(output,relative),'utf8'),'current workbook');
  for(const courseOnly of ['practice/DJ-L05','practice/DJ-L06'])assert(!existsSync(path.join(output,courseOnly)),'Workbook practice must be written by the isolated asset writer, not inherited public/: '+courseOnly);
  assert.throws(()=>preserveInheritedPublicSnapshot(root),/outside repository dist/);
  assert.throws(()=>preserveInheritedPublicSnapshot(output,{prefixes:['../src']}),/Invalid inherited public snapshot scope/);
 }finally{clean(output);}
});
