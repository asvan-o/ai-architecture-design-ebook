import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './기능/app.mjs';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot =
  path.basename(moduleDirectory) === '관리프로그램'
    ? path.resolve(moduleDirectory, '..')
    : moduleDirectory;
const projectRoot = path.resolve(process.env.PROJECT_ROOT || defaultProjectRoot);
const port = Number(process.env.PORT || 4174);
const app = createApp({ projectRoot });

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`캠퍼스 라운지 프로젝트 관리: http://127.0.0.1:${port}`);
  console.log(`프로젝트 폴더: ${projectRoot}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
