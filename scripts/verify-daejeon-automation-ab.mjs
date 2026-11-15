import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

// Historical CLI filename retained. Checks the active Lesson 02 Commencement Document Generator
// Vibe Coding flow AND ensures historical file-sorter ZIP payloads remain untouched.
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const read = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const normalize = (s) => s.replaceAll('\r\n', '\n').trim();

export const lesson02PromptIds = [
  'l02-step-1-prompt',
  'l02-step-2-prompt',
  'l02-step-3-prompt',
  'l02-step-4-prompt',
  'l02-integrated-prompt',
];

export function zipMemberHashes(bytes, includeContent = false) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  assert(end >= 0, 'ZIP central directory missing');
  let c = bytes.readUInt32LE(end + 16);
  const count = bytes.readUInt16LE(end + 10);
  const members = {};
  for (let i = 0; i < count; i++) {
    assert.equal(bytes.readUInt32LE(c), 0x02014b50);
    const flags = bytes.readUInt16LE(c + 8);
    const method = bytes.readUInt16LE(c + 10);
    const packedSize = bytes.readUInt32LE(c + 20);
    const size = bytes.readUInt32LE(c + 24);
    const nl = bytes.readUInt16LE(c + 28);
    const el = bytes.readUInt16LE(c + 30);
    const cl = bytes.readUInt16LE(c + 32);
    const local = bytes.readUInt32LE(c + 42);
    assert(!(flags & 1), 'Unexpected encrypted ZIP');
    const name = bytes.subarray(c + 46, c + 46 + nl).toString('utf8');
    if (!name.endsWith('/')) {
      assert.equal(bytes.readUInt32LE(local), 0x04034b50);
      const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
      const packed = bytes.subarray(start, start + packedSize);
      const data = method === 0 ? packed : method === 8 ? inflateRawSync(packed) : null;
      assert(data, 'ZIP compression ' + method);
      assert.equal(data.length, size, name);
      assert(!members[name], 'Duplicate member ' + name);
      members[name] = { bytes: size, sha256: sha(data), ...(includeContent ? { content: data } : {}) };
    }
    c += 46 + nl + el + cl;
  }
  return members;
}

const urls = new Map();
async function moduleUrl(file) {
  file = path.resolve(file);
  if (urls.has(file)) return urls.get(file);
  const text = fs.readFileSync(file, 'utf8');
  let code = file.endsWith('.json')
    ? 'export default ' + text + ';'
    : ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const m of [...code.matchAll(/\bfrom\s*(['"])(\.{1,2}\/[^'"]+)\1/g)].reverse()) {
    let f = path.resolve(path.dirname(file), m[2]);
    if (!fs.existsSync(f)) f = ['.ts', '.json', '.mjs', '.js'].map((x) => f + x).find((x) => fs.existsSync(x));
    assert(f, 'Missing import ' + m[2]);
    const url = /\.(?:ts|json)$/.test(f) ? await moduleUrl(f) : pathToFileURL(f).href;
    code = code.slice(0, m.index) + m[0].replace(m[2], url) + code.slice(m.index + m[0].length);
  }
  code = code.replace(/\s+(?:with|assert)\s*\{\s*type\s*:\s*['"]json['"]\s*\}/g, '');
  const url = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  urls.set(file, url);
  return url;
}

export async function lesson02Contract() {
  const data = await import(await moduleUrl(path.join(R, 'src/draft/content/daejeon-lesson02-automation.ts')));
  const prompts = await import(await moduleUrl(path.join(R, 'src/draft/content/lesson02-exercises.ts')));
  return {
    data,
    cards: [...prompts.buildSteps, prompts.integratedPrompt],
    exercise: prompts.commencementExercise || prompts.fileSorterExercise,
  };
}

export async function verifyLesson02Source() {
  const { data, cards, exercise } = await lesson02Contract();
  assert.equal(data.sections.length, 13);
  assert(!data.sections.some((s) => s.id === 'l02-test'));
  assert.deepEqual(data.periods.map((p) => p.sections.reduce((n, s) => n + s.minutes, 0)), [50, 50, 50]);
  assert.equal(data.sections.reduce((n, s) => n + s.minutes, 0), 150);
  assert.deepEqual(cards.map((p) => p.id), lesson02PromptIds);
  assert.deepEqual(cards.map((p) => p.file), [
    'DJ-L02_DOC_STEP_01.txt',
    'DJ-L02_DOC_STEP_02.txt',
    'DJ-L02_DOC_STEP_03.txt',
    'DJ-L02_DOC_STEP_04.txt',
    'DJ-L02_DOC_INTEGRATED_PROMPT.txt',
  ]);
  assert.match(exercise.title, /건축 용역 착수계/);

  for (const p of cards) {
    assert.equal(normalize(p.prompt), normalize(read('review/daejeon/COMMENCEMENT_DOC_STUDENT/' + p.file)), p.id);
    assert(p.guide?.platform && p.guide.aiPromptTip && p.guide.derivation, p.id + ' guide');
    assert(!/아직 (?:만들|구현)|코드 생성 금지|실습 B|도면 제출 전/.test(p.prompt), p.id + ' obsolete gate');
    assert.match(p.prompt, /실제|구현/);
    assert.match(p.prompt, /폴더|루트/);
  }
  for (const s of ['START.bat', 'STOP.bat', 'calculator.js', '삼천팔백오십만원정', '부가세']) assert(cards[0].prompt.includes(s), s);
  for (const s of ['validator.js', '자동 조립 완료', '사람 확인(검수 대기)', '변경착수계', '자격번호']) assert(cards[1].prompt.includes(s), s);
  for (const s of ['templates.js', '착수신고서', '선임계', '참여기술자', '보안각서', 'SHA-256', '_v02', '_v03', '.tmp', '.crdownload', '~$']) assert(cards[2].prompt.includes(s), s);
  for (const s of ['127.0.0.1:4175', '외부 JSON', '읽기 전용', 'STOP.bat', '.doc']) assert(cards[3].prompt.includes(s), s);
  for (const s of ['AI_착수계자동작성', 'SHA-256', '_v02', '사람 확인(검수 대기)', '127.0.0.1:4175', '읽기 전용', 'STOP.bat', '루트 밖']) assert(cards[4].prompt.includes(s), s);

  const component = read('src/draft/components/Lesson02AutomationPractice.astro');
  const active = [
    component,
    read('src/draft/pages/lessons/02.astro'),
    read('src/draft/content/daejeon-lesson02-automation.ts'),
    read('src/draft/content/lesson02-exercises.ts'),
  ].join('\n');
  assert(!/drawingComparison|drawingChecks|drawingSpec|drawingRunSteps|l02-evidence-prompt|l02-test["']|도면 제출 전 빠른 점검|DJ-L02-B/.test(active), 'Removed B/record prompt remains');
  assert(!component.includes('data-test-prompt'));
  assert(!component.includes('이번 차시 결과 모으기'));
  assert.equal(data.testScenarios.length, 6);
  assert(component.includes('분류 기준·확인 포인트'));
  assert(read('src/draft/components/PromptPlatformGuide.astro').includes('hasPromptModelNote(Astro.url.pathname)'));
  assert(read('src/draft/content/prompt-alignment.ts').includes('OpenAI Codex (6.1 Sol / 6 Astra)'));

  return {
    passed: true,
    sections: data.sections.map((s) => ({ id: s.id, minutes: s.minutes })),
    periodMinutes: [50, 50, 50],
    prompts: cards.map((p) => ({ id: p.id, file: p.file, sha256: sha(Buffer.from(p.prompt)) })),
    testRows: 6,
  };
}

export function verifyProgramPayload() {
  const fixture = JSON.parse(read('scripts/tests/fixtures/approved-cf02-renewal-l02-vibe.json'));
  const results = [];
  for (const [name, key] of [
    ['DJ-L02_FILE_SORTER_PROGRAM.zip', 'programZipMembers'],
    ['DJ-L02_SORT_TEST.zip', 'testZipMembers'],
  ]) {
    const actual = zipMemberHashes(fs.readFileSync(path.join(R, 'review/daejeon/FILE_SORTER_STUDENT', name)));
    const unchanged = [];
    for (const [member, expected] of Object.entries(fixture[key])) {
      if (/(?:^|\/)README\.txt$/i.test(member)) continue;
      assert.deepEqual(actual[member], expected, 'Program/test payload changed ' + member);
      unchanged.push(member);
    }
    results.push({ file: name, unchangedPayloads: unchanged.length, totalMembers: Object.keys(actual).length });
  }
  return results;
}

async function verifyBrowser(url) {
  const { chromium } = await import('playwright');
  const { cards } = await lesson02Contract();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const report = { url, viewports: [], prompts: [] };
  try {
    assert.equal((await page.goto(url)).status(), 200);
    const pw = page.locator('input[type="password"]').first();
    if (await pw.isVisible().catch(() => false)) {
      await pw.fill('362300');
      await pw.press('Enter');
    }
    await page.locator('#l02-first-request').waitFor({ state: 'visible' });
    assert.deepEqual(
      await page.locator('textarea[data-copy-source]').evaluateAll((ns) => ns.map((n) => n.getAttribute('data-copy-source-for'))),
      lesson02PromptIds,
    );
    assert.equal(await page.locator('[data-guide-field="promptModelNote"]').count(), cards.length);
    for (const p of cards) {
      assert.equal(normalize(await page.locator(`textarea[data-copy-source-for="${p.id}"]`).inputValue()), normalize(p.prompt), p.id);
      assert.match(await page.locator(`[data-prompt-platform="${p.id}"]`).innerText(), /OpenAI Codex \(6\.1 Sol \/ 6 Astra\)/);
      report.prompts.push({ id: p.id, sourceIdentical: true });
    }
    const table = page.locator('[data-test-reference]');
    assert.equal(await table.locator('thead th').count(), 3);
    assert.equal(await table.locator('tbody tr').count(), 6);
    assert(!/도면 제출 전 빠른 점검|다른 예제 빠르게 체험|이번 차시 결과 모으기/.test(await page.locator('main').innerText()));
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const actual = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.equal(actual, width, 'Overflow ' + width);
      report.viewports.push({ width, scrollWidth: actual });
    }
    assert.deepEqual(errors, []);
    return report;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = { passed: false, 검증대상: '제2차시 착수계·행정서류 4종 자동 생성기 단계형 바이브 코딩' };
  try {
    report.source = await verifyLesson02Source();
    report.programPayload = verifyProgramPayload();
    const at = process.argv.indexOf('--url');
    if (at >= 0) report.browser = await verifyBrowser(process.argv[at + 1]);
    report.passed = true;
  } catch (e) {
    report.error = e.stack || e.message;
    process.exitCode = 1;
  }
  const i = process.argv.indexOf('--report');
  if (i >= 0) {
    const p = path.resolve(process.argv[i + 1]);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify(report, null, 2));
}
