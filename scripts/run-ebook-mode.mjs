import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [command, mode, outDir, ...extraArguments] = process.argv.slice(2);
const allowedCommands = ['dev', 'build'];
const allowedModes = ['student', 'instructor', 'pdf-review'];

if (!allowedCommands.includes(command) || !allowedModes.includes(mode)) {
  console.error('사용법: node scripts/run-ebook-mode.mjs <dev|build> <student|instructor|pdf-review> [outDir]');
  process.exit(1);
}

const astroCli = path.resolve('node_modules', 'astro', 'bin', 'astro.mjs');
const astroArguments = [astroCli, command];
const gitHead = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  windowsHide: true,
}).stdout?.trim();
const runtimeEnvironment = {
  ...process.env,
  PUBLIC_LECTURE_BUILD_ID: process.env.PUBLIC_LECTURE_BUILD_ID || gitHead || 'local-working-tree',
};

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
  env: runtimeEnvironment,
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
  if (mode === 'student' || mode === 'pdf-review') {
    const outputPath = path.resolve(outDir);
    const collectFiles = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
    });
    const files = collectFiles(outputPath);
    const htmlSource = files
      .filter((filePath) => filePath.endsWith('.html'))
      .map((filePath) => readFileSync(filePath, 'utf8'))
      .join('\n');
    const instructorOnlyMarkers = [
      'ai-architecture-presenter',
      'ai-architecture-slide-overrides-v1',
      'data-quick-edit',
      'ai-architecture-instructor-progress-v1',
      'data-instructor-progress',
      'completedCheckpoints',
      'checkpointOverrides',
      'instructor-introduction',
      'data-instructor-introduction',
      'lecture-start',
      'data-deck-first-lesson',
      'instructor-introduction__career',
    ];
    const orphanInstructorAssets = files.filter((filePath) => {
      if (!/\.(?:js|css)$/i.test(filePath)) return false;
      const source = readFileSync(filePath, 'utf8');
      return instructorOnlyMarkers.some((marker) => source.includes(marker));
    });
    for (const assetPath of orphanInstructorAssets) {
      if (htmlSource.includes(path.basename(assetPath))) {
        console.error(`학생 HTML이 강사용 전용 asset을 참조합니다: ${assetPath}`);
        process.exit(1);
      }
      rmSync(assetPath);
    }
    if (orphanInstructorAssets.length > 0) {
      console.log(`학생 빌드에서 참조되지 않는 강사용 전용 asset ${orphanInstructorAssets.length}개 제거`);
    }
  }
  const rendering = spawnSync(
    process.execPath,
    [path.resolve('scripts', 'render-instructor-notes.mjs'), mode === 'pdf-review' ? 'student' : mode, outDir],
    {
      cwd: process.cwd(),
      env: runtimeEnvironment,
      stdio: 'inherit',
    },
  );
  if (rendering.status !== 0) {
    process.exit(rendering.status ?? 1);
  }

  if (mode === 'instructor') {
    const slideManifestGeneration = spawnSync(
      process.execPath,
      [path.resolve('scripts', 'generate-slide-manifests.mjs'), outDir],
      {
        cwd: process.cwd(),
        env: runtimeEnvironment,
        stdio: 'inherit',
      },
    );
    if (slideManifestGeneration.status !== 0) {
      process.exit(slideManifestGeneration.status ?? 1);
    }
  }

  if (mode === 'pdf-review') {
    console.log('PDF 검수 빌드: 제1–14차시 학생 본문, 강사 메모·콘솔·프레젠테이션 제외');
  } else {
    const verification = spawnSync(
      process.execPath,
      [path.resolve('scripts', 'verify-instructor-boundary.mjs'), mode, outDir],
      {
        cwd: process.cwd(),
        env: runtimeEnvironment,
        stdio: 'inherit',
      },
    );
    process.exit(verification.status ?? 1);
  }
}
