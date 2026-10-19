import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import path from 'node:path';
import {repositoryRoot} from './daejeon-review-assets.mjs';
const folder='review/daejeon/FILE_SORTER_STUDENT',manifestFile='DJ-L02_FILE_SORTER_MANIFEST.json';
const manifest=JSON.parse(readFileSync(path.join(repositoryRoot,folder,manifestFile),'utf8'));
assert.equal(manifest.contentStatus,'design-pending');assert.equal(manifest.nodeRuntimeIncluded,false);
const descriptions={
 'DJ-L02_FILE_SORTER_PROGRAM.zip':['program','자동 파일정리 프로그램 ZIP 다운로드','압축을 풀고 START.bat을 실행합니다. Node.js 실행환경이 필요합니다.'],
 'DJ-L02_SORT_TEST.zip':['test','SORT_TEST 실습파일 다운로드','실습파일 11개를 수집함에 넣습니다. .blend/.abc는 분류 시험용 stub입니다.'],
 'DJ-L02_FILE_SORTER_README.txt':['readme','사용방법 README 다운로드','실행·수동분류·종료·삭제와 주의사항을 순서대로 확인합니다.'],
};
/** @type {Array<{file:string,key:string,title:string,description:string,source:string,outputPath:string,sha256:string,bytes:number}>} */
export const lesson02ProgramFiles=manifest.files.map(file=>{
 const source=path.join(repositoryRoot,folder,file.file),bytes=readFileSync(source);
 assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
 const [key,title,description]=descriptions[file.file];assert(key);
 return {...file,key,title,description,source,outputPath:'practice/DJ-L02/file-sorter/'+file.file};
});
assert.equal(lesson02ProgramFiles.length,3);
const source=path.join(repositoryRoot,folder,manifestFile),bytes=readFileSync(source);
export const lesson02ProgramManifest={file:manifestFile,key:'manifest',title:'파일 목록·SHA-256 manifest',source,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),outputPath:'practice/DJ-L02/file-sorter/'+manifestFile};
export const lesson02ProgramAssets=[...lesson02ProgramFiles,lesson02ProgramManifest];
