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

async function readingPositionFixture(width = 1440, {hash = '', courseId = 'daejeon-2026'} = {}) {
  const control = name => layout.match(new RegExp(`<button\\b[^>]*data-toc-${name}[^>]*>[\\s\\S]*?<\\/button>`))?.[0];
  const page = await browser.newPage({viewport: {width, height: 900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const number = index => String(index === 1 ? 1 : index + 2).padStart(2, '0');
  const item = (id, title) => `<li><a href="#${id}"><span data-toc-number hidden></span><span data-toc-label>${title}</span><span data-toc-active-label hidden>현재</span></a></li>`;
  const section = index => `<section class="review-section" id="section-${index}" style="min-height:${index === 2 ? 2200 : 560}px"><header class="review-section-heading"><span class="review-number">${number(index)}</span><div><h2>단계 ${index} 실습의 자세한 설명과 검토 기준</h2></div></header><p>번호를 별도로 추정하지 않고 본문의 표시를 따라야 합니다.</p></section>`;
  const list = (start, end) => Array.from({length:end-start+1}, (_, index) => item(`section-${start+index}`, `단계 ${start+index} 실습의 자세한 설명과 검토 기준`)).join('');
  const sections = (start, end) => Array.from({length:end-start+1}, (_, index) => section(start+index)).join('');
  await page.route('http://reading-position.test/**', route => route.fulfill({contentType:'text/html', body:`<!doctype html><html lang="ko" data-course-id="${courseId}"><head><meta charset="utf-8"><style>
    :root{--paper:#f8f9fa;--paper-deep:#f1f5f9;--surface:#fff;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--line-dark:#cbd5e1;--accent:#1d4ed8;--accent-dark:#1e3a8a}
    *{box-sizing:border-box;transition:none!important}body{margin:0;font:16px sans-serif}
    ${reviewCss}
    ${navigationCss}
    html{scroll-behavior:auto!important}main{min-width:0}.review-section-heading{display:flex;gap:12px}.review-section{padding:20px 0}
  </style></head><body class="review-page">
    <header class="review-header"><a class="review-brand" href="#main">AI LECTURE <span>ARCHITECTURE DESIGN</span></a><nav><a href="#main" id="focus-sentinel">홈</a><a href="#main">과정 개요</a>${control('open')}</nav></header>
    <div class="review-shell review-shell--toc"><aside class="review-sidebar" id="review-sidebar" aria-label="과정 목차">
      ${control('collapse')}<div class="review-reading-position" data-toc-reading hidden><span>현재 위치</span><strong data-toc-reading-label>차시 시작</strong></div><details class="review-sidebar-disclosure"><summary>목차 · 차시 찾아보기</summary><div class="review-sidebar-content">
      <div class="review-sidebar-tabs" role="tablist"><button id="review-current-tab" role="tab" aria-controls="review-current-panel" aria-selected="true">이 차시 목차</button><button id="review-course-tab" role="tab" aria-controls="review-course-panel" aria-selected="false" tabindex="-1">전체 13차시</button></div>
      <nav id="review-current-panel" class="review-toc" role="tabpanel"><details open><summary>현재 차시 내부 목차</summary>
        <details class="review-toc-group" data-toc-period="part-one" open><summary>Part 1 · 시작과 실습</summary><ol>${item('part-one','Part 1 시작')}${item('course-start','COURSE OVERVIEW')}${list(1,12)}</ol></details>
        <details class="review-toc-group" data-toc-period="part-two" open><summary>Part 2 · 이어지는 실습</summary><ol>${item('part-two','Part 2 시작')}${list(13,24)}${item('extra-workshop','추가 자율 실습')}</ol></details>
      </details></nav><nav id="review-course-panel" class="review-course-toc" role="tabpanel" hidden><a href="/workbook/lessons/02/">제2차시</a></nav>
      </div></details></aside><main id="main"><div style="height:600px">차시 소개</div>
      <div class="day-period" id="part-one"><h2>Part 1</h2><div id="course-start" style="min-height:200px">과정 안내</div>${sections(1,12)}</div>
      <div class="day-period" id="part-two"><h2>Part 2</h2>${sections(13,24)}</div><section id="extra-workshop" style="min-height:600px"><h2>추가 자율 실습</h2></section><div style="height:1000px"></div>
      </main></div><script>${navigationScript}</script></body></html>`}));
  await page.goto(`http://reading-position.test/workbook/lessons/02/${hash}`);
  return {page, errors, number};
}

async function scrollInsideReadingSection(page, id, offset = 160) {
  return page.locator(`#${id}`).evaluate((element, delta) => {
    const requested = Math.round(element.getBoundingClientRect().top + scrollY + delta);
    window.scrollTo(0, requested);
    return requested;
  }, offset);
}

async function assertReadingTarget(page, id) {
  await page.waitForFunction(expected => {
    const active = [...document.querySelectorAll('.review-toc a[aria-current="location"]')];
    return active.length === 1 && active[0].hash === `#${expected}`;
  }, id);
  assert.equal(await page.locator('.review-toc a[aria-current="location"]').count(), 1);
}

test('목차 번호는 실제 본문 번호와 일치하며 Part·추가 실습에는 자식 번호를 붙이지 않는다', async () => {
  const {page, errors, number} = await readingPositionFixture();
  try {
    for (const index of [1,2,13,24]) {
      const badge = page.locator(`.review-toc a[href="#section-${index}"] [data-toc-number]`);
      await page.waitForFunction(({id, value}) => document.querySelector(`.review-toc a[href="#${id}"] [data-toc-number]`)?.textContent.trim() === value, {id:`section-${index}`,value:number(index)});
      assert.equal(await badge.textContent(), number(index));
      assert.equal(await badge.getAttribute('hidden'), null);
    }
    for (const id of ['part-one','part-two','course-start','extra-workshop']) {
      const badge = page.locator(`.review-toc a[href="#${id}"] [data-toc-number]`);
      assert.equal((await badge.textContent()).trim(), '', `${id}는 별도 번호 없는 탐색 항목`);
      assert.notEqual(await badge.getAttribute('hidden'), null);
    }
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('현재 위치는 긴 섹션의 중간·역방향 스크롤·빠른 건너뛰기에서도 실제 읽는 섹션을 유지한다', async () => {
  const {page, errors} = await readingPositionFixture();
  try {
    for (const [id, offset] of [['section-1',160],['section-2',1300],['section-2',1900],['section-18',160],['section-2',900],['section-1',160]]) {
      const requested = await scrollInsideReadingSection(page,id,offset);
      await assertReadingTarget(page,id);
      assert(Math.abs(await page.evaluate(() => scrollY) - requested) < 2, '목차 자동 노출이 본문 위치를 움직이지 않음');
    }
    assert.match(await page.locator('[data-toc-reading-label]').textContent(), /01.*단계 1/);
    await page.locator('#extra-workshop').evaluate(element => element.scrollIntoView());
    await assertReadingTarget(page,'extra-workshop');
    await page.evaluate(() => scrollTo(0,0));
    await page.waitForFunction(() => !document.querySelector('.review-toc a[aria-current="location"]'));
    assert.match(await page.locator('[data-toc-reading-label]').textContent(), /차시 시작/);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('현재 목차는 닫힌 Part를 열고 사이드바 안에 표시되며 본문 초점을 빼앗지 않는다', async () => {
  const {page, errors} = await readingPositionFixture(1024);
  try {
    await page.locator('[data-toc-period="part-two"]').evaluate(element => element.open = false);
    await page.locator('#focus-sentinel').focus();
    const requested = await scrollInsideReadingSection(page,'section-23');
    await assertReadingTarget(page,'section-23');
    await page.waitForFunction(() => {
      const side = document.querySelector('.review-sidebar').getBoundingClientRect();
      const link = document.querySelector('.review-toc a[aria-current="location"]').getBoundingClientRect();
      return link.top >= side.top && link.bottom <= side.bottom;
    });
    assert.notEqual(await page.locator('[data-toc-period="part-two"]').getAttribute('open'),null);
    assert.equal(await page.evaluate(() => document.activeElement.id),'focus-sentinel');
    assert(Math.abs(await page.evaluate(() => scrollY) - requested) < 2);
    const active = page.locator('.review-toc a[aria-current="location"]');
    for (const hover of [false,true]) {
      if (hover) await active.hover();
      const colors = await active.evaluate(element => ({foreground:getComputedStyle(element).color,background:getComputedStyle(element).backgroundColor}));
      assert(contrastRatio(colors.foreground,colors.background) >= 4.5, '현재 위치 표시의 기본·호버 텍스트 대비');
    }
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('해시 직접 진입·새로고침·목차 접기 뒤 다시 열기에서도 현재 섹션을 복원한다', async () => {
  const {page, errors} = await readingPositionFixture(1440,{hash:'#section-14'});
  try {
    await assertReadingTarget(page,'section-14');
    await page.reload();
    await assertReadingTarget(page,'section-14');
    await page.evaluate(() => location.hash = 'section-2');
    await assertReadingTarget(page,'section-2');
    await page.locator('[data-toc-collapse]').click();
    await scrollInsideReadingSection(page,'section-22');
    await assertReadingTarget(page,'section-22');
    await page.locator('[data-toc-open]').click();
    await assertReadingTarget(page,'section-22');
    assert(await page.locator('.review-sidebar').isVisible());
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('번호 목차의 모바일 클릭은 정확한 섹션으로 이동하고 기존 아코디언 자동 접힘을 유지한다', async () => {
  for (const width of [390,320]) {
    const {page, errors} = await readingPositionFixture(width);
    try {
      await page.locator('.review-sidebar-disclosure > summary').click();
      const link = page.locator('.review-toc a[href="#section-2"]');
      await link.click();
      await assertReadingTarget(page,'section-2');
      assert.equal(await page.locator('.review-sidebar-disclosure').getAttribute('open'),null);
      const gap = await page.locator('#section-2').evaluate(element => element.getBoundingClientRect().top - document.querySelector('.review-header').getBoundingClientRect().bottom);
      assert(gap >= 12, `${width}px 번호 목차 클릭 뒤 제목 여백`);
      assert.equal(await page.evaluate(() => Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth),0);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
});

async function coldHashFixture(hash, {mobile = false} = {}) {
  // Each visit has an empty font cache and uses a real URL fragment, not a test-side scroll repair.
  const context = await browser.newContext({viewport: {width: mobile ? 390 : 1440, height: 900}, hasTouch: mobile, isMobile: mobile});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let releaseFont;
  const fontGate = new Promise(resolve => { releaseFont = resolve; });
  const font = fs.readFileSync(new URL('../../node_modules/@fontsource-variable/noto-sans-kr/files/noto-sans-kr-latin-wght-normal.woff2', import.meta.url));
  await page.route('http://cold-navigation.test/delayed.woff2', async route => {
    await fontGate;
    await route.fulfill({contentType: 'font/woff2', body: font});
  });
  const sections = Array.from({length: 13}, (_, index) => ({number: String(index + 1).padStart(2, '0'), id: index === 4 ? 'l02-architecture' : index === 11 ? 'l02-run' : `cold-section-${index + 1}`}));
  const control = name => layout.match(new RegExp(`<button\\b[^>]*data-toc-${name}[^>]*>[\\s\\S]*?<\\/button>`))?.[0];
  await page.route('http://cold-navigation.test/workbook/lessons/02/**', route => route.fulfill({contentType: 'text/html', body: `<!doctype html><html lang="ko" data-course-id="daejeon-2026"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    :root{--paper:#f8f9fa;--paper-deep:#f1f5f9;--surface:#fff;--ink:#0f172a;--muted:#475569;--line:#e2e8f0;--line-dark:#cbd5e1;--accent:#1d4ed8;--accent-dark:#1e3a8a}
    @font-face{font-family:DelayedWorkbook;src:url('/delayed.woff2') format('woff2');font-display:swap}
    html{scroll-padding-top:5rem;overflow-anchor:none}*{box-sizing:border-box;transition:none!important}body{margin:0;font:16px DelayedWorkbook,sans-serif}
    ${reviewCss}${navigationCss}
    html{scroll-behavior:auto!important}.review-section{min-height:1000px;padding:20px 0}.review-section-heading{display:flex;gap:12px}#late-introduction{height:600px}
  </style><script>window.paddingBeforeBody = getComputedStyle(document.documentElement).scrollPaddingTop;</script></head><body class="review-page">
    <header class="review-header"><a class="review-brand" href="#main">AI LECTURE <span>ARCHITECTURE DESIGN</span></a><nav><a href="#main">홈</a>${control('open')}</nav></header>
    <div class="review-shell review-shell--toc"><aside class="review-sidebar" id="review-sidebar">${control('collapse')}
      <div class="review-reading-position" data-toc-reading hidden><span>현재 위치</span><strong data-toc-reading-label>차시 시작</strong></div>
      <details class="review-sidebar-disclosure"><summary>목차</summary><div class="review-sidebar-content"><nav id="review-current-panel" class="review-toc"><details open><summary>제2차시 목차</summary><ol>
      ${sections.map(({id, number}) => `<li><a href="#${id}"><span data-toc-number hidden></span><span data-toc-label>실습 ${number}</span><span data-toc-active-label hidden>현재</span></a></li>`).join('')}
      </ol></details></nav></div></details></aside><main id="main"><div id="late-introduction">AI WORKBOOK</div>
      ${sections.map(({id, number}) => `<section class="review-section" id="${id}"><header class="review-section-heading"><span class="review-number">${number}</span><div><h2>실습 ${number} · Architecture and workflow</h2></div></header><p>Learning content</p></section>`).join('')}<div style="height:1000px"></div>
    </main></div><script>${navigationScript}</script><script>
      // Font swap can expand preceding content after the browser's initial fragment scroll.
      document.fonts.ready.then(() => setTimeout(() => {
        document.getElementById('late-introduction').style.height = '684px';
        document.documentElement.dataset.fontLayoutSettled = 'true';
      }, 80));
    </script></body></html>`}));
  await page.goto(`http://cold-navigation.test/workbook/lessons/02/${hash}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.fonts.status === 'loading');
  const finishFont = async () => {
    releaseFont();
    await page.waitForFunction(() => document.documentElement.dataset.fontLayoutSettled === 'true');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  return {page, context, errors, finishFont, releaseFont};
}

test('콜드 URL의 05·12 해시는 첫 파싱과 늦은 웹폰트·상단 확장 뒤에도 새로고침 없이 정확히 선택된다', async () => {
  for (const [id, number] of [['l02-architecture', '05'], ['l02-run', '12']]) {
    const {page, context, errors, finishFont, releaseFont} = await coldHashFixture(`#${id}`);
    try {
      assert.equal(await page.evaluate(() => window.paddingBeforeBody), '0px', '본문 파싱 전에도 전역 앵커 여백을 중복 적용하지 않음');
      await finishFont();
      await assertReadingTarget(page, id);
      assert.equal((await page.locator('.review-toc a[aria-current="location"] [data-toc-number]').textContent()).trim(), number);
      const gap = await page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top - document.querySelector('.review-header').getBoundingClientRect().bottom);
      assert(gap >= 12 && gap <= 40, `${id}: 폰트 정착 뒤 헤더와 섹션 사이 여백 ${gap}px`);
      assert.equal(new URL(page.url()).hash, `#${id}`);
      assert.deepEqual(errors, []);
    } finally { releaseFont(); await context.close(); }
  }
});

test('콜드 해시 이후 wheel·키보드·touch 조작은 초기 정렬을 해제하고 늦은 레이아웃 변화가 독서를 되돌리지 않는다', async () => {
  for (const intent of ['wheel', 'keyboard', 'touch']) {
    const {page, context, errors, finishFont, releaseFont} = await coldHashFixture('#l02-architecture', {mobile: intent === 'touch'});
    try {
      await assertReadingTarget(page, 'l02-architecture');
      const initialScroll = await page.evaluate(() => scrollY);
      if (intent === 'wheel') {
        await page.mouse.move(1200, 600);
        await page.mouse.wheel(0, 1400);
      } else if (intent === 'keyboard') {
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
      } else {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 300, y: 750}]});
        for (const y of [650, 550, 450, 350, 250, 150]) {
          await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: 300, y}]});
        }
        await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
        await cdp.detach();
      }
      await page.waitForFunction(start => scrollY > start + 300, initialScroll);
      // Wait for browser key/touch scrolling to stop; do not change the document's scroll position.
      await page.evaluate(() => new Promise(resolve => {
        let previous = scrollY;
        let stable = 0;
        const check = () => { stable = Math.abs(scrollY - previous) < 0.1 ? stable + 1 : 0; previous = scrollY; if (stable >= 12) resolve(); else requestAnimationFrame(check); };
        requestAnimationFrame(check);
      }));
      const userScroll = await page.evaluate(() => scrollY);
      await finishFont();
      assert(Math.abs(await page.evaluate(() => scrollY) - userScroll) < 2, `${intent}: 늦은 폰트·콘텐츠 확장이 사용자가 선택한 독서 위치를 초기 해시로 되돌리지 않음`);
      const expected = await page.evaluate(() => {
        const headerBottom = document.querySelector('.review-header').getBoundingClientRect().bottom;
        return [...document.querySelectorAll('main .review-section')].filter(element => element.getBoundingClientRect().top <= Math.max(headerBottom + 16, parseFloat(getComputedStyle(element).scrollMarginTop)) + 1).at(-1)?.id;
      });
      assert(expected, `${intent}: 독서 중인 섹션이 있어야 함`);
      await assertReadingTarget(page, expected);
      assert.deepEqual(errors, []);
    } finally { releaseFont(); await context.close(); }
  }
});
