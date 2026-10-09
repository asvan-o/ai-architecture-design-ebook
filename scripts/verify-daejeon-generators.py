"""Validate local generator inputs and isolated intermediates without editing assets."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile


def find_repo_root(start):
    for candidate in (start, *start.parents):
        if ((candidate / 'package.json').is_file()
                and (candidate / 'src/lib/lesson02-ebook.ts').is_file()
                and (candidate / 'data/courses').is_dir()):
            return candidate
    raise FileNotFoundError('Expected package.json, src/lib/lesson02-ebook.ts and data/courses above validator')


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--require-clean', action='store_true')
parser.add_argument('--report', type=Path)
args = parser.parse_args()
root = find_repo_root(Path(__file__).resolve())
environment = {**os.environ, 'GIT_OPTIONAL_LOCKS': '0', 'PYTHONDONTWRITEBYTECODE': '1'}


def git(*arguments):
    return subprocess.check_output(['git', *arguments], cwd=root, env=environment)


initial_status = git('status', '--short', '--untracked-files=all')
if args.require_clean:
    if initial_status:
        raise RuntimeError('Generator validation requires a clean checkout')
    if (root.parent / 'gwangju').exists():
        raise RuntimeError('Clean validation must not have a sibling gwangju directory')
names = set(git('ls-files', '-z').decode().split('\0')) | set(git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0'))
names.discard('')
before = {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in names if (root / name).is_file()}
source_blob = git('show', 'HEAD:src/lib/lesson02-ebook.ts')
approved_blob = git('show', 'cdc99d788b9506344872c865730cd9cf002f16ec:src/lib/lesson02-ebook.ts')
if source_blob != approved_blob:
    raise RuntimeError('Gwangju lesson02 source Git blob differs from the approved commit; no generation performed')
work_text = (root / 'src/lib/lesson02-ebook.ts').read_text(encoding='utf-8')
if work_text != source_blob.decode('utf-8').replace('\r\n', '\n').replace('\r', '\n'):
    raise RuntimeError('Working lesson02 source differs beyond line endings')
temporary = Path(tempfile.mkdtemp(prefix='daejeon-generators-check-'))
cf1 = root / 'review/daejeon/DJ-CF-01/source'
cf2 = root / 'review/daejeon/DJ-CF-02/source'
guard = r'''
import os, pathlib, runpy, sys
repo=pathlib.Path(sys.argv[1]).resolve()
target=pathlib.Path(sys.argv[2]).resolve()
script=sys.argv[3]
def audit(event, arguments):
    if event != 'open' or not isinstance(arguments[0],(str,bytes,os.PathLike)):return
    path=pathlib.Path(os.fsdecode(arguments[0])).resolve()
    mode=arguments[1]
    if isinstance(mode,str) and any(flag in mode for flag in 'wax+'):return
    if path.suffix.lower() not in {'.ts','.json','.svg','.md','.txt','.pdf','.png','.jpg','.jpeg'}:return
    if not (path.is_relative_to(repo) or path.is_relative_to(target)):
        raise RuntimeError('External project input read rejected: '+str(path))
sys.addaudithook(audit)
sys.argv=sys.argv[3:]
runpy.run_path(script,run_name='__main__')
'''


def guarded(script, target, *arguments):
    result = subprocess.run([sys.executable, '-B', '-c', guard, str(root), str(target), str(script), *arguments],
                            cwd=root, env=environment, capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise RuntimeError(f'Generator input validation failed: {script.name}\n{result.stdout}\n{result.stderr}')
    return result.stdout


probe = json.loads(guarded(cf2 / 'DJ-CF-02_content.py', temporary, '--check-inputs').splitlines()[-1])
if Path(probe['source']) != root / 'src/lib/lesson02-ebook.ts':
    raise RuntimeError('CF-02 content did not use the current checkout')
protected = temporary / 'cf01'
guarded(cf1 / 'DJ-CF-01_build.py', temporary, 'baseline', '--output-root', str(protected))
guarded(cf1 / 'DJ-CF-01_build.py', temporary, 'verify', '--output-root', str(protected))
result = subprocess.run([sys.executable, '-B', str(cf2 / 'DJ-CF-02_build.py'), '--output-root', str(temporary / 'cf02')],
                        cwd=root, env=environment, capture_output=True, text=True, encoding='utf-8')
if result.returncode:
    raise RuntimeError(f'CF-02 staged pipeline failed\n{result.stdout}\n{result.stderr}')
pipeline = json.loads((temporary / 'cf02/DJ-CF-02_build-report.json').read_text(encoding='utf-8'))
if pipeline['steps'] != ['repository-local input check', 'geometry', 'raster']:
    raise RuntimeError('Unexpected generator stage order')
canonical_geometry = json.loads((cf2 / 'DJ-CF-02_building-camera.json').read_text(encoding='utf-8'))
produced_geometry = json.loads((temporary / 'cf02/source/DJ-CF-02_building-camera.json').read_text(encoding='utf-8'))
if canonical_geometry != produced_geometry:
    raise RuntimeError('Geometry/camera conditions changed in temporary output')
for script in [cf1 / 'DJ-CF-01_build.py', cf1 / 'DJ-CF-01_render.mjs', cf2 / 'DJ-CF-02_content.py']:
    text = script.read_text(encoding='utf-8')
    if "parent/'gwangju'" in text or "parent / 'gwangju'" in text or "REPO.parent/'gwangju'" in text:
        raise RuntimeError('Sibling source dependency remains: '+script.name)
changed = [name for name, sha in before.items() if not (root / name).is_file() or hashlib.sha256((root / name).read_bytes()).hexdigest() != sha]
if changed or git('status', '--short', '--untracked-files=all') != initial_status:
    raise RuntimeError('Generator altered checkout files or Git status: '+str(changed))
report = {'passed': True, 'repositoryRoot': str(root), 'temporaryOutput': str(temporary),
          'gitBlobSha256': hashlib.sha256(source_blob).hexdigest(), 'approvedBlobMatches': True,
          'contentSource': probe['sourceRelative'], 'externalProjectInputReads': 0,
          'siblingGwangjuRequired': False, 'cf01Protection': True, 'pipeline': pipeline,
          'geometryCameraUnchanged': True, 'filesByteUnchanged': len(before),
          'checkoutStatusUnchanged': True, 'pdfGeneration': False}
if args.report:
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
