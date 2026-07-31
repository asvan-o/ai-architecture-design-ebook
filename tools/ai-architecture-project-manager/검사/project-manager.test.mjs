import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../기능/app.mjs';
import { readIndex, safeResolve } from '../기능/project-manager.mjs';

const postJson = async (baseUrl, pathname, body = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, payload: await response.json() };
};

test('일부 자료부터 등록·확인·ZIP 생성이 가능하고 전체 제출 항목도 확인할 수 있다', async (context) => {
  const projectRoot = await mkdtemp(path.join(tmpdir(), 'ai-arch-manager-'));
  const app = createApp({ projectRoot });
  const server = app.listen(0, '127.0.0.1');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const statusResponse = await fetch(`${baseUrl}/api/status`);
  assert.equal(statusResponse.status, 200);
  const initialStatus = await statusResponse.json();
  assert.equal(initialStatus.areas.length, 6);
  await stat(path.join(projectRoot, '03_공간대안', '대안-A'));

  const register = (area, type, content, originalName = `${type.toLowerCase()}.txt`) =>
    postJson(baseUrl, '/api/files', {
      lesson: type === 'RFP' ? 3 : 4,
      area,
      type,
      originalName,
      contentBase64: Buffer.from(content).toString('base64'),
    });

  const firstRfp = await register('reference', 'RFP', 'RFP TEST 01', 'test-rfp.pdf');
  assert.equal(firstRfp.response.status, 201);
  assert.match(firstRfp.payload.asset.fileName, /^캠퍼스라운지_03차시_발주요청서_RFP_v01\.pdf$/);
  const registeredFile = await fetch(
    `${baseUrl}/api/download?path=${encodeURIComponent(firstRfp.payload.asset.relativePath)}`,
  );
  assert.equal(registeredFile.status, 200);
  assert.equal(await registeredFile.text(), 'RFP TEST 01');
  const secondRfp = await register('reference', 'RFP', 'RFP TEST 02', 'test-rfp.pdf');
  assert.equal(secondRfp.response.status, 201);
  assert.match(secondRfp.payload.asset.fileName, /^캠퍼스라운지_03차시_발주요청서_RFP_v02\.pdf$/);

  const duplicate = await register('reference', 'RFP', 'RFP TEST 01', 'same-rfp.pdf');
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.payload.code, 'DUPLICATE');

  const partialDelivery = await postJson(baseUrl, '/api/delivery');
  assert.equal(partialDelivery.response.status, 201);
  assert.match(partialDelivery.payload.asset.fileName, /^캠퍼스라운지_작업모음_v01\.zip$/);
  assert.ok(partialDelivery.payload.missing.length > 0);
  const partialZip = await readFile(
    path.join(projectRoot, partialDelivery.payload.asset.relativePath),
  );
  assert.equal(partialZip.subarray(0, 2).toString(), 'PK');
  assert.equal(partialZip.includes(Buffer.from('관리프로그램/', 'utf8')), false);
  assert.equal(partialZip.includes(Buffer.from('관리데이터/', 'utf8')), false);
  assert.equal(partialZip.includes(Buffer.from('06_제출파일/', 'utf8')), false);

  const required = [
    ['reference', 'PLAN'],
    ['reference', 'EXISTING'],
    ['analysis', 'REQUIREMENTS'],
    ['analysis', 'QUESTIONS'],
    ['analysis', 'BRIEF'],
    ['alt-a', 'ZONING_A'],
    ['alt-a', 'PROMPT_A'],
    ['alt-a', 'IMAGE_A'],
    ['alt-b', 'ZONING_B'],
    ['alt-b', 'PROMPT_B'],
    ['alt-b', 'IMAGE_B'],
    ['selected-validation', 'COMPARISON'],
    ['selected-validation', 'REVISION_PROMPT'],
    ['selected-validation', 'SELECTED_IMAGE'],
  ];
  for (const [area, type] of required) {
    const result = await register(area, type, `PROGRAM TEST ${type}`);
    assert.equal(result.response.status, 201, `${type} 등록 실패`);
  }

  const completeStatus = await (await fetch(`${baseUrl}/api/status`)).json();
  assert.deepEqual(completeStatus.missing, []);

  const delivery = await postJson(baseUrl, '/api/delivery');
  assert.equal(delivery.response.status, 201);
  assert.match(delivery.payload.asset.fileName, /^캠퍼스라운지_작업모음_v02\.zip$/);
  assert.deepEqual(delivery.payload.missing, []);
  const zipBuffer = await readFile(path.join(projectRoot, delivery.payload.asset.relativePath));
  assert.equal(zipBuffer.subarray(0, 2).toString(), 'PK');

  const index = await readIndex(projectRoot);
  assert.equal(index.assets.filter((asset) => asset.type === 'RFP').length, 2);
  await stat(
    path.join(
      projectRoot,
      '관리데이터',
      '원본보관',
      `${firstRfp.payload.asset.sha256}_test-rfp.pdf`,
    ),
  );
  await stat(path.join(projectRoot, firstRfp.payload.asset.relativePath));

  assert.throws(
    () => safeResolve(projectRoot, '..', 'outside.txt'),
    (error) => error.code === 'OUTSIDE_PROJECT_ROOT',
  );
});
