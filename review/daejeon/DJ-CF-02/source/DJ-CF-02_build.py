"""Reproduce CF-02 geometry/raster intermediates in an isolated output directory."""
from pathlib import Path
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile


def find_repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if ((candidate / 'package.json').is_file()
                and (candidate / 'src/lib/lesson02-ebook.ts').is_file()
                and (candidate / 'data/courses').is_dir()):
            return candidate
    raise FileNotFoundError(
        f'Repository root not found above {start}: expected package.json, '
        'src/lib/lesson02-ebook.ts and data/courses')


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-root', type=Path)
args = parser.parse_args()
repo = find_repo_root(Path(__file__).resolve())
source = Path(__file__).resolve().parent
package = source.parent
output = args.output_root.resolve() if args.output_root else Path(tempfile.mkdtemp(prefix='DJ-CF-02-intermediates-'))
if output == repo or repo in output.parents:
    raise ValueError('--output-root must be outside the repository to protect approved assets')
output.mkdir(parents=True, exist_ok=True)
for relative in ['source/DJ-CF-02_content.json', 'source/DJ-CF-02_building-camera.json',
                 'DJ-CF-02_existing-elevation.svg', 'DJ-CF-02_site-diagram.svg']:
    if not (package / relative).is_file():
        raise FileNotFoundError(f'Missing committed CF-02 input: {relative}')
node = shutil.which('node')
if not node:
    raise FileNotFoundError('Node.js is required for the raster stage')
environment = {**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'}
steps = []


def run_stage(label, command):
    print(f'[CF-02] {label}', flush=True)
    result = subprocess.run(command, cwd=repo, env=environment)
    if result.returncode:
        raise RuntimeError(f'CF-02 {label} failed, exit {result.returncode}')
    steps.append(label)


run_stage('repository-local input check', [sys.executable, '-B', str(source / 'DJ-CF-02_content.py'), '--check-inputs'])
run_stage('geometry', [sys.executable, '-B', str(source / 'DJ-CF-02_geometry.py'), '--output-root', str(output)])
for number in ['01', '02']:
    expected = output / 'instructor' / f'DJ-CF-02_whitebox-{number}.svg'
    if not expected.is_file():
        raise FileNotFoundError(f'Geometry did not create {expected.name}; raster cannot start')
run_stage('raster', [node, str(source / 'DJ-CF-02_raster.mjs'), '--output-root', str(output)])
from PIL import Image
images = {}
for relative, dimensions in [
    ('DJ-CF-02_existing-elevation.png', (3360, 2376)),
    ('DJ-CF-02_site-diagram.png', (1400, 1000)),
    ('instructor/DJ-CF-02_whitebox-01.png', (1536, 1024)),
    ('instructor/DJ-CF-02_whitebox-02.png', (1536, 1024)),
]:
    with Image.open(output / relative) as image:
        image.load()
        if image.size != dimensions:
            raise ValueError(f'Unexpected raster dimensions: {relative}: {image.size}')
        images[relative] = list(image.size)
report = {'repositoryRoot': str(repo), 'outputRoot': str(output), 'steps': steps,
          'intermediateImages': images, 'pdfGeneration': False,
          'approvedPackageAssetsWritten': False}
(output / 'DJ-CF-02_build-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False), flush=True)
