import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const read = file => fs.readFileSync(file, 'utf8');
const compile = file => import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(read(file), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64'));
const { workbookGlossary: terms, glossaryCategories: categories, sectionTermNotes: notes } = await compile('src/draft/content/workbook-glossary.ts');
const { selectWorkbookPrintGlossary } = await compile('src/draft/content/workbook-print-glossary.ts');
const { overviewSections } = await compile('src/draft/content/daejeon-2026.ts');
const portfolioSource = JSON.parse(read('src/draft/content/lesson111213.json'));
const sectionLabels = Object.fromEntries([
  ...overviewSections.map((section, index) => [`overview:${section.id}`, `과정 안내 §${String(index + 1).padStart(2, '0')} · ${section.title}`]),
  ...Object.entries(portfolioSource.lessons).flatMap(([id, lesson]) => lesson.sections.map(section => [`${id}:${section.id}`, `제${Number(id)}차시 §${String(section.index).padStart(2, '0')} · ${section.title}`])),
]);
const lessonIds = Array.from({ length: 13 }, (_, index) => String(index + 1).padStart(2, '0'));

test('차시 부록은 명시적 관련 차시와 본문 주석 용어의 합집합을 중복 없이 선택한다', () => {
  const before = JSON.stringify({ terms, notes });
  for (const lessonId of lessonIds) {
    const expected = new Set(terms.filter(term => term.lessons.some(lesson => lesson.lessonId === lessonId)).map(term => term.id));
    for (const [section, ids] of Object.entries(notes)) if (section.startsWith(`${lessonId}:`)) ids.forEach(id => expected.add(id));
    const selected = selectWorkbookPrintGlossary(lessonId, terms, notes);
    assert.deepEqual(new Set(selected.map(entry => entry.term.id)), expected, lessonId);
    assert.equal(selected.length, expected.size, lessonId + ' duplicate terms');
    for (const entry of selected) {
      assert(entry.occurrences.length > 0, lessonId + ' ' + entry.term.id);
      assert(entry.occurrences.every(occurrence => occurrence.lessonId === lessonId), lessonId + ' cross-lesson label');
      assert.equal(new Set(entry.occurrences.map(occurrence => occurrence.sectionId)).size, entry.occurrences.length);
      for (const [section, ids] of Object.entries(notes)) {
        if (section.startsWith(`${lessonId}:`) && ids.includes(entry.term.id)) {
          assert(entry.occurrences.some(occurrence => occurrence.sectionId === section.slice(lessonId.length + 1)), section + ' note-only label missing');
        }
      }
    }
  }
  assert.equal(JSON.stringify({ terms, notes }), before, 'source data must not change');
});

test('주석에만 연결된 용어도 기존 섹션 라벨을 사용하고 없으면 실제 sectionId를 정직하게 표시한다', () => {
  const sample = terms.slice(0, 3).map(term => ({ ...term, lessons: [] }));
  sample[0].lessons = [{ lessonId: '04', sectionId: 'known-section', label: '제4차시 §08 · 기존 정확한 제목' }];
  const selected = selectWorkbookPrintGlossary('04', sample, {
    '04:known-section': [sample[0].id, sample[1].id],
    '04:unmapped-section': [sample[1].id],
    '05:unrelated-section': [sample[2].id],
  });
  assert.deepEqual(selected.map(entry => entry.term.id), [sample[0].id, sample[1].id]);
  assert.equal(selected[0].occurrences.length, 1);
  assert.equal(selected[1].occurrences[0].label, '제4차시 §08 · 기존 정확한 제목');
  assert.equal(selected[1].occurrences[1].label, '제4차시 · unmapped-section (본문 용어 주석)');
});

test('과정 안내 부록은 원자료 50개와 4분류를 모두 포함하고 관련 차시를 보존한다', () => {
  const selected = selectWorkbookPrintGlossary('overview', terms, notes);
  assert.equal(selected.length, 50);
  assert.deepEqual(selected.map(entry => entry.term.id), terms.map(term => term.id));
  assert.deepEqual(new Set(selected.map(entry => entry.term.category)), new Set(categories.map(category => category.id)));
  for (const entry of selected) for (const lesson of entry.term.lessons) {
    assert(entry.occurrences.some(occurrence => occurrence.lessonId === lesson.lessonId && occurrence.sectionId === lesson.sectionId && occurrence.label === lesson.label));
  }
});

test('실제 주석 전용 용어는 기존 과정 안내·차시 제목을 재사용하며 원시 앵커 표시가 남지 않는다', () => {
  for (const lessonId of ['overview', ...lessonIds]) {
    const selected = selectWorkbookPrintGlossary(lessonId, terms, notes, sectionLabels);
    for (const entry of selected) for (const occurrence of entry.occurrences) assert(!occurrence.label.includes('(본문 용어 주석)'), `${lessonId} ${entry.term.id} ${occurrence.sectionId}`);
  }
  const diagram = selectWorkbookPrintGlossary('11', terms, notes, sectionLabels).find(entry => entry.term.id === 'term-diagram');
  const sourceSection = portfolioSource.lessons['11'].sections.find(section => section.id === 'l11-portfolio-05');
  assert.equal(diagram.occurrences[0].label, `제11차시 §${String(sourceSection.index).padStart(2, '0')} · ${sourceSection.title}`);
  const prompt = terms.find(term => term.id === 'term-prompt');
  const explicit = prompt.lessons.find(lesson => lesson.lessonId === '01');
  const selected = selectWorkbookPrintGlossary('01', terms, notes, { [`01:${explicit.sectionId}`]: '기존 용어 라벨을 덮어쓰면 안 됨' });
  assert.equal(selected.find(entry => entry.term.id === prompt.id).occurrences.find(occurrence => occurrence.sectionId === explicit.sectionId).label, explicit.label);
});

test('인쇄 부록은 정적 내용이며 웹의 기존 차시 섹션 수와 탐색 흐름을 변경하지 않는다', () => {
  const component = read('src/draft/components/WorkbookPrintGlossaryAppendix.astro');
  for (const field of ['term.korean', 'term.english', 'term.acronym', 'term.definition', 'term.context', 'term.why', 'occurrence.label']) assert(component.includes(field), field);
  for (const marker of ['data-workbook-print-glossary', 'data-print-glossary-category', 'data-print-glossary-term', 'data-print-glossary-occurrences', 'data-print-glossary-section']) assert(component.includes(marker), marker);
  assert(component.includes('category.description'));
  assert(component.includes('부록 · 실무 워크북 핵심 용어 사전 (전체 50선)'));
  assert(component.includes('부록 · 제${Number(lessonId)}차시 핵심 용어 정리'));
  assert.match(component, /\.workbook-print-glossary-appendix\s*\{\s*display:\s*none;/);
  assert.match(component, /@media print\s*\{\s*\.workbook-print-glossary-appendix\s*\{\s*display:\s*block;/);
  assert(!component.includes('data-review-section'));
  assert(!/<script\b|<a\b|<button\b|<details\b/.test(component));
  const layout = read('src/draft/layouts/ReviewLayout.astro');
  const slot = layout.indexOf('<slot />');
  const appendix = layout.indexOf('<WorkbookPrintGlossaryAppendix ');
  const navigation = layout.indexOf('<ReviewLessonNavigation ');
  assert(slot >= 0 && appendix > slot && navigation > appendix);
  assert(layout.includes("(page === 'overview' || page === 'lesson') && <WorkbookPrintGlossaryAppendix"));
});
