import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { repositoryRoot } from './course-registry.mjs';

const root = path.join(repositoryRoot, 'review/daejeon/DJ-L05-CLEANUP-OUTPAINT');
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
    assert.equal(bytes.length, expected.bytes, `L05 cleanup/outpaint asset size mismatch: ${rel}`);
    assert.equal(digest, expected.sha256, `L05 cleanup/outpaint asset SHA mismatch: ${rel}`);
  }
  return {
    file: rel,
    source,
    outputPath: `practice/DJ-L05/cleanup-outpaint/${rel}`,
    bytes: bytes.length,
    sha256: digest,
    ...extra,
  };
}

export const l05CleanupBefore = loadAsset('01_plan-cleanup-before.png', {
  key: 'cleanup-before',
  title: 'Before · 가구·치수·메모가 혼재된 원본 평면도',
  width: 2400,
  height: 1650,
});

export const l05CleanupAfter = loadAsset('02_plan-cleanup-after.png', {
  key: 'cleanup-after',
  title: 'After · 벽·기둥·창·문만 남긴 2D 클린업 기준 도면',
  width: 2400,
  height: 1650,
});

export const l05PivotDiagram = loadAsset('03_outpainting-pivot-and-views.svg', {
  key: 'pivot-diagram',
  title: '원본 Pivot 이동 아웃페인팅 원리 및 4대 건축 카메라 구도 도식',
  width: 1200,
  height: 620,
});

export const l05OutpaintBefore = loadAsset('04_plan-outpaint-pivot-before.png', {
  key: 'outpaint-before',
  title: 'Before · 원본 Pivot을 좌측으로 밀어 우측 확장 여백 확보',
  width: 2400,
  height: 1400,
});

export const l05OutpaintCleanInput = loadAsset('04b_plan-outpaint-pivot-clean-input.png', {
  key: 'outpaint-clean-input',
  title: 'ChatGPT 아웃페인팅 실습용 깨끗한 Pivot 좌측 정렬 입력 파일',
  width: 2400,
  height: 1400,
});

export const l05OutpaintAfter = loadAsset('05_plan-outpaint-result-after.png', {
  key: 'outpaint-after',
  title: 'After · 좌측 기존 카페 평면 유지 + 우측 우드 데크·조경 아웃페인팅',
  width: 2400,
  height: 1400,
});

export const l05BirdseyeAfter = loadAsset('06_cafe-terrace-birdseye-after.jpg', {
  key: 'birdseye-after',
  title: '응용 예시 · 45도 버드뷰 우드 데크 테라스·석재 플랜터·골든아워 시각화',
  width: 1376,
  height: 768,
});

export const l05ShortPromptsTxt = loadAsset('prompts/L05_CHATGPT_SHORT_PROMPTS_AND_KEYWORDS.txt', {
  key: 'short-prompts-txt',
  title: '제5차시 ChatGPT 실전 짧은 프롬프트 & 건축 키워드 사전 TXT',
  text: fs.readFileSync(path.join(root, 'prompts/L05_CHATGPT_SHORT_PROMPTS_AND_KEYWORDS.txt'), 'utf8').trim(),
});

export const l05CleanupOutpaintZip = loadAsset('DJ-L05_CLEANUP_OUTPAINT_PACK.zip', {
  key: 'cleanup-outpaint-zip',
  title: '제5차시 도면 클린업 · Pivot 아웃페인팅 · 키워드 실습 패키지 ZIP',
});

export const lesson05CleanupOutpaintAssets = [
  l05CleanupBefore,
  l05CleanupAfter,
  l05PivotDiagram,
  l05OutpaintBefore,
  l05OutpaintCleanInput,
  l05OutpaintAfter,
  l05BirdseyeAfter,
  l05ShortPromptsTxt,
  loadAsset('README.txt', { key: 'cleanup-outpaint-readme' }),
  loadAsset('manifest.json', { key: 'cleanup-outpaint-manifest' }),
  l05CleanupOutpaintZip,
];
