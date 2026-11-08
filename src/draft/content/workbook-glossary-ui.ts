/** 공개 워크북의 실제 경로로 주석 범위를 결정한다. 내부 차시 코드나 기본값에 의존하지 않는다. */
export function glossaryLessonKey(pathname: string): string | undefined {
  if (/(?:^|\/)gwangju(?:\/|$)/i.test(pathname)) return undefined;
  // 공개 하위 경로와 코스 접두사가 없는 draft 개발 경로만 허용한다.
  const workbookPath = pathname.match(/(?:^|\/)workbook(\/.*)$/)?.[1];
  const localDraftPath = /^\/(?:lessons\/|course-overview(?:\/|$))/.test(pathname) ? pathname : undefined;
  const coursePath = workbookPath ?? localDraftPath;
  if (!coursePath) return undefined;
  const lesson = coursePath.match(/^\/lessons\/(0[1-9]|1[0-3])(?:\/(?:index\.html)?)?$/);
  if (lesson) return lesson[1];
  return /^\/course-overview(?:\/(?:index\.html)?)?$/.test(coursePath) ? 'overview' : undefined;
}

/** 공백·대소문자·전각 차이 없이 한글, 영문, 약어를 찾는다. */
export function normalizeGlossaryText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[\s\-–—_·.,/()]+/g, '');
}

export function matchesGlossaryQuery(searchText: string, query: string): boolean {
  const normalized = normalizeGlossaryText(searchText);
  return query.trim().split(/\s+/).filter(Boolean).every(part => normalized.includes(normalizeGlossaryText(part)));
}
