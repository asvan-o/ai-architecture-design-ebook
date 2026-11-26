import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  middot: '·',
  mdash: '—',
  ndash: '–',
  rarr: '→',
  larr: '←',
  times: '×',
};

function decodeEntities(str) {
  return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, code) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const cp = parseInt(code.slice(2), 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    if (code.startsWith('#')) {
      const cp = parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    return ENTITIES[code] ?? m;
  });
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<(?:br|hr)\b[^>]*>/gi, ' ')
      .replace(/<\/(?:p|div|li|tr|td|th|dt|dd|h[1-6]|pre|summary|figcaption|blockquote)>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function removeTagBlocks(html, tagName) {
  const re = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  return html.replace(re, ' ');
}

function removeBalancedByClass(html, classFragment) {
  let out = html;
  const openRe = new RegExp(`<([a-z0-9]+)\\b[^>]*class="[^"]*${classFragment}[^"]*"[^>]*>`, 'i');
  while (true) {
    const m = openRe.exec(out);
    if (!m) break;
    const tag = m[1].toLowerCase();
    const start = m.index;
    const tagRe = new RegExp(`<(\\/?)${tag}\\b[^>]*>`, 'gi');
    tagRe.lastIndex = start;
    let depth = 0;
    let end = out.length;
    let tm;
    while ((tm = tagRe.exec(out)) !== null) {
      if (tm[1] === '/') depth -= 1;
      else depth += 1;
      if (depth === 0) {
        end = tagRe.lastIndex;
        break;
      }
    }
    out = out.slice(0, start) + ' ' + out.slice(end);
  }
  return out;
}

function cleanMainHtml(html) {
  let s = html;
  for (const tag of ['script', 'style', 'noscript', 'svg', 'dialog', 'template']) {
    s = removeTagBlocks(s, tag);
  }
  for (const cls of [
    'print-glossary-appendix',
    'review-lesson-nav',
    'l062-builder',
    'modeling-asset-actions',
    'ebook-access-gate',
  ]) {
    s = removeBalancedByClass(s, cls);
  }
  // Remove short UI action buttons (복사, 확대 보기 등)
  s = s.replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, ' ');
  return s;
}

function pageMeta(relHtml) {
  if (relHtml === 'index.html') {
    return { urlBase: '', pageLabel: '홈', defaultKind: 'overview', order: 0 };
  }
  if (relHtml === 'course-overview/index.html') {
    return { urlBase: 'course-overview/', pageLabel: '과정 개요', defaultKind: 'overview', order: 1 };
  }
  if (relHtml === 'glossary/index.html') {
    return { urlBase: 'glossary/', pageLabel: '용어 사전', defaultKind: 'glossary', order: 2 };
  }
  const m = relHtml.match(/^lessons\/([^/]+)\/index\.html$/);
  if (m) {
    const id = m[1];
    const display = id === '02-2' ? '2-2' : id === '07-2' ? '7-2' : id === '07-3' ? '7-3' : String(Number(id));
    const numOrder = id === '02-2' ? 2.5 : id === '07-2' ? 7.5 : id === '07-3' ? 7.6 : Number(id) || 99;
    return { urlBase: `lessons/${id}/`, pageLabel: `제${display}차시`, defaultKind: 'lesson', order: 10 + numOrder };
  }
  return null;
}

function isUsefulAnchor(id, tag, relHtml) {
  if (!id) return false;
  if (id === 'main' || id === 'main-content' || id === 'glossary-results') return false;
  if (/(?:-title|-heading|-copy-status|-panel|-tab|-label)$/.test(id)) return false;
  if (/^(?:modeling-image-|l\d+-part-|period-|l022-period-|l062-part-|l073-part-|l08-part-)/.test(id)) return false;
  if (relHtml === 'glossary/index.html') {
    return id.startsWith('term-') || id.startsWith('glossary-');
  }
  if (id.startsWith('term-')) return false;
  return ['section', 'article', 'aside', 'h2', 'h3', 'h4'].includes(tag);
}

function extractFirstHeading(sliceHtml) {
  const m = sliceHtml.match(/<h([2-5])\b[^>]*>([\s\S]*?)<\/h\1>/i);
  if (m) return stripTags(m[2]);
  const dt = sliceHtml.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i);
  if (dt) return stripTags(dt[1]);
  return '';
}

function extractSubHeadings(sliceHtml) {
  const found = [];
  const seen = new Set();
  const re = /<(?:h[2-5]|summary|caption)\b[^>]*>([\s\S]*?)<\/(?:h[2-5]|summary|caption)>/gi;
  let m;
  while ((m = re.exec(sliceHtml)) !== null) {
    const text = stripTags(m[1]);
    if (text.length >= 2 && text.length <= 120 && !seen.has(text)) {
      seen.add(text);
      found.push(text);
      if (found.length >= 8) break;
    }
  }
  return found;
}

function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['images', 'downloads', 'practice', '_astro'].includes(entry.name)) continue;
      out.push(...collectHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      out.push(full);
    }
  }
  return out;
}

export function buildWorkbookSearchIndex(outDir) {
  const root = path.resolve(outDir);
  const htmlFiles = collectHtmlFiles(root);
  const items = [];

  for (const file of htmlFiles) {
    const rel = path.relative(root, file).replaceAll('\\', '/');
    const meta = pageMeta(rel);
    if (!meta) continue;

    const raw = readFileSync(file, 'utf8');
    const mainMatch = raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) continue;

    const h1Match = mainMatch[1].match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const pageTitle = h1Match ? stripTags(h1Match[1]) : meta.pageLabel;

    // Extract builder summary separately for 07-2 so "올인원 통합 설치 빌더" remains searchable
    const mainClean = cleanMainHtml(mainMatch[1]);

    // Find all useful anchor openings inside <main>
    const anchorRe = /<(section|article|aside|h2|h3|h4)\b[^>]*\bid="([^"]+)"[^>]*>/gi;
    const anchors = [];
    let m;
    while ((m = anchorRe.exec(mainClean)) !== null) {
      const tag = m[1].toLowerCase();
      const id = m[2];
      if (!isUsefulAnchor(id, tag, rel)) continue;
      anchors.push({ index: m.index, tag, id });
    }

    // Intro slice before first anchor
    const introHtml = anchors.length > 0 ? mainClean.slice(0, anchors[0].index) : mainClean;
    const introText = stripTags(introHtml);
    if (introText.length >= 25) {
      items.push({
        u: meta.urlBase,
        p: meta.pageLabel,
        pt: pageTitle,
        t: pageTitle,
        k: meta.defaultKind,
        pr: /<pre\b|프롬프트|prompt-copy/i.test(introHtml) ? 1 : 0,
        h: extractSubHeadings(introHtml).join(' · '),
        b: introText.slice(0, 1200),
        o: meta.order,
      });
    }

    // Section-by-section slices anchored to exact #id
    for (let i = 0; i < anchors.length; i += 1) {
      const cur = anchors[i];
      const end = i + 1 < anchors.length ? anchors[i + 1].index : mainClean.length;
      const sliceHtml = mainClean.slice(cur.index, end);
      const text = stripTags(sliceHtml);
      if (text.length < 18) continue;

      let title = extractFirstHeading(sliceHtml);
      if (!title || title.length > 140) {
        title = text.slice(0, 72);
      }
      // Clean leading section numbers like "01 제8차시 · 15분 "
      title = title.replace(/^\d{2}\s+/, '').trim();

      const hasPrompt =
        /<pre\b|prompt-copy|review-prompt|l062-code-card|pb-easy-prompt|l10-pg-prompt|프롬프트/i.test(
          sliceHtml,
        )
          ? 1
          : 0;

      const subHeadings = extractSubHeadings(sliceHtml).filter((h) => h !== title);
      const url = `${meta.urlBase}#${cur.id}`;

      items.push({
        u: url,
        p: meta.pageLabel,
        pt: pageTitle,
        t: title,
        k: rel === 'glossary/index.html' ? 'glossary' : meta.defaultKind,
        pr: hasPrompt,
        h: subHeadings.join(' · '),
        b: text.slice(0, 1400),
        o: meta.order,
      });
    }
  }

  // Sort by course order, preserving document order within each page
  items.sort((a, b) => a.o - b.o);
  const compact = items.map(({ o: _o, ...rest }) => rest);

  return {
    schemaVersion: 1,
    count: compact.length,
    items: compact,
  };
}

export function writeWorkbookSearchIndex(outDir) {
  const index = buildWorkbookSearchIndex(outDir);
  const target = path.join(path.resolve(outDir), 'search-index.json');
  writeFileSync(target, JSON.stringify(index) + '\n', 'utf8');
  console.log(`[search] workbook search-index.json generated: ${index.count} sections (${Math.round(Buffer.byteLength(JSON.stringify(index)) / 1024)} KB)`);
  return index;
}
