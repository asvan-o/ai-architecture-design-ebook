import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildInfoFromOutputs } from './lecture-kit-utils.mjs';
import { repositoryRoot, courseOutput } from './course-registry.mjs';

const courseId = 'gwangju-2026';
const stateDirectory = path.join(repositoryRoot, 'tmp', `course-hub-test-${process.pid}`);
await mkdir(stateDirectory, { recursive: true });
const studentRoot = courseOutput(courseId, 'student');
const instructorRoot = courseOutput(courseId, 'instructor');
const info = await buildInfoFromOutputs({ rootDirectory: repositoryRoot, studentRoot, instructorRoot, kitVersion: 'source-test' });
const infoPath = path.join(stateDirectory, 'BUILD_INFO.json');
await writeFile(infoPath, JSON.stringify(info));
const child = spawn(process.execPath, ['scripts/lecture-kit-server.mjs', '--mode', 'source', '--root', repositoryRoot, '--student-root', studentRoot, '--instructor-root', instructorRoot, '--state-dir', stateDirectory, '--build-info', infoPath, '--no-browser'], { cwd: repositoryRoot, env: { ...process.env, COURSE_ID: courseId }, stdio: 'ignore', windowsHide: true });
const exited = new Promise((resolve) => child.once('exit', resolve));
let state;
let browser;
try {
  for (let attempt = 0; attempt < 100 && !state; attempt++) {
    try { state = JSON.parse(await readFile(path.join(stateDirectory, 'state.json'), 'utf8')); }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  assert(state, 'Local course hub failed to start');
  const hub = `http://127.0.0.1:${state.ports.hub}`;
  const status = await (await fetch(`${hub}/api/status`)).json();
  assert.equal(status.buildInfo.courseId, courseId);
  assert.equal(status.buildInfo.pdfSourceGitSha, 'cdc99d788b9506344872c865730cd9cf002f16ec');
  const base = status.buildInfo.courseBasePath.replace(/\/$/, '');
  for (const [port, route] of [[state.ports.student, '/lessons/14/'], [state.ports.student, '/downloads/pdf-manifest.json'], [state.ports.instructor, '/instructor-console/lessons/14/'], [state.ports.instructor, '/presentation/lessons/14/']]) assert.equal((await fetch(`http://127.0.0.1:${port}${base}${route}`)).status, 200);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(hub);
  await page.waitForFunction(() => document.querySelector('#student-course-overview').href.includes('/gwangju/'));
  assert.equal(await page.locator('#student-course-overview').getAttribute('href'), `http://127.0.0.1:${state.ports.student}${base}/course-overview/`);
  const opened = page.waitForEvent('popup');
  await page.locator('[data-open="presentation"]').click();
  const popup = await opened;
  await popup.waitForLoadState('domcontentloaded');
  assert(popup.url().includes(`${base}/presentation/lessons/01/`));
  console.log('[course hub] source runtime, scoped navigation, lesson 14, presentation popup and preserved PDF source verified');
} finally {
  await browser?.close();
  if (state) {
    try { await fetch(`http://127.0.0.1:${state.ports.hub}/api/stop`, { method: 'POST', headers: { 'X-Lecture-Kit-Token': state.token }, signal: AbortSignal.timeout(3000) }); }
    catch { child.kill(); }
  } else child.kill();
  await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3000))]);
  if (child.exitCode === null) child.kill();
}
