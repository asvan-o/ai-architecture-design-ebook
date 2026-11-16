import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const folder='public/downloads/daejeon/lesson-09/';
const design=JSON.parse(fs.readFileSync(folder+'house-design.json','utf8'));
const wall=id=>design.walls.find(w=>w.id===id);
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);

test('The landing recess retains both doors and distinguishes reference depth from clear depth',()=>{
  const south=wall('2F_BedroomCorner_South'), east=wall('2F_BedroomCorner_East');
  near(wall('2F_BedroomHall').b,south.c+south.thickness/2);
  near(south.b,east.c+east.thickness/2);
  near(wall('2F_BedroomNorth').a,east.c+east.thickness/2);
  near(5.65-south.c,1.21);
  near(5.65-(south.c+south.thickness/2),1.15);
  for(const id of ['2F_BedroomHall','2F_BedroomNorth']){
    const w=wall(id), door=w.openings[0];
    assert(door.center-door.width/2>w.a && door.center+door.width/2<w.b);
  }
});

test('Both north stair windows clear their landing slabs by 250mm',()=>{
  for(const [id,windowId,base,landingTop] of [['1F_North','W105',0,1.60],['2F_North','W204',3.2,4.70]]){
    const w=wall(id),opening=w.openings.find(o=>o.id===windowId);
    near(base+opening.sill-landingTop,.25);
    assert(opening.sill+opening.height<=w.height);
    near(opening.center,7.7);near(opening.width,1.7);
  }
});

test('Only the three authorized design corrections differ from the approved baseline',()=>{
  const restored=structuredClone(design);
  restored.walls=restored.walls.filter(w=>!['2F_BedroomCorner_South','2F_BedroomCorner_East'].includes(w.id));
  for(const w of restored.walls){
    if(w.id==='2F_BedroomHall')w.b=5.5;
    if(w.id==='2F_BedroomNorth')w.a=8.06;
    for(const o of w.openings){
      if(o.id==='W105'){o.sill=.8;o.height=1.9;}
      if(o.id==='W204'){o.sill=.8;o.height=1.7;}
    }
  }
  Object.assign(restored.furniture.find(f=>f.id==='Family_Bookshelf'),{x:5.8,y:5.5,angle:90});
  delete restored.revision;
  assert.equal(createHash('sha256').update(JSON.stringify(restored)).digest('hex'),'14172fdd47fb1b9306b981f09ecd74a8aa14e7d283e7baf98565c4496ce55f30');
});

test('The browser route is continuous at 60 seconds and retains only the terrace cut',()=>{
  const html=fs.readFileSync(folder+'House_B_Walkthrough.html','utf8');
  const key='window.__HOUSE_WALKTHROUGH_ASSETS=',start=html.indexOf(key)+key.length;
  const {route,modelBase64}=JSON.parse(html.slice(start,html.indexOf('</script>',start)).trim().replace(/;$/,''));
  assert.deepEqual(route.shots.filter(s=>s.transition==='cut').map(s=>s.start),[126]);
  const a=route.shots[2].samples.at(-1),b=route.shots[3].samples[0];
  near(a.time,60);near(b.time,60);
  for(const key of ['position','target'])a[key].forEach((v,i)=>near(v,b[key][i]));
  assert.equal(route.validation.status,'passed');
  assert.equal(route.validation.segmentIntersectionCount,0);
  assert.equal(route.validation.cameraClearanceViolationCount,0);
  assert(route.validation.minimumContinuousCameraEnvelopeMarginMeters>0);
  assert.equal(createHash('sha256').update(Buffer.from(modelBase64,'base64')).digest('hex'),createHash('sha256').update(fs.readFileSync(folder+'House_3F_Full_Complete_Astra.glb')).digest('hex'));
});
