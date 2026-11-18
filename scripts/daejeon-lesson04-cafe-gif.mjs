import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { repositoryRoot } from './course-registry.mjs';

const root = path.join(repositoryRoot, 'review/daejeon/DJ-L04-CAFE-6-STAGES');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');

/**
 * @template {Record<string, unknown>} T
 * @param {string} rel
 * @param {T} [extra]
 * @returns {{ file: string, source: string, outputPath: string, bytes: number, sha256: string } & T}
 */
function loadAsset(rel, extra = /** @type {T} */ ({})) {
  const source = path.join(root, rel);
  const bytes = fs.readFileSync(source);
  const digest = sha(bytes);
  const expected = manifest.files.find((f) => f.file === rel);
  if (expected) {
    assert.equal(bytes.length, expected.bytes, `Cafe GIF asset size mismatch: ${rel}`);
    assert.equal(digest, expected.sha256, `Cafe GIF asset SHA mismatch: ${rel}`);
  }
  return {
    file: rel,
    source,
    outputPath: `practice/DJ-L04/cafe-6-stages/${rel}`,
    bytes: bytes.length,
    sha256: digest,
    ...extra,
  };
}

const stageMeta = [
  {
    step: '01',
    key: 'before',
    file: '01_before.jpeg',
    width: 1376,
    height: 768,
    title: '01 · Before (철거 후 공실 원본)',
    layerBadge: '기준 골조 · 시점 고정',
    keepSummary: '정면 전면창 · 우측 유리문 · 좌측 벽 기둥 · 천장 배관 · 카메라 시점 확보',
    addSummary: '수정 전 출발 기준 이미지 (모든 후속 단계의 기하학 기준)',
  },
  {
    step: '02',
    key: 'rough-in',
    file: '02_rough-in.png',
    width: 1678,
    height: 937,
    title: '02 · Rough-In (기초 설비 · 바탕면 정리)',
    layerBadge: 'Layer 1 · 설비·미장 바탕',
    keepSummary: '01 원본의 창호·출입문·기둥·천장 배관 라인·창밖 거리 유지',
    addSummary: '벽면 미장 정돈 + 바닥 셀프레벨링 몰탈 + 좌측 하단 급배수 배관 인입',
  },
  {
    step: '03',
    key: 'finishes',
    file: '03_finishes.png',
    width: 1678,
    height: 937,
    title: '03 · Finishes (도장 · 바닥 기본 마감)',
    layerBadge: 'Layer 2 · 표면 마감',
    keepSummary: '02의 공간 비례·창호 분할·천장 배관 구조 유지',
    addSummary: '상부 화이트 도장 + 좌측 하부 파스텔 핑크 투톤 경계 + 밝은 테라조 바닥',
  },
  {
    step: '04',
    key: 'millwork',
    file: '04_millwork.png',
    width: 1678,
    height: 937,
    title: '04 · Millwork (고정 제작가구 · 붙박이 시공)',
    layerBadge: 'Layer 3 · 고정 가구',
    keepSummary: '03의 화이트·핑크 벽면 분할과 테라조 바닥·창호 유지',
    addSummary: '곡선 핑크 타일 커피 카운터(금속 상판) + 붙박이 벤치 + 우측 창가 바 선반',
  },
  {
    step: '05',
    key: 'fit-out',
    file: '05_fit-out.png',
    width: 1678,
    height: 937,
    title: '05 · Fit-Out (장비 · 이동 가구 · 조명 점등)',
    layerBadge: 'Layer 4 · 장비·가구·조명',
    keepSummary: '04의 카운터·붙박이 벤치·창가 선반 위치와 마감 유지',
    addSummary: '에스프레소 머신·그라인더 + 원형 테이블·체어·스툴 + 트랙 스팟 조명 점등',
  },
  {
    step: '06',
    key: 'after',
    file: '06_after.png',
    width: 1678,
    height: 937,
    title: '06 · After (화병 · 소품 스타일링 완성)',
    layerBadge: 'Layer 5 · 최종 스타일링',
    keepSummary: '05의 모든 가구·머신·조명·공간 구조 100% 유지',
    addSummary: '테이블 및 창가 바 선반 위 계절 생화 화병·캔들 소품 국소 추가',
  },
];

export const lesson04CafeGifStages = stageMeta.map((m) => loadAsset(m.file, m));
export const lesson04CafeAnimatedGif = loadAsset('base02-cafe-before-after.gif', {
  key: 'animated-gif',
  title: '카페 공실 6단계 레이어 적층 변화 GIF',
  width: 1280,
  height: 720,
});
export const lesson04CafePromptsFile = loadAsset('prompts/CAFE_6STAGES_LAYER_PROMPTS.txt', {
  key: 'cafe-prompts',
  title: '카페 6단계 레이어 적층 & GIF 조립 요청문 TXT',
  text: fs.readFileSync(path.join(root, 'prompts/CAFE_6STAGES_LAYER_PROMPTS.txt'), 'utf8').trim(),
});
export const lesson04CafeSampleZip = loadAsset('DJ-L04_CAFE_6STAGES_GIF_SAMPLE.zip', {
  key: 'cafe-sample-zip',
  title: '카페 6단계 레이어 이미지 & 완성 GIF 실습 패키지 ZIP',
});

export const lesson04CafeGifAssets = [
  ...lesson04CafeGifStages,
  lesson04CafeAnimatedGif,
  lesson04CafePromptsFile,
  loadAsset('README.txt', { key: 'cafe-readme' }),
  loadAsset('manifest.json', { key: 'cafe-manifest' }),
  lesson04CafeSampleZip,
];
