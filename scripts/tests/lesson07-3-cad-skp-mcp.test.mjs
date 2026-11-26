import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { repositoryRoot } from '../course-registry.mjs';

async function loadTsModule(relPath) {
  const src = fs.readFileSync(path.join(repositoryRoot, relPath), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

test('Lesson 07-3 puts All-in-One checkbox builder first, manual CAD/SketchUp guides below, and respects wording rules', async () => {
  const pageSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/pages/lessons/07-3.astro'), 'utf8');
  const dataSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/daejeon-lesson07-3-cad-skp-mcp.ts'), 'utf8');
  const installerSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/daejeon-lesson07-3-installer.ts'), 'utf8');
  const navSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/review-navigation.ts'), 'utf8');
  const combinedSrc = [pageSrc, dataSrc, installerSrc].join('\n');

  assert(navSrc.includes("'07-3'"), 'review-navigation.ts must include 07-3');
  assert(pageSrc.includes('lessonId="07-3"'), '07-3.astro must declare lessonId="07-3"');
  assert(!pageSrc.includes('<ReviewPrompt'), '07-3.astro must not alter global ReviewPrompt count (104)');

  const data = await loadTsModule('src/draft/content/daejeon-lesson07-3-cad-skp-mcp.ts');
  const sectionIds = data.lesson073Sections.map((s) => s.id);
  assert.deepEqual(sectionIds, [
    'l073-all-in-one-setup',
    'l073-concept-and-trials',
    'l073-common-uv',
    'l073-autocad-manual',
    'l073-sketchup-manual',
    'l073-verify-and-faq',
  ]);

  for (const needle of [
    'autocad-mcp-pro[com]',
    'sketchup-mcp',
    'su_mcp.rb',
    'su_mcp\\\\main.rb',
    '확장(X)',
    'Start Server',
    '9876',
    'netstat -ano | findstr 9876',
    '상용 프로그램',
    '이중 중첩',
  ]) {
    assert(combinedSrc.includes(needle), `Missing required 07-3 content: ${needle}`);
  }

  const forbidden = /강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
  const schedule = /\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
  for (const [label, src] of [
    ['daejeon-lesson07-3-cad-skp-mcp.ts', dataSrc],
    ['daejeon-lesson07-3-installer.ts', installerSrc],
    ['07-3.astro', pageSrc],
  ]) {
    assert(!forbidden.test(src), `${label} contains forbidden wording: ${src.match(forbidden)?.[0]}`);
    assert(!schedule.test(src), `${label} contains schedule wording: ${src.match(schedule)?.[0]}`);
  }
});

test('Lesson 07-3 All-in-One PowerShell Builder emits soft warnings and passes PowerShell AST check', async () => {
  const installer = await loadTsModule('src/draft/content/daejeon-lesson07-3-installer.ts');

  const fullSel = installer.defaultCadSkpSelection;
  assert.deepEqual(installer.evaluateCadSkpWarnings(fullSel), []);
  const fullScript = installer.buildCadSkpAllInOnePowerShell(fullSel);
  assert(fullScript.includes('autocad-mcp-pro[com]'));
  assert(fullScript.includes('sketchup-mcp'));
  assert(fullScript.includes('Find-AutoCAD'));
  assert(fullScript.includes('Find-SketchUpProfiles'));

  const skpOnlyNoPlugin = {
    ...fullSel,
    pythonUv: false,
    autocadMcp: false,
    sketchupPlugin: false,
    sketchupMcp: true,
    codexConfig: false,
    antigravityConfig: false,
    claudeConfig: false,
    cursorConfig: false,
  };
  const warnIds = installer.evaluateCadSkpWarnings(skpOnlyNoPlugin).map((w) => w.id);
  assert(warnIds.includes('missing-uv'));
  assert(warnIds.includes('sketchup-missing-plugin'));
  assert(warnIds.includes('mcp-without-client'));

  const cadEzdxfScript = installer.buildCadSkpAllInOnePowerShell({
    ...fullSel,
    sketchupPlugin: false,
    sketchupMcp: false,
    autocadBackend: 'ezdxf',
    existingPolicy: 'update',
  });
  assert(cadEzdxfScript.includes('$CadBackend    = "ezdxf"'));

  if (process.platform === 'win32') {
    const tmpFile = path.join(os.tmpdir(), `l073-all-in-one-test-${process.pid}.ps1`);
    try {
      for (const script of [fullScript, cadEzdxfScript]) {
        fs.writeFileSync(tmpFile, '\uFEFF' + script, 'utf8');
        const out = execFileSync(
          'powershell.exe',
          [
            '-NoProfile',
            '-Command',
            `$t=$null;$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile('${tmpFile}',[ref]$t,[ref]$e);if($e.Count -gt 0){$e|Out-String;exit 1}else{'OK'}`,
          ],
          { encoding: 'utf8' },
        ).trim();
        assert.equal(out, 'OK');
      }
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }
});
