import { constants as fsConstants } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import {
  access,
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { createZipFromEntries } from './zip.mjs';

export const PROJECT_DIRECTORY_NAME = 'AI_건축_캠퍼스라운지';
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_FILE_NAME_LENGTH = 180;

export const WORKSPACE_DIRECTORIES = [
  '01_기준자료/발주요청서_RFP',
  '01_기준자료/현황평면도',
  '01_기준자료/현황이미지',
  '02_분석자료/요구조건',
  '02_분석자료/추가질의',
  '02_분석자료/디자인브리프',
  '03_공간대안/대안-A',
  '03_공간대안/대안-B',
  '04_선택안',
  '05_확인기록',
  '06_제출파일',
  '관리데이터/원본보관',
];

const SUBMISSION_DIRECTORIES = WORKSPACE_DIRECTORIES.filter(
  (directory) => !directory.startsWith('관리데이터/') && directory !== '06_제출파일',
);

export const AREAS = [
  { key: 'reference', label: '기준자료' },
  { key: 'analysis', label: '요구분석·디자인 브리프' },
  { key: 'alt-a', label: '대안 A' },
  { key: 'alt-b', label: '대안 B' },
  { key: 'selected-validation', label: '선택안·검증' },
  { key: 'delivery', label: '최종 제출' },
];

export const TYPES = {
  RFP: {
    label: '발주요청서(RFP)',
    area: 'reference',
    directory: '01_기준자료/발주요청서_RFP',
    code: '발주요청서_RFP',
  },
  PLAN: {
    label: '현황 평면도',
    area: 'reference',
    directory: '01_기준자료/현황평면도',
    code: '현황평면도',
  },
  EXISTING: {
    label: '교육용 현황 이미지',
    area: 'reference',
    directory: '01_기준자료/현황이미지',
    code: '현황이미지',
  },
  REQUIREMENTS: {
    label: '요구조건 매트릭스',
    area: 'analysis',
    directory: '02_분석자료/요구조건',
    code: '요구조건',
  },
  QUESTIONS: {
    label: '추가 질의',
    area: 'analysis',
    directory: '02_분석자료/추가질의',
    code: '추가질의',
  },
  BRIEF: {
    label: '디자인 브리프',
    area: 'analysis',
    directory: '02_분석자료/디자인브리프',
    code: '디자인브리프',
  },
  EXISTING_CANDIDATE: {
    label: '평면도 기반 현황 이미지 후보',
    area: 'reference',
    directory: '01_기준자료/현황이미지',
    code: '현황이미지_후보',
  },
  EXISTING_REVISED: {
    label: '수정된 현황 이미지 후보',
    area: 'reference',
    directory: '01_기준자료/현황이미지',
    code: '현황이미지_수정후보',
  },
  MISMATCH_LOG: {
    label: '평면도·이미지 불일치 기록',
    area: 'selected-validation',
    directory: '05_확인기록',
    code: '평면도_이미지_불일치',
  },
  EVALUATION_CRITERIA: {
    label: '제4차시 대안 평가기준',
    area: 'analysis',
    directory: '02_분석자료/디자인브리프',
    code: '대안_평가기준',
  },
  STRATEGY_A: {
    label: '대안 A 전략',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_전략',
  },
  ZONING_A: {
    label: '대안 A 조닝',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_조닝',
  },
  PROMPT_A: {
    label: '대안 A 이미지 요청문',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_이미지요청문',
  },
  IMAGE_A: {
    label: '대안 A 이미지',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_이미지',
  },
  STRATEGY_B: {
    label: '대안 B 전략',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_전략',
  },
  ZONING_B: {
    label: '대안 B 조닝',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_조닝',
  },
  PROMPT_B: {
    label: '대안 B 이미지 요청문',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_이미지요청문',
  },
  IMAGE_B: {
    label: '대안 B 이미지',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_이미지',
  },
  COMPARISON: {
    label: 'RFP 기준 대안 비교표',
    area: 'selected-validation',
    directory: '05_확인기록',
    code: 'RFP_대안비교표',
  },
  REVISION_PROMPT: {
    label: '선택안 수정 요청문',
    area: 'selected-validation',
    directory: '04_선택안',
    code: '선택안_수정요청문',
  },
  SELECTED_IMAGE: {
    label: '선택안 수정 이미지',
    area: 'selected-validation',
    directory: '04_선택안',
    code: '선택안_수정이미지',
  },
  VALIDATION: {
    label: '기타 확인 기록',
    area: 'selected-validation',
    directory: '05_확인기록',
    code: '기타_확인기록',
  },
};

export const REQUIRED_ITEMS = [
  { lesson: 3, type: 'RFP', group: '공통 기준자료' },
  { lesson: 3, type: 'PLAN', group: '공통 기준자료' },
  { lesson: 3, type: 'EXISTING', group: '공통 기준자료' },
  { lesson: 3, type: 'REQUIREMENTS', group: '제3차시 결과물' },
  { lesson: 3, type: 'QUESTIONS', group: '제3차시 결과물' },
  { lesson: 3, type: 'BRIEF', group: '제3차시 결과물' },
  { lesson: 3, type: 'EXISTING_CANDIDATE', group: '제3차시 결과물' },
  { lesson: 3, type: 'EXISTING_REVISED', group: '제3차시 결과물' },
  { lesson: 3, type: 'MISMATCH_LOG', group: '제3차시 결과물' },
  { lesson: 3, type: 'EVALUATION_CRITERIA', group: '제3차시 결과물' },
  { lesson: 4, type: 'STRATEGY_A', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'ZONING_A', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'IMAGE_A', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'STRATEGY_B', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'ZONING_B', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'IMAGE_B', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'COMPARISON', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'REVISION_PROMPT', group: '제4차시 필수 제출물' },
  { lesson: 4, type: 'SELECTED_IMAGE', group: '제4차시 필수 제출물' },
];

export const LESSON_TYPE_MAP = Object.freeze({
  3: Object.freeze([
    'RFP', 'PLAN', 'EXISTING', 'REQUIREMENTS', 'QUESTIONS', 'BRIEF',
    'EXISTING_CANDIDATE', 'EXISTING_REVISED', 'MISMATCH_LOG', 'EVALUATION_CRITERIA',
  ]),
  4: Object.freeze([
    'STRATEGY_A', 'ZONING_A', 'PROMPT_A', 'IMAGE_A',
    'STRATEGY_B', 'ZONING_B', 'PROMPT_B', 'IMAGE_B',
    'COMPARISON', 'REVISION_PROMPT', 'SELECTED_IMAGE', 'VALIDATION',
  ]),
});

const EXTENSION_RULES = {
  '.pdf': { mediaTypes: ['application/pdf'], signature: (buffer) => buffer.subarray(0, 5).toString() === '%PDF-' },
  '.png': { mediaTypes: ['image/png'], signature: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  '.jpg': { mediaTypes: ['image/jpeg'], signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  '.jpeg': { mediaTypes: ['image/jpeg'], signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  '.webp': { mediaTypes: ['image/webp'], signature: (buffer) => buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP' },
  '.docx': { mediaTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], signature: (buffer) => buffer.subarray(0, 2).toString() === 'PK' },
  '.xlsx': { mediaTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], signature: (buffer) => buffer.subarray(0, 2).toString() === 'PK' },
  '.pptx': { mediaTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'], signature: (buffer) => buffer.subarray(0, 2).toString() === 'PK' },
  '.txt': { mediaTypes: ['text/plain'], text: true },
  '.md': { mediaTypes: ['text/markdown', 'text/plain'], text: true },
  '.csv': { mediaTypes: ['text/csv', 'application/vnd.ms-excel', 'text/plain'], text: true },
  '.json': { mediaTypes: ['application/json', 'text/json', 'text/plain'], text: true, json: true },
};

export const ALLOWED_EXTENSIONS = Object.freeze(Object.keys(EXTENSION_RULES));

const projectLocks = new Map();

const createError = (message, code, details = {}) => Object.assign(new Error(message), { code, ...details });
const normalizeRelativePath = (value) => String(value).replaceAll('\\', '/').replace(/^\/+/, '');
const isInside = (root, target) => {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

export function assertProjectRoot(projectRoot) {
  const root = path.resolve(projectRoot);
  if (path.basename(root) !== PROJECT_DIRECTORY_NAME || path.parse(root).root === root) {
    throw createError(
      `프로젝트 루트는 ${PROJECT_DIRECTORY_NAME} 폴더여야 합니다.`,
      'INVALID_PROJECT_ROOT',
    );
  }
  return root;
}

export function safeResolve(projectRoot, ...segments) {
  const root = path.resolve(projectRoot);
  const target = path.resolve(root, ...segments);
  if (!isInside(root, target)) {
    throw createError('프로젝트 루트 밖에는 접근할 수 없습니다.', 'OUTSIDE_PROJECT_ROOT');
  }
  return target;
}

async function verifyPathBoundary(projectRoot, target, { allowMissing = false } = {}) {
  const root = assertProjectRoot(projectRoot);
  const rootStats = await lstat(root);
  if (rootStats.isSymbolicLink()) {
    throw createError('프로젝트 루트는 링크 경로일 수 없습니다.', 'UNSAFE_PATH');
  }
  const realRoot = await realpath(root);
  if (!isInside(realRoot, await realpath(root))) {
    throw createError('프로젝트 루트의 실제 경로를 확인할 수 없습니다.', 'UNSAFE_PATH');
  }

  const relative = path.relative(root, target);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const stats = await lstat(current);
      if (stats.isSymbolicLink()) {
        throw createError('프로젝트 밖으로 연결된 링크 경로는 사용할 수 없습니다.', 'UNSAFE_PATH');
      }
      const actual = await realpath(current);
      if (!isInside(realRoot, actual)) {
        throw createError('프로젝트 밖의 실제 경로에는 접근할 수 없습니다.', 'OUTSIDE_PROJECT_ROOT');
      }
    } catch (error) {
      if (error.code === 'ENOENT' && allowMissing) break;
      throw error;
    }
  }
  return target;
}

export async function resolveVerifiedPath(projectRoot, ...segments) {
  const target = safeResolve(projectRoot, ...segments);
  return verifyPathBoundary(projectRoot, target);
}

async function resolveCreatablePath(projectRoot, ...segments) {
  const target = safeResolve(projectRoot, ...segments);
  return verifyPathBoundary(projectRoot, target, { allowMissing: true });
}

async function withProjectLock(projectRoot, task) {
  const key = path.resolve(projectRoot).toLocaleLowerCase('en-US');
  const previous = projectLocks.get(key) ?? Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  projectLocks.set(key, current);
  await previous.catch(() => undefined);
  try {
    return await task();
  } finally {
    release();
    if (projectLocks.get(key) === current) projectLocks.delete(key);
  }
}

const indexPath = (projectRoot) => safeResolve(projectRoot, '관리데이터', '등록목록.json');

export async function initializeWorkspace(projectRoot) {
  const root = assertProjectRoot(projectRoot);
  await mkdir(root, { recursive: true });
  await verifyPathBoundary(root, root);
  for (const directory of WORKSPACE_DIRECTORIES) {
    const target = await resolveCreatablePath(root, directory);
    await mkdir(target, { recursive: true });
    await verifyPathBoundary(root, target);
  }
  const target = indexPath(root);
  try {
    await access(target);
    await verifyPathBoundary(root, target);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(
      target,
      JSON.stringify({ schemaVersion: 2, updatedAt: null, assets: [] }, null, 2),
      { encoding: 'utf8', flag: 'wx' },
    ).catch((writeError) => {
      if (writeError.code !== 'EEXIST') throw writeError;
    });
  }
}

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const isSha256 = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export function validateIndex(index) {
  if (!index || typeof index !== 'object' || !Array.isArray(index.assets)) {
    throw createError('등록목록 JSON 구조가 올바르지 않습니다.', 'INVALID_INDEX');
  }
  if (![1, 2].includes(index.schemaVersion)) {
    throw createError('지원하지 않는 등록목록 버전입니다.', 'INVALID_INDEX');
  }
  for (const asset of index.assets) {
    const typeDefinition = TYPES[asset.type];
    const isDelivery = asset.type === 'DELIVERY_ZIP' && asset.area === 'delivery';
    const safeRelative = normalizeRelativePath(asset.relativePath);
    if (
      !asset || typeof asset !== 'object' || typeof asset.id !== 'string' ||
      !isPositiveInteger(asset.lesson) || asset.lesson > 14 ||
      (!isDelivery && (!typeDefinition || typeDefinition.area !== asset.area)) ||
      typeof asset.fileName !== 'string' || typeof asset.originalName !== 'string' ||
      safeRelative !== asset.relativePath || safeRelative.includes('../') ||
      path.isAbsolute(asset.relativePath) || !isPositiveInteger(asset.version) ||
      !isSha256(asset.sha256) || !Number.isInteger(asset.size) || asset.size < 0 ||
      typeof asset.createdAt !== 'string'
    ) {
      throw createError('등록목록에 형식이 잘못된 항목이 있습니다.', 'INVALID_INDEX');
    }
    if (!isDelivery && !safeRelative.startsWith(`${typeDefinition.directory}/`)) {
      throw createError('등록목록의 파일 위치와 자료 유형이 일치하지 않습니다.', 'INVALID_INDEX');
    }
  }
  return index;
}

async function readIndexUnlocked(projectRoot) {
  await initializeWorkspace(projectRoot);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(await resolveVerifiedPath(projectRoot, '관리데이터', '등록목록.json'), 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createError('등록목록 JSON이 손상되었습니다. 원본 파일을 보존한 채 관리자에게 확인을 요청하세요.', 'INVALID_INDEX');
    }
    throw error;
  }
  return validateIndex(parsed);
}

export async function readIndex(projectRoot) {
  return readIndexUnlocked(projectRoot);
}

async function writeIndex(projectRoot, index) {
  validateIndex(index);
  const nextIndex = { ...index, schemaVersion: 2, updatedAt: new Date().toISOString() };
  const target = await resolveVerifiedPath(projectRoot, '관리데이터', '등록목록.json');
  const temporary = await resolveCreatablePath(
    projectRoot,
    '관리데이터',
    `등록목록.json.tmp-${randomUUID()}`,
  );
  try {
    await writeFile(temporary, JSON.stringify(nextIndex, null, 2), { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

function validateOriginalName(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > MAX_FILE_NAME_LENGTH) {
    throw createError(`파일명은 1~${MAX_FILE_NAME_LENGTH}자여야 합니다.`, 'INVALID_FILE');
  }
  const normalized = value.normalize('NFKC');
  if (path.basename(normalized) !== normalized || /[<>:"/\\|?*\u0000-\u001f]/.test(normalized)) {
    throw createError('경로 문자나 Windows 위험 문자가 포함된 파일명은 사용할 수 없습니다.', 'INVALID_FILE');
  }
  if (/[. ]$/.test(normalized) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(normalized)) {
    throw createError('Windows에서 사용할 수 없는 파일명입니다.', 'INVALID_FILE');
  }
  return normalized;
}

function validateFile(originalName, buffer, mediaType = '') {
  const safeOriginal = validateOriginalName(originalName);
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw createError('빈 파일은 등록할 수 없습니다.', 'INVALID_FILE');
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw createError(`파일 크기는 ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB 이하여야 합니다.`, 'FILE_TOO_LARGE');
  }
  const extension = path.extname(safeOriginal).toLowerCase();
  const rule = EXTENSION_RULES[extension];
  if (!rule) {
    throw createError(`허용하지 않는 파일 형식입니다. 허용 형식: ${ALLOWED_EXTENSIONS.join(', ')}`, 'UNSUPPORTED_FILE_TYPE');
  }
  if (mediaType && !rule.mediaTypes.includes(mediaType.toLowerCase())) {
    throw createError('파일 확장자와 브라우저가 보고한 형식이 일치하지 않습니다.', 'UNSUPPORTED_FILE_TYPE');
  }
  if (rule.signature && !rule.signature(buffer)) {
    throw createError('파일 확장자와 실제 파일 바이트가 일치하지 않습니다.', 'UNSUPPORTED_FILE_TYPE');
  }
  if (rule.text && buffer.includes(0)) {
    throw createError('텍스트 파일에서 읽을 수 없는 바이너리 바이트가 발견되었습니다.', 'INVALID_FILE');
  }
  if (rule.json) {
    try {
      JSON.parse(buffer.toString('utf8'));
    } catch {
      throw createError('등록할 JSON 파일의 형식이 올바르지 않습니다.', 'INVALID_FILE');
    }
  }
  return { safeOriginal, extension };
}

const getHash = (buffer) => createHash('sha256').update(buffer).digest('hex');
const nextVersion = (assets, lesson, type) =>
  assets
    .filter((asset) => asset.lesson === lesson && asset.type === type)
    .reduce((highest, asset) => Math.max(highest, asset.version), 0) + 1;

export function getMissingItems(index) {
  return REQUIRED_ITEMS
    .filter((item) => !index.assets.some((asset) => asset.lesson === item.lesson && asset.type === item.type))
    .map((item) => ({
      ...item,
      label: TYPES[item.type].label,
      area: TYPES[item.type].area,
    }));
}

export async function registerBuffer(projectRoot, input) {
  return withProjectLock(projectRoot, async () => {
    const { lesson, area, type, originalName, buffer, mediaType = '' } = input;
    const typeDefinition = TYPES[type];
    if (!Number.isInteger(lesson) || ![3, 4].includes(lesson)) {
      throw createError('이 프로그램에서는 제3차시와 제4차시 자료만 등록합니다.', 'INVALID_INPUT');
    }
    if (!typeDefinition || typeDefinition.area !== area) {
      throw createError('관리 영역과 자료 유형이 일치하지 않습니다.', 'INVALID_INPUT');
    }
    if (!LESSON_TYPE_MAP[lesson].includes(type)) {
      throw createError(`제${lesson}차시에서 사용하는 자료 유형이 아닙니다.`, 'INVALID_INPUT');
    }
    const { safeOriginal, extension } = validateFile(originalName, buffer, mediaType);
    const index = await readIndexUnlocked(projectRoot);
    const sha256 = getHash(buffer);
    const duplicate = index.assets.find((asset) => asset.sha256 === sha256);
    if (duplicate) {
      throw createError(`동일한 파일이 이미 등록되어 있습니다: ${duplicate.fileName}`, 'DUPLICATE', { duplicate });
    }

    const version = nextVersion(index.assets, lesson, type);
    const fileName = `캠퍼스라운지_${String(lesson).padStart(2, '0')}차시_${typeDefinition.code}_v${String(version).padStart(2, '0')}${extension}`;
    const relativePath = path.posix.join(typeDefinition.directory, fileName);
    const originalPath = await resolveCreatablePath(projectRoot, '관리데이터', '원본보관', `${sha256}_${safeOriginal}`);
    const destinationPath = await resolveCreatablePath(projectRoot, relativePath);
    let originalCreated = false;
    let destinationCreated = false;
    try {
      await writeFile(originalPath, buffer, { flag: 'wx' });
      originalCreated = true;
      await copyFile(originalPath, destinationPath, fsConstants.COPYFILE_EXCL);
      destinationCreated = true;
      const asset = {
        id: randomUUID(),
        lesson,
        area,
        type,
        typeLabel: typeDefinition.label,
        originalName: safeOriginal,
        fileName,
        relativePath,
        version,
        sha256,
        size: buffer.length,
        createdAt: new Date().toISOString(),
      };
      index.assets.push(asset);
      await writeIndex(projectRoot, index);
      return asset;
    } catch (error) {
      if (destinationCreated) await rm(destinationPath, { force: true }).catch(() => undefined);
      if (originalCreated) await rm(originalPath, { force: true }).catch(() => undefined);
      if (error.code === 'EEXIST') {
        throw createError('같은 파일명 또는 버전이 이미 존재합니다. 목록을 새로고침한 뒤 다시 시도하세요.', 'FILE_CONFLICT');
      }
      throw error;
    }
  });
}

async function collectSubmissionFiles(projectRoot) {
  const files = [];
  const walk = async (directory) => {
    const absolute = await resolveVerifiedPath(projectRoot, directory);
    for (const entry of await readdir(absolute, { withFileTypes: true })) {
      const relativePath = normalizeRelativePath(path.posix.join(directory, entry.name));
      const target = safeResolve(projectRoot, relativePath);
      if (entry.isSymbolicLink()) {
        throw createError('작업 폴더 안의 링크 경로는 제출 ZIP에 사용할 수 없습니다.', 'UNSAFE_PATH');
      }
      if (entry.isDirectory()) await walk(relativePath);
      else if (entry.isFile()) {
        await verifyPathBoundary(projectRoot, target);
        files.push(relativePath);
      }
    }
  };
  for (const directory of SUBMISSION_DIRECTORIES) await walk(directory);
  return files;
}

export async function getDeliveryPreview(projectRoot, suppliedIndex) {
  const index = suppliedIndex ?? await readIndex(projectRoot);
  const registered = index.assets.filter((asset) => asset.type !== 'DELIVERY_ZIP');
  const registeredPaths = new Set(registered.map((asset) => asset.relativePath));
  const workspaceFiles = await collectSubmissionFiles(projectRoot);
  return {
    includedFiles: registered.map((asset) => ({
      lesson: asset.lesson,
      type: asset.type,
      typeLabel: asset.typeLabel,
      fileName: asset.fileName,
      relativePath: asset.relativePath,
      sha256: asset.sha256,
      size: asset.size,
    })),
    excludedFileCount: workspaceFiles.filter((file) => !registeredPaths.has(file)).length,
    missing: getMissingItems(index),
    reviewNotice: 'ZIP에는 등록목록의 파일만 포함됩니다. 생성 전에 포함 목록과 누락 항목을 사람이 마지막으로 확인하세요.',
  };
}

export async function createDeliveryZip(projectRoot) {
  return withProjectLock(projectRoot, async () => {
    const index = await readIndexUnlocked(projectRoot);
    const preview = await getDeliveryPreview(projectRoot, index);
    const version = index.assets
      .filter((asset) => asset.type === 'DELIVERY_ZIP')
      .reduce((highest, asset) => Math.max(highest, asset.version), 0) + 1;
    const fileName = `캠퍼스라운지_등록파일_제출본_v${String(version).padStart(2, '0')}.zip`;
    const outputPath = await resolveCreatablePath(projectRoot, '06_제출파일', fileName);
    const entries = [];

    for (const asset of index.assets.filter((item) => item.type !== 'DELIVERY_ZIP')) {
      const sourcePath = await resolveVerifiedPath(projectRoot, asset.relativePath);
      const data = await readFile(sourcePath);
      if (data.length !== asset.size || getHash(data) !== asset.sha256) {
        throw createError(`등록 후 변경된 파일이 있습니다: ${asset.fileName}`, 'FILE_CHANGED');
      }
      entries.push({ name: asset.relativePath, data });
    }

    const generatedAt = new Date().toISOString();
    entries.push(
      {
        name: '관리데이터/등록파일목록.json',
        data: Buffer.from(JSON.stringify({ schemaVersion: 1, generatedAt, files: preview.includedFiles }, null, 2)),
      },
      {
        name: '관리데이터/누락점검.json',
        data: Buffer.from(JSON.stringify({ generatedAt, missing: preview.missing }, null, 2)),
      },
      {
        name: '제출안내.txt',
        data: Buffer.from([
          '캠퍼스 라운지 교육용 제출 ZIP',
          '',
          '이 ZIP은 프로그램 등록목록에 있는 파일만 포함합니다.',
          '설계 품질, 법규·구조·소방·설비·시공성, 저작권 또는 개인정보 안전을 자동으로 보장하지 않습니다.',
          '제출 전에 등록파일목록과 누락점검을 사람이 직접 확인하세요.',
          `생성 시각: ${generatedAt}`,
        ].join('\n')),
      },
    );

    try {
      await createZipFromEntries(entries, outputPath);
      const buffer = await readFile(outputPath);
      const asset = {
        id: randomUUID(),
        lesson: 4,
        area: 'delivery',
        type: 'DELIVERY_ZIP',
        typeLabel: '등록 파일 제출 ZIP',
        originalName: fileName,
        fileName,
        relativePath: path.posix.join('06_제출파일', fileName),
        version,
        sha256: getHash(buffer),
        size: buffer.length,
        createdAt: generatedAt,
      };
      index.assets.push(asset);
      await writeIndex(projectRoot, index);
      return asset;
    } catch (error) {
      await rm(outputPath, { force: true }).catch(() => undefined);
      throw error;
    }
  });
}
