const fs = require('node:fs/promises');
const path = require('node:path');
const chokidar = require('chokidar');

const PROJECT_STRUCTURE = [
  '01_CAD/AUTOCAD',
  '01_CAD/MICROSTATION',
  '02_BIM/REVIT',
  '02_BIM/ARCHICAD',
  '02_BIM/VECTORWORKS',
  '02_BIM/EXCHANGE',
  '03_SKETCHUP',
  '04_3D_WORKFILES/3DSMAX',
  '04_3D_WORKFILES/MAYA',
  '04_3D_WORKFILES/BLENDER',
  '04_3D_WORKFILES/RHINO',
  '04_3D_WORKFILES/CINEMA4D',
  '04_3D_WORKFILES/HOUDINI',
  '04_3D_WORKFILES/TWINMOTION',
  '05_GRAPHIC/ILLUSTRATOR',
  '05_GRAPHIC/PHOTOSHOP',
  '05_GRAPHIC/INDESIGN',
  '05_GRAPHIC/AFTER_EFFECTS',
  '05_GRAPHIC/PREMIERE',
  '06_ASSETS/MODEL',
  '06_ASSETS/IMAGE',
  '06_ASSETS/VIDEO',
  '06_ASSETS/OTHER',
  '07_DOCUMENT',
  '98_REVIEW',
];

const MANAGED_PROJECT_FOLDERS = new Set(PROJECT_STRUCTURE.map((relativePath) => relativePath.split('/')[0]));

const PACKAGE_EXTENSION_GROUPS = {
  workfiles: [
    { extensions: ['.max'], folder: '04_3D_WORKFILES/3DSMAX', label: '3D WORKFILES / 3DSMAX' },
    { extensions: ['.ma', '.mb'], folder: '04_3D_WORKFILES/MAYA', label: '3D WORKFILES / MAYA' },
    { extensions: ['.blend'], folder: '04_3D_WORKFILES/BLENDER', label: '3D WORKFILES / BLENDER' },
    { extensions: ['.3dm'], folder: '04_3D_WORKFILES/RHINO', label: '3D WORKFILES / RHINO' },
    { extensions: ['.c4d'], folder: '04_3D_WORKFILES/CINEMA4D', label: '3D WORKFILES / CINEMA4D' },
    { extensions: ['.hip', '.hiplc', '.hipnc'], folder: '04_3D_WORKFILES/HOUDINI', label: '3D WORKFILES / HOUDINI' },
    { extensions: ['.tm'], folder: '04_3D_WORKFILES/TWINMOTION', label: '3D WORKFILES / TWINMOTION' },
  ],
  models: ['.fbx', '.obj', '.glb', '.gltf', '.dae', '.3ds', '.stl', '.3mf', '.step', '.stp', '.iges', '.igs', '.sat'],
  graphics: [
    { extensions: ['.ai', '.ait'], folder: '05_GRAPHIC/ILLUSTRATOR', label: 'GRAPHIC / ILLUSTRATOR' },
    { extensions: ['.psd', '.psb'], folder: '05_GRAPHIC/PHOTOSHOP', label: 'GRAPHIC / PHOTOSHOP' },
    { extensions: ['.indd', '.indt', '.idml'], folder: '05_GRAPHIC/INDESIGN', label: 'GRAPHIC / INDESIGN' },
    { extensions: ['.aep', '.aepx', '.aet'], folder: '05_GRAPHIC/AFTER_EFFECTS', label: 'GRAPHIC / AFTER EFFECTS' },
    { extensions: ['.prproj', '.pproj'], folder: '05_GRAPHIC/PREMIERE', label: 'GRAPHIC / PREMIERE' },
  ],
  images: ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp', '.gif', '.exr', '.hdr'],
  videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv', '.mpeg', '.mpg', '.mts', '.m2ts'],
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.hwp', '.hwpx'],
};

const MODEL_EXTENSIONS = new Set(PACKAGE_EXTENSION_GROUPS.models);
const IMAGE_EXTENSIONS = new Set(PACKAGE_EXTENSION_GROUPS.images);
const VIDEO_EXTENSIONS = new Set(PACKAGE_EXTENSION_GROUPS.videos);
const DOCUMENT_EXTENSIONS = new Set(PACKAGE_EXTENSION_GROUPS.documents);

const EXTENSION_GROUPS = [
  [['.dwg', '.dxf', '.dwt', '.dws'], '01_CAD/AUTOCAD', 'CAD / AUTOCAD'],
  [['.dgn'], '01_CAD/MICROSTATION', 'CAD / MICROSTATION'],
  [['.rvt', '.rfa', '.rte', '.rft'], '02_BIM/REVIT', 'BIM / REVIT'],
  [['.pln', '.pla', '.tpl', '.bpn'], '02_BIM/ARCHICAD', 'BIM / ARCHICAD'],
  [['.vwx'], '02_BIM/VECTORWORKS', 'BIM / VECTORWORKS'],
  [['.ifc'], '02_BIM/EXCHANGE', 'BIM / EXCHANGE'],
  [['.skp'], '03_SKETCHUP', 'SKETCHUP'],
  [['.max'], '04_3D_WORKFILES/3DSMAX', '3D WORKFILES / 3DSMAX'],
  [['.ma', '.mb'], '04_3D_WORKFILES/MAYA', '3D WORKFILES / MAYA'],
  [['.blend'], '04_3D_WORKFILES/BLENDER', '3D WORKFILES / BLENDER'],
  [['.3dm'], '04_3D_WORKFILES/RHINO', '3D WORKFILES / RHINO'],
  [['.c4d'], '04_3D_WORKFILES/CINEMA4D', '3D WORKFILES / CINEMA4D'],
  [['.hip', '.hiplc', '.hipnc'], '04_3D_WORKFILES/HOUDINI', '3D WORKFILES / HOUDINI'],
  [['.tm'], '04_3D_WORKFILES/TWINMOTION', '3D WORKFILES / TWINMOTION'],
  [['.fbx', '.obj', '.glb', '.gltf', '.dae', '.3ds', '.stl', '.3mf', '.step', '.stp', '.iges', '.igs', '.sat'], '06_ASSETS/MODEL', 'ASSETS / MODEL'],
  [['.ai', '.ait'], '05_GRAPHIC/ILLUSTRATOR', 'GRAPHIC / ILLUSTRATOR'],
  [['.psd', '.psb'], '05_GRAPHIC/PHOTOSHOP', 'GRAPHIC / PHOTOSHOP'],
  [['.indd', '.indt', '.idml'], '05_GRAPHIC/INDESIGN', 'GRAPHIC / INDESIGN'],
  [['.aep', '.aepx', '.aet'], '05_GRAPHIC/AFTER_EFFECTS', 'GRAPHIC / AFTER EFFECTS'],
  [['.prproj', '.pproj'], '05_GRAPHIC/PREMIERE', 'GRAPHIC / PREMIERE'],
  [['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp', '.gif', '.exr', '.hdr'], '06_ASSETS/IMAGE', 'ASSETS / IMAGE'],
  [['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv', '.mpeg', '.mpg', '.mts', '.m2ts'], '06_ASSETS/VIDEO', 'ASSETS / VIDEO'],
  [['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.hwp', '.hwpx'], '07_DOCUMENT', 'DOCUMENT'],
];

const EXTENSION_RULES = new Map();
for (const [extensions, folder, label] of EXTENSION_GROUPS) {
  for (const extension of extensions) EXTENSION_RULES.set(extension, { folder, label });
}

const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(path.resolve(parentPath), path.resolve(candidatePath));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function validateProjectName(value) {
  const name = String(value ?? '').trim();
  if (!name) throw new Error('프로젝트 이름을 입력하세요.');
  if (name === '.' || name === '..' || /[<>:"/\\|?*]/.test(name) || /[. ]$/.test(name)) {
    throw new Error('Windows 폴더 이름으로 사용할 수 없는 프로젝트 이름입니다.');
  }
  if (WINDOWS_RESERVED_NAMES.test(name)) throw new Error('Windows 예약 이름은 프로젝트 이름으로 사용할 수 없습니다.');
  return name;
}

function classifyFile(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.uproject') {
    return {
      action: 'review-only',
      folder: '98_REVIEW',
      label: '폴더형 프로젝트 · 자동 이동 제외',
      extension,
    };
  }
  const rule = EXTENSION_RULES.get(extension);
  if (rule) return { action: 'move', ...rule, extension };
  return { action: 'move', folder: '06_ASSETS/OTHER', label: 'ASSETS / OTHER', extension };
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function ensureProjectStructure(projectPath) {
  await Promise.all(PROJECT_STRUCTURE.map((relativePath) => ensureDirectory(path.join(projectPath, relativePath))));
}

async function createProject(rootPath, rawName) {
  const root = path.resolve(rootPath);
  const name = validateProjectName(rawName);
  const projectPath = path.join(root, name);
  if (!isPathInside(root, projectPath)) throw new Error('ROOT 밖에는 프로젝트를 만들 수 없습니다.');
  try {
    await fs.mkdir(projectPath, { recursive: false });
  } catch (error) {
    if (error?.code === 'EEXIST') throw new Error('같은 이름의 프로젝트가 이미 있습니다.');
    throw error;
  }
  await ensureProjectStructure(projectPath);
  return projectPath;
}

async function listProjects(rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => ({ name: entry.name, path: path.join(rootPath, entry.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

function timestampForPath() {
  return new Date().toISOString().replace(/[-:]/g, '').replace('.', '-');
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function directorySnapshot(directoryPath) {
  const snapshot = { directoryCount: 0, fileCount: 0, totalSize: 0, latestMtimeMs: 0, hasSymbolicLink: false };

  async function visit(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isSymbolicLink()) {
        snapshot.hasSymbolicLink = true;
        continue;
      }
      if (entry.isDirectory()) {
        snapshot.directoryCount += 1;
        await visit(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const stat = await fs.stat(entryPath);
      snapshot.fileCount += 1;
      snapshot.totalSize += stat.size;
      snapshot.latestMtimeMs = Math.max(snapshot.latestMtimeMs, stat.mtimeMs);
    }
  }

  await visit(directoryPath);
  return snapshot;
}

function sameDirectorySnapshot(left, right) {
  return left.fileCount === right.fileCount
    && left.directoryCount === right.directoryCount
    && left.totalSize === right.totalSize
    && left.latestMtimeMs === right.latestMtimeMs
    && left.hasSymbolicLink === right.hasSymbolicLink;
}

async function waitForDirectoryStability(directoryPath, {
  intervalMs = 500,
  stableSamples = 3,
  maxWaitMs = 30_000,
} = {}) {
  const startedAt = Date.now();
  let previous = null;
  let consecutiveStableSamples = 0;

  while (Date.now() - startedAt < maxWaitMs) {
    let current;
    try {
      current = await directorySnapshot(directoryPath);
    } catch (error) {
      if (error?.code === 'ENOENT') return { status: 'missing', elapsedMs: Date.now() - startedAt };
      throw error;
    }

    if (current.fileCount > 0 && previous && sameDirectorySnapshot(previous, current)) consecutiveStableSamples += 1;
    else consecutiveStableSamples = 0;

    if (consecutiveStableSamples >= stableSamples) {
      return { status: 'stable', elapsedMs: Date.now() - startedAt, snapshot: current };
    }

    previous = current;
    await delay(intervalMs);
  }

  return { status: 'waiting', elapsedMs: Date.now() - startedAt, snapshot: previous };
}

async function collectPackageExtensions(directoryPath) {
  const extensions = new Set();
  const files = [];
  let hasSymbolicLink = false;

  async function visit(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isSymbolicLink()) {
        hasSymbolicLink = true;
        continue;
      }
      if (entry.isDirectory()) {
        await visit(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      extensions.add(extension);
      files.push({ path: entryPath, extension });
    }
  }

  await visit(directoryPath);
  return { extensions, files, hasSymbolicLink };
}

function matchingFamilies(extensions, groups) {
  return groups.filter((group) => group.extensions.some((extension) => extensions.has(extension)));
}

async function classifyDirectoryPackage(directoryPath) {
  const inventory = await collectPackageExtensions(directoryPath);
  const { extensions, files, hasSymbolicLink } = inventory;

  if (hasSymbolicLink) {
    return { action: 'move-review', folder: '98_REVIEW', label: '링크 포함 폴더 · 자동분류 판단 필요', reason: 'symbolic-link' };
  }
  if (extensions.has('.uproject')) {
    return { action: 'review-only', folder: '98_REVIEW', label: '폴더형 프로젝트 · 자동 이동 제외', reason: 'folder-project' };
  }

  const workfileFamilies = matchingFamilies(extensions, PACKAGE_EXTENSION_GROUPS.workfiles);
  if (workfileFamilies.length > 1) {
    return { action: 'move-review', folder: '98_REVIEW', label: '여러 종류의 주 작업파일이 포함된 폴더 · 자동분류 판단 필요', reason: 'mixed-workfiles' };
  }
  if (workfileFamilies.length === 1) {
    return { action: 'move', ...workfileFamilies[0], reason: 'workfile-package' };
  }

  if ([...extensions].some((extension) => MODEL_EXTENSIONS.has(extension))) {
    return { action: 'move', folder: '06_ASSETS/MODEL', label: '3D 모델 자산 패키지', reason: 'model-package' };
  }

  const graphicFamilies = matchingFamilies(extensions, PACKAGE_EXTENSION_GROUPS.graphics);
  if (graphicFamilies.length > 1) {
    return { action: 'move-review', folder: '98_REVIEW', label: '여러 종류의 Graphic 작업파일이 포함된 폴더 · 자동분류 판단 필요', reason: 'mixed-graphics' };
  }
  if (graphicFamilies.length === 1) {
    return { action: 'move', ...graphicFamilies[0], reason: 'graphic-package' };
  }

  const packageExtensions = [...extensions];
  if (files.length > 0 && packageExtensions.every((extension) => IMAGE_EXTENSIONS.has(extension))) {
    return { action: 'move', folder: '06_ASSETS/IMAGE', label: '이미지·텍스처 자산 패키지', reason: 'image-package' };
  }
  if (files.length > 0 && packageExtensions.every((extension) => VIDEO_EXTENSIONS.has(extension))) {
    return { action: 'move', folder: '06_ASSETS/VIDEO', label: '영상 자산 패키지', reason: 'video-package' };
  }
  if (files.length > 0 && packageExtensions.every((extension) => DOCUMENT_EXTENSIONS.has(extension))) {
    return { action: 'move', folder: '07_DOCUMENT', label: '문서 자산 패키지', reason: 'document-package' };
  }

  return { action: 'move-review', folder: '98_REVIEW', label: '구성이 명확하지 않은 폴더 · 자동분류 판단 필요', reason: 'ambiguous-package' };
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
}

async function appendReview(projectPath, review) {
  const logPath = path.join(projectPath, '98_REVIEW', '검토필요.json');
  let records = [];
  try {
    const parsed = JSON.parse(await fs.readFile(logPath, 'utf8'));
    if (Array.isArray(parsed)) records = parsed;
  } catch (error) {
    if (error?.code !== 'ENOENT') records = [];
  }
  records.unshift({ at: new Date().toISOString(), ...review });
  await writeJsonAtomic(logPath, records.slice(0, 200));
}

async function moveConflictToReview(projectPath, sourcePath, reason) {
  const conflictDirectory = path.join(projectPath, '98_REVIEW', `충돌-${timestampForPath()}`);
  await ensureDirectory(conflictDirectory);
  const destinationPath = path.join(conflictDirectory, path.basename(sourcePath));
  await fs.rename(sourcePath, destinationPath);
  await appendReview(projectPath, {
    entry: path.basename(sourcePath),
    status: '동일한 이름의 파일 또는 폴더가 존재하여 확인이 필요합니다.',
    reason,
    location: path.relative(projectPath, destinationPath),
  });
  return destinationPath;
}

async function movePackageToReview(projectPath, sourcePath, classification) {
  const reviewDirectory = path.join(projectPath, '98_REVIEW', `검토-${timestampForPath()}`);
  await ensureDirectory(reviewDirectory);
  const destinationPath = path.join(reviewDirectory, path.basename(sourcePath));
  await fs.rename(sourcePath, destinationPath);
  await appendReview(projectPath, {
    entry: path.basename(sourcePath),
    status: classification.label,
    reason: classification.reason,
    location: path.relative(projectPath, destinationPath),
  });
  return destinationPath;
}

async function processTopLevelFile(projectPath, filePath, onEvent = () => {}) {
  const project = path.resolve(projectPath);
  const source = path.resolve(filePath);
  if (path.dirname(source) !== project) return { status: 'ignored', reason: 'project-top-level-only' };

  let stat;
  try {
    stat = await fs.lstat(source);
  } catch (error) {
    if (error?.code === 'ENOENT') return { status: 'ignored', reason: 'missing' };
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    if (stat.isSymbolicLink()) {
      await appendReview(project, { file: path.basename(source), status: '링크 파일 · 자동 이동 제외', reason: 'symbolic-link' });
    }
    return { status: 'ignored', reason: 'not-regular-file' };
  }

  const classification = classifyFile(path.basename(source));
  if (classification.action === 'review-only') {
    await appendReview(project, {
      file: path.basename(source),
      status: classification.label,
      reason: 'folder-project',
      location: path.relative(project, source),
    });
    const result = { status: 'review', source, classification, moved: false };
    onEvent(result);
    return result;
  }

  const destinationDirectory = path.join(project, classification.folder);
  const destinationPath = path.join(destinationDirectory, path.basename(source));
  await ensureDirectory(destinationDirectory);

  try {
    await fs.access(destinationPath);
    const reviewPath = await moveConflictToReview(project, source, 'duplicate-name');
    const result = { status: 'review', source, destination: reviewPath, classification, moved: true };
    onEvent(result);
    return result;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  try {
    await fs.rename(source, destinationPath);
    const result = { status: 'moved', source, destination: destinationPath, classification, moved: true };
    onEvent(result);
    return result;
  } catch (error) {
    await appendReview(project, {
      file: path.basename(source),
      status: '파일 이동 실패 · 원본 위치에서 확인 필요',
      reason: error?.code ?? 'move-error',
      location: path.relative(project, source),
    });
    const result = { status: 'error', source, classification, moved: false, error: error?.message };
    onEvent(result);
    return result;
  }
}

async function processTopLevelDirectory(projectPath, directoryPath, onEvent = () => {}, stabilityOptions = {}) {
  const project = path.resolve(projectPath);
  const source = path.resolve(directoryPath);
  if (path.dirname(source) !== project) return { status: 'ignored', reason: 'project-top-level-only' };
  if (MANAGED_PROJECT_FOLDERS.has(path.basename(source))) return { status: 'ignored', reason: 'managed-project-folder' };

  let stat;
  try {
    stat = await fs.lstat(source);
  } catch (error) {
    if (error?.code === 'ENOENT') return { status: 'ignored', reason: 'missing' };
    throw error;
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    if (stat.isSymbolicLink()) {
      await appendReview(project, { entry: path.basename(source), status: '링크 폴더 · 자동 이동 제외', reason: 'symbolic-link' });
    }
    return { status: 'ignored', reason: 'not-regular-directory' };
  }

  const stability = await waitForDirectoryStability(source, stabilityOptions);
  if (stability.status !== 'stable') {
    const result = { status: stability.status, source, kind: 'folder', moved: false, stability };
    onEvent(result);
    return result;
  }

  const classification = await classifyDirectoryPackage(source);
  if (classification.action === 'review-only') {
    await appendReview(project, {
      entry: path.basename(source),
      status: classification.label,
      reason: classification.reason,
      location: path.relative(project, source),
    });
    const result = { status: 'review', source, kind: 'folder', classification, moved: false, stability };
    onEvent(result);
    return result;
  }

  if (classification.action === 'move-review') {
    try {
      const destinationPath = await movePackageToReview(project, source, classification);
      const result = { status: 'review', source, destination: destinationPath, kind: 'folder', classification, moved: true, stability };
      onEvent(result);
      return result;
    } catch (error) {
      if (error?.code === 'ENOENT') return { status: 'ignored', reason: 'missing' };
      await appendReview(project, {
        entry: path.basename(source),
        status: '폴더 이동 실패 · 원본 위치에서 확인 필요',
        reason: error?.code ?? 'move-error',
        location: path.relative(project, source),
      });
      const result = { status: 'error', source, kind: 'folder', classification, moved: false, error: error?.message };
      onEvent(result);
      return result;
    }
  }

  const destinationDirectory = path.join(project, classification.folder);
  const destinationPath = path.join(destinationDirectory, path.basename(source));
  await ensureDirectory(destinationDirectory);

  try {
    await fs.access(destinationPath);
    const reviewPath = await moveConflictToReview(project, source, 'duplicate-folder-name');
    const result = { status: 'review', source, destination: reviewPath, kind: 'folder', classification, moved: true, stability };
    onEvent(result);
    return result;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  try {
    await fs.rename(source, destinationPath);
    const result = { status: 'moved', source, destination: destinationPath, kind: 'folder', classification, moved: true, stability };
    onEvent(result);
    return result;
  } catch (error) {
    if (error?.code === 'ENOENT') return { status: 'ignored', reason: 'missing' };
    await appendReview(project, {
      entry: path.basename(source),
      status: '폴더 이동 실패 · 원본 위치에서 확인 필요',
      reason: error?.code ?? 'move-error',
      location: path.relative(project, source),
    });
    const result = { status: 'error', source, kind: 'folder', classification, moved: false, error: error?.message };
    onEvent(result);
    return result;
  }
}

async function scanProject(projectPath, onEvent = () => {}) {
  const entries = await fs.readdir(projectPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    results.push(await processTopLevelFile(projectPath, path.join(projectPath, entry.name), onEvent));
  }
  return results;
}

async function scanProjectEntries(projectPath, onEvent = () => {}, stabilityOptions = {}) {
  const entries = await fs.readdir(projectPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const entryPath = path.join(projectPath, entry.name);
    if (entry.isFile() || entry.isSymbolicLink()) {
      results.push(await processTopLevelFile(projectPath, entryPath, onEvent));
    } else if (entry.isDirectory() && !MANAGED_PROJECT_FOLDERS.has(entry.name)) {
      results.push(await processTopLevelDirectory(projectPath, entryPath, onEvent, stabilityOptions));
    }
  }
  return results;
}

async function countFiles(directoryPath) {
  let total = 0;
  let entries;
  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return 0;
    throw error;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) total += await countFiles(path.join(directoryPath, entry.name));
    else if (entry.isFile()) total += 1;
  }
  return total;
}

async function projectCounts(projectPath) {
  const groups = {
    CAD: '01_CAD',
    BIM: '02_BIM',
    SketchUp: '03_SKETCHUP',
    '3D Workfiles': '04_3D_WORKFILES',
    Graphic: '05_GRAPHIC',
    Model: '06_ASSETS/MODEL',
    Image: '06_ASSETS/IMAGE',
    Video: '06_ASSETS/VIDEO',
    Other: '06_ASSETS/OTHER',
    Document: '07_DOCUMENT',
    Review: '98_REVIEW',
  };
  const counts = {};
  for (const [label, relativePath] of Object.entries(groups)) {
    counts[label] = await countFiles(path.join(projectPath, relativePath));
  }
  return counts;
}

class OrganizerService {
  constructor({ settingsPath, onEvent = () => {}, stabilityOptions = {} }) {
    this.settingsPath = settingsPath;
    this.onEvent = onEvent;
    this.stabilityOptions = {
      intervalMs: 500,
      stableSamples: 3,
      maxWaitMs: 30_000,
      ...stabilityOptions,
    };
    this.rootPath = null;
    this.rootWatcher = null;
    this.projectWatchers = new Map();
    this.processingPaths = new Set();
    this.retryTimers = new Map();
    this.events = [];
    this.watchStatus = 'stopped';
  }

  emit(event) {
    const enriched = { at: new Date().toISOString(), ...event };
    this.events.unshift(enriched);
    this.events = this.events.slice(0, 100);
    this.onEvent(enriched);
  }

  async loadSavedRoot() {
    try {
      const settings = JSON.parse(await fs.readFile(this.settingsPath, 'utf8'));
      if (typeof settings.rootPath !== 'string') return null;
      const stat = await fs.stat(settings.rootPath);
      if (!stat.isDirectory()) return null;
      this.rootPath = path.resolve(settings.rootPath);
      return this.rootPath;
    } catch {
      return null;
    }
  }

  async setRoot(rootPath) {
    const resolved = path.resolve(rootPath);
    const stat = await fs.stat(resolved);
    if (!stat.isDirectory()) throw new Error('ROOT로 사용할 폴더를 선택하세요.');
    await this.close();
    this.rootPath = resolved;
    await writeJsonAtomic(this.settingsPath, { rootPath: resolved });
    await this.start();
    return this.snapshot();
  }

  async createProject(name) {
    if (!this.rootPath) throw new Error('먼저 ROOT 폴더를 선택하세요.');
    const projectPath = await createProject(this.rootPath, name);
    await this.addProjectWatcher(projectPath);
    this.emit({ status: 'project-created', project: path.basename(projectPath) });
    return this.snapshot();
  }

  processingKey(entryPath) {
    const resolved = path.resolve(entryPath);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  }

  scheduleDirectoryRetry(projectPath, directoryPath) {
    const key = this.processingKey(directoryPath);
    if (this.retryTimers.has(key)) return;
    const timer = setTimeout(() => {
      this.retryTimers.delete(key);
      this.processProjectEntry(projectPath, directoryPath).catch((error) => {
        if (error?.code !== 'ENOENT') this.emit({ status: 'error', project: path.basename(projectPath), file: path.basename(directoryPath), error: error.message });
      });
    }, 2_000);
    this.retryTimers.set(key, timer);
  }

  async processProjectEntry(projectPath, entryPath, { initialScan = false } = {}) {
    const resolvedProject = path.resolve(projectPath);
    const resolvedEntry = path.resolve(entryPath);
    if (path.dirname(resolvedEntry) !== resolvedProject) return { status: 'ignored', reason: 'project-top-level-only' };

    const key = this.processingKey(resolvedEntry);
    if (this.processingPaths.has(key)) return { status: 'ignored', reason: 'already-processing' };
    this.processingPaths.add(key);

    try {
      let stat;
      try {
        stat = await fs.lstat(resolvedEntry);
      } catch (error) {
        if (error?.code === 'ENOENT') return { status: 'ignored', reason: 'missing' };
        throw error;
      }

      const projectName = path.basename(resolvedProject);
      const forward = (event) => this.emit({ project: projectName, initialScan, ...event });
      let result;
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        if (MANAGED_PROJECT_FOLDERS.has(path.basename(resolvedEntry))) return { status: 'ignored', reason: 'managed-project-folder' };
        this.emit({ status: 'package-waiting', project: projectName, file: path.basename(resolvedEntry), kind: 'folder' });
        result = await processTopLevelDirectory(resolvedProject, resolvedEntry, forward, this.stabilityOptions);
        if (result.status === 'waiting') this.scheduleDirectoryRetry(resolvedProject, resolvedEntry);
      } else {
        result = await processTopLevelFile(resolvedProject, resolvedEntry, forward);
      }
      return result;
    } finally {
      this.processingPaths.delete(key);
    }
  }

  async scanProjectEntries(projectPath) {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const tasks = entries
      .filter((entry) => !entry.isDirectory() || !MANAGED_PROJECT_FOLDERS.has(entry.name))
      .map((entry) => this.processProjectEntry(projectPath, path.join(projectPath, entry.name), { initialScan: true }));
    return Promise.all(tasks);
  }

  async addProjectWatcher(projectPath) {
    const resolved = path.resolve(projectPath);
    if (this.projectWatchers.has(resolved)) return;
    await ensureProjectStructure(resolved);
    const watcher = chokidar.watch(resolved, {
      persistent: true,
      ignoreInitial: true,
      depth: 0,
      followSymlinks: false,
      usePolling: process.platform === 'win32',
      interval: 100,
      binaryInterval: 300,
      awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
    });
    this.projectWatchers.set(resolved, watcher);
    watcher.on('add', (filePath) => {
      this.processProjectEntry(resolved, filePath)
        .catch((error) => {
          if (error?.code !== 'ENOENT') this.emit({ status: 'error', project: path.basename(resolved), file: path.basename(filePath), error: error.message });
        });
    });
    watcher.on('addDir', (directoryPath) => {
      this.processProjectEntry(resolved, directoryPath)
        .catch((error) => {
          if (error?.code !== 'ENOENT') this.emit({ status: 'error', project: path.basename(resolved), file: path.basename(directoryPath), error: error.message });
        });
    });
    watcher.on('error', (error) => {
      this.watchStatus = 'error';
      this.emit({ status: 'watch-error', project: path.basename(resolved), error: error.message });
    });
    await new Promise((resolveReady, rejectReady) => {
      watcher.once('ready', resolveReady);
      watcher.once('error', rejectReady);
    });
    await this.scanProjectEntries(resolved);
  }

  async start() {
    if (!this.rootPath) await this.loadSavedRoot();
    if (!this.rootPath) return null;
    await this.close();
    this.watchStatus = 'preparing';
    this.rootWatcher = chokidar.watch(this.rootPath, {
      persistent: true,
      ignoreInitial: true,
      depth: 0,
      followSymlinks: false,
      usePolling: process.platform === 'win32',
      interval: 150,
    });
    this.rootWatcher.on('addDir', async (directoryPath) => {
      if (path.dirname(path.resolve(directoryPath)) !== this.rootPath) return;
      if (path.basename(directoryPath).startsWith('.')) return;
      try {
        await this.addProjectWatcher(directoryPath);
        this.emit({ status: 'project-detected', project: path.basename(directoryPath) });
      } catch (error) {
        this.emit({ status: 'error', project: path.basename(directoryPath), error: error.message });
      }
    });
    this.rootWatcher.on('error', (error) => {
      this.watchStatus = 'error';
      this.emit({ status: 'watch-error', error: error.message });
    });
    await new Promise((resolveReady, rejectReady) => {
      this.rootWatcher.once('ready', resolveReady);
      this.rootWatcher.once('error', rejectReady);
    });
    const projects = await listProjects(this.rootPath);
    for (const project of projects) await this.addProjectWatcher(project.path);
    this.watchStatus = 'active';
    this.emit({ status: 'watch-ready' });
    return this.snapshot();
  }

  async close() {
    for (const timer of this.retryTimers.values()) clearTimeout(timer);
    this.retryTimers.clear();
    const watchers = [...this.projectWatchers.values()];
    this.projectWatchers.clear();
    if (this.rootWatcher) watchers.push(this.rootWatcher);
    this.rootWatcher = null;
    await Promise.all(watchers.map((watcher) => watcher.close()));
    this.watchStatus = 'stopped';
  }

  async snapshot() {
    if (!this.rootPath) return { rootPath: null, projects: [], events: this.events, watching: false, watchStatus: 'stopped' };
    const projects = await listProjects(this.rootPath);
    const withCounts = [];
    for (const project of projects) {
      withCounts.push({ name: project.name, path: project.path, counts: await projectCounts(project.path) });
    }
    return {
      rootPath: this.rootPath,
      projects: withCounts,
      events: this.events,
      watching: this.watchStatus === 'active' && this.projectWatchers.size > 0,
      watchStatus: this.watchStatus,
    };
  }
}

module.exports = {
  EXTENSION_GROUPS,
  EXTENSION_RULES,
  PROJECT_STRUCTURE,
  MANAGED_PROJECT_FOLDERS,
  PACKAGE_EXTENSION_GROUPS,
  OrganizerService,
  classifyDirectoryPackage,
  classifyFile,
  collectPackageExtensions,
  createProject,
  directorySnapshot,
  ensureProjectStructure,
  isPathInside,
  listProjects,
  processTopLevelDirectory,
  processTopLevelFile,
  projectCounts,
  scanProject,
  scanProjectEntries,
  validateProjectName,
  waitForDirectoryStability,
};
