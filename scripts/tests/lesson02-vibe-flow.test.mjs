import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  lesson02Contract,
  lesson02PromptIds,
  verifyLesson02Source,
  verifyProgramPayload,
  zipMemberHashes,
} from '../verify-daejeon-automation-ab.mjs';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const read = (p) => fs.readFileSync(p);

test('제2차시는 3×50분 착수계·행정서류 4종 자동 생성기와 Step 1~4·통합 요청문 하나로 이어진다', async () => {
  const result = await verifyLesson02Source();
  assert(result.passed);
  assert.equal(result.sections.length, 13);
  assert.deepEqual(result.periodMinutes, [50, 50, 50]);
  assert.deepEqual(result.prompts.map((p) => p.id), lesson02PromptIds);
  const { data } = await lesson02Contract();
  assert.deepEqual(
    data.sections.slice(7, 11).map((s) => s.id),
    ['l02-first-request', 'l02-plan-review', 'l02-implementation-spec', 'l02-implement'],
  );
});

test('새 단계 요청문은 공동 모델 가이드와 원본 TXT를 사용하고 기존 보존 아카이브도 훼손하지 않는다', async () => {
  const { cards } = await lesson02Contract();
  for (const card of cards) {
    assert.equal(card.guide.kind, 'code');
    assert.equal(card.guide.role, 'local');
    assert(card.guide.aiPromptTip);
    assert(card.guide.purpose);
    assert(card.guide.variables);
  }
  const runtime = verifyProgramPayload();
  assert.deepEqual(runtime.map((r) => r.unchangedPayloads), [18, 12]);
});

function verifyBundle(file) {
  const members = zipMemberHashes(read(file), true);
  const root = Object.keys(members)[0].split('/')[0] + '/';
  const manifest = JSON.parse(members[root + 'manifest.json'].content.toString('utf8'));
  assert.equal(manifest.selfHashExcluded, true);
  assert(!manifest.files.some((x) => x.file === 'manifest.json'));
  for (const row of manifest.files) {
    const member = members[root + row.file];
    assert(member, row.file);
    assert.equal(member.bytes, row.bytes, row.file);
    assert.equal(member.sha256, row.sha256, row.file);
  }
  const checks = members[root + 'SHA256SUMS.txt'].content
    .toString('utf8')
    .trim()
    .split('\n')
    .map((line) => line.match(/^([a-f0-9]{64})  (.+)$/));
  assert(checks.every(Boolean));
  assert.equal(checks.length, Object.keys(members).length - 1);
  for (const [, expected, name] of checks) {
    assert.equal(members[root + name]?.sha256, expected, name);
  }
  return { members, root };
}

test('제1·2차시 실습 ZIP들의 manifest와 전체 멤버 SHA가 실제 원문에 맞는다', async () => {
  const first = verifyBundle('review/daejeon/DJ-L01-RFP-BRIEF/DJ-L01-rfp-and-brief.zip');
  for (const [name, entry] of Object.entries(first.members)) {
    const relative = name.slice(first.root.length);
    if (!relative.startsWith('DJ-CF-')) continue;
    const [project, file] = relative.split('/');
    const folder = project === 'DJ-CF-02' && file.endsWith('-generation-prompt.txt') ? 'instructor/' : '';
    assert.equal(entry.sha256, sha(read(`review/daejeon/${project}/${folder}${file}`)), relative);
  }

  const commencementBundle = verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_COMMENCEMENT_VIBE_PACK.zip');
  verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_COMMENCEMENT_PROGRAM.zip');
  verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_DOC_TEST.zip');

  const { cards } = await lesson02Contract();
  for (const card of cards) {
    assert.equal(commencementBundle.members[commencementBundle.root + card.file].sha256, sha(Buffer.from(card.prompt)), card.id);
  }
  assert.equal(
    commencementBundle.members[commencementBundle.root + '실행예제/DJ-L02_COMMENCEMENT_PROGRAM.zip'].sha256,
    sha(read('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_COMMENCEMENT_PROGRAM.zip')),
  );
  assert.equal(
    commencementBundle.members[commencementBundle.root + '실행예제/DJ-L02_DOC_TEST.zip'].sha256,
    sha(read('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_DOC_TEST.zip')),
  );
});

test('활성 배포 등록에는 도면 점검 B 경로가 없고 착수계 단계별 TXT·통합 ZIP을 제공한다', async () => {
  const assets = await import('../daejeon-commencement-assets.mjs');
  assert(!assets.commencementAssets.some((x) => /\/B\/|DJ-L02-B|DRAWING_QUICK_CHECK/.test(x.outputPath)));
  const { cards } = await lesson02Contract();
  for (const card of cards) {
    assert(assets.commencementAssets.some((x) => x.file === card.file), card.file);
  }
  assert(assets.commencementAssets.some((x) => x.file === 'DJ-L02_COMMENCEMENT_VIBE_PACK.zip'));
  const output = fs.readFileSync('scripts/draft-output.mjs', 'utf8');
  assert(!/drawingDemoRoute|DRAWING_QUICK_CHECK|practice\/DJ-L02-B/.test(output));
});

test('제2차시 초보자 설치 안내·7규칙 Step 0 로드맵·문서별 페이지 분리·회사 양식 2가지 방식이 모두 연결된다', async () => {
  const { data } = await lesson02Contract();
  assert.equal(data.sevenRulesForVibeCoding.length, 7);
  assert.equal(data.stepByStepCommandGuide.length, 5);
  assert.equal(data.nodeInstallSteps.length, 4);
  assert.equal(data.codexInstallRoutes.length, 3);
  assert.equal(data.realWorldUsageGuide.rows.length, 3);
  assert.match(data.stepZeroPlanPrompt, /아직 코드를 작성하지 마/);
  assert(fs.existsSync('review/daejeon/COMMENCEMENT_DOC_STUDENT/vibe-coding-7rules-roadmap.svg'));

  const inputSource = fs.readFileSync('src/draft/content/lesson02-input-methods.ts', 'utf8');
  assert.match(inputSource, /companyFormAdaptationGuide/);
  assert.match(inputSource, /\.hwpx/);

  const program = verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_COMMENCEMENT_PROGRAM.zip');
  const templatesJs = program.members[program.root + 'app/templates.js'].content.toString('utf8');
  const standaloneHtml = program.members[program.root + 'AI_착수계자동작성_단일실행본.html'].content.toString('utf8');
  for (const code of [templatesJs, standaloneHtml]) {
    assert.match(code, /buildStandaloneExportDocument/);
    assert.match(code, /<w:View>Print<\/w:View>/);
    assert.match(code, /mso-special-character:line-break;\s*page-break-before:always;/);
    assert.match(code, /additionalLeads/);
    assert.match(code, /display:\s*table-header-group/);
  }

  // 제2차시 도면 축척 안내문 제외 확인 및 자율 응용 실습 2종(다른 로직 비교 + 작동 샘플 ZIP) 검증
  const reviewLayout = fs.readFileSync('src/draft/layouts/ReviewLayout.astro', 'utf8');
  assert.match(reviewLayout, /lessonId !== '02'/);
  assert.equal(data.extraWorkshopsGuide.logicComparisonRows.length, 3);
  assert.equal(data.extraWorkshopsGuide.examples.length, 2);
  assert(fs.existsSync('review/daejeon/COMMENCEMENT_DOC_STUDENT/vibe-coding-3-logic-types.svg'));
  assert(fs.existsSync('review/daejeon/COMMENCEMENT_DOC_STUDENT/SPACE_PROGRAM_UI_PREVIEW.png'));
  assert(fs.existsSync('review/daejeon/COMMENCEMENT_DOC_STUDENT/PHOTO_SHEET_UI_PREVIEW.png'));
  verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_SPACE_PROGRAM_SAMPLE.zip');
  verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_PHOTO_SHEET_SAMPLE.zip');

  // 제2-2차시 독립 초간단 입문편(착수계·선임계 2종 단일 HTML · ChatGPT 플랜·검수 + Codex 6.1 Sol 구현) 검증
  assert(fs.existsSync('src/draft/pages/lessons/02-2.astro'));
  const easySource = fs.readFileSync('src/draft/content/daejeon-lesson02-2-easy.ts', 'utf8');
  assert.match(easySource, /6\.1 Sol/);
  assert.match(easySource, /파일을 직접 첨부/);
  assert.match(easySource, /플랜 수립자이자 검수자야/);
  assert.match(easySource, /Q1\. 기존 문서 양식이 있나요\?/);
  assert.match(easySource, /편집 가능한 Word 파일/);
  assert.match(easySource, /공사마다 여러 명 가능/);
  assert.match(easySource, /지시문 전달 전에는 파일을 만들지 마/);
  assert.match(easySource, /\[작업 완료 보고\]/);
  const easyStarter = verifyBundle('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02_2_EASY_STARTER_PACK.zip');
  assert(easyStarter.members[easyStarter.root + 'COMPLETION_REPORT_완료보고예시.md']);
  const easySingleHtml = easyStarter.members[easyStarter.root + '착수계_선임계_초간단생성기.html'].content.toString('utf8');
  assert.match(easySingleHtml, /용 역 착 수 신 고 서/);
  assert.match(easySingleHtml, /책 임 기 술 자 선 임 계/);
  assert.match(easySingleHtml, /btn-add-eng/);
  assert.match(easySingleHtml, /application\/msword/);
  assert.match(easySingleHtml, /page-break-before:\s*always/);
  assert(fs.existsSync('review/daejeon/COMMENCEMENT_DOC_STUDENT/DJ-L02-2_EASY_WORKBOOK_TEXTBOOK.pdf'));
});
