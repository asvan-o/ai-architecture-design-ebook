import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultConfig = {
  repository: 'asvan-o/ai-architecture-design-ebook',
  tag: 'course-materials-2026-10-19-v1',
  basePath: '/ai-architecture-design-ebook',
  maximumPagesBytes: 990_000_000,
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export async function listFiles(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(file));
    else if (entry.isFile()) result.push(file);
    else throw new Error('Unexpected symlink or special file: ' + file);
  }
  return result.sort();
}
export function shouldUseRelease(relative, size) {
  const ext = path.posix.extname(relative).toLowerCase();
  // GLB stays on Pages: the interactive 3D viewer needs same-origin fetch.
  if (['.zip', '.mp4', '.fbx', '.dwg', '.pptx', '.docx', '.hwp', '.hwpx'].includes(ext)) return true;
  if (ext === '.pdf') return !relative.startsWith('daejeon/downloads/daejeon/pdf/');
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && size > 3_000_000;
}
export async function makeReleasePlan(root, config = defaultConfig) {
  const files = [], names = new Map();
  let sourceBytes = 0;
  for (const file of await listFiles(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const bytes = (await stat(file)).size;
    sourceBytes += bytes;
    if (!shouldUseRelease(relative, bytes)) continue;
    const digest = sha(await readFile(file));
    const originalName = path.posix.basename(relative).normalize('NFC');
    const ext = path.posix.extname(originalName);
    const readable = originalName.slice(0, -ext.length).replace(/[^A-Za-z0-9._-]/g, '').replace(/_+/g, '_').replace(/^[._-]+|[._-]+$/g, '') || 'material';
    // GitHub strips Korean characters from asset names. Use stable ASCII URLs;
    // Korean teaching labels and original files inside ZIPs are preserved.
    let assetName = /[^A-Za-z0-9._-]/.test(originalName)
      ? relative.split('/')[0] + '-' + readable + '-' + digest.slice(0, 10) + ext
      : originalName;
    const existing = names.get(assetName.toLowerCase());
    if (existing && existing !== digest) assetName = digest.slice(0, 12) + '-' + assetName;
    assert(!names.has(assetName.toLowerCase()) || names.get(assetName.toLowerCase()) === digest, 'Release filename collision');
    names.set(assetName.toLowerCase(), digest);
    assert(bytes < 2 * 1024 ** 3, 'Release asset exceeds GitHub limit: ' + relative);
    files.push({ path: relative, assetName, bytes, sha256: digest,
      url: `https://github.com/${config.repository}/releases/download/${config.tag}/${encodeURIComponent(assetName)}` });
  }
  return { schemaVersion: 1, ...config, sourceBytes, pagesBytesBeforeMetadata: sourceBytes - files.reduce((s, f) => s + f.bytes, 0), files };
}
export function rewriteAssetUrl(value, pagePath, plan) {
  let parsed;
  try { parsed = new URL(value.replaceAll('&amp;', '&'), 'https://ebook.invalid' + plan.basePath + '/' + pagePath); }
  catch { return value; }
  if (!['ebook.invalid', 'asvan-o.github.io'].includes(parsed.hostname)) return value;
  let decoded;
  try { decoded = decodeURIComponent(parsed.pathname); } catch { return value; }
  const prefix = plan.basePath + '/';
  if (!decoded.startsWith(prefix)) return value;
  const match = plan.files.find(file => file.path === decoded.slice(prefix.length));
  return match ? match.url + parsed.search + parsed.hash : value;
}
export function rewriteText(source, relative, plan) {
  // First replace absolute URLs, including JSON-escaped and percent-encoded paths.
  for (const file of plan.files) {
    const local = plan.basePath + '/' + file.path;
    const encoded = plan.basePath + '/' + file.path.split('/').map(encodeURIComponent).join('/');
    for (const value of new Set([local, encoded, encodeURI(local)])) {
      source = source.replaceAll('https://asvan-o.github.io' + value, file.url);
      source = source.replaceAll(value.replaceAll('/', '\\/'), file.url.replaceAll('/', '\\/'));
      source = source.replaceAll(value, file.url);
    }
  }
  if (relative.endsWith('.html')) {
    source = source.replace(/\b(href|src|poster|data-full|data-image|data-src)=(['"])(.*?)\2/g,
      (whole, key, quote, value) => `${key}=${quote}${rewriteAssetUrl(value, relative, plan)}${quote}`);
    if (relative === 'gwangju/lessons/04/index.html') {
      // Keep the approved source intact; let long technical words wrap on phones.
      source = source.replace('</head>', '<style data-pages-mobile-wrap>@media(max-width:600px){#main-content li{overflow-wrap:anywhere}}</style></head>');
    }
  }
  return source;
}
export async function preparePages({ root, output, manifest, config = defaultConfig, planOnly = false }) {
  assert.equal(path.basename(root), 'site');
  assert.equal(path.dirname(root), path.dirname(output));
  assert.equal(path.basename(output), 'pages');
  const plan = await makeReleasePlan(root, config);
  if (planOnly) {
    await mkdir(path.dirname(manifest), { recursive: true });
    await writeFile(manifest, JSON.stringify(plan, null, 2) + '\n');
    return plan;
  }
  const expected = JSON.parse(await readFile(manifest, 'utf8'));
  for (const key of ['schemaVersion', 'repository', 'tag', 'basePath', 'maximumPagesBytes', 'files']) {
    assert.deepEqual(plan[key], expected[key], 'Release manifest is stale: ' + key);
  }
  const moved = new Set(plan.files.map(file => file.path));
  // Both absolute paths are asserted above, and only generated dist/pages is replaced.
  await rm(output, { recursive: true, force: true });
  for (const file of await listFiles(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (moved.has(relative)) continue;
    const target = path.join(output, relative);
    await mkdir(path.dirname(target), { recursive: true });
    if (/\.(?:html|js|mjs|css|json|svg)$/i.test(relative)) {
      await writeFile(target, rewriteText(await readFile(file, 'utf8'), relative, plan));
    } else await cp(file, target);
  }
  // Old bookmarks still reach a browser redirect; live ebook buttons use direct URLs.
  for (const file of plan.files) {
    const target = path.join(output, file.path, 'index.html');
    await mkdir(path.dirname(target), { recursive: true });
    const url = file.url.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    await writeFile(target, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${url}"><title>실습자료 다운로드</title></head><body><a href="${url}">실습자료 다운로드</a></body></html>`);
  }
  await writeFile(path.join(output, 'release-assets.json'), JSON.stringify(plan, null, 2) + '\n');
  let pagesBytes = 0;
  for (const file of await listFiles(output)) pagesBytes += (await stat(file)).size;
  assert(pagesBytes < config.maximumPagesBytes, `Pages exceeds safe size: ${pagesBytes}`);
  assert.equal((await listFiles(path.join(output, 'daejeon/downloads/daejeon/pdf'))).filter(f => f.endsWith('.pdf')).length, 14);
  const report = { passed: true, pagesBytes, releasePaths: plan.files.length, releaseFiles: new Set(plan.files.map(f => f.assetName)).size, daejeonPdfs: 14 };
  await mkdir(path.join(path.dirname(root), '..', 'tmp'), { recursive: true });
  await writeFile(path.join(path.dirname(root), '..', 'tmp/pages-release-verification.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cwd = process.cwd();
  const result = await preparePages({ root: path.join(cwd, 'dist/site'), output: path.join(cwd, 'dist/pages'),
    manifest: path.join(cwd, 'data/deployment/release-assets.json'), planOnly: process.argv.includes('--plan') });
  console.log(JSON.stringify(process.argv.includes('--plan') ? { files: result.files.length, pagesBytes: result.pagesBytesBeforeMetadata } : result, null, 2));
}
