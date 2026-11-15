import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { repositoryRoot } from './daejeon-review-assets.mjs';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const folder = 'review/daejeon/COMMENCEMENT_DOC_STUDENT';
const manifestFile = 'DJ-L02_COMMENCEMENT_MANIFEST.json';
const manifestSource = path.join(repositoryRoot, folder, manifestFile);
const manifestBytes = readFileSync(manifestSource);
const manifest = JSON.parse(manifestBytes.toString('utf8'));

assert.equal(manifest.contentStatus, 'design-pending');
assert.equal(manifest.nodeRuntimeIncluded, false);
assert.equal(manifest.runtimeAiCredits, 0);

const filenames = {
  flowSvg: 'commencement-flow.svg',
  rulesSvg: 'commencement-rules.svg',
  desktop: 'COMMENCEMENT_UI_DESKTOP.png',
  mobile: 'COMMENCEMENT_UI_MOBILE.png',
  pending: 'COMMENCEMENT_UI_PENDING.png',
  step1: 'DJ-L02_DOC_STEP_01.txt',
  step2: 'DJ-L02_DOC_STEP_02.txt',
  step3: 'DJ-L02_DOC_STEP_03.txt',
  step4: 'DJ-L02_DOC_STEP_04.txt',
  integrated: 'DJ-L02_DOC_INTEGRATED_PROMPT.txt',
  vibeReadme: 'DJ-L02_DOC_VIBE_README.txt',
  expected: 'DOC_EXPECTED_RESULTS.csv',
  programZip: 'DJ-L02_COMMENCEMENT_PROGRAM.zip',
  testZip: 'DJ-L02_DOC_TEST.zip',
  readme: 'DJ-L02_COMMENCEMENT_README.txt',
  vibePack: 'DJ-L02_COMMENCEMENT_VIBE_PACK.zip',
};

/** @type {Record<string,{file:string,source:string,outputPath:string,sha256:string,bytes:number}>} */
export const commencementFiles = {};

for (const [key, file] of Object.entries(filenames)) {
  const source = path.join(repositoryRoot, folder, file);
  const bytes = readFileSync(source);
  const entry = manifest.files.find((row) => row.file === file);
  assert(entry, 'Missing commencement doc manifest entry: ' + file);
  assert.equal(bytes.length, entry.bytes, file + ': size mismatch');
  assert.equal(sha(bytes), entry.sha256, file + ': hash mismatch');
  commencementFiles[key] = {
    file,
    source,
    outputPath: 'practice/DJ-L02/commencement/' + file,
    sha256: sha(bytes),
    bytes: bytes.length,
  };
}

export const commencementProgramFiles = [
  {
    ...commencementFiles.programZip,
    key: 'program',
    title: '착수계·행정서류 4종 자동 생성기 ZIP 다운로드',
    description:
      '압축 해제 후 START.bat(서버 모드) 또는 단일실행본.html(무설치 즉시 열람)을 실행합니다.',
  },
  {
    ...commencementFiles.testZip,
    key: 'test',
    title: 'DOC_TEST 실습 시나리오 6종 다운로드',
    description:
      '자동 조립 4건(신규·부가세별도·변경계·억단위)과 사람 확인 대기 2건(사유·자격누락·날짜역전) JSON입니다.',
  },
  {
    ...commencementFiles.readme,
    key: 'readme',
    title: '사용방법·검수 경계 README 다운로드',
    description:
      '실행·종료 방법, 실행 크레딧 0원 구조, 버전 보존(_v02) 및 직인 최종 확인 원칙을 안내합니다.',
  },
];

export const commencementManifest = {
  file: manifestFile,
  key: 'manifest',
  title: '파일 목록·SHA-256 manifest',
  source: manifestSource,
  bytes: manifestBytes.length,
  sha256: sha(manifestBytes),
  outputPath: 'practice/DJ-L02/commencement/' + manifestFile,
};

export const commencementAssets = [...Object.values(commencementFiles), commencementManifest];
