import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { isPortAvailable } from './lecture-kit-static.mjs';

const argumentsList = process.argv.slice(2);
const valueAfter = (name) => {
  const index = argumentsList.indexOf(name);
  return index >= 0 ? argumentsList[index + 1] : undefined;
};
const kitRoot = path.resolve(valueAfter('--root') ?? path.join('release', 'AI_건축디자인_강의키트_windows_x64'));
const keepLogs = argumentsList.includes('--keep-logs');
const runtimeNode = path.join(kitRoot, 'runtime', 'node.exe');
const serverScript = path.join(kitRoot, 'app', 'lecture-kit-server.mjs');
const statePath = path.join(kitRoot, 'logs', 'state.json');

if (!existsSync(runtimeNode) || !existsSync(serverScript)) {
  console.error('[verify-kit] 휴대용 runtime 또는 서버 파일을 찾을 수 없습니다.');
  process.exit(1);
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const waitForState = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return JSON.parse(await readFile(statePath, 'utf8'));
    } catch {
      await sleep(100);
    }
  }
  throw new Error('강의 서버 상태 파일이 생성되지 않았습니다.');
};

const requireHttp = async (url, expected = 200) => {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
  if (response.status !== expected) throw new Error(`${url} 응답 ${response.status}, 예상 ${expected}`);
  return response;
};

const collectText = async (directory) => {
  const chunks = [];
  const visit = async (current) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      else if (/\.(?:html|js|mjs|json|map|txt|xml|css)$/i.test(entry.name)) chunks.push(await readFile(entryPath, 'utf8'));
    }
  };
  await visit(directory);
  return chunks.join('\n');
};

await rm(statePath, { force: true });
const child = spawn(runtimeNode, [serverScript, '--mode', 'portable', '--root', kitRoot, '--no-browser'], {
  cwd: kitRoot,
  env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: path.join(kitRoot, 'runtime') },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});
let output = '';
child.stdout.on('data', (chunk) => { output += chunk.toString(); });
child.stderr.on('data', (chunk) => { output += chunk.toString(); });

let state;
try {
  state = await waitForState();
  const hubOrigin = `http://127.0.0.1:${state.ports.hub}`;
  const studentOrigin = `http://127.0.0.1:${state.ports.student}`;
  const instructorOrigin = `http://127.0.0.1:${state.ports.instructor}`;

  await requireHttp(`${hubOrigin}/`);
  await requireHttp(`${hubOrigin}/hub/style.css`);
  for (const lesson of ['01', '02', '03', '04']) {
    await requireHttp(`${studentOrigin}/lessons/${lesson}/`);
  }
  for (let day = 1; day <= 14; day += 1) {
    const lesson = String(day).padStart(2, '0');
    await requireHttp(`${instructorOrigin}/instructor-console/lessons/${lesson}/`);
    await requireHttp(`${instructorOrigin}/presentation/lessons/${lesson}/`);
  }
  await requireHttp(`${studentOrigin}/downloads/ai-architecture-design-course.pdf`);
  await requireHttp(`${studentOrigin}/%2e%2e/%2eenv`, 403);
  await requireHttp(`${instructorOrigin}/source/approved-curriculum.md`, 403);
  await requireHttp(`${instructorOrigin}/instructor-content/lessons/01.yaml`, 403);

  const studentSource = await collectText(path.join(kitRoot, 'sites', 'student'));
  const forbidden = [
    'ai-architecture-presenter',
    'data-instructor-note-slot',
    'INSTRUCTOR CONSOLE · LOCAL ONLY',
    '/instructor-console/lessons/',
    '/presentation/lessons/',
    'instructor-content/',
  ].filter((marker) => studentSource.includes(marker));
  if (forbidden.length > 0) throw new Error(`학생 산출물 경계 위반: ${forbidden.join(', ')}`);
  if ((await readdir(path.join(kitRoot, 'sites', 'student'), { recursive: true })).some((name) => /\.ya?ml$/i.test(name))) {
    throw new Error('학생 산출물에 YAML 파일이 있습니다.');
  }

  const stopResponse = await fetch(`${hubOrigin}/api/stop`, {
    method: 'POST',
    headers: { 'X-Lecture-Kit-Token': state.token },
    signal: AbortSignal.timeout(3000),
  });
  if (!stopResponse.ok) throw new Error('안전 종료 API가 실패했습니다.');
  await new Promise((resolve) => child.once('exit', resolve));
  await sleep(150);
  for (const port of Object.values(state.ports)) {
    if (!(await isPortAvailable(port))) throw new Error(`${port} 포트가 종료 후 해제되지 않았습니다.`);
  }
  console.log('[verify-kit] 휴대용 강의키트 기본 검증 성공');
  console.log(`- ports: ${state.ports.hub}, ${state.ports.student}, ${state.ports.instructor}`);
  console.log('- 학생 1~4차시, 강사 콘솔·프로젝터 1~14차시, 전체 PDF HTTP 200');
  console.log('- 학생용 강사 메모·발표자 코드·YAML 경계 통과');
  console.log('- 경로 차단 및 안전 종료 후 포트 해제 통과');
} catch (error) {
  child.kill();
  console.error(`[verify-kit] ${error instanceof Error ? error.message : String(error)}`);
  if (output.trim()) console.error(output.trim());
  process.exitCode = 1;
} finally {
  if (!keepLogs) await rm(statePath, { force: true });
}
