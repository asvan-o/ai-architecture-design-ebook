import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const [command, mode, outDir, ...extraArguments] = process.argv.slice(2);
const allowedCommands = ['dev', 'build'];
const allowedModes = ['student', 'instructor'];

if (!allowedCommands.includes(command) || !allowedModes.includes(mode)) {
  console.error('사용법: node scripts/run-ebook-mode.mjs <dev|build> <student|instructor> [outDir]');
  process.exit(1);
}

const astroCli = path.resolve('node_modules', 'astro', 'bin', 'astro.mjs');
const astroArguments = [astroCli, command];

if (command === 'dev') {
  astroArguments.push(
    '--background',
    '--mode',
    mode,
    ...([outDir, ...extraArguments].filter(Boolean)),
  );
} else {
  if (!outDir) {
    console.error('빌드 출력 폴더가 필요합니다.');
    process.exit(1);
  }
  astroArguments.push('--outDir', outDir, '--mode', mode, ...extraArguments);
}

const result = spawnSync(process.execPath, astroArguments, {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (command === 'build') {
  const rendering = spawnSync(
    process.execPath,
    [path.resolve('scripts', 'render-instructor-notes.mjs'), mode, outDir],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    },
  );
  if (rendering.status !== 0) {
    process.exit(rendering.status ?? 1);
  }

  const verification = spawnSync(
    process.execPath,
    [path.resolve('scripts', 'verify-instructor-boundary.mjs'), mode, outDir],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    },
  );
  process.exit(verification.status ?? 1);
}
