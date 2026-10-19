import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const bandabiAllowed=new Set(JSON.parse(read('src/draft/content/lesson10-bandabi-materials.json')).items.map(i=>'downloads/daejeon/lesson-10/'+i.file));const source=JSON.parse(read('src/draft/content/lesson0910-source.json'));const assets=JSON.parse(read('src/draft/content/lesson0910-assets.json'));
test('House Lesson09 and legal Lesson10 retain complete 150-minute parts',()=>{
 for(const [id,times] of [['09',[30,50,30,40]],['10',[50,50,50]]]){const l=source.lessons[id];assert.equal(l.durationMinutes,150);assert.deepEqual(l.parts.map(p=>l.sections.slice(p.start,p.end).reduce((s,x)=>s+x.minutes,0)),times);assert.equal(new Set(l.sections.map(s=>s.id)).size,l.sections.length);}
 assert.match(source.lessons['09'].title,/3층 주택/);assert.match(source.lessons['10'].title,/건축법규 검토/);
});
test('All new house prompts have seven stages, a platform guide and matching downloadable text',()=>{
 const nine=JSON.stringify(source.lessons['09']);assert(!/33\.10|365코너|로컬마트|본금고|328\.9|Boolean|Follow Path|Track To|스팬드럴|필라스터|P\/D/.test(nine));
 for(const [id,p] of Object.entries(source.prompts)){
  assert.deepEqual(p.text.split('\n').filter(x=>['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'].includes(x)),['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준']);
  for(const k of ['platform','howToUse','purpose','derivation','variables','aiPromptTip'])assert(p.guide[k]);
  const lesson=id.startsWith('l09-')?'09':'10';assert.equal(read(`public/downloads/daejeon/lesson-${lesson}/${p.filename}`).replaceAll('\r\n','\n').trimEnd(),p.text.trimEnd());
  if(lesson==='09')assert(!/33\.10|365코너|ローカル|로컬마트|본금고|328\.9|Boolean|Follow Path|Track To|P\/D/.test(p.text),id);
 }
});
test('Local review inventories hash house drawings/models and exclude external source drawings',()=>{
 for(const id of ['09','10']){const m=JSON.parse(read(`public/downloads/daejeon/lesson-${id}/manifest.json`));assert(m.localOnly);assert(id==='10'?(m.originalDrawingsIncluded&&m.bandabiPublicSourceDocumentsIncluded&&m.hwangInsuOriginalDrawingsIncluded===false):m.originalDrawingsIncluded===false);for(const f of m.files){assert(!/\.\.|치수포함|매스_참고/.test(f.outputPath));assert(!/\.(pdf|docx|dwg|hwp|hwpx)$/.test(f.outputPath)||bandabiAllowed.has(f.outputPath));assert.equal(createHash('sha256').update(fs.readFileSync('public/'+f.outputPath)).digest('hex'),f.sha256,f.outputPath);}}
 assert.equal(assets.filter(a=>a.kind==='drawing').length,6);assert.equal(assets.filter(a=>/^house_astra_(1f_top|1f_iso|1f_eye|2f_top|2f_iso|3f_hero|3f_iso|3f_rooftop)$/.test(a.key)).length,8);
 assert.equal(assets.filter(a=>a.lesson==='09'&&a.kind==='video').length,9);
 const video=read('src/draft/components/Lesson0910Asset.astro');assert.match(video, /<video[^>]*controls playsinline preload="metadata"/);
 for(const a of assets.filter(a=>a.lesson==='09'&&a.kind==='video')){assert(a.outputPath.endsWith('.mp4'));assert(a.posterPath);assert(fs.existsSync('public/'+a.posterPath));}
 const b=source.lessons['09'].cameraWalkthroughClips;assert(b);

 const m=JSON.parse(read('public/downloads/daejeon/lesson-09/manifest.json'));assert(m.selfCreatedHouseDrawingsIncluded);for(const ext of ['fbx','glb'])assert(m.files.some(x=>x.outputPath.endsWith('.'+ext)));
});
test('House exports reimport with all meshes, image materials and floor groups; frames are not reused bank movies',()=>{
 const v=JSON.parse(read('public/downloads/daejeon/lesson-09/house-export-validation.json'));assert.equal(v.status,'PASS');assert(v.checks.every(c=>c.pass));assert.equal(v.exports.length,2);for(const x of v.exports){assert(x.meshCount>1000);assert(x.materials>=17);assert(x.images>=7);}
 for(const id of ['fbx_embeds_all_seven_png_images','glb_embedded_images_no_external_uris','blend_packed_texture_images'])assert(v.checks.find(c=>c.id===id)?.pass);
 const body=read('src/draft/components/DaejeonModelingLesson.astro');assert(body.indexOf('data-result-first')<body.indexOf('<TopicProgress'));assert(body.includes('data-commercial-reference'));assert(!body.includes('<video'));
});
test('Lesson08 has the exact easy uvx path instruction and real wall-opening explanation',()=>{
 const body=read('src/draft/components/Lesson08McpPart.astro'),data=read('src/draft/content/lesson08-mcp.ts');
 assert(body.includes('윈도우 아이디'));assert(body.includes("command = '...'"));assert(body.includes('홍길동'));assert(!/Boolean|커터|Nonica|Color ID/.test(body));assert(!/Boolean|차집합|커터/.test(data));
 assert.deepEqual([...data.matchAll(/\{id:'(l08-mcp-[^']+)'/g)].map(x=>x[1]),['l08-mcp-uv-install','l08-mcp-codex-config','l08-mcp-room']);
});
