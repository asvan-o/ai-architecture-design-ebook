"""Run the recorded furniture correction in a separate, disposable output tree.

This entry point never writes into the repository's active public asset folders.
The drawing functions are the exact script used during the authorized correction.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys


def main() -> None:
    package = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=package / "reproduction-output")
    parser.add_argument("--pdftoppm", type=Path)
    args = parser.parse_args()
    output = args.output_dir.resolve()
    repository = next(parent for parent in package.parents if (parent / "package.json").is_file())
    if output == repository or output == package or repository / "public" == output or (repository / "public") in output.parents:
        raise SystemExit("Refusing to use the active repository or public tree as output.")
    if output.exists():
        raise SystemExit("Output already exists. Choose a new --output-dir; existing files are never overwritten.")
    pdftoppm = args.pdftoppm
    if pdftoppm is None:
        detected = shutil.which("pdftoppm")
        pdftoppm = Path(detected) if detected else Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe"
    if not pdftoppm.is_file():
        raise SystemExit("Pass an installed Poppler executable with --pdftoppm.")
    provenance = json.loads((package / "furniture-rectangles.json").read_text(encoding="utf-8"))
    for record in provenance["baselineFiles"]:
        source = package / record["file"]
        if hashlib.sha256(source.read_bytes()).hexdigest() != record["sha256"]:
            raise SystemExit("Baseline checksum mismatch: " + record["file"])
    for folder in ("public/downloads/daejeon/lesson-08", "public/downloads/daejeon/lesson-07/floorplan",
                   "public/images/daejeon/lesson-07", "public/images/daejeon/lesson-07/floorplan",
                   "public/images/daejeon/lesson-08/floorplan"):
        (output / folder).mkdir(parents=True, exist_ok=False)
    shutil.copyfile(package / "baseline/original.pdf", output / "public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf")
    shutil.copyfile(package / "baseline/original.png", output / "public/images/daejeon/lesson-07/comfy-reference-before.png")
    shutil.copyfile(package / "baseline/clean-line.jpg", output / "public/images/daejeon/lesson-08/floorplan/01-clean-line.jpg")
    shutil.copyfile(package / "office-geometry.json", output / "public/downloads/daejeon/lesson-08/office-geometry.json")
    subprocess.run([sys.executable, str(package / "executed-generator.py"), "--root", str(output),
                    "--pdftoppm", str(pdftoppm.resolve()), "--report", str(output / "reproduction-report.json")],
                   check=True)
    print("Reproduced into isolated output only: " + str(output))


if __name__ == "__main__":
    main()
