import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { repositoryRoot } from '../course-registry.mjs';
import {
  l062WorkflowSvg,
  l062SkillCadPreview,
  l062SkillConceptPlan3d,
  l062SkillConceptSet,
  l062SkillGridlinePlan,
  l062SampleOfficeDxf,
  l062SampleSiteBrief,
  lesson062RenewalAssets,
} from '../daejeon-lesson06-2-assets.mjs';

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

async function loadTsModule(relPath) {
  const src = fs.readFileSync(path.join(repositoryRoot, relPath), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

test('Lesson 07-2 renewal visual and sample assets exist and match manifest SHA-256', () => {
  assert.equal(lesson062RenewalAssets.length, 8);
  for (const asset of lesson062RenewalAssets) {
    assert(fs.existsSync(asset.source), `Missing asset: ${asset.source}`);
    const bytes = fs.readFileSync(asset.source);
    assert.equal(bytes.length, asset.bytes, `Byte size mismatch: ${asset.file}`);
    assert.equal(sha(bytes), asset.sha256, `SHA mismatch: ${asset.file}`);
    assert(asset.outputPath.startsWith('practice/DJ-L06/renewal-mcp/'));
  }
  assert(l062WorkflowSvg.bytes > 3000);
  assert(l062SkillCadPreview.bytes > 10000);
  assert(l062SkillConceptPlan3d.bytes > 100000);
  assert(l062SkillConceptSet.bytes > 100000);
  assert(l062SkillGridlinePlan.bytes > 50000);
  assert(l062SampleOfficeDxf.bytes > 20000);
  assert(l062SampleSiteBrief.bytes > 500);
});

test('Lesson 07-2 renewal orders Concept -> All-in-One Setup -> MCP Scenarios -> Skills and respects wording rules', async () => {
  const pageSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/pages/lessons/07-2.astro'), 'utf8');
  const dataSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/daejeon-lesson06-2-mcp.ts'), 'utf8');
  const installerSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/daejeon-all-in-one-installer.ts'), 'utf8');
  const navSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/review-navigation.ts'), 'utf8');
  const combinedSrc = [pageSrc, dataSrc, installerSrc].join('\n');

  assert(navSrc.includes("'07-2'"), 'review-navigation.ts must include 07-2');
  assert(pageSrc.includes('lessonId="07-2"'), '07-2.astro must declare lessonId="07-2"');
  assert(!pageSrc.includes('<ReviewPrompt'), '07-2.astro must not alter global ReviewPrompt count (104)');

  const mcpData = await loadTsModule('src/draft/content/daejeon-lesson06-2-mcp.ts');
  const sectionIds = mcpData.lesson062Sections.map((s) => s.id);
  assert.deepEqual(sectionIds, [
    'l062-video-principle',
    'l062-video-prompts',
    'l062-3dgs-summary',
    'l062-arch-software',
    'l062-all-in-one-setup',
    'l062-mcp-scenarios',
    'l062-codex-skills',
  ]);

  for (const needle of [
    'aiblueprint-mcp',
    'freecad-mcp',
    'blender-mcp',
    'Part Design',
    'Start RPC Server',
    'Connect to MCP server',
    'v1-1\\Mod',
    'execute_code_headless',
    '--freecadcmd',
    'Part::Feature',
    'blender-3.6.23-windows-x64.zip',
    'cad-drawings',
    'architectural-concept-design',
    'architecture-programming',
    'my-arch-dxf',
    '실무 시나리오 S1',
    '실무 시나리오 S2',
    '실무 시나리오 S3',
    '시나리오 A-1',
    '시나리오 A-2',
    '시나리오 B-1',
    '시나리오 B-2',
    '06_sample_office_plan_v1.dxf',
    '07_sample_site_brief_3f_commercial.txt',
    '3D Gaussian Splatting',
  ]) {
    assert(combinedSrc.includes(needle), `Missing required 07-2 content: ${needle}`);
  }

  const forbidden = /강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
  const schedule = /\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
  for (const [label, src] of [
    ['daejeon-lesson06-2-mcp.ts', dataSrc],
    ['daejeon-all-in-one-installer.ts', installerSrc],
    ['07-2.astro', pageSrc],
  ]) {
    assert(!forbidden.test(src), `${label} contains forbidden wording: ${src.match(forbidden)?.[0]}`);
    assert(!schedule.test(src), `${label} contains schedule wording: ${src.match(schedule)?.[0]}`);
  }
});

test('All-in-One PowerShell Builder merges only selected MCPs, emits soft warnings without blocking copy, and passes PowerShell AST check', async () => {
  const installer = await loadTsModule('src/draft/content/daejeon-all-in-one-installer.ts');
  const mcpData = await loadTsModule('src/draft/content/daejeon-lesson06-2-mcp.ts');

  // 1) Default full selection: 0 warnings, Blender 3.6 LTS portable + ask version policy
  const fullSel = installer.defaultInstallerSelection;
  assert.deepEqual(installer.evaluateSetupWarnings(fullSel), []);
  const fullScript = installer.buildAllInOnePowerShell(fullSel, mcpData.customSkillTemplate);
  assert(fullScript.includes('blender-3.6.23-windows-x64.zip'));
  assert(fullScript.includes("'[구간 1]'") === false && fullScript.includes('[구간 1] Git 설치'));
  assert(fullScript.includes("Read-Host"));

  // 2) Partial MCP selection (optA only): config.toml merge requests only aiblueprint, NOT freecad or blender
  const optAOnly = {
    ...fullSel,
    git: false,
    node: false,
    pythonUv: false,
    optA: true,
    optB: false,
    blender: false,
    codexConfig: true,
    skills: false,
    versionPolicy: 'skip',
  };
  const warnings = installer.evaluateSetupWarnings(optAOnly).map((w) => w.id);
  assert(warnings.includes('missing-python-uv'), 'Should warn when Python/uv is unchecked');
  assert(warnings.includes('missing-git'), 'Should warn when Git is unchecked');
  const optAScript = installer.buildAllInOnePowerShell(optAOnly, mcpData.customSkillTemplate);
  assert(optAScript.includes("$requestedMcps = @('aiblueprint')"));
  assert(!optAScript.includes('[구간 5]'));
  assert(!optAScript.includes('[구간 6]'));

  // 3) Latest Blender profile uses winget BlenderFoundation.Blender
  const latestScript = installer.buildAllInOnePowerShell(
    { ...fullSel, blenderProfile: 'latest', versionPolicy: 'latest' },
    mcpData.customSkillTemplate,
  );
  assert(latestScript.includes("'BlenderFoundation.Blender'"));

  // 4) On Windows, validate generated PowerShell scripts with the real PowerShell AST parser
  if (process.platform === 'win32') {
    const tmpFile = path.join(os.tmpdir(), `arch-all-in-one-test-${process.pid}.ps1`);
    try {
      for (const script of [fullScript, optAScript, latestScript]) {
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
