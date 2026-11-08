import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApprovedPdfDownloader} from '../approved-pdfs.mjs';

const repository='asvan-o/ai-architecture-design-ebook',tag='approved-test';
const api=`https://api.github.com/repos/${repository}/releases`;
const tagUrl=api+'/tags/'+tag,assetsUrl=api+'/91/assets';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

function setup(options={}){
 const bytes=[Buffer.from('%PDF-1.7\napproved-one\n'),Buffer.from('%PDF-1.7\napproved-two\n')];
 const files=bytes.map((data,i)=>({fileName:`approved-${i+1}.pdf`,sha256:sha(data),sizeBytes:data.length}));
 const entries=files.map((file,i)=>({path:'gwangju/downloads/'+file.fileName,assetName:file.fileName,sha256:file.sha256,bytes:file.sizeBytes,url:`https://github.com/${repository}/releases/download/${tag}/${file.fileName}`}));
 const assets=files.map((file,i)=>({id:101+i,name:entries[i].assetName,state:'uploaded',url:api+'/assets/'+(101+i),browser_download_url:entries[i].url,size:file.sizeBytes,digest:'sha256:'+file.sha256}));
 const plan={repository,tag,files:entries},calls=[];
 const fetchImpl=async(url,request)=>{
  calls.push({url,request});
  const i=entries.findIndex(entry=>entry.url===url);
  if(i>=0){
   if(options.cdnError)throw options.cdnError;
   if(options.cdnStatus)return new Response('upstream unavailable',{status:options.cdnStatus});
   return new Response(options.cdnBytes||bytes[i]);
  }
  if(url===tagUrl)return Response.json(options.release||{id:91,tag_name:tag,draft:false,assets_url:assetsUrl},{status:options.releaseStatus||200});
  if(url.startsWith(assetsUrl+'?')){
   const page=Number(new URL(url).searchParams.get('page'));
   return Response.json(options.pages?.[page-1]||options.assets||assets,{status:options.listStatus||200});
  }
  const j=assets.findIndex(asset=>asset.url===url);
  if(j>=0)return new Response(options.apiBytes||bytes[j],{status:options.assetStatus||200});
  throw new Error('예상하지 않은 검증 요청: '+url);
 };
 const create=(extra={})=>createApprovedPdfDownloader(plan,{fetchImpl,token:'',...extra});
 return{files,entries,assets,bytes,plan,calls,create};
}

test('승인 PDF 기본 다운로드가 성공하면 API와 인증 헤더를 사용하지 않는다',async()=>{
 const f=setup();assert.deepEqual(await f.create()(f.files[0]),f.bytes[0]);
 assert.deepEqual(f.calls.map(call=>call.url),[f.entries[0].url]);
 assert.equal(f.calls[0].request.headers,undefined);
 assert.equal(f.calls[0].request.redirect,'follow');assert(f.calls[0].request.signal instanceof AbortSignal);
});

test('CDN 504 후에는 공식 API를 쓰고 같은 빌드의 나머지 PDF는 목록 캐시를 공유한다',async()=>{
 const f=setup({cdnStatus:504}),download=f.create({token:'mock-token-only'});
 assert.deepEqual(await download(f.files[0]),f.bytes[0]);assert.deepEqual(await download(f.files[1]),f.bytes[1]);
 assert.deepEqual(f.calls.map(call=>call.url),[f.entries[0].url,tagUrl,assetsUrl+'?per_page=100&page=1',f.assets[0].url,f.assets[1].url]);
 assert.equal(f.calls[0].request.headers,undefined);
 for(const call of f.calls.slice(1))assert.equal(call.request.headers.Authorization,'Bearer mock-token-only');
 assert.equal(f.calls.at(-1).request.headers.Accept,'application/octet-stream');
 assert.equal(f.calls[1].request.headers.Accept,'application/vnd.github+json');
 assert.equal(f.calls[1].request.headers['X-GitHub-Api-Version'],'2022-11-28');
});

test('100개를 넘는 Release 파일도 페이지를 모두 읽고 공개 API는 토큰 없이 사용할 수 있다',async()=>{
 const decoys=Array.from({length:100},(_,i)=>({id:1000+i,name:'unrelated-'+i+'.zip'}));
 const f=setup({cdnStatus:503});
 // 목록의 첫 페이지 뒤에 승인 PDF가 놓이는 실제 대용량 Release 구성을 모사합니다.
 const fetchImpl=async(url,request)=>{
  f.calls.push({url,request});
  if(url===f.entries[0].url)return new Response('unavailable',{status:503});
  if(url===tagUrl)return Response.json({id:91,tag_name:tag,draft:false,assets_url:assetsUrl});
  if(url===assetsUrl+'?per_page=100&page=1')return Response.json(decoys);
  if(url===assetsUrl+'?per_page=100&page=2')return Response.json(f.assets);
  if(url===f.assets[0].url)return new Response(f.bytes[0]);
  throw new Error('예상하지 않은 페이지');
 };
 const download=createApprovedPdfDownloader(f.plan,{fetchImpl,token:''});
 assert.deepEqual(await download(f.files[0]),f.bytes[0]);
 assert.equal(f.calls.filter(call=>call.url.startsWith(assetsUrl+'?')).length,2);
 for(const call of f.calls.slice(1))assert.equal(call.request.headers.Authorization,undefined);
});

test('API의 파일명·URL·크기·digest·자산 URL이 승인 정보와 다르면 바이너리를 받지 않는다',async()=>{
 const cases=[
  [{name:'different.pdf'},/exact Release asset/],
  [{browser_download_url:'https://github.com/other/repository/releases/download/tag/approved.pdf'},/browser URL changed/],
  [{size:1},/asset size changed/],
  [{digest:'sha256:'+'0'.repeat(64)},/asset digest changed/],
  [{digest:null},/asset digest changed/],
  [{state:'starter'},/not uploaded/],
  [{url:'https://unapproved.example/asset'},/asset API URL/],
 ];
 for(const [change,reason] of cases){
  const f=setup({cdnStatus:502});Object.assign(f.assets[0],change);
  await assert.rejects(f.create()(f.files[0]),reason);
  assert.equal(f.calls.some(call=>call.request.headers?.Accept==='application/octet-stream'),false);
 }
 const duplicate=setup({cdnStatus:502});duplicate.assets.push({...duplicate.assets[0]});
 await assert.rejects(duplicate.create()(duplicate.files[0]),/missing or duplicated/);
});

test('API가 받은 최종 PDF의 SHA와 크기도 원래 승인값으로 다시 검사한다',async()=>{
 const wrong=setup({cdnStatus:504,apiBytes:Buffer.from('%PDF-wrong-content')});
 await assert.rejects(wrong.create()(wrong.files[0]),/Published PDF hash changed/);
 const size=setup({cdnStatus:504});size.files[0].sizeBytes++;size.entries[0].bytes++;size.assets[0].size++;
 await assert.rejects(size.create()(size.files[0]),/Published PDF size changed/);
});

test('네트워크 실패와 timeout만 API로 재시도하며 일반 오류는 숨기지 않는다',async()=>{
 for(const error of [new TypeError('fetch failed'),Object.assign(new Error('연결 시간 초과'),{name:'TimeoutError'}),Object.assign(new Error('연결 종료'),{cause:{code:'ECONNRESET'}})]){
  const f=setup({cdnError:error});assert.deepEqual(await f.create()(f.files[0]),f.bytes[0]);
  assert(f.calls.some(call=>call.url===tagUrl));
 }
 const programming=setup({cdnError:new Error('programming issue')});
 await assert.rejects(programming.create()(programming.files[0]),/programming issue/);assert.equal(programming.calls.length,1);
});

test('404나 기본 응답의 해시 오류는 API 우회로 정상 처리하지 않는다',async()=>{
 const missing=setup({cdnStatus:404});await assert.rejects(missing.create()(missing.files[0]),/HTTP 404/);assert.equal(missing.calls.length,1);
 const wrong=setup({cdnBytes:Buffer.from('not the approved PDF')});await assert.rejects(wrong.create()(wrong.files[0]),/Published PDF hash changed/);assert.equal(wrong.calls.length,1);
 const unlisted=setup();unlisted.plan.files=[];
 await assert.rejects(createApprovedPdfDownloader(unlisted.plan,{token:'',fetchImpl:async url=>{
  unlisted.calls.push({url});return new Response('unavailable',{status:504});
 }})(unlisted.files[0]),/HTTP 504/);assert.equal(unlisted.calls.length,1);
});

test('Release tag·목록·바이너리의 API 오류는 그대로 실패한다',async()=>{
 for(const [change,reason] of [[{releaseStatus:503},/metadata unavailable/],[{listStatus:502},/asset metadata unavailable/],[{assetStatus:504},/API download unavailable/],[{release:{id:91,tag_name:'other-tag',draft:false,assets_url:assetsUrl}},/tag changed/],[{release:{id:91,tag_name:tag,draft:true,assets_url:assetsUrl}},/must be published/],[{release:{id:91,tag_name:tag,draft:false,assets_url:'https://unapproved.example/assets'}},/asset-list URL/]]){
  const f=setup({cdnStatus:504,...change});await assert.rejects(f.create()(f.files[0]),reason);
 }
});

test('기존 승인 해시·크기 및 repository/tag 경계는 API fallback에서도 바뀌지 않는다',async()=>{
 for(const change of [{sha256:'0'.repeat(64)},{bytes:1}]){
  const f=setup({cdnStatus:504});Object.assign(f.entries[0],change);
  await assert.rejects(f.create()(f.files[0]),/approval hash|approval size/);assert.equal(f.calls.length,0);
 }
 const other=setup({cdnStatus:504});other.plan.repository='other/repository';
 await assert.rejects(other.create()(other.files[0]),/repository, tag and asset name/);assert.equal(other.calls.length,1);
});
