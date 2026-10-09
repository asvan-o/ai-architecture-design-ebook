"""Deterministic educational geometry. SVG is the elevation master; metres, no site survey."""
from pathlib import Path
import json, math, html
R=Path(__file__).resolve().parent.parent
I=R/'instructor'; I.mkdir(exist_ok=True)
G={'project':'DJ-CF-02','status':'review-draft','fictional':True,'units':'m','axes':'x: frontage left to right; y: toward rear; z: up; facade y=0',
 'building':{'width':10,'depth':6,'height':7.2,'floorLine':3.6,'roofSlab':6.8,'parapetTop':7.2},
 'elements':[
 {'id':'D1','type':'entrance','x':7.6,'z':0,'w':1.4,'h':2.6},
 {'id':'W1','type':'window','x':.8,'z':.6,'w':2.6,'h':2.2},
 {'id':'W2','type':'window','x':4.2,'z':.6,'w':2.6,'h':2.2},
 {'id':'W3','type':'window','x':.8,'z':4.4,'w':2,'h':1.8},
 {'id':'W4','type':'window','x':4,'z':4.4,'w':2,'h':1.8},
 {'id':'W5','type':'window','x':7.2,'z':4.4,'w':2,'h':1.8},
 {'id':'SZ1','type':'blank-signage-zone','x':.8,'z':3,'w':8.4,'h':.5}],
 'site':{'sidewalkY':[-2,0],'roadY':[-9,-2],'neighborGap':.6,'neighborSetback':1.5,'rightSide':'blank wall; no side openings'},
 'cameras':{'01':{'position':[5,-18,1.6],'target':[5,0,3.4],'focalPixels':1450,'canvas':[1536,1024]},'02':{'position':[16,-17,1.6],'target':[5,1.5,3.4],'focalPixels':1450,'canvas':[1536,1024]}},
 'notes':['All dimensions are authored fictional teaching conditions, not legal or construction information.','No structural column grid is supplied. C1 is deliberately not assigned; structural details remain unverified.','D1 is the common entry for ground-floor commerce and upper-floor office/service use; internal circulation is outside scope.','Glass pane divisions do not count as additional wall openings.','Sidewalk and road relationship is illustrative and unchanged; planters belong inside the building frontage, not in the public walking route.']}
(R/'source/DJ-CF-02_building-camera.json').write_text(json.dumps(G,ensure_ascii=False,indent=2),encoding='utf-8')
def svg_start(w,h):return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="white"/><g font-family="Malgun Gothic, sans-serif" fill="#182b35">']
def text(s,x,y,v,size=20,anchor='start',fill='#182b35'):s.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}">{html.escape(str(v))}</text>')
def line(s,x1,y1,x2,y2,color='#283e49',sw=1,dash=''):s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}" stroke-dasharray="{dash}"/>')
def rect(s,x,y,w,h,fill,stroke='#283e49',sw=1,dash=''):s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-dasharray="{dash}"/>')
s=svg_start(1680,1188)
text(s,70,63,'AI LECTURE / DJ-CF-02',24);text(s,1610,63,'EXTERIOR / REVIEW',18,'end')
text(s,70,112,'교육용 기준 입면도 · 개정 01',34);text(s,70,151,'가상 건물 · 실측도면 / 구조도면 / 허가도면이 아님 · 단위 m',20)
x0,y0,k=260,880,86
X=lambda x:x0+x*k;Z=lambda z:y0-z*k
rect(s,X(0),Z(7.2),10*k,7.2*k,'#f2f1ed',sw=3)
for z,label in [(0,'GL ±0.00'),(3.6,'2F +3.60'),(6.8,'ROOF +6.80'),(7.2,'TOP +7.20')]:
 line(s,185,Z(z),1195,Z(z),'#74848a',1,'8 5');text(s,1200,Z(z)+6,label,19)
for e in G['elements']:
 rect(s,X(e['x']),Z(e['z']+e['h']),e['w']*k,e['h']*k,'#dbe7eb' if e['type']!='blank-signage-zone' else '#e6dfcb',sw=2)
 text(s,X(e['x']+e['w']/2),Z(e['z']+e['h']/2)+5,e['id'],22,'middle')
 if e['type']=='window':line(s,X(e['x']+e['w']/2),Z(e['z']),X(e['x']+e['w']/2),Z(e['z']+e['h']),'#809399',1)
def dim(xa,xb,y,label):
 line(s,xa,y,xb,y);line(s,xa,y-8,xa,y+8);line(s,xb,y-8,xb,y+8);text(s,(xa+xb)/2,y-10,label,20,'middle')
dim(X(0),X(10),220,'전면 폭 10.00')
for x in [0,10]:line(s,X(x),220,X(x),Z(7.2)-12,'#819098')
line(s,170,Z(0),170,Z(7.2));text(s,150,570,'7.20',20,'end')
for z in [0,7.2]:line(s,160,Z(z),195,Z(z))
text(s,260,927,'유지: 외곽 / 층수 / 지붕선 / D1 / W1~W5 / 층간 관계',20)
text(s,260,960,'변경: 외장 표현 / D1 주변 강조 / 소형 캐노피 / SZ1 표현 / 조명',20)
text(s,70,1018,'D1 1.40×2.60  |  W1·W2 2.60×2.20, 하단 +0.60  |  W3~W5 2.00×1.80, 하단 +4.40',20)
text(s,70,1050,'SZ1 8.40×0.50, 하단 +3.00 · 무문자 간판 영역 · 창호 사이 벽체도 유지 · 구조 그리드 미제공',20)
text(s,70,1082,'기준 좌표: 전면 좌하단 (0,0). 개구부 위치·크기 근거는 이 도면과 건물 조건 JSON. 이미지로 실측하지 않음.',19)
line(s,70,1120,1610,1120);text(s,70,1152,'외벽 밝은 면 = 마감 변경 가능 영역 / 개구부 선 = 고정 / 치수·법규·구조 적합성은 별도 검토',18)
s.append('</g></svg>');(R/'DJ-CF-02_existing-elevation.svg').write_text('\n'.join(s),encoding='utf-8')
# Simple site diagram documents camera relationship only, no interior design.
s=svg_start(1400,1000);text(s,60,65,'DJ-CF-02 · 전면 / 보도 / 카메라 관계도',30);text(s,60,108,'교육용 배치 도식 · 지적도 / 법적 대지 경계가 아님',20)
sx=lambda x:220+x*45;sy=lambda y:400-y*26
rect(s,sx(-3),sy(0),16*45,2*26,'#e3e3df');rect(s,sx(-3),sy(-2),16*45,7*26,'#bfc5c6')
rect(s,sx(0),sy(6),450,156,'#ece9e1',sw=3);text(s,sx(5),sy(3),'건물 10×6m / 내부 구성 생략',22,'middle')
for e in G['elements'][:3]:line(s,sx(e['x']),sy(0),sx(e['x']+e['w']),sy(0),'#146783',6);text(s,sx(e['x']+e['w']/2),sy(0)-12,e['id'],17,'middle')
text(s,980,430,'보도: 깊이 2m',20);text(s,980,550,'도로: 관계만 표현',20)
for n,c in G['cameras'].items():
 px,py,_=c['position'];tx,ty,_=c['target'];line(s,sx(px),sy(py),sx(tx),sy(ty),'#b55130',2,'7 5');rect(s,sx(px)-5,sy(py)-5,10,10,'#b55130');text(s,sx(px),sy(py)+29,'CAM '+n,21,'middle')
text(s,60,955,'CAM 01 정면 / CAM 02 우측 사선 · 두 시점 모두 아이레벨 z=1.60m 기준 · 이미지의 실제 렌즈값을 보증하지 않음',18)
s.append('</g></svg>');(R/'DJ-CF-02_site-diagram.svg').write_text('\n'.join(s),encoding='utf-8')
def sub(a,b):return [x-y for x,y in zip(a,b)]
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def norm(v):return [x/math.sqrt(dot(v,v)) for x in v]
for n,c in G['cameras'].items():
 f=norm(sub(c['target'],c['position']));right=norm(cross(f,[0,0,1]));up=cross(right,f)
 def proj(p):
  v=sub(p,c['position']);return [768+c['focalPixels']*dot(v,right)/dot(v,f),512-c['focalPixels']*dot(v,up)/dot(v,f)]
 s=svg_start(1536,1024);s.append('<rect width="1536" height="1024" fill="#e9ebed"/>')
 def poly(pts,fill,stroke='#59666d',sw=1):
  q=' '.join(f'{x:.2f},{y:.2f}' for x,y in map(proj,pts));s.append(f'<polygon points="{q}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
 s.append('<rect x="0" y="600" width="1536" height="424" fill="#b4b8ba"/>')
 poly([[-8,-2,0],[18,-2,0],[18,0,0],[-8,0,0]],'#d4d3ce')
 def box(x1,x2,y1,y2,h):
  poly([[x1,y1,0],[x2,y1,0],[x2,y1,h],[x1,y1,h]],'#c8c9c7')
  if c['position'][0]>x2:poly([[x2,y1,0],[x2,y2,0],[x2,y2,h],[x2,y1,h]],'#adb0b0')
  if c['position'][0]<x1:poly([[x1,y1,0],[x1,y2,0],[x1,y2,h],[x1,y1,h]],'#adb0b0')
 box(-3.6,-.6,1.5,7,6.2);box(10.6,13.6,1.5,7,6.2)
 poly([[10,0,0],[10,6,0],[10,6,7.2],[10,0,7.2]],'#bdbdb8')
 poly([[0,0,0],[10,0,0],[10,0,7.2],[0,0,7.2]],'#d4d0c7',sw=2)
 for z in [3.6,6.8]:poly([[0,-.002,z],[10,-.002,z],[10,-.002,z+.025],[0,-.002,z+.025]],'#a9a9a5')
 for e in G['elements']:
  x,z,w,h=e['x'],e['z'],e['w'],e['h'];poly([[x,-.01,z],[x+w,-.01,z],[x+w,-.01,z+h],[x,-.01,z+h]],'#647984' if e['type']!='blank-signage-zone' else '#aeaba3',sw=5)
  if e['type']=='window':poly([[x+w/2-.025,-.02,z],[x+w/2+.025,-.02,z],[x+w/2+.025,-.02,z+h],[x+w/2-.025,-.02,z+h]],'#55636a')
 s.append('</g></svg>');(I/f'DJ-CF-02_whitebox-{n}.svg').write_text('\n'.join(s),encoding='utf-8')
print('Geometry JSON, elevation, site diagram and two whitebox SVGs created')
