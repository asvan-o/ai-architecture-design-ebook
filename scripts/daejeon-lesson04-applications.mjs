import fs from'node:fs';import path from'node:path';import{createHash}from'node:crypto';import assert from'node:assert/strict';import{repositoryRoot}from'./course-registry.mjs';
import {ebookText} from './daejeon-ebook-language.mjs';
/** @typedef {{key:string,file:string,title:string,description:string,source:string,outputPath:string,sha256:string,width:number,height:number,text:string,attachments?:{file:string,role:string,outputPath:string}[]}} ApplicationAsset */
const root=path.join(repositoryRoot,'review/daejeon/DJ-L04-EXTERIOR-PLAN/application-05-techniques');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const read=item=>{const source=path.join(root,item.file),b=fs.readFileSync(source),sha256=createHash('sha256').update(b).digest('hex');if(item.sha256)assert.equal(sha256,item.sha256,item.file);return{...item,title:ebookText(item.title||''),description:ebookText(item.description||''),source,outputPath:'practice/DJ-L04/application/'+item.file,sha256,...(item.file.endsWith('.png')?{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}:/\.(txt|md|json)$/.test(item.file)?{text:b.toString('utf8').trim()}:{} )};};
/** @type {ApplicationAsset[]} */
export const lesson04ApplicationImages=manifest.images.map(read);
export const lesson04ApplicationImage=Object.fromEntries(lesson04ApplicationImages.map(a=>[a.key,a]));
/** @type {ApplicationAsset[]} */
export const lesson04ApplicationPrompts=manifest.prompts.map(read);
export const lesson04ApplicationPrompt=Object.fromEntries(lesson04ApplicationPrompts.map(a=>[a.key,a]));
/** @type {ApplicationAsset[]} */
export const lesson04ApplicationOther=manifest.other.map(read);
export const lesson04ApplicationZip=read({key:'application-zip',file:'DJ-L04-exterior-applications.zip',title:'외관·조경·다각도 통합 실습자료'});
export const lesson04ApplicationAssets=[...lesson04ApplicationImages,...lesson04ApplicationPrompts,...lesson04ApplicationOther,read({file:'manifest.json',key:'manifest'}),read({file:'SHA256SUMS.txt',key:'sha256'}),lesson04ApplicationZip];
assert.equal(lesson04ApplicationImages.length,13);assert.equal(lesson04ApplicationPrompts.length,26);assert.equal(manifest.comparisonCount,14);
