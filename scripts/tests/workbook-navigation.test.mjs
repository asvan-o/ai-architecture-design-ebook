import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {chromium} from 'playwright';

const layout = fs.readFileSync(new URL('../../src/draft/layouts/ReviewLayout.astro', import.meta.url), 'utf8');
const navigationScript = ts.transpile(layout.match(/<script>\s*([\s\S]*?)<\/script>/)[1], {target: ts.ScriptTarget.ES2022});
const navigationCss = fs.readFileSync(new URL('../../src/draft/styles/review-navigation-screen.css', import.meta.url), 'utf8');
const lessonCss = fs.readFileSync(new URL('../../src/draft/styles/lesson-studio-screen.css', import.meta.url), 'utf8');
const reviewCss = fs.readFileSync(new URL('../../src/draft/styles/review.css', import.meta.url), 'utf8').replace(/^@import[^;]+;/gm, '');
let browser;
before(async () => { browser = await chromium.launch({headless: true}); });
after(async () => { await browser?.close(); });

async function fixture(width) {
  const page = await browser.newPage({viewport: {width, height: 900}});
  await page.setContent(`<html data-course-id="daejeon-2026"><head><style>
    :root {--paper:#f8f9fa;--paper-deep:#f1f5f9;--surface:#fff;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--line-dark:#cbd5e1;--accent-dark:#1e3a8a}
    *{box-sizing:border-box}body{margin:0}.review-header{display:flex} .review-shell{display:grid;padding:24px}
    @media print{.review-header,.review-sidebar{display:none}}
    ${navigationCss}</style></head><body class="review-page">
    <header class="review-header"><a class="review-brand" href="#main">AI LECTURE</a><nav>
    <a href="#main">홈</a><details class="review-lesson-menu"><summary>차시 이동</summary><div class="review-lesson-menu__panel">${Array.from({length:13}, (_,i)=>`<a href="#lesson-${i+1}">${i+1}차시</a>`).join('')}</div></details></nav></header>
    <div class="review-shell review-shell--toc"><aside class="review-sidebar"><details class="review-sidebar-disclosure"><summary>목차 · 차시 찾아보기</summary><div class="review-sidebar-content">
    <div class="review-sidebar-tabs" role="tablist"><button id="review-current-tab" role="tab" aria-controls="review-current-panel" aria-selected="true">이 차시 목차</button><button id="review-course-tab" role="tab" aria-controls="review-course-panel" aria-selected="false" tabindex="-1">전체 13차시</button></div>
    <nav id="review-current-panel" class="review-toc" role="tabpanel"><details open><summary>현재 목차</summary><ol><li><a href="#ai-basics">생성형 AI</a></li></ol></details></nav>
    <nav id="review-course-panel" class="review-course-toc" role="tabpanel" hidden><details class="review-course-toc__details" open><summary>전체 목차</summary><a href="#lesson-1">제1차시</a></details></nav>
    </div></details></aside><main id="main"><section id="ai-basics">보존할 학습 본문</section></main></div></body></html>`);
  await page.addScriptTag({content: navigationScript});
  return page;
}

test('워크북 목차는 현재 차시에서 시작하고 키보드로 전체 차시와 왕복한다', async () => {
  const page = await fixture(1440);
  try {
    assert(await page.locator('#review-current-panel').isVisible());
    assert(!(await page.locator('#review-course-panel').isVisible()));
    const text = await page.locator('main').textContent();
    await page.locator('#review-current-tab').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#review-course-tab').getAttribute('aria-selected'), 'true');
    assert(await page.locator('#review-course-panel').isVisible());
    assert(!(await page.locator('#review-current-panel').isVisible()));
    await page.keyboard.press('Home');
    assert(await page.locator('#review-current-panel').isVisible());
    assert.equal(await page.locator('main').textContent(), text);
  } finally { await page.close(); }
});

test('모바일 목차는 기본 접힘이며 본문 이동 뒤 다시 접힌다', async () => {
  for (const width of [390, 320]) {
    const page = await fixture(width);
    try {
      assert.equal(await page.locator('.review-sidebar-disclosure').getAttribute('open'), null);
      await page.locator('.review-sidebar-disclosure > summary').focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('#review-current-panel').isVisible());
      await page.locator('.review-toc a').click();
      assert.equal(await page.locator('.review-sidebar-disclosure').getAttribute('open'), null);
      assert.equal(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth), 0);
    } finally { await page.close(); }
  }
});

test('차시 이동 팝오버는 13개 링크를 제공하고 Escape와 외부 클릭으로 닫힌다', async () => {
  const page = await fixture(1440);
  try {
    const trigger = page.locator('.review-lesson-menu > summary');
    await trigger.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.review-lesson-menu__panel a:visible').count(), 13);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.review-lesson-menu').getAttribute('open'), null);
    assert(await trigger.evaluate(e => e === document.activeElement));
    await trigger.click();
    await page.locator('main').click();
    assert.equal(await page.locator('.review-lesson-menu').getAttribute('open'), null);
  } finally { await page.close(); }
});

test('네비게이션 화면 스타일은 인쇄와 광주 스코프에 적용되지 않는다', async () => {
  const page = await fixture(1440);
  try {
    assert.equal(await page.locator('.review-header').evaluate(e => getComputedStyle(e).position), 'sticky');
    await page.emulateMedia({media: 'print'});
    assert.equal(await page.locator('.review-header').evaluate(e => getComputedStyle(e).position), 'static');
    assert(!(await page.locator('.review-sidebar').isVisible()));
    await page.emulateMedia({media: 'screen'});
    await page.locator('html').evaluate(e => e.dataset.courseId = 'gwangju');
    assert.equal(await page.locator('.review-header').evaluate(e => getComputedStyle(e).position), 'static');
  } finally { await page.close(); }
});

function contrastRatio(foreground, background) {
  const luminance = color => {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
      const s = value / 255;
      return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const lightness = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (lightness[1] + .05) / (lightness[0] + .05);
}

test('선택·주요 버튼은 호버 후에도 흰 글자와 WCAG AA 대비를 유지한다', async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<html data-course-id="daejeon-2026"><head><style>
      :root {--surface:#fff;--paper-deep:#f1f5f9;--accent:#1d4ed8;--accent-dark:#1e3a8a;--line-dark:#cbd5e1}
      button,a{display:inline-block;padding:16px;margin:8px}*{transition:none!important}
      ${lessonCss}</style></head><body class="review-page">
      <section class="lesson03-review">
        <button id="selected" aria-pressed="true">선택한 기준 공간</button>
        <button id="ordinary" aria-pressed="false">다른 기준 공간</button>
        <button id="disabled" aria-pressed="true" disabled>선택 불가</button>
        <button id="aria-disabled" aria-pressed="true" aria-disabled="true">사용 불가</button>
      </section>
      <section class="l02-ab"><div class="lesson02-asset-actions">
        <button id="primary" class="l02-ab-primary">실습 시작</button>
        <a id="primary-link" class="l02-ab-primary" href="#">실습 다운로드</a>
      </div></section></body></html>`);
    const failures = [];
    for (const id of ['selected', 'ordinary', 'disabled', 'aria-disabled', 'primary', 'primary-link']) {
      const button = page.locator(`#${id}`);
      await button.hover({force: true});
      const colors = await button.evaluate(element => {
        const style = getComputedStyle(element);
        return {foreground: style.color, background: style.backgroundColor};
      });
      const ratio = contrastRatio(colors.foreground, colors.background);
      if (ratio < 4.5) failures.push(`${id}: ${ratio.toFixed(2)}:1 (${colors.foreground} / ${colors.background})`);
      assert.equal(colors.foreground, id === 'ordinary' ? 'rgb(30, 58, 138)' : 'rgb(255, 255, 255)', `${id} 글자색`);
      if (['selected', 'primary', 'primary-link'].includes(id)) assert.equal(colors.background, 'rgb(29, 78, 216)', `${id} 활성 호버의 불투명 강조 배경 유지`);
      if (id === 'ordinary') assert.equal(colors.background, 'rgb(241, 245, 249)', '일반 버튼의 연한 호버 배경 유지');
      if (id === 'disabled' || id === 'aria-disabled') assert.equal(colors.background, 'rgb(30, 58, 138)', `${id} 비활성 호버 배경 유지`);
    }
    assert.deepEqual(failures, [], '호버 대비는 일반 크기 텍스트 WCAG AA 4.5:1 이상이어야 한다');
  } finally { await page.close(); }
});

test('모든 목차·용어 앵커는 모바일 고정 헤더 아래 최소 12px 여백을 확보한다', async () => {
  const failures = [];
  for (const width of [1440, 700, 390, 320]) {
    const page = await browser.newPage({viewport: {width, height: 900}});
    try {
      await page.setContent(`<html data-course-id="daejeon-2026"><head><style>
        :root{--paper-deep:#f1f5f9;--accent-dark:#1e3a8a;--muted:#475569;--line:#e2e8f0}
        /* review.css의 전역 스크롤 여백과 실제 2줄 모바일 헤더 높이를 재현한다. */
        html{font-size:16px;scroll-padding-top:5rem;scroll-behavior:auto}
        *{box-sizing:border-box}body{margin:0}.review-header{display:flex;height:76px}
        @media(max-width:700px){.review-header{height:106px}}
        .spacer{height:1200px}main{padding:0 16px}article,section,main>div[id]{min-height:140px}
        ${navigationCss}</style></head><body class="review-page">
        <header class="review-header"><nav>
          <a href="#term-soffit">용어</a><a href="#course-roadmap">로드맵</a>
          <a href="#course-start">시작</a><a href="#lesson-section">본문</a>
        </nav></header><main>
          <div class="spacer"></div><article class="glossary-entry" id="term-soffit">용어 설명</article>
          <div class="spacer"></div><section class="course-roadmap" id="course-roadmap">전체 과정</section>
          <div class="spacer"></div><div id="course-start">학습 시작</div>
          <div class="spacer"></div><section class="review-section" id="lesson-section">기존 본문 앵커</section>
          <div class="spacer"></div>
        </main></body></html>`);
      for (const id of ['term-soffit', 'course-roadmap', 'course-start', 'lesson-section']) {
        await page.locator(`a[href="#${id}"]`).click();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const bounds = await page.locator(`#${id}`).evaluate(element => {
          const header = document.querySelector('.review-header').getBoundingClientRect();
          return {gap: element.getBoundingClientRect().top - header.bottom, headerHeight: header.height};
        });
        assert.equal(bounds.headerHeight, width <= 700 ? 106 : 76, '실제 고정 헤더에 가까운 높이로 검사');
        if (bounds.gap < 12) failures.push(`${width}px #${id}: 헤더 아래 여백 ${bounds.gap}px`);
        assert.equal(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth), 0);
      }
    } finally { await page.close(); }
  }
  assert.deepEqual(failures, [], '앵커 제목이 고정 헤더 아래 12px 이상 떨어져 보여야 한다');
});

const tocStorageKey = 'daejeon-2026:workbook-toc-collapsed';

async function desktopTocFixture(width, {courseId = 'daejeon-2026', storedCollapsed, blockStorage = false} = {}) {
  const initializer = layout.match(/<script\b[^>]*data-workbook-toc-initializer[^>]*>([\s\S]*?)<\/script>/)?.[1];
  const control = name => layout.match(new RegExp(`<button\\b[^>]*data-toc-${name}[^>]*>[\\s\\S]*?<\\/button>`))?.[0];
  assert(initializer, '첫 화면을 그리기 전에 목차 상태를 복원하는 실제 head script 필요');
  assert(control('collapse') && control('open'), '실제 레이아웃의 목차 접기·열기 버튼 필요');
  const page = await browser.newPage({viewport: {width, height: 900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (blockStorage) {
    await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage access denied', 'SecurityError'); },
    }));
  } else if (storedCollapsed !== undefined) {
    await page.addInitScript(({key, value}) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, String(value));
    }, {key: tocStorageKey, value: storedCollapsed});
  }
  await page.route('http://workbook.test/**', route => route.fulfill({contentType: 'text/html', body: `<!doctype html>
    <html lang="ko" data-course-id="${courseId}"><head><meta charset="utf-8">
    <script>${initializer}</script>
    <script>window.__tocAtHead = document.documentElement.dataset.tocCollapsed;</script>
    <style>
      :root{--paper:#f8f9fa;--paper-deep:#f1f5f9;--surface:#fff;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--line-dark:#cbd5e1;--accent:#1d4ed8;--accent-dark:#1e3a8a}
      *{box-sizing:border-box;transition:none!important}body{margin:0;font:16px sans-serif}
      main section{min-height:600px}
      ${reviewCss}
      ${navigationCss}
    </style></head><body class="review-page">
    <header class="review-header"><a class="review-brand" href="/workbook/">AI LECTURE <span>ARCHITECTURE DESIGN</span></a><nav>
      <a href="/workbook/">홈</a><a href="/workbook/course-overview/">과정 개요</a>
      <details class="review-lesson-menu"><summary>차시 이동</summary><div class="review-lesson-menu__panel"><a href="/workbook/lessons/02/">제2차시</a></div></details>
      <a href="/workbook/glossary/">용어 사전</a>${control('open')}
    </nav></header>
    <div class="review-shell review-shell--toc"><aside class="review-sidebar" id="review-sidebar" aria-label="과정 목차">
      ${control('collapse')}<details class="review-sidebar-disclosure"><summary>목차 · 차시 찾아보기</summary><div class="review-sidebar-content">
      <div class="review-sidebar-tabs" role="tablist"><button id="review-current-tab" role="tab" aria-controls="review-current-panel" aria-selected="true">이 차시 목차</button><button id="review-course-tab" role="tab" aria-controls="review-course-panel" aria-selected="false" tabindex="-1">전체 13차시</button></div>
      <nav id="review-current-panel" class="review-toc" role="tabpanel"><details open><summary>현재 목차</summary><a href="#ai-basics">생성형 AI</a></details></nav>
      <nav id="review-course-panel" class="review-course-toc" role="tabpanel" hidden><a href="/workbook/lessons/02/">제2차시</a></nav>
      </div></details></aside><main id="main" tabindex="-1"><section id="ai-basics"><h1>보존할 학습 본문</h1><p>목차를 접어도 실습 내용은 그대로 유지합니다.</p></section></main></div>
    <script>${navigationScript}</script></body></html>`}));
  await page.goto('http://workbook.test/workbook/lessons/01/');
  return {page, errors};
}

async function assertTocControlContrast(control, name) {
  const style = await control.evaluate(element => {
    const computed = getComputedStyle(element);
    return {color: computed.color, background: computed.backgroundColor, outline: computed.outlineStyle, outlineWidth: parseFloat(computed.outlineWidth), outlineOffset: parseFloat(computed.outlineOffset)};
  });
  assert(!/rgba\([^)]*,\s*0\)/.test(style.background), `${name} 불투명 버튼 배경`);
  assert(contrastRatio(style.color, style.background) >= 4.5, `${name} 텍스트 대비는 WCAG AA 4.5:1 이상`);
  return style;
}

test('데스크톱 목차 접기·펼치기는 본문 폭과 초점·ARIA 상태를 함께 바꾼다', async () => {
  for (const width of [1440, 1024, 1001]) {
    const {page, errors} = await desktopTocFixture(width);
    try {
      const close = page.locator('[data-toc-collapse]');
      const open = page.locator('[data-toc-open]');
      const main = page.locator('main');
      const content = await main.textContent();
      const beforeWidth = (await main.boundingBox()).width;
      assert(await close.isVisible(), `${width}px 접기 버튼`);
      assert(!(await open.isVisible()), `${width}px 열린 상태의 펼치기 버튼 숨김`);
      for (const button of [close, open]) {
        assert.equal(await button.getAttribute('aria-controls'), 'review-sidebar');
        assert.equal(await button.getAttribute('aria-expanded'), 'true');
        assert.notEqual(await button.getAttribute('hidden'), null, '모바일·인쇄에 기본 hidden 안전장치 유지');
      }
      await assertTocControlContrast(close, '접기 기본');
      await close.hover();
      await assertTocControlContrast(close, '접기 호버');
      await page.mouse.move(0, 0);
      await close.focus();
      const focused = await assertTocControlContrast(close, '접기 키보드 초점');
      assert(focused.outline !== 'none' && focused.outlineWidth > 0, '접기 버튼의 키보드 초점 표시');
      assert.equal(focused.outlineOffset, -3, '사이드바 스크롤 영역 안에 초점 테두리 표시');
      await page.keyboard.press('Enter');
      assert(!(await page.locator('.review-sidebar').isVisible()));
      assert(await open.isVisible());
      assert(await open.evaluate(element => element === document.activeElement), '숨겨진 사이드바에 초점이 남지 않음');
      assert.equal(await page.locator('html').getAttribute('data-toc-collapsed'), 'true');
      assert.equal(await page.evaluate(key => localStorage.getItem(key), tocStorageKey), 'true');
      for (const button of [close, open]) assert.equal(await button.getAttribute('aria-expanded'), 'false');
      const collapsedWidth = (await main.boundingBox()).width;
      assert(collapsedWidth > beforeWidth + 32, `${width}px 접으면 본문 영역 확장 (${beforeWidth}px → ${collapsedWidth}px, 최대 폭 제한 허용)`);
      await assertTocControlContrast(open, '펼치기 기본·초점');
      await open.hover();
      await assertTocControlContrast(open, '펼치기 호버');
      await page.keyboard.press('Enter');
      assert(await close.isVisible());
      assert(await close.evaluate(element => element === document.activeElement), '펼치면 사이드바 제어로 초점 복귀');
      for (const button of [close, open]) assert.equal(await button.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.evaluate(key => localStorage.getItem(key), tocStorageKey), 'false');
      assert.equal((await main.boundingBox()).width, beforeWidth);
      assert.equal(await main.textContent(), content);
      assert.equal(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth), 0);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
});

test('다음 차시와 새로고침에서도 목차 상태를 head 단계에서 복원한다', async () => {
  const {page, errors} = await desktopTocFixture(1440, {storedCollapsed: true});
  try {
    for (const path of ['/workbook/lessons/02/', '/workbook/course-overview/']) {
      assert.equal(await page.evaluate(() => window.__tocAtHead), 'true', '본문 생성 전 접힘 상태 복원');
      assert(!(await page.locator('.review-sidebar').isVisible()));
      assert.equal(await page.locator('[data-toc-open]').getAttribute('aria-expanded'), 'false');
      await page.goto(`http://workbook.test${path}`);
    }
    await page.reload();
    assert.equal(await page.evaluate(() => window.__tocAtHead), 'true');
    await page.locator('[data-toc-open]').click();
    await page.goto('http://workbook.test/workbook/glossary/');
    assert.notEqual(await page.evaluate(() => window.__tocAtHead), 'true', '펼침 선택도 다음 페이지에 유지');
    assert(await page.locator('.review-sidebar').isVisible());
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('데스크톱 접힘 저장값은 모바일 목차·인쇄·광주 화면에 영향을 주지 않는다', async () => {
  for (const width of [1000, 390]) {
    const {page, errors} = await desktopTocFixture(width, {storedCollapsed: true});
    try {
      for (const selector of ['[data-toc-collapse]', '[data-toc-open]']) assert(!(await page.locator(selector).isVisible()));
      assert(await page.locator('.review-sidebar').isVisible());
      assert.equal(await page.locator('.review-sidebar-disclosure').getAttribute('open'), null);
      await page.locator('.review-sidebar-disclosure > summary').click();
      assert(await page.locator('#review-current-panel').isVisible());
      await page.locator('.review-toc a').click();
      assert.equal(await page.locator('.review-sidebar-disclosure').getAttribute('open'), null);
      await page.setViewportSize({width: 1001, height: 900});
      assert(!(await page.locator('.review-sidebar').isVisible()), '데스크톱으로 돌아가면 저장한 접힘 상태 복원');
      await page.emulateMedia({media: 'print'});
      for (const selector of ['[data-toc-collapse]', '[data-toc-open]']) assert(!(await page.locator(selector).isVisible()));
      assert(await page.locator('main').isVisible());
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
  const {page, errors} = await desktopTocFixture(1440, {courseId: 'gwangju', storedCollapsed: true});
  try {
    assert.equal(await page.evaluate(() => window.__tocAtHead), undefined, '광주에서는 저장값을 읽어 문서 상태를 변경하지 않음');
    assert.equal(await page.locator('html').getAttribute('data-toc-collapsed'), null);
    for (const selector of ['[data-toc-collapse]', '[data-toc-open]']) {
      assert(!(await page.locator(selector).isVisible()));
      await page.locator(selector).evaluate(button => button.click());
    }
    assert.equal(await page.locator('html').getAttribute('data-toc-collapsed'), null);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), tocStorageKey), 'true');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('localStorage가 차단되어도 목차 기본 표시와 현재 페이지 토글은 동작한다', async () => {
  const {page, errors} = await desktopTocFixture(1440, {blockStorage: true});
  try {
    assert(await page.locator('.review-sidebar').isVisible());
    await page.locator('[data-toc-collapse]').click();
    assert(!(await page.locator('.review-sidebar').isVisible()));
    await page.locator('[data-toc-open]').click();
    assert(await page.locator('.review-sidebar').isVisible());
    await page.reload();
    assert(await page.locator('.review-sidebar').isVisible());
    assert.deepEqual(errors, [], 'Storage SecurityError는 사용자 화면의 스크립트 오류로 전파하지 않음');
  } finally { await page.close(); }
});
