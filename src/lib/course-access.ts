import { readFileSync } from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from '../../scripts/course-registry.mjs';
import { activeCourse } from './courses';

const source = activeCourse.access.passwordConfig
  ? JSON.parse(readFileSync(path.join(repositoryRoot, activeCourse.access.passwordConfig), 'utf8'))
  : null;
if (activeCourse.contentStatus === 'approved' && !/^[a-f0-9]{64}$/.test(source?.passwordHash ?? '')) {
  throw new Error(`Approved course password configuration missing: ${activeCourse.courseId}`);
}
export const courseAccess: { passwordHash: string; sessionStorageKey: string; legacySessionStorageKey: string | null } = {
  passwordHash: source?.passwordHash ?? '',
  sessionStorageKey: `${source?.sessionStorageKey ?? 'ai-architecture-ebook-access-v1'}:course:${activeCourse.courseId}`,
  legacySessionStorageKey: activeCourse.access.legacyGwangjuCompatibility && activeCourse.courseId === 'gwangju-2026' ? source?.sessionStorageKey : null,
};
