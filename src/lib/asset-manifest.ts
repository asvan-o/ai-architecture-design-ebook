import manifestSource from '../../data/asset-manifest.yaml?raw';

export type AssetPriority = 'required' | 'optional' | 'reference-only';
export type AssetTool =
  | 'codex'
  | 'nano-banana'
  | 'veo'
  | 'gpt-and-codex'
  | 'user-upload';

export type LessonAssetRecord = {
  id: string;
  lesson: number;
  priority: AssetPriority;
  title: string;
  type: string;
  purpose: string;
  recommendedTool: AssetTool;
  status: string;
  publicUse: boolean;
  alt: string;
};

const assetBlocks = manifestSource
  .split(/\r?\n(?=  - id:\s*")/)
  .filter((block) => block.trimStart().startsWith('- id:'));

const getQuoted = (block: string, field: string) =>
  block.match(new RegExp(`^\\s{4}${field}:\\s*"([^"]+)"\\s*$`, 'm'))?.[1];

const getNumber = (block: string, field: string) =>
  Number(block.match(new RegExp(`^\\s{4}${field}:\\s*(\\d+)\\s*$`, 'm'))?.[1]);

const assets = assetBlocks.map((block): LessonAssetRecord => {
  const id = block.match(/^\s+- id:\s*"([^"]+)"/)?.[1];
  const priority = getQuoted(block, 'priority') as AssetPriority | undefined;
  const recommendedTool = getQuoted(block, 'recommended_tool') as AssetTool | undefined;
  const publicUseValue = block.match(/^\s{4}public_use:\s*(true|false)\s*$/m)?.[1];
  const record = {
    id,
    lesson: getNumber(block, 'lesson'),
    priority,
    title: getQuoted(block, 'title'),
    type: getQuoted(block, 'type'),
    purpose: getQuoted(block, 'purpose'),
    recommendedTool,
    status: getQuoted(block, 'status'),
    publicUse: publicUseValue === 'true',
    alt: getQuoted(block, 'alt'),
  };

  if (
    !record.id ||
    !record.lesson ||
    !record.priority ||
    !record.title ||
    !record.type ||
    !record.purpose ||
    !record.recommendedTool ||
    !record.status ||
    !record.alt ||
    publicUseValue === undefined
  ) {
    throw new Error(`자산 매니페스트 항목을 읽을 수 없습니다: ${record.id ?? 'unknown'}`);
  }

  return record as LessonAssetRecord;
});

const assetById = new Map(assets.map((asset) => [asset.id, asset]));

export const getStudentLessonAssets = (assetIds: string[], lesson: number) =>
  assetIds.map((id) => {
    const asset = assetById.get(id);
    if (!asset) throw new Error(`자산 매니페스트에 없는 ID입니다: ${id}`);
    if (asset.lesson !== lesson) {
      throw new Error(`자산 ${id}의 차시가 ${lesson}차시와 일치하지 않습니다.`);
    }
    if (asset.priority === 'reference-only') {
      throw new Error(`외부 reference-only 자산은 학생용 차시에서 사용할 수 없습니다: ${id}`);
    }
    return asset;
  });
