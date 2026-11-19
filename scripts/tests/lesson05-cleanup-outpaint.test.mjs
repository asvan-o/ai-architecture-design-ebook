import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  l05CleanupBefore,
  l05CleanupAfter,
  l05PivotDiagram,
  l05OutpaintBefore,
  l05OutpaintCleanInput,
  l05OutpaintAfter,
  l05BirdseyeAfter,
  l05ShortPromptsTxt,
  l05CleanupOutpaintZip,
  lesson05CleanupOutpaintAssets,
} from '../daejeon-lesson05-cleanup-outpaint.mjs';
import { repositoryRoot } from '../course-registry.mjs';

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

test('Lesson 05 cleanup/outpaint asset bundle exists, matches manifest SHA-256, and includes valid ZIP', () => {
  assert.equal(lesson05CleanupOutpaintAssets.length, 11);
  for (const asset of lesson05CleanupOutpaintAssets) {
    assert(fs.existsSync(asset.source), `Missing asset: ${asset.source}`);
    const bytes = fs.readFileSync(asset.source);
    assert.equal(bytes.length, asset.bytes, `Byte size mismatch: ${asset.file}`);
    assert.equal(sha(bytes), asset.sha256, `SHA mismatch: ${asset.file}`);
    assert(asset.outputPath.startsWith('practice/DJ-L05/cleanup-outpaint/'));
  }

  // Verify ZIP signature PK\x03\x04 and expected filenames inside central directory
  const zipBuf = fs.readFileSync(l05CleanupOutpaintZip.source);
  assert.equal(zipBuf.subarray(0, 4).toString('binary'), 'PK\x03\x04');
  const zipStr = zipBuf.toString('latin1');
  for (const expectedName of [
    '01_plan-cleanup-before.png',
    '02_plan-cleanup-after.png',
    '03_outpainting-pivot-and-views.svg',
    '04_plan-outpaint-pivot-before.png',
    '04b_plan-outpaint-pivot-clean-input.png',
    '05_plan-outpaint-result-after.png',
    '06_cafe-terrace-birdseye-after.jpg',
    'L05_CHATGPT_SHORT_PROMPTS_AND_KEYWORDS.txt',
    'README.txt',
    'SHA256SUMS.txt',
  ]) {
    assert(zipStr.includes(expectedName), `ZIP missing entry: ${expectedName}`);
  }

  // Verify visual assets and prompt text are non-trivial
  assert(l05CleanupBefore.bytes > 50_000);
  assert(l05CleanupAfter.bytes > 10_000);
  assert(l05PivotDiagram.bytes > 5_000);
  assert(l05OutpaintBefore.bytes > 50_000);
  assert(l05OutpaintCleanInput.bytes > 30_000);
  assert(l05OutpaintAfter.bytes > 50_000);
  assert(l05BirdseyeAfter.bytes > 200_000);
  assert(l05ShortPromptsTxt.text.includes('Orthographic Top-Down Plan'));
  assert(l05ShortPromptsTxt.text.includes("Bird's-Eye View"));
  assert(l05ShortPromptsTxt.text.includes('Aerial Perspective'));
});

test('Lesson 05 page integrates cleanup/outpaint guide and keeps learner-language compliance', () => {
  const pageSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/pages/lessons/05.astro'), 'utf8');
  const compSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/components/Lesson05CleanupOutpaintGuide.astro'), 'utf8');

  assert(pageSrc.includes('Lesson05CleanupOutpaintGuide'), '05.astro must import Lesson05CleanupOutpaintGuide');
  assert(pageSrc.includes('mode="cleanup"'), '05.astro must include cleanup mode');
  assert(pageSrc.includes('mode="outpaint-keywords"'), '05.astro must include outpaint-keywords mode');
  assert(compSrc.includes('data-l05-keyword-builder'), 'Component must include interactive keyword builder');
  assert(compSrc.includes('Orthographic Top-Down Plan'));
  assert(compSrc.includes("Bird's-Eye View"));
  assert(compSrc.includes('Aerial Perspective'));

  // Forbidden learner-facing wording check (matches verify-daejeon-ebook-language.mjs)
  const forbidden = /강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
  const schedule = /\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
  for (const [label, src] of [
    ['Lesson05CleanupOutpaintGuide.astro', compSrc],
    ['L05_CHATGPT_SHORT_PROMPTS_AND_KEYWORDS.txt', l05ShortPromptsTxt.text],
  ]) {
    assert(!forbidden.test(src), `${label} contains forbidden wording: ${src.match(forbidden)?.[0]}`);
    assert(!schedule.test(src), `${label} contains schedule wording: ${src.match(schedule)?.[0]}`);
  }
});
