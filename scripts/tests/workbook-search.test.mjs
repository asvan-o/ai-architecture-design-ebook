import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from '../course-registry.mjs';
import { buildWorkbookSearchIndex } from '../build-workbook-search-index.mjs';

test('WorkbookSearchModal is mounted on both ReviewLayout and Home with keyboard & anchor jump support', () => {
  const layoutSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/layouts/ReviewLayout.astro'), 'utf8');
  const homeSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/components/DaejeonHomeDesignPreview.astro'), 'utf8');
  const modalSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/components/WorkbookSearchModal.astro'), 'utf8');
  const runnerSrc = fs.readFileSync(path.join(repositoryRoot, 'scripts/run-ebook-mode.mjs'), 'utf8');

  assert(layoutSrc.includes('<WorkbookSearchModal />'), 'ReviewLayout must mount WorkbookSearchModal');
  assert(layoutSrc.includes('data-wb-search-open'), 'ReviewLayout header must include search trigger');
  assert(homeSrc.includes('<WorkbookSearchModal />'), 'Home must mount WorkbookSearchModal');
  assert(homeSrc.includes('data-wb-search-open'), 'Home header must include search trigger');
  assert(modalSrc.includes('search-index.json'), 'Search modal must fetch search-index.json');
  assert(modalSrc.includes('wb-search-flash'), 'Search modal must highlight jumped target');
  assert(runnerSrc.includes('writeWorkbookSearchIndex'), 'run-ebook-mode.mjs must emit search-index.json');
});

test('buildWorkbookSearchIndex extracts anchored lesson, glossary, and skill sections cleanly', () => {
  const builtDir = path.join(repositoryRoot, 'dist/site/workbook');
  if (!fs.existsSync(path.join(builtDir, 'index.html'))) return;

  const idx = buildWorkbookSearchIndex(builtDir);
  assert(idx.count >= 250, `Expected at least 250 indexed sections, got ${idx.count}`);
  const urls = new Set(idx.items.map((it) => it.u));
  assert(urls.has('lessons/07-2/#l062-skill-path-custom'), 'Must index 07-2 skill customization section');
  assert(urls.has('lessons/08/#l08-grounding-principle'), 'Must index 08 grounding principle section');
  assert(urls.has('lessons/09/#l09-exterior-styles'), 'Must index 09 exterior styles section');
  assert(urls.has('glossary/#term-grounding'), 'Must index glossary grounding term');
  assert(idx.items.every((it) => !it.b.includes('print-glossary-appendix')), 'Must exclude print-only glossary noise');
});
