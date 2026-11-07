"""제4차시 활성 통합 ZIP의 두 SHA 목록만 실제 패키지 범위에 맞춥니다.

이미지·프롬프트·README를 다시 만들지 않습니다. 내부 manifest는 일반 자료만
기술하며 자기 자신·SHA 목록·ZIP 컨테이너의 해시를 넣지 않습니다.
하위 manifest → 하위 SHA → 상위 manifest → 상위 SHA 순서로 의존성을 정리합니다.
구판 검수 ZIP 두 개는 역사자료로 보존합니다.
"""
from pathlib import Path, PurePosixPath
import argparse
import hashlib
import io
import json
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT/'review/daejeon/DJ-L04-EXTERIOR-PLAN/implementation-13'
APP = ROOT/'review/daejeon/DJ-L04-EXTERIOR-PLAN/application-05-techniques'
ZIP = APP/'DJ-L04-exterior-applications.zip'
ROOT_PREFIX = 'DJ-L04/'
APP_PREFIX = ROOT_PREFIX+'application/'
ROOT_SHA = ROOT_PREFIX+'SHA256SUMS.txt'
APP_SHA = APP_PREFIX+'SHA256SUMS.txt'
ROOT_MANIFEST = ROOT_PREFIX+'manifest.json'
APP_MANIFEST = APP_PREFIX+'manifest.json'
META = {ROOT_SHA, APP_SHA, ROOT_MANIFEST, APP_MANIFEST}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(data):
    return (json.dumps(data, ensure_ascii=False, indent=2)+'\n').encode('utf-8')


def assert_payload_only_manifest(obj):
    if isinstance(obj, dict):
        if 'file' in obj and 'sha256' in obj:
            assert PurePosixPath(obj['file']).name not in ('manifest.json', 'SHA256SUMS.txt'), obj['file']
            assert not obj['file'].lower().endswith('.zip'), obj['file']
        for value in obj.values():
            assert_payload_only_manifest(value)
    elif isinstance(obj, list):
        for value in obj:
            assert_payload_only_manifest(value)


def checksum_lines(members, prefix, excluded):
    rows = []
    for name in sorted(members):
        if name.startswith(prefix) and name not in excluded and not name.endswith('/'):
            assert not name.lower().endswith('.zip'), '내부 ZIP 컨테이너는 해시 범위에서 제외합니다.'
            rows.append(digest(members[name])+'  '+name[len(prefix):])
    return rows


def verify_table(members, table, prefix):
    expected = {name for name in members if name.startswith(prefix) and name != table and not name.endswith('/')}
    parsed = {}
    for line in members[table].decode('utf-8').splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        assert match, line
        relative = match[2]
        assert not relative.startswith('/') and '..' not in relative.split('/'), relative
        target = prefix+relative
        assert target not in parsed, target
        assert target in members, target
        assert digest(members[target]) == match[1], target
        parsed[target] = match[1]
    assert set(parsed) == expected, {'누락': sorted(expected-set(parsed)), '범위초과': sorted(set(parsed)-expected)}
    return len(parsed)


def main():
    parser = argparse.ArgumentParser(description='제4차시 SHA 목록과 활성 ZIP을 최소 범위로 동기화합니다.')
    parser.add_argument('--report-dir', required=True, help='검증 보고서를 기록할 작업 폴더')
    args = parser.parse_args()
    report_dir = Path(args.report_dir).resolve()
    report_dir.mkdir(parents=True, exist_ok=True)
    before_zip = ZIP.read_bytes()
    with zipfile.ZipFile(io.BytesIO(before_zip)) as archive:
        infos = archive.infolist()
        assert len({info.filename for info in infos}) == len(infos)
        members = {info.filename: archive.read(info) for info in infos}
    before_members = dict(members)
    old_metadata = {str(file.relative_to(ROOT)).replace('\\','/'): digest(file.read_bytes())
                    for file in (BASE/'manifest.json', BASE/'SHA256SUMS.txt', APP/'manifest.json', APP/'SHA256SUMS.txt')}

    # 활성 ZIP은 현재 제작 원본과 같은 manifest를 가져야 합니다.
    assert members[ROOT_MANIFEST] == (BASE/'manifest.json').read_bytes()
    assert members[APP_MANIFEST] == (APP/'manifest.json').read_bytes()
    base_manifest = json.loads(members[ROOT_MANIFEST])
    app_manifest = json.loads(members[APP_MANIFEST])
    for manifest in (base_manifest, app_manifest):
        assert_payload_only_manifest(manifest)

    app_manifest['checksumScope'] = {
        'file': 'SHA256SUMS.txt',
        'relativeTo': 'DJ-L04/application/',
        'description': '압축을 푼 application/ 하위 학생용 자료와 manifest.json을 검증합니다.',
        'selfHashExcluded': True,
        'containerZipExcluded': True,
        'manifestHashesOnlyPayload': True,
    }
    base_manifest['checksumScope'] = {
        'file': 'SHA256SUMS.txt',
        'relativeTo': 'DJ-L04/',
        'description': '압축을 푼 DJ-L04/ 전체 학생용 자료를 검증하며 application/SHA256SUMS.txt도 포함합니다.',
        'selfHashExcluded': True,
        'containerZipExcluded': True,
        'manifestHashesOnlyPayload': True,
        'dependencyOrder': ['application/manifest.json', 'application/SHA256SUMS.txt', 'manifest.json', 'SHA256SUMS.txt'],
    }
    members[APP_MANIFEST] = json_bytes(app_manifest)
    members[ROOT_MANIFEST] = json_bytes(base_manifest)
    app_header = ('# 범위: 압축 해제한 DJ-L04/application/ 하위 자료 전체. manifest.json 포함.\n'
                  '# 경로는 이 목록이 놓인 application/ 기준이며 이 목록 자체와 ZIP은 제외합니다.\n')
    members[APP_SHA] = (app_header+'\n'.join(checksum_lines(members, APP_PREFIX, {APP_SHA}))+'\n').encode('utf-8')
    root_header = ('# 범위: 압축 해제한 DJ-L04/ 전체 자료. application/SHA256SUMS.txt와 두 manifest.json 포함.\n'
                   '# 경로는 이 목록이 놓인 DJ-L04/ 기준이며 이 목록 자체와 ZIP은 제외합니다.\n')
    members[ROOT_SHA] = (root_header+'\n'.join(checksum_lines(members, ROOT_PREFIX, {ROOT_SHA}))+'\n').encode('utf-8')
    app_count = verify_table(members, APP_SHA, APP_PREFIX)
    root_count = verify_table(members, ROOT_SHA, ROOT_PREFIX)

    for name in members:
        if name not in META:
            assert members[name] == before_members[name], '기존 자료 바이트 변경: '+name
    assert len(members) == len(before_members)
    payload = {name: digest(data) for name, data in members.items() if name not in META}
    protected = {name: digest(data) for name, data in members.items()
                 if '/prompts/' in name or name.lower().endswith(('.png','.jpg','.jpeg','.webp','.svg'))}
    historical = [BASE/'DJ-L04_PRACTICE_REVIEW.zip', APP/'DJ-L04_FIVE_TECHNIQUES_REVIEW.zip']
    historical_hashes = {str(p.relative_to(ROOT)).replace('\\','/'): digest(p.read_bytes()) for p in historical}

    for file, name in [(BASE/'manifest.json', ROOT_MANIFEST), (BASE/'SHA256SUMS.txt', ROOT_SHA),
                       (APP/'manifest.json', APP_MANIFEST), (APP/'SHA256SUMS.txt', APP_SHA)]:
        file.write_bytes(members[name])
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for info in infos:
            archive.writestr(info, members[info.filename])
    new_zip = stream.getvalue()
    with zipfile.ZipFile(io.BytesIO(new_zip)) as archive:
        assert archive.testzip() is None
        assert archive.namelist() == [info.filename for info in infos]
        actual = {name: archive.read(name) for name in archive.namelist()}
        assert actual == members
        assert verify_table(actual, ROOT_SHA, ROOT_PREFIX) == root_count
        assert verify_table(actual, APP_SHA, APP_PREFIX) == app_count
    ZIP.write_bytes(new_zip)

    # 존재하는 공개 원본 사본만 갱신합니다. dist 산출물은 정식 빌드에서 갱신합니다.
    public_copies = []
    for src, relative in [(BASE/'manifest.json','manifest.json'), (BASE/'SHA256SUMS.txt','SHA256SUMS.txt'),
                          (APP/'manifest.json','application/manifest.json'),
                          (APP/'SHA256SUMS.txt','application/SHA256SUMS.txt'),
                          (ZIP,'application/DJ-L04-exterior-applications.zip')]:
        dest = ROOT/'public/practice/DJ-L04'/relative
        if dest.exists():
            shutil.copyfile(src, dest)
            public_copies.append(str(dest.relative_to(ROOT)).replace('\\','/'))

    for name, expected in historical_hashes.items():
        assert digest((ROOT/name).read_bytes()) == expected, name
    for manifest in (base_manifest, app_manifest):
        assert_payload_only_manifest(manifest)
    changed_members = sorted(name for name in members if members[name] != before_members[name])
    report = {
        'passed': True,
        '설명': '제4차시 활성 ZIP의 잘못된 주택 SHA 목록을 실제 제4차시 자료 목록으로 정정했습니다.',
        'archive': str(ZIP.relative_to(ROOT)).replace('\\','/'),
        'beforeSha256': digest(before_zip), 'sha256': digest(new_zip),
        'beforeBytes': len(before_zip), 'bytes': len(new_zip), 'members': len(members),
        'rootChecksumRows': root_count, 'applicationChecksumRows': app_count,
        'changedMembers': changed_members,
        'unchangedPayloadMembers': len(payload), 'unchangedImagesAndPrompts': len(protected),
        'payloadSha256': payload, 'protectedImagePromptSha256': protected,
        'metadataBeforeSha256': old_metadata,
        'historicalPackagesPreserved': historical_hashes,
        'publicCopiesUpdated': public_copies,
        '순환참조': '없음: 내부 manifest는 일반 자료만 해시합니다. 하위 SHA를 먼저 확정하고 상위 SHA가 하위 SHA를 검증합니다. 최종 ZIP 해시는 외부 배포 manifest가 담당합니다.',
    }
    (report_dir/'l04-sha-fix-report.json').write_bytes(json_bytes(report))
    print(json.dumps({key: report[key] for key in ('passed','archive','sha256','bytes','members','rootChecksumRows','applicationChecksumRows','unchangedPayloadMembers','unchangedImagesAndPrompts')}, ensure_ascii=False))


if __name__ == '__main__':
    main()
