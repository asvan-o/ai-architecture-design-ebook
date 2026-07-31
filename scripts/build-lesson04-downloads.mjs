import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createZipFromEntries } from '../tools/ai-architecture-project-manager/기능/zip.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const managerRoot = path.join(repositoryRoot, 'tools', 'ai-architecture-project-manager');
const outputRoot = path.join(repositoryRoot, 'src', 'assets', 'lessons', '04', 'workspace');
const projectDirectory = 'AI_건축_캠퍼스라운지';
const programDirectory = `${projectDirectory}/관리프로그램`;
const outputFileName = 'AI_건축_캠퍼스라운지_복구본.zip';
const runtimeDirectories = new Set([
  '01_REFERENCE',
  '02_ANALYSIS',
  '03_ALTERNATIVES',
  '04_SELECTED',
  '05_VALIDATION',
  '06_DELIVERY',
  '_SYSTEM',
  '01_기준자료',
  '02_분석자료',
  '03_공간대안',
  '04_선택안',
  '05_확인기록',
  '06_제출파일',
  '관리데이터',
  'lib',
  'public',
  'test',
]);

const posix = (value) => value.replaceAll('\\', '/');

async function collectManagerEntries(current, entries) {
  for (const directoryEntry of await readdir(current, { withFileTypes: true })) {
    if (directoryEntry.name === 'node_modules' || directoryEntry.name.startsWith('.')) continue;
    if (current === managerRoot && runtimeDirectories.has(directoryEntry.name)) continue;
    const absolutePath = path.join(current, directoryEntry.name);
    const relativePath = posix(path.relative(managerRoot, absolutePath));
    if (directoryEntry.isDirectory()) {
      entries.push({
        name: `${programDirectory}/${relativePath}/`,
        data: Buffer.alloc(0),
      });
      await collectManagerEntries(absolutePath, entries);
    } else if (directoryEntry.isFile()) {
      entries.push({
        name: `${programDirectory}/${relativePath}`,
        data: await readFile(absolutePath),
      });
    }
  }
}

const workspaceDirectories = [
  '01_기준자료/발주요청서_RFP/',
  '01_기준자료/현황평면도/',
  '01_기준자료/현황이미지/',
  '02_분석자료/요구조건/',
  '02_분석자료/추가질의/',
  '02_분석자료/디자인브리프/',
  '03_공간대안/대안-A/',
  '03_공간대안/대안-B/',
  '04_선택안/',
  '05_확인기록/',
  '06_제출파일/',
  '관리데이터/원본보관/',
];

const readyEntries = [];
await collectManagerEntries(managerRoot, readyEntries);
for (const directory of workspaceDirectories) {
  readyEntries.push({
    name: `${projectDirectory}/${directory}`,
    data: Buffer.alloc(0),
  });
}
await createZipFromEntries(
  readyEntries,
  path.join(outputRoot, outputFileName),
);

console.log('제4차시 READY ZIP 생성 완료');
console.log(`- READY: ${path.join(outputRoot, outputFileName)}`);
