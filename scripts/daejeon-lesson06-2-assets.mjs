import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { repositoryRoot } from './course-registry.mjs';

const root = path.join(repositoryRoot, 'review/daejeon/DJ-L06-RENEWAL-MCP');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');

/**
 * @template {Record<string, unknown>} T
 * @param {string} rel
 * @param {T} [extra]
 * @returns {{ file: string, source: string, outputPath: string, bytes: number, sha256: string } & T}
 */
function loadAsset(rel, extra = /** @type {T} */ ({})) {
  const source = path.join(root, rel);
  const bytes = fs.readFileSync(source);
  const digest = sha(bytes);
  const expected = manifest.files.find((f) => f.file === rel);
  if (expected) {
    assert.equal(bytes.length, expected.bytes, `L06-2 asset size mismatch: ${rel}`);
    assert.equal(digest, expected.sha256, `L06-2 asset SHA mismatch: ${rel}`);
  }
  return {
    file: rel,
    source,
    outputPath: `practice/DJ-L06/renewal-mcp/${rel}`,
    bytes: bytes.length,
    sha256: digest,
    ...extra,
  };
}

export const l062WorkflowSvg = loadAsset('01_mcp-vs-skill-workflow.svg', {
  key: 'mcp-vs-skill-workflow',
  title: 'MCP(실행 손발)와 Codex 건축 스킬(업무 매뉴얼) 협업 구조 및 초보자 3단계 흐름 도식',
  width: 1200,
  height: 580,
});

export const l062SkillCadPreview = loadAsset('02_skill-cad-drawings-preview.png', {
  key: 'skill-cad-drawings',
  title: 'cad-drawings 공식 예시 · DXF 도면 시트 자동 미리보기 출력 (numikel/cad-drawings)',
  width: 1200,
  height: 848,
});

export const l062SkillConceptPlan3d = loadAsset('03_skill-concept-plan-to-model.png', {
  key: 'skill-concept-plan-3d',
  title: 'Architectural Concept Design 공식 예시 · 축척 1 대 50 평면도(DXF/PDF)와 동일 모델 3D 뷰어(three.js)',
  width: 1800,
  height: 700,
});

export const l062SkillConceptSet = loadAsset('04_skill-concept-drawing-set.png', {
  key: 'skill-concept-set',
  title: 'Architectural Concept Design 공식 예시 · 배치도·1~2층 평면·입면·단면·면적표 6장 도면 세트',
  width: 1800,
  height: 940,
});

export const l062SkillGridlinePlan = loadAsset('05_skill-gridline-house-plan.png', {
  key: 'skill-gridline-plan',
  title: 'Gridline 공식 예시 · 축선·치수·개구부 기호·표제란이 정렬된 A3 1:100 평면도(A-101)',
  width: 1400,
  height: 990,
});

export const lesson062RenewalAssets = [
  l062WorkflowSvg,
  l062SkillCadPreview,
  l062SkillConceptPlan3d,
  l062SkillConceptSet,
  l062SkillGridlinePlan,
  loadAsset('manifest.json', { key: 'l062-manifest' }),
];
