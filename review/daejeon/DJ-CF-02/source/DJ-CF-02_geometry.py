"""Deterministic educational geometry. SVG is the elevation master; metres, no site survey."""
from pathlib import Path
import argparse, json, math, html
parser=argparse.ArgumentParser(description='Generate SVG/geometry intermediates, before raster.')
parser.add_argument('--output-root',type=Path)
args=parser.parse_args()
R=args.output_root.resolve() if args.output_root else Path(__file__).resolve().parent.parent
R.mkdir(parents=True,exist_ok=True)
(R/'source').mkdir(exist_ok=True)
I=R/'instructor'; I.mkdir(exist_ok=True)
G={'project': 'DJ-CF-02', 'status': 'review-draft', 'fictional': True, 'units': 'm', 'axes': 'x: frontage left to right; y: toward rear; z: up; facade y=0', 'building': {'width': 13.6, 'depth': 8.2, 'height': 9.6, 'floorLine': 4.5, 'roofSlab': 8.6, 'parapetTop': 9.6, 'nominalGroundAreaM2': 111.5, 'nominalTwoFloorAreaM2': 223.0, 'floorToFloorM': [4.5, 4.1], 'parapetHeightM': 1.0, 'areaNote': '13.6×8.2=111.52㎡; two floors=223.04㎡; displayed nominal 111.5/223.0㎡, not statutory areas'}, 'elements': [{'id': 'D1', 'type': 'entrance', 'x': 10.3, 'z': 0, 'w': 1.8, 'h': 3.7, 'leafClearWidthApprox': 1.1, 'measurement': 'outer portal-frame opening; door leaf clear width approximately 1.10m'}, {'id': 'W1', 'type': 'window', 'x': 1.1, 'z': 0.8, 'w': 3.5, 'h': 2.9}, {'id': 'W2', 'type': 'window', 'x': 5.7, 'z': 0.8, 'w': 3.5, 'h': 2.9}, {'id': 'W3', 'type': 'window', 'x': 1.1, 'z': 5.8, 'w': 2.7, 'h': 2.4}, {'id': 'W4', 'type': 'window', 'x': 5.45, 'z': 5.8, 'w': 2.7, 'h': 2.4}, {'id': 'W5', 'type': 'window', 'x': 9.8, 'z': 5.8, 'w': 2.7, 'h': 2.4}, {'id': 'SZ1', 'type': 'blank-signage-zone', 'x': 1.1, 'z': 4, 'w': 11.4, 'h': 0.65}], 'site': {'sidewalkY': [-2, 0], 'roadY': [-9, -2], 'neighborGap': 0.6, 'neighborSetback': 1.5, 'rightSide': 'blank wall; no side openings', 'siteDiagramScale': 'equal X/Y scale, 20px per metre'}, 'cameras': {'01': {'position': [6.8, -24.48, 1.6], 'target': [6.8, 0, 4.5333333333], 'focalPixels': 1450, 'canvas': [1536, 1024]}, '02': {'position': [21.76, -23.12, 1.6], 'target': [6.8, 2.05, 4.5333333333], 'focalPixels': 1450, 'canvas': [1536, 1024]}}, 'notes': ['Authored fictional teaching dimensions, not legal or construction information.', 'Preserved photographs and A/B images were generated under an earlier educational specification; they are visual references, not precise projections of the new reference elevation.', 'Camera X and viewing distance use frontage factor 1.36; target Y uses depth factor 8.2/6; target Z uses height factor 9.6/7.2; eye height remains 1.6m.', 'No structural column grid is supplied. D1 outer portal opening is not the door-leaf clear width.', 'Sidewalk/road relationship is illustrative; public walking space must remain free.']}
(R/'source/DJ-CF-02_building-camera.json').write_text(json.dumps(G,ensure_ascii=False,indent=2),encoding='utf-8')
def svg_start(w,h):return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{str(420)+chr(109)+chr(109) if w==1680 else w}" height="{str(297)+chr(109)+chr(109) if h==1188 else h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="white"/><g font-family="Malgun Gothic, sans-serif" fill="#182b35">']
def text(s,x,y,v,size=20,anchor='start',fill='#182b35'):s.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}">{html.escape(str(v))}</text>')
def line(s,x1,y1,x2,y2,color='#283e49',sw=1,dash=''):s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}" stroke-dasharray="{dash}"/>')
def rect(s,x,y,w,h,fill,stroke='#283e49',sw=1,dash=''):s.append(f'<rect x="{x}" y="{y}" width="{str(420)+chr(109)+chr(109) if w==1680 else w}" height="{str(297)+chr(109)+chr(109) if h==1188 else h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-dasharray="{dash}"/>')
s=svg_start(1680,1188)
text(s,70,63,'AI LECTURE / DJ-CF-02',24);text(s,1610,63,'EXTERIOR / EDUCATIONAL DRAWING',18,'end')
text(s,70,112,'교육용 기준 입면도',34);text(s,70,141,'가상 건물 · 실측 / 구조 / 허가도면이 아님 · 단위 m',20)
x0,y0,k=260,950,80
X=lambda x:x0+x*k;Z=lambda z:y0-z*k
rect(s,X(0),Z(9.6),13.6*k,9.6*k,'#f2f1ed',sw=3)
for z,label in [(0,'GL ±0.00'),(4.5,'2F +4.50'),(8.6,'ROOF +8.60'),(9.6,'TOP +9.60')]:
 line(s,185,Z(z),1368,Z(z),'#74848a',1,'8 5');text(s,1380,Z(z)+6,label,19)
for e in G['elements']:
 rect(s,X(e['x']),Z(e['z']+e['h']),e['w']*k,e['h']*k,'#dbe7eb' if e['type']!='blank-signage-zone' else '#e6dfcb',sw=2)
 text(s,X(e['x']+e['w']/2),Z(e['z']+e['h']/2)+5,e['id'],22,'middle')
 if e['type']=='window':line(s,X(e['x']+e['w']/2),Z(e['z']),X(e['x']+e['w']/2),Z(e['z']+e['h']),'#809399',1)
def dim(xa,xb,y,label):
 line(s,xa,y,xb,y);line(s,xa,y-8,xa,y+8);line(s,xb,y-8,xb,y+8);text(s,(xa+xb)/2,y-10,label,20,'middle')
dim(X(0),X(13.6),175,'전면 폭 13.60m')
for x in [0,13.6]:line(s,X(x),175,X(x),Z(9.6)-10,'#819098')
line(s,170,Z(0),170,Z(9.6));text(s,150,570,'9.60m',20,'end')
for z in [0,9.6]:line(s,160,Z(z),195,Z(z))
text(s,70,1000,'폭 13.60 × 깊이 8.20 × 높이 9.60m · 1층 명목 111.5㎡(약 34평) / 두 층 명목 223.0㎡(약 68평)',19)
text(s,70,1031,'D1 외곽 포털 포함 1.80×3.70m (문짝 유효폭 약 1.10m) · W1·W2 3.50×2.90m, 하단 +0.80m',19)
text(s,70,1062,'W3~W5 2.70×2.40m, 하단 +5.80m · SZ1 11.40×0.65m, 하단 +4.00m · D1/W1/W2 상단 +3.70m',19)
text(s,70,1093,'1층 층고 4.50m / 2층 4.10m / 파라펫 1.00m · 기존 생성 이미지는 시각 참고이며 새 치수의 투영 일치 보증 없음',18)
for i in range(5):
 rect(s,70+i*80,1135,80,10,'#283e49' if i%2==0 else 'white');text(s,70+i*80,1175,str(i),16,'middle')
text(s,470,1175,'5',16,'middle');text(s,486,1147,'m · 그래픽 스케일바',16)
line(s,70,1120,1610,1120);text(s,1610,1154,'교육용 가상 조건 · A3 100% 원본 1:50',17,'end')
s.append('</g></svg>');(R/'DJ-CF-02_existing-elevation.svg').write_text('\n'.join(s),encoding='utf-8')
# Equal X/Y scale: frontage 13.6m / depth 8.2m => 272px / 164px.
s=svg_start(1400,1000);text(s,60,65,'외관 실습 · 건물 / 보도 / 카메라 관계도',30);text(s,60,108,'교육용 배치 도식 · 지적도 / 법적 대지 경계가 아님 · X/Y 동일 축척',20)
sx=lambda x:300+x*20;sy=lambda y:380-y*20
rect(s,sx(-4),sy(0),21.6*20,2*20,'#e3e3df');rect(s,sx(-4),sy(-2),21.6*20,7*20,'#bfc5c6')
rect(s,sx(0),sy(8.2),13.6*20,8.2*20,'#ece9e1',sw=3);text(s,sx(6.8),sy(4.1),'13.60×8.20m',20,'middle')
for e in G['elements'][:3]:
 line(s,sx(e['x']),sy(0),sx(e['x']+e['w']),sy(0),'#146783',5);text(s,sx(e['x']+e['w']/2),sy(0)-12,e['id'],16,'middle')
text(s,840,290,'1층 명목 111.5㎡ / 두 층 223.0㎡',20);text(s,840,335,'보도 깊이 2m / 차도 깊이 7m',20)
text(s,840,380,'이웃 간격 0.60m / 후퇴 1.50m',20);text(s,840,425,'X/Y 동일 20px/m · 건물 종횡비 13.6:8.2',19)
for n,c in G['cameras'].items():
 px,py,_=c['position'];tx,ty,_=c['target'];line(s,sx(px),sy(py),sx(tx),sy(ty),'#b55130',2,'7 5');rect(s,sx(px)-5,sy(py)-5,10,10,'#b55130');text(s,sx(px),sy(py)+29,'CAM '+n,21,'middle')
text(s,60,940,'CAM 01 정면 / CAM 02 우측 사선 · 아이레벨 1.60m · 기존 생성 이미지의 실제 렌즈/정밀 투영 보증 없음',18)
text(s,60,973,'새 교육용 기준 규모에 맞춘 카메라 가이드이며 기존 현황 이미지와 A/B 원본은 변경하지 않았습니다.',18)
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
 box(-3.6,-.6,1.5,8.2,8);box(14.2,17.2,1.5,8.2,8)
 poly([[13.6,0,0],[13.6,8.2,0],[13.6,8.2,9.6],[13.6,0,9.6]],'#bdbdb8')
 poly([[0,0,0],[13.6,0,0],[13.6,0,9.6],[0,0,9.6]],'#d4d0c7',sw=2)
 for z in [4.5,8.6]:poly([[0,-.002,z],[13.6,-.002,z],[13.6,-.002,z+.025],[0,-.002,z+.025]],'#a9a9a5')
 for e in G['elements']:
  x,z,w,h=e['x'],e['z'],e['w'],e['h'];poly([[x,-.01,z],[x+w,-.01,z],[x+w,-.01,z+h],[x,-.01,z+h]],'#647984' if e['type']!='blank-signage-zone' else '#aeaba3',sw=5)
  if e['type']=='window':poly([[x+w/2-.025,-.02,z],[x+w/2+.025,-.02,z],[x+w/2+.025,-.02,z+h],[x+w/2-.025,-.02,z+h]],'#55636a')
 text(s,40,980,'새 교육용 치수의 카메라 가이드 · 기존 현황 이미지의 원본 또는 정밀 재현물이 아님',20)
 s.append('</g></svg>');(I/f'DJ-CF-02_whitebox-{n}.svg').write_text('\n'.join(s),encoding='utf-8')
print('Geometry JSON, elevation, site diagram and two whitebox SVGs created')
