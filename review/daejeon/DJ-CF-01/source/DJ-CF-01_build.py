"""Build isolated educational draft assets. No production files are written.
Usage: bundled-python DJ-CF-01_build.py baseline|plan|geometry|verify [--output-root DIR]
Raster white-box images are deterministic geometric references, not AI edits.
"""
from pathlib import Path
import argparse, json, math, hashlib, subprocess, sys, html
import numpy as np
from PIL import Image

def find_repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if ((candidate / 'package.json').is_file()
                and (candidate / 'src/lib/lesson02-ebook.ts').is_file()
                and (candidate / 'data/courses').is_dir()):
            return candidate
    raise FileNotFoundError(
        f'Repository root not found above {start}: expected package.json, '
        'src/lib/lesson02-ebook.ts and data/courses')

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
REPO = find_repo_root(Path(__file__).resolve())
parser = argparse.ArgumentParser(description='CF-01 geometry/protection stages; no PDF authoring.')
parser.add_argument('stage',choices=['baseline','plan','geometry','verify'])
parser.add_argument('--output-root',type=Path)
args = parser.parse_args()
ROOT = args.output_root.resolve() if args.output_root else PACKAGE_ROOT
ROOT.mkdir(parents=True,exist_ok=True)
TMP = ROOT/'_validation' if args.output_root else REPO/'tmp'/'DJ-CF-01'
DATA = json.loads((PACKAGE_ROOT/'source/DJ-CF-01_space.json').read_text(encoding='utf-8'))
TMP.mkdir(parents=True, exist_ok=True)

def sha(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()

def capture():
    result={}
    # Only the current checkout is inspected; Gwangju is checked by Git blob validation.
    for name, repo in [('daejeon',REPO)]:
        paths=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=repo).decode('utf-8').split('\0')
        result[name]={p:sha(repo/p) for p in paths if p and (repo/p).is_file() and (args.output_root or not p.startswith('review/daejeon/DJ-CF-01/'))}
        result[name+'_status']=subprocess.check_output(['git','--no-optional-locks','status','--short','-uall'],cwd=repo).decode('utf-8')
    return result

def baseline():
    dest=TMP/'before.json'
    if dest.exists(): raise RuntimeError('Baseline exists; do not overwrite')
    snap=capture(); dest.write_text(json.dumps(snap,ensure_ascii=False,indent=2),encoding='utf-8')
    print({k:len(v) for k,v in snap.items() if isinstance(v,dict)})

def svg_plan():
    # A3 landscape, 1:50 when printed at actual size: 1000 mm = 20 mm on sheet.
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188" role="img" aria-labelledby="title desc">',
      '<title id="title">DJ-CF-01 교육용 기준 평면도</title><desc id="desc">8m × 10m 고객공간과 서비스 영역. 고정 요소 D1 W1 W2 C1 K1, 카메라 01 02 03. S1 경계는 벽체가 아님.</desc>',
      '<style>text{font-family:Malgun Gothic,sans-serif;fill:#172328}.sm{font-size:15px}.label{font-size:20px;font-weight:700}.dim{font-size:16px}.muted{fill:#53616a}.wall{fill:#d5d9dc;stroke:#172328;stroke-width:2.4}.thin{stroke:#53616a;stroke-width:1;fill:none}</style>',
      '<rect width="1680" height="1188" fill="white"/>']
    x0,y0,sc=225,980,.08
    def xy(x,y):return x0+x*sc,y0-y*sc
    def line(a,b,style='stroke="#172328" stroke-width="2"'):
        x1,y1=xy(*a);x2,y2=xy(*b);parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {style}/>')
    def rect(x,y,w,h,attrs):
        xx,yy=xy(x,y+h);parts.append(f'<rect x="{xx}" y="{yy}" width="{w*sc}" height="{h*sc}" {attrs}/>')
    def text(x,y,t,cls='sm',anchor='start'):
        parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{html.escape(t)}</text>')
    def dimh(a,b,y,label):
        for q in [a,b]:line((q,y-100),(q,y+150),'stroke="#657079" stroke-width="1"')
        line((a,y),(b,y),'stroke="#657079" stroke-width="1"')
        for q in [a,b]:line((q-60,y-65),(q+60,y+65),'stroke="#172328" stroke-width="1.4"')
        xx,yy=xy((a+b)/2,y);text(xx,yy-7,label,'dim','middle')
    def dimv(a,b,x,label):
        for q in [a,b]:line((x-100,q),(x+150,q),'stroke="#657079" stroke-width="1"')
        line((x,a),(x,b),'stroke="#657079" stroke-width="1"')
        xx,yy=xy(x,(a+b)/2);parts.append(f'<text x="{xx-10}" y="{yy}" class="dim" text-anchor="middle" transform="rotate(-90 {xx-10} {yy})">{label}</text>')
    text(72,64,'DJ-CF-01  |  EXISTING PLAN','label');text(72,100,'직장인 생활권 소형 카페 고객공간 리뉴얼','label')
    text(72,130,'교육용 기준 평면도 · 개정 02 · 실제 실측도면 또는 법적 도면이 아님','sm')
    rect(0,0,8000,8000,'fill="#f8fafb"');rect(0,8000,8000,2000,'fill="#edf1f3"')
    # Existing outer walls, openings removed at plan cut height.
    rect(-180,0,180,6000,'class="wall"');rect(-180,8000,180,2000,'class="wall"')
    rect(8000,0,180,10000,'class="wall"');rect(-180,10000,8360,180,'class="wall"')
    for a,b in [(0,600),(4800,6400),(7400,8000)]:rect(a,-180,b-a,180,'class="wall"')
    for off in [-135,-65]:line((600,off),(4800,off));line((off,6000),(off,8000))
    line((2700,-180),(2700,0));line((-180,7000),(0,7000))
    line((7400,0),(7400,1000))
    sx,sy=xy(6400,0);ex,ey=xy(7400,1000)
    parts.append(f'<path d="M {sx} {sy} A 80 80 0 0 1 {ex} {ey}" stroke="#52616a" fill="none" stroke-width="1.5"/>')
    rect(2800,4300,400,400,'fill="#76828a" stroke="#172328" stroke-width="2"')
    rect(4800,8000,2400,600,'fill="#d5d9dc" stroke="#172328" stroke-width="2"')
    line((0,8000),(8000,8000),'stroke="#607887" stroke-width="1.8" stroke-dasharray="9 6"')
    for x,y,t in [(3000,4000,'C1 400×400'),(6000,8350,'K1'),(2400,9250,'S1 서비스 영역'),(3400,2500,'Z1 고객공간'),(2600,600,'W1'),(6900,400,'D1'),(850,7050,'W2')]:
        xx,yy=xy(x,y);text(xx,yy,t,'label','middle')
    xx,yy=xy(2200,8450);text(xx,yy,'기능 경계 / 벽체 아님','sm','middle')
    # Reference point for the column, concise positioning dimensions.
    line((3000,0),(3000,4300),'stroke="#91a0a8" stroke-width="1" stroke-dasharray="4 5"')
    line((0,4500),(2800,4500),'stroke="#91a0a8" stroke-width="1" stroke-dasharray="4 5"')
    dimh(0,3000,1600,'기둥 중심 X=3000');dimv(0,4500,-750,'기둥 중심 Y=4500')
    dimh(0,8000,-1100,'8000');dimv(0,10000,-1650,'10000')
    for a,b,l in [(0,600,'600'),(600,4800,'4200'),(4800,6400,'1600'),(6400,7400,'1000'),(7400,8000,'600')]:dimh(a,b,-560,l)
    for a,b,l in [(0,6000,'6000'),(6000,8000,'2000'),(8000,10000,'2000')]:dimv(a,b,-1150,l)
    dimh(4800,7200,9000,'2400');dimv(8000,8600,7750,'600')
    for camera in DATA['cameras']:
        pos=np.array(camera['position'][:2],float);tar=np.array(camera['target'][:2],float);d=(tar-pos)/np.linalg.norm(tar-pos);end=pos+d*800
        line(pos,end,'stroke="#255c78" stroke-width="2.5"')
        side=np.array([-d[1],d[0]])*95
        line(end,end-d*190+side,'stroke="#255c78" stroke-width="2.5"');line(end,end-d*190-side,'stroke="#255c78" stroke-width="2.5"')
        xx,yy=xy(*pos);parts.append(f'<circle cx="{xx}" cy="{yy}" r="7" fill="white" stroke="#255c78" stroke-width="2"/>');text(xx-12 if camera['id']=='03' else xx+12,yy-12,'CAM '+camera['id'],'sm','end' if camera['id']=='03' else 'start')
    text(980,210,'도면 읽기','label')
    notes=[('01  유지 요소','D1 · W1 · W2 · C1 · K1 · S1 유지'),('02  변경 가능한 영역','Z1의 이동식 가구 / 마감 색감 / 조명 표현'),('03  서비스 영역','S1의 점선은 기능 구분선이며 벽체가 아님'),('04  개구부 높이','D1: H2200 / W1: 하단600~상단2400'),('','W2: 하단900~상단2200'),('05  공간 조건','천장 H3000 / 기준 영역 80㎡'),('','벽 두께 180은 시각화용 설정, 구조 판단 불가'),('06  카메라','01 남측 / 02 북서측 / 03 남서측'),('','눈높이 1500 / 기준 화각 28mm'),('07  과제 범위','12~16석은 교육용 목표, 법적 수용인원 아님'),('','완성 가구 배치 정답은 포함하지 않음')]
    yy=255
    for title,body in notes:
        if title:text(980,yy,title,'label');yy+=30
        text(980,yy,body,'sm');yy+=42
    text(980,945,'범례: 굵은 실선 = 기존 벽체 / 회색 = 고정 요소','sm')
    text(980,975,'점선 = 기능 경계 / 파란 화살표 = 카메라 방향','sm')
    text(1510,155,'N','label','middle');parts.append('<path d="M1510 225V170M1510 170l-9 16M1510 170l9 16" stroke="#172328" stroke-width="3" fill="none"/>')
    # Exact 4 m scale bar = 80 mm on printed sheet.
    for i in range(4):parts.append(f'<rect x="{990+i*80}" y="1040" width="80" height="12" fill="'+('#172328' if i%2==0 else 'white')+'" stroke="#172328"/>')
    for i in range(5):text(990+i*80,1076,str(i)+('m' if i==4 else ''),'sm','middle')
    text(72,1140,'A3 · 1:50 @ 100% · 단위 mm · 남서 실내 모서리 원점 · DJ-CF-01 / draft-01','sm')
    parts.append('</svg>');(ROOT/'DJ-CF-01_existing-plan.svg').write_text('\n'.join(parts),encoding='utf-8')

def geometry():
    svg_plan()
    boxes=[]
    def box(lo,hi,color,kind='solid'):boxes.append((np.array(lo),np.array(hi),np.array(color),kind))
    wall=[.77,.775,.77];floor=[.49,.5,.5];frame=[.16,.18,.19]
    box([-0.18,-.18,-.15],[8.18,10.18,0],floor,'floor');box([-.18,-.18,3],[8.18,10.18,3.15],[.84,.845,.84])
    box([8,0,0],[8.18,10,3],wall);box([-.18,10,0],[8.18,10.18,3],wall)
    def opening_wall(axis,length,opens):
        cursor=0
        def seg(a,b,z0,z1,col=wall,kind='solid',depth=.18):
            if b-a<1e-6 or z1-z0<1e-6:return
            box([a,-depth,z0],[b,0,z1],col,kind) if axis=='south' else box([-depth,a,z0],[0,b,z1],col,kind)
        for op in opens:
            a,b,low,high,mullions=op;seg(cursor,a,0,3);seg(a,b,0,low);seg(a,b,high,3)
            seg(a,a+.045,low,high,frame);seg(b-.045,b,low,high,frame)
            seg(a,b,low,low+.045,frame);seg(a,b,high-.045,high,frame)
            for m in mullions:seg(m-.025,m+.025,low,high,frame)
            # Glass is represented by luminous diffuse overcast exterior, without arbitrary scenery.
            if axis=='south':box([a,-.195,low],[b,-.19,high],[.78,.84,.87],'glass')
            else:box([-.195,a,low],[-.19,b,high],[.78,.84,.87],'glass')
            cursor=b
        seg(cursor,length,0,3)
    opening_wall('south',8,[(.6,4.8,.6,2.4,[2.7]),(6.4,7.4,0,2.2,[])])
    opening_wall('west',10,[(6,8,.9,2.2,[7])])
    box([2.8,4.3,0],[3.2,4.7,3],wall)
    box([4.8,8,0],[7.2,8.6,.86],[.65,.66,.655]);box([4.8,8,.86],[7.2,8.6,.9],[.43,.45,.45])
    # Existing door handle, attached only to D1.
    box([6.52,.015,.98],[6.54,.05,1.28],frame)
    refs=ROOT/'source'/'geometry';refs.mkdir(parents=True,exist_ok=True)
    def raycast(orig,dirs):
        n=len(dirs);best=np.full(n,np.inf);idx=np.full(n,-1,dtype=int);norm=np.zeros((n,3));safe=np.where(abs(dirs)<1e-9,1e-9,dirs)
        for j,(lo,hi,col,kind) in enumerate(boxes):
            t1=(lo-orig)/safe;t2=(hi-orig)/safe;near=np.minimum(t1,t2);far=np.maximum(t1,t2)
            tn=near.max(axis=1);tf=far.min(axis=1);hit=(tf>=np.maximum(tn,1e-5))&(tn<best)&(tn>1e-5)
            inds=np.where(hit)[0]
            if len(inds):
                axes=np.argmax(near[inds],axis=1);best[inds]=tn[inds];idx[inds]=j;norm[inds]=0;norm[inds,axes]=-np.sign(dirs[inds,axes])
        return best,idx,norm
    width,height=1536,1024
    stats=[]
    for camera in DATA['cameras']:
        origin=np.array(camera['position'])/1000;f=np.array(camera['target'])/1000-origin;f=f/np.linalg.norm(f);right=np.cross(f,[0,0,1]);right/=np.linalg.norm(right);up=np.cross(right,f)
        u=(np.arange(width)+.5-width/2)/(width/2)*(36/56);v=(height/2-np.arange(height)-.5)/(width/2)*(36/56)
        uu,vv=np.meshgrid(u,v);directions=f+uu[...,None]*right+vv[...,None]*up;directions/=np.linalg.norm(directions,axis=2)[...,None];directions=directions.reshape(-1,3)
        output=[]
        for start in range(0,len(directions),50000):
            d=directions[start:start+50000];t,idx,norm=raycast(origin,d);points=origin+d*t[:,None];col=np.ones((len(d),3))*.8
            for j,(_,_,base,kind) in enumerate(boxes):
                sel=idx==j
                if not sel.any():continue
                if kind=='glass':col[sel]=base;continue
                p=points[sel];nn=norm[sel]
                illumination=np.ones(len(p))*.53
                for light,power in [(np.array([2.7,-.5,1.6]),.34),(np.array([-.5,7,1.6]),.18),(np.array([4,5,2.9]),.12)]:
                    ld=light-p;distance=np.linalg.norm(ld,axis=1);ld/=distance[:,None];lam=np.maximum(0,(nn*ld).sum(axis=1))
                    illumination+=power*lam/(1+(distance/8)**2)
                # Soft contact shading near floor/wall and fixed objects; no random geometry.
                if kind=='floor':
                    distwall=np.minimum.reduce([p[:,0],8-p[:,0],p[:,1],10-p[:,1]])
                    cd=np.sqrt(np.maximum(abs(p[:,0]-3)-.2,0)**2+np.maximum(abs(p[:,1]-4.5)-.2,0)**2)
                    illumination*=1-.12*np.exp(-np.maximum(distwall,0)*5)-.16*np.exp(-cd*5)
                tone=base[None,:]*illumination[:,None]
                col[sel]=tone
            col=np.clip(col,0,1)**(1/1.8);output.append((col*255).astype(np.uint8))
        pixels=np.concatenate(output).reshape(height,width,3);dest=refs/f'DJ-CF-01_whitebox-{camera["id"]}.png';Image.fromarray(pixels).save(dest)
        stats.append({'id':camera['id'],'image':str(dest.relative_to(ROOT)),'sha256':sha(dest),'camera':camera})
        print('Rendered',dest.name,flush=True)
    (refs/'DJ-CF-01_geometry.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')

def verify():
    before=json.loads((TMP/'before.json').read_text(encoding='utf-8'));after=capture();result={}
    for name in ['daejeon']:
        changes=[p for p,h in before[name].items() if after[name].get(p)!=h]
        additions=[p for p in after[name] if p not in before[name]]
        result[name]={'existingFileChanges':changes,'outsidePackageAdditions':additions,'filesCompared':len(before[name])}
    result['courseStatus']=json.loads((REPO/'data/courses/daejeon-2026/course.json').read_text(encoding='utf-8'))['contentStatus']
    (ROOT/'source').mkdir(exist_ok=True)
    (ROOT/'source/DJ-CF-01_protection-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
    assert all(not result[n]['existingFileChanges'] and not result[n]['outsidePackageAdditions'] for n in ['daejeon'])
    assert result['courseStatus']=='design-pending'

if __name__=='__main__':
    {'baseline':baseline,'geometry':geometry,'plan':svg_plan,'verify':verify}[args.stage]()
