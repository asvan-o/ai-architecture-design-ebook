import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const outputDirectory = process.argv[2] ?? 'dist';
const pdfScope = process.argv[3] ?? 'student';
if (!['student', 'instructor'].includes(pdfScope)) {
  console.error(`지원하지 않는 PDF 생성 범위입니다: ${pdfScope}`);
  process.exit(1);
}
const ebookMode = pdfScope === 'instructor' ? 'pdf-review' : 'student';

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
  ['build', ebookMode, outputDirectory],
  {
    ...process.env,
    PUBLIC_PDF_DOWNLOADS_ENABLED: pdfScope === 'student' ? 'true' : 'false',
  },
);
run('generate-pdfs.mjs', [outputDirectory, pdfScope]);
run('verify-student-pdf-release.mjs', [outputDirectory, pdfScope]);
