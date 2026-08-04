import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import {
  closeServer,
  createStaticServer,
  findAvailablePorts,
  listen,
  LOOPBACK_HOST,
} from './lecture-kit-static.mjs';

const outputRoot = path.resolve(process.argv[2] ?? 'dist-instructor');
const lessonsRoot = path.join(outputRoot, 'presentation', 'lessons');
const lessonIds = (await readdir(lessonsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d{2}$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();
const targets = [
  {
    contentId: 'lecture-start',
    presentationRoute: '/presentation/lecture-start/',
    files: [
      path.join(outputRoot, 'presentation', 'lecture-start', 'index.html'),
      path.join(outputRoot, 'instructor-console', 'lecture-start', 'index.html'),
    ],
  },
  {
    contentId: 'instructor-introduction',
    presentationRoute: '/presentation/instructor-introduction/',
    files: [
      path.join(outputRoot, 'presentation', 'instructor-introduction', 'index.html'),
      path.join(outputRoot, 'instructor-console', 'instructor-introduction', 'index.html'),
    ],
  },
  {
    contentId: 'course-overview',
    presentationRoute: '/presentation/course-overview/',
    files: [
      path.join(outputRoot, 'presentation', 'course-overview', 'index.html'),
      path.join(outputRoot, 'instructor-console', 'course-overview', 'index.html'),
    ],
  },
  ...lessonIds.map((lessonId) => ({
    contentId: `lesson-${lessonId}`,
    presentationRoute: `/presentation/lessons/${lessonId}/`,
    files: [
      path.join(outputRoot, 'presentation', 'lessons', lessonId, 'index.html'),
      path.join(outputRoot, 'instructor-console', 'lessons', lessonId, 'index.html'),
    ],
  })),
];

const [port] = await findAvailablePorts(1, 4400, 4499);
const server = createStaticServer(outputRoot);
await listen(server, port, LOOPBACK_HOST);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

const escapeJsonForHtml = (value) => JSON.stringify(value)
  .replaceAll('<', '\\u003c')
  .replaceAll('\u2028', '\\u2028')
  .replaceAll('\u2029', '\\u2029');

try {
  for (const target of targets) {
    const response = await page.goto(`http://${LOOPBACK_HOST}:${port}${target.presentationRoute}`, {
      waitUntil: 'networkidle',
    });
    if (!response?.ok()) throw new Error(`${target.presentationRoute} HTTP ${response?.status() ?? 'no response'}`);
    await page.locator('[data-lecture-deck][data-deck-ready="true"]').waitFor();
    const manifest = await page.evaluate(() => {
      const root = document.querySelector('[data-lecture-deck]');
      const controller = root?.lectureDeck;
      if (!root || !controller?.slides?.length) throw new Error('slide deck initialization failed');
      return {
        schemaVersion: 1,
        buildId: root.dataset.buildId,
        deckId: root.dataset.deckId,
        contentId: root.dataset.contentId,
        referenceViewport: { width: 1280, height: 720 },
        slides: controller.slides.map((slide, slideIndex) => ({
          slideIndex,
          id: slide.id,
          sectionId: slide.sectionId,
          sectionLabel: slide.sectionLabel,
          title: slide.title,
          html: slide.node.outerHTML,
        })),
      };
    });
    if (manifest.contentId !== target.contentId || manifest.deckId !== target.contentId) {
      throw new Error(`${target.contentId}: deck identity mismatch`);
    }
    const ids = manifest.slides.map((slide) => slide.id);
    if (new Set(ids).size !== ids.length) throw new Error(`${target.contentId}: duplicate slideId`);
    const payload = escapeJsonForHtml(manifest);
    const element = `<script type="application/json" data-deck-manifest="${target.contentId}">${payload}</script>`;
    for (const filePath of target.files) {
      const source = await readFile(filePath, 'utf8');
      if (!source.includes('</body>')) throw new Error(`${filePath}: body closing tag not found`);
      await writeFile(filePath, source.replace('</body>', `${element}</body>`), 'utf8');
    }
    console.log(`[slide-manifest] ${target.contentId}: ${manifest.slides.length} slides`);
  }
} finally {
  await context.close();
  await browser.close();
  await closeServer(server);
}

console.log(`[slide-manifest] 1280x720 기준 고정 manifest ${targets.length}개 생성 완료`);
