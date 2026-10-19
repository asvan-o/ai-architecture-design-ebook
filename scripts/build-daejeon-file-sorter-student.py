from pathlib import Path
import json,zipfile,hashlib,datetime
root=Path.cwd()
source=root/'review/daejeon/AI_파일자동정리'
tests=root/'review/daejeon/SORT_TEST'
out=root/'review/daejeon/FILE_SORTER_STUDENT'
out.mkdir(parents=True,exist_ok=True)
sha=lambda data:hashlib.sha256(data).hexdigest()
core=['START.bat','STOP.bat','README.txt','package.json','data/registry.json','data/log.json']
core += [p.relative_to(source).as_posix() for p in sorted((source/'app').rglob('*')) if p.is_file()]
assert json.loads((source/'data/registry.json').read_text())['records']==[]
assert json.loads((source/'data/log.json').read_text())['events']==[]
dirs=['00_수집함','00_원본보관','01_CAD도면','02_BIM건축모델','03_레퍼런스','04_이미지결과','05_3D모델','06_포인트클라우드','07_문서','08_영상','09_데이터','10_압축파일','11_디자인소스','99_분류확인','data/staging']
manifest={'kind':'Windows educational local file sorter','contentStatus':'design-pending','minimumNodeVersion':'22.23.2','verifiedNodeVersion':'22.23.2','nodeRuntimeIncluded':False,'externalDependencies':[],'selfHashExcluded':True,'emptyDirectories':dirs,'files':[{'file':name,'bytes':(source/name).stat().st_size,'sha256':sha((source/name).read_bytes())} for name in core]}
programZip=out/'DJ-L02_FILE_SORTER_PROGRAM.zip'
with zipfile.ZipFile(programZip,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for name in ['AI_파일자동정리/']+['AI_파일자동정리/'+d+'/' for d in dirs]:z.writestr(name,b'')
    for name in core:z.write(source/name,'AI_파일자동정리/'+name)
    z.writestr('AI_파일자동정리/manifest.json',(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode())
original=json.loads((tests/'manifest.json').read_text(encoding='utf-8'))
testManifest={'kind':'filename classification practice files','contentStatus':'design-pending','selfHashExcluded':True,'files':[{'file':row['file'],'type':row['type'],'description':row['description'],'bytes':row['bytes'],'sha256':row['sha256'],'expectedFolder':row['expectedFolder']} for row in original['files']]}
testReadme='SORT_TEST · 수강생 실습파일\n\n실습파일 11개만 00_수집함에 복사합니다.\nREADME.txt와 manifest.json은 투입하지 않습니다.\n\n'+'\n'.join(row['file']+' → '+row['expectedFolder']+'\n  '+row['description'] for row in testManifest['files'])+'\n\n.blend/.abc는 classification test stub이며 실제 모델/애니메이션 캐시가 아닙니다.\nlighting_ref_3000K.jpg는 파일명 분류 시험용이며 실제 3000K 측정·보증 자료가 아닙니다.\n'
testZip=out/'DJ-L02_SORT_TEST.zip'
with zipfile.ZipFile(testZip,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    z.writestr('SORT_TEST/',b'')
    for row in testManifest['files']:
        data=(tests/row['file']).read_bytes()
        assert sha(data)==row['sha256']
        z.writestr('SORT_TEST/'+row['file'],data)
    z.writestr('SORT_TEST/README.txt',testReadme.encode())
    z.writestr('SORT_TEST/manifest.json',(json.dumps(testManifest,ensure_ascii=False,indent=2)+'\n').encode())
(out/'DJ-L02_FILE_SORTER_README.txt').write_bytes((source/'README.txt').read_bytes())
packages=[]
for p in [programZip,testZip,out/'DJ-L02_FILE_SORTER_README.txt']:packages.append({'file':p.name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
for p in [programZip,testZip]:
    with zipfile.ZipFile(p) as z:
        assert z.testzip() is None
        entries=z.namelist()
        assert all(not n.startswith('/') and '..' not in Path(n).parts for n in entries)
        assert not any(n.endswith(('runtime.json','instance.lock','server-output.log','_audit.cjs')) or 'FILE_SORTER_VALIDATION' in n or '/node_modules/' in n for n in entries)
        for n in entries:
            if not n.endswith('/') and Path(n).suffix in ['.txt','.json','.js','.html','.css','.bat']:
                data=z.read(n)
                assert b'C:\\Users\\deric' not in data and b'C:/Users/deric' not in data and b'AI_Lecture_Architecture' not in data
        pkgManifest=json.loads(z.read(entries[0].split('/')[0]+'/manifest.json'))
        for row in pkgManifest['files']:
            prefix='AI_파일자동정리/' if p==programZip else 'SORT_TEST/'
            assert sha(z.read(prefix+row['file']))==row['sha256']
combined={'contentStatus':'design-pending','generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nodeRuntimeIncluded':False,'verifiedNodeVersion':'22.23.2','selfHashExcluded':True,'files':packages}
(out/'DJ-L02_FILE_SORTER_MANIFEST.json').write_text(json.dumps(combined,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sourceFiles=sorted(p for p in source.rglob('*') if p.is_file() and p.name!='manifest.json')
sourceManifest={'status':'review/draft','contentStatus':'design-pending','minimumNodeVersion':'22.23.2','nodeRuntimeIncluded':False,'selfHashExcluded':True,'files':[{'file':p.relative_to(source).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in sourceFiles]}
(source/'manifest.json').write_text(json.dumps(sourceManifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'passed':True,'packages':packages,'programFiles':len(core)+1,'testFiles':len(testManifest['files']),'testZipFiles':13},ensure_ascii=True))
