import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Review pages are separate from approved curriculum/release selection.
export function verifyDraftOutput(course, output, { localReviewAssets = false } = {}) {
  const files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
  const all = files(output);
  const html = all.filter((file) => file.endsWith('.html')).map((file) => path.relative(output, file).replaceAll('\\', '/')).sort();
  const expected = course.reviewDraft ? ['course-overview/index.html', 'index.html', 'lessons/01/index.html'] : ['index.html'];
  assert.deepEqual(html, expected, `${course.courseId}: unapproved draft route`);
  if (localReviewAssets) {
    assert(course.courseId === 'daejeon-2026' && course.contentStatus === 'design-pending', 'Local review asset scope');
    const manifest = JSON.parse(readFileSync(path.join(output,'review-assets.json'),'utf8'));
    assert.equal(manifest.localOnly, true);
    assert.equal(manifest.pdfsIssued, false);
    const practiceFiles = all.map((file)=>path.relative(output,file).replaceAll('\\','/')).filter((file)=>file.startsWith('practice/')).sort();
    assert.deepEqual(practiceFiles, manifest.files.map((file)=>file.path).sort(), 'Unexpected review asset');
    for (const file of manifest.files) {
      assert(/^practice\/DJ-CF-0[12]\/DJ-CF-0[12]_[a-zA-Z0-9.-]+$/.test(file.path) || /^practice\/GW-L02\/(?:0[1-4]-(?:original-prompt|original-result|revision-prompt|revised-result)\.(?:txt|jpeg)|base-0[1-5]\.jpeg)$/.test(file.path));
      assert.equal(createHash('sha256').update(readFileSync(path.join(output,file.path))).digest('hex'), file.sha256);
    }
    assert(all.every((file)=>! /\.(?:pdf|zip|png|jpe?g|webp|avif|svg)$/i.test(file) || path.relative(output,file).replaceAll('\\','/').startsWith('practice/')), 'Binary outside local review allowlist');
  } else {
    assert(!readdirSync(output).includes('practice'), `${course.courseId}: exercise package outside isolated review`);
    assert(all.every((file) => !/\.(?:pdf|zip|png|jpe?g|webp|avif)$/i.test(file)), `${course.courseId}: review must not inherit exercise assets or issue PDFs`);
  }
  assert(!readdirSync(output).includes('downloads'), `${course.courseId}: draft downloads forbidden`);
  for (const route of html) {
    const source = readFileSync(path.join(output, route), 'utf8');
    assert(source.includes('noindex') && source.includes('data-course-status="design-pending"'), `${course.courseId}: draft status/noindex missing`);
    if (route !== 'index.html') assert(source.includes('data-review-status="instructor-review"'), `${course.courseId}: review status missing`);
  }
  return html;
}
