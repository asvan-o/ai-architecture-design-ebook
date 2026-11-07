import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('CF02 teaching envelope, levels and portal agree with the approved new dimensions',()=>{
  const model=json('review/daejeon/DJ-CF-02/source/DJ-CF-02_building-camera.json');
  const b=model.building;
  assert.deepEqual([b.width,b.depth,b.height,b.floorLine,b.roofSlab,b.parapetTop],[13.6,8.2,9.6,4.5,8.6,9.6]);
  near(b.width*b.depth,111.52);
  assert.equal(Math.round(b.width*b.depth*10)/10,111.5);
  assert.equal(Math.round(b.width*b.depth*2*10)/10,223);
  near(b.parapetTop-b.roofSlab,1);
  const expected={D1:[10.3,0,1.8,3.7],W1:[1.1,.8,3.5,2.9],W2:[5.7,.8,3.5,2.9],W3:[1.1,5.8,2.7,2.4],W4:[5.45,5.8,2.7,2.4],W5:[9.8,5.8,2.7,2.4],SZ1:[1.1,4,11.4,.65]};
  for(const [id,dimensions] of Object.entries(expected)){
    const e=model.elements.find(e=>e.id===id);assert(e,id);
    [e.x,e.z,e.w,e.h].forEach((v,i)=>near(v,dimensions[i]));
    assert(e.x>=0&&e.x+e.w<=b.width,id+' inside facade');
    assert(e.z>=0&&e.z+e.h<=b.height,id+' inside facade height');
  }
  for(const id of ['D1','W1','W2']){const e=model.elements.find(e=>e.id===id);near(e.z+e.h,3.7);}
});

test('both RFP analysis requests have the same ten numbered domains',()=>{
  const domains=['실습 목표','주요 사용자와 이용 상황','필수 요구조건','유지 조건','변경 가능 범위','제외 범위','미확정 조건','추가 질문','전문가 확인 항목','디자인 대안 비교 기준'];
  for(const id of ['DJ-CF-01','DJ-CF-02']){
    const text=fs.readFileSync(`review/daejeon/${id}/${id}_rfp-analysis-prompt.txt`,'utf8');
    const rows=[...text.matchAll(/^\s*(\d+)\.\s+(.+)$/gm)];
    assert.deepEqual(rows.map(m=>+m[1]),Array.from({length:10},(_,i)=>i+1),id);
    assert.deepEqual(rows.map(m=>m[2].trim()),domains,id);
    assert(!/12개 관점|1~12번/.test(text));
    assert(text.includes('7개 영역')&&text.includes('3개 영역'),id+' source-to-analysis explanation');
  }
});

test('furniture is resized independently from fixed plan geometry and table depth stays constant',()=>{
  const g=json('review/daejeon/LESSON05_06_FINAL_8FIX/cad/geometry.json');
  assert.deepEqual([g.world.width,g.world.height],[14400,8400]);
  assert.equal(g.canvas.scalePxPerMm,.1);
  assert.deepEqual(g.wallThicknessMm,{exterior:200,lightweight:100});
  assert.deepEqual(g.columnsMm.size,[400,400]);
  const office=g.office.furnitureDimensionsMm,cafe=g.cafe.furnitureDimensionsMm;
  assert.deepEqual(office.workFacingModule,[1600,1400]);
  assert.deepEqual(office.workIndividual,[1600,700]);
  for(const f of [office,cafe]){
    assert.deepEqual(f.table4,[1800,1000]);
    assert.deepEqual(f.table6,[2700,1000]);
    assert.equal(f.table4[1],f.table6[1]);
  }
});

test('office geometry separates the axis envelope, polygon area and furniture dimensions',()=>{
  const g=json('public/downloads/daejeon/lesson-08/office-geometry.json');
  assert.deepEqual(g.axisEnvelopeMetres,[24,16]);
  assert.equal(g.centerlinePolygonAreaSquareMetres,348);
  assert.deepEqual(g.furniture.directorDesk.dimensionsMillimetres,[1800,800]);
  assert.deepEqual(g.furniture.conferenceTable.dimensionsMillimetres,[3200,1200]);
  assert.equal(g.furniture.conferenceTable.seatingCapacity,8);
});
