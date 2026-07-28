import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const lessonsDirectory = path.resolve('src/content/lessons');
const requiredIds = Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'));
const requiredFields = [
  'title',
  'day',
  'date',
  'durationMinutes',
  'lastVerified',
  'draft',
  'contentType',
  'authorship',
  'verificationStatus',
  'freshness',
  'riskLevel',
  'professionalReviewStatus',
  'sources',
];

const errors = [];
const dayToFiles = new Map();

const readFrontmatter = (source, fileName) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push(`${fileName}: frontmatter 블록이 없습니다.`);
    return '';
  }
  return match[1];
};

const getScalar = (frontmatter, field) => {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
  return match?.[1].trim();
};

const unquote = (value = '') => value.replace(/^(['"])(.*)\1$/, '$2');

const files = (await readdir(lessonsDirectory))
  .filter((fileName) => fileName.endsWith('.mdx'))
  .sort();

if (files.length !== 14) {
  errors.push(`강의 파일 수: 예상 14개, 실제 ${files.length}개`);
}

const actualIds = files.map((fileName) => path.basename(fileName, '.mdx'));
for (const id of requiredIds) {
  if (!actualIds.includes(id)) errors.push(`누락된 강의 ID: ${id}`);
}
for (const id of actualIds) {
  if (!requiredIds.includes(id)) errors.push(`허용되지 않은 강의 ID: ${id}`);
}

for (const fileName of files) {
  const id = path.basename(fileName, '.mdx');
  const source = await readFile(path.join(lessonsDirectory, fileName), 'utf8');
  const frontmatter = readFrontmatter(source, fileName);

  for (const field of requiredFields) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
      errors.push(`${fileName}: 필수 metadata '${field}'가 없습니다.`);
    }
  }

  const title = unquote(getScalar(frontmatter, 'title'));
  if (!title) errors.push(`${fileName}: title은 빈 문자열일 수 없습니다.`);

  const day = Number(getScalar(frontmatter, 'day'));
  if (!Number.isInteger(day) || day < 1 || day > 14) {
    errors.push(`${fileName}: day는 1부터 14 사이의 정수여야 합니다.`);
  } else {
    const matchingFiles = dayToFiles.get(day) ?? [];
    matchingFiles.push(fileName);
    dayToFiles.set(day, matchingFiles);
    if (id !== String(day).padStart(2, '0')) {
      errors.push(`${fileName}: 파일 ID ${id}와 day ${day}가 일치하지 않습니다.`);
    }
  }

  const date = unquote(getScalar(frontmatter, 'date'));
  if (date !== 'pending' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push(`${fileName}: date는 YYYY-MM-DD 또는 pending이어야 합니다.`);
  }

  const duration = getScalar(frontmatter, 'durationMinutes');
  if (duration !== 'null' && (!Number.isInteger(Number(duration)) || Number(duration) <= 0)) {
    errors.push(`${fileName}: durationMinutes는 양의 정수 또는 null이어야 합니다.`);
  }

  const lastVerified = unquote(getScalar(frontmatter, 'lastVerified'));
  if (lastVerified !== 'null' && !/^\d{4}-\d{2}-\d{2}$/.test(lastVerified)) {
    errors.push(`${fileName}: lastVerified는 YYYY-MM-DD 또는 null이어야 합니다.`);
  }
}

for (let day = 1; day <= 14; day += 1) {
  const matchingFiles = dayToFiles.get(day) ?? [];
  if (matchingFiles.length === 0) errors.push(`누락된 day: ${day}`);
  if (matchingFiles.length > 1) errors.push(`중복 day ${day}: ${matchingFiles.join(', ')}`);
}

if (errors.length > 0) {
  console.error('콘텐츠 무결성 검사 실패');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('콘텐츠 무결성 검사 성공');
console.log('- 강의 파일: 14개');
console.log('- ID: 01–14 누락·중복 없음');
console.log('- day: 1–14 누락·중복 없음');
console.log('- ID/day 일치');
console.log(`- 필수 metadata: ${requiredFields.join(', ')}`);
