import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const plan=JSON.parse(await readFile('data/deployment/release-assets.json','utf8'));
const headers={'User-Agent':'ai-architecture-design-ebook-deployment','Accept':'application/vnd.github+json'};
if(process.env.GH_TOKEN)headers.Authorization='Bearer '+process.env.GH_TOKEN;
const api=async route=>{const r=await fetch('https://api.github.com/repos/'+plan.repository+route,{headers});assert(r.ok,'GitHub API '+r.status);return r.json();};
const release=await api('/releases/tags/'+plan.tag);
assert(!release.draft,'Student Release must be public before Pages deployment');
const assets=[];
for(let page=1;;page++){const list=await api(`/releases/${release.id}/assets?per_page=100&page=${page}`);assets.push(...list);if(list.length<100)break;}
for(const file of plan.files){const a=assets.find(a=>a.name===file.assetName);assert(a,file.assetName);assert.equal(a.state,'uploaded');assert.equal(a.size,file.bytes);assert.equal(a.digest,'sha256:'+file.sha256);assert.equal(a.browser_download_url,file.url);}
console.log(JSON.stringify({passed:true,release:release.html_url,paths:plan.files.length,assets:assets.length}));
