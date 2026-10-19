import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = process.cwd();
const source = path.join(root, 'review/daejeon/AI_파일자동정리');
const output = path.join(root, 'review/daejeon/LESSON02_AUTOMATION_AB');
const student = path.join(output, 'student/A');
const instructor = path.join(output, 'instructor/A');
const overlays = path.join(instructor, 'distribution-overrides');
const sha = data => createHash('sha256').update(data).digest('hex');
fs.mkdirSync(student, { recursive: true });
fs.mkdirSync(path.join(overlays, 'app/ui'), { recursive: true });
const write = (dir, file, text) => fs.writeFileSync(path.join(dir, file), text.trimEnd() + '\n');
const lessonSource = fs.readFileSync(path.join(root, 'src/draft/content/daejeon-lesson02.ts'), 'utf8');
const compiled = ts.transpileModule(lessonSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const prompts = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const importAddendum=`

[파일 입력 방법 보완]
기존처럼 00_수집함에 직접 넣는 방법을 유지합니다.
추가로 사용자가 명시적으로 선택하거나 입력한 자료 폴더의 최상위 일반 파일을 읽기 전용으로 확인하고,
목록·용량을 보여준 뒤 “파일 가져오기”를 눌렀을 때만 수집함으로 복사합니다.
외부 원본은 삭제·이동·이름 변경·덮어쓰기하지 않습니다. 하위 폴더·링크·임시파일은 가져오지 않습니다.
복사된 파일은 기존 WATCHER → CLASSIFIER → 사람판단 → 원본보관·버전·SHA 중복 흐름을 재사용합니다.
새 분류기나 새 중복 정책을 만들지 않습니다. 외부 폴더는 읽기만, 쓰기는 프로그램 폴더 안에서만 허용합니다.
Windows의 실제 폴더 선택창과 경로 입력을 제공하고, 한 파일 오류가 다른 파일 가져오기를 중단하지 않게 합니다.
사용자 홈·드라이브·AppData 전체 검색, Registry 변경, 외부 업로드를 하지 않습니다.
직접 입력/가져오기, 원본 이름·수·SHA 불변, 중복, 같은 이름 다른 내용, 오류·빈 폴더를 확인합니다.`;
write(student, 'A_FIRST_REQUEST.txt', prompts.planPrompt+importAddendum+'\n아직 구현하지 말고 이 입력 방식까지 포함한 구조부터 설명해 주세요.');
const originalScope='프로그램 루트 밖 사용자 파일에 접근·검색·변경하지 않습니다.';
assert(prompts.approvalPrompt.includes(originalScope));
write(student, 'A_IMPLEMENTATION_APPROVAL.txt', prompts.approvalPrompt.replace(originalScope,'외부 원본 폴더는 사용자가 명시적으로 선택한 최상위 일반 파일에 한해 읽기와 복사만 허용합니다. 다른 외부 경로 검색·원본 변경은 금지합니다.')+importAddendum);
write(student, 'A_STRUCTURE_CHECKLIST.txt', `파일 정리 자동화 · 구현 전 구조 확인

□ 작업할 AI_파일자동정리 폴더를 연결하고 현재 경로를 확인했나요?
□ 직접 넣기와 명시적으로 선택한 외부 폴더 가져오기가 모두 00_수집함을 사용하나요?
□ 외부 원본은 읽기만 허용하고 최상위 일반 파일만 복사하나요?
□ INPUT → WATCHER → CLASSIFIER → DECISION → FILE MANAGER → DATA → UI의 역할이 구분되나요?
□ 명확한 확장자는 자동분류하고, 모호한 파일은 파일명 규칙 또는 사람 확인으로 이어지나요?
□ 원본보관, 동일 내용 중복 안내, 같은 이름의 덮어쓰기 방지가 있나요?
□ START / STOP은 이 프로그램만 실행·종료하나요?
□ 포트 충돌·파일 처리 실패를 성공처럼 표시하지 않나요?
□ SORT_TEST 11개의 기대 결과와 수동분류·중복·버전 증가 확인 방법이 있나요?
□ 선택하지 않은 외부 폴더 검색·원본 변경·외부 전송이 없나요?

확인한 내용을 구현 승인 Prompt의 빈칸에 적은 뒤 구현을 요청합니다.`);
let readme = fs.readFileSync(path.join(source, 'README.txt'), 'utf8');
readme = readme.replace('자동 파일정리 프로그램 · 수강생 사용방법', '파일 정리 자동화 · 수강생 사용방법')
  .replace('본 자료는 design-pending 과정의 교육용 자료이며 정식 공개 release는 아닙니다.\n', '')
  .replace('classification test stub입니다.', '파일명 분류 시험용 stub(형식만 빌린 예제 파일)입니다.');
write(student, 'A_README.txt', readme);
write(overlays, 'README.txt', readme);
write(student, 'A_KNOWN_LIMITS.txt', `파일 정리 자동화 · 알려진 한계

- Windows 교육용 로컬 프로그램이며 Node.js 실행환경이 필요합니다. 이번 검증 환경은 Node.js 22.23.2입니다.
- 확장자와 파일명 규칙으로 분류합니다. 파일 내부 의미를 분석하는 AI가 아닙니다.
- 파일 상태가 약 2초 동안 안정된 것을 복사 완료로 추정합니다. 큰 파일은 복사가 끝난 뒤 넣습니다.
- 애매한 파일은 99_분류확인에서 사람이 선택합니다. 하위 폴더와 링크는 처리하지 않습니다.
- 외부 가져오기는 명시적으로 선택한 일반 폴더의 최상위 파일만 읽습니다. 원본은 변경하지 않고 수집함으로 복사합니다.
- 폴더 선택은 Windows PowerShell·Windows Forms를 사용합니다. 선택창 사용이 제한되면 전체 경로를 입력하고 목록을 확인합니다.
- 같은 내용의 중복 입력은 수집함에 남습니다. 같은 실행 중 변하지 않은 입력은 다시 기록하지 않지만, 재시작하면 한 번 더 안내할 수 있습니다.
- Node.js가 포함된 Portable Runtime 버전이 아닙니다. 다른 PC·다른 버전의 동작을 모두 보증하지 않습니다.
- 실제 업무 원본 대신 복사본으로 먼저 확인하세요. 전원 차단·저장장치 고장의 무손실을 보장하지 않습니다.
- .blend/.abc 예제는 파일명 점검용 stub이며 실제 모델·캐시가 아닙니다. lighting_ref_3000K.jpg는 실제 색온도 보증 자료가 아닙니다.
- 제공 예제의 확인 결과와 본인이 직접 실행한 결과를 구분해서 기록합니다.`);
const oldHtml = fs.readFileSync(path.join(source, 'app/ui/index.html'), 'utf8');
const html = oldHtml.replace('AI 파일 자동정리 · 로컬 실습', '파일 정리 자동화 · 로컬 실습')
  .replace('AI LECTURE · LOCAL PRACTICE DRAFT', 'AI LECTURE · 업무 자동화 실습')
  .replace('<h1>AI 파일 자동정리</h1>', '<h1>파일 정리 자동화</h1>');
assert.notEqual(html, oldHtml);
write(overlays, 'app/ui/index.html', html);
const oldJs = fs.readFileSync(path.join(source, 'app/ui/ui.js'), 'utf8');
const ui = oldJs.replace("el('inbox').textContent=state.inbox;", "el('inbox').textContent='AI_파일자동정리 / 00_수집함';")
  .replace("if(document.activeElement?.tagName==='SELECT')return;", "if(document.activeElement?.closest('#pending'))return;")
  .replace("el('notice').textContent=error.message;", "el('notice').textContent='프로그램에 연결할 수 없습니다. START.bat 실행 상태와 표시된 주소를 확인한 뒤 새로고침하세요.';");
assert.notEqual(ui, oldJs);
write(overlays, 'app/ui/ui.js', ui);
const css = fs.readFileSync(path.join(source, 'app/ui/style.css'), 'utf8');
write(overlays, 'app/ui/style.css', css + `
/* Student distribution: retain readable rows on narrow screens. */
@media(max-width:650px){
  .table-wrap{overflow:visible}
  table,tbody{display:block;width:100%}
  thead{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  tbody tr{display:block;border:1px solid #d8e0da;border-radius:3px;padding:8px;margin:12px 0;background:#fafcf8}
  tbody td{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;padding:6px 4px;border:0;font-size:.9rem;max-width:none!important}
  tbody td::before{font-weight:600;color:#426559}
  tbody td:nth-child(1)::before{content:"파일"}
  tbody td:nth-child(2)::before{content:"상태"}
  tbody td:nth-child(3)::before{content:"결과 / 사유"}
  footer{font-size:.85rem}
}`);
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'review/daejeon/SORT_TEST/manifest.json'), 'utf8'));
const csv = value => '"' + String(value).replaceAll('"', '""') + '"';
write(student, 'A_EXPECTED_RESULTS.csv', '\uFEFF' + [['파일명','기대 폴더','자료 안내'], ...fixture.files.map(row => [row.file,row.expectedFolder,row.description])].map(row => row.map(csv).join(',')).join('\r\n'));
if(!fs.existsSync(path.join(source,'app/folder-importer.js'))) write(instructor, 'PROMPT_PROVENANCE.txt', `실습 A Prompt → 프로그램 근거 기록

현재 강의의 첫 요청·구현 승인 원문은 src/draft/content/daejeon-lesson02.ts의 planPrompt/approvalPrompt를 TypeScript로 평가해 그대로 추출했습니다.
이 두 TXT는 현재 수강생용 재현 절차입니다. 프로그램이 이 짧은 첫 요청 한 번만으로 완성됐다고 주장하지 않습니다.

과거 최초 제작을 지시한 사용자 원문은 첨부 eac43811-2132-46cf-beaa-97e90110ff56의 붙여넣은 텍스트.txt로 확인하여 HISTORICAL_USER_IMPLEMENTATION_REQUEST.txt에 byte-identical로 보존했습니다. 이것은 사용자 구현 지시이며 도구에 넘긴 단일 생성 Prompt라는 뜻은 아닙니다.
그 이후 실제 전체 대화·도구 실행 Prompt 원문은 현재 저장소에서 완전하게 복원되지 않습니다. 따라서 원문이 없는 수정 Prompt를 실제 사용 로그처럼 만들지 않습니다.
확인 가능한 과거 근거: scripts/verify-daejeon-file-sorter.mjs, scripts/verify-daejeon-file-sorter-clean-room.mjs, review/daejeon/FILE_SORTER_VALIDATION/student-release/clean-room.json, runtime-regression.json 및 현재 app source.
과거 보고서 DAEJEON_LESSON02_FILE_SORTER_FINAL_REPORT.txt에는 Windows registry.json 교체의 EPERM을 발견하여 EPERM/EACCES/EBUSY에 최대 9회·50ms 제한 재시도를 추가한 사실이 기록되어 있습니다. 이는 해당 보고서로 확인한 수정 이력이며 당시 수정 Prompt 원문은 복원되지 않습니다.
과거 검증 결과와 이번에 다시 실행하는 검증은 별도입니다. 이번 결과는 verification.json에만 기록합니다.

이번 요청: 첨부 3d27f437-0d35-418b-97ad-a2a974f80123/붙여넣은 텍스트.txt의 실습 A 감사·자료·UI 검증 지시.
이번 수행 순서: 기존 구조/기능 읽기 → 최소 배포 UI 보완 → 새 ZIP 재포장 → 별도 TEMP 압축해제 및 실제 실행 → 오류/키보드/반응형 확인.
이번 추가 수정 이유:
1. 기존 자동 새로고침은 SELECT만 보호하고 카드의 이동 버튼은 2초마다 교체하여 키보드 초점을 잃을 수 있었습니다. 배포 UI에서 카드 내부 초점을 보호합니다.
2. 학생 화면의 DRAFT 표시와 README의 내부 상태 문구를 제거합니다.
3. 수집함을 프로그램 폴더 기준 상대 위치로 표시하여 화면공유에 검증용 절대경로가 나타나지 않게 합니다.
4. 연결 실패 시 실행 상태·주소 확인이라는 다음 행동을 안내합니다.
5. 실제 모바일 캡처에서 3열 결과 표의 파일명·사유가 지나치게 잘리고 작게 보였습니다. 650px 이하에서 기존 결과 행을 파일/상태/결과 라벨의 세로 카드로 표시합니다.
6. 최종 배포 점검에서 요청 §20에 맞춰 프로그램 ZIP 내부 SHA 목록 manifest를 제외하고, 테스트 ZIP의 manifest는 파일명·용도·기대 폴더만 담는 수강생용 설명으로 바꿨습니다. 전체 SHA 검증 목록은 instructor/A/program-file-manifest.json 및 test-file-manifest.json에 보존합니다. 테스트 원본 11개 바이트와 프로그램 core는 그대로이며 새 ZIP을 별도 TEMP에서 다시 실행했습니다.

별도의 생성 모델 호출이나 가상의 수정 Prompt 실행을 기록하지 않습니다. 실제 수정은 build-daejeon-sorter-ab.mjs에 보존된 명시적 UI 문자열 교체입니다.
원본 review/daejeon/AI_파일자동정리 source는 변경하지 않습니다. 배포 ZIP의 README.txt/app/ui/index.html/app/ui/ui.js/app/ui/style.css만 보완하며, app core는 원본과 SHA가 같아야 합니다.
ZIP 구성에서 내부 검증 manifest를 분리한 사실은 위 6번과 같습니다. 기존 원본 프로그램/SORT_TEST 폴더의 manifest는 변경하지 않습니다.
현재 상세 Prompt SHA-256: ${sha(prompts.approvalPrompt.trimEnd() + '\n')}
현재 첫 요청 SHA-256: ${sha(prompts.planPrompt.trimEnd() + '\n')}`);
const python = process.env.SORT_AUTHOR_PYTHON;
assert(python, 'Set SORT_AUTHOR_PYTHON to existing authoring Python runtime');
const packageScript = String.raw`from pathlib import Path
import zipfile,json,hashlib,sys,datetime
root=Path(sys.argv[1]); src=root/'review/daejeon/AI_파일자동정리'; dist=root/'review/daejeon/FILE_SORTER_STUDENT'; overlay=root/'review/daejeon/LESSON02_AUTOMATION_AB/instructor/A/distribution-overrides'
sha=lambda b:hashlib.sha256(b).hexdigest()
program=dist/'DJ-L02_FILE_SORTER_PROGRAM.zip'
evidence=root/'review/daejeon/LESSON02_AUTOMATION_AB/instructor/A'
with zipfile.ZipFile(program) as z:
 entries=[(i.filename,z.read(i.filename)) for i in z.infolist()]
 manifest=json.loads(z.read('AI_파일자동정리/manifest.json')) if 'AI_파일자동정리/manifest.json' in z.namelist() else json.loads((evidence/'program-file-manifest.json').read_text(encoding='utf8'))
names={row['file'] for row in manifest['files']}
for name in ['app/folder-importer.js','app/folder-picker.ps1']:
 if name not in names: manifest['files'].append({'file':name})
replacement={}
for row in manifest['files']:
 name=row['file']; candidate=overlay/name if (overlay/name).is_file() else src/name
 data=candidate.read_bytes(); replacement['AI_파일자동정리/'+name]=data; row['bytes']=len(data);row['sha256']=sha(data)
(evidence/'program-file-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
existing={name for name,data in entries}
entries.extend((name,data) for name,data in replacement.items() if name not in existing)
with zipfile.ZipFile(program,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name,data in entries:
  if name=='AI_파일자동정리/manifest.json':continue
  info=zipfile.ZipInfo(name,(2026,10,14,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=(0o40755 if name.endswith('/') else 0o100644)<<16
  z.writestr(info,replacement.get(name,data))
testZip=dist/'DJ-L02_SORT_TEST.zip'
testSource=json.loads((root/'review/daejeon/SORT_TEST/manifest.json').read_text(encoding='utf8'))
testAudit={'files':[{k:row[k] for k in ['file','type','description','bytes','sha256','expectedFolder']} for row in testSource['files']]}
(evidence/'test-file-manifest.json').write_text(json.dumps(testAudit,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
learnerManifest={'title':'파일 정리 자동화 실습파일','instructions':'실습파일 11개만 00_수집함에 넣습니다. README.txt와 manifest.json은 넣지 않습니다.','files':[{k:row[k] for k in ['file','type','description','expectedFolder']} for row in testAudit['files']]}
with zipfile.ZipFile(testZip) as z: testEntries=[(i.filename,z.read(i.filename)) for i in z.infolist()]
with zipfile.ZipFile(testZip,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name,data in testEntries:
  if name=='SORT_TEST/manifest.json':data=(json.dumps(learnerManifest,ensure_ascii=False,indent=2)+'\n').encode()
  info=zipfile.ZipInfo(name,(2026,10,14,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=(0o40755 if name.endswith('/') else 0o100644)<<16
  z.writestr(info,data)
(dist/'DJ-L02_FILE_SORTER_README.txt').write_bytes((overlay/'README.txt').read_bytes())
combined=json.loads((dist/'DJ-L02_FILE_SORTER_MANIFEST.json').read_text(encoding='utf8'))
for row in combined['files']:
 p=dist/row['file'];row['bytes']=p.stat().st_size;row['sha256']=sha(p.read_bytes())
combined['generatedAt']='2026-10-14T00:00:00+09:00';combined['studentUiRevision']='A explicit top-level folder import; classifier/watcher/file-manager unchanged'
(dist/'DJ-L02_FILE_SORTER_MANIFEST.json').write_text(json.dumps(combined,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'programSha256':sha(program.read_bytes()),'testZipSha256':sha(testZip.read_bytes()),'modifiedInsideZip':sorted(p.relative_to(overlay).as_posix() for p in overlay.rglob('*') if p.is_file()),'programInternalManifestRemoved':True,'testManifestHasNoHashes':True,'fixtureFileBytesUnmodified':True}))
`;
const packaged = spawnSync(python, ['-c', packageScript, root], { encoding: 'utf8', windowsHide: true });
assert.equal(packaged.status, 0, packaged.stderr);
console.log(packaged.stdout.trim());
