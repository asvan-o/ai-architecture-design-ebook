import {readFileSync} from 'node:fs';
import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';

// Read the unchanged Gwangju sources already present in this worktree.
// Assets are copied byte-for-byte only to the isolated local review build.
const lessonPath='src/content/lessons/02.mdx';
const lesson=readFileSync(path.join(repositoryRoot,lessonPath),'utf8');
const manifest=readFileSync(path.join(repositoryRoot,'data/asset-manifest.yaml'),'utf8');
const flowerRoot='src/assets/lessons/02/flower-cafe-sample/';
const literal=(key)=>{
  const found=lesson.match(new RegExp(`${key}: '([^']+)'`));
  if(!found)throw new Error(`Missing Gwangju Lesson 02 field: ${key}`);
  return found[1];
};
const text=(file)=>readFileSync(path.join(repositoryRoot,flowerRoot,file),'utf8').trim();
export const flowerCafe={
  source:lessonPath,
  originalPrompt:text('01-original-prompt.txt'),revisionPrompt:text('03-revision-prompt.txt'),
  original:{file:'02-original-result.jpeg',source:flowerRoot+'02-original-result.jpeg',alt:literal('originalAlt'),caption:literal('originalCaption')},
  revised:{file:'04-revised-result.jpeg',source:flowerRoot+'04-revised-result.jpeg',alt:literal('revisedAlt'),caption:literal('revisedCaption')},
  comparison:literal('comparison'),learningPoint:literal('learningPoint'),caution:literal('caution'),
};
export const emptyBases=['01','02','03','04','05'].map((number)=>{
  const id=`l02-empty-base-${number}`;
  const mdx=lesson.match(new RegExp(`src: emptyBase${number}, alt: '([^']+)', caption: '([^']+)'`));
  const entry=manifest.split(`  - id: "${id}"`)[1]?.split('\n  - id:')[0];
  if(!mdx||!entry)throw new Error(`Missing Gwangju BASE ${number}`);
  const field=(key)=>entry.match(new RegExp(`    ${key}: "([^"]+)"`))?.[1];
  return {id,number,file:`base-${number}.jpeg`,source:field('file_path'),alt:mdx[1],caption:mdx[2],sourceNote:field('source_note'),rightsStatus:field('rights_status'),provenanceNote:field('provenance_note'),generationModel:field('generation_model'),generationDate:field('generation_date'),rightsReviewNote:field('rights_review_note')};
});
export const reusedLesson02Files=[flowerCafe.original,flowerCafe.revised,...emptyBases,
  ...['01-original-prompt.txt','03-revision-prompt.txt'].map((file)=>({file,source:flowerRoot+file}))];
