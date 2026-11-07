"""Correct only the two furniture groups in the existing educational office plan.

The source PDF is an A3 vector drawing: 10 paper mm represents one model metre.
No existing wall, opening, label, stair or dimension operation is regenerated.
The PNG keeps every pixel outside the furniture and new dimension-note regions;
the clean-line JPEG keeps the same composition and intentional comparison labels.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, ContentStream, FloatObject, NameObject
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


# Existing PDF drawing coordinates are paper millimetres, top-down.
REPLACEMENTS = {
    (72, 83, 28, 12): (77, 85, 18, 8),
    (81, 96, 7.5, 6.5): (82.25, 95, 7.5, 6.5),
    (195, 155, 56, 21): (207, 159.5, 32, 12),
}
for index, old_x in enumerate((198, 211, 224, 237)):
    for old_y, new_y in ((148, 152.5), (178, 173)):
        REPLACEMENTS[(old_x, old_y, 8.5, 5.5)] = (
            207.5 + index * 8, new_y, 7, 5.5
        )
REGIONS = ((285, 329, 404, 414), (777, 589, 1007, 737))
NOTE_REGION = (65, 1039, 1615, 1064)
NOTE = ("축선 기준 최대 24×16m · 중심선 다각형 348㎡(약 105평) | "
        "소장 책상 1,800×800mm · 8인 테이블 3,200×1,200mm | 교육용 설정 · 실측/법정 면적 아님")
KOREAN_FONT = Path("C:/Windows/Fonts/malgun.ttf")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def correct_pdf(source: Path, destination: Path) -> dict:
    reader = PdfReader(source)
    page = reader.pages[0]
    stream = ContentStream(page.get_contents(), reader)
    before_text = page.extract_text()
    before_ops = [(list(values), operator) for values, operator in stream.operations]
    changed = []
    already_correct = 0
    for index, (values, operator) in enumerate(stream.operations):
        if operator != b"re":
            continue
        coords = tuple(float(value) for value in values)
        if coords in REPLACEMENTS:
            stream.operations[index] = (
                ArrayObject([FloatObject(value) for value in REPLACEMENTS[coords]]),
                operator,
            )
            changed.append(index)
        elif coords in REPLACEMENTS.values():
            already_correct += 1
    if len(changed) != 11 and not (not changed and already_correct == 11):
        raise RuntimeError(f"Unexpected furniture matches: {len(changed)}, corrected: {already_correct}")
    for index, operation in enumerate(stream.operations):
        if index not in changed:
            assert operation == before_ops[index], f"Non-furniture operation changed: {index}"
    page[NameObject("/Contents")] = stream
    if NOTE not in before_text:
        pdfmetrics.registerFont(TTFont("OfficeFurnitureNote", str(KOREAN_FONT)))
        buffer = io.BytesIO()
        overlay = canvas.Canvas(buffer, pagesize=(float(page.mediabox.width), float(page.mediabox.height)))
        overlay.setFont("OfficeFurnitureNote", 7.5)
        overlay.setFillColorRGB(0.15, 0.15, 0.15)
        overlay.drawString(18 * 72 / 25.4, float(page.mediabox.height) - 263 * 72 / 25.4, NOTE)
        overlay.save()
        page.merge_page(PdfReader(io.BytesIO(buffer.getvalue())).pages[0])
    writer = PdfWriter()
    writer.add_page(page)
    if reader.metadata:
        writer.add_metadata({str(key): str(value) for key, value in reader.metadata.items()})
    with destination.open("wb") as output:
        writer.write(output)
    reread = PdfReader(destination)
    final_text = reread.pages[0].extract_text()
    assert final_text.startswith(before_text), "Existing PDF text changed"
    assert NOTE in final_text, "Dimension annotation missing"
    return {"furnitureRectangleOperationsChanged": len(changed),
            "existingTextPreserved": True, "allOtherDrawingOperationsPreserved": True,
            "dimensionNoteAddedInExistingWhitespace": NOTE,
            "pageCount": len(reread.pages), "pageBox": list(map(float, page.mediabox))}


def patch_rasters(root: Path, rendered: Image.Image) -> None:
    original = root / "public/images/daejeon/lesson-07/comfy-reference-before.png"
    before = Image.open(original).convert("RGB")
    result = before.copy()
    for region in (*REGIONS, NOTE_REGION):
        result.paste(rendered.crop(region), region[:2])
    # Every PNG pixel outside the furniture and new note stays unchanged.
    outside_before, outside_after = before.copy(), result.copy()
    for region in (*REGIONS, NOTE_REGION):
        ImageDraw.Draw(outside_before).rectangle(region, fill="white")
        ImageDraw.Draw(outside_after).rectangle(region, fill="white")
    assert outside_before.tobytes() == outside_after.tobytes()
    result.save(original)
    result.save(root / "public/downloads/daejeon/lesson-08/00-office-floorplan-original.png")
    result.resize((3360, 2376), Image.Resampling.LANCZOS).save(
        root / "public/images/daejeon/lesson-07/comfy-reference-after-2x.png")

    clean_path = root / "public/images/daejeon/lesson-08/floorplan/01-clean-line.jpg"
    clean = Image.open(clean_path).convert("RGB")
    draw = ImageDraw.Draw(clean)
    for region in REGIONS:
        draw.rectangle(region, fill="white")
    # Antialias only the new furniture, leaving room names/doors/stairs untouched.
    for region, group in ((REGIONS[0], list(REPLACEMENTS.items())[:2]),
                          (REGIONS[1], list(REPLACEMENTS.items())[2:])):
        width, height = region[2] - region[0], region[3] - region[1]
        patch = Image.new("RGB", (width * 4, height * 4), "white")
        pd = ImageDraw.Draw(patch)
        for _old, (x, y, w, h) in group:
            box = tuple(round(value) for value in (
                (x * 4 - region[0]) * 4, (y * 4 - region[1]) * 4,
                ((x + w) * 4 - region[0]) * 4, ((y + h) * 4 - region[1]) * 4))
            is_table = (w, h) in ((18, 8), (32, 12))
            pd.rectangle(box, fill=(243, 243, 243) if is_table else "white",
                         outline=(143, 143, 143), width=3 if is_table else 2)
        clean.paste(patch.resize((width, height), Image.Resampling.LANCZOS), region[:2])
    note_patch = Image.new("RGB", ((NOTE_REGION[2]-NOTE_REGION[0])*4,
                                   (NOTE_REGION[3]-NOTE_REGION[1])*4), "white")
    ImageDraw.Draw(note_patch).text(((72-NOTE_REGION[0])*4, 1*4), NOTE,
                                   font=ImageFont.truetype(str(KOREAN_FONT), 42), fill=(38,38,38))
    clean.paste(note_patch.resize((NOTE_REGION[2]-NOTE_REGION[0], NOTE_REGION[3]-NOTE_REGION[1]),
                                 Image.Resampling.LANCZOS), NOTE_REGION[:2])
    encoded = io.BytesIO()
    clean.save(encoded, format="JPEG", quality=100, subsampling=0)
    for relative in ("public/images/daejeon/lesson-08/floorplan/01-clean-line.jpg",
                     "public/images/daejeon/lesson-07/floorplan/01-clean-line.jpg"):
        (root / relative).write_bytes(encoded.getvalue())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--pdftoppm", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    pdf = root / "public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf"
    pdf_bytes = pdf.read_bytes()
    # The temporary PDF lives alongside the requested report, never in asset folders.
    temporary = args.report.parent / "office-furniture-corrected.pdf"
    report = correct_pdf(pdf, temporary)
    process = subprocess.run([str(args.pdftoppm), "-singlefile", "-scale-to-x", "1680",
                              "-scale-to-y", "1188", "-png", str(temporary)],
                             check=True, capture_output=True)
    rendered = Image.open(io.BytesIO(process.stdout)).convert("RGB")
    assert rendered.size == (1680, 1188)
    patch_rasters(root, rendered)
    updated = temporary.read_bytes()
    for relative in ("public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf",
                     "public/downloads/daejeon/lesson-07/floorplan/DJ-L07-Office-Floorplan-Original.pdf"):
        (root / relative).write_bytes(updated)
    report.update({"beforePdfSha256": sha(pdf_bytes), "afterPdfSha256": sha(updated),
                   "originalPngSize": [1680, 1188], "enlargedPngSize": [3360, 2376],
                   "directorDeskMillimetres": [1800, 800],
                   "conferenceTableMillimetres": [3200, 1200], "conferenceChairs": 8,
                   "pngOutsideFurnitureAndDimensionNoteRegionsPixelIdentical": True,
                   "cleanLineIntentionalLabelsPreserved": ["이사실", "13연승"],
                   "threeDimensionalImagesRegenerated": False})
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
