import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const digest=file=>createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const p05='review/daejeon/DJ-L05-FLOORPLAN-INPAINTING/revision-review8-20261016';
const p06='review/daejeon/DJ-L06-3D-ZONING/revision-review8-20261016';
const qa=readJson('review/daejeon/DJ-L05-L06-DIMENSION-CORRECTION/FURNITURE-PIXEL-QA.json');

test('L05/L06 geometry preserves the envelope and uses explicit furniture dimensions',()=>{
 const geometry=readJson(p05+'/precision/PLAN-GEOMETRY.json');
 assert.equal(geometry.world.width,14400);assert.equal(geometry.world.height,8400);
 assert.equal(geometry.canvas.scalePxPerMm,.1);
 assert.deepEqual(geometry.canvas.buildingBoxPx,[480,380,1920,1220]);
 assert.equal(geometry.office.partitionCenterX,7800);assert.equal(geometry.office.rightPartitionCenterY,5400);
 assert.equal(geometry.cafe.partitionCenterX,4800);
 assert.deepEqual(geometry.wallThicknessMm,{exterior:200,lightweight:100});
 assert.deepEqual(geometry.columnsMm.size,[400,400]);
 assert.deepEqual(geometry.office.furnitureDimensionsMm.workFacingModule,[1600,1400]);
 assert.deepEqual(geometry.office.furnitureDimensionsMm.workIndividual,[1600,700]);
 for(const kind of ['office','cafe']){
  assert.deepEqual(geometry[kind].furnitureDimensionsMm.table4,[1800,1000]);
  assert.deepEqual(geometry[kind].furnitureDimensionsMm.table6,[2700,1000]);
 }
 assert.deepEqual(geometry.office.pantryCounterMm,[10300,7350,2800,650]);
 assert.deepEqual(geometry.cafe.frontBarWorldRect,[600,3500,3600,700]);
 assert.deepEqual(geometry.precisionPrint.buildingPrintedMm,[144,84]);
 assert.equal(geometry.precisionPrint.scaleBar2mPrintedMm,20);
});

test('L05 furniture correction has recorded pixel isolation and preserves original 3D/legacy/AI records',()=>{
 assert.equal(qa.images.length,11);
 for(const image of qa.images){
  assert.equal(image.outsideRoiChangedPixels,0,image.file);
  assert(image.insideRoiChangedPixels>0,image.file);
  assert.equal(digest(p05+'/'+image.file),image.afterSha256,image.file);
 }
 assert.equal(qa.actualRasterFurnitureMeasurements.length,6);
 assert.deepEqual(qa.actualRasterFurnitureMeasurements.map(row=>row.darkInkBoundsPx),
  [[180,100],[270,100],[270,100],[180,100],[270,100],[160,140]]);
 assert(qa.protectedAssets.length>=23);
 for(const asset of qa.protectedAssets)assert.equal(digest(asset.file),asset.sha256,asset.file);
});

test('L05/L06 manifests, corrected input copies, PDFs and student public files agree',()=>{
 for(const prefix of [p05,p06]){
  const manifest=readJson(prefix+'/manifest.json');
  const publicPrefix='public/practice/'+(prefix===p05?'DJ-L05':'DJ-L06');
  for(const file of manifest.files){
   assert.equal(digest(prefix+'/'+file.file),file.sha256,file.file);
   assert.equal(fs.statSync(path.join(root,prefix,file.file)).size,file.bytes,file.file);
   assert.equal(digest(publicPrefix+'/'+file.file),file.sha256,'public '+file.file);
  }
 }
 for(const file of ['PLAN-BASE-01-door-result.png','PLAN-BASE-02-result.png']){
  assert.equal(digest(p05+'/results/'+file),digest(p06+'/inputs/'+file),file);
 }
 const manifest=readJson(p05+'/manifest.json');
 assert.equal(manifest.precision.length,5);
 for(const pdf of manifest.precision){
  assert.equal(fs.readFileSync(path.join(root,p05,pdf.file)).subarray(0,5).toString(),'%PDF-');
 }
 const prompt=fs.readFileSync(path.join(root,p05,'prompts/plan01-edit.txt'),'utf8');
 assert(prompt.includes('1,800×1,000mm'));assert(prompt.includes('2,700mm'));assert(prompt.includes('깊이 1,000mm'));
});
