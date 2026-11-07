import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source='review/daejeon/DJ-L04-EXTERIOR-PLAN/';
const base=source+'implementation-13/';
const app=source+'application-05-techniques/';
const read=file=>fs.readFileSync(path.join(root,file));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

function members(bytes){
 let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(bytes.readUInt32LE(p)===0x06054b50){end=p;break;}
 assert(end>=0,'ZIP 끝 레코드가 없습니다.');
 const count=bytes.readUInt16LE(end+10),out=new Map();let p=bytes.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  assert.equal(bytes.readUInt32LE(p),0x02014b50);
  const method=bytes.readUInt16LE(p+10),size=bytes.readUInt32LE(p+20),length=bytes.readUInt16LE(p+28);
  const name=bytes.subarray(p+46,p+46+length).toString('utf8'),local=bytes.readUInt32LE(p+42);
  assert(!out.has(name),'중복 ZIP 경로: '+name);
  assert(!name.startsWith('/')&&!name.split('/').includes('..'),'잘못된 ZIP 경로: '+name);
  const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28);
  const raw=bytes.subarray(start,start+size);assert([0,8].includes(method));
  out.set(name,method===0?raw:inflateRawSync(raw));
  p+=46+length+bytes.readUInt16LE(p+30)+bytes.readUInt16LE(p+32);
 }
 return out;
}

const zip=members(read(app+'DJ-L04-exterior-applications.zip'));
function verify(name,prefix){
 const table=zip.get(name).toString('utf8');
 assert(table.startsWith('# 범위:'),'목록의 경로 기준을 명시해야 합니다.');
 assert(!/Argon\/|Astra\/|House_3F|house-design\.json/.test(table),'다른 차시 파일 목록이 섞였습니다.');
 const listed=new Set();
 for(const line of table.split('\n').filter(line=>line.trim()&&!line.startsWith('#'))){
  const match=line.match(/^([0-9a-f]{64})  (.+)$/);assert(match,'잘못된 SHA 목록 형식');
  const file=prefix+match[2];assert(!listed.has(file));listed.add(file);
  assert(zip.has(file),'목록의 파일이 ZIP에 없습니다: '+file);
  assert.notEqual(file,name,'자기 해시는 제외해야 합니다.');
  assert.equal(sha(zip.get(file)),match[1],file);
 }
 assert.deepEqual([...listed].sort(),[...zip.keys()].filter(file=>file.startsWith(prefix)&&file!==name).sort());
 return listed;
}

test('제4차시 루트·응용 SHA 목록은 실제 ZIP 범위를 빠짐없이 검증한다',()=>{
 assert.equal(zip.size,78);
 const lower=verify('DJ-L04/application/SHA256SUMS.txt','DJ-L04/application/');
 const upper=verify('DJ-L04/SHA256SUMS.txt','DJ-L04/');
 assert.equal(lower.size,44);assert.equal(upper.size,77);
 assert(upper.has('DJ-L04/application/SHA256SUMS.txt'));
 assert(!lower.has('DJ-L04/SHA256SUMS.txt'));
});

test('내부 manifest는 일반 자료만 해시하며 SHA 목록·ZIP과 순환하지 않는다',()=>{
 function inspect(value){
  if(Array.isArray(value))value.forEach(inspect);
  else if(value&&typeof value==='object'){
   if(value.file&&value.sha256){
    assert(!/(?:^|\/)(?:manifest\.json|SHA256SUMS\.txt)$|\.zip$/i.test(value.file),value.file);
   }
   Object.values(value).forEach(inspect);
  }
 }
 for(const file of ['DJ-L04/manifest.json','DJ-L04/application/manifest.json']){
  const manifest=JSON.parse(zip.get(file).toString('utf8'));inspect(manifest);
  assert.equal(manifest.checksumScope.selfHashExcluded,true);
  assert.equal(manifest.checksumScope.containerZipExcluded,true);
  assert.equal(manifest.checksumScope.manifestHashesOnlyPayload,true);
 }
});

test('제작 원본·manifest·이미지·Prompt는 ZIP 안의 같은 파일과 동일하다',()=>{
 for(const [directory,prefix] of [[base,'DJ-L04/'],[app,'DJ-L04/application/']]){
  for(const name of ['manifest.json','SHA256SUMS.txt'])assert(read(directory+name).equals(zip.get(prefix+name)),prefix+name);
  const manifest=JSON.parse(read(directory+'manifest.json').toString('utf8'));
  for(const item of manifest.files){
   assert.equal(sha(read(directory+item.file)),item.sha256,item.file);
   assert.equal(sha(zip.get(prefix+item.file)),item.sha256,prefix+item.file);
  }
 }
});
