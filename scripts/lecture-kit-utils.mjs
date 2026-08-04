import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const run = (command, argumentsList = [], options = {}) => {
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    stdio: options.stdio ?? 'inherit',
    encoding: options.encoding,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} 실패 (exit ${result.status ?? 1})`);
  }
  return result;
};

export const npmCliPath = () => {
  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) return process.env.npm_execpath;
  const bundled = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (existsSync(bundled)) return bundled;
  throw new Error('현재 Node.js 설치에서 npm-cli.js를 찾을 수 없습니다.');
};

export const runNpm = (argumentsList = [], options = {}) => run(
  process.execPath,
  [npmCliPath(), ...argumentsList],
  options,
);

export const gitText = (argumentsList, cwd = process.cwd()) => execFileSync('git', argumentsList, {
  cwd,
  encoding: 'utf8',
  windowsHide: true,
}).trim();

export const hashFile = async (filePath) => new Promise((resolve, reject) => {
  const hash = createHash('sha256');
  const stream = createReadStream(filePath);
  stream.on('data', (chunk) => hash.update(chunk));
  stream.on('error', reject);
  stream.on('end', () => resolve(hash.digest('hex')));
});

export const collectFiles = async (rootDirectory) => {
  const files = [];
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'));
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      else if (entry.isFile()) files.push(entryPath);
    }
  };
  await visit(path.resolve(rootDirectory));
  return files;
};

export const hashTree = async (rootDirectory) => {
  const root = path.resolve(rootDirectory);
  const hash = createHash('sha256');
  for (const filePath of await collectFiles(root)) {
    const relative = path.relative(root, filePath).replaceAll(path.sep, '/');
    hash.update(relative);
    hash.update('\0');
    hash.update(await hashFile(filePath));
    hash.update('\n');
  }
  return hash.digest('hex');
};

export const countIndexPages = async (rootDirectory) => (
  (await collectFiles(rootDirectory)).filter((filePath) => path.basename(filePath).toLowerCase() === 'index.html').length
);

export const countPdfPages = async (filePath) => {
  try {
    const output = execFileSync('pdfinfo', [filePath], { encoding: 'utf8', windowsHide: true });
    const match = output.match(/^Pages:\s+(\d+)/m);
    if (match) return Number(match[1]);
  } catch {
    // Chromium PDFs have explicit /Type /Page objects; use this portable fallback.
  }
  const source = await readFile(filePath);
  const matches = source.toString('latin1').match(/\/Type\s*\/Page\b/g);
  return matches?.length ?? 0;
};

export const dependencyFingerprint = async (rootDirectory) => {
  const hash = createHash('sha256');
  for (const name of ['package.json', 'package-lock.json']) {
    const source = await readFile(path.join(rootDirectory, name));
    hash.update(name);
    hash.update(source);
  }
  hash.update(process.version);
  return hash.digest('hex');
};

export const ensureDependencies = async (rootDirectory) => {
  const stateDirectory = path.join(rootDirectory, '.lecture-kit');
  const markerPath = path.join(stateDirectory, 'dependency.sha256');
  const fingerprint = await dependencyFingerprint(rootDirectory);
  let previous = '';
  try {
    previous = (await readFile(markerPath, 'utf8')).trim();
  } catch {
    // Missing marker triggers npm ci.
  }
  if (!existsSync(path.join(rootDirectory, 'node_modules')) || previous !== fingerprint) {
    console.log('[lecture-kit] 의존성 상태가 달라 npm ci를 실행합니다.');
    runNpm(['ci'], { cwd: rootDirectory });
    await mkdir(stateDirectory, { recursive: true });
    await writeFile(markerPath, `${fingerprint}\n`, 'utf8');
  } else {
    console.log('[lecture-kit] package-lock과 설치 상태가 같아 npm ci를 생략합니다.');
  }
  return fingerprint;
};

export const buildInfoFromOutputs = async ({ rootDirectory, studentRoot, instructorRoot, kitVersion }) => {
  const pdfDirectory = path.join(studentRoot, 'downloads');
  const pdfFiles = (await collectFiles(pdfDirectory)).filter((filePath) => filePath.toLowerCase().endsWith('.pdf'));
  const lessonPdfPageCounts = {};
  let coursePdfPageCount = 0;
  for (const filePath of pdfFiles) {
    const name = path.basename(filePath);
    const lessonMatch = name.match(/lesson-(\d{2})\.pdf$/);
    if (lessonMatch) lessonPdfPageCounts[lessonMatch[1]] = await countPdfPages(filePath);
    if (name === 'ai-architecture-design-course.pdf') coursePdfPageCount = await countPdfPages(filePath);
  }
  const status = gitText(['status', '--porcelain'], rootDirectory);
  return {
    projectName: 'AI 건축디자인 바이블',
    kitVersion,
    buildTimestamp: new Date().toISOString(),
    gitBranch: gitText(['branch', '--show-current'], rootDirectory),
    gitHead: gitText(['rev-parse', 'HEAD'], rootDirectory),
    originMain: gitText(['rev-parse', 'origin/main'], rootDirectory),
    workingTreeDirty: status.length > 0,
    nodeVersion: process.version,
    npmVersion: runNpm(['--version'], { cwd: rootDirectory, stdio: 'pipe', encoding: 'utf8' }).stdout.trim(),
    studentPageCount: await countIndexPages(studentRoot),
    instructorPageCount: await countIndexPages(instructorRoot),
    presentationPageCount: await countIndexPages(path.join(instructorRoot, 'presentation')),
    pdfCount: pdfFiles.length,
    lessonPdfPageCounts,
    coursePdfPageCount,
    studentBuildSha256: await hashTree(studentRoot),
    instructorBuildSha256: await hashTree(instructorRoot),
    portableZipSha256: null,
    publicEbookUrl: 'https://asvan-o.github.io/ai-architecture-design-ebook/',
    sourcePathIncluded: false,
    rawInstructorYamlIncluded: false,
  };
};
