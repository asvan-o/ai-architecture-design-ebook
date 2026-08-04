import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildInfoFromOutputs, ensureDependencies, run, runNpm } from './lecture-kit-utils.mjs';

const rootDirectory = process.cwd();
const stateDirectory = path.join(rootDirectory, '.lecture-kit');

try {
  console.log('[lecture] 최신 소스로 학생용·강사용 강의 화면을 준비합니다.');
  await ensureDependencies(rootDirectory);
  for (const script of ['lint', 'typecheck', 'validate:content', 'build:student-with-pdf', 'build:instructor']) {
    console.log(`[lecture] npm run ${script}`);
    runNpm(['run', script], { cwd: rootDirectory });
  }

  const buildInfo = await buildInfoFromOutputs({
    rootDirectory,
    studentRoot: path.join(rootDirectory, 'dist'),
    instructorRoot: path.join(rootDirectory, 'dist-instructor'),
    kitVersion: 'source',
  });
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(path.join(stateDirectory, 'BUILD_INFO.json'), `${JSON.stringify(buildInfo, null, 2)}\n`, 'utf8');

  const serverArguments = [
    path.join(rootDirectory, 'scripts', 'lecture-kit-server.mjs'),
    '--mode', 'source',
    '--root', rootDirectory,
  ];
  if (process.argv.includes('--no-browser')) serverArguments.push('--no-browser');
  run(process.execPath, serverArguments, { cwd: rootDirectory });
} catch (error) {
  console.error(`[lecture] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
