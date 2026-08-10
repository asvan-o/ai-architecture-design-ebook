const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  EXTENSION_GROUPS,
  MANAGED_PROJECT_FOLDERS,
  OrganizerService,
  PROJECT_STRUCTURE,
  classifyDirectoryPackage,
  classifyFile,
  createProject,
  directorySnapshot,
  processTopLevelDirectory,
  processTopLevelFile,
  scanProject,
  scanProjectEntries,
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

const FAST_STABILITY = { intervalMs: 25, stableSamples: 2, maxWaitMs: 2_000 };

async function writePackage(root, relativeFiles) {
  for (const [relativePath, contents = relativePath] of relativeFiles) {
    const filePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents);
  }
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

test('폴더 패키지를 우선순위에 따라 분류하고 내부 구조를 보존한다', async (context) => {
  const root = await temporaryDirectory('dpao-packages');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const cases = [
    ['ModelPackage', [['model.fbx'], ['albedo.jpg'], ['normal.png'], ['roughness.jpg']], '06_ASSETS/MODEL'],
    ['ObjPackage', [['model.obj'], ['model.mtl'], ['texture.jpg']], '06_ASSETS/MODEL'],
    ['BlendProject', [['scene.blend'], ['textures/diffuse.png']], '04_3D_WORKFILES/BLENDER'],
    ['MaxProject', [['scene_v01.max'], ['scene_v02.max'], ['maps/basecolor.jpg']], '04_3D_WORKFILES/3DSMAX'],
    ['MaterialPackage', [['albedo.jpg'], ['normal.png'], ['roughness.jpg'], ['displacement.exr']], '06_ASSETS/IMAGE'],
    ['VideoPackage', [['clip-01.mp4'], ['clip-02.mov']], '06_ASSETS/VIDEO'],
    ['DocumentPackage', [['brief.pdf'], ['schedule.xlsx']], '07_DOCUMENT'],
    ['GraphicPackage', [['board.psd'], ['linked/reference.jpg']], '05_GRAPHIC/PHOTOSHOP'],
  ];

  for (const [folderName, files, destination] of cases) {
    const source = path.join(project, folderName);
    await writePackage(source, files);
    const before = await directorySnapshot(source);
    const result = await processTopLevelDirectory(project, source, () => {}, FAST_STABILITY);
    const moved = path.join(project, destination, folderName);
    assert.equal(result.status, 'moved', folderName);
    assert.equal(await exists(source), false, folderName);
    assert.equal(await exists(moved), true, folderName);
    assert.deepEqual(await directorySnapshot(moved), before, folderName);
    for (const [relativePath] of files) assert.equal(await exists(path.join(moved, relativePath)), true, relativePath);
  }
});

test('혼합 Workfile은 REVIEW로 보내고 .uproject 폴더는 원래 위치에 둔다', async (context) => {
  const root = await temporaryDirectory('dpao-review-packages');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');

  const mixed = path.join(project, 'MixedPackage');
  await writePackage(mixed, [['scene.max'], ['scene.blend'], ['texture.jpg']]);
  const mixedClassification = await classifyDirectoryPackage(mixed);
  assert.equal(mixedClassification.reason, 'mixed-workfiles');
  const mixedResult = await processTopLevelDirectory(project, mixed, () => {}, FAST_STABILITY);
  assert.equal(mixedResult.status, 'review');
  assert.equal(mixedResult.moved, true);
  assert.equal(await exists(mixed), false);
  assert.match(mixedResult.destination, /98_REVIEW/);
  assert.equal(await exists(path.join(mixedResult.destination, 'scene.max')), true);
  assert.equal(await exists(path.join(mixedResult.destination, 'scene.blend')), true);

  const unreal = path.join(project, 'UnrealProject');
  await writePackage(unreal, [['game.uproject', '{}'], ['Content/map.umap']]);
  const unrealResult = await processTopLevelDirectory(project, unreal, () => {}, FAST_STABILITY);
  assert.equal(unrealResult.status, 'review');
  assert.equal(unrealResult.moved, false);
  assert.equal(await exists(unreal), true);
});

test('표준 관리 폴더는 패키지로 다시 이동하지 않는다', async (context) => {
  const root = await temporaryDirectory('dpao-managed-folders');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const managed = path.join(project, '06_ASSETS');
  await fs.writeFile(path.join(managed, 'MODEL', 'existing.fbx'), 'model');
  const results = await scanProjectEntries(project, () => {}, FAST_STABILITY);
  assert.equal(MANAGED_PROJECT_FOLDERS.has('06_ASSETS'), true);
  assert.equal(await exists(path.join(managed, 'MODEL', 'existing.fbx')), true);
  assert.equal(results.some((result) => result?.source === managed), false);
});

test('동일 이름 폴더는 병합하거나 덮어쓰지 않고 충돌 폴더로 이동한다', async (context) => {
  const root = await temporaryDirectory('dpao-folder-conflict');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const existing = path.join(project, '06_ASSETS', 'MODEL', 'Chair');
  await writePackage(existing, [['original.fbx', 'original']]);
  const incoming = path.join(project, 'Chair');
  await writePackage(incoming, [['incoming.fbx', 'incoming'], ['textures/base.jpg']]);

  const result = await processTopLevelDirectory(project, incoming, () => {}, FAST_STABILITY);
  assert.equal(result.status, 'review');
  assert.equal(await fs.readFile(path.join(existing, 'original.fbx'), 'utf8'), 'original');
  assert.match(result.destination, /98_REVIEW[\\/]충돌-/);
  assert.equal(await fs.readFile(path.join(result.destination, 'incoming.fbx'), 'utf8'), 'incoming');
});

test('복사 중인 폴더는 마지막 파일 뒤 안정화될 때까지 이동하지 않는다', async (context) => {
  const root = await temporaryDirectory('dpao-staged-copy');
  context.after(() => fs.rm(root, { recursive: true, force: true }));
  const project = await createProject(root, 'PROJECT_A');
  const source = path.join(project, 'SlowModelPackage');
  await fs.mkdir(source);

  const processing = processTopLevelDirectory(project, source, () => {}, { intervalMs: 200, stableSamples: 3, maxWaitMs: 5_000 });
  await new Promise((resolve) => setTimeout(resolve, 250));
  await fs.writeFile(path.join(source, 'model.fbx'), 'model');
  await new Promise((resolve) => setTimeout(resolve, 250));
  await fs.writeFile(path.join(source, 'albedo.jpg'), 'albedo');
  await new Promise((resolve) => setTimeout(resolve, 250));
  await fs.writeFile(path.join(source, 'normal.png'), 'normal');
  assert.equal(await exists(source), true);

  const result = await processing;
  const destination = path.join(project, '06_ASSETS', 'MODEL', 'SlowModelPackage');
  assert.equal(result.status, 'moved');
  assert.equal(await exists(destination), true);
  assert.equal(await exists(path.join(destination, 'model.fbx')), true);
  assert.equal(await exists(path.join(destination, 'albedo.jpg')), true);
  assert.equal(await exists(path.join(destination, 'normal.png')), true);
});

test('watcher가 파일 20개와 폴더 패키지 10개를 재시작 없이 처리한다', async (context) => {
  const root = await temporaryDirectory('dpao-repeat-live');
  const settingsPath = path.join(root, '.test-state', 'settings.json');
  const service = new OrganizerService({ settingsPath });
  context.after(async () => {
    await service.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  const project = await createProject(root, 'PROJECT_A');
  await service.setRoot(root);

  const fileStartedAt = new Map();
  for (let index = 1; index <= 20; index += 1) {
    fileStartedAt.set(index, Date.now());
    await fs.writeFile(path.join(project, `drawing-${index}.dwg`), `dwg-${index}`);
  }
  const fileDurations = await Promise.all([...fileStartedAt].map(async ([index, startedAt]) => {
    await waitFor(() => exists(path.join(project, '01_CAD', 'AUTOCAD', `drawing-${index}.dwg`)), 10_000);
    return Date.now() - startedAt;
  }));

  const packageStartedAt = new Map();
  for (let index = 1; index <= 10; index += 1) {
    const packagePath = path.join(project, `ModelPackage-${index}`);
    await writePackage(packagePath, [['model.fbx', `model-${index}`], ['textures/albedo.jpg', `texture-${index}`]]);
    packageStartedAt.set(index, Date.now());
  }
  const packageDurations = await Promise.all([...packageStartedAt].map(async ([index, startedAt]) => {
    await waitFor(() => exists(path.join(project, '06_ASSETS', 'MODEL', `ModelPackage-${index}`)), 10_000);
    return Date.now() - startedAt;
  }));

  for (let index = 1; index <= 10; index += 1) {
    const destination = path.join(project, '06_ASSETS', 'MODEL', `ModelPackage-${index}`);
    assert.equal(await fs.readFile(path.join(destination, 'model.fbx'), 'utf8'), `model-${index}`);
    assert.equal(await fs.readFile(path.join(destination, 'textures', 'albedo.jpg'), 'utf8'), `texture-${index}`);
  }
  const average = (values) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  console.log(`LIVE_BENCHMARK fileAvgMs=${average(fileDurations)} packageAvgMs=${average(packageDurations)}`);
});

test('실행 중 ROOT에 만든 새 프로젝트를 등록하고 폴더 패키지를 감시한다', async (context) => {
  const root = await temporaryDirectory('dpao-new-project-live');
  const settingsPath = path.join(root, '.test-state', 'settings.json');
  const service = new OrganizerService({ settingsPath, stabilityOptions: { intervalMs: 30, stableSamples: 2, maxWaitMs: 3_000 } });
  context.after(async () => {
    await service.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  await service.setRoot(root);
  const project = path.join(root, 'NEW_PROJECT');
  await fs.mkdir(project);
  await waitFor(() => exists(path.join(project, '06_ASSETS', 'MODEL')));
  const packagePath = path.join(project, 'Chair');
  await writePackage(packagePath, [['chair.obj'], ['chair.mtl'], ['textures/diffuse.jpg']]);
  await waitFor(() => exists(path.join(project, '06_ASSETS', 'MODEL', 'Chair', 'chair.obj')), 10_000);
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
  const warning = /외부 참조\(Xref, Link, Texture 등\)가 연결된 작업파일 세트는[\s\S]*자동정리 전에 확인하세요[\s\S]*참조 경로가 끊어질 수 있습니다/;

  assert.match(readme, warning);
  assert.match(screen, warning);
  assert.match(readme, /PROJECT 최상위.*파일.*폴더 패키지.*투입 영역/);
  assert.match(screen, /FBX와 Texture[\s\S]*폴더 전체를 정리/);
  assert.equal(PROJECT_STRUCTURE.some((folder) => folder.includes('_INBOX')), false);
});
