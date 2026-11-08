import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { repositoryRoot, courseOutput } from './course-registry.mjs';

// Immutable source of published artifacts; this module never renders a PDF.
const approvedSource = 'https://asvan-o.github.io/ai-architecture-design-ebook/downloads/';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

export function resolveApprovedPdfSource(file, releaseFiles = []) {
  const entry = releaseFiles.find(item => item.path === 'gwangju/downloads/' + file.fileName || item.path === 'downloads/' + file.fileName);
  if (!entry) return new URL(file.fileName, approvedSource).href;
  assert.equal(entry.sha256, file.sha256, 'Release PDF must retain its approval hash');
  assert.equal(entry.bytes, file.sizeBytes, 'Release PDF must retain its approval size');
  assert(entry.url.startsWith('https://github.com/asvan-o/ai-architecture-design-ebook/releases/download/'), 'Unexpected approved PDF host');
  return entry.url;
}

const networkFailure = error => error?.name === 'AbortError' || error?.name === 'TimeoutError'
  || /^(?:ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EHOSTUNREACH|ENETUNREACH|UND_ERR_)/.test(error?.cause?.code || error?.code || '')
  || error?.name === 'TypeError' && /fetch failed|failed to fetch|network|terminated/i.test(error.message || '');

/** Download-only fallback. The injected fetch and instance cache keep this helper
 * testable without changing an approved artifact, URL, manifest or local cache. */
export function createApprovedPdfDownloader(releasePlan, { fetchImpl = fetch, token = process.env.GH_TOKEN, timeoutMs = 120000 } = {}) {
  let preferReleaseApi = false, catalog;
  const headers = accept => ({
    Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'ai-architecture-design-ebook-approved-pdfs',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  const request = (url, accept) => fetchImpl(url, {
    signal: AbortSignal.timeout(timeoutMs), ...(accept ? { headers: headers(accept) } : {}), redirect: 'follow',
  });
  const approvedBytes = (bytes, file) => {
    assert.equal(digest(bytes), file.sha256, `Published PDF hash changed: ${file.fileName}`);
    assert.equal(bytes.length, file.sizeBytes, `Published PDF size changed: ${file.fileName}`);
    return bytes;
  };
  async function releaseAssets() {
    if (!catalog) catalog = (async () => {
      assert(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(releasePlan.repository), 'Invalid approved Release repository');
      assert(typeof releasePlan.tag === 'string' && releasePlan.tag.length > 0, 'Missing approved Release tag');
      const api = `https://api.github.com/repos/${releasePlan.repository}/releases`;
      const response = await request(`${api}/tags/${encodeURIComponent(releasePlan.tag)}`, 'application/vnd.github+json');
      assert(response.ok, `Approved PDF Release metadata unavailable (HTTP ${response.status})`);
      const release = await response.json();
      assert.equal(release.tag_name, releasePlan.tag, 'Approved PDF Release tag changed');
      assert.equal(release.draft, false, 'Approved PDF Release must be published, not a draft');
      assert(Number.isSafeInteger(release.id) && release.id > 0, 'Missing approved Release ID');
      const assetsUrl = `${api}/${release.id}/assets`;
      assert.equal(release.assets_url, assetsUrl, 'Unexpected approved Release asset-list URL');
      const assets = [];
      for (let page = 1; page <= 1000; page++) {
        const response = await request(`${assetsUrl}?per_page=100&page=${page}`, 'application/vnd.github+json');
        assert(response.ok, `Approved PDF asset metadata unavailable (HTTP ${response.status})`);
        const batch = await response.json();
        assert(Array.isArray(batch) && batch.length <= 100, 'Invalid approved Release asset page');
        assets.push(...batch);
        if (batch.length < 100) return assets;
      }
      throw new Error('Approved PDF Release asset pagination exceeded its limit');
    })();
    return catalog;
  }
  async function fromApi(file, entry, originalUrl) {
    const expectedUrl = `https://github.com/${releasePlan.repository}/releases/download/${encodeURIComponent(releasePlan.tag)}/${encodeURIComponent(entry.assetName)}`;
    assert.equal(originalUrl, expectedUrl, 'Approved PDF URL must match its Release repository, tag and asset name');
    const matches = (await releaseAssets()).filter(asset => asset.name === entry.assetName);
    assert.equal(matches.length, 1, `Approved PDF exact Release asset missing or duplicated: ${file.fileName}`);
    const asset = matches[0];
    assert.equal(asset.state, 'uploaded', 'Approved PDF Release asset is not uploaded');
    assert.equal(asset.browser_download_url, originalUrl, 'Approved PDF Release browser URL changed');
    assert.equal(asset.size, file.sizeBytes, 'Approved PDF Release asset size changed');
    assert.equal(asset.digest, `sha256:${file.sha256}`, 'Approved PDF Release asset digest changed');
    assert(Number.isSafeInteger(asset.id) && asset.id > 0, 'Missing approved PDF Release asset ID');
    const assetUrl = `https://api.github.com/repos/${releasePlan.repository}/releases/assets/${asset.id}`;
    assert.equal(asset.url, assetUrl, 'Unexpected approved PDF asset API URL');
    const response = await request(assetUrl, 'application/octet-stream');
    assert(response.ok, `Approved PDF API download unavailable: ${file.fileName} (HTTP ${response.status})`);
    return approvedBytes(Buffer.from(await response.arrayBuffer()), file);
  }
  return async file => {
    const originalUrl = resolveApprovedPdfSource(file, releasePlan.files);
    const entry = releasePlan.files.find(item => item.path === 'gwangju/downloads/' + file.fileName || item.path === 'downloads/' + file.fileName);
    if (preferReleaseApi && entry) return fromApi(file, entry, originalUrl);
    let response, bytes;
    try {
      response = await request(originalUrl);
      if (response.ok) bytes = Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (!entry || !networkFailure(error)) throw error;
      preferReleaseApi = true;
      return fromApi(file, entry, originalUrl);
    }
    if (!response.ok && entry && response.status >= 500 && response.status <= 599) {
      preferReleaseApi = true;
      return fromApi(file, entry, originalUrl);
    }
    assert(response.ok, `Approved PDF unavailable: ${file.fileName} (HTTP ${response.status})`);
    return approvedBytes(bytes, file);
  };
}

export async function reuseApprovedPdfs(profile, outputDirectory) {
  const { course, pdfs } = profile;
  const output = path.resolve(outputDirectory);
  assert(['student', 'instructor', 'pdf-review'].some((mode) => output === courseOutput(course.courseId, mode)), 'PDF output must belong to the selected course and mode');
  if (pdfs.policy === 'not-issued') return;
  assert.equal(pdfs.policy, 'preserve-approved-artifact');
  const manifest = pdfs.approvedManifest;
  const releasePlan = JSON.parse(await readFile(path.join(repositoryRoot, 'data/deployment/release-assets.json'), 'utf8'));
  const downloadApprovedPdf = createApprovedPdfDownloader(releasePlan);
  const cache = path.join(repositoryRoot, 'tmp', 'approved-pdfs', course.courseId);
  const downloads = path.join(output, 'downloads');
  await mkdir(cache, { recursive: true });
  await mkdir(downloads, { recursive: true });
  for (const file of manifest.files) {
    assert(/^[a-z0-9_-]+\.pdf$/.test(file.fileName), 'Unsafe PDF filename');
    assert(/^[a-f0-9]{64}$/.test(file.sha256), 'Missing approved PDF hash');
    const cachedFile = path.join(cache, file.fileName);
    let bytes;
    if (existsSync(cachedFile)) {
      bytes = await readFile(cachedFile);
    } else {
      bytes = await downloadApprovedPdf(file);
      assert.equal(digest(bytes), file.sha256, `Published PDF hash changed: ${file.fileName}`);
      assert.equal(bytes.length, file.sizeBytes, `Published PDF size changed: ${file.fileName}`);
      await writeFile(cachedFile, bytes, { flag: 'wx' });
    }
    assert.equal(digest(bytes), file.sha256, `Cached PDF differs from approval: ${file.fileName}`);
    assert.equal(bytes.length, file.sizeBytes);
    await copyFile(cachedFile, path.join(downloads, file.fileName));
  }
  await writeFile(path.join(downloads, 'pdf-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(downloads, 'course-pdf-release.json'), `${JSON.stringify({
    schemaVersion: 1, courseId: course.courseId, releaseVersion: pdfs.releaseVersion,
    policy: pdfs.policy, generatedAt: manifest.generatedAt, sourceGitSha: manifest.sourceGitSha, files: manifest.files,
  }, null, 2)}\n`);
  console.log(`[PDF reuse] ${course.courseId}: ${manifest.files.length} approved artifacts, hashes unchanged; no PDF generation`);
}
