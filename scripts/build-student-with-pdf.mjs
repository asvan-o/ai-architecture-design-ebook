import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const outputDirectory = process.argv[2] ?? 'dist';

const run = (script, argumentsList = [], environment = process.env) => {
  const result = spawnSync(
    process.execPath,
    [path.resolve('scripts', script), ...argumentsList],
    {
      cwd: process.cwd(),
      env: environment,
      stdio: 'inherit',
    },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(
  'run-ebook-mode.mjs',
  ['build', 'student', outputDirectory],
  {
    ...process.env,
    PUBLIC_PDF_DOWNLOADS_ENABLED: 'true',
  },
);
run('generate-pdfs.mjs', [outputDirectory]);
