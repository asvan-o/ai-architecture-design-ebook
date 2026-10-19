import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const drawingDemoRoute='practice/DJ-L02/automation/B/demo/index.html';
const houseWalkthroughRoute='downloads/daejeon/lesson-09/House_B_Walkthrough.html';
const automationAllowed=new Set([
  ...['A_FIRST_REQUEST.txt','A_STRUCTURE_CHECKLIST.txt','A_IMPLEMENTATION_APPROVAL.txt','A_README.txt','A_EXPECTED_RESULTS.csv','A_VERIFICATION_SUMMARY.txt','A_KNOWN_LIMITS.txt','A_UI_DESKTOP.png','A_UI_MOBILE.png','A_UI_PENDING.png','A_UI_AUTOMATIC.png'].map(file=>'practice/DJ-L02/automation/A/'+file),
  ...['A_INPUT_UI_DESKTOP.png','A_INPUT_UI_MOBILE.png','A_INPUT_UI_PENDING.png','A_INPUT_UI_AUTOMATIC.png'].map(file=>'practice/DJ-L02/automation/A/'+file),
  ...['DRAWING_QUICK_CHECK_PROGRAM.zip','DRAWING_QUICK_CHECK_TEST.zip','DRAWING_QUICK_CHECK_README.txt','DRAWING_QUICK_CHECK_FIRST_REQUEST.txt','DRAWING_QUICK_CHECK_IMPLEMENTATION_APPROVAL.txt','DRAWING_QUICK_CHECK_SAMPLE_RESULTS.csv','sample-manifest.json','DRAWING_QUICK_CHECK_DESKTOP.png','DRAWING_QUICK_CHECK_MOBILE.png'].map(file=>'practice/DJ-L02/automation/B/'+file),
  ...['index.html','app.js','rules.js','style.css','sample-data.js','sample-manifest.json','README.txt'].map(file=>'practice/DJ-L02/automation/B/demo/'+file),
]);

// Review pages are separate from approved curriculum/release selection.
export function verifyDraftOutput(course, output, { localReviewAssets = false } = {}) {
  const files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
  const all = files(output);
  const html = all.filter((file) => file.endsWith('.html')).map((file) => path.relative(output, file).replaceAll('\\', '/')).sort();
  const expected = course.reviewDraft ? ['course-overview/index.html', 'index.html', ...course.reviewDraft.lessons.map((lesson)=>`lessons/${lesson.id}/index.html`)].sort() : ['index.html'];
  if(localReviewAssets&&course.courseId==='daejeon-2026') expected.push(drawingDemoRoute,'practice/DJ-L02-B/demo/index.html',houseWalkthroughRoute);
  expected.sort();
  assert.deepEqual(html, expected, `${course.courseId}: unapproved draft route`);
  if (localReviewAssets) {
    assert(course.courseId === 'daejeon-2026' && course.contentStatus === 'design-pending', 'Local review asset scope');
    const manifest = JSON.parse(readFileSync(path.join(output,'review-assets.json'),'utf8'));
    assert.equal(manifest.localOnly, true);
    assert.equal(manifest.pdfsIssued, false);
    const practiceFiles = all.map((file)=>path.relative(output,file).replaceAll('\\','/')).filter((file)=>file.startsWith('practice/') || /^(?:images|downloads)\/daejeon\/(?:lesson-(?:0[789]|1[0-3])|pdf)\//.test(file)).sort();
    assert.deepEqual(practiceFiles, manifest.files.map((file)=>file.path).sort(), 'Unexpected review asset');
    for (const file of manifest.files) {
      if(/^(?:images|downloads)\/daejeon\/(?:lesson-(?:0[789]|1[0-3])|pdf)\//.test(file.path)) {
        assert(!file.path.split('/').includes('..'),'Invalid Lesson07 local path');
        assert.equal(createHash('sha256').update(readFileSync(path.join(output,file.path))).digest('hex'),file.sha256);
        continue;
      }
      if(automationAllowed.has(file.path)) {
        assert.equal(createHash('sha256').update(readFileSync(path.join(output,file.path))).digest('hex'),file.sha256);
        continue;
      }
      assert(/^practice\/gwangju-lesson02-reuse\/flower-cafe-sample\/00-empty-space\.png$/.test(file.path) || /^practice\/(?:DJ-CF-01|DJ-CF-02|DJ-L02|DJ-L02-B|DJ-ML-01|DJ-L03|DJ-L04|DJ-L05|DJ-L06)\//.test(file.path) || /^practice\/DJ-L02\/file-sorter\/DJ-L02_(?:FILE_SORTER_PROGRAM\.zip|SORT_TEST\.zip|FILE_SORTER_README\.txt|FILE_SORTER_MANIFEST\.json)$/.test(file.path) || /^practice\/DJ-CF-0[12]\/DJ-CF-0[12]_[a-zA-Z0-9.-]+$/.test(file.path) || /^practice\/GW-L02\/(?:0[1-4]-(?:original-prompt|original-result|revision-prompt|revised-result)\.(?:txt|jpeg)|base-0[1-5]\.jpeg)$/.test(file.path) || /^practice\/DJ-L02\/DJ-L02_(?:01_lighting-temperature-guide|02_auto-sort-flow|03_auto-sort-rules-guide)\.png$/.test(file.path) || /^practice\/DJ-ML-01\/DJ-ML-01_(?:BASE|MATERIAL_REFERENCE|LIGHTING_REFERENCE)\.png$/.test(file.path) || /^practice\/DJ-ML-01\/BEFORE-BASE\/DJ-ML-01_BEFORE_BASE_0[1-5]_(?:reception|meeting-room|consultation-lounge|work-break-lounge|waiting-area)\.png$/.test(file.path) || /^practice\/DJ-ML-01\/materials\/m-(?:0[1-9]|[12][0-9]|3[0-3])-[a-z0-9-]+\.png$/.test(file.path));
      assert.equal(createHash('sha256').update(readFileSync(path.join(output,file.path))).digest('hex'), file.sha256);
    }
    assert(all.every((file)=>! /\.(?:pdf|zip|png|jpe?g|webp|avif|svg)$/i.test(file) || /^(?:practice\/|(?:images|downloads)\/daejeon\/(?:lesson-(?:0[789]|1[0-3])|pdf)\/)/.test(path.relative(output,file).replaceAll('\\','/'))), 'Binary outside local review allowlist');
  } else {
    assert(!readdirSync(output).includes('practice'), `${course.courseId}: exercise package outside isolated review`);
    assert(all.every((file) => !/\.(?:pdf|zip|png|jpe?g|webp|avif)$/i.test(file)), `${course.courseId}: review must not inherit exercise assets or issue PDFs`);
  }
  assert(localReviewAssets || !readdirSync(output).includes('downloads'), `${course.courseId}: draft downloads forbidden`);
  if(localReviewAssets){for(const folder of ['images','downloads']){const dir=path.join(output,folder);if(all.some(file=>file.startsWith(dir+path.sep)))assert(files(dir).every(file=>path.relative(dir,file).replaceAll('\\','/').match(/^daejeon\/(?:lesson-(?:0[789]|1[0-3])|pdf)\//)),'Unexpected review '+folder);}}
  for (const route of html) {
    const source = readFileSync(path.join(output, route), 'utf8');
    if(localReviewAssets&&(route===drawingDemoRoute||route==='practice/DJ-L02-B/demo/index.html'||route===houseWalkthroughRoute)) {
      assert(source.includes('noindex'), 'Local interactive samples must remain noindex');
      continue;
    }
    assert(source.includes('noindex') && source.includes('data-course-status="design-pending"'), `${course.courseId}: draft status/noindex missing`);
    if (route !== 'index.html') assert(source.includes('data-review-status="instructor-review"'), `${course.courseId}: review status missing`);
  }
  return html;
}
