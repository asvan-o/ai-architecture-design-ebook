import process from 'node:process';
import { chromium } from 'playwright';

const argumentsMap = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const [key, ...value] = argument.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));
const baseUrl = (argumentsMap.base || 'http://127.0.0.1:4321').replace(/\/$/, '');
const lessonIds = ['01', '02', '03', '04'];
const desktopViewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const report = {
  baseUrl,
  lessons: [],
  copyButtons: [],
  lesson03CopyButtons: [],
  lesson03Assets: [],
  mobile: {},
  lesson03Mobile: {},
  lesson03Print: {},
  lesson04: {},
  lesson04ProgramPrompts: [],
  lesson04Mobile: {},
  runtimeErrors: [],
  errors: [],
};
const copiedTextById = new Map();
const normalizeClipboardText = (value) => value.replace(/\r\n/g, '\n');
const watchRuntimeErrors = (page, label) => {
  page.on('console', (message) => {
    if (message.type() === 'error') report.runtimeErrors.push({ label, type: 'console', message: message.text() });
  });
  page.on('pageerror', (error) => report.runtimeErrors.push({ label, type: 'pageerror', message: error.message }));
};

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of desktopViewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    watchRuntimeErrors(page, `desktop-${viewport.width}x${viewport.height}`);

    for (const lessonId of lessonIds) {
      const response = await page.goto(`${baseUrl}/lessons/${lessonId}/`, { waitUntil: 'networkidle' });
      if (!response?.ok()) throw new Error(`제${lessonId}차시 HTTP ${response?.status() ?? '응답 없음'}`);

      const state = await page.evaluate(() => {
        const sections = [...document.querySelectorAll('.lesson-content [data-lesson-section][id]')];
        const links = [...document.querySelectorAll('[data-current-lesson-toc="desktop"] [data-lesson-section-link]')];
        return {
          sectionIds: sections.map((section) => section.id),
          sectionTitles: sections.map((section) => section.getAttribute('data-section-title')),
          linkIds: links.map((link) => link.getAttribute('data-lesson-section-link')),
          linkTitles: links.map((link) => link.querySelector('span:last-child')?.textContent?.trim()),
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          visibleToc: !document.querySelector('[data-current-lesson-toc="desktop"]')?.hidden,
        };
      });
      const targetId = state.sectionIds[Math.min(6, state.sectionIds.length - 1)];
      const targetLink = page.locator(`[data-current-lesson-toc="desktop"] [data-lesson-section-link="${targetId}"]`);
      if (await targetLink.count() !== 1) throw new Error(`제${lessonId}차시 ${targetId} 목차 링크가 고유하지 않음`);
      await targetLink.click();
      await page.waitForTimeout(120);
      const navigation = await page.evaluate((sectionId) => ({
        hash: location.hash,
        active: document.querySelector(`[data-current-lesson-toc="desktop"] [data-lesson-section-link="${sectionId}"]`)?.getAttribute('aria-current'),
        targetTop: Math.round(document.getElementById(sectionId)?.getBoundingClientRect().top ?? -1),
      }), targetId);
      await page.goBack();
      await page.waitForTimeout(120);
      navigation.backHash = await page.evaluate(() => location.hash);

      const record = { viewport, lessonId, ...state, navigation };
      report.lessons.push(record);
      if (!state.visibleToc
        || state.overflow
        || state.sectionIds.length < 2
        || JSON.stringify(state.sectionIds) !== JSON.stringify(state.linkIds)
        || JSON.stringify(state.sectionTitles) !== JSON.stringify(state.linkTitles)
        || navigation.hash !== `#${targetId}`
        || navigation.active !== 'location'
        || navigation.backHash !== '') {
        report.errors.push({ type: 'desktop-toc', ...record });
      }
    }
    await context.close();
  }

  const copyContext = await browser.newContext({ viewport: desktopViewports[0] });
  await copyContext.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseUrl).origin });
  const copyPage = await copyContext.newPage();
  watchRuntimeErrors(copyPage, 'desktop-copy-and-lesson04');
  await copyPage.goto(`${baseUrl}/lessons/02/#section-07`, { waitUntil: 'networkidle' });
  await copyPage.waitForTimeout(800);
  report.hashEntry = await copyPage.evaluate(() => ({
    hash: location.hash,
    active: document.querySelector('[data-current-lesson-toc="desktop"] [data-lesson-section-link="section-07"]')?.getAttribute('aria-current'),
    targetTop: Math.round(document.getElementById('section-07')?.getBoundingClientRect().top ?? -1),
  }));
  if (report.hashEntry.hash !== '#section-07'
    || report.hashEntry.active !== 'location'
    || Math.abs(report.hashEntry.targetTop) > 200) {
    report.errors.push({ type: 'initial-hash', ...report.hashEntry });
  }
  await copyPage.goto(`${baseUrl}/lessons/02/`, { waitUntil: 'networkidle' });

  const detailSummaries = copyPage.locator('details > summary');
  const detailSummaryCount = await detailSummaries.count();
  for (let index = 0; index < detailSummaryCount; index += 1) {
    const summary = detailSummaries.nth(index);
    const isOpen = await summary.evaluate((element) => element.parentElement?.hasAttribute('open') ?? false);
    if (!isOpen && await summary.isVisible()) await summary.click();
  }

  const copyBlocks = copyPage.locator('prompt-copy-block');
  const copyBlockCount = await copyBlocks.count();
  for (let index = 0; index < copyBlockCount; index += 1) {
    const block = copyBlocks.nth(index);
    const id = await block.getAttribute('data-copy-block-id');
    const source = await block.locator('[data-copy-source]').inputValue();
    const displayedCode = block.locator('pre code');
    const displayedCount = await displayedCode.count();
    const displayed = displayedCount === 1 ? await displayedCode.textContent() : null;
    await copyPage.evaluate(() => navigator.clipboard.writeText('COPY_AUDIT_SENTINEL'));
    await block.locator('[data-copy-trigger]').click();
    const clipboard = await copyPage.evaluate(() => navigator.clipboard.readText());
    copiedTextById.set(id, normalizeClipboardText(clipboard));
    const record = {
      id,
      ready: await block.getAttribute('data-copy-ready'),
      sourceMatches: normalizeClipboardText(clipboard) === normalizeClipboardText(source),
      displayMatches: displayed === null || displayed === source,
      length: clipboard.length,
    };
    report.copyButtons.push(record);
    if (!record.id || record.ready !== 'true' || !record.sourceMatches || !record.displayMatches) {
      report.errors.push({ type: 'copy-button', ...record });
    }
  }
  const templateCopy = report.copyButtons.find((item) => item.id === 'lesson02-practice-template');
  const completeCopy = report.copyButtons.find((item) => item.id === 'lesson02-practice-two-result');
  if (copyBlockCount !== 14
    || !templateCopy
    || !completeCopy
    || copiedTextById.get('lesson02-practice-template') === copiedTextById.get('lesson02-practice-two-result')) {
    report.errors.push({ type: 'copy-count-or-independence', copyBlockCount, templateCopy, completeCopy });
  }

  await copyPage.goto(`${baseUrl}/lessons/03/`, { waitUntil: 'networkidle' });
  const lessonThreeSummaries = copyPage.locator('details > summary');
  for (let index = 0; index < await lessonThreeSummaries.count(); index += 1) {
    const summary = lessonThreeSummaries.nth(index);
    if (await summary.isVisible()) await summary.click();
  }
  for (const id of [
    'lesson03-shelter-community-prompt',
    'lesson03-shelter-senior-prompt',
    'lesson03-gemini-rfp-analysis-prompt',
    'lesson03-campus-lounge-image-brief-prompt',
  ]) {
    const block = copyPage.locator(`prompt-copy-block[data-copy-block-id="${id}"]`);
    if (await block.count() !== 1) {
      report.errors.push({ type: 'lesson03-copy-missing', id, count: await block.count() });
      continue;
    }
    const source = await block.locator('[data-copy-source]').inputValue();
    const displayed = await block.locator('pre code').textContent();
    await copyPage.evaluate(() => navigator.clipboard.writeText('COPY_AUDIT_SENTINEL'));
    await block.locator('[data-copy-trigger]').click();
    const clipboard = await copyPage.evaluate(() => navigator.clipboard.readText());
    const record = {
      id,
      ready: await block.getAttribute('data-copy-ready'),
      sourceMatches: normalizeClipboardText(clipboard) === normalizeClipboardText(source),
      displayMatches: displayed === source,
      length: clipboard.length,
    };
    report.lesson03CopyButtons.push(record);
    if (record.ready !== 'true' || !record.sourceMatches || !record.displayMatches) {
      report.errors.push({ type: 'lesson03-copy-button', ...record });
    }
  }
  report.lesson03Assets = await copyPage.locator('.lesson03-reference-images figure').evaluateAll((figures) => (
    figures.map((figure) => {
      const image = figure.querySelector('img');
      const download = figure.querySelector('a[download]');
      return {
        imageLoaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
        href: download?.getAttribute('href'),
        downloadName: download?.getAttribute('download'),
      };
    })
  ));
  const lessonThreeStructure = await copyPage.evaluate(() => ({
    sectionCount: document.querySelectorAll('.lesson-content [data-lesson-section][id]').length,
    desktopTocCount: document.querySelectorAll('[data-current-lesson-toc="desktop"] [data-lesson-section-link]').length,
    localNavCount: document.querySelectorAll('.lesson-local-nav a').length,
    practiceSteps: document.querySelectorAll('#section-10 .lesson03-practice-step').length,
    resourceDownloads: [...document.querySelectorAll('#section-10 .lesson-resource-downloads a[download]')].map((link) => ({
      href: link.getAttribute('href'),
      downloadName: link.getAttribute('download'),
    })),
  }));
  const lessonThreeDownloadResults = [];
  for (const item of lessonThreeStructure.resourceDownloads) {
    const response = await copyContext.request.get(new URL(item.href, copyPage.url()).href);
    lessonThreeDownloadResults.push({ ...item, status: response.status(), ok: response.ok() });
  }
  report.lesson03Downloads = lessonThreeDownloadResults;
  if (report.lesson03CopyButtons.length !== 4
    || report.lesson03Assets.length !== 2
    || report.lesson03Assets.some((asset) => !asset.imageLoaded || !asset.href || !asset.downloadName)
    || lessonThreeStructure.sectionCount !== 11
    || lessonThreeStructure.desktopTocCount !== 11
    || lessonThreeStructure.localNavCount !== 11
    || lessonThreeStructure.practiceSteps !== 12
    || lessonThreeDownloadResults.length !== 4
    || lessonThreeDownloadResults.some((item) => !item.ok || !item.downloadName)) {
    report.errors.push({
      type: 'lesson03-review-practice',
      copyButtons: report.lesson03CopyButtons,
      assets: report.lesson03Assets,
      downloads: lessonThreeDownloadResults,
      structure: lessonThreeStructure,
    });
  }

  await copyPage.goto(`${baseUrl}/lessons/04/`, { waitUntil: 'networkidle' });
  const lesson04MaterialImages = copyPage.locator('.material-card img');
  for (let index = 0; index < await lesson04MaterialImages.count(); index += 1) {
    const image = lesson04MaterialImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (element) => {
      if (element instanceof HTMLImageElement && !element.complete) {
        await new Promise((resolve) => {
          element.addEventListener('load', resolve, { once: true });
          element.addEventListener('error', resolve, { once: true });
        });
      }
    });
  }
  report.lesson04 = await copyPage.evaluate(() => ({
    sectionCount: document.querySelectorAll('.lesson-content [data-lesson-section][id]').length,
    tocCount: document.querySelectorAll('[data-current-lesson-toc="desktop"] [data-lesson-section-link]').length,
    materialCards: document.querySelectorAll('.material-card').length,
    materialDownloads: document.querySelectorAll('.material-download[download]').length,
    materialImagesLoaded: [...document.querySelectorAll('.material-card img')]
      .every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    materialCheckboxes: document.querySelectorAll('[name="lesson04-material-selection"]').length,
    programIdeas: document.querySelectorAll('.idea-card').length,
    programPrompts: document.querySelectorAll('prompt-copy-block[data-copy-block-id^="lesson04-program-"]').length,
    completeManagerPrompts: document.querySelectorAll('prompt-copy-block[data-copy-block-id="lesson04-complete-organizer-prompt"]').length,
    hasRootScope: document.querySelector('#section-09')?.textContent?.includes('ROOT 바로 아래 파일은 그대로 둔다') ?? false,
    hasWindowsInstaller: document.querySelector('#section-12')?.textContent?.includes('Design Project Auto Organizer Setup.exe') ?? false,
    retiredGeminiCore: document.querySelector('#section-11')?.textContent?.includes('Gemini API 이미지 자동 분류') ?? false,
    rfpHref: document.querySelector('.rfp-download-card a[download]')?.getAttribute('href'),
  }));
  const lesson04Downloads = await copyPage.locator('.material-download[download]').evaluateAll((links) => (
    links.map((link) => ({ href: link.getAttribute('href'), downloadName: link.getAttribute('download') }))
  ));
  report.lesson04.downloadChecks = [];
  for (const item of lesson04Downloads) {
    const response = await copyContext.request.get(new URL(item.href, copyPage.url()).href);
    report.lesson04.downloadChecks.push({ ...item, status: response.status(), ok: response.ok() });
  }
  if (report.lesson04.rfpHref) {
    const response = await copyContext.request.get(new URL(report.lesson04.rfpHref, copyPage.url()).href);
    report.lesson04.rfpStatus = response.status();
  }
  const lesson04ProgramBlocks = copyPage.locator('prompt-copy-block[data-copy-block-id^="lesson04-program-"]');
  for (let index = 0; index < await lesson04ProgramBlocks.count(); index += 1) {
    const block = lesson04ProgramBlocks.nth(index);
    const id = await block.getAttribute('data-copy-block-id');
    const source = await block.locator('[data-copy-source]').inputValue();
    await copyPage.evaluate(() => navigator.clipboard.writeText('COPY_AUDIT_SENTINEL'));
    await block.locator('[data-copy-trigger]').click();
    const clipboard = await copyPage.evaluate(() => navigator.clipboard.readText());
    const record = { id, sourceMatches: normalizeClipboardText(clipboard) === normalizeClipboardText(source), length: clipboard.length };
    report.lesson04ProgramPrompts.push(record);
  }
  const completeManagerBlock = copyPage.locator('prompt-copy-block[data-copy-block-id="lesson04-complete-organizer-prompt"]');
  if (await completeManagerBlock.count() === 1) {
    const source = await completeManagerBlock.locator('[data-copy-source]').inputValue();
    await copyPage.evaluate(() => navigator.clipboard.writeText('COPY_AUDIT_SENTINEL'));
    await completeManagerBlock.locator('[data-copy-trigger]').click();
    const clipboard = await copyPage.evaluate(() => navigator.clipboard.readText());
    report.lesson04.completeManagerPrompt = {
      sourceMatches: normalizeClipboardText(clipboard) === normalizeClipboardText(source),
      includesElectron: source.includes('Electron'),
      includesSetup: source.includes('Setup.exe'),
      length: clipboard.length,
    };
  }
  if (report.lesson04.sectionCount !== 14
    || report.lesson04.tocCount !== 14
    || report.lesson04.materialCards !== 33
    || report.lesson04.materialDownloads !== 33
    || !report.lesson04.materialImagesLoaded
    || report.lesson04.materialCheckboxes !== 0
    || report.lesson04.programIdeas !== 10
    || report.lesson04.programPrompts !== 10
    || report.lesson04.completeManagerPrompts !== 1
    || !report.lesson04.hasRootScope
    || !report.lesson04.hasWindowsInstaller
    || report.lesson04.retiredGeminiCore
    || !report.lesson04.completeManagerPrompt?.sourceMatches
    || !report.lesson04.completeManagerPrompt?.includesElectron
    || !report.lesson04.completeManagerPrompt?.includesSetup
    || report.lesson04.rfpStatus !== 200
    || report.lesson04.downloadChecks.some((item) => !item.ok || !item.downloadName)
    || report.lesson04ProgramPrompts.length !== 10
    || report.lesson04ProgramPrompts.some((item) => !item.sourceMatches)) {
    report.errors.push({ type: 'lesson04-final-workflow', lesson04: report.lesson04, prompts: report.lesson04ProgramPrompts });
  }
  await copyContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  watchRuntimeErrors(mobilePage, 'mobile-390x844');
  await mobilePage.goto(`${baseUrl}/lessons/02/`, { waitUntil: 'networkidle' });
  await mobilePage.locator('[data-menu-open]').click();
  const openState = await mobilePage.evaluate(() => ({
    open: document.querySelector('[data-mobile-menu]')?.open ?? false,
    expanded: document.querySelector('[data-menu-open]')?.getAttribute('aria-expanded'),
  }));
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForFunction(() => (
    document.querySelector('[data-menu-open]')?.getAttribute('aria-expanded') === 'false'
  ), undefined, { timeout: 1000 });
  const escapeState = await mobilePage.evaluate(() => ({
    open: document.querySelector('[data-mobile-menu]')?.open ?? false,
    expanded: document.querySelector('[data-menu-open]')?.getAttribute('aria-expanded'),
    focusOnOpener: document.activeElement?.hasAttribute('data-menu-open') ?? false,
  }));
  await mobilePage.locator('[data-menu-open]').click();
  const mobileTarget = mobilePage.locator('[data-current-lesson-toc="mobile"] [data-lesson-section-link="section-11"]');
  const mobileTargetCount = await mobileTarget.count();
  if (mobileTargetCount !== 1) throw new Error(`모바일 section-11 링크 수 ${mobileTargetCount}`);
  await mobileTarget.click();
  await mobilePage.waitForTimeout(1500);
  report.mobile = { openState, escapeState, ...(await mobilePage.evaluate(() => ({
    menuOpen: document.querySelector('[data-mobile-menu]')?.open ?? false,
    hash: location.hash,
    active: document.querySelector('[data-current-lesson-toc="mobile"] [data-lesson-section-link="section-11"]')?.getAttribute('aria-current'),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    targetTop: Math.round(document.getElementById('section-11')?.getBoundingClientRect().top ?? -1),
  }))) };
  if (!report.mobile.openState.open
    || report.mobile.openState.expanded !== 'true'
    || report.mobile.escapeState.open
    || report.mobile.escapeState.expanded !== 'false'
    || !report.mobile.escapeState.focusOnOpener
    || report.mobile.menuOpen
    || report.mobile.hash !== '#section-11'
    || report.mobile.active !== 'location'
    || report.mobile.overflow
    || Math.abs(report.mobile.targetTop) > 200) {
    report.errors.push({ type: 'mobile-toc', ...report.mobile });
  }

  await mobilePage.goto(`${baseUrl}/lessons/03/`, { waitUntil: 'networkidle' });
  report.lesson03Mobile = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    sectionCount: document.querySelectorAll('.lesson-content [data-lesson-section][id]').length,
    imageDownloads: document.querySelectorAll('.lesson03-reference-images a[download]').length,
    copyButtons: document.querySelectorAll('prompt-copy-block [data-copy-trigger]').length,
    practiceSteps: document.querySelectorAll('#section-10 .lesson03-practice-step').length,
  }));
  if (report.lesson03Mobile.overflow
    || report.lesson03Mobile.sectionCount !== 11
    || report.lesson03Mobile.imageDownloads !== 2
    || report.lesson03Mobile.copyButtons !== 4
    || report.lesson03Mobile.practiceSteps !== 12) {
    report.errors.push({ type: 'lesson03-mobile', ...report.lesson03Mobile });
  }

  await mobilePage.goto(`${baseUrl}/lessons/04/`, { waitUntil: 'networkidle' });
  report.lesson04Mobile = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    sectionCount: document.querySelectorAll('.lesson-content [data-lesson-section][id]').length,
    materialCards: document.querySelectorAll('.material-card').length,
    programIdeas: document.querySelectorAll('.idea-card').length,
  }));
  if (report.lesson04Mobile.overflow
    || report.lesson04Mobile.sectionCount !== 14
    || report.lesson04Mobile.materialCards !== 33
    || report.lesson04Mobile.programIdeas !== 10) {
    report.errors.push({ type: 'lesson04-mobile', ...report.lesson04Mobile });
  }

  await mobilePage.goto(`${baseUrl}/lessons/03/`, { waitUntil: 'networkidle' });
  await mobilePage.emulateMedia({ media: 'print' });
  const printTocDisplay = await mobilePage.locator('[data-current-lesson-toc="mobile"]').evaluate((element) => getComputedStyle(element).display);
  if (printTocDisplay !== 'none') report.errors.push({ type: 'print-toc-visible', printTocDisplay });
  report.lesson03Print = await mobilePage.evaluate(() => ({
    sampleBodies: [...document.querySelectorAll('.lesson03-result-sample__body')]
      .map((element) => getComputedStyle(element).display),
    designBriefSampleBodies: [...document.querySelectorAll(
      '.lesson03-sample-details > div, .lesson03-sample-details > prompt-copy-block',
    )]
      .map((element) => getComputedStyle(element).display),
    downloadButtons: [...document.querySelectorAll('.lesson03-reference-images a[download]')]
      .map((element) => getComputedStyle(element).display),
  }));
  if (report.lesson03Print.sampleBodies.length !== 2
    || report.lesson03Print.sampleBodies.some((display) => display === 'none')
    || report.lesson03Print.designBriefSampleBodies.length < 5
    || report.lesson03Print.designBriefSampleBodies.some((display) => display === 'none')
    || report.lesson03Print.downloadButtons.some((display) => display !== 'none')) {
    report.errors.push({ type: 'lesson03-print', ...report.lesson03Print });
  }
  await mobileContext.close();
  if (report.runtimeErrors.length > 0) report.errors.push({ type: 'runtime-errors', items: report.runtimeErrors });
} finally {
  await browser.close();
}

console.log(JSON.stringify({
  baseUrl: report.baseUrl,
  lessonChecks: report.lessons.length,
  copyButtons: report.copyButtons.length,
  lesson03CopyButtons: report.lesson03CopyButtons,
  lesson03Assets: report.lesson03Assets,
  lesson03Downloads: report.lesson03Downloads,
  mobile: report.mobile,
  lesson03Mobile: report.lesson03Mobile,
  lesson03Print: report.lesson03Print,
  lesson04: report.lesson04,
  lesson04ProgramPrompts: report.lesson04ProgramPrompts,
  lesson04Mobile: report.lesson04Mobile,
  runtimeErrors: report.runtimeErrors,
  hashEntry: report.hashEntry,
  errors: report.errors,
}, null, 2));

if (report.errors.length > 0) process.exitCode = 1;
