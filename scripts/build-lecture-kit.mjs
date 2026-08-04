import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildInfoFromOutputs,
  ensureDependencies,
  gitText,
  hashFile,
  run,
  runNpm,
} from './lecture-kit-utils.mjs';

const KIT_NAME = 'AI_건축디자인_강의키트_windows_x64';
const KIT_VERSION = '0.1.0';
const NODE_VERSION = 'v24.17.0';
const NODE_ARCHIVE = `node-${NODE_VERSION}-win-x64.zip`;
const NODE_BASE_URL = `https://nodejs.org/dist/${NODE_VERSION}`;
const rootDirectory = process.cwd();
const allowDirty = process.argv.includes('--allow-dirty');
const releaseDirectory = path.join(rootDirectory, 'release');
const finalKitDirectory = path.join(releaseDirectory, KIT_NAME);
const finalZipPath = path.join(releaseDirectory, `${KIT_NAME}.zip`);
const finalChecksumPath = `${finalZipPath}.sha256`;
const tempRoot = path.join(rootDirectory, 'tmp', `lecture-kit-build-${process.pid}`);
const tempKitParent = path.join(tempRoot, 'package');
const tempKitDirectory = path.join(tempKitParent, KIT_NAME);
const tempZipPath = path.join(tempRoot, `${KIT_NAME}.zip`);
const cacheDirectory = path.join(rootDirectory, '.lecture-kit', 'cache');
const cachedNodeArchive = path.join(cacheDirectory, NODE_ARCHIVE);
const cachedShasums = path.join(cacheDirectory, 'SHASUMS256.txt');

const download = async (url, destination) => {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`다운로드 실패: ${url} (${response.status})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
};

const verifyNodeArchive = async () => {
  await mkdir(cacheDirectory, { recursive: true });
  await download(`${NODE_BASE_URL}/SHASUMS256.txt`, cachedShasums);
  const shasums = await readFile(cachedShasums, 'utf8');
  const expected = shasums
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .find(([, name]) => name === NODE_ARCHIVE)?.[0];
  if (!expected) throw new Error(`공식 SHASUMS256.txt에 ${NODE_ARCHIVE}가 없습니다.`);
  if (!existsSync(cachedNodeArchive) || await hashFile(cachedNodeArchive) !== expected) {
    await download(`${NODE_BASE_URL}/${NODE_ARCHIVE}`, cachedNodeArchive);
  }
  const actual = await hashFile(cachedNodeArchive);
  if (actual !== expected) throw new Error(`Node.js ZIP SHA-256 불일치: expected ${expected}, actual ${actual}`);
  return { expected, actual };
};

const extractZip = (archive, destination) => run(
  'tar.exe',
  ['-xf', archive, '-C', destination],
  { cwd: rootDirectory },
);

const createZip = (source, destination) => run(
  'tar.exe',
  ['-a', '-cf', destination, '-C', path.dirname(source), path.basename(source)],
  { cwd: rootDirectory },
);

const moveWithBackup = async (source, destination) => {
  const backup = `${destination}.backup`;
  await rm(backup, { recursive: true, force: true });
  if (existsSync(destination)) await rename(destination, backup);
  await rename(source, destination);
};

const dirtyStatus = gitText(['status', '--porcelain'], rootDirectory);
if (dirtyStatus && !allowDirty) {
  console.error('[lecture-kit] working tree가 clean하지 않습니다. 검토 중 빌드라면 --allow-dirty를 명시하세요.');
  process.exit(1);
}

await rm(tempRoot, { recursive: true, force: true });
await mkdir(tempKitDirectory, { recursive: true });

try {
  console.log(`[lecture-kit] 키트 ${KIT_VERSION} 생성 시작`);
  await ensureDependencies(rootDirectory);
  for (const script of ['lint', 'typecheck', 'validate:content', 'build:student', 'build:instructor', 'build:pdf', 'build:student-with-pdf']) {
    console.log(`[lecture-kit] npm run ${script}`);
    runNpm(['run', script], { cwd: rootDirectory });
  }

  const nodeChecksum = await verifyNodeArchive();
  const runtimeExtract = path.join(tempRoot, 'node-runtime');
  await mkdir(runtimeExtract, { recursive: true });
  extractZip(cachedNodeArchive, runtimeExtract);
  const extractedRuntime = path.join(runtimeExtract, `node-${NODE_VERSION}-win-x64`);
  if (!existsSync(path.join(extractedRuntime, 'node.exe')) || !existsSync(path.join(extractedRuntime, 'LICENSE'))) {
    throw new Error('공식 Node.js 휴대용 런타임의 node.exe 또는 LICENSE가 없습니다.');
  }

  await Promise.all([
    cp(extractedRuntime, path.join(tempKitDirectory, 'runtime'), { recursive: true }),
    cp(path.join(rootDirectory, 'dist'), path.join(tempKitDirectory, 'sites', 'student'), { recursive: true }),
    cp(path.join(rootDirectory, 'dist-instructor'), path.join(tempKitDirectory, 'sites', 'instructor'), { recursive: true }),
    cp(path.join(rootDirectory, 'dist', 'downloads'), path.join(tempKitDirectory, 'pdf'), { recursive: true }),
    cp(path.join(rootDirectory, 'lecture-kit', 'hub'), path.join(tempKitDirectory, 'app', 'hub'), { recursive: true }),
    cp(
      path.join(rootDirectory, 'lecture-kit', 'README_강의실행.txt'),
      path.join(tempKitDirectory, 'README_강의실행.txt'),
    ),
  ]);
  await mkdir(path.join(tempKitDirectory, 'logs'), { recursive: true });
  for (const name of ['lecture-kit-server.mjs', 'lecture-kit-static.mjs', 'lecture-kit-status.mjs']) {
    await cp(path.join(rootDirectory, 'scripts', name), path.join(tempKitDirectory, 'app', name));
  }
  for (const name of ['강의_실행.cmd', '강의_종료.cmd', '강의키트_상태확인.cmd']) {
    await cp(path.join(rootDirectory, 'lecture-kit', 'templates', 'portable', name), path.join(tempKitDirectory, name));
  }

  const buildInfo = await buildInfoFromOutputs({
    rootDirectory,
    studentRoot: path.join(tempKitDirectory, 'sites', 'student'),
    instructorRoot: path.join(tempKitDirectory, 'sites', 'instructor'),
    kitVersion: KIT_VERSION,
  });
  const portableNode = path.join(tempKitDirectory, 'runtime', 'node.exe');
  const portableNpmCli = path.join(tempKitDirectory, 'runtime', 'node_modules', 'npm', 'bin', 'npm-cli.js');
  buildInfo.nodeVersion = run(portableNode, ['--version'], { stdio: 'pipe', encoding: 'utf8' }).stdout.trim();
  buildInfo.npmVersion = run(portableNode, [portableNpmCli, '--version'], { stdio: 'pipe', encoding: 'utf8' }).stdout.trim();
  buildInfo.nodeDownloadUrl = `${NODE_BASE_URL}/${NODE_ARCHIVE}`;
  buildInfo.nodeShasumsUrl = `${NODE_BASE_URL}/SHASUMS256.txt`;
  buildInfo.nodeArchiveSha256 = nodeChecksum.actual;
  buildInfo.nodeArchiveChecksumVerified = nodeChecksum.actual === nodeChecksum.expected;
  buildInfo.portableZipSha256 = `see ${KIT_NAME}.zip.sha256`;
  await writeFile(path.join(tempKitDirectory, 'BUILD_INFO.json'), `${JSON.stringify(buildInfo, null, 2)}\n`, 'utf8');

  run(process.execPath, [path.join(rootDirectory, 'scripts', 'verify-lecture-kit.mjs'), '--root', tempKitDirectory], { cwd: rootDirectory });
  createZip(tempKitDirectory, tempZipPath);
  const zipSha256 = await hashFile(tempZipPath);
  await writeFile(path.join(tempRoot, `${KIT_NAME}.zip.sha256`), `${zipSha256}  ${KIT_NAME}.zip\n`, 'utf8');

  await mkdir(releaseDirectory, { recursive: true });
  await moveWithBackup(tempKitDirectory, finalKitDirectory);
  await moveWithBackup(tempZipPath, finalZipPath);
  await moveWithBackup(path.join(tempRoot, `${KIT_NAME}.zip.sha256`), finalChecksumPath);

  console.log('[lecture-kit] 휴대용 강의키트 생성 완료');
  console.log(`- folder: release/${KIT_NAME}/`);
  console.log(`- zip: release/${KIT_NAME}.zip`);
  console.log(`- sha256: ${zipSha256}`);
} catch (error) {
  console.error(`[lecture-kit] 생성 실패 · 기존 release는 교체하지 않았습니다: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
