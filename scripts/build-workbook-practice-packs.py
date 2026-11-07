"""Rebuild student practice bundles from the current approved source files."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CF = ROOT / 'review/daejeon/DJ-CF-02'
A = ROOT / 'review/daejeon/LESSON02_AUTOMATION_AB/student/A'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def entry(name, data):
    return {'file': name, 'bytes': len(data), 'sha256': sha(data)}


def dump(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def archive(target, prefix, members):
    """Stable member names and timestamps; manifests never include their own hash."""
    assert all(not Path(name).is_absolute() and '..' not in Path(name).parts for name in members)
    members = dict(sorted(members.items()))
    members['manifest.json'] = dump({'selfHashExcluded': True, 'files': [entry(n, b) for n, b in members.items()]})
    members['SHA256SUMS.txt'] = ''.join(sha(b) + '  ' + n + '\n' for n, b in sorted(members.items())).encode('utf-8')
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(members.items()):
            info = zipfile.ZipInfo(prefix + '/' + name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data, compresslevel=9)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        assert len(z.namelist()) == len(members)
        for name, data in members.items():
            assert z.read(prefix + '/' + name) == data
    return len(members)


def build():
    # Describe committed sources and current deliverables, not unrelated local QA logs.
    manifest_path = CF / 'DJ-CF-02_manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    tracked = subprocess.check_output(['git', 'ls-files', '--', 'review/daejeon/DJ-CF-02'], cwd=ROOT, encoding='utf-8').splitlines()
    names = {Path(n).relative_to('review/daejeon/DJ-CF-02').as_posix() for n in tracked}
    names.update(p.name for p in CF.iterdir() if p.is_file() and p.name != manifest_path.name and p.suffix != '.zip')
    names.update(['instructor/DJ-CF-02_generation-log.json', 'instructor/DJ-CF-02_generation-history-before-renewal.json', 'instructor/DJ-CF-02_visual-review.json'])
    historical_only = {'DJ-CF-02_site-diagram.png', 'instructor/DJ-CF-02_existing-view-01-generation-prompt.txt',
                       'instructor/DJ-CF-02_existing-view-02-generation-prompt.txt', 'source/DJ-CF-02_build.py'}
    names.difference_update(historical_only)
    manifest['historicalMetadataExcluded'] = sorted(historical_only)
    manifest['historicalMetadataNote'] = 'Original historical files are preserved; non-delivery raster and platform-dependent historical text byte hashes are excluded from this current package manifest.'
    manifest['entries'] = [entry(n, (CF / n).read_bytes()) for n in sorted(names) if n != manifest_path.name and (CF / n).is_file()]
    manifest['contentSyncNote'] = 'Current full-facade A/B examples and documents; original geometry, existing photographs and historical generation records preserved separately.'
    manifest_path.write_bytes(dump(manifest))

    js = "import {packages} from './scripts/daejeon-review-assets.mjs';console.log(JSON.stringify(packages.map(p=>({id:p.id,files:p.assets.map(a=>a.file)}))));"
    projects = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT, encoding='utf-8'))
    members = {'먼저읽기.txt': ('제1차시 의뢰서·작업 기준서·A/B 실습자료\n'
        '실습 A는 실내 카페, 실습 B는 상가 외관입니다. 하나를 선택해 진행합니다.\n'
        'RFP와 기준 도면으로 조건을 확인하고, 작업 기준서와 전략 2개를 프롬프트·결과 이미지에 연결합니다.\n'
        'CF02 A는 전체 라임스톤 계열과 입구 강조, B는 전체 트래버틴과 수평 루버·조명입니다.\n'
        '예시 이미지는 교육용 시각자료이며 정밀 치수·시공·성능·법규 적합성을 보증하지 않습니다.\n'
        'generation-prompt는 실제 제작 기록이며 학생용 완성 실행예시와 구분합니다.\n').encode('utf-8')}
    for p in projects:
        folder = ROOT / 'review/daejeon' / p['id']
        for name in p['files']:
            source = folder / ('instructor' if p['id'] == 'DJ-CF-02' and name.endswith('-generation-prompt.txt') else '') / name
            members[p['id'] + '/' + name] = source.read_bytes()
    target = ROOT / 'review/daejeon/DJ-L01-RFP-BRIEF/DJ-L01-rfp-and-brief.zip'
    count = archive(target, 'DJ-L01-rfp-and-brief', members)
    (target.parent / 'manifest.json').write_bytes(dump({'selfHashExcluded': True, 'members': count, 'files': [entry(target.name, target.read_bytes())]}))

    student_names = [f'DJ-L02_STEP_0{i}.txt' for i in range(1, 5)] + ['DJ-L02_INTEGRATED_PROMPT.txt', 'DJ-L02_VIBE_CODING_README.txt']
    members = {name: (A / name).read_bytes() for name in student_names}
    for name in ['DJ-L02_FILE_SORTER_PROGRAM.zip', 'DJ-L02_SORT_TEST.zip', 'DJ-L02_FILE_SORTER_README.txt']:
        members['실행예제/' + name] = (ROOT / 'review/daejeon/FILE_SORTER_STUDENT' / name).read_bytes()
    target = A / 'DJ-L02_VIBE_CODING_PRACTICE.zip'
    count_a = archive(target, 'DJ-L02-Vibe-Coding', members)
    download = json.loads((A / 'download-manifest.json').read_text(encoding='utf-8-sig'))
    names = {e['file'] for e in download['files']} | set(student_names) | {target.name}
    download['files'] = [entry(n, (A / n).read_bytes()) for n in sorted(names) if (A / n).is_file()]
    download['practiceFlow'] = 'Step 1~4 and one integrated prompt; the original verified program/test ZIPs are byte-identical.'
    (A / 'download-manifest.json').write_bytes(dump(download))
    print(json.dumps({'passed': True, 'lesson01Members': count, 'lesson02Members': count_a, 'programRuntimeChanged': False}))


if __name__ == '__main__':
    build()
