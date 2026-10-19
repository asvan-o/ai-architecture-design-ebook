import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldUseRelease, rewriteText, rewriteAssetUrl, defaultConfig, namedReleaseAsset } from '../pages-release-assets.mjs';
const plan = { ...defaultConfig, files: [{ path: 'daejeon/downloads/실습 자료.zip', url: 'https://github.com/asvan-o/ai-architecture-design-ebook/releases/download/test/pack.zip' }] };
test('Pages keeps all fourteen Daejeon textbooks and same-origin GLB viewer models', () => {
  assert(!shouldUseRelease('daejeon/downloads/daejeon/pdf/ai-architecture-design-daejeon-lesson-07.pdf', 82_539_532));
  assert(!shouldUseRelease('daejeon/downloads/daejeon/lesson-09/house.glb', 20_000_000));
  assert(shouldUseRelease('gwangju/downloads/textbook.pdf', 10_000_000));
  assert(shouldUseRelease('daejeon/practice/pack.zip', 96_000_000));
  assert(shouldUseRelease('daejeon/images/large.png', 31_000_000));
  assert(!shouldUseRelease('daejeon/images/small.png', 1_000_000));
});
test('Relative and encoded download links resolve to the exact Release URL', () => {
  assert.equal(rewriteAssetUrl('../../downloads/실습%20자료.zip#sample', 'daejeon/lessons/02/index.html', plan), plan.files[0].url + '#sample');
  assert.equal(rewriteAssetUrl('/ai-architecture-design-ebook/daejeon/downloads/%EC%8B%A4%EC%8A%B5%20%EC%9E%90%EB%A3%8C.zip', 'index.html', plan), plan.files[0].url);
});
test('Absolute, HTML and JSON-escaped references are rewritten without corrupting unrelated links', () => {
  const local = '/ai-architecture-design-ebook/daejeon/downloads/실습 자료.zip';
  const result = rewriteText(`<a href="${local}">원본 다운로드</a><script>{"url":"${local.replaceAll('/', '\\/')}"}</script>`, 'daejeon/lessons/02/index.html', plan);
  assert(result.includes('href="' + plan.files[0].url + '"'));
  assert(result.includes(plan.files[0].url.replaceAll('/', '\\/')));
  assert(result.includes('원본 다운로드'));
  assert.equal(rewriteAssetUrl('https://law.go.kr/법령', 'index.html', plan), 'https://law.go.kr/법령');
  assert.equal(rewriteAssetUrl('javascript:void(0)', 'index.html', plan), 'javascript:void(0)');
});
test('Mobile wrapping is confined to the published Lesson04 output without editing canonical teaching text', () => {
  const original='<head></head><main id="main-content"><li>MAX·MAYA·BLEND·RHINO</li></main>';
  const result=rewriteText(original,'gwangju/lessons/04/index.html',plan);
  assert(result.includes('overflow-wrap:anywhere'));
  assert(result.endsWith(original.slice(original.indexOf('<main'))));
  assert.equal(rewriteText(original,'gwangju/lessons/03/index.html',plan),original);
});

test('Student Release filenames identify the lesson and document without a content hash', () => {
  const cases = [
    ['lesson-10/DJ-L10_법규검토_프롬프트_실습팩.zip', 'DJ-L10-Prompt-Pack.zip'],
    ['lesson-10/A01_건축기획서.pdf', 'DJ-L10-A01-Architecture-Plan.pdf'],
    ['lesson-12/모던3층단독주택_AI설계제안서_8장슬라이드.pptx', 'DJ-L12-Modern3F-Proposal-8Slides.pptx'],
    ['lesson-13/모던3층단독주택_프로젝트결과보고서_예시.pdf', 'DJ-L13-Modern3F-Result-Report.pdf'],
    ['lesson-13/제11_13차시_포트폴리오_PPT_결과보고서_통합패키지.zip', 'DJ-L11-13-Portfolio-Full-Pack.zip'],
  ];
  for (const [relative, name] of cases) {
    for (const prefix of ['daejeon/', 'gwangju/', '']) assert.equal(namedReleaseAsset(prefix + 'downloads/daejeon/' + relative), name);
    assert(/^[A-Za-z0-9.-]+$/.test(name));
  }
  assert.equal(namedReleaseAsset('gwangju/downloads/lesson-10/original.pdf'), undefined);
  assert.equal(namedReleaseAsset('daejeon/downloads/daejeon/lesson-09/original.zip'), undefined);
});
