import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildInfoFromOutputs, ensureDependencies, run, runNpm } from './lecture-kit-utils.mjs';
import { getCourseProfile, courseOutput } from './course-registry.mjs';

const rootDirectory = process.cwd();
const profile = getCourseProfile();
if (profile.course.contentStatus !== 'approved') throw new Error('강의 실행에는 승인된 과정이 필요합니다.');
const stateDirectory = path.join(rootDirectory, '.lecture-kit');

try {
  console.log('[lecture] 최신 소스로 학생용·강사용 강의 화면을 준비합니다.');
  await ensureDependencies(rootDirectory);
  for (const script of ['lint', 'typecheck', 'validate:content', 'validate:courses', 'build:student', 'build:instructor']) {
    console.log(`[lecture] npm run ${script}`);
    runNpm(['run', script], { cwd: rootDirectory });
  }

  const buildInfo = await buildInfoFromOutputs({
    rootDirectory,
    studentRoot: courseOutput(profile.course.courseId, 'student'),
    instructorRoot: courseOutput(profile.course.courseId, 'instructor'),
    kitVersion: 'source',
  });
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(path.join(stateDirectory, 'BUILD_INFO.json'), `${JSON.stringify(buildInfo, null, 2)}\n`, 'utf8');

  const serverArguments = [
    path.join(rootDirectory, 'scripts', 'lecture-kit-server.mjs'),
    '--mode', 'source',
    '--root', rootDirectory,
    '--student-root', courseOutput(profile.course.courseId, 'student'),
    '--instructor-root', courseOutput(profile.course.courseId, 'instructor'),
  ];
  if (process.argv.includes('--no-browser')) serverArguments.push('--no-browser');
  run(process.execPath, serverArguments, { cwd: rootDirectory });
} catch (error) {
  console.error(`[lecture] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
