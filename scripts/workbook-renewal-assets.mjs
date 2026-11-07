import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';
const folder=path.join(repositoryRoot,'review/daejeon/DJ-L01-RFP-BRIEF');
const manifestSource=path.join(folder,'manifest.json');
const manifest=JSON.parse(readFileSync(manifestSource,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const workbookRenewalAssets=manifest.files.map(file=>{
 const source=path.join(folder,file.file),bytes=readFileSync(source);
 assert.equal(bytes.length,file.bytes,file.file);assert.equal(sha(bytes),file.sha256,file.file);
 return {source,outputPath:'practice/DJ-L01/'+file.file,sha256:file.sha256};
});
workbookRenewalAssets.push({source:manifestSource,outputPath:'practice/DJ-L01/manifest.json',sha256:sha(readFileSync(manifestSource))});
