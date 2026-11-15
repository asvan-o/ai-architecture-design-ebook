import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {getLesson0910Assets, houseWalkthroughBlendPath} from '../daejeon-lesson0910-assets.mjs';
import {shouldUseRelease} from '../pages-release-assets.mjs';
import {workbookAssetPath} from '../workbook-public-paths.mjs';

const read = file => fs.readFileSync(file, 'utf8');
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const data = JSON.parse(read('src/draft/content/lesson09-blender-walkthrough.json'));
const folder = 'public/downloads/daejeon/lesson-09/';

test('The verified 160-second Blender file and playback guide reach the public asset inventory', () => {
  const manifest = JSON.parse(read(folder + 'manifest.json'));
  const assets = getLesson0910Assets();
  for (const filename of [data.filename, data.readmeFilename]) {
    const outputPath = 'downloads/daejeon/lesson-09/' + filename;
    const record = manifest.files.find(file => file.outputPath === outputPath);
    assert(record, filename);
    assert.equal(record.bytes, fs.statSync(folder + filename).size);
    assert.equal(record.sha256, digest(folder + filename));
    assert(assets.some(file => file.outputPath === outputPath && file.sha256 === record.sha256));
    assert.equal(workbookAssetPath(outputPath), 'downloads/lesson-09/' + filename);
    assert.equal(shouldUseRelease('workbook/' + workbookAssetPath(outputPath), record.bytes), false);
  }
  // This hash pins the .blend whose 3,840 camera samples, cuts, packed textures,
  // and original-object preservation were checked in Blender before publication.
  assert.equal(data.sha256, 'c167461173886bddaec283845d997f942f1789921aa9310b6787fd7c09cc2a97');
  assert.equal(digest(folder + data.filename), data.sha256);
  assert.equal(fs.statSync(folder + data.filename).size, data.bytes);
  assert.deepEqual(assets.filter(file => file.outputPath.endsWith('.blend')).map(file => file.outputPath), [houseWalkthroughBlendPath]);
});

test('Adding the animation preserves the original house package, exports and web viewer byte-for-byte', () => {
  const originals = JSON.parse(read('scripts/tests/fixtures/approved-l09-walkthrough-originals.json'));
  for (const [filename, expected] of Object.entries(originals)) assert.equal(digest(folder + filename), expected, filename);
});

test('Playback instructions describe the saved animation and preserve the existing lesson duration', () => {
  assert.equal((data.frameEnd - data.frameStart + 1) / data.fps, 160);
  assert.deepEqual(data.cuts, [{seconds: 60, frame: 1441}, {seconds: 126, frame: 3025}]);
  assert.equal((data.frameEnd - data.finalHoldStartFrame + 1) / data.fps, 4);
  const guide = read(folder + data.readmeFilename);
  for (const phrase of [data.filename, data.camera, data.collection, data.testedBlenderVersion, 'File → Open', 'Space', 'Shift + ←', 'Numpad 0', 'View → Cameras → Active Camera', '키프레임', '확인용 경로선', '60초와 126초']) assert(guide.includes(phrase), phrase);
  assert(!/C:\\Users|C:\/Users|아직 추가하지|로컬 산출물/.test(guide));
  const lesson = JSON.parse(read('src/draft/content/lesson0910-source.json')).lessons['09'];
  assert.equal(lesson.sections.length, 12);
  assert.equal(lesson.sections.reduce((sum, section) => sum + section.minutes, 0), 150);
  assert(lesson.sections.find(section => section.id === 'l09-moving-3').links.some(link => link.download === 'House_B_Walkthrough.html'));
  const component = read('src/draft/components/Lesson09BlenderWalkthrough.astro');
  assert(component.includes('download={data.filename}'));
  assert(component.includes('l09-blender-walkthrough-download'));
  const parent = read('src/draft/components/DaejeonModelingLesson.astro');
  assert(parent.includes('<Lesson09BlenderWalkthrough />'));
  assert(parent.includes('href="#l09-blender-walkthrough-download"'));
});
