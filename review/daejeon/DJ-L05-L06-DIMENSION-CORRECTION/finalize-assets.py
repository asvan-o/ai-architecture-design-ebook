"""Synchronize L05/L06 current prompts, manifests and student packages only."""
from pathlib import Path
import hashlib
import json
import shutil
import zipfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
L05 = ROOT/'review/daejeon/DJ-L05-FLOORPLAN-INPAINTING/revision-review8-20261016'
L06 = ROOT/'review/daejeon/DJ-L06-3D-ZONING/revision-review8-20261016'


def write_json(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


def edit(p, substitutions):
    text = p.read_text(encoding='utf-8')
    for old, new in substitutions:
        text = text.replace(old, new)
    p.write_text(text, encoding='utf-8')


def metadata(root, file):
    p = root/file; data = p.read_bytes()
    row = {'file': file, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'sizeBytes': len(data)}
    if p.suffix == '.png':
        with Image.open(p) as im: row.update(width=im.width, height=im.height)
    return row


for name in ('plan01-edit.txt', 'plan02-edit.txt'):
    p = L05/'prompts'/name
    backup = HERE/'source-baseline/prompts'/name
    if not backup.exists():
        backup.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(p, backup)
    edit(p, [('약 3,600mm', '2,700mm'),
        ('중앙의 가로 직사각 테이블을 같은 중심과 세로 깊이로 유지하면서',
         '중앙의 1,800×1,000mm 가로 직사각 테이블을 같은 중심과 세로 깊이 1,000mm로 유지하면서'),
        ('중앙 테이블의 중심·세로 깊이를 유지하고', '중앙의 1,800×1,000mm 테이블 중심·세로 깊이 1,000mm를 유지하고')])

edit(L05/'prompts/recompose.txt', [
    ('PLAN-BASE-01-ai-raw.png', 'PLAN-BASE-01-precision-crop.png'),
    ('PLAN-BASE-01-door-ai-raw.png', 'PLAN-BASE-01-door-precision-crop.png'),
    ('PLAN-BASE-02-ai-raw.png', 'PLAN-BASE-02-precision-crop.png'),
    ('실제 이미지 파일 연산으로 부분 수정 결과를', '실제 이미지 파일 연산으로 검수한 부분 수정 결과를'),
    ('원래 Crop·AI 부분 출력·영역 표시본', '원래 Crop·최신 정밀 부분 결과 또는 본인의 검수한 AI 부분 출력·영역 표시본'),
])
recompose = L05/'prompts/recompose.txt'
t = recompose.read_text(encoding='utf-8')
note = ('제공된 precision-crop 파일은 최신 2D 치수를 좌표로 작도한 비교 기준이며 AI 생성 출력이 아니다. '
        '과거 ai-raw 파일은 이전 가구 치수의 생성 기록이므로 최신 결과와 혼동하지 않는다.\n')
if note not in t:
    t = t.replace('\n목적\n', '\n'+note+'\n목적\n', 1)
recompose.write_text(t, encoding='utf-8')

guide = '''# 도면 치수와 시각화 자료 사용 기준

## 최신 2D 가구 치수
- 외곽 14,400 × 8,400 mm와 벽·문·창·기둥·0~2m 스케일바는 유지합니다.
- 업무 대면 책상: 2인 모듈 1,600 × 1,400 mm, 1인 상판 1,600 × 700 mm. 두 조, 총 4석입니다.
- 오피스·카페 4석 테이블: 1,800 × 1,000 mm.
- 6석 확장: 같은 중심과 깊이 1,000 mm를 유지하고 길이만 2,700 mm로 바꿉니다.
- 싱크·커피바 2,800 × 650 mm, 카페 바 3,600 × 700 mm와 백바 3,600 × 600 mm는 유지합니다.
- PLAN-GEOMETRY.json의 단위는 mm, 캔버스 변환은 0.1px/mm입니다. 화면 확대율로 실물 치수를 판단하지 않습니다.

## 출력과 AI 결과를 구분합니다
최신 전체 도면과 precision-crop은 좌표로 작도한 정밀 비교 기준입니다. AI가 정밀 치수를 그대로 생성했다고 주장하는 자료가 아닙니다. 본인이 생성한 후보는 실제 파일로 저장하고 가구 크기·좌석·유지 영역을 대조합니다. ai-raw 파일은 이전 가구 치수로 실행한 실제 생성 기록이며 보존된 오차 비교 자료입니다.

## 실제 1:100 출력
별도 precision PDF는 A3 가로입니다. 인쇄의 실제 크기/100%를 선택하고 페이지 맞춤·자동 축소를 끕니다. 외곽 144 × 84 mm와 0~2m 스케일바 20 mm를 출력 후 자로 확인합니다. 교보재 본문 이미지는 축소 수록되므로 같은 인쇄 축척이라고 읽지 않습니다. SVG는 자체 포함 PNG 시트이며 원시트 물리 크기 240 × 165 mm를 지정합니다. 전체 도면의 편집 가능한 CAD 벡터 원본은 아닙니다.

## 기존 3D와 참고 도면의 한계
기존 3D·아이소메트릭·분해도·서브 뷰는 구획·조닝·재료·조명 비교용 시각화로 보존합니다. 세부 가구 비례는 최신 2D와 정밀하게 일치하지 않습니다. 정밀 치수는 최신 2D 및 정밀 출력 PDF가 기준입니다.

객실의 33.00㎡는 교육용 실내면적 설정값이며 외곽 직사각형 6.8×5.8=39.44㎡와 구분합니다. 객실 래스터의 상단 6,800과 하단 3,600 구간은 한 가지 픽셀 축척으로 일치하지 않으므로 정밀 면적·좌표 역산에 쓰지 않습니다.

거실·주방의 좌측 상단 850+880+410=2,140 mm와 전체 표기 2,130 mm에는 10 mm 차이가 있습니다. 식탁 2,400과 콘솔 3,000의 표기도 픽셀 비례와 일치하지 않습니다. 기존 래스터와 표기는 보존하며 원도면·실측에서 확인합니다. 1/50·1/40 표기는 교보재의 실제 출력 축척을 보장하지 않습니다.

기존 주택 원도면 3종은 보존합니다. 문 폭 등의 국소 표기만으로 전체 외곽·가구 크기·면적을 확정하지 않습니다. 실제 적용에는 원 DWG·실측·전문 검토가 필요합니다.
'''
(L05/'analysis/DIMENSION-AND-SCALE-GUIDE.md').write_text(guide, encoding='utf-8')
(L06/'DIMENSION-AND-SCALE-GUIDE.md').write_text(guide, encoding='utf-8')

read05 = '''제5차시 평면도 부분 수정 실습자료

최신 기준: 외곽 14,400 × 8,400 mm. 업무 2인 모듈 1,600 × 1,400 mm(1인 1,600 × 700).
회의·카페 테이블은 4석 1,800 × 1,000 → 6석 2,700 × 1,000 mm로 중심과 깊이를 유지합니다.
오피스는 6석 결과에서 D2 이동을 이어가고 카페는 별도 하단 2석과 바를 보존합니다.

plans/는 최신 원본·입력 Crop·수정 영역 안내, results/*-result.png는 좌표로 작도한 정밀 비교 결과입니다.
results/*-precision-crop.png는 파일 연산 재반영에 사용할 정밀 부분 결과입니다.
results/*-ai-raw.png는 이전 가구 치수의 실제 AI 생성 기록이며 최신 치수 결과가 아닙니다.
AI 후보는 본인 결과를 저장하고 검수합니다. 정밀 전체 도면과 AI 원본 출력을 혼동하지 않습니다.

precision/의 PDF는 A3 가로 실제 크기/100% 인쇄에서 1:100입니다. 외곽 144×84 mm, 스케일바 20 mm를 확인합니다.
교보재 본문은 축소 수록되므로 별도 정밀 출력 PDF를 사용합니다.
analysis/DIMENSION-AND-SCALE-GUIDE.md에서 기존 3D·참고 도면의 치수 한계도 읽습니다.
각 단계의 요청문은 prompts/ TXT를 사용합니다.
'''
(L05/'README.txt').write_text(read05, encoding='utf-8')
read06 = (L06/'README.txt').read_text(encoding='utf-8')
read06 = read06.replace('각 단계는 prompts/의 단일 TXT에 실제 생성 원문이 있습니다.',
    '각 단계의 prompts/ TXT는 생성 요청의 구조를 제공합니다. 기존 3D는 이전 가구 비례의 시각화로 보존되며 최신 2D 치수를 보증하지 않습니다.')
read06 += ('\n최신 가구 치수: 업무 대면 2인 모듈 1,600×1,400 mm(1인 1,600×700), 회의·카페 6석 2,700×1,000 mm. '
           '정밀 치수는 inputs/ 평면과 precision/ A3 PDF를 기준으로 합니다. 3D는 조닝·구획·재료·조명 비교용입니다.\n'
           '정밀 출력은 A3 가로 실제 크기/100%에서 1:100이며 외곽 144×84 mm, 스케일바 20 mm를 확인합니다. '
           'DIMENSION-AND-SCALE-GUIDE.md에서 객실 33㎡ 교육용 설정과 레거시 치수·축척 한계를 확인합니다.\n')
# Stable reruns do not append the revision notice twice.
read06 = read06.split('\n최신 가구 치수:')[0] + '\n최신 가구 치수:' + read06.rsplit('\n최신 가구 치수:',1)[1]
(L06/'README.txt').write_text(read06, encoding='utf-8')
for p in (L05/'analysis/DRAWING-READING-CHECKLIST.md', L06/'CHECKLIST.md'):
    text = p.read_text(encoding='utf-8').split('\n## 정밀 치수 추가 대조')[0]
    text += ('\n## 정밀 치수 추가 대조\n- 업무 모듈 1,600×1,400 mm, 4석 테이블 1,800×1,000 mm, 6석 2,700×1,000 mm.\n'
             '- 4석→6석에서 중심과 깊이 1,000 mm가 유지되는지 확인합니다.\n'
             '- 원본 외곽·벽·문·창·기둥·스케일바와 고정 싱크/바는 가구 변경과 분리합니다.\n'
             '- 기존 3D는 정밀 치수 검증용이 아니며 최신 2D와의 비례 차이를 기록합니다.\n'
             '- 교보재 축소 이미지 대신 A3 정밀 출력 PDF의 100% 인쇄 여부를 확인합니다.\n')
    p.write_text(text, encoding='utf-8')

g = json.loads((L05/'precision/PLAN-GEOMETRY.json').read_text(encoding='utf-8'))
for p in [ROOT/'review/daejeon/LESSON05_06_FINAL_8FIX/cad/geometry.json',
          ROOT/'review/daejeon/LESSON05_06_CAD_CORRECTION/cad/geometry.json']:
    write_json(p, g)

m05 = json.loads((L05/'manifest.json').read_text(encoding='utf-8'))
m06 = json.loads((L06/'manifest.json').read_text(encoding='utf-8'))
qa = json.loads((HERE/'FURNITURE-PIXEL-QA.json').read_text(encoding='utf-8'))
m05['precision'] = [{**metadata(L05, row['file']), 'key': row['key'], 'title': row['title'],
                     'description': 'A3 가로 실제 크기/100% 출력에서 1:100; 외곽 144×84 mm·2m 스케일바 20 mm.'}
                    for row in qa['pdfs']]
m05['precisionCrops'] = []
for key, file, title in [
    ('office-precision-crop','results/PLAN-BASE-01-precision-crop.png','오피스 · 최신 6석 정밀 부분 결과'),
    ('cafe-precision-crop','results/PLAN-BASE-02-precision-crop.png','카페 · 최신 6석 정밀 부분 결과'),
    ('door-precision-crop','results/PLAN-BASE-01-door-precision-crop.png','오피스 · 최신 D2 이동 정밀 부분 결과')]:
    m05['precisionCrops'].append({**metadata(L05,file), 'key':key, 'title':title,
                                 'description':'좌표로 작도한 비교 기준입니다. AI 생성 원본 출력이 아닙니다.'})
for plan in m05['plans']:
    plan['description'] = '외곽 14,400 × 8,400 mm, 4석 테이블 1,800 × 1,000 mm의 교육용 평면입니다.'
    plan['base']['description'] = plan['description']
    plan['result']['description'] = '중심과 깊이 1,000 mm를 유지한 2,700 mm 테이블·3+3석의 정밀 작도 결과입니다. AI 생성 성공을 주장하는 자료가 아닙니다.'
for item in m05['rawOutputs']:
    item['description'] = '이전 가구 치수로 실행한 실제 AI 생성 기록입니다. 최신 2,700×1,000 mm 정밀 도면과 구분합니다.'
    item['title'] = item['title'].replace('실제 AI 결과','이전 AI 생성 기록')

candidate_map = {'results/PLAN-BASE-01-ai-raw.png':'results/PLAN-BASE-01-precision-crop.png',
                 'results/PLAN-BASE-02-ai-raw.png':'results/PLAN-BASE-02-precision-crop.png',
                 'results/PLAN-BASE-01-door-ai-raw.png':'results/PLAN-BASE-01-door-precision-crop.png'}
for p in m05['prompts']:
    if p['key'] == 'recompose':
        def replace_candidates(obj):
            if isinstance(obj, dict):
                if obj.get('file') in candidate_map:
                    obj['file'] = candidate_map[obj['file']]
                    obj['outputPath'] = 'practice/DJ-L05/'+obj['file']
                    obj['role'] = '최신 정밀 부분 결과 또는 같은 역할의 본인 검수 결과; AI 생성 원본과 구분'
                for val in obj.values(): replace_candidates(val)
            elif isinstance(obj,list):
                for val in obj: replace_candidates(val)
        replace_candidates(p)

(L06/'precision').mkdir(exist_ok=True)
for key in ('office-door', 'cafe-six'):
    item = next(row for row in m05['precision'] if row['key']==key)
    shutil.copyfile(L05/item['file'], L06/item['file'])
    new = {**metadata(L06,item['file']), 'key':'precision-'+key, 'title':item['title']}
    m06['downloads'] = [x for x in m06['downloads'] if x.get('key') != new['key']]+[new]
if not any(x.get('key')=='dimension-guide' for x in m06['downloads']):
    m06['downloads'].append({'file':'DIMENSION-AND-SCALE-GUIDE.md','key':'dimension-guide','title':'치수·축척·기존 3D 사용 기준'})
if not any(x.get('key')=='dimension-guide' for x in m05['analysis']):
    m05['analysis'].append({'file':'analysis/DIMENSION-AND-SCALE-GUIDE.md','key':'dimension-guide','title':'치수·축척·기존 3D 사용 기준'})

for root, manifest, extras, zipname, pub in [
    (L05, m05, [str(p.relative_to(L05)).replace('\\','/') for p in (L05/'precision').glob('*')]+[x['file'] for x in m05['precisionCrops']]+['analysis/DIMENSION-AND-SCALE-GUIDE.md'], 'DJ-L05_PRACTICE_REVIEW.zip', 'DJ-L05'),
    (L06, m06, [x['file'] for x in m06['downloads']], 'DJ-L06-3d-isometric-zoning.zip', 'DJ-L06')]:
    old = {row['file']:row for row in manifest['files']}
    for file in extras: old.setdefault(file, {'file':file})
    manifest['files'] = [{**row, **metadata(root,file)} for file,row in sorted(old.items())]
    def sync(obj):
        if isinstance(obj,dict):
            if obj.get('file') and (root/obj['file']).is_file(): obj.update(metadata(root,obj['file']))
            for val in obj.values(): sync(val)
        elif isinstance(obj,list):
            for val in obj: sync(val)
    sync(manifest)
    write_json(root/'manifest.json', manifest)
    entries = sorted([x['file'] for x in manifest['files']]+['manifest.json'])
    (root/'SHA256SUMS.txt').write_text(''.join(f"{metadata(root,file)['sha256']}  {file}\n" for file in entries), encoding='utf-8')
    with zipfile.ZipFile(root/zipname, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for file in sorted(entries+['SHA256SUMS.txt']):
            info=zipfile.ZipInfo(file,(2026,11,7,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
            z.writestr(info,(root/file).read_bytes())
    with zipfile.ZipFile(root/zipname) as z:
        assert z.testzip() is None
        assert all(z.read(f)==(root/f).read_bytes() for f in entries)
    dest = ROOT/'public/practice'/pub
    for file in entries+['SHA256SUMS.txt',zipname]:
        target=dest/file;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/file,target)

print(json.dumps({'passed':True,'lesson05Files':len(m05['files']),'lesson06Files':len(m06['files']),
                  'precisionPdfs':5,'lesson06PrecisionCopies':2,'zipCrcAndContents':'PASS'},ensure_ascii=False))
