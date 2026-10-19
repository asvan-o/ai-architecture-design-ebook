import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { getCourseProfile, courseOutput, courseBuildEnvironment } from './course-registry.mjs';
import { reuseApprovedPdfs } from './approved-pdfs.mjs';
import { verifyDraftOutput } from './draft-output.mjs';
import { writeDaejeonLocalAssets } from './daejeon-local-assets.mjs';

const [command, mode, ...argumentsList] = process.argv.slice(2);
const courseArgument = argumentsList.find((item) => item.startsWith('--course='));
const profile = getCourseProfile(courseArgument?.slice('--course='.length) || process.env.COURSE_ID || (command === 'dev' ? 'daejeon-2026' : undefined));
const outDir = courseOutput(profile.course.courseId, mode);
const extraArguments = argumentsList.filter((item) => item !== courseArgument);
const allowedCommands = ['dev', 'build'];
const allowedModes = ['student', 'instructor', 'pdf-review'];

if (!allowedCommands.includes(command) || !allowedModes.includes(mode)) {
  console.error('사용법: node scripts/run-ebook-mode.mjs <dev|build> <student|instructor|pdf-review> [--course=<courseId>]');
  process.exit(1);
}

const astroCli = path.resolve('node_modules', 'astro', 'bin', 'astro.mjs');
const astroArguments = [astroCli, command];
const gitHead = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  windowsHide: true,
}).stdout?.trim();
const runtimeEnvironment = courseBuildEnvironment(profile, mode, gitHead || 'local-working-tree');
// Exercise packages belong only to the isolated local review build.
runtimeEnvironment.PUBLIC_DAEJEON_REVIEW_ASSETS = profile.course.courseId === 'daejeon-2026' ? 'true' : 'false';
if (profile.course.courseId === 'daejeon-2026') runtimeEnvironment.PUBLIC_ENABLE_DAEJEON_PREVIEW = 'true';
runtimeEnvironment.PUBLIC_PDF_DOWNLOADS_ENABLED = profile.pdfs.policy === 'preserve-approved-artifact' ? 'true' : 'false';
if (extraArguments.some((argument) => !argument.startsWith('-') || /^(?:--outDir|--mode|--base)(?:=|$)/.test(argument))) {
  throw new Error('Output, base and mode are managed by the course profile. Use --course=<courseId>.');
}

if (command === 'dev') {
  astroArguments.push(
    '--background',
    '--mode',
    mode,
    ...extraArguments,
  );
} else {
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
  if (profile.course.contentStatus === 'design-pending') {
    const isDaejeon = profile.course.courseId === 'daejeon-2026';
    if (isDaejeon) writeDaejeonLocalAssets(outDir);
    const routes = verifyDraftOutput(profile.course, outDir, { localReviewAssets: isDaejeon });
    console.log(`[draft] ${profile.course.courseId}/${mode}: design-pending; ${routes.length} review/landing pages; no approved curriculum or PDFs`);
    writeFileSync(path.join(outDir, 'course-build.json'), JSON.stringify({ courseId: profile.course.courseId, mode, basePath: runtimeEnvironment.BASE_PATH, buildId: runtimeEnvironment.PUBLIC_LECTURE_BUILD_ID }));
    process.exit(0);
  }
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

  {
    const verification = spawnSync(
      process.execPath,
      [path.resolve('scripts', 'verify-instructor-boundary.mjs'), mode === 'pdf-review' ? 'student' : mode, outDir],
      {
        cwd: process.cwd(),
        env: runtimeEnvironment,
        stdio: 'inherit',
      },
    );
    if (verification.status !== 0) process.exit(verification.status ?? 1);
  }
  await reuseApprovedPdfs(profile, outDir);
  writeFileSync(path.join(outDir, 'course-build.json'), JSON.stringify({ courseId: profile.course.courseId, mode, basePath: runtimeEnvironment.BASE_PATH, buildId: runtimeEnvironment.PUBLIC_LECTURE_BUILD_ID }));
}
