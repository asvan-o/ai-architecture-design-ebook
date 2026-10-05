import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { repositoryRoot, courseOutput } from './course-registry.mjs';

// Immutable source of published artifacts; this module never renders a PDF.
const approvedSource = 'https://asvan-o.github.io/ai-architecture-design-ebook/downloads/';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
export async function reuseApprovedPdfs(profile, outputDirectory) {
  const { course, pdfs } = profile;
  const output = path.resolve(outputDirectory);
  assert(['student', 'instructor', 'pdf-review'].some((mode) => output === courseOutput(course.courseId, mode)), 'PDF output must belong to the selected course and mode');
  if (pdfs.policy === 'not-issued') return;
  assert.equal(pdfs.policy, 'preserve-approved-artifact');
  const manifest = pdfs.approvedManifest;
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
      const response = await fetch(new URL(file.fileName, approvedSource), { signal: AbortSignal.timeout(120000) });
      assert(response.ok, `Approved PDF unavailable: ${file.fileName} (HTTP ${response.status})`);
      bytes = Buffer.from(await response.arrayBuffer());
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
