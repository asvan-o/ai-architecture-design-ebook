import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const source = readJson('src/draft/content/lesson0910-source.json');
const assets = readJson('src/draft/content/lesson0910-assets.json');
const pairsBySection = {
  'l09-core-geometry': ['1f_top', '1f_iso', '1f_eye'],
  'l09-step2-stack': ['2f_top', '2f_iso'],
  'l09-facade-five': ['3f_hero', '3f_iso', '3f_rooftop'],
};

test('Lesson09 compares eight matching Astra and Argon viewpoints in the three existing steps', () => {
  assert.equal(source.lessons['09'].sections.length, 12);
  assert.equal(source.lessons['09'].sections.reduce((sum, section) => sum + section.minutes, 0), 150);
  for (const [id, stems] of Object.entries(pairsBySection)) {
    const section = source.lessons['09'].sections.find(item => item.id === id);
    assert(section, id);
    assert.deepEqual(section.imageRows, stems.map(stem => ['house_astra_' + stem, 'house_argon_' + stem]));
    assert(section.tables.some(table => table.headers.includes('Codex (Astra)') && table.headers.includes('Argon (Antigravity)')), id);
    for (const stem of stems) {
      for (const version of ['astra', 'argon']) {
        const key = `house_${version}_${stem}`;
        const asset = assets.find(item => item.key === key);
        assert(asset, key);
        assert.equal(asset.lesson, '09');
        assert.equal(asset.kind, 'render');
        assert.equal(asset.outputPath, `images/daejeon/lesson-09/${key}.png`);
        assert.equal(asset.width, 1920);
        assert.equal(asset.height, 1200);
        assert(asset.title.startsWith(version === 'astra' ? 'Codex (Astra)' : 'Argon (Antigravity)'), key);
        assert(fs.existsSync('public/' + asset.outputPath), key);
      }
    }
  }
  assert.equal(assets.filter(item => item.key.startsWith('house_argon_')).length, 8);
});

test('Both versions expose passing geometry and export validation records in the download inventory', () => {
  const manifest = readJson('public/downloads/daejeon/lesson-09/manifest.json');
  for (const name of ['house-argon-geometry-validation.json', 'house-argon-export-validation.json']) {
    assert(manifest.files.some(item => item.outputPath === `downloads/daejeon/lesson-09/${name}`), name);
    const result = readJson('public/downloads/daejeon/lesson-09/' + name);
    assert.equal(result.status, 'PASS', name);
    assert(result.checks.length > 0, name);
    assert(result.checks.every(check => check.pass === true), name);
  }
  const astra = readJson('public/downloads/daejeon/lesson-09/house-export-validation.json');
  assert.equal(astra.status, 'PASS');
  assert(astra.checks.every(check => check.pass === true));
});
