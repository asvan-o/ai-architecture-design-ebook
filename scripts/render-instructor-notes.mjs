import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const [mode, outputDirectory] = process.argv.slice(2);
if (!['student', 'instructor'].includes(mode) || !outputDirectory) {
  console.error('사용법: node scripts/render-instructor-notes.mjs <student|instructor> <output>');
  process.exit(1);
}

const outputPath = path.resolve(outputDirectory);
const privateNoteDirectory = path.resolve(
  process.env.INSTRUCTOR_CONTENT_DIR ?? path.join('instructor-content', 'lessons'),
);
const noteTypes = [
  'instructor-script',
  'question-cue',
  'demo-warning',
  'fallback',
  'timing',
  'verification',
  'answer-key',
];

const typeLabels = {
  'instructor-script': '강사 멘트',
  'question-cue': '질문 큐',
  'demo-warning': '시연 주의',
  fallback: '백업',
  timing: '시간 운영',
  verification: '검증',
  'answer-key': '해설',
};

const collectHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(entryPath);
    return entry.name.endsWith('.html') ? [entryPath] : [];
  }));
  return nested.flat();
};

const parseNotes = (source, filePath) => {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const notes = [];
  for (let index = 0; index < lines.length; index += 1) {
    const slotMatch = lines[index].match(/^\s{2}- slot:\s*"([^"]+)"\s*$/);
    if (!slotMatch) continue;
    const type = lines[index + 1]?.match(/^\s{4}type:\s*"([^"]+)"\s*$/)?.[1];
    if (!noteTypes.includes(type)) {
      throw new Error(`${filePath}: ${slotMatch[1]}의 메모 유형이 올바르지 않습니다.`);
    }
    if (!/^\s{4}body:\s*\|\s*$/.test(lines[index + 2] ?? '')) {
      throw new Error(`${filePath}: ${slotMatch[1]}의 body는 YAML 블록 문자열이어야 합니다.`);
    }
    const bodyLines = [];
    index += 3;
    while (index < lines.length && !/^\s{2}- slot:/.test(lines[index])) {
      if (lines[index].startsWith('      ')) {
        bodyLines.push(lines[index].slice(6));
      } else if (lines[index].trim() !== '') {
        throw new Error(`${filePath}: ${slotMatch[1]} body 들여쓰기가 올바르지 않습니다.`);
      }
      index += 1;
    }
    index -= 1;
    const body = bodyLines.join('\n').trim();
    if (!body) throw new Error(`${filePath}: ${slotMatch[1]} 메모가 비어 있습니다.`);
    notes.push({ slot: slotMatch[1], type, body });
  }
  return new Map(notes.map((note) => [note.slot, note]));
};

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const templatePattern =
  /<span hidden data-instructor-note-template="([^"]+)" data-instructor-lesson="([^"]+)" data-instructor-label="([^"]*)">INSTRUCTOR_NOTE_SLOT<\/span>/g;
const htmlFiles = await collectHtmlFiles(outputPath);
const noteSources = new Map();
if (mode === 'instructor' && existsSync(privateNoteDirectory)) {
  const noteFiles = (await readdir(privateNoteDirectory))
    .filter((fileName) => fileName.endsWith('.yaml'));
  await Promise.all(noteFiles.map(async (fileName) => {
    const filePath = path.join(privateNoteDirectory, fileName);
    noteSources.set(filePath, await readFile(filePath, 'utf8'));
  }));
}
let transformedSlots = 0;

for (const htmlFile of htmlFiles) {
  const source = await readFile(htmlFile, 'utf8');
  const transformed = source.replace(
    templatePattern,
    (_template, slot, lessonId, label) => {
      transformedSlots += 1;
      if (mode === 'student') return '';

      const notePath = path.join(privateNoteDirectory, `${lessonId}.yaml`);
      const notes = noteSources.has(notePath)
        ? parseNotes(
            noteSources.get(notePath),
            notePath,
          )
        : new Map();
      const note = notes.get(slot);
      const noteType = note ? typeLabels[note.type] : '메모 없음';
      const body = note?.body ?? '이 슬롯의 로컬 강사 메모가 없습니다.';
      return `<aside class="instructor-note" data-instructor-note-slot="${escapeHtml(slot)}" aria-labelledby="${escapeHtml(slot)}-title"><header><span>INSTRUCTOR ONLY · LOCAL BUILD</span><strong id="${escapeHtml(slot)}-title">${escapeHtml(label)}</strong><small>${escapeHtml(noteType)}</small></header><p>${escapeHtml(body)}</p></aside>`;
    },
  );
  if (transformed !== source) await writeFile(htmlFile, transformed, 'utf8');
}

if (mode === 'instructor' && transformedSlots === 0) {
  console.error('강사 메모 슬롯 템플릿을 찾지 못했습니다.');
  process.exit(1);
}

console.log(`${mode} 빌드 강사 메모 슬롯 변환 성공: ${transformedSlots}개`);
