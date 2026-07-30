import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const outputDirectory = path.resolve(process.argv[2] ?? 'dist-student');
const manifestPath = path.resolve('data', 'pdf-exports.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const downloadsDirectory = path.join(outputDirectory, 'downloads');
const basePath = normalizeBasePath(process.env.BASE_PATH);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
]);

function normalizeBasePath(value = '') {
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveStaticPath(requestUrl) {
  const url = new URL(requestUrl, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);

  if (basePath && pathname.startsWith(`${basePath}/`)) {
    pathname = pathname.slice(basePath.length);
  } else if (basePath && pathname === basePath) {
    pathname = '/';
  }

  const normalizedPath = path.posix.normalize(pathname).replace(/^\/+/, '');
  const candidate = path.resolve(outputDirectory, normalizedPath || 'index.html');
  if (!candidate.startsWith(`${outputDirectory}${path.sep}`) && candidate !== outputDirectory) {
    return null;
  }
  return path.extname(candidate) ? candidate : path.join(candidate, 'index.html');
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveStaticPath(request.url ?? '/');
    if (!filePath) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not Found');
  }
});

const listen = () => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => resolve(server.address()));
});

const closeServer = () => new Promise((resolve) => server.close(resolve));

const forbiddenVisibleText = [
  'CONTENT REVIEW REQUESTED',
  'OUTLINE REVIEW REQUESTED',
  'LAST VERIFIED',
  'CONTENT STATUS',
  'REVIEW REQUESTED',
  '상세 원고 작성 전 검토 요청 상태',
  '이 슬롯의 로컬 강사 메모가 없습니다.',
  'public/에 넣지 않습니다',
];

let browser;
try {
  await mkdir(downloadsDirectory, { recursive: true });
  const address = await listen();
  if (!address || typeof address === 'string') {
    throw new Error('PDF 생성용 로컬 서버 주소를 확인할 수 없습니다.');
  }

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const origin = `http://127.0.0.1:${address.port}`;

  for (const target of manifest.targets) {
    const page = await context.newPage();
    const route = `${basePath}${target.route}`;
    const response = await page.goto(`${origin}${route}`, {
      waitUntil: 'networkidle',
    });
    if (!response?.ok()) {
      throw new Error(`${target.id}: 인쇄 route 응답 실패 (${response?.status() ?? 'no response'})`);
    }

    await page.emulateMedia({ media: 'print' });
    await page.evaluate(async ({ lessonIds, sectionIdsByLesson = {} }) => {
      await document.fonts.ready;
      document.querySelectorAll('details').forEach((details) => {
        details.open = true;
      });

      const includedLessons = new Set(lessonIds);
      document.querySelectorAll('[data-print-lesson-id]').forEach((lesson) => {
        const lessonId = lesson.getAttribute('data-print-lesson-id');
        if (!lessonId || !includedLessons.has(lessonId)) {
          lesson.setAttribute('hidden', '');
          return;
        }

        const includedSections = sectionIdsByLesson[lessonId];
        if (!includedSections) return;
        const sectionSet = new Set(includedSections);
        lesson.querySelectorAll('.lesson-section').forEach((section) => {
          if (!section.id || !sectionSet.has(section.id)) {
            section.setAttribute('hidden', '');
          }
        });
      });
    }, target);

    const audit = await page.evaluate((forbiddenText) => {
      const visibleText = document.body.innerText;
      return {
        forbidden: forbiddenText.filter((text) => visibleText.includes(text)),
        instructorMarkers: document.querySelectorAll(
          '[data-instructor-note-slot], [data-instructor-note-template], .instructor-note',
        ).length,
        lessonOneParagraphs: document.querySelectorAll(
          '[data-print-lesson-id="01"] .lesson-ai-response > p',
        ).length,
        visibleLessons: document.querySelectorAll(
          '[data-print-lesson-id]:not([hidden])',
        ).length,
        footerLabel:
          document.querySelector('[data-print-lesson-id]:not([hidden]) .print-lesson__title')
            ?.textContent?.trim() ?? 'AI 건축디자인 바이블',
      };
    }, forbiddenVisibleText);

    if (audit.forbidden.length > 0) {
      throw new Error(`${target.id}: PDF에 제외할 문구가 표시됩니다 (${audit.forbidden.join(', ')})`);
    }
    if (audit.instructorMarkers > 0) {
      throw new Error(`${target.id}: 강사 메모 마커 ${audit.instructorMarkers}개가 남아 있습니다.`);
    }
    if (target.lessonIds.includes('01') && audit.lessonOneParagraphs !== 22) {
      throw new Error(
        `${target.id}: Gemini 실제 응답이 22문단이 아닙니다 (${audit.lessonOneParagraphs}문단).`,
      );
    }
    if (audit.visibleLessons !== target.lessonIds.length) {
      throw new Error(
        `${target.id}: 출력 차시 수가 설정과 다릅니다 (${audit.visibleLessons}/${target.lessonIds.length}).`,
      );
    }

    const footerLabel = target.kind === 'course'
      ? 'AI 건축디자인 바이블 · 전체 교안'
      : audit.footerLabel;
    const outputPath = path.join(downloadsDirectory, target.output);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="box-sizing:border-box;width:100%;padding:0 15mm;color:#5f6762;font-family:'Noto Sans CJK KR','Malgun Gothic',sans-serif;font-size:8px;">
          AI 건축디자인 바이블
        </div>
      `,
      footerTemplate: `
        <div style="box-sizing:border-box;display:flex;width:100%;gap:8px;justify-content:space-between;padding:0 15mm;color:#5f6762;font-family:'Noto Sans CJK KR','Malgun Gothic',sans-serif;font-size:8px;">
          <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(footerLabel)}</span>
          <span style="display:inline-flex;flex:0 0 10ch;justify-content:flex-end;white-space:nowrap;">
            <span class="pageNumber" style="display:inline-block;min-width:3ch;text-align:right;"></span>
            <span>&nbsp;/&nbsp;</span>
            <span class="totalPages" style="display:inline-block;min-width:3ch;text-align:left;"></span>
          </span>
        </div>
      `,
      margin: {
        top: '18mm',
        right: '15mm',
        bottom: '18mm',
        left: '15mm',
      },
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });

    const fileStats = await stat(outputPath);
    if (fileStats.size < 1024) {
      throw new Error(`${target.id}: PDF 파일 크기가 비정상적으로 작습니다 (${fileStats.size} bytes).`);
    }
    console.log(`PDF 생성: ${target.output} (${fileStats.size} bytes)`);
    await page.close();
  }

  await context.close();
  console.log(`PDF 생성 완료: ${manifest.targets.length}개`);
} finally {
  if (browser) await browser.close();
  if (server.listening) await closeServer();
}
