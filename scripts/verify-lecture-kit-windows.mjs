import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  collectFiles,
  countIndexPages,
  hashFile,
  hashTree,
  run,
} from './lecture-kit-utils.mjs';
import { isPortAvailable } from './lecture-kit-static.mjs';

const KIT_NAME = 'AI_건축디자인_강의키트_windows_x64';
const sourceRoot = process.cwd();
const zipPath = path.join(sourceRoot, 'release', `${KIT_NAME}.zip`);
const checksumPath = `${zipPath}.sha256`;
const testBase = path.resolve('C:\\Temp\\한글 경로 테스트');
const safePrefix = `${path.parse(testBase).root}Temp${path.sep}`.toLowerCase();
if (!testBase.toLowerCase().startsWith(safePrefix) || testBase.length < 12) {
  throw new Error(`안전하지 않은 테스트 경로입니다: ${testBase}`);
}
if (!existsSync(zipPath) || !existsSync(checksumPath)) throw new Error('release ZIP 또는 SHA-256 파일이 없습니다.');

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const waitForJson = async (filePath) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch {
      await sleep(100);
    }
  }
  throw new Error(`상태 파일 대기 시간 초과: ${path.basename(filePath)}`);
};

const closeViaApi = async (state) => {
  const response = await fetch(`http://127.0.0.1:${state.ports.hub}/api/stop`, {
    method: 'POST',
    headers: { 'X-Lecture-Kit-Token': state.token },
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error('안전 종료 API 실패');
};

const listenBlocker = (port) => new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(port, '127.0.0.1', () => resolve(server));
});

const closeBlocker = (server) => new Promise((resolve) => server.close(resolve));

await rm(testBase, { recursive: true, force: true });
await mkdir(testBase, { recursive: true });
run('tar.exe', ['-xf', zipPath, '-C', testBase], { cwd: sourceRoot });
let kitRoot = path.join(testBase, KIT_NAME);
if (!existsSync(kitRoot)) throw new Error('ZIP 최상위 키트 폴더를 찾을 수 없습니다.');

try {
  const names = ['AI 건축디자인 강의키트', '2026 여름 강의 키트', '강의자료 테스트 복사본'];
  for (const name of names) {
    const nextRoot = path.join(testBase, name);
    await rename(kitRoot, nextRoot);
    kitRoot = nextRoot;
    run(process.execPath, [path.join(sourceRoot, 'scripts', 'verify-lecture-kit.mjs'), '--root', kitRoot], { cwd: sourceRoot });
  }

  const runtimeNode = path.join(kitRoot, 'runtime', 'node.exe');
  const serverScript = path.join(kitRoot, 'app', 'lecture-kit-server.mjs');
  const statePath = path.join(kitRoot, 'logs', 'state.json');
  const blockers = await Promise.all([4310, 4311, 4312].map(listenBlocker));
  let firstChild;
  try {
    firstChild = spawn(runtimeNode, [serverScript, '--mode', 'portable', '--root', kitRoot, '--no-browser'], {
      cwd: kitRoot,
      env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: path.join(kitRoot, 'runtime') },
      stdio: 'ignore',
      windowsHide: true,
    });
    const firstState = await waitForJson(statePath);
    if (Object.values(firstState.ports).some((port) => [4310, 4311, 4312].includes(port))) {
      throw new Error(`포트 충돌 회피 실패: ${JSON.stringify(firstState.ports)}`);
    }

    const secondChild = spawn(runtimeNode, [serverScript, '--mode', 'portable', '--root', kitRoot, '--no-browser'], {
      cwd: kitRoot,
      env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: path.join(kitRoot, 'runtime') },
      stdio: 'ignore',
      windowsHide: true,
    });
    const secondExit = await Promise.race([
      new Promise((resolve) => secondChild.once('exit', (code) => resolve(code))),
      sleep(5000).then(() => 'timeout'),
    ]);
    if (secondExit !== 0) throw new Error(`이중 실행 보호 실패: second exit ${secondExit}`);
    const afterSecond = JSON.parse(await readFile(statePath, 'utf8'));
    if (afterSecond.pid !== firstState.pid || afterSecond.token !== firstState.token) {
      throw new Error('이중 실행이 기존 서버 상태를 바꿨습니다.');
    }

    const hasCourseOverview = existsSync(path.join(kitRoot, 'sites', 'student', 'course-overview', 'index.html'));
    const localRoutes = [
      `http://127.0.0.1:${firstState.ports.hub}/`,
      ...(hasCourseOverview ? [
        `http://127.0.0.1:${firstState.ports.student}/course-overview/`,
        `http://127.0.0.1:${firstState.ports.instructor}/instructor-console/course-overview/`,
        `http://127.0.0.1:${firstState.ports.instructor}/presentation/course-overview/`,
      ] : []),
      `http://127.0.0.1:${firstState.ports.student}/lessons/01/`,
      `http://127.0.0.1:${firstState.ports.instructor}/instructor-console/lessons/01/`,
      `http://127.0.0.1:${firstState.ports.instructor}/presentation/lessons/01/`,
    ];
    for (const url of localRoutes) {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error(`오프라인 로컬 route 실패: ${url}`);
    }

    await closeViaApi(firstState);
    await new Promise((resolve) => firstChild.once('exit', resolve));
    await sleep(150);
    for (const port of Object.values(firstState.ports)) {
      if (!(await isPortAvailable(port))) throw new Error(`자동 선택 포트 ${port}가 해제되지 않았습니다.`);
    }
    console.log(`[verify-windows] 포트 충돌 회피 성공: ${Object.values(firstState.ports).join(', ')}`);
    console.log('[verify-windows] 이중 실행 보호·오프라인 로컬 route·안전 종료 성공');
  } finally {
    if (firstChild && !firstChild.killed) firstChild.kill();
    await Promise.all(blockers.map(closeBlocker));
  }

  for (const port of [4310, 4311, 4312]) {
    if (!(await isPortAvailable(port))) throw new Error(`충돌 테스트 포트 ${port}가 해제되지 않았습니다.`);
  }

  const buildInfo = JSON.parse(await readFile(path.join(kitRoot, 'BUILD_INFO.json'), 'utf8'));
  const studentRoot = path.join(kitRoot, 'sites', 'student');
  const instructorRoot = path.join(kitRoot, 'sites', 'instructor');
  const pdfFiles = (await collectFiles(path.join(kitRoot, 'pdf'))).filter((filePath) => filePath.endsWith('.pdf'));
  const assertions = [
    [buildInfo.nodeVersion === 'v24.17.0', '휴대용 Node 버전'],
    [buildInfo.studentPageCount === await countIndexPages(studentRoot), '학생 페이지 수'],
    [buildInfo.instructorPageCount === await countIndexPages(instructorRoot), '강사 페이지 수'],
    [buildInfo.presentationPageCount === await countIndexPages(path.join(instructorRoot, 'presentation')), '프레젠테이션 페이지 수'],
    [buildInfo.pdfCount === pdfFiles.length, 'PDF 수'],
    [buildInfo.studentBuildSha256 === await hashTree(studentRoot), '학생 빌드 SHA-256'],
    [buildInfo.instructorBuildSha256 === await hashTree(instructorRoot), '강사 빌드 SHA-256'],
    [buildInfo.sourcePathIncluded === false, 'sourcePathIncluded'],
    [buildInfo.rawInstructorYamlIncluded === false, 'rawInstructorYamlIncluded'],
    [existsSync(path.join(kitRoot, 'runtime', 'LICENSE')), 'Node LICENSE'],
    [!existsSync(path.join(kitRoot, 'source')), 'source 제외'],
    [!existsSync(path.join(kitRoot, 'instructor-content')), '원본 강사 YAML 제외'],
    [!existsSync(path.join(kitRoot, '.git')), '.git 제외'],
  ];
  const failed = assertions.filter(([ok]) => !ok).map(([, label]) => label);
  if (failed.length > 0) throw new Error(`BUILD_INFO/패키지 검증 실패: ${failed.join(', ')}`);

  const expectedZipHash = (await readFile(checksumPath, 'utf8')).trim().split(/\s+/)[0];
  const actualZipHash = await hashFile(zipPath);
  if (actualZipHash !== expectedZipHash) throw new Error('배포 ZIP .sha256 불일치');
  const yamlFiles = (await Promise.all([
    collectFiles(path.join(kitRoot, 'sites')),
    collectFiles(path.join(kitRoot, 'app')),
  ])).flat().filter((filePath) => /\.ya?ml$/i.test(filePath));
  if (yamlFiles.length > 0) throw new Error(`키트에 YAML ${yamlFiles.length}개가 포함됐습니다.`);

  console.log('[verify-windows] 한글·공백 폴더명 3종 실행 성공');
  console.log('[verify-windows] 시스템 Node/npm/PATH·인터넷 없이 번들 runtime 실행 성공');
  console.log('[verify-windows] BUILD_INFO·ZIP SHA-256·LICENSE·제외 경계 검증 성공');
} finally {
  await rm(testBase, { recursive: true, force: true });
}
