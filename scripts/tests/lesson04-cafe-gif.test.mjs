import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import {
  lesson04CafeGifStages,
  lesson04CafeAnimatedGif,
  lesson04CafePromptsFile,
  lesson04CafeSampleZip,
  lesson04CafeGifAssets,
} from '../daejeon-lesson04-cafe-gif.mjs';

const sha = (b) => createHash('sha256').update(b).digest('hex');

function zipMembers(bytes) {
  let end = -1;
  for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p--) {
    if (bytes.readUInt32LE(p) === 0x06054b50) { end = p; break; }
  }
  assert(end >= 0, 'Missing ZIP EOCD');
  const count = bytes.readUInt16LE(end + 10);
  const out = new Map();
  let p = bytes.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    assert.equal(bytes.readUInt32LE(p), 0x02014b50);
    const method = bytes.readUInt16LE(p + 10);
    const compSize = bytes.readUInt32LE(p + 20);
    const nameLen = bytes.readUInt16LE(p + 28);
    const name = bytes.subarray(p + 46, p + 46 + nameLen).toString('utf8');
    const local = bytes.readUInt32LE(p + 42);
    const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    const raw = bytes.subarray(start, start + compSize);
    out.set(name, method === 0 ? raw : inflateRawSync(raw));
    p += 46 + nameLen + bytes.readUInt16LE(p + 30) + bytes.readUInt16LE(p + 32);
  }
  return out;
}

test('제4차시 초반 3차시 복습용 카페 6단계 레이어 이미지·GIF·실습 ZIP 해시와 학습 용어 규칙을 검증한다', () => {
  assert.equal(lesson04CafeGifStages.length, 6);
  assert.equal(lesson04CafeGifAssets.length, 11);
  assert.equal(lesson04CafeAnimatedGif.file, 'base02-cafe-before-after.gif');
  const gifBytes = fs.readFileSync(lesson04CafeAnimatedGif.source);
  assert.equal(gifBytes.subarray(0, 6).toString('ascii'), 'GIF89a');
  assert.equal(gifBytes.readUInt16LE(6), 1280);
  assert.equal(gifBytes.readUInt16LE(8), 720);

  const members = zipMembers(fs.readFileSync(lesson04CafeSampleZip.source));
  const prefix = 'DJ-L04_CAFE_6STAGES_GIF_SAMPLE/';
  const zipManifest = JSON.parse(members.get(prefix + 'manifest.json').toString('utf8'));
  assert.equal(zipManifest.selfHashExcluded, true);
  for (const row of zipManifest.files) {
    const member = members.get(prefix + row.file);
    assert(member, row.file);
    assert.equal(member.length, row.bytes, row.file);
    assert.equal(sha(member), row.sha256, row.file);
  }

  const astroSrc = fs.readFileSync('src/draft/components/Lesson04CafeGifRecap.astro', 'utf8');
  const pageSrc = fs.readFileSync('src/draft/pages/lessons/04.astro', 'utf8');
  assert.match(pageSrc, /Lesson04CafeGifRecap/);

  const forbidden = /강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
  const schedule = /\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
  assert(!forbidden.test(astroSrc), 'Forbidden learner language in Lesson04CafeGifRecap.astro');
  assert(!schedule.test(astroSrc), 'Forbidden schedule expression in Lesson04CafeGifRecap.astro');
  assert(!forbidden.test(lesson04CafePromptsFile.text), 'Forbidden learner language in CAFE_6STAGES_LAYER_PROMPTS.txt');
  assert(!schedule.test(lesson04CafePromptsFile.text), 'Forbidden schedule expression in CAFE_6STAGES_LAYER_PROMPTS.txt');
});
