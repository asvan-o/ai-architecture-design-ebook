import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
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

test('Lesson 07-2 renewal page covers Veo + 3DGS + 3 free MCP options + headless + beginner skills + scenarios + custom SKILL.md', () => {
  const pageSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/pages/lessons/07-2.astro'), 'utf8');
  const dataSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/daejeon-lesson06-2-mcp.ts'), 'utf8');
  const navSrc = fs.readFileSync(path.join(repositoryRoot, 'src/draft/content/review-navigation.ts'), 'utf8');

  assert(navSrc.includes("'07-2'"), 'review-navigation.ts must include 07-2');
  assert(pageSrc.includes('lessonId="07-2"'), '07-2.astro must declare lessonId="07-2"');
  assert(!pageSrc.includes('<ReviewPrompt'), '07-2.astro must not alter global ReviewPrompt count (104)');

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
    assert(pageSrc.includes(needle) || dataSrc.includes(needle), `Missing required 06-2 content: ${needle}`);
  }

  const forbidden = /강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
  const schedule = /\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
  for (const [label, src] of [
    ['daejeon-lesson06-2-mcp.ts', dataSrc],
    ['07-2.astro', pageSrc],
  ]) {
    assert(!forbidden.test(src), `${label} contains forbidden wording: ${src.match(forbidden)?.[0]}`);
    assert(!schedule.test(src), `${label} contains schedule wording: ${src.match(schedule)?.[0]}`);
  }
});
