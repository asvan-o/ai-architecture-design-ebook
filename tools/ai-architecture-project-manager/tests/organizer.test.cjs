const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  EXTENSION_GROUPS,
  OrganizerService,
  PROJECT_STRUCTURE,
  classifyFile,
  createProject,
  processTopLevelFile,
  scanProject,
} = require('../src/organizer.cjs');

async function temporaryDirectory(label) {
  return fs.mkdtemp(path.join(os.tmpdir(), `${label}-`));
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function waitFor(check, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  throw new Error('조건을 기다리는 동안 제한 시간을 초과했습니다.');
}

test('승인된 모든 확장자를 지정 폴더로 분류한다', () => {
  for (const [extensions, folder] of EXTENSION_GROUPS) {
    for (const extension of extensions) {
      assert.equal(classifyFile(`sample${extension}`).folder, folder, extension);
      assert.equal(classifyFile(`SAMPLE${extension.toUpperCase()}`).folder, folder, extension.toUpperCase());
    }
  }
  assert.equal(classifyFile('movie.mp4').folder, '06_ASSETS/VIDEO');
  assert.equal(classifyFile('proposal.pdf').folder, '07_DOCUMENT');
  assert.equal(classifyFile('archive.zip').folder, '06_ASSETS/OTHER');
  assert.equal(classifyFile('scene.uproject').action, 'review-only');
});

test('새 프로젝트와 표준 하위 폴더를 생성한다', async (context) => {
  const root = await temporaryDirectory('dpao-project');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, '카페 A 리모델링');
  for (const relativePath of PROJECT_STRUCTURE) {
    assert.equal((await fs.stat(path.join(project, relativePath))).isDirectory(), true, relativePath);
  }
  await assert.rejects(() => createProject(root, '카페 A 리모델링'), /이미/);
  await assert.rejects(() => createProject(root, '../outside'), /사용할 수 없는/);
});

test('ROOT 파일은 무시하고 PROJECT 최상위 파일만 분류한다', async (context) => {
  const root = await temporaryDirectory('dpao-scope');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const rootFile = path.join(root, 'root-test.dwg');
  const topLevelFile = path.join(project, 'project-test.dwg');
  const existingClassified = path.join(project, '01_CAD', 'AUTOCAD', 'existing.dwg');
  await fs.writeFile(rootFile, 'root');
  await fs.writeFile(topLevelFile, 'project');
  await fs.writeFile(existingClassified, 'existing');

  await scanProject(project);
  assert.equal(await exists(rootFile), true);
  assert.equal(await exists(topLevelFile), false);
  assert.equal(await exists(path.join(project, '01_CAD', 'AUTOCAD', 'project-test.dwg')), true);
  assert.equal(await exists(existingClassified), true);
});

test('VIDEO와 OTHER를 분리하고 동일 이름은 덮어쓰지 않는다', async (context) => {
  const root = await temporaryDirectory('dpao-routing');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  await fs.writeFile(path.join(project, 'movie.mkv'), 'video');
  await fs.writeFile(path.join(project, 'unknown.xyz'), 'other');
  await fs.writeFile(path.join(project, '01_CAD', 'AUTOCAD', 'same.dwg'), 'original');
  await fs.writeFile(path.join(project, 'same.dwg'), 'incoming');

  await scanProject(project);

  assert.equal(await exists(path.join(project, '06_ASSETS', 'VIDEO', 'movie.mkv')), true);
  assert.equal(await exists(path.join(project, '06_ASSETS', 'OTHER', 'unknown.xyz')), true);
  assert.equal(await fs.readFile(path.join(project, '01_CAD', 'AUTOCAD', 'same.dwg'), 'utf8'), 'original');
  const reviewEntries = await fs.readdir(path.join(project, '98_REVIEW'), { withFileTypes: true });
  const conflict = reviewEntries.find((entry) => entry.isDirectory() && entry.name.startsWith('충돌-'));
  assert.ok(conflict);
  assert.equal(await fs.readFile(path.join(project, '98_REVIEW', conflict.name, 'same.dwg'), 'utf8'), 'incoming');
});

test('폴더형 Unreal 프로젝트와 링크는 자동 이동하지 않는다', async (context) => {
  const root = await temporaryDirectory('dpao-folder-project');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const uproject = path.join(project, 'campus.uproject');
  await fs.writeFile(uproject, '{}');

  const result = await processTopLevelFile(project, uproject);
  assert.equal(result.status, 'review');
  assert.equal(result.moved, false);
  assert.equal(await exists(uproject), true);
  const reviewLog = JSON.parse(await fs.readFile(path.join(project, '98_REVIEW', '검토필요.json'), 'utf8'));
  assert.equal(reviewLog[0].status, '폴더형 프로젝트 · 자동 이동 제외');
});

test('실행 중 감시하고 종료 중에는 멈추며 재실행 시 다시 스캔한다', async (context) => {
  const root = await temporaryDirectory('dpao-lifecycle');
  const settingsPath = path.join(root, '.test-state', 'settings.json');
  const service = new OrganizerService({ settingsPath });
  context.after(async () => {
    await service.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  const project = await createProject(root, 'PROJECT_A');
  await service.setRoot(root);

  const activeFile = path.join(project, 'active.dwg');
  await fs.writeFile(activeFile, 'active');
  await waitFor(() => exists(path.join(project, '01_CAD', 'AUTOCAD', 'active.dwg')));

  await service.close();
  const stoppedFile = path.join(project, 'stopped.mov');
  await fs.writeFile(stoppedFile, 'stopped');
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await exists(stoppedFile), true);
  assert.equal(await exists(path.join(project, '06_ASSETS', 'VIDEO', 'stopped.mov')), false);

  await service.start();
  await waitFor(() => exists(path.join(project, '06_ASSETS', 'VIDEO', 'stopped.mov')));
  assert.equal(await exists(stoppedFile), false);
});

test('기본 프로그램에는 API Key나 외부 AI 호출 구성이 없다', async () => {
  const sourceFiles = ['organizer.cjs', 'main.cjs', 'preload.cjs'];
  const source = (await Promise.all(sourceFiles.map((file) => fs.readFile(path.join(__dirname, '..', 'src', file), 'utf8')))).join('\n');
  assert.equal(/AIza|API_KEY|Gemini API|OpenAI API|fetch\(['"]https?:\/\//i.test(source), false);
});

test('수업용 개발환경과 lockfile 버전이 고정되어 있다', async () => {
  const projectRoot = path.join(__dirname, '..');
  const packageJson = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  const packageLock = JSON.parse(await fs.readFile(path.join(projectRoot, 'package-lock.json'), 'utf8'));
  const lockedProject = packageLock.packages[''];

  assert.equal(packageJson.engines.node, '>=22 <23');
  assert.equal(packageJson.main, 'src/main.cjs');
  assert.equal(packageJson.dependencies.chokidar, '4.0.3');
  assert.equal(packageJson.devDependencies.electron, '43.3.0');
  assert.equal(packageJson.devDependencies['@electron-forge/cli'], '7.11.2');
  assert.equal(packageJson.devDependencies['@electron-forge/maker-squirrel'], '7.11.2');
  assert.equal(lockedProject.dependencies.chokidar, '4.0.3');
  assert.equal(lockedProject.devDependencies.electron, '43.3.0');
  assert.equal(lockedProject.devDependencies['@electron-forge/cli'], '7.11.2');
  assert.equal(lockedProject.devDependencies['@electron-forge/maker-squirrel'], '7.11.2');
});

test('PROJECT 투입 영역과 외부 참조 안전 경계를 문서와 화면에 표시한다', async () => {
  const projectRoot = path.join(__dirname, '..');
  const readme = await fs.readFile(path.join(projectRoot, 'README.md'), 'utf8');
  const screen = await fs.readFile(path.join(projectRoot, 'src', 'renderer', 'index.html'), 'utf8');
  const warning = /외부 참조\(Xref, Link, Texture 등\)가 연결된 작업파일 세트는[\s\S]*자동정리 대상에 넣지 마세요[\s\S]*참조 경로가 끊어질 수 있습니다/;

  assert.match(readme, warning);
  assert.match(screen, warning);
  assert.match(readme, /PROJECT 최상위.*신규 파일 투입 영역/);
  assert.equal(PROJECT_STRUCTURE.some((folder) => folder.includes('_INBOX')), false);
});
