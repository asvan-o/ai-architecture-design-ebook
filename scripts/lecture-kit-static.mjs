import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import net from 'node:net';
import path from 'node:path';

export const LOOPBACK_HOST = '127.0.0.1';
export const PORT_RANGE = Object.freeze({ start: 4310, end: 4399 });

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.zip', 'application/zip'],
]);

const forbiddenSegments = new Set([
  '.git',
  '.github',
  'instructor-content',
  'node_modules',
  'source',
]);

const isForbiddenRequest = (relativePath) => {
  const segments = relativePath.split(/[\\/]+/).filter(Boolean);
  return segments.some((segment) => {
    const lower = segment.toLowerCase();
    return (
      forbiddenSegments.has(lower) ||
      lower === '.env' ||
      lower.startsWith('.env.') ||
      lower.endsWith('.yaml') ||
      lower.endsWith('.yml') ||
      lower.includes('private-key')
    );
  });
};

export const resolveStaticPath = async (rootDirectory, pathname) => {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { status: 400, filePath: null };
  }
  if (decoded.includes('\0') || decoded.includes('\\')) {
    return { status: 403, filePath: null };
  }

  const relative = decoded.replace(/^\/+/, '');
  if (isForbiddenRequest(relative)) return { status: 403, filePath: null };

  const root = path.resolve(rootDirectory);
  let candidate = path.resolve(root, relative || 'index.html');
  const rootPrefix = `${root}${path.sep}`;
  if (candidate !== root && !candidate.startsWith(rootPrefix)) {
    return { status: 403, filePath: null };
  }

  try {
    const details = await stat(candidate);
    if (details.isDirectory()) candidate = path.join(candidate, 'index.html');
  } catch {
    if (!path.extname(candidate)) candidate = path.join(candidate, 'index.html');
  }

  if (!existsSync(candidate)) return { status: 404, filePath: null };
  const details = await stat(candidate);
  if (!details.isFile()) return { status: 404, filePath: null };
  return { status: 200, filePath: candidate };
};

export const sendStaticFile = async (request, response, rootDirectory, pathname) => {
  if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405, {
      Allow: 'GET, HEAD',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('허용되지 않은 요청입니다.');
    return;
  }

  const resolved = await resolveStaticPath(rootDirectory, pathname);
  if (!resolved.filePath) {
    response.writeHead(resolved.status, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(resolved.status === 404 ? '페이지를 찾을 수 없습니다.' : '접근할 수 없습니다.');
    return;
  }

  const details = await stat(resolved.filePath);
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Length': String(details.size),
    'Content-Type': contentTypes.get(path.extname(resolved.filePath).toLowerCase()) ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(resolved.filePath).pipe(response);
};

export const isPortAvailable = (port, host = LOOPBACK_HOST) => new Promise((resolve) => {
  const probe = net.createServer();
  probe.unref();
  probe.once('error', () => resolve(false));
  probe.listen(port, host, () => probe.close(() => resolve(true)));
});

export const findAvailablePorts = async (count, start = PORT_RANGE.start, end = PORT_RANGE.end) => {
  const ports = [];
  for (let port = start; port <= end && ports.length < count; port += 1) {
    if (await isPortAvailable(port)) ports.push(port);
  }
  if (ports.length !== count) {
    throw new Error(`${start}-${end} 범위에서 ${count}개의 빈 포트를 찾지 못했습니다.`);
  }
  return ports;
};

export const createStaticServer = (rootDirectory) => createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    await sendStaticFile(request, response, rootDirectory, requestUrl.pathname);
  } catch (error) {
    response.writeHead(500, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('로컬 강의 서버 오류');
    console.error(error instanceof Error ? error.message : String(error));
  }
});

export const listen = (server, port, host = LOOPBACK_HOST) => new Promise((resolve, reject) => {
  const onError = (error) => {
    server.off('listening', onListening);
    reject(error);
  };
  const onListening = () => {
    server.off('error', onError);
    resolve();
  };
  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port, host);
});

export const closeServer = (server) => new Promise((resolve) => {
  if (!server.listening) {
    resolve();
    return;
  }
  server.close(() => resolve());
});
