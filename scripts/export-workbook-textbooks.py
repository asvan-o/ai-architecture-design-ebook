"""Finish a newly printed HTML textbook; never accepts a previous textbook.

The browser leaves real A4 margins. This appends text in those empty margins,
removes link annotations, and encrypts with a random owner key kept in scratch.
"""
import hashlib
import io
import json
import re
import secrets
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, ArrayObject
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
work = Path(config["workRoot"])
key = config["key"]
report_path = work / f"{key}-pdf-report.json"
report = {"key": key, "output": config["output"], "passed": False}


def normalized(text):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text).replace("\u00ad", ""))


def page_image(page, scale=1):
    bitmap = page.render(scale=scale)
    result = bitmap.to_pil().convert("RGB").copy()
    bitmap.close()
    return result


def font_inventory(reader):
    result = {}
    seen = set()

    def visit(resources):
        if resources is None:
            return
        resources = resources.get_object()
        for ref in resources.get("/Font", {}).values():
            font = ref.get_object()
            name = str(font.get("/BaseFont", ""))
            if font.get("/Subtype") == "/Type3":
                result[name or f"Type3-{getattr(ref, 'idnum', len(result))}"] = {"embedded": bool(font.get("/CharProcs")), "subset": True, "type": "Type3 embedded glyph programs"}
                continue
            for descendant in font.get("/DescendantFonts", [font]):
                item = descendant.get_object()
                descriptor = item.get("/FontDescriptor")
                if descriptor:
                    descriptor = descriptor.get_object()
                    result[name] = {"embedded": any(x in descriptor for x in ["/FontFile", "/FontFile2", "/FontFile3"]), "subset": "+" in name}
        for ref in resources.get("/XObject", {}).values():
            token = (getattr(ref, "idnum", None), getattr(ref, "generation", None))
            if token in seen:
                continue
            seen.add(token)
            obj = ref.get_object()
            if obj.get("/Subtype") == "/Form":
                visit(obj.get("/Resources"))

    for page in reader.pages:
        visit(page.get("/Resources"))
    return result


try:
    raw = Path(config["input"])
    assert raw.name == f"{key}-html.pdf", "Only freshly printed HTML input is accepted."
    doc = pdfium.PdfDocument(raw)
    # Chromium can emit an empty trailing sheet for a final block's margin.
    # Remove only a tail sheet with no text and no visible foreground artwork.
    retained = len(doc)
    while retained > 1:
        tail = doc[retained-1]
        tail_text = tail.get_textpage()
        empty_text = not tail_text.get_text_range().strip()
        tail_text.close()
        pixels = np.asarray(page_image(tail))
        foreground = float(np.mean(np.any(pixels < 190, axis=2)))
        tail.close()
        if not empty_text or foreground > .0001:
            break
        retained -= 1
    trimmed = len(doc) - retained
    if trimmed:
        doc.close()
        original_reader = PdfReader(raw)
        trimmed_writer = PdfWriter()
        for page in list(original_reader.pages)[:retained]:
            trimmed_writer.add_page(page)
        trimmed_file = work / f"{key}-html-trimmed.pdf"
        with trimmed_file.open("wb") as stream:
            trimmed_writer.write(stream)
        raw = trimmed_file
        doc = pdfium.PdfDocument(raw)
    report["blankTrailingSheetsRemoved"] = trimmed
    raw_pages = []
    all_body_text = []
    contacts = []
    evidence = work / "renders" / key
    evidence.mkdir(parents=True, exist_ok=True)
    assert evidence.resolve().is_relative_to(work.resolve())
    for previous_render in evidence.glob("*.png"):
        previous_render.unlink()
    for number in range(len(doc)):
        page = doc[number]
        width, height = page.get_size()
        assert abs(width - 595.28) < 1 and abs(height - 841.89) < 1, "A4 page size required."
        textpage = page.get_textpage()
        text = textpage.get_text_range()
        all_body_text.append(text)
        bounds = []
        for i in range(textpage.count_chars()):
            char = textpage.get_text_range(i, 1)
            if not char.strip():
                continue
            box = textpage.get_charbox(i)
            if box[2] > box[0] and box[3] > box[1]:
                bounds.append(box)
        assert bounds, f"Blank body page {number+1}"
        bottom = min(b[1] for b in bounds)
        top = max(b[3] for b in bounds)
        assert bottom >= 53, f"Body text enters footer margin on page {number+1}: {bottom} pt"
        assert top <= height - 45, f"Body text enters header margin on page {number+1}: {top} pt"
        im = page_image(page)
        pixels = np.asarray(im)
        footer_ink = int(np.sum(np.min(pixels[im.height - 45:im.height - 20, 35:im.width - 35], axis=2) < 190))
        header_ink = int(np.sum(np.min(pixels[18:42, 35:im.width - 35], axis=2) < 190))
        assert footer_ink == 0, f"Printed body/image collides with footer band on page {number+1}: {footer_ink} pixels"
        assert header_ink == 0, f"Printed body/image collides with header band on page {number+1}: {header_ink} pixels"
        raw_pages.append({"page": number+1, "bodyTextBottomPt": round(bottom, 2), "bodyTextTopPt": round(top, 2), "bodyCharacters": len(text), "footerCollisionPixels": footer_ink, "headerCollisionPixels": header_ink})
        textpage.close()
        page.close()
    doc.close()
    # PDFium represents a real line-ending hyphen as U+FFFE. The PDF's native
    # ToUnicode text extracted by pypdf retains the actual command character.
    native_pages = [page.extract_text() for page in PdfReader(raw).pages]
    full_body = normalized("\n".join(native_pages))
    orphan_markers = []
    for number, text in enumerate(native_pages):
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if lines and re.fullmatch(r"(?:PROMPT|STEP\s*\d+|Part\s*\d+\s*·?\s*\d*분?)", lines[-1]):
            orphan_markers.append({"page": number+1, "marker": lines[-1]})
    assert not orphan_markers, f"Orphan print marker at page end: {orphan_markers}"
    report["orphanMarkerPages"] = orphan_markers
    expected = config["body"]
    missing_headings = [h for h in expected["headings"] if normalized(h) not in full_body]
    missing_blocks = [b for b in expected["blocks"] if normalized(b["text"]) not in full_body]
    coverage = 1 - len(missing_blocks) / max(1, len(expected["blocks"]))
    report.update({"pageCount": len(raw_pages), "bodyPages": raw_pages, "headingCount": len(expected["headings"]), "missingHeadings": missing_headings, "bodyBlockCoverage": coverage, "missingBlocks": missing_blocks})
    assert not missing_headings, f"Missing print headings: {missing_headings[:5]}"
    assert not missing_blocks, f"Visible body block coverage {coverage:.2%}; missing {len(missing_blocks)}: {missing_blocks[:3]}"
    for address in config["expectedLocalAddresses"]:
        assert normalized(address) in full_body, f"Missing local connection address: {address}"

    pdfmetrics.registerFont(TTFont("WorkbookMalgun", config["fontFile"]))
    reader = PdfReader(raw)
    writer = PdfWriter()
    notice = config["copyrightNotice"]
    for index, page in enumerate(reader.pages):
        width, height = float(page.mediabox.width), float(page.mediabox.height)
        buffer = io.BytesIO()
        overlay = canvas.Canvas(buffer, pagesize=(width, height), invariant=1, initialFontName="WorkbookMalgun", initialFontSize=8)
        overlay.setFillColorRGB(.28, .34, .35)
        overlay.setFont("WorkbookMalgun", 8)
        label = "과정 개요" if key == "overview" else f"제{int(key)}차시"
        overlay.drawString(45.35433, height - 31, f"실무 워크북 · {label}")
        overlay.setStrokeColorRGB(.78, .81, .79)
        overlay.setLineWidth(.35)
        overlay.line(45.35433, height - 38, width - 45.35433, height - 38)
        overlay.setFont("WorkbookMalgun", 7)
        overlay.drawString(45.35433, 31, notice)
        overlay.drawRightString(width - 45.35433, 31, f"{index+1} / {len(reader.pages)}")
        overlay.save()
        buffer.seek(0)
        page.merge_page(PdfReader(buffer).pages[0], over=True)
        if "/Annots" in page:
            page[NameObject("/Annots")] = ArrayObject([a for a in page["/Annots"] if a.get_object().get("/Subtype") != "/Link"])
        writer.add_page(page)
    writer.metadata = None
    writer.add_metadata({"/Title": config["title"], "/Author": "OKS", "/Subject": "실무 워크북", "/Creator": "Workbook HTML textbook export"})
    for page in writer.pages:
        page.compress_content_streams()
    if hasattr(writer, "compress_identical_objects"):
        writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    clear = work / f"{key}-typeset.pdf"
    with clear.open("wb") as stream:
        writer.write(stream)
    clear_reader = PdfReader(clear)
    fonts = font_inventory(clear_reader)
    assert any("Malgun" in name and info["embedded"] and info["subset"] for name, info in fonts.items()), "Subset Malgun embedding required."
    assert all(info["embedded"] for info in fonts.values()), "Every text font must be embedded."
    private = work / "private"
    private.mkdir(exist_ok=True)
    owner_file = private / "textbook-owner-keys.json"
    keys = json.loads(owner_file.read_text(encoding="utf-8")) if owner_file.exists() else {}
    owner_password = secrets.token_urlsafe(40)
    keys[key] = {"ownerPassword": owner_password, "outputName": Path(config["output"]).name}
    owner_file.write_text(json.dumps(keys, indent=2), encoding="utf-8")
    final = PdfWriter(clone_from=clear_reader)
    final.encrypt(user_password=config["userPassword"], owner_password=owner_password, algorithm="AES-256")
    with Path(config["output"]).open("wb") as stream:
        final.write(stream)
    check = PdfReader(config["output"], password=config["userPassword"])
    assert check.is_encrypted
    encryption = check.trailer["/Encrypt"]
    assert int(encryption["/V"]) == 5 and int(encryption["/R"]) == 6 and int(encryption["/Length"]) == 256
    link_count = sum(a.get_object().get("/Subtype") == "/Link" for p in check.pages for a in p.get("/Annots", []))
    assert link_count == 0
    assert not any(key in check.metadata for key in ["/CreationDate", "/ModDate"])
    encrypted_doc = pdfium.PdfDocument(config["output"], password=config["userPassword"])
    copyright_pages = []
    plain_text = []
    for number in range(len(encrypted_doc)):
        page = encrypted_doc[number]
        textpage = page.get_textpage()
        text = textpage.get_text_range()
        plain_text.append(text)
        footer_text = textpage.get_text_bounded(left=40, bottom=20, right=page.get_size()[0]-40, top=45)
        assert normalized(notice) in normalized(footer_text), f"Copyright missing from page {number+1} footer"
        assert f"{number+1}/{len(encrypted_doc)}" in normalized(footer_text), f"Page number missing on page {number+1}"
        copyright_pages.append(number+1)
        im = page_image(page)
        thumb = im.resize((298, 421), Image.Resampling.LANCZOS)
        labeled = Image.new("RGB", (318, 447), "#e7e7e7")
        labeled.paste(thumb, (10, 20))
        ImageDraw.Draw(labeled).text((10, 3), f"{key} / {number+1}", fill="black")
        contacts.append(labeled)
        if number in {0, len(encrypted_doc)-1}:
            page_image(page, 1.5).save(evidence / f"page-{number+1:03d}.png")
        textpage.close()
        page.close()
    encrypted_doc.close()
    for start in range(0, len(contacts), 16):
        chunk = contacts[start:start+16]
        contact = Image.new("RGB", (318*4, 447*((len(chunk)+3)//4)), "#ccc")
        for i, im in enumerate(chunk):
            contact.paste(im, ((i%4)*318, (i//4)*447))
        contact.save(evidence / f"contact-{start//16+1:02d}.png")
    final_text = "\n".join(plain_text)
    assert not re.search(r"PDF\s*(?:기준일|업데이트)\s*[:·]?\s*20\d\d", final_text)
    for address in config["expectedLocalAddresses"]:
        assert normalized(address) in normalized(final_text)
    output = Path(config["output"])
    assert output.stat().st_size < 95_000_000, "Textbook exceeds 95 MB limit."
    report.update({"passed": True, "sizeBytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "encrypted": True, "encryption": "AES-256 R6", "linkAnnotations": link_count, "copyrightNoticePages": len(copyright_pages), "copyrightBaselinePt": 31, "fonts": fonts, "dateMetadata": False, "renderDirectory": str(evidence), "localAddressesPreserved": config["expectedLocalAddresses"], "textNativeCharacters": sum(len(t) for t in all_body_text)})
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
except Exception as exc:
    report["error"] = str(exc)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    raise
