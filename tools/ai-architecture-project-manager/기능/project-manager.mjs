import { createHash, randomUUID } from 'node:crypto';
import { access, copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createZipFromDirectory } from './zip.mjs';

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
    label: '현황 이미지',
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
  ZONING_A: {
    label: '대안 A 조닝',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_조닝',
  },
  PROMPT_A: {
    label: '대안 A 요청문',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_요청문',
  },
  IMAGE_A: {
    label: '대안 A 이미지',
    area: 'alt-a',
    directory: '03_공간대안/대안-A',
    code: '대안A_이미지',
  },
  ZONING_B: {
    label: '대안 B 조닝',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_조닝',
  },
  PROMPT_B: {
    label: '대안 B 요청문',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_요청문',
  },
  IMAGE_B: {
    label: '대안 B 이미지',
    area: 'alt-b',
    directory: '03_공간대안/대안-B',
    code: '대안B_이미지',
  },
  COMPARISON: {
    label: 'RFP 비교표',
    area: 'selected-validation',
    directory: '05_확인기록',
    code: 'RFP_비교표',
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
    label: '검증 기록',
    area: 'selected-validation',
    directory: '05_확인기록',
    code: '확인기록',
  },
};

const REQUIRED_TYPES = [
  'RFP',
  'PLAN',
  'EXISTING',
  'REQUIREMENTS',
  'QUESTIONS',
  'BRIEF',
  'ZONING_A',
  'PROMPT_A',
  'IMAGE_A',
  'ZONING_B',
  'PROMPT_B',
  'IMAGE_B',
  'COMPARISON',
  'REVISION_PROMPT',
  'SELECTED_IMAGE',
];

export function safeResolve(projectRoot, ...segments) {
  const root = path.resolve(projectRoot);
  const target = path.resolve(root, ...segments);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const error = new Error('프로젝트 루트 밖에는 접근할 수 없습니다.');
    error.code = 'OUTSIDE_PROJECT_ROOT';
    throw error;
  }
  return target;
}

const indexPath = (projectRoot) => safeResolve(projectRoot, '관리데이터', '등록목록.json');

export async function initializeWorkspace(projectRoot) {
  for (const directory of WORKSPACE_DIRECTORIES) {
    await mkdir(safeResolve(projectRoot, directory), { recursive: true });
  }
  try {
    await access(indexPath(projectRoot));
  } catch {
    await writeFile(
      indexPath(projectRoot),
      JSON.stringify({ schemaVersion: 1, updatedAt: null, assets: [] }, null, 2),
      'utf8',
    );
  }
}

export async function readIndex(projectRoot) {
  await initializeWorkspace(projectRoot);
  return JSON.parse(await readFile(indexPath(projectRoot), 'utf8'));
}

async function writeIndex(projectRoot, index) {
  index.updatedAt = new Date().toISOString();
  const target = indexPath(projectRoot);
  const temporary = `${target}.tmp`;
  await writeFile(temporary, JSON.stringify(index, null, 2), 'utf8');
  await rename(temporary, target);
}

const sanitizeOriginalName = (value) =>
  path.basename(value).normalize('NFKC').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-');

const getExtension = (originalName) => {
  const extension = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
  return extension || '.bin';
};

const getHash = (buffer) => createHash('sha256').update(buffer).digest('hex');

const nextVersion = (assets, lesson, type) =>
  assets
    .filter((asset) => asset.lesson === lesson && asset.type === type)
    .reduce((highest, asset) => Math.max(highest, asset.version), 0) + 1;

export function getMissingItems(index) {
  return REQUIRED_TYPES
    .filter((type) => !index.assets.some((asset) => asset.type === type))
    .map((type) => ({ type, label: TYPES[type].label, area: TYPES[type].area }));
}

export async function registerBuffer(projectRoot, input) {
  const { lesson, area, type, originalName, buffer } = input;
  const typeDefinition = TYPES[type];
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > 14) {
    const error = new Error('차시는 1부터 14 사이의 정수여야 합니다.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  if (!typeDefinition || typeDefinition.area !== area) {
    const error = new Error('관리 영역과 자료 유형이 일치하지 않습니다.');
    error.code = 'INVALID_INPUT';
    throw error;
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const error = new Error('빈 파일은 등록할 수 없습니다.');
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const index = await readIndex(projectRoot);
  const sha256 = getHash(buffer);
  const duplicate = index.assets.find((asset) => asset.sha256 === sha256);
  if (duplicate) {
    const error = new Error(`동일한 파일이 이미 등록되어 있습니다: ${duplicate.fileName}`);
    error.code = 'DUPLICATE';
    error.duplicate = duplicate;
    throw error;
  }

  const version = nextVersion(index.assets, lesson, type);
  const extension = getExtension(originalName);
  const fileName = `캠퍼스라운지_${String(lesson).padStart(2, '0')}차시_${typeDefinition.code}_v${String(version).padStart(2, '0')}${extension}`;
  const relativePath = path.posix.join(typeDefinition.directory.replaceAll('\\', '/'), fileName);
  const safeOriginal = sanitizeOriginalName(originalName);
  const originalPath = safeResolve(
    projectRoot,
    '관리데이터',
    '원본보관',
    `${sha256}_${safeOriginal}`,
  );
  const destinationPath = safeResolve(projectRoot, relativePath);

  await writeFile(originalPath, buffer, { flag: 'wx' });
  await copyFile(originalPath, destinationPath);

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
}

export async function createDeliveryZip(projectRoot) {
  const index = await readIndex(projectRoot);

  const deliveryDirectory = safeResolve(projectRoot, '06_제출파일');
  const version =
    index.assets.filter((asset) => asset.type === 'DELIVERY_ZIP').reduce(
      (highest, asset) => Math.max(highest, asset.version),
      0,
    ) + 1;
  const fileName = `캠퍼스라운지_작업모음_v${String(version).padStart(2, '0')}.zip`;
  const outputPath = safeResolve(deliveryDirectory, fileName);
  await createZipFromDirectory(projectRoot, outputPath, (relativePath) => {
    const normalized = relativePath.replaceAll('\\', '/');
    const isPathInside = (directory) =>
      normalized === directory || normalized.startsWith(`${directory}/`);
    return (
      !isPathInside('관리데이터') &&
      !isPathInside('관리프로그램') &&
      !isPathInside('06_제출파일') &&
      !isPathInside('node_modules') &&
      !isPathInside('.git')
    );
  });

  const buffer = await readFile(outputPath);
  const asset = {
    id: randomUUID(),
    lesson: 4,
    area: 'delivery',
    type: 'DELIVERY_ZIP',
    typeLabel: '제출 ZIP',
    originalName: fileName,
    fileName,
    relativePath: path.posix.join('06_제출파일', fileName),
    version,
    sha256: getHash(buffer),
    size: buffer.length,
    createdAt: new Date().toISOString(),
  };
  index.assets.push(asset);
  await writeIndex(projectRoot, index);
  return asset;
}
