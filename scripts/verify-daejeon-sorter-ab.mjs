import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd(), output = path.join(root, 'review/daejeon/LESSON02_AUTOMATION_AB');
const instructor = path.join(output, 'instructor/A'), student = path.join(output, 'student/A');
const dist = path.join(root, 'review/daejeon/FILE_SORTER_STUDENT');
const scratch = path.join(root, 'tmp/lesson02-automation-ab/a');
fs.mkdirSync(scratch, { recursive: true });
const cleanRoot = path.join(os.tmpdir(), 'DJ_L02_CLEAN_ROOM_' + randomUUID() + '_한글 공백');
const program = path.join(cleanRoot, 'AI_파일자동정리');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label, timeout = 20000) {
  const began = Date.now();
  for (;;) { try { const result = await check(); if (result) return result; } catch {}
    if (Date.now() - began > timeout) throw new Error('Timeout: ' + label); await pause(100); }
}
const report = { passed: false, verifiedAt: new Date().toISOString(), root: cleanRoot, node: process.versions.node, nodeExecutable: process.execPath, elevated: null, absoluteRepositoryDependency: false, artifacts: { programZipSha256: hash(path.join(dist, 'DJ-L02_FILE_SORTER_PROGRAM.zip')), testZipSha256: hash(path.join(dist, 'DJ-L02_SORT_TEST.zip')) }, programCoreIdentical: [], rows: [], cases: [], ui: [], pageErrors: [], externalNetworkRequests: [], cleanup: null };
const pass = (name, detail) => { report.cases.push({ name, passed: true, detail }); console.log('PASS: ' + name); };
async function capture(target, options) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { await target.screenshot(options); return; }
    catch (error) { if (attempt === 2) throw error; await pause(300); }
  }
}
const python = process.env.SORT_AUTHOR_PYTHON; assert(python);
const shell = command => spawnSync('powershell.exe', ['-NoProfile', '-Command', command], { encoding: 'utf8', windowsHide: true });
const elevated = shell("$p=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent());[pscustomobject]@{elevated=$p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator);node=(Get-Command node).Source}|ConvertTo-Json -Compress");
assert.equal(elevated.status, 0); const identity = JSON.parse(elevated.stdout.trim());
assert.equal(identity.elevated, false); report.elevated = identity.elevated;
assert.equal(path.resolve(identity.node).toLowerCase(), path.resolve(process.execPath).toLowerCase());
fs.mkdirSync(cleanRoot);
const extraction = spawnSync(python, ['-c', String.raw`from pathlib import Path
import sys,zipfile
root=Path(sys.argv[1]).resolve()
for p in sys.argv[2:]:
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None
  for i in z.infolist():
   assert (root/i.filename).resolve().is_relative_to(root)
   assert ((i.external_attr>>16)&0o170000)!=0o120000
  z.extractall(root)
`, cleanRoot, path.join(dist, 'DJ-L02_FILE_SORTER_PROGRAM.zip'), path.join(dist, 'DJ-L02_SORT_TEST.zip')], { encoding: 'utf8', windowsHide: true });
assert.equal(extraction.status, 0, extraction.stderr);
const packagedManifest = JSON.parse(fs.readFileSync(path.join(instructor, 'program-file-manifest.json'), 'utf8'));
assert(!fs.existsSync(path.join(program, 'manifest.json')), 'Internal SHA list must not ship in student program ZIP');
for (const item of packagedManifest.files) {
  assert.equal(hash(path.join(program, item.file)), item.sha256);
  if (!['README.txt', 'app/ui/index.html', 'app/ui/ui.js', 'app/ui/style.css'].includes(item.file)) {
    assert.equal(hash(path.join(program, item.file)), hash(path.join(root, 'review/daejeon/AI_파일자동정리', item.file)));
    report.programCoreIdentical.push(item.file);
  }
}
const fixtures = path.join(cleanRoot, 'SORT_TEST');
const manifest = JSON.parse(fs.readFileSync(path.join(instructor, 'test-file-manifest.json'), 'utf8'));
const learnerManifest = JSON.parse(fs.readFileSync(path.join(fixtures, 'manifest.json'), 'utf8'));
assert.equal(learnerManifest.files.length, 11);
assert(!JSON.stringify(learnerManifest).includes('sha256'), 'Internal fixture SHA list must not ship in student test ZIP');
assert.deepEqual(learnerManifest.files.map(row => [row.file, row.expectedFolder]), manifest.files.map(row => [row.file, row.expectedFolder]));
assert.equal(manifest.files.length, 11);
const registry = () => JSON.parse(fs.readFileSync(path.join(program, 'data/registry.json'), 'utf8'));
const log = () => JSON.parse(fs.readFileSync(path.join(program, 'data/log.json'), 'utf8'));
assert.deepEqual(registry().records, []); assert.deepEqual(log().events, []);
const rules = JSON.parse(fs.readFileSync(path.join(program, 'app/rules.json'), 'utf8'));
const origin = 'http://127.0.0.1:' + rules.port;
const probe = http.createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(rules.port, '127.0.0.1', resolve); });
await new Promise(resolve => probe.close(resolve));
const bat = name => spawnSync('cmd.exe', ['/d', '/c', name, '--noninteractive'], { cwd: program, encoding: 'utf8', windowsHide: true, timeout: 35000 });
const get = async () => { const response = await fetch(origin + '/api/state'); assert(response.ok); return response.json(); };
const post = async (route, body, headers = {}) => { const state = await get(); return fetch(origin + route, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sorter-Token': state.token, ...headers }, body: JSON.stringify(body) }); };
let started = false, browser, sentinel;
try {
  pass('새 TEMP 압축해제·빈 data·프로그램/테스트 ZIP 무결성·원본 core 동일', { program: program, coreFiles: report.programCoreIdentical.length });
  const start = bat('START.bat'); assert.equal(start.status, 0, start.stdout + start.stderr); started = true;
  const state = await until(async () => { const s = await get(); return s.status === 'watching' && s; }, 'START');
  assert.equal(state.root, fs.realpathSync(program)); assert.equal(state.automaticCount, 0); assert.equal(state.pendingCount, 0);
  pass('시스템 Node.js·비관리자 START.bat', { port: rules.port, node: report.node, stableMs: state.stableMs });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== origin) report.externalNetworkRequests.push(request.url()); });
  async function inspectUi(width, stage, destination) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin); await page.waitForFunction(() => document.querySelector('#status')?.textContent === '감시 중');
    await page.evaluate(async () => { await document.fonts.ready; for (const image of document.images) image.loading = 'eager'; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
    const result = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, title: document.querySelector('h1').textContent, inbox: document.querySelector('#inbox').textContent, badButtons: [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && b.scrollWidth > b.clientWidth + 1).map(b => b.textContent), unlabeledSelects: [...document.querySelectorAll('select')].filter(s => !document.querySelector('label[for="' + s.id + '"]')).length, minimumActionFont: Math.min(...[...document.querySelectorAll('button,select')].map(el => parseFloat(getComputedStyle(el).fontSize))) }));
    assert.equal(result.scrollWidth, result.clientWidth, 'horizontal overflow'); assert.deepEqual(result.badButtons, []); assert.equal(result.unlabeledSelects, 0); assert(result.minimumActionFont >= 13);
    assert(!/DRAFT|design-pending|C:\\Users/.test(await page.locator('main').innerText()));
    await capture(page, { path: destination || path.join(instructor, `A_${stage}_${width}.png`), fullPage: true });
    report.ui.push({ width, stage, ...result });
  }
  for (const width of [1440, 390, 320]) await inspectUi(width, 'empty');
  assert((await page.locator('main').innerText()).includes('정리할 파일은 수집함에 넣습니다'));
  pass('빈 화면 다음 행동·반응형 1440/390/320');
  for (const row of manifest.files) { assert.equal(hash(path.join(fixtures, row.file)), row.sha256); fs.copyFileSync(path.join(fixtures, row.file), path.join(program, '00_수집함', row.file), fs.constants.COPYFILE_EXCL); }
  const first = await until(async () => { const s = await get(); return s.automaticCount === 9 && s.pendingCount === 2 && s; }, '11 fixtures', 30000);
  for (const row of manifest.files) {
    const actual = first.recent.find(item => item.name === row.file); assert(actual); assert.equal(actual.folder, row.expectedFolder);
    assert.equal(hash(path.join(program, actual.originalPath)), row.sha256); assert.equal(hash(path.join(program, actual.outputPath)), row.sha256);
    report.rows.push({ file: row.file, expected: row.expectedFolder, actual: actual.folder, passed: true, sha256: row.sha256, backupVerified: true, outputVerified: true });
  }
  pass('SORT_TEST 11개 기대=실제·자동9/확인대기2·원본보관 동일', report.rows);
  for (const width of [1440, 390, 320]) await inspectUi(width, 'pending', width === 1440 ? path.join(student, 'A_UI_DESKTOP.png') : width === 390 ? path.join(student, 'A_UI_MOBILE.png') : undefined);
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(origin); await page.waitForSelector('.file-card');
  await capture(page.locator('#pending'), { path: path.join(student, 'A_UI_PENDING.png') });
  await capture(page.locator('section[aria-labelledby="recent-title"]'), { path: path.join(student, 'A_UI_AUTOMATIC.png') });
  const item = first.pending.find(row => row.name === 'image001.png');
  const card = page.locator('[data-record-id="' + item.id + '"]');
  await card.locator('button').click(); assert((await page.locator('#notice').innerText()).includes('먼저 분류 유형'));
  await card.locator('select').selectOption('07_문서'); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.manual), item.id);
  await pause(4600); assert.equal(await page.evaluate(() => document.activeElement?.dataset.manual), item.id, 'card button focus lost after auto refresh');
  await page.keyboard.press('Enter'); await until(() => registry().records.some(row => row.id === item.id && row.status === 'manual'), 'keyboard manual');
  const manual = registry().records.find(row => row.id === item.id); assert.equal(manual.folder, '07_문서'); assert.equal(hash(path.join(program, manual.outputPath)), item.sha256);
  pass('선택 없는 오류 안내·카드 키보드 초점 4.6초 유지·Enter 수동분류');
  const scan = (await get()).pending.find(row => row.name === 'scan003.pdf');
  assert.equal((await post('/api/manual', { id: scan.id, folder: '../outside' })).status, 400);
  assert.equal((await post('/api/manual', { id: scan.id, folder: '07_문서' }, { 'X-Sorter-Token': 'wrong' })).status, 403);
  assert.equal((await post('/api/manual', { id: scan.id, folder: '07_문서' }, { Origin: 'https://example.invalid' })).status, 403);
  assert.equal((await fetch(origin + '/data/registry.json')).status, 404);
  pass('경로·제어 token·외부 Origin·직접 data 접근 제한');
  const originals = fs.readdirSync(path.join(program, '00_원본보관')).length;
  fs.copyFileSync(path.join(fixtures, 'office_floorplan.png'), path.join(program, '00_수집함/office_floorplan.png'), fs.constants.COPYFILE_EXCL);
  await until(() => registry().records.some(row => row.status === 'duplicate'), 'duplicate');
  const duplicateRecords = registry().records.length, duplicateEvents = log().events.length;
  await pause(6000); assert.equal(registry().records.length, duplicateRecords); assert.equal(log().events.length, duplicateEvents); assert.equal(fs.readdirSync(path.join(program, '00_원본보관')).length, originals);
  assert(fs.existsSync(path.join(program, '00_수집함/office_floorplan.png')));
  pass('중복 재투입·입력 유지·6초/24회 poll 동안 반복처리/로그 증가 없음', { records: duplicateRecords, events: duplicateEvents, observationMs: 6000 });
  for (const [index, text] of ['first version', 'second version'].entries()) {
    fs.writeFileSync(path.join(program, '00_수집함/same_name.txt'), text, { flag: 'wx' });
    await until(() => registry().records.filter(row => row.name === 'same_name.txt' && row.status === 'automatic').length === index + 1, 'version');
  }
  assert.equal(fs.readFileSync(path.join(program, '07_문서/same_name.txt'), 'utf8'), 'first version');
  assert.equal(fs.readFileSync(path.join(program, '07_문서/same_name_v02.txt'), 'utf8'), 'second version');
  pass('같은 이름 다른 내용 _v02·덮어쓰기 없음');
  sentinel = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { windowsHide: true, stdio: 'ignore' });
  const runtimePath = path.join(program, 'data/runtime.json'), runtimeText = fs.readFileSync(runtimePath, 'utf8');
  const wrongRuntime = JSON.parse(runtimeText); wrongRuntime.instanceId = 'wrong-identity'; fs.writeFileSync(runtimePath, JSON.stringify(wrongRuntime));
  const refusedStop = bat('STOP.bat'); assert.equal(refusedStop.status, 1); assert((refusedStop.stdout + refusedStop.stderr).includes('다른 프로그램'));
  fs.writeFileSync(runtimePath, runtimeText); assert.equal((await get()).status, 'watching'); assert.equal(sentinel.exitCode, null);
  pass('다른 instance 종료 거부·별도 Node 프로세스 유지');
  const stop = bat('STOP.bat'); assert.equal(stop.status, 0, stop.stdout + stop.stderr); started = false;
  assert(!fs.existsSync(runtimePath)); assert(!fs.existsSync(path.join(program, 'data/instance.lock'))); await assert.rejects(() => fetch(origin + '/api/state'));
  assert.equal(sentinel.exitCode, null);
  await page.locator('#refresh').click(); await page.waitForFunction(() => document.querySelector('#status')?.textContent === '연결 실패');
  assert((await page.locator('#notice').innerText()).includes('START.bat 실행 상태'));
  await capture(page, { path: path.join(instructor, 'A_connection_error.png'), fullPage: true });
  pass('STOP.bat 감시/서버 종료·다른 Node 유지·연결 오류 다음 행동 안내');
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.externalNetworkRequests, []);
  pass('브라우저 JS 오류 0·외부 네트워크 요청 0');
  await browser.close(); browser = null;
  const deletion = spawnSync('powershell.exe', ['-NoProfile', '-File', path.join(root, 'scripts/verify-daejeon-clean-room-delete.ps1'), '-Root', cleanRoot], { encoding: 'utf8', windowsHide: true });
  assert.equal(deletion.status, 0, deletion.stderr); report.cleanup = JSON.parse(deletion.stdout.trim()); assert(report.cleanup.programDeleted && report.cleanup.cleanRootDeleted);
  pass('검증 전용 TEMP 프로그램·data·log 실제 삭제', report.cleanup);
  if (process.argv.includes('--reuse-core')) {
    const coreReport = JSON.parse(fs.readFileSync(path.join(instructor, 'core-regression.json'), 'utf8'));
    assert(coreReport.passed);
    report.coreRegressionReused = { verifiedAt: coreReport.verifiedAt, cases: coreReport.cases.length, reason: 'Packaging-only SHA-list relocation; application core identical to source verified by this clean-room run.' };
    pass('기존 핵심 회귀 결과 재사용·배포 core 원본 동일 재확인', report.coreRegressionReused);
  } else {
  // Reuse the existing full core-regression suite without its historical fixture-manifest mutation.
  let regression = fs.readFileSync(path.join(root, 'scripts/verify-daejeon-file-sorter.mjs'), 'utf8');
  regression = regression.replace("const scratch=path.join(root,'tmp/file-sorter-implementation');", "const scratch=path.join(root,'tmp/lesson02-automation-ab/a-core');fs.mkdirSync(scratch,{recursive:true});");
  regression = regression.replace("fs.writeFileSync(path.join(fixtures,'manifest.json'),JSON.stringify(manifest,null,2)+'\\n');", '// Existing fixture manifest stays unchanged.');
  const regressionPath = path.join(scratch, 'core-regression.mjs'); fs.writeFileSync(regressionPath, regression);
  const core = spawnSync(process.execPath, [regressionPath], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 150000 });
  fs.writeFileSync(path.join(instructor, 'core-regression.log'), core.stdout + '\n' + core.stderr);
  assert.equal(core.status, 0, core.stdout + core.stderr);
  const coreReport = JSON.parse(fs.readFileSync(path.join(root, 'tmp/lesson02-automation-ab/a-core/runtime-verification.json'), 'utf8'));
  assert(coreReport.passed); fs.writeFileSync(path.join(instructor, 'core-regression.json'), JSON.stringify(coreReport, null, 2) + '\n');
  pass('기존 핵심 회귀검증: 복사 안정·충돌·실패·링크·fs root 감사·이동·START/STOP', { cases: coreReport.cases.length, sourceUntouched: true });
  }
  report.passed = true;
} catch (error) { report.error = error.stack; console.error(error); process.exitCode = 1; }
finally {
  if (browser) await browser.close();
  if (started) report.cleanupStopExit = bat('STOP.bat').status;
  if (sentinel && sentinel.exitCode === null) sentinel.kill();
  fs.writeFileSync(path.join(instructor, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
}
if (report.passed) {
  fs.writeFileSync(path.join(student, 'A_VERIFICATION_SUMMARY.txt'), `파일 정리 자동화 · 제공 예제의 기능 확인 결과\n\nWindows / Node.js ${report.node}에서 관리자 권한 없이 새 폴더에 압축을 풀어 확인했습니다.\nSORT_TEST 11개가 모두 기대 폴더와 일치했습니다(자동 9개, 사람 확인 2개).\nimage001.png 수동분류, 같은 내용 중복 안내, 같은 이름의 _v02 저장, START/STOP을 확인했습니다.\n1440·390·320px 화면에서 가로 넘침과 잘린 버튼이 없고, 키보드로 유형 선택·이동할 수 있었습니다.\n\n이 결과는 제공 예제의 검증 결과입니다. 본인의 구현·실행 결과는 별도로 기록하세요. 모든 PC·Node 버전을 보증하지 않습니다.\n짧은 첫 요청 한 번으로 제작되었다는 의미가 아닙니다. 구조 검토 → 구현 승인 → 수정과 기능 확인을 거칩니다.\n`);
  const files = fs.readdirSync(student).filter(file => file !== 'download-manifest.json').sort().map(file => ({ file, bytes: fs.statSync(path.join(student, file)).size, sha256: hash(path.join(student, file)) }));
  fs.writeFileSync(path.join(student, 'download-manifest.json'), JSON.stringify({ studentTitle: '파일 정리 자동화', verified: true, selfHashExcluded: true, files, packages: ['DJ-L02_FILE_SORTER_PROGRAM.zip', 'DJ-L02_SORT_TEST.zip'].map(file => ({ source: 'review/daejeon/FILE_SORTER_STUDENT/' + file, file, bytes: fs.statSync(path.join(dist, file)).size, sha256: hash(path.join(dist, file)) })) }, null, 2) + '\n');
}
console.log(JSON.stringify({ passed: report.passed, cases: report.cases.length, files: report.rows.length, report: 'review/daejeon/LESSON02_AUTOMATION_AB/instructor/A/verification.json' }));
