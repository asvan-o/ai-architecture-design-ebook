import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const outputDirectory = path.resolve('dist-instructor');
const port = Number.parseInt(process.env.LECTURE_PORT ?? '4321', 10);
const host = process.env.LECTURE_HOST ?? '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('LECTURE_PORT는 1–65535 사이의 포트 번호여야 합니다.');
  process.exit(1);
}

console.log('[lecture] 강사용 정적 빌드를 생성하고 보안 경계를 검사합니다.');
const build = spawnSync(
  process.execPath,
  [
    path.resolve('scripts', 'run-ebook-mode.mjs'),
    'build',
    'instructor',
    'dist-instructor',
  ],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  },
);

if (build.error) {
  console.error(build.error.message);
  process.exit(1);
}
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(outputDirectory)) {
  console.error('[lecture] dist-instructor 폴더를 찾을 수 없습니다.');
  process.exit(1);
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const resolveRequestPath = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, '');
  let candidate = path.resolve(outputDirectory, relative);
  const outputPrefix = `${outputDirectory}${path.sep}`;

  if (candidate !== outputDirectory && !candidate.startsWith(outputPrefix)) return null;

  try {
    const details = await stat(candidate);
    if (details.isDirectory()) candidate = path.join(candidate, 'index.html');
  } catch {
    if (!path.extname(candidate)) candidate = path.join(candidate, 'index.html');
  }

  if (!existsSync(candidate)) return null;
  const details = await stat(candidate);
  return details.isFile() ? candidate : null;
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const filePath = await resolveRequestPath(requestUrl.pathname);
    if (!filePath) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('페이지를 찾을 수 없습니다.');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('로컬 강의 서버 오류');
    console.error(error);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[lecture] ${port} 포트를 이미 사용 중입니다.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log('');
  console.log('[lecture] 로컬 강의 서버가 실행 중입니다.');
  console.log(`강사용 콘솔: http://localhost:${port}/instructor-console/lessons/01/`);
  console.log(`프로젝터 화면: http://localhost:${port}/presentation/lessons/01/`);
  console.log('종료: Ctrl+C');
});

let closing = false;
const closeServer = (signal) => {
  if (closing) return;
  closing = true;
  console.log(`\n[lecture] ${signal} 수신 · 서버를 종료합니다.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
};

process.on('SIGINT', () => closeServer('SIGINT'));
process.on('SIGTERM', () => closeServer('SIGTERM'));
