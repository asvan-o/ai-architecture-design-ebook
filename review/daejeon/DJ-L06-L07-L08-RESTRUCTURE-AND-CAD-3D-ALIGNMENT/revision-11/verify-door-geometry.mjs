import fs from 'node:fs';
import assert from 'node:assert/strict';
const audit='review/daejeon/DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11';
const geometry=JSON.parse(fs.readFileSync(audit+'/source/office-geometry.json','utf8'));
const stairs=geometry.stairs;
assert(stairs.northLandingBounds[1]===0&&stairs.northLandingBounds[3]>=1.2,'North landing must remain clear');
const up=stairs.flights.find(f=>f.id==='UP'),dn=stairs.flights.find(f=>f.id==='DN');
assert(up.arrowEnd[1]<up.arrowStart[1]&&dn.arrowEnd[1]>dn.arrowStart[1],'UP and DN must have opposite travel directions');
assert(up.endLevelMetres>up.startLevelMetres&&dn.endLevelMetres<dn.startLevelMetres,'UP ascent / DN descent level sequence');
assert(stairs.entryFloorLabelRemoved,'Landing elevation must not label the entrance floor');
assert.equal(geometry.swingDoors.length,10);
assert.equal(geometry.directDoors.length,8);
for(const id of ['D1','D3','D4'])assert.equal(geometry.swingDoors.find(door=>door.id===id).flip,-1,id+' must open inside director / outside onto decks');
const elevator=geometry.elevatorDoor;
assert.equal(elevator.type,'center-opening-double-sliding');assert.equal(elevator.wall,10);assert.equal(elevator.start,1.2);assert.equal(elevator.width,1.2);assert.equal(elevator.panels,2);assert.equal(elevator.swingArc,false);
assert(!geometry.swingDoors.some(door=>door.axis==='V'&&door.wall===10),'Elevator must not have a swing leaf');
// Independently sample the entire swept sector against existing furniture footprints.
// This catches collisions at intermediate angles as well as the displayed 90-degree leaf.
const furniture=[{name:'director desk',bounds:[1.2,1.3,2.8,1.2]},{name:'director chair',bounds:[2.1,2.6,.75,.65]},{name:'director bench',bounds:geometry.directorBenchBounds},{name:'meeting table',bounds:[13.5,8.5,5.6,2.1]},{name:'model worktable',bounds:[21.65,7.8,1.6,2.8]}];
for(const x of [1.2,4.8,8.4])for(const y of [7,11.3]){
 furniture.push({name:'office desk',bounds:[x,y,2.3,1.4]});
 for(const yy of[y-.65,y+1.5])for(const xx of[x+.15,x+1.3])furniture.push({name:'office chair',bounds:[xx,yy,.75,.55]});
}
for(const x of[13.8,15.1,16.4,17.7])for(const y of[7.8,10.8])furniture.push({name:'meeting chair',bounds:[x,y,.85,.55]});
const distance=([x,y],[rx,ry,w,h])=>Math.hypot(Math.max(rx-x,0,x-rx-w),Math.max(ry-y,0,y-ry-h));
const results=[];
for(const door of geometry.swingDoors){
 const [hx,hy]=door.hinge;
 assert.deepEqual(door.hinge,door.axis==='H'?[door.start,door.wall]:[door.wall,door.start]);
 assert(Math.abs(Math.hypot(door.leafTip[0]-hx,door.leafTip[1]-hy)-door.width)<1e-9);
 let min=Infinity,nearest='';
 for(let angle=0;angle<=90;angle++)for(let r=0;r<=door.width+.001;r+=.02){
  const t=angle*Math.PI/180;
  const point=door.axis==='H'?[hx+r*Math.cos(t),hy+door.flip*r*Math.sin(t)]:[hx+door.flip*r*Math.sin(t),hy+r*Math.cos(t)];
  for(const item of furniture){const gap=distance(point,item.bounds)-.02;if(gap<min){min=gap;nearest=item.name;}}
 }
 assert(min>.02,door.id+' swing intersects furniture: '+nearest+' gap '+min);
 results.push({id:door.id,rooms:[door.a,door.b],hinge:door.hinge,leafTip:door.leafTip,flip:door.flip,minimumFurnitureClearanceMetres:Number(min.toFixed(3)),nearestFurniture:nearest});
}
const svgDir=fs.existsSync(audit+'/source/office-original.svg')?audit+'/source':'review/daejeon/DJ-L06-L07-ORIGINAL-HOUSE-PLAN-AND-DOOR-STAIR-PRECISION-FIX/revision-10/source';
if(fs.existsSync(svgDir+'/office-original.svg')){
 const native=fs.readFileSync(svgDir+'/office-original.svg','utf8'),guide=fs.readFileSync(svgDir+'/office-3d-door-guide.svg','utf8');
 assert.equal([...native.matchAll(/class="swing-guide"/g)].length,10);assert.equal([...guide.matchAll(/class="swing-guide"/g)].length,0);
 assert(native.includes('stroke="#999999" stroke-width=".08" stroke-dasharray=".65,.45"'));
 assert(native.includes('모형실')&&native.includes('소장실')&&native.includes('13인승'));
}
const report={passed:true,geometricNotRegulatoryCheck:true,swingDoorCount:10,elevatorDoor:elevator,doorChecks:results,originalRoomAndOuterBoundsUnchanged:true,guideHasSwingArcs:false,scope:'Drawing geometry and furniture interference only; no code, egress, structural or elevator-performance certification.'};
fs.writeFileSync(audit+'/door-geometry-validation.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(audit+'/stair-geometry-validation.json',JSON.stringify({passed:true,...stairs,scope:'Educational movement/elevation depiction; not a verified inter-storey stair, egress or construction design.'},null,2)+'\n');
console.log(JSON.stringify({passed:true,swingDoors:10,elevatorSlidingPanels:2,minFurnitureClearanceMetres:Math.min(...results.map(row=>row.minimumFurnitureClearanceMetres)),guideArcs:0}));
