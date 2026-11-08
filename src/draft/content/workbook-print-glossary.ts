import type { WorkbookGlossaryLessonId, WorkbookGlossaryTerm } from './workbook-glossary';

export interface WorkbookPrintGlossaryOccurrence {
  lessonId: WorkbookGlossaryLessonId;
  sectionId: string;
  label: string;
}

export interface WorkbookPrintGlossaryEntry {
  term: Readonly<WorkbookGlossaryTerm>;
  occurrences: readonly WorkbookPrintGlossaryOccurrence[];
}

/** Select the union of explicit lesson references and inline-note references without changing the source data. */
export function selectWorkbookPrintGlossary(
  lessonId: WorkbookGlossaryLessonId,
  terms: readonly WorkbookGlossaryTerm[],
  sectionNotes: Readonly<Record<string, readonly string[]>>,
  sectionLabels: Readonly<Record<string, string>> = {},
): readonly WorkbookPrintGlossaryEntry[] {
  const labels = new Map<string, string>();
  for (const term of terms) {
    for (const occurrence of term.lessons) {
      const key = `${occurrence.lessonId}:${occurrence.sectionId}`;
      if (!labels.has(key)) labels.set(key, occurrence.label);
    }
  }

  const notes = Object.entries(sectionNotes).flatMap(([key, termIds]) => {
    const separator = key.indexOf(':');
    if (separator < 1) return [];
    const noteLesson = key.slice(0, separator);
    if (!/^(?:overview|0[1-9]|1[0-3])$/.test(noteLesson)) return [];
    if (lessonId !== 'overview' && noteLesson !== lessonId) return [];
    const sectionId = key.slice(separator + 1);
    if (!sectionId) return [];
    const fallback = noteLesson === 'overview'
      ? `과정 안내 · ${sectionId} (본문 용어 주석)`
      : `제${Number(noteLesson)}차시 · ${sectionId} (본문 용어 주석)`;
    return [{
      lessonId: noteLesson as WorkbookGlossaryLessonId,
      sectionId,
      label: labels.get(key) ?? sectionLabels[key] ?? fallback,
      termIds,
    }];
  });
  const noteTermIds = new Set(notes.flatMap(note => [...note.termIds]));

  return terms
    .filter(term => lessonId === 'overview'
      || term.lessons.some(occurrence => occurrence.lessonId === lessonId)
      || noteTermIds.has(term.id))
    .map(term => {
      const occurrences = new Map<string, WorkbookPrintGlossaryOccurrence>();
      for (const occurrence of term.lessons) {
        if (lessonId === 'overview' || occurrence.lessonId === lessonId) {
          occurrences.set(`${occurrence.lessonId}:${occurrence.sectionId}`, { ...occurrence });
        }
      }
      for (const note of notes) {
        const key = `${note.lessonId}:${note.sectionId}`;
        if (note.termIds.includes(term.id) && !occurrences.has(key)) {
          occurrences.set(key, { lessonId: note.lessonId, sectionId: note.sectionId, label: note.label });
        }
      }
      const lessonOrder = (id: WorkbookGlossaryLessonId) => id === 'overview' ? 0 : Number(id);
      return {
        term,
        occurrences: [...occurrences.values()].sort((a, b) => lessonOrder(a.lessonId) - lessonOrder(b.lessonId)),
      };
    });
}
