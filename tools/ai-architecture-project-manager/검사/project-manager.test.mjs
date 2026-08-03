import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../기능/app.mjs';
import {
  MAX_FILE_SIZE_BYTES,
  PROJECT_DIRECTORY_NAME,
  REQUIRED_ITEMS,
  TYPES,
  createDeliveryZip,
  initializeWorkspace,
  readIndex,
  registerBuffer,
  resolveVerifiedPath,
  safeResolve,
} from '../기능/project-manager.mjs';

const createProjectRoot = async (prefix = 'ai-arch-manager-') => {
  const container = await mkdtemp(path.join(tmpdir(), prefix));
  const projectRoot = path.join(container, PROJECT_DIRECTORY_NAME);
  await mkdir(projectRoot);
  return projectRoot;
};

const postJson = async (baseUrl, pathname, body = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, payload: await response.json() };
};

const zipEntryNames = (buffer) => {
  let endOffset = -1;
  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      endOffset = index;
      break;
    }
  }
  assert.notEqual(endOffset, -1, 'ZIP 중앙 디렉터리 종료 레코드가 필요합니다.');
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  let offset = buffer.readUInt32LE(endOffset + 16);
  const names = [];
  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    names.push(buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return names;
};

const validPdf = (label) => Buffer.from(`%PDF-1.4\n${label}\n%%EOF`);
const validPng = (label) => Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from(label),
]);

test('일부 자료부터 등록·확인·ZIP 생성이 가능하고 전체 제출 항목도 확인할 수 있다', async (context) => {
  const projectRoot = await createProjectRoot();
  const app = createApp({ projectRoot });
  const server = app.listen(0, '127.0.0.1');
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const statusResponse = await fetch(`${baseUrl}/api/status`);
  assert.equal(statusResponse.status, 200);
  const initialStatus = await statusResponse.json();
  assert.equal(initialStatus.areas.length, 6);
  assert.equal(initialStatus.deliveryPreview.includedFiles.length, 0);
  await stat(path.join(projectRoot, '03_공간대안', '대안-A'));

  const register = (lesson, area, type, content, originalName = `${type.toLowerCase()}.txt`, mediaType = 'text/plain') =>
    postJson(baseUrl, '/api/files', {
      lesson,
      area,
      type,
      originalName,
      mediaType,
      contentBase64: Buffer.from(content).toString('base64'),
    });

  const firstPdf = validPdf('RFP TEST 01');
  const firstRfp = await postJson(baseUrl, '/api/files', {
    lesson: 3,
    area: 'reference',
    type: 'RFP',
    originalName: 'test-rfp.pdf',
    mediaType: 'application/pdf',
    contentBase64: firstPdf.toString('base64'),
  });
  assert.equal(firstRfp.response.status, 201);
  assert.match(firstRfp.payload.asset.fileName, /^캠퍼스라운지_03차시_발주요청서_RFP_v01\.pdf$/);
  const registeredFile = await fetch(
    `${baseUrl}/api/download?path=${encodeURIComponent(firstRfp.payload.asset.relativePath)}`,
  );
  assert.equal(registeredFile.status, 200);
  assert.deepEqual(Buffer.from(await registeredFile.arrayBuffer()), firstPdf);

  const secondRfp = await postJson(baseUrl, '/api/files', {
    lesson: 3,
    area: 'reference',
    type: 'RFP',
    originalName: 'test-rfp.pdf',
    mediaType: 'application/pdf',
    contentBase64: validPdf('RFP TEST 02').toString('base64'),
  });
  assert.equal(secondRfp.response.status, 201);
  assert.match(secondRfp.payload.asset.fileName, /^캠퍼스라운지_03차시_발주요청서_RFP_v02\.pdf$/);

  const duplicate = await postJson(baseUrl, '/api/files', {
    lesson: 3,
    area: 'reference',
    type: 'RFP',
    originalName: 'same-rfp.pdf',
    mediaType: 'application/pdf',
    contentBase64: firstPdf.toString('base64'),
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.payload.code, 'DUPLICATE');

  const partialDelivery = await postJson(baseUrl, '/api/delivery');
  assert.equal(partialDelivery.response.status, 201);
  assert.match(partialDelivery.payload.asset.fileName, /^캠퍼스라운지_등록파일_제출본_v01\.zip$/);
  assert.ok(partialDelivery.payload.missing.length > 0);
  const partialZip = await readFile(path.join(projectRoot, partialDelivery.payload.asset.relativePath));
  const partialNames = zipEntryNames(partialZip);
  assert.ok(partialNames.includes(firstRfp.payload.asset.relativePath));
  assert.ok(partialNames.includes('관리데이터/등록파일목록.json'));
  assert.ok(partialNames.includes('관리데이터/누락점검.json'));
  assert.ok(partialNames.includes('제출안내.txt'));
  assert.equal(partialNames.some((name) => name.includes('원본보관')), false);
  assert.equal(partialNames.some((name) => name.startsWith('관리프로그램/')), false);

  for (const item of REQUIRED_ITEMS.filter((entry) => entry.type !== 'RFP')) {
    const definition = TYPES[item.type];
    const result = await register(
      item.lesson,
      definition.area,
      item.type,
      `PROGRAM TEST ${item.lesson} ${item.type}`,
    );
    assert.equal(result.response.status, 201, `${item.type} 등록 실패`);
  }

  const completeStatus = await (await fetch(`${baseUrl}/api/status`)).json();
  assert.deepEqual(completeStatus.missing, []);
  const delivery = await postJson(baseUrl, '/api/delivery');
  assert.equal(delivery.response.status, 201);
  assert.match(delivery.payload.asset.fileName, /^캠퍼스라운지_등록파일_제출본_v02\.zip$/);
  assert.deepEqual(delivery.payload.missing, []);

  const index = await readIndex(projectRoot);
  assert.equal(index.assets.filter((asset) => asset.type === 'RFP').length, 2);
  await stat(path.join(projectRoot, '관리데이터', '원본보관', `${firstRfp.payload.asset.sha256}_test-rfp.pdf`));
  await stat(path.join(projectRoot, firstRfp.payload.asset.relativePath));

  assert.throws(
    () => safeResolve(projectRoot, '..', 'outside.txt'),
    (error) => error.code === 'OUTSIDE_PROJECT_ROOT',
  );
});

test('같은 유형의 파일 10개를 동시에 등록해도 버전과 색인이 충돌하지 않는다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-concurrent-');
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      registerBuffer(projectRoot, {
        lesson: 4,
        area: 'alt-a',
        type: 'IMAGE_A',
        originalName: `대안 A 이미지 ${index + 1}.png`,
        mediaType: 'image/png',
        buffer: validPng(`CONCURRENT IMAGE ${index + 1}`),
      }),
    ),
  );

  assert.equal(results.length, 10);
  assert.equal(new Set(results.map((asset) => asset.version)).size, 10);
  assert.equal(new Set(results.map((asset) => asset.fileName)).size, 10);
  assert.deepEqual(results.map((asset) => asset.version).sort((a, b) => a - b), [1,2,3,4,5,6,7,8,9,10]);

  const index = await readIndex(projectRoot);
  const registered = index.assets.filter((asset) => asset.type === 'IMAGE_A');
  assert.equal(registered.length, 10);
  for (const asset of registered) await stat(path.join(projectRoot, asset.relativePath));

  const managementFiles = await readdir(path.join(projectRoot, '관리데이터'));
  assert.equal(managementFiles.some((name) => name.includes('.tmp-')), false);
  JSON.parse(await readFile(path.join(projectRoot, '관리데이터', '등록목록.json'), 'utf8'));
});

test('제출 ZIP은 등록목록의 파일만 포함하고 미등록 민감자료를 제외한다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-delivery-');
  const asset = await registerBuffer(projectRoot, {
    lesson: 3,
    area: 'reference',
    type: 'RFP',
    originalName: '교육용-rfp.pdf',
    mediaType: 'application/pdf',
    buffer: validPdf('REGISTERED RFP'),
  });
  await writeFile(path.join(projectRoot, '01_기준자료', 'private-test.txt'), 'PRIVATE DATA');

  const delivery = await createDeliveryZip(projectRoot);
  const zip = await readFile(path.join(projectRoot, delivery.relativePath));
  const names = zipEntryNames(zip);
  assert.equal(names.includes('01_기준자료/private-test.txt'), false);
  assert.equal(names.includes(asset.relativePath), true);
  assert.equal(names.filter((name) => !name.startsWith('관리데이터/') && name !== '제출안내.txt').length, 1);
});

test('같은 이름의 다른 파일은 새 버전으로 등록하고 동일 바이트는 중복으로 거부한다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-version-');
  const first = await registerBuffer(projectRoot, {
    lesson: 4,
    area: 'alt-a',
    type: 'STRATEGY_A',
    originalName: '디자인 브리프 최종.txt',
    buffer: Buffer.from('첫 번째 내용'),
  });
  const second = await registerBuffer(projectRoot, {
    lesson: 4,
    area: 'alt-a',
    type: 'STRATEGY_A',
    originalName: '디자인 브리프 최종.txt',
    buffer: Buffer.from('두 번째 내용'),
  });
  assert.equal(first.version, 1);
  assert.equal(second.version, 2);
  await assert.rejects(
    registerBuffer(projectRoot, {
      lesson: 4,
      area: 'alt-a',
      type: 'STRATEGY_A',
      originalName: '복사본.txt',
      buffer: Buffer.from('첫 번째 내용'),
    }),
    (error) => error.code === 'DUPLICATE',
  );
});

test('한글·공백·일반 특수문자 파일명과 경로를 처리한다', async () => {
  const projectRoot = await createProjectRoot('한글 경로 공백 ');
  const asset = await registerBuffer(projectRoot, {
    lesson: 3,
    area: 'analysis',
    type: 'QUESTIONS',
    originalName: '추가 질의 (검토용) #1.txt',
    buffer: Buffer.from('질의 내용'),
  });
  await stat(path.join(projectRoot, asset.relativePath));
  assert.equal(asset.originalName, '추가 질의 (검토용) #1.txt');
});

test('손상된 등록목록 JSON은 원본을 보존한 채 명확히 거부한다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-broken-index-');
  await initializeWorkspace(projectRoot);
  const target = path.join(projectRoot, '관리데이터', '등록목록.json');
  const broken = '{ "schemaVersion": 2, "assets": [';
  await writeFile(target, broken);
  await assert.rejects(readIndex(projectRoot), (error) => error.code === 'INVALID_INDEX');
  assert.equal(await readFile(target, 'utf8'), broken);
});

test('비허용 확장자·위험 파일명·크기 초과·가짜 바이트를 거부한다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-file-validation-');
  const base = { lesson: 4, area: 'alt-a', type: 'IMAGE_A' };
  await assert.rejects(
    registerBuffer(projectRoot, { ...base, originalName: '실행파일.exe', buffer: Buffer.from('MZ') }),
    (error) => error.code === 'UNSUPPORTED_FILE_TYPE',
  );
  await assert.rejects(
    registerBuffer(projectRoot, { ...base, originalName: '../외부.png', buffer: validPng('x') }),
    (error) => error.code === 'INVALID_FILE',
  );
  await assert.rejects(
    registerBuffer(projectRoot, { ...base, originalName: '과대파일.png', buffer: Buffer.alloc(MAX_FILE_SIZE_BYTES + 1) }),
    (error) => error.code === 'FILE_TOO_LARGE',
  );
  await assert.rejects(
    registerBuffer(projectRoot, { ...base, originalName: '가짜이미지.png', buffer: Buffer.from('NOT PNG') }),
    (error) => error.code === 'UNSUPPORTED_FILE_TYPE',
  );
  await assert.rejects(
    registerBuffer(projectRoot, { ...base, originalName: '빈이미지.png', buffer: Buffer.alloc(0) }),
    (error) => error.code === 'INVALID_FILE',
  );
  await assert.rejects(
    registerBuffer(projectRoot, {
      lesson: 3,
      area: 'alt-a',
      type: 'IMAGE_A',
      originalName: '차시불일치.png',
      buffer: validPng('wrong lesson'),
    }),
    (error) => error.code === 'INVALID_INPUT',
  );
});

test('절대경로와 프로젝트 밖 경로를 거부한다', async () => {
  const projectRoot = await createProjectRoot('ai-arch-outside-');
  await initializeWorkspace(projectRoot);
  assert.throws(
    () => safeResolve(projectRoot, path.parse(projectRoot).root, 'outside.txt'),
    (error) => error.code === 'OUTSIDE_PROJECT_ROOT',
  );
  assert.throws(
    () => safeResolve(projectRoot, '..', 'outside.txt'),
    (error) => error.code === 'OUTSIDE_PROJECT_ROOT',
  );
});

test('프로젝트 밖으로 연결된 junction 또는 symlink를 거부한다', async (context) => {
  const projectRoot = await createProjectRoot('ai-arch-link-');
  await initializeWorkspace(projectRoot);
  const outside = await mkdtemp(path.join(tmpdir(), 'ai-arch-outside-target-'));
  const link = path.join(projectRoot, '01_기준자료', '외부연결');
  try {
    await symlink(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      context.skip(`현재 환경에서 링크 생성 권한이 없어 방어 코드 실행 검사를 건너뜀: ${error.code}`);
      return;
    }
    throw error;
  }
  await assert.rejects(
    resolveVerifiedPath(projectRoot, '01_기준자료', '외부연결'),
    (error) => error.code === 'UNSAFE_PATH' || error.code === 'OUTSIDE_PROJECT_ROOT',
  );
});
