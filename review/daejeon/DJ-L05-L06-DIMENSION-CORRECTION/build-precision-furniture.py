"""Deterministic furniture-only correction. Never redraw walls, dimensions or legacy/3D assets.

Source baselines are retained once for reproducibility. The active PNGs are lossless
RGB copies with replacements restricted to the documented furniture rectangles.
"""
from pathlib import Path
import base64
import hashlib
import json
import shutil

import numpy as np
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
L05 = ROOT / 'review/daejeon/DJ-L05-FLOORPLAN-INPAINTING/revision-review8-20261016'
L06 = ROOT / 'review/daejeon/DJ-L06-3D-ZONING/revision-review8-20261016'
BASELINE = HERE / 'source-baseline'
BASELINE.mkdir(parents=True, exist_ok=True)
S = 4
INK = '#41535e'
FILL = '#f5f7f8'
WORK = [(575, 478, 865, 790), (890, 478, 1180, 790)]
OFFICE_TABLE = (1380, 550, 1805, 838)
CAFE_TABLE = (1260, 538, 1682, 830)
REPORT = {'schemaVersion': 1, 'method': 'deterministic furniture ROI replacement; no image generation',
          'units': 'mm', 'pixelScalePxPerMm': .1, 'outsideFurnitureRoiChangedPixels': 0,
          'furniture': {'workFacingModule': [1600, 1400], 'workIndividual': [1600, 700],
                        'table4': [1800, 1000], 'table6': [2700, 1000]}, 'images': [], 'pdfs': []}
REPORT['protectedAssets'] = []
for asset_root in (L05, L06):
    manifest = json.loads((asset_root/'manifest.json').read_text(encoding='utf-8'))
    for row in manifest['files']:
        file = row['file']
        if file.startswith(('legacy-', 'samples/')) or file.endswith('-ai-raw.png'):
            p = asset_root/file
            expected = row['sha256']
            assert hashlib.sha256(p.read_bytes()).hexdigest() == expected, file
            REPORT['protectedAssets'].append({'file': str(p.relative_to(ROOT)).replace('\\', '/'), 'sha256': expected})


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def source(file):
    saved = BASELINE / file
    if not saved.exists():
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(L05 / file, saved)
    return Image.open(saved).convert('RGB')


class Furniture:
    def __init__(self, box):
        self.box = box
        self.im = Image.new('RGB', ((box[2]-box[0])*S, (box[3]-box[1])*S), 'white')
        self.d = ImageDraw.Draw(self.im)

    def xy(self, p):
        return ((p[0]-self.box[0])*S, (p[1]-self.box[1])*S)

    def rect(self, box, radius=0, fill=FILL, outline=INK, width=1.5):
        p = (*self.xy(box[:2]), *self.xy(box[2:]))
        # The extent is half-open: requested 180/270 by 100 pixels stays exact.
        p = (p[0], p[1], p[2]-1, p[3]-1)
        self.d.rounded_rectangle(p, radius*S, fill=fill, outline=outline, width=round(width*S))

    def line(self, points, fill=INK, width=1):
        self.d.line([self.xy(p) for p in points], fill=fill, width=round(width*S))

    def chair(self, cx, cy, north=True, color=INK):
        self.rect((cx-28, cy-27, cx+28, cy+27), radius=5, fill='#fafbfc', outline=color, width=1.3)
        self.line([(cx-23, cy-17), (cx-23, cy+17)], color, .8)
        self.line([(cx+23, cy-17), (cx+23, cy+17)], color, .8)
        by = cy-21 if north else cy+21
        # A curved chair back distinguishes the symbol from a plain rectangle.
        curve = []
        for t in np.linspace(-1, 1, 41):
            curve.append((cx + 34*t, by + (-7 if north else 7)*(1-t*t)))
        self.line(curve, color, 2)

    def desks(self, cx):
        self.rect((cx-80, 565, cx+80, 705), radius=4, width=1.5)
        self.line([(cx-79, 635), (cx+79, 635)], width=1)
        for y in (590, 652):
            self.rect((cx-30, y, cx+30, y+28), radius=2, fill='#eaf0f3', width=1)
            self.line([(cx, y+28), (cx, y+35)], width=1)
        self.chair(cx, 520, True)
        self.chair(cx, 750, False)

    def table(self, center, seats, color=INK, fill=FILL):
        cx, cy = center
        width = 180 if seats == 4 else 270
        self.rect((cx-width/2, cy-50, cx+width/2, cy+50), radius=7, fill=fill, outline=color, width=1.5)
        offsets = (-50, 50) if seats == 4 else (-90, 0, 90)
        for offset in offsets:
            self.chair(cx+offset, cy-90, True, color)
            self.chair(cx+offset, cy+90, False, color)

    def result(self):
        return self.im.resize((self.box[2]-self.box[0], self.box[3]-self.box[1]), Image.Resampling.LANCZOS)


def patch_file(file, office, seats=4, overlay=False, marked=False):
    before = source(file)
    out = before.copy()
    boxes = (WORK if office else []) + [OFFICE_TABLE if office else CAFE_TABLE]
    for i, box in enumerate(boxes):
        layer = Furniture(box)
        if office and i < 2:
            layer.desks(720 if i == 0 else 1035)
        elif overlay:
            # Actual before/after vector contours, with no generated comparison marks.
            a = Furniture(box); a.table((1590, 690) if office else (1470, 680), 4)
            b = Furniture(box); b.table((1590, 690) if office else (1470, 680), 6)
            av, bv = np.asarray(a.result()), np.asarray(b.result())
            old, new = np.min(av, axis=2) < 230, np.min(bv, axis=2) < 230
            rgb = np.full(av.shape, 255, dtype=np.uint8)
            rgb[old & new] = (105, 115, 120)
            rgb[old & ~new] = (50, 115, 210)
            rgb[new & ~old] = (185, 55, 130)
            out.paste(Image.fromarray(rgb), box[:2])
            continue
        else:
            layer.table((1590, 690) if office else (1470, 680), seats)
        replacement = layer.result()
        if marked and i == len(boxes)-1:
            # Preserve the existing red mask border/label and apply its pale fill.
            old = np.asarray(before.crop(box))
            rep = np.asarray(replacement).copy()
            mask = old[:, :, 0].astype(int)-old[:, :, 1].astype(int) > 35
            rep[mask] = old[mask]
            region = (1400, 560, 1800, 830) if office else (1280, 550, 1660, 820)
            yy, xx = np.indices(rep.shape[:2]); inside = ((xx+box[0] > region[0]) & (xx+box[0] < region[2]) &
                (yy+box[1] > region[1]) & (yy+box[1] < region[3]) & ~mask)
            rep[inside] = (rep[inside].astype(float)*.93 + np.array([205, 50, 50])*.07).astype(np.uint8)
            replacement = Image.fromarray(rep)
        out.paste(replacement, box[:2])
    a, b = np.asarray(before), np.asarray(out)
    allowed = np.zeros(a.shape[:2], bool)
    for x0, y0, x1, y1 in boxes:
        allowed[y0:y1, x0:x1] = True
    changed = np.any(a != b, axis=2)
    outside = int(np.count_nonzero(changed & ~allowed))
    assert outside == 0, file
    target = L05/file
    out.save(target, optimize=True)
    REPORT['images'].append({'file': file, 'allowedFurnitureBoxesPx': boxes, 'outsideRoiChangedPixels': outside,
        'insideRoiChangedPixels': int(np.count_nonzero(changed & allowed)),
        'beforeSha256': sha((BASELINE/file).read_bytes()), 'afterSha256': sha(target.read_bytes())})
    return out


def crop_save(source_file, target_file, box):
    im = Image.open(L05/source_file).convert('RGB')
    im.crop(box).save(L05/target_file, optimize=True)


full = [
    ('plans/PLAN-BASE-01.png', True, 4, False, False),
    ('plans/PLAN-BASE-01-marked.png', True, 4, False, True),
    ('results/PLAN-BASE-01-result.png', True, 6, False, False),
    ('results/PLAN-BASE-01-furniture-overlay.png', True, 6, True, False),
    ('plans/PLAN-BASE-01-door-marked.png', True, 6, False, False),
    ('results/PLAN-BASE-01-door-result.png', True, 6, False, False),
    ('results/PLAN-BASE-01-door-overlay.png', True, 6, False, False),
    ('plans/PLAN-BASE-02.png', False, 4, False, False),
    ('plans/PLAN-BASE-02-marked.png', False, 4, False, True),
    ('results/PLAN-BASE-02-result.png', False, 6, False, False),
    ('results/PLAN-BASE-02-furniture-overlay.png', False, 6, True, False),
]
for args in full:
    patch_file(*args)

# Crops derive from the corrected whole drawings, never from a resized AI output.
crop_save('plans/PLAN-BASE-01.png', 'plans/PLAN-BASE-01-crop.png', (1190, 360, 1950, 940))
crop_save('plans/PLAN-BASE-02.png', 'plans/PLAN-BASE-02-crop.png', (930, 360, 1950, 1230))
crop_save('results/PLAN-BASE-01-result.png', 'plans/PLAN-BASE-01-door-crop.png', (1180, 360, 1660, 940))
for plan, box in [('01', (1190, 360, 1950, 940)), ('02', (930, 360, 1950, 1230))]:
    crop_save(f'results/PLAN-BASE-{plan}-result.png', f'results/PLAN-BASE-{plan}-precision-crop.png', box)
crop_save('results/PLAN-BASE-01-door-result.png', 'results/PLAN-BASE-01-door-precision-crop.png', (1180, 360, 1660, 940))

# Publish self-contained coordinate data alongside the raster sheets.
g = json.loads((ROOT/'review/daejeon/LESSON05_06_FINAL_8FIX/cad/geometry.json').read_text(encoding='utf-8'))
g['office']['furnitureDimensionsMm'] = REPORT['furniture']
g['cafe']['furnitureDimensionsMm'] = {k: v for k, v in REPORT['furniture'].items() if k.startswith('table')}
g['office']['furnitureCentersCanvasPx'] = {'workModules': [[720, 635], [1035, 635]], 'table': [1590, 690]}
g['cafe']['furnitureCentersCanvasPx'] = {'table': [1470, 680]}
g['precisionPrint'] = {'page': 'A3 landscape', 'pageMm': [420, 297], 'sheetMm': [240, 165],
    'sheetLowerLeftMm': [90, 66], 'scale': '1:100 at actual size / 100 percent',
    'buildingPrintedMm': [144, 84], 'scaleBar2mPrintedMm': 20,
    'textbook': 'Reduced illustration; not a fixed-scale construction drawing.'}
precision = L05/'precision'; precision.mkdir(exist_ok=True)
write_json(precision/'PLAN-GEOMETRY.json', g)

font = Path('C:/Windows/Fonts/malgun.ttf')
pdfmetrics.registerFont(TTFont('WorkbookMalgun', str(font)))
specs = [
    ('office-base', 'plans/PLAN-BASE-01.png', 'PLAN-BASE-01-precision-1-100-A3.pdf', '오피스 · 4석 원본'),
    ('cafe-base', 'plans/PLAN-BASE-02.png', 'PLAN-BASE-02-precision-1-100-A3.pdf', '카페 · 4석 원본'),
    ('office-six', 'results/PLAN-BASE-01-result.png', 'PLAN-BASE-01-result-precision-1-100-A3.pdf', '오피스 · 6석 결과'),
    ('office-door', 'results/PLAN-BASE-01-door-result.png', 'PLAN-BASE-01-door-result-precision-1-100-A3.pdf', '오피스 · 6석 및 D2 이동 결과'),
    ('cafe-six', 'results/PLAN-BASE-02-result.png', 'PLAN-BASE-02-result-precision-1-100-A3.pdf', '카페 · 6석 결과'),
]
for key, png, pdfname, title in specs:
    p = precision/pdfname
    c = canvas.Canvas(str(p), pagesize=landscape(A3), invariant=1)
    c.setTitle(title+' — 정밀 출력 1:100')
    c.setFont('WorkbookMalgun', 14); c.drawString(30*mm, 272*mm, title+' · 정밀 출력 도면')
    c.setFont('WorkbookMalgun', 9)
    c.drawString(30*mm, 260*mm, 'A3 가로 · 실제 크기/100% 인쇄에서 축척 1:100 · 페이지 맞춤 인쇄 금지')
    c.drawString(30*mm, 251*mm, '외곽 144 × 84 mm, 스케일바 0~2m 길이 20 mm를 인쇄 후 자로 확인하세요.')
    c.drawImage(ImageReader(str(L05/png)), 90*mm, 66*mm, width=240*mm, height=165*mm)
    c.setFont('WorkbookMalgun', 8)
    c.drawString(30*mm, 38*mm, '교육용 가상 평면 · 가구는 좌표로 작도한 치수 기준 예시이며 실제 시공·법규·구조 적합성을 증명하지 않습니다.')
    c.drawString(30*mm, 31*mm, '교보재 본문에 축소 수록된 이미지와 이 정밀 출력 PDF의 인쇄 축척을 구분합니다.')
    c.drawString(30*mm, 18*mm, '© 2026 OKS · 수강생 전용 자료 · 무단 복제 및 배포 금지')
    c.showPage(); c.save()
    # Self-contained SVG gives the exact original sheet's physical size as well.
    data = base64.b64encode((L05/png).read_bytes()).decode('ascii')
    svg = precision/(Path(pdfname).stem+'.svg')
    svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="240mm" height="165mm" viewBox="0 0 2400 1650">'
        '<title>'+title+' · 1:100 원시트</title><desc>Deterministic raster sheet; geometry in PLAN-GEOMETRY.json. '
        'No external assets. 14400x8400 mm envelope maps to 1440x840 pixels.</desc>'
        '<image width="2400" height="1650" href="data:image/png;base64,'+data+'"/></svg>\n', encoding='utf-8')
    REPORT['pdfs'].append({'key': key, 'file': 'precision/'+pdfname, 'title': title+' · A3 정밀 출력 PDF',
        'pageMm': [420, 297], 'sheetPrintedMm': [240, 165], 'buildingPrintedMm': [144, 84],
        'scaleBarPrintedMm': 20, 'scale': '1:100', 'sha256': sha(p.read_bytes())})

for name in ('PLAN-BASE-01-door-result.png', 'PLAN-BASE-02-result.png'):
    shutil.copyfile(L05/'results'/name, L06/'inputs'/name)

REPORT['actualRasterFurnitureMeasurements'] = []
for file, center, width in [
    ('plans/PLAN-BASE-01.png', (1590, 690), 180),
    ('results/PLAN-BASE-01-result.png', (1590, 690), 270),
    ('results/PLAN-BASE-01-door-result.png', (1590, 690), 270),
    ('plans/PLAN-BASE-02.png', (1470, 680), 180),
    ('results/PLAN-BASE-02-result.png', (1470, 680), 270),
]:
    im = np.asarray(Image.open(L05/file).convert('RGB'))
    cx, cy = center
    a = im[cy-54:cy+54, cx-width//2-4:cx+width//2+4]
    yy, xx = np.where(np.min(a, axis=2) < 200)
    actual = [int(xx.max()-xx.min()+1), int(yy.max()-yy.min()+1)]
    assert actual == [width, 100], (file, actual)
    REPORT['actualRasterFurnitureMeasurements'].append({'file':file, 'darkInkBoundsPx':actual,
                                                        'dimensionsMm':[width*10,1000]})
im = np.asarray(Image.open(L05/'plans/PLAN-BASE-01.png').convert('RGB'))
yy, xx = np.where(np.min(im[560:710, 635:805], axis=2) < 200)
actual = [int(xx.max()-xx.min()+1), int(yy.max()-yy.min()+1)]
assert actual == [160,140], actual
REPORT['actualRasterFurnitureMeasurements'].append({'file':'plans/PLAN-BASE-01.png',
    'item':'work facing module', 'darkInkBoundsPx':actual, 'dimensionsMm':[1600,1400]})

# Manifest finalization is separate so that text/page updates can be completed first.
write_json(HERE/'FURNITURE-PIXEL-QA.json', REPORT)
print(json.dumps({'passed': True, 'patchedImages': len(REPORT['images']), 'outsideRoiChangedPixels': 0,
                  'precisionPdfs': len(REPORT['pdfs']), 'report': str(HERE/'FURNITURE-PIXEL-QA.json')}, ensure_ascii=False))
