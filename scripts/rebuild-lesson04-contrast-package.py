"""Synchronize the active L04 practice ZIP with its current teaching assets."""
from pathlib import Path
import argparse
import hashlib
import io
import json
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]
L04 = ROOT / 'review/daejeon/DJ-L04-EXTERIOR-PLAN'
BASE = L04 / 'implementation-13'
APP = L04 / 'application-05-techniques'
ZIP = APP / 'DJ-L04-exterior-applications.zip'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def refresh(value, folder):
    if isinstance(value, list):
        for item in value:
            refresh(item, folder)
    elif isinstance(value, dict):
        if 'file' in value and 'sha256' in value:
            file = folder / value['file']
            if not file.is_file():
                file = next((other / value['file'] for other in [BASE, APP] if (other / value['file']).is_file()), file)
            assert file.is_file(), file
            assert file.name not in ('manifest.json', 'SHA256SUMS.txt') and file.suffix != '.zip', file
            b = file.read_bytes()
            value['sha256'] = sha(b)
            value['bytes'] = len(b)
            if 'sizeBytes' in value:
                value['sizeBytes'] = len(b)
            if b[:8] == b'\x89PNG\r\n\x1a\n':
                width, height = struct.unpack('>II', b[16:24])
                if 'width' in value:
                    value['width'] = width
                if 'height' in value:
                    value['height'] = height
        for child in value.values():
            refresh(child, folder)


def source_for(name):
    assert name.startswith('DJ-L04/') and '..' not in name.split('/'), name
    relative = name[len('DJ-L04/'):]
    return APP / relative[len('application/'):] if relative.startswith('application/') else BASE / relative


def table(members, prefix, self_name):
    if prefix == 'DJ-L04/application/':
        header = ('# 범위: 압축 해제한 DJ-L04/application/ 하위 자료 전체. manifest.json 포함.\n'
                  '# 경로는 이 목록이 놓인 application/ 기준이며 이 목록 자체와 ZIP은 제외합니다.\n')
    else:
        assert prefix == 'DJ-L04/'
        header = ('# 범위: 압축 해제한 DJ-L04/ 전체 자료. application/SHA256SUMS.txt와 두 manifest.json 포함.\n'
                  '# 경로는 이 목록이 놓인 DJ-L04/ 기준이며 이 목록 자체와 ZIP은 제외합니다.\n')
    return (header + ''.join(sha(b) + '  ' + n[len(prefix):] + '\n'
                            for n, b in sorted(members.items()) if n.startswith(prefix) and n != self_name and not n.endswith('/'))).encode('utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report-dir', required=True, type=Path)
    args = parser.parse_args()
    args.report_dir.mkdir(parents=True, exist_ok=True)
    old = ZIP.read_bytes()
    with zipfile.ZipFile(io.BytesIO(old)) as z:
        infos = z.infolist()
        assert len({i.filename for i in infos}) == len(infos)
    for folder in [BASE, APP]:
        p = folder / 'manifest.json'
        m = json.loads(p.read_text(encoding='utf-8-sig'))
        refresh(m, folder)
        p.write_bytes(json_bytes(m))
    meta = {'DJ-L04/manifest.json', 'DJ-L04/SHA256SUMS.txt', 'DJ-L04/application/manifest.json', 'DJ-L04/application/SHA256SUMS.txt'}
    members = {}
    for info in infos:
        if info.is_dir():
            members[info.filename] = b''
        elif info.filename not in meta:
            members[info.filename] = source_for(info.filename).read_bytes()
    members['DJ-L04/application/manifest.json'] = (APP / 'manifest.json').read_bytes()
    members['DJ-L04/application/SHA256SUMS.txt'] = table(members, 'DJ-L04/application/', 'DJ-L04/application/SHA256SUMS.txt')
    members['DJ-L04/manifest.json'] = (BASE / 'manifest.json').read_bytes()
    members['DJ-L04/SHA256SUMS.txt'] = table(members, 'DJ-L04/', 'DJ-L04/SHA256SUMS.txt')
    assert set(members) == {i.filename for i in infos}
    (APP / 'SHA256SUMS.txt').write_bytes(members['DJ-L04/application/SHA256SUMS.txt'])
    (BASE / 'SHA256SUMS.txt').write_bytes(members['DJ-L04/SHA256SUMS.txt'])
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for info in infos:
            z.writestr(info, members[info.filename])
    data = stream.getvalue()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        assert z.testzip() is None
        for name, b in members.items():
            assert z.read(name) == b, name
        for prefix in ['DJ-L04/', 'DJ-L04/application/']:
            name = prefix + 'SHA256SUMS.txt'
            listed = {}
            for line in members[name].decode('utf-8').splitlines():
                if not line.strip() or line.startswith('#'):
                    continue
                digest, relative = line.split('  ', 1)
                assert prefix + relative in members and sha(members[prefix + relative]) == digest, relative
                listed[prefix + relative] = digest
            expected = {n for n in members if n.startswith(prefix) and n != name and not n.endswith('/')}
            assert set(listed) == expected
    ZIP.write_bytes(data)
    copied = []
    for name, b in members.items():
        if name.endswith('/'):
            continue
        for public_root in [ROOT/'public/practice/DJ-L04', ROOT/'public/courses/daejeon/lessons/04']:
            destination = public_root / name[len('DJ-L04/'):]
            if destination.is_file():
                destination.write_bytes(b)
                copied.append(destination.relative_to(ROOT).as_posix())
    result = {'passed': True, 'archive': ZIP.relative_to(ROOT).as_posix(), 'members': len(members),
              'bytes': len(data), 'sha256': sha(data), 'beforeSha256': sha(old), 'allArchiveMetadataClean': True,
              'publicCopiesUpdated': copied, 'toolRecordsIncludedInStudentZip': False}
    (args.report_dir/'l04-package-report.json').write_bytes(json_bytes(result))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
