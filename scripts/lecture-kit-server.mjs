import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import {
  LOOPBACK_HOST,
  closeServer,
  createStaticServer,
  findAvailablePorts,
  listen,
  sendStaticFile,
} from './lecture-kit-static.mjs';

const argumentsList = process.argv.slice(2);
const valueAfter = (name) => {
  const index = argumentsList.indexOf(name);
  return index >= 0 ? argumentsList[index + 1] : undefined;
};

const mode = valueAfter('--mode') === 'portable' ? 'portable' : 'source';
const rootDirectory = path.resolve(valueAfter('--root') ?? process.cwd());
const noBrowser = argumentsList.includes('--no-browser') || process.env.LECTURE_NO_BROWSER === '1';
const stateDirectory = path.resolve(
  valueAfter('--state-dir') ?? (mode === 'portable' ? path.join(rootDirectory, 'logs') : path.join(rootDirectory, '.lecture-kit')),
);
const statePath = path.join(stateDirectory, 'state.json');
const logPath = path.join(stateDirectory, 'lecture-kit.log');
const studentRoot = path.resolve(
  valueAfter('--student-root') ?? (mode === 'portable' ? path.join(rootDirectory, 'sites', 'student') : path.join(rootDirectory, 'dist')),
);
const instructorRoot = path.resolve(
  valueAfter('--instructor-root') ?? (mode === 'portable' ? path.join(rootDirectory, 'sites', 'instructor') : path.join(rootDirectory, 'dist-instructor')),
);
const hubRoot = path.resolve(
  valueAfter('--hub-root') ?? (mode === 'portable' ? path.join(rootDirectory, 'app', 'hub') : path.join(rootDirectory, 'lecture-kit', 'hub')),
);
const buildInfoPath = path.resolve(
  valueAfter('--build-info') ?? (mode === 'portable' ? path.join(rootDirectory, 'BUILD_INFO.json') : path.join(rootDirectory, '.lecture-kit', 'BUILD_INFO.json')),
);
const publicEbookUrl = 'https://asvan-o.github.io/ai-architecture-design-ebook/';

await mkdir(stateDirectory, { recursive: true });

const safeLog = async (message) => {
  const line = `[${new Date().toISOString()}] ${message.replaceAll(rootDirectory, '<KIT_ROOT>')}\n`;
  process.stdout.write(line);
  await writeFile(logPath, line, { flag: 'a', encoding: 'utf8' });
};

const readJson = async (filePath, fallback = null) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const openExternal = (target) => {
  try {
    const child = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '""', target], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
};

const openFolder = (target) => {
  try {
    const child = spawn('explorer.exe', [target], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
};

const existingState = await readJson(statePath);
if (existingState?.ports?.hub && existingState?.token) {
  try {
    const response = await fetch(`http://${LOOPBACK_HOST}:${existingState.ports.hub}/api/status`, {
      headers: { 'X-Lecture-Kit-Token': existingState.token },
      signal: AbortSignal.timeout(1500),
    });
    const status = response.ok ? await response.json() : null;
    if (status?.running && status?.pid === existingState.pid && status?.tokenValid) {
      const existingUrl = `http://${LOOPBACK_HOST}:${existingState.ports.hub}/`;
      await safeLog('기존 강의 서버를 확인했습니다. 새 서버를 만들지 않고 허브를 엽니다.');
      if (!noBrowser) openExternal(existingUrl);
      console.log(existingUrl);
      process.exit(0);
    }
  } catch {
    // Stale state is removed below.
  }
  await rm(statePath, { force: true });
}

for (const requiredDirectory of [studentRoot, instructorRoot, hubRoot]) {
  if (!existsSync(requiredDirectory)) {
    console.error(`[lecture-kit] 필요한 정적 폴더가 없습니다: ${path.basename(requiredDirectory)}`);
    process.exit(1);
  }
}

const [hubPort, studentPort, instructorPort] = await findAvailablePorts(3);
const token = randomBytes(24).toString('hex');
const buildInfo = await readJson(buildInfoPath, {
  kitVersion: 'source',
  buildTimestamp: new Date().toISOString(),
  gitHead: 'local-source',
});
const ports = { hub: hubPort, student: studentPort, instructor: instructorPort };
const startedAt = new Date().toISOString();
const state = { pid: process.pid, token, mode, ports, startedAt };
await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

const statusPayload = (request) => ({
  running: true,
  pid: process.pid,
  tokenValid: request.headers['x-lecture-kit-token'] === token,
  mode,
  ports,
  startedAt,
  buildInfo,
  publicEbookUrl,
});

let closing = false;
let hubServer;
const studentServer = createStaticServer(studentRoot);
const instructorServer = createStaticServer(instructorRoot);

const jsonResponse = (response, statusCode, body) => {
  const source = JSON.stringify(body);
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(source),
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(source);
};

const authorized = (request) => request.headers['x-lecture-kit-token'] === token;

const shutdown = async (reason) => {
  if (closing) return;
  closing = true;
  await safeLog(`${reason} · 강의 서버 3개를 안전하게 종료합니다.`);
  await Promise.all([closeServer(hubServer), closeServer(studentServer), closeServer(instructorServer)]);
  const latestState = await readJson(statePath);
  if (latestState?.pid === process.pid && latestState?.token === token) {
    await rm(statePath, { force: true });
  }
};

hubServer = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (requestUrl.pathname === '/api/status') {
      jsonResponse(response, 200, statusPayload(request));
      return;
    }
    if (requestUrl.pathname === '/api/open-pdf-folder') {
      if (request.method !== 'POST' || !authorized(request)) {
        jsonResponse(response, 403, { ok: false });
        return;
      }
      const pdfDirectory = mode === 'portable' ? path.join(rootDirectory, 'pdf') : path.join(studentRoot, 'downloads');
      const opened = openFolder(pdfDirectory);
      jsonResponse(response, opened ? 200 : 500, { ok: opened });
      return;
    }
    if (requestUrl.pathname === '/api/stop') {
      if (request.method !== 'POST' || !authorized(request)) {
        jsonResponse(response, 403, { ok: false });
        return;
      }
      jsonResponse(response, 200, { ok: true });
      setTimeout(() => shutdown('허브 종료 요청').then(() => process.exit(0)), 40);
      return;
    }
    if (requestUrl.pathname === '/') {
      const template = await readFile(path.join(hubRoot, 'index.html'), 'utf8');
      const body = template.replace('__LECTURE_KIT_TOKEN__', token);
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') response.end();
      else response.end(body);
      return;
    }
    if (requestUrl.pathname.startsWith('/hub/')) {
      await sendStaticFile(request, response, hubRoot, requestUrl.pathname.slice('/hub'.length));
      return;
    }
    response.writeHead(404, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('페이지를 찾을 수 없습니다.');
  } catch (error) {
    response.writeHead(500, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('강의 허브 오류');
    await safeLog(`허브 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
});

try {
  await listen(studentServer, studentPort);
  await listen(instructorServer, instructorPort);
  await listen(hubServer, hubPort);
} catch (error) {
  await shutdown('시작 실패');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const hubUrl = `http://${LOOPBACK_HOST}:${hubPort}/`;
await safeLog(`강의 허브 실행: ${hubUrl}`);
await safeLog(`학생 e-book: http://${LOOPBACK_HOST}:${studentPort}/lessons/01/`);
await safeLog(`강사용 콘솔: http://${LOOPBACK_HOST}:${instructorPort}/instructor-console/lessons/01/`);
await safeLog(`프로젝터 화면: http://${LOOPBACK_HOST}:${instructorPort}/presentation/lessons/01/`);

if (!noBrowser && !openExternal(hubUrl)) {
  await safeLog('브라우저 자동 열기에 실패했습니다. 위 주소를 직접 여세요. 서버는 계속 실행됩니다.');
}

process.on('SIGINT', () => shutdown('Ctrl+C').then(() => process.exit(0)));
process.on('SIGTERM', () => shutdown('종료 신호').then(() => process.exit(0)));
process.on('uncaughtException', (error) => {
  safeLog(`예기치 않은 오류: ${error.message}`).finally(() => shutdown('오류 종료').then(() => process.exit(1)));
});
