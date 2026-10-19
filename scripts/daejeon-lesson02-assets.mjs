import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';

export const lesson02ImageNames = [
  'DJ-L02_01_lighting-temperature-guide.png',
  'DJ-L02_02_auto-sort-flow.png',
  'DJ-L02_03_auto-sort-rules-guide.png',
];
/** @type {{localOnly:boolean,files:Array<{key:'lighting'|'flow'|'rules',file:string,sourcePath:string,title:string,purpose:string,width:number,height:number,sizeBytes:number,sha256:string,byteIdentical:boolean}>}} */
const manifest = JSON.parse(readFileSync(path.join(repositoryRoot,'review/daejeon/DJ-L02/DJ-L02_asset-manifest.json'),'utf8'));
assert.equal(manifest.localOnly,true);
assert.deepEqual(manifest.files.map((file)=>file.file),lesson02ImageNames);
assert.deepEqual(manifest.files.map((file)=>file.key),['lighting','flow','rules']);
const infographicImages = manifest.files.map((file)=>{
  const source = path.join(repositoryRoot,'review/daejeon/DJ-L02',file.file);
  const bytes = readFileSync(source);
  assert.equal(bytes.length,file.sizeBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,`Lesson02 source SHA: ${file.file}`);
  return {...file,source,outputPath:`practice/DJ-L02/${file.file}`};
});
const practiceManifest = JSON.parse(readFileSync(path.join(repositoryRoot,'review/daejeon/DJ-ML-01/DJ-ML-01_manifest.json'),'utf8'));
assert.equal(practiceManifest.status,'review/draft');
const practiceKeys = ['base','material','lighting-reference'];
const practiceNames = ['DJ-ML-01_BASE.png','DJ-ML-01_MATERIAL_REFERENCE.png','DJ-ML-01_LIGHTING_REFERENCE.png'];
assert.deepEqual(practiceManifest.files.map((file)=>file.file),practiceNames);
export const lesson02PracticeImages = practiceManifest.files.map((file,index)=>{
  const source = path.join(repositoryRoot,'review/daejeon/DJ-ML-01',file.file);
  const bytes = readFileSync(source);
  assert.equal(bytes.length,file.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,`DJ-ML-01 source SHA: ${file.file}`);
  return {...file,key:practiceKeys[index],title:file.file,purpose:file.role,source,outputPath:`practice/DJ-ML-01/${file.file}`};
});
import ts from 'typescript';
const readMaterials = async () => {
  const original = readFileSync(path.join(repositoryRoot,'src/lib/lesson04-final-content.ts'),'utf8');
  const code = ts.transpileModule(original,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).lesson04Materials;
};
/** @type {{status:string,files:Array<{id:string,title:string,file:string,role:string,width:number,height:number,bytes:number,sha256:string}>}} */
const beforeManifest = JSON.parse(readFileSync(path.join(repositoryRoot,'review/daejeon/DJ-ML-01/BEFORE-BASE/DJ-ML-01_BEFORE_BASE_manifest.json'),'utf8'));
assert.equal(beforeManifest.status,'review/draft');
assert.equal(beforeManifest.files.length,5);
export const lesson02BeforeImages = beforeManifest.files.map(file=>{
  const source=path.join(repositoryRoot,'review/daejeon/DJ-ML-01/BEFORE-BASE',file.file);
  const bytes=readFileSync(source);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  assert.equal(bytes.length,file.bytes);
  return {...file,key:`before-${file.id}`,source,outputPath:`practice/DJ-ML-01/BEFORE-BASE/${file.file}`};
});
/** @type {Array<import('../src/lib/lesson04-final-content').Lesson04Material>} */
const originalMaterials = await readMaterials();
assert.equal(originalMaterials.length,33);
export const lesson02MaterialImages = originalMaterials.map(material=>{
  const source=path.join(repositoryRoot,'src/assets/lessons/04/material-reference-review',material.fileName);
  const bytes=readFileSync(source);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  return {...material,key:`material-${material.id}`,file:material.fileName,source,sourcePath:`src/assets/lessons/04/material-reference-review/${material.fileName}`,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),sha256:createHash('sha256').update(bytes).digest('hex'),sizeBytes:bytes.length,outputPath:`practice/DJ-ML-01/materials/${material.fileName}`};
});
export const lesson02DefaultMaterialIds=['M-23','M-24','M-21','M-02','M-07','M-12','M-20','M-06'];
export const lesson02Images = [...infographicImages,...lesson02PracticeImages,...lesson02BeforeImages,...lesson02MaterialImages];
