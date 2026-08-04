import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));
const studentBase = args.student ?? 'http://127.0.0.1:4311';
const instructorBase = args.instructor ?? 'http://127.0.0.1:4312';
const hubBase = args.hub ?? 'http://127.0.0.1:4310';
const reviewRoot = args.output ?? path.join(tmpdir(), `ai-architecture-lecture-ui-review-${Date.now()}`);
const screenshotsRoot = path.join(reviewRoot, 'slides');
const viewports = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const contents = [
  { id: 'lecture-start', path: '/presentation/lecture-start/' },
  { id: 'instructor-introduction', path: '/presentation/instructor-introduction/' },
  { id: 'course-overview', path: '/presentation/course-overview/' },
  ...['01', '02', '03', '04'].map((id) => ({ id: `lesson-${id}`, path: `/presentation/lessons/${id}/` })),
];
const lessonOneContentKeys = [
  'lesson-01/tools-overview',
  'lesson-01/practice-tools',
  'lesson-01/use-case-examples',
  'lesson-01/safety-terms',
  'lesson-01/source-inference-assumption-proposal',
  'lesson-01/response-analysis',
  'lesson-01/follow-up-actions',
];

await mkdir(screenshotsRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const result = {
  generatedAt: new Date().toISOString(),
  studentBase,
  instructorBase,
  hubBase,
  reviewRoot,
  slides: [],
  interaction: {},
  ebook: {},
  quickEdit: {},
  instructorIntroduction: {},
  lectureStart: {},
  lectureHub: {},
  progressTiming: {},
  manifests: {},
  errors: [],
};

const measureSlide = (page) => page.evaluate(() => {
  const slide = document.querySelector('[data-deck-slide]');
  const body = slide?.querySelector('.lecture-slide__body, .lecture-slide__title-card, .instructor-introduction');
  const visibleText = slide?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const viewportOverflow = document.documentElement.scrollWidth > window.innerWidth + 1
    || document.documentElement.scrollHeight > window.innerHeight + 1;
  const slideOverflow = Boolean(slide && (
    slide.scrollWidth > slide.clientWidth + 1 || slide.scrollHeight > slide.clientHeight + 1
  ));
  const bodyOverflow = Boolean(body && (
    body.scrollWidth > body.clientWidth + 1 || body.scrollHeight > body.clientHeight + 1
  ));
  const viewportRect = document.querySelector('[data-deck-viewport]')?.getBoundingClientRect();
  const escaped = [...(slide?.querySelectorAll('*') ?? [])].filter((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || !viewportRect) return false;
    return rect.left < viewportRect.left - 1 || rect.right > viewportRect.right + 1
      || rect.top < viewportRect.top - 1 || rect.bottom > viewportRect.bottom + 1;
  }).slice(0, 8).map((element) => `${element.tagName.toLowerCase()}.${element.className || ''}`);
  return {
    id: slide?.getAttribute('data-slide-id') ?? '',
    visibleText,
    viewportOverflow,
    slideOverflow,
    bodyOverflow,
    escaped,
  };
});

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    result.manifests[viewport.name] = {};
    for (const content of contents) {
      const response = await page.goto(`${instructorBase}${content.path}`, { waitUntil: 'networkidle' });
      if (!response?.ok()) throw new Error(`${content.path} HTTP ${response?.status() ?? 'no response'}`);
      await page.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor();
      const deckManifest = await page.evaluate(() => {
        const root = document.querySelector('[data-lecture-deck]');
        const controller = root?.lectureDeck;
        return {
          source: root?.dataset.deckManifestSource ?? '',
          buildId: controller?.buildId ?? '',
          deckId: controller?.deckId ?? '',
          ids: (controller?.slides ?? []).map((slide) => slide.id),
          contentKeys: [...new Set((controller?.slides ?? []).flatMap((slide) => {
            const node = slide.node;
            if (!node) return [];
            return [node, ...node.querySelectorAll('[data-content-key]')]
              .map((element) => element.getAttribute('data-content-key'))
              .filter(Boolean);
          }))].sort(),
          hasLegacyClaudeLabel: /Claude\s+Artifacts?/.test((controller?.slides ?? []).map((slide) => slide.node?.textContent ?? '').join(' ')),
        };
      });
      result.manifests[viewport.name][content.id] = deckManifest;
      const slideCount = deckManifest.ids.length;
      if (deckManifest.source !== 'build' || deckManifest.deckId !== content.id) {
        result.errors.push({ type: 'slide-manifest-source', viewport: viewport.name, content: content.id, ...deckManifest });
      }
      const targetDir = path.join(screenshotsRoot, viewport.name, content.id);
      await mkdir(targetDir, { recursive: true });
      for (let index = 0; index < slideCount; index += 1) {
        await page.evaluate((slideIndex) => {
          const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
          deck?.render(slideIndex, { broadcast: false, persist: false });
        }, index);
        await page.evaluate(() => document.fonts?.ready);
        const measured = await measureSlide(page);
        const file = path.join(targetDir, `${String(index + 1).padStart(3, '0')}.jpg`);
        await page.screenshot({ path: file, type: 'jpeg', quality: 68 });
        const record = { viewport: viewport.name, content: content.id, index: index + 1, slideCount, file, ...measured };
        result.slides.push(record);
        if (!measured.visibleText || measured.viewportOverflow || measured.slideOverflow || measured.bodyOverflow) {
          result.errors.push({ type: 'slide-layout', ...record });
        }
      }
    }
    await context.close();
  }

  for (const content of contents) {
    const reference = result.manifests['1280x720'][content.id];
    const large = result.manifests['1920x1080'][content.id];
    if (JSON.stringify(reference?.ids) !== JSON.stringify(large?.ids)) {
      result.errors.push({ type: 'slide-manifest-viewport-mismatch', content: content.id, reference, large });
    }
  }
  for (const viewport of viewports) {
    const lessonOneManifest = result.manifests[viewport.name]['lesson-01'];
    const missingContentKeys = lessonOneContentKeys.filter((key) => !lessonOneManifest?.contentKeys?.includes(key));
    if (missingContentKeys.length || lessonOneManifest?.hasLegacyClaudeLabel) {
      result.errors.push({
        type: 'lesson-01-content-alignment',
        viewport: viewport.name,
        missingContentKeys,
        hasLegacyClaudeLabel: lessonOneManifest?.hasLegacyClaudeLabel ?? false,
      });
    }
  }

  const interactionContext = await browser.newContext({ viewport: viewports[0] });
  const hubPage = await interactionContext.newPage();
  await hubPage.goto(`${hubBase}/`, { waitUntil: 'networkidle' });
  await hubPage.evaluate(() => {
    window.__lectureOpened = [];
    window.open = (url, target) => {
      window.__lectureOpened.push({ url: String(url), target: String(target) });
      return null;
    };
  });
  await hubPage.locator('[data-open-lecture-start]').click();
  result.lectureHub = await hubPage.evaluate(() => ({
    launchButtons: document.querySelectorAll('[data-open-lecture-start]').length,
    oldIntroductionButtons: document.querySelectorAll('[data-open-introduction]').length,
    oldOverviewButtons: document.querySelectorAll('[data-open-overview]').length,
    studentOverviewLinks: document.querySelectorAll('#student-course-overview').length,
    opened: window.__lectureOpened,
  }));
  if (result.lectureHub.launchButtons !== 1
    || result.lectureHub.oldIntroductionButtons !== 0
    || result.lectureHub.oldOverviewButtons !== 0
    || result.lectureHub.studentOverviewLinks !== 1
    || result.lectureHub.opened.length !== 2
    || !result.lectureHub.opened.some((item) => item.url.endsWith('/instructor-console/lecture-start/'))
    || !result.lectureHub.opened.some((item) => item.url.endsWith('/presentation/lecture-start/'))) {
    result.errors.push({ type: 'lecture-hub', detail: result.lectureHub });
  }
  await hubPage.close();

  const interactionPage = await interactionContext.newPage();
  await interactionPage.goto(`${instructorBase}/presentation/lessons/01/`, { waitUntil: 'networkidle' });
  await interactionPage.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor();
  const readPosition = () => interactionPage.locator('[data-deck-number]').textContent();
  await interactionPage.keyboard.press('Home');
  const home = await readPosition();
  await interactionPage.keyboard.press('ArrowRight');
  const right = await readPosition();
  await interactionPage.keyboard.press('ArrowLeft');
  const left = await readPosition();
  await interactionPage.keyboard.press('Space');
  const space = await readPosition();
  await interactionPage.keyboard.press('End');
  const end = await readPosition();
  const total = await interactionPage.locator('[data-deck-total]').textContent();
  await interactionPage.keyboard.press('ArrowRight');
  const blockedAtEnd = await readPosition();
  await interactionPage.keyboard.press('Escape');
  const overviewOpen = await interactionPage.locator('[data-deck-overview]').isVisible();
  await interactionPage.locator('[data-deck-overview-list] button').nth(1).click();
  const overviewSelect = await readPosition();
  await interactionPage.reload({ waitUntil: 'networkidle' });
  const restored = await readPosition();
  result.interaction = { home, right, left, space, end, total, blockedAtEnd, overviewOpen, overviewSelect, restored };
  if (!(home === '1' && right === '2' && left === '1' && space === '2' && end === total && blockedAtEnd === total && overviewOpen && overviewSelect === '2' && restored === '2')) {
    result.errors.push({ type: 'keyboard-or-session', ...result.interaction });
  }
  await interactionContext.close();

  const ebookContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const ebookPage = await ebookContext.newPage();
  await ebookPage.goto(`${studentBase}/lessons/01/`, { waitUntil: 'networkidle' });
  await ebookPage.locator('[data-sidebar-collapse]').click();
  const collapsed = await ebookPage.evaluate(() => ({
    state: document.documentElement.dataset.sidebarState,
    stored: localStorage.getItem('ai-architecture-ebook-sidebar-v1'),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    contentKeys: [...document.querySelectorAll('[data-content-key]')].map((element) => element.getAttribute('data-content-key')).filter(Boolean).sort(),
    hasLegacyClaudeLabel: /Claude\s+Artifacts?/.test(document.body.textContent ?? ''),
  }));
  await ebookPage.reload({ waitUntil: 'networkidle' });
  const persisted = await ebookPage.evaluate(() => document.documentElement.dataset.sidebarState);
  await ebookPage.locator('[data-sidebar-expand]').click();
  const expanded = await ebookPage.evaluate(() => document.documentElement.dataset.sidebarState);
  result.ebook.desktop = { collapsed, persisted, expanded };
  await ebookContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${studentBase}/lessons/01/`, { waitUntil: 'networkidle' });
  const scrollBefore = await mobilePage.evaluate(() => scrollY);
  await mobilePage.locator('[data-menu-open]').click();
  const opened = await mobilePage.evaluate(() => ({
    open: document.querySelector('[data-mobile-menu]')?.open,
    expanded: document.querySelector('[data-menu-open]')?.getAttribute('aria-expanded'),
    lock: document.documentElement.dataset.mobileMenuOpen,
  }));
  await mobilePage.keyboard.press('Escape');
  const escaped = await mobilePage.evaluate(() => ({ open: document.querySelector('[data-mobile-menu]')?.open, focus: document.activeElement?.hasAttribute('data-menu-open') }));
  await mobilePage.locator('[data-menu-open]').click();
  await mobilePage.mouse.click(385, 840);
  const outsideClosed = await mobilePage.evaluate(() => !document.querySelector('[data-mobile-menu]')?.open);
  await mobilePage.locator('[data-menu-open]').click();
  await mobilePage.locator('[data-mobile-menu] a').first().click();
  await mobilePage.waitForLoadState('networkidle');
  const linkClosed = await mobilePage.evaluate(() => !document.querySelector('[data-mobile-menu]')?.open);
  const mobileLayout = await mobilePage.evaluate((before) => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    scrollRestored: scrollY === before,
  }), scrollBefore);
  result.ebook.mobile = { opened, escaped, outsideClosed, linkClosed, mobileLayout };
  const missingEbookContentKeys = lessonOneContentKeys.filter((key) => !collapsed.contentKeys.includes(key));
  if (collapsed.state !== 'collapsed' || collapsed.stored !== 'collapsed' || collapsed.overflow || collapsed.hasLegacyClaudeLabel || missingEbookContentKeys.length || persisted !== 'collapsed' || expanded !== 'expanded'
    || !opened.open || opened.expanded !== 'true' || opened.lock !== 'true' || escaped.open || !escaped.focus || !outsideClosed || !linkClosed || mobileLayout.overflow) {
    result.errors.push({ type: 'ebook-navigation', ebook: result.ebook, missingEbookContentKeys });
  }
  await mobileContext.close();

  const editContext = await browser.newContext({ acceptDownloads: true });
  const consolePage = await editContext.newPage();
  const projectorPage = await editContext.newPage();
  await consolePage.setViewportSize({ width: 1920, height: 1080 });
  await projectorPage.setViewportSize({ width: 1280, height: 720 });
  await Promise.all([
    projectorPage.goto(`${instructorBase}/presentation/lessons/01/`, { waitUntil: 'networkidle' }),
    consolePage.goto(`${instructorBase}/instructor-console/lessons/01/`, { waitUntil: 'networkidle' }),
  ]);
  await consolePage.locator('[data-edit-target] option').first().waitFor({ state: 'attached' });
  const crossViewportSync = await consolePage.evaluate(() => {
    const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
    const slides = deck?.slides ?? [];
    const targetIndex = Math.max(1, slides.length - 4);
    if (targetIndex >= 0) deck.render(targetIndex);
    return {
      targetIndex,
      buildId: deck?.buildId ?? '',
      deckId: deck?.deckId ?? '',
      consoleSlideId: slides[targetIndex]?.id ?? '',
      consoleSlideHtml: slides[targetIndex]?.node?.outerHTML ?? '',
      nextSlideId: slides[targetIndex + 1]?.id ?? '',
      nextSlideHtml: slides[targetIndex + 1]?.node?.outerHTML ?? '',
      consoleNextPreviewId: document.querySelector('[data-console-next-slide]')?.getAttribute('data-slide-id') ?? '',
      consoleNextPreviewHtml: document.querySelector('[data-console-next-slide]')?.firstElementChild?.outerHTML ?? '',
    };
  });
  await projectorPage.waitForTimeout(350);
  Object.assign(crossViewportSync, await projectorPage.evaluate(() => ({
    projectorSlideId: document.querySelector('[data-deck-slide]')?.getAttribute('data-slide-id') ?? '',
    projectorSlideHtml: document.querySelector('[data-deck-slide]')?.firstElementChild?.outerHTML ?? '',
  })));
  await consolePage.evaluate(() => document.querySelector('[data-lecture-deck]')?.lectureDeck?.move(1));
  await projectorPage.waitForTimeout(350);
  Object.assign(crossViewportSync, await projectorPage.evaluate(() => ({
    projectorNextSlideId: document.querySelector('[data-deck-slide]')?.getAttribute('data-slide-id') ?? '',
    projectorNextSlideHtml: document.querySelector('[data-deck-slide]')?.firstElementChild?.outerHTML ?? '',
  })));
  crossViewportSync.currentHtmlMatch = crossViewportSync.consoleSlideHtml === crossViewportSync.projectorSlideHtml;
  crossViewportSync.nextHtmlMatch = crossViewportSync.nextSlideHtml === crossViewportSync.projectorNextSlideHtml;
  crossViewportSync.nextPreviewHtmlMatch = crossViewportSync.nextSlideHtml === crossViewportSync.consoleNextPreviewHtml;
  delete crossViewportSync.consoleSlideHtml;
  delete crossViewportSync.projectorSlideHtml;
  delete crossViewportSync.nextSlideHtml;
  delete crossViewportSync.consoleNextPreviewHtml;
  delete crossViewportSync.projectorNextSlideHtml;
  await consolePage.evaluate(() => document.querySelector('[data-lecture-deck]')?.lectureDeck?.render(0));
  await projectorPage.waitForTimeout(200);
  const editKey = await consolePage.locator('[data-edit-target]').inputValue();
  const injectionText = '<img src=x onerror="window.__lectureInjected=true"><script>window.__lectureInjected=true</script>';
  await consolePage.locator('[data-edit-value]').fill(injectionText);
  await consolePage.locator('[data-edit-action="save"]').click();
  await projectorPage.waitForTimeout(300);
  const consoleLiteral = await consolePage.locator('[data-deck-slide]').getByText(injectionText, { exact: true }).count();
  const projectorLiteral = await projectorPage.locator('[data-deck-slide]').getByText(injectionText, { exact: true }).count();
  const notExecuted = await Promise.all([consolePage, projectorPage].map((page) => page.evaluate(() => !window.__lectureInjected)));
  await projectorPage.reload({ waitUntil: 'networkidle' });
  const persistedLiteral = await projectorPage.locator('[data-deck-slide]').getByText(injectionText, { exact: true }).count();
  const downloadPromise = consolePage.waitForEvent('download');
  await consolePage.locator('[data-edit-action="export"]').click();
  const download = await downloadPromise;
  const exportPath = path.join(reviewRoot, 'local-edits-export.json');
  await download.saveAs(exportPath);
  const exportPayload = JSON.parse(await readFile(exportPath, 'utf8'));
  await consolePage.locator('[data-edit-action="restore"]').click();
  await projectorPage.waitForTimeout(250);
  const restoredLiteral = await projectorPage.locator('[data-deck-slide]').getByText(injectionText, { exact: true }).count();
  const storageAfterRestore = await consolePage.evaluate(() => localStorage.getItem('ai-architecture-slide-overrides-v1'));
  result.quickEdit = {
    editKey,
    consoleLiteral,
    projectorLiteral,
    notExecuted,
    persistedLiteral,
    restoredLiteral,
    storageAfterRestore,
    exportedSchemaVersion: exportPayload.schemaVersion,
    exportedBuildId: exportPayload.buildId,
    exportedChanges: exportPayload.changes?.length,
    crossViewportSync,
  };
  if (!editKey || consoleLiteral !== 1 || projectorLiteral !== 1 || notExecuted.some((value) => !value)
    || persistedLiteral !== 1 || restoredLiteral !== 0 || exportPayload.schemaVersion !== 1 || exportPayload.changes?.length !== 1
    || crossViewportSync.targetIndex < 0
    || crossViewportSync.consoleSlideId !== crossViewportSync.projectorSlideId
    || !crossViewportSync.currentHtmlMatch
    || crossViewportSync.nextSlideId !== crossViewportSync.projectorNextSlideId
    || crossViewportSync.nextSlideId !== crossViewportSync.consoleNextPreviewId
    || !crossViewportSync.nextHtmlMatch
    || !crossViewportSync.nextPreviewHtmlMatch) {
    result.errors.push({ type: 'quick-edit', ...result.quickEdit });
  }

  const introConsole = await editContext.newPage();
  const introProjector = await editContext.newPage();
  await introConsole.setViewportSize({ width: 1920, height: 1080 });
  await introProjector.setViewportSize({ width: 1280, height: 720 });
  await Promise.all([
    introConsole.goto(`${instructorBase}/instructor-console/instructor-introduction/`, { waitUntil: 'networkidle' }),
    introProjector.goto(`${instructorBase}/presentation/instructor-introduction/`, { waitUntil: 'networkidle' }),
  ]);
  await Promise.all([
    introConsole.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor(),
    introProjector.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor(),
  ]);
  result.instructorIntroduction = await Promise.all([introConsole, introProjector].map((page) => page.evaluate(() => {
    const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
    const slide = document.querySelector('[data-deck-slide]');
    const images = [...document.querySelectorAll('[data-deck-slide] img')];
    const portrait = document.querySelector('.instructor-introduction__portrait');
    return {
      ids: deck?.slides?.map((item) => item.id) ?? [],
      html: slide?.firstElementChild?.outerHTML ?? '',
      images: images.map((image) => ({ complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })),
      summary: slide?.querySelector('.instructor-introduction__summary')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      careerYears: [...(slide?.querySelectorAll('.instructor-introduction__career h3') ?? [])].map((item) => item.textContent?.trim() ?? ''),
      careerItems: [...(slide?.querySelectorAll('.instructor-introduction__career li') ?? [])].map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
      oldProjectCards: slide?.querySelectorAll('.instructor-introduction__projects').length ?? 0,
      oldKeywords: slide?.querySelectorAll('.instructor-introduction__keywords').length ?? 0,
      portraitFit: portrait ? getComputedStyle(portrait).objectFit : '',
      viewportOverflow: document.documentElement.scrollWidth > innerWidth + 1 || document.documentElement.scrollHeight > innerHeight + 1,
      slideOverflow: Boolean(slide && (slide.scrollWidth > slide.clientWidth + 1 || slide.scrollHeight > slide.clientHeight + 1)),
    };
  })));
  const [introConsoleResult, introProjectorResult] = result.instructorIntroduction;
  const expectedCareerYears = ['2026', '2025', '2024', '2022', '2021'];
  const expectedCareerItems = [
    '<힐꼼의 이중생활> 애니메이션 제작 총괄',
    '홍천 BB(Bambeol Brew & Bloom) 페스타, 미디어아트 ‘낙화’ 제작 총괄',
    '광주 국제 아트페어 미디어아트 스크리닝 전시',
    '광주 <추억의 충장축제> 홍보영상 제작',
    '<도시의 빛과 그림자> 미디어월 콘텐츠 제작 총괄',
    '<몽글몽글극장> 애니메이션 제작 총괄 감독',
    '서천군립무용단 <소리花> 융복합 콘텐츠 제작',
    '제4회 국제 디지털아트 트리엔날 <공생> 참여 작가',
    '예루살렘 비엔날레 <봄(Spring)> 참여 작가 · S&KOMUST',
    '광주 동구 <미로메타아트> 프로젝트 기술 감독',
    '광주 남구청사 미디어파사드 <빛의 선물> 제작 참여',
    '문화의 달(홍성) 융복합 공연 3D VFX 제작 참여',
    '그린발레단 <어린왕자> 융복합 공연 콘텐츠 제작',
    '광주 비엔날레 미디어파사드 3D VFX 제작 참여',
  ];
  if (JSON.stringify(introConsoleResult.ids) !== JSON.stringify(['instructor-introduction'])
    || JSON.stringify(introConsoleResult.ids) !== JSON.stringify(introProjectorResult.ids)
    || introConsoleResult.html !== introProjectorResult.html
    || introConsoleResult.summary !== '생성형 AI, 3D·VFX, 모션그래픽과 프로젝션 기술을 기반으로 공간·이미지·영상 콘텐츠를 기획하고 제작하고 있습니다.'
    || JSON.stringify(introConsoleResult.careerYears) !== JSON.stringify(expectedCareerYears)
    || JSON.stringify(introConsoleResult.careerItems) !== JSON.stringify(expectedCareerItems)
    || JSON.stringify(introConsoleResult.careerItems) !== JSON.stringify(introProjectorResult.careerItems)
    || introConsoleResult.oldProjectCards !== 0 || introProjectorResult.oldProjectCards !== 0
    || introConsoleResult.oldKeywords !== 0 || introProjectorResult.oldKeywords !== 0
    || introConsoleResult.portraitFit !== 'cover' || introProjectorResult.portraitFit !== 'cover'
    || [...introConsoleResult.images, ...introProjectorResult.images].some((item) => !item.complete || item.width < 1 || item.height < 1)
    || introConsoleResult.viewportOverflow || introConsoleResult.slideOverflow
    || introProjectorResult.viewportOverflow || introProjectorResult.slideOverflow) {
    result.errors.push({ type: 'instructor-introduction', detail: result.instructorIntroduction });
  }

  const startConsole = await editContext.newPage();
  const startProjector = await editContext.newPage();
  await startConsole.setViewportSize({ width: 1920, height: 1080 });
  await startProjector.setViewportSize({ width: 1280, height: 720 });
  await Promise.all([
    startConsole.goto(`${instructorBase}/instructor-console/lecture-start/`, { waitUntil: 'networkidle' }),
    startProjector.goto(`${instructorBase}/presentation/lecture-start/`, { waitUntil: 'networkidle' }),
  ]);
  await Promise.all([
    startConsole.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor(),
    startProjector.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor(),
  ]);
  const readLectureStart = (page) => page.evaluate(() => {
    const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
    const activeIndex = deck?.getActiveIndex?.() ?? -1;
    return {
      deckId: deck?.deckId ?? '',
      ids: deck?.slides?.map((slide) => slide.id) ?? [],
      activeIndex,
      activeId: deck?.slides?.[activeIndex]?.id ?? '',
      currentHtml: document.querySelector('[data-deck-slide]')?.firstElementChild?.outerHTML ?? '',
      nextPreviewId: document.querySelector('[data-console-next-slide]')?.getAttribute('data-slide-id') ?? '',
      nextPreviewHtml: document.querySelector('[data-console-next-slide]')?.firstElementChild?.outerHTML ?? '',
      firstLessonHidden: document.querySelector('[data-deck-first-lesson]')?.hidden ?? true,
      firstLessonHref: document.querySelector('[data-deck-first-lesson]')?.getAttribute('href') ?? '',
    };
  });
  const initialStart = await Promise.all([readLectureStart(startConsole), readLectureStart(startProjector)]);
  await startConsole.locator('[data-deck-action="next"]').click();
  await startProjector.waitForTimeout(250);
  const afterNext = await Promise.all([readLectureStart(startConsole), readLectureStart(startProjector)]);
  await startConsole.locator('[data-deck-action="previous"]').click();
  await startProjector.waitForTimeout(250);
  const afterPrevious = await Promise.all([readLectureStart(startConsole), readLectureStart(startProjector)]);
  await startConsole.evaluate(() => {
    const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
    deck?.render((deck?.slides?.length ?? 1) - 1, { broadcast: true, persist: false });
  });
  await startProjector.waitForTimeout(250);
  const atEnd = await Promise.all([readLectureStart(startConsole), readLectureStart(startProjector)]);
  result.lectureStart = { initial: initialStart, afterNext, afterPrevious, atEnd };
  const [initialConsole, initialProjector] = initialStart;
  const [nextConsole, nextProjector] = afterNext;
  const [previousConsole, previousProjector] = afterPrevious;
  const [endConsole, endProjector] = atEnd;
  if (initialConsole.deckId !== 'lecture-start'
    || initialProjector.deckId !== 'lecture-start'
    || JSON.stringify(initialConsole.ids) !== JSON.stringify(initialProjector.ids)
    || initialConsole.ids[0] !== 'instructor-introduction'
    || initialConsole.ids[1] !== 'course-overview-title'
    || initialConsole.ids.length !== 18
    || initialConsole.activeId !== 'instructor-introduction'
    || initialProjector.activeId !== 'instructor-introduction'
    || initialConsole.currentHtml !== initialProjector.currentHtml
    || initialConsole.nextPreviewId !== 'course-overview-title'
    || !initialConsole.nextPreviewHtml
    || nextConsole.activeId !== 'course-overview-title'
    || nextProjector.activeId !== 'course-overview-title'
    || nextConsole.currentHtml !== nextProjector.currentHtml
    || previousConsole.activeId !== 'instructor-introduction'
    || previousProjector.activeId !== 'instructor-introduction'
    || previousConsole.currentHtml !== previousProjector.currentHtml
    || endConsole.firstLessonHidden
    || endProjector.firstLessonHidden
    || !endConsole.firstLessonHref.endsWith('/instructor-console/lessons/01/')
    || !endProjector.firstLessonHref.endsWith('/presentation/lessons/01/')) {
    result.errors.push({ type: 'lecture-start', detail: result.lectureStart });
  }
  await Promise.all([startConsole.close(), startProjector.close()]);

  const timingResults = [];
  for (const lesson of [{ id: '01', duration: 180, thresholds: [5, 15] }, { id: '04', duration: 360, thresholds: [10, 20] }]) {
    const timingPage = await editContext.newPage();
    await timingPage.goto(`${instructorBase}/instructor-console/lessons/${lesson.id}/`, { waitUntil: 'networkidle' });
    await timingPage.locator('[data-instructor-progress][data-progress-ready="true"]').waitFor();
    const initial = await timingPage.evaluate(() => {
      const panel = document.querySelector('[data-instructor-progress]');
      const controller = panel?.instructorProgress;
      const checkpoints = controller?.getCheckpoints?.() ?? [];
      return {
        duration: Number(panel?.dataset.durationMinutes),
        thresholds: controller?.thresholds,
        checkpointCount: checkpoints.length,
        mappedCount: checkpoints.filter((checkpoint) => checkpoint.mappedSlideId).length,
        firstMapped: checkpoints.find((checkpoint) => checkpoint.mappedSlideId) ?? null,
        startInputValue: panel?.querySelector('[data-progress-start-input]')?.value ?? '',
      };
    });
    const setStartBefore = Date.now();
    await timingPage.locator('[data-progress-action="set-start"]').click();
    const setStartState = await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.getState?.());
    const setStartAfter = Date.now();
    timingPage.once('dialog', (dialog) => dialog.accept());
    await timingPage.locator('[data-progress-action="reset"]').click();
    await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.start());
    await timingPage.waitForTimeout(1100);
    await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.pause());
    const paused = await timingPage.evaluate(() => {
      const panel = document.querySelector('[data-instructor-progress]');
      return { state: panel?.instructorProgress?.getState?.(), elapsed: panel?.instructorProgress?.elapsedMinutes?.() };
    });
    await timingPage.waitForTimeout(1100);
    const pausedLater = await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.elapsedMinutes?.());
    await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.resume());
    await timingPage.waitForTimeout(150);
    const resumed = await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.getState?.());
    if (initial.firstMapped) {
      await timingPage.evaluate((slideId) => {
        const deck = document.querySelector('[data-lecture-deck]')?.lectureDeck;
        const index = deck?.slides?.findIndex((slide) => slide.id === slideId) ?? -1;
        if (index >= 0) deck.render(index, { broadcast: false });
      }, initial.firstMapped.mappedSlideId);
      await timingPage.waitForTimeout(100);
    }
    const mappedUi = await timingPage.evaluate(() => ({
      current: document.querySelector('[data-progress-current]')?.textContent ?? '',
      target: document.querySelector('[data-progress-target]')?.textContent ?? '',
      status: document.querySelector('[data-progress-status]')?.getAttribute('data-state') ?? '',
    }));
    if (initial.firstMapped) await timingPage.locator('[data-progress-action="plus-five"]').click();
    const shiftedState = await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.getState?.());
    const progressDownloadPromise = timingPage.waitForEvent('download');
    await timingPage.locator('[data-progress-action="export"]').click();
    const progressDownload = await progressDownloadPromise;
    const progressExportPath = path.join(reviewRoot, `class-progress-${lesson.id}.json`);
    await progressDownload.saveAs(progressExportPath);
    const progressExport = JSON.parse(await readFile(progressExportPath, 'utf8'));
    const storage = await timingPage.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('ai-architecture-instructor-progress-v1')));
    timingPage.once('dialog', (dialog) => dialog.accept());
    await timingPage.locator('[data-progress-action="reset"]').click();
    const resetState = await timingPage.evaluate(() => document.querySelector('[data-instructor-progress]')?.instructorProgress?.getState?.());
    timingResults.push({ lesson, initial, setStartState, paused, pausedLater, resumed, mappedUi, shiftedState, progressExportPath, progressExport, resetState, storage });
    if (initial.duration !== lesson.duration
      || initial.thresholds?.appropriate !== lesson.thresholds[0]
      || initial.thresholds?.caution !== lesson.thresholds[1]
      || initial.checkpointCount < 1
      || initial.mappedCount < 1
      || !/^\d{2}:\d{2}$/.test(initial.startInputValue)
      || !setStartState?.startedAt
      || setStartState.startedAt < setStartBefore
      || setStartState.startedAt > setStartAfter
      || !paused.state?.startedAt || paused.state?.running || Math.abs(pausedLater - paused.elapsed) > 0.02
      || !resumed?.running || resumed.pausedAt != null
      || !mappedUi.current.includes(initial.firstMapped?.label ?? '')
      || mappedUi.status !== 'caution'
      || mappedUi.target.includes('미매핑')
      || progressExport.schemaVersion !== 1
      || progressExport.durationMinutes !== lesson.duration
      || progressExport.state?.checkpointOverrides?.[initial.firstMapped?.id] !== 5
      || resetState?.startedAt != null || resetState?.running || resetState?.completedCheckpoints?.length !== 0
      || storage.length < 1) {
      result.errors.push({ type: 'progress-timing', lesson: lesson.id, initial, setStartState, paused, pausedLater, resumed, mappedUi, shiftedState, progressExport, resetState, storage });
    }
    await timingPage.evaluate(() => {
      Object.keys(localStorage).filter((key) => key.startsWith('ai-architecture-instructor-progress-v1')).forEach((key) => localStorage.removeItem(key));
    });
    await timingPage.close();
  }
  result.progressTiming = timingResults;
  await editContext.close();
} finally {
  await browser.close();
}

const relative = (file) => path.relative(reviewRoot, file).replaceAll('\\', '/');
const cards = result.slides.map((slide) => `<article class="${result.errors.some((error) => error.type === 'slide-layout' && error.file === slide.file) ? 'error' : ''}"><img loading="lazy" src="${relative(slide.file)}" alt="${slide.viewport} ${slide.content} ${slide.index}"><p><strong>${slide.viewport} · ${slide.content} · ${slide.index}/${slide.slideCount}</strong><br>${slide.id}</p></article>`).join('\n');
await writeFile(path.join(reviewRoot, 'contact-sheet.html'), `<!doctype html><meta charset="utf-8"><title>강의 슬라이드 전수 검수</title><style>body{margin:0;padding:24px;background:#222;color:#eee;font:14px system-ui}header{position:sticky;top:0;padding:12px;background:#222;z-index:2}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}article{background:#333;padding:8px}article.error{outline:4px solid #e74c3c}img{width:100%;height:auto}p{overflow-wrap:anywhere}</style><header><h1>강의 슬라이드 전수 검수</h1><p>${result.slides.length}장 · 오류 ${result.errors.length}건</p></header><main class="grid">${cards}</main>`);
await writeFile(path.join(reviewRoot, 'report.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  reviewRoot,
  slides: result.slides.length,
  errors: result.errors.length,
  manifestCounts: Object.fromEntries(Object.entries(result.manifests).map(([viewport, records]) => [
    viewport,
    Object.fromEntries(Object.entries(records).map(([content, manifest]) => [content, manifest.ids.length])),
  ])),
  interaction: result.interaction,
  ebook: result.ebook,
  quickEdit: result.quickEdit,
  instructorIntroduction: result.instructorIntroduction,
  lectureStart: result.lectureStart,
  lectureHub: result.lectureHub,
  progressTiming: result.progressTiming,
}, null, 2));
if (result.errors.length) process.exitCode = 1;
