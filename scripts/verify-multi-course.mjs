import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import ts from 'typescript';
import { getCourseProfiles, courseOutput, repositoryRoot } from './course-registry.mjs';
import { createStaticServer, listen, closeServer, findAvailablePorts } from './lecture-kit-static.mjs';
import { verifyDraftOutput } from './draft-output.mjs';

const args = process.argv.slice(2);
const regression = args.includes('--regression');
const profiles = getCourseProfiles();
const base = (JSON.parse(readFileSync('dist/site/course-builds.json', 'utf8')).portalBase || '').replace(/\/$/, '');
const gwBase = `${base}/gwangju`;
const root = path.join(repositoryRoot, 'dist/site');
const baseline = path.join(repositoryRoot, 'tmp/regression-baseline');
const instructor = courseOutput('gwangju-2026', 'instructor');
const files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const report = { profiles: profiles.length, htmlNoindex: 0, approvedPdfs: 0, regressionPages: 0, presentationDecks: 0, scenarios: [], passed: false };
const modeOutputs = profiles.flatMap(({ course }) => ['student', 'instructor', 'pdf-review'].map((mode) => courseOutput(course.courseId, mode))).filter(existsSync);
for (const file of [...files(root), ...modeOutputs.flatMap(files)].filter((name) => name.endsWith('.html'))) {
  assert(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(readFileSync(file, 'utf8')), `noindex missing: ${file}`);
  report.htmlNoindex++;
}
assert(!existsSync(path.join(root, 'gwangju/instructor-console')));
assert(!existsSync(path.join(root, 'gwangju/presentation')));
assert(existsSync(path.join(root, 'daejeon/downloads/daejeon/pdf/ai-architecture-design-daejeon-course-overview.pdf')));
for (const { course } of profiles.filter(({ course }) => course.contentStatus === 'design-pending')) {
  const opts = { localReviewAssets: course.courseId === 'daejeon-2026' };
  verifyDraftOutput(course, path.join(root, course.routeSlug), opts);
  for (const output of modeOutputs.filter((directory) => directory.includes(course.courseId))) {
    verifyDraftOutput(course, output, opts);
  }
}
const gw = profiles.find(({ course }) => course.courseId === 'gwangju-2026');
assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'gwangju/downloads/pdf-manifest.json'), 'utf8')), gw.pdfs.approvedManifest);
for (const file of gw.pdfs.approvedManifest.files) {
  for (const directory of ['gwangju/downloads', 'downloads']) assert.equal(sha(readFileSync(path.join(root, directory, file.fileName))), file.sha256, `PDF changed: ${file.fileName}`);
  report.approvedPdfs++;
}
const before = sha(readFileSync(path.join(root, 'gwangju/index.html')));
const invalidBuild = spawnSync(process.execPath, ['scripts/run-ebook-mode.mjs', 'build', 'student', '--course=unknown-course'], { encoding: 'utf8', windowsHide: true });
assert.notEqual(invalidBuild.status, 0);
assert.match(invalidBuild.stderr, /Unknown courseId/);
assert.equal(sha(readFileSync(path.join(root, 'gwangju/index.html'))), before);
report.scenarios.push('unknown course build fails before output mutation', 'student/instructor and draft content boundaries', 'approved PDF bytes and metadata');

// Exercise the real state helper with both identities; the original legacy state is retained.
const stateSource = ts.transpileModule(readFileSync('src/lib/browser-state.ts', 'utf8').replace('import.meta.env.PUBLIC_COURSE_ID', "'gwangju-2026'"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const state = await import(`data:text/javascript;base64,${Buffer.from(stateSource).toString('base64')}`);
const memory = new Map([['note', 'legacy Gwangju note']]);
const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
assert.equal(state.readCourseState(storage, 'note', 'note', 'daejeon-2026'), null);
assert.equal(state.readCourseState(storage, 'note', 'note', 'gwangju-2026'), 'legacy Gwangju note');
storage.setItem(state.courseStorageKey('note', 'daejeon-2026'), 'Daejeon test state');
assert.equal(state.readCourseState(storage, 'note', 'note', 'gwangju-2026'), 'legacy Gwangju note');
assert.equal(memory.get('note'), 'legacy Gwangju note');
report.scenarios.push('course storage isolation and Gwangju-only non-destructive legacy migration');

const ports = await findAvailablePorts(regression ? 4 : 1, 4500, 4599);
const servers = [createStaticServer(root, base)];
if (regression) servers.push(createStaticServer(path.join(baseline, 'student'), base), createStaticServer(instructor, gwBase), createStaticServer(path.join(baseline, 'instructor')));
await Promise.all(servers.map((server, index) => listen(server, ports[index], '127.0.0.1')));
const origins = ports.map((port) => `http://127.0.0.1:${port}`);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`${origins[0]}${base}/`);
  assert.equal(await page.locator('[data-course-link]').count(), 2);
  await page.locator('[data-course-link="daejeon-2026"]').click();
  await page.waitForURL(`${origins[0]}${base}/daejeon/`);
  assert.equal(await page.locator('[data-course-status="design-pending"]').count(), 1);
  await page.goto(`${origins[0]}${base}/`);
  await page.locator('[data-course-link="gwangju-2026"]').click();
  await page.waitForURL(`${origins[0]}${gwBase}/`);
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'locked');
  await page.locator('input[type=password]').fill('intentionally-wrong-regression-password');
  await page.locator('[data-ebook-access-form] button[type=submit]').click();
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'locked');
  const access = JSON.parse(readFileSync('src/config/access.json', 'utf8'));
  await page.evaluate(({ sessionStorageKey, passwordHash }) => sessionStorage.setItem(sessionStorageKey, passwordHash), access);
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'unlocked');
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), `${access.sessionStorageKey}:course:gwangju-2026`), access.passwordHash);
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), `${access.sessionStorageKey}:course:daejeon-2026`), null);
  const daejeonCourse = profiles.find(({ course }) => course.courseId === 'daejeon-2026').course;
  const daejeonAccess = JSON.parse(readFileSync(daejeonCourse.access.passwordConfig, 'utf8'));
  assert.notEqual(daejeonAccess.passwordHash, access.passwordHash);
  const daejeonKey = daejeonAccess.sessionStorageKey + ':course:daejeon-2026';
  await page.goto(origins[0] + base + '/daejeon/lessons/01/');
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'locked');
  assert.equal(await page.locator('#main').isVisible(), false);
  await page.locator('[data-ebook-access-input]').fill('intentionally-wrong-daejeon-password');
  await page.locator('[data-ebook-access-submit]').click();
  await page.locator('[data-ebook-access-error]:not([hidden])').waitFor();
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'locked');
  await page.evaluate(({key,hash}) => sessionStorage.setItem(key,hash), {key:daejeonKey,hash:daejeonAccess.passwordHash});
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'unlocked');
  assert.equal(await page.locator('#main').isVisible(), true);
  await page.goto(origins[0] + gwBase + '/');
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'), 'unlocked');
  report.scenarios.push('Gwangju authorized session cannot unlock Daejeon; Daejeon wrong password rejected; independent Daejeon authorization preserves Gwangju');
  await page.goto(`${origins[0]}${base}/lessons/01/?compat=1#section-01`);
  await page.waitForURL(`${origins[0]}${gwBase}/lessons/01/?compat=1#section-01`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-menu-open]').click();
  assert.equal(await page.locator('[data-mobile-menu]').evaluate((dialog) => dialog.open), true);
  assert.equal(await page.locator('[data-mobile-menu] a[href*="/lessons/"]').count() >= 14, true);
  await page.locator('[data-menu-close]').click();
  assert.equal(await page.locator('[data-mobile-menu]').evaluate((dialog) => dialog.open), false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.search-trigger').click();
  await page.locator('.search-backdrop input').fill('제14차시');
  await page.locator(`.search-backdrop a[href="${gwBase}/lessons/14/"]`).waitFor();
  assert.equal(await page.locator('.search-backdrop a').evaluateAll((links) => links.every((link) => link.pathname.includes('/gwangju/'))), true);
  report.scenarios.push('portal selects both courses', 'wrong password rejected, legacy authorized session preserved and scoped', 'legacy deep link preserves query/hash', 'mobile menu opens/closes with all 14 lessons', 'search UI resolves lesson 14 within Gwangju');
  await page.close();

  if (regression) {
    const live = await browser.newContext();
    const consolePage = await live.newPage(); const projector = await live.newPage();
    const errors = [];
    for (const target of [consolePage, projector]) target.on('pageerror', (error) => errors.push(error.message));
    await consolePage.goto(`${origins[2]}${gwBase}/instructor-console/lessons/01/`);
    await projector.goto(`${origins[2]}${gwBase}/presentation/lessons/01/`);
    await consolePage.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor();
    await projector.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor();
    const getSlide = (target) => target.locator('[data-deck-slide]').getAttribute('data-slide-id');
    const originalSlide = await getSlide(consolePage);
    await consolePage.locator('[data-deck-action="next"]').click();
    const nextSlide = await getSlide(consolePage);
    assert.notEqual(nextSlide, originalSlide);
    await projector.waitForFunction((slide) => document.querySelector('[data-deck-slide]').getAttribute('data-slide-id') === slide, nextSlide);
    const storedKey = 'ai-architecture-slide-position-v1:lesson-01:course:gwangju-2026';
    assert.equal(await consolePage.evaluate((key) => sessionStorage.getItem(key), storedKey), nextSlide);
    assert.equal(await consolePage.evaluate(() => sessionStorage.getItem('ai-architecture-slide-position-v1:lesson-01:course:daejeon-2026')), null);
    await consolePage.evaluate(() => {
      const deck = document.querySelector('[data-lecture-deck]');
      const message = { type: 'slide-sync', buildId: deck.dataset.buildId, deckId: deck.dataset.deckId, slideId: deck.lectureDeck.slides[0].id };
      const foreignChannel = new BroadcastChannel('ai-architecture-presenter:course:daejeon-2026');
      foreignChannel.postMessage(message); setTimeout(() => foreignChannel.close(), 100);
    });
    await projector.waitForTimeout(150);
    assert.equal(await getSlide(projector), nextSlide);
    await consolePage.locator('[data-edit-import]').setInputFiles({ name: 'foreign-course.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, courseId: 'daejeon-2026', changes: [] })) });
    await consolePage.locator('[data-edit-import-status]').filter({ hasText: '다른 과정' }).waitFor();
    assert.equal(await consolePage.locator('[data-ebook-access-form]').count(), 0);
    assert.deepEqual(errors, [], 'Instructor/presentation JavaScript error');
    await live.close();
    report.scenarios.push('instructor/projector synchronization and scoped position storage; foreign course channel/import rejected');
    // Raw DOM comparison excludes executable code and build-only attributes. Teaching markup/text is compared exactly.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const oldPage = await context.newPage(); const newPage = await context.newPage();
    const imageHashes = (directory, prefix) => Object.fromEntries(files(directory).filter((file) => /\.(webp|png|jpg|jpeg|svg|gif|avif)$/i.test(file)).map((file) => [`${prefix}/${path.relative(directory, file).replaceAll('\\', '/')}`, sha(readFileSync(file))]));
    const hashes = { ...imageHashes(path.join(baseline, 'student'), base), ...imageHashes(path.join(root, 'gwangju'), gwBase), ...imageHashes(path.join(baseline, 'instructor'), ''), ...imageHashes(instructor, gwBase) };
    const snapshot = async (target, selector) => target.evaluate(({ selector, hashes, base, gwBase }) => {
      const source = document.querySelector(selector);
      if (!source) throw new Error(`Content selector missing: ${selector}`);
      const element = source.cloneNode(true);
      element.querySelectorAll('script,style').forEach((node) => node.remove());
      const normalize = (value) => {
        for (const [url, hash] of Object.entries(hashes).sort((a, b) => b[0].length - a[0].length)) value = value.replaceAll(url, `ASSET:${hash}`);
        return value.replaceAll(gwBase, 'COURSE_BASE').replaceAll(base || '__NO_BASE__', 'COURSE_BASE');
      };
      for (const node of [element, ...element.querySelectorAll('*')]) {
        for (const attribute of [...node.attributes]) {
          if (attribute.name.startsWith('data-astro-cid-') || ['uid', 'component-url', 'renderer-url', 'opts'].includes(attribute.name)) node.removeAttribute(attribute.name);
          else node.setAttribute(attribute.name, normalize(attribute.value));
        }
      }
      return { title: document.title, markup: normalize(element.innerHTML), text: element.textContent, sections: [...element.querySelectorAll('[data-lesson-section][id]')].map((node) => node.id) };
    }, { selector, hashes, base, gwBase });
    const compare = async (route, selector) => {
      const responses = await Promise.all([oldPage.goto(`${origins[1]}${base}/${route}`), newPage.goto(`${origins[0]}${gwBase}/${route}`)]);
      assert(responses.every((response) => response?.ok()), `Route missing: ${route}`);
      const [oldResult, newResult] = await Promise.all([snapshot(oldPage, selector), snapshot(newPage, selector)]);
      assert.deepEqual(newResult, oldResult, `Unexpected approved content difference: ${route}`);
      report.regressionPages++;
    };
    for (let number = 1; number <= 14; number++) {
      const id = String(number).padStart(2, '0');
      await compare(`lessons/${id}/`, '.lesson-content');
      await compare(`print/lessons/${id}/`, '.print-main');
    }
    for (const route of ['print/course/', 'prompts/', 'course-overview/', 'curriculum/', 'glossary/', 'guide/', 'troubleshooting/', 'updates/', 'ebook-downloads/']) await compare(route, route.startsWith('print/') ? '.print-main' : 'main');
    const oldSearch = JSON.parse(readFileSync(path.join(baseline, 'student/search-index.json'), 'utf8'));
    const newSearch = JSON.parse(readFileSync(path.join(root, 'gwangju/search-index.json'), 'utf8'));
    assert.equal(JSON.stringify(newSearch).replaceAll(gwBase, 'BASE'), JSON.stringify(oldSearch).replaceAll(base, 'BASE'));
    const extractManifest = (file) => JSON.parse(readFileSync(file, 'utf8').match(/<script type="application\/json" data-deck-manifest="[^"]+">([^<]+)<\/script>/)[1]);
    for (const deck of ['lecture-start', 'instructor-introduction', 'course-overview', ...gw.course.lessons.map(({ id }) => `lessons/${id}`)]) {
      const oldManifest = extractManifest(path.join(baseline, 'instructor/presentation', deck, 'index.html'));
      const newManifest = extractManifest(path.join(instructor, 'presentation', deck, 'index.html'));
      assert.deepEqual(newManifest.slides.map(({ id, sectionId, sectionLabel, title }) => ({ id, sectionId, sectionLabel, title })), oldManifest.slides.map(({ id, sectionId, sectionLabel, title }) => ({ id, sectionId, sectionLabel, title })), `Slide order or content changed: ${deck}`);
      // Presentation source contains the complete approved body before pagination.
      await Promise.all([oldPage.goto(`${origins[3]}/presentation/${deck}/`), newPage.goto(`${origins[2]}${gwBase}/presentation/${deck}/`)]);
      const [oldBody, newBody] = await Promise.all([snapshot(oldPage, '[data-deck-source]'), snapshot(newPage, '[data-deck-source]')]);
      // The old local build had '/' as BASE_URL.
      newBody.markup = newBody.markup.replaceAll('COURSE_BASE/', '/');
      assert.deepEqual(newBody, oldBody, `Unexpected presentation content difference: ${deck}`);
      report.presentationDecks++;
    }
    await context.close();
    report.scenarios.push('all 14 lesson and print bodies, sections, prompts, workflow/source markup and image bytes unchanged', 'navigation pages, prompt library, search data and PDF metadata unchanged', 'all 17 presentation decks preserve section/slide order and teaching bodies');
  }
  report.passed = true;
} finally {
  await browser.close();
  await Promise.all(servers.map(closeServer));
  mkdirSync(path.join(repositoryRoot, 'tmp'), { recursive: true });
  writeFileSync(path.join(repositoryRoot, 'tmp/multi-course-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));
