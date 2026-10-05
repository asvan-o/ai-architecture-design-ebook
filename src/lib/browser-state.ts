export const runtimeCourseId = import.meta.env.PUBLIC_COURSE_ID || 'gwangju-2026';
export const courseStorageKey = (key: string, courseId = runtimeCourseId) => `${key}:course:${courseId}`;

// Only the Gwangju course may import the pre-migration browser state.
export const readCourseState = (storage: Storage, key: string, legacyKey = key, courseId = runtimeCourseId) => {
  const scopedKey = courseStorageKey(key, courseId);
  const current = storage.getItem(scopedKey);
  if (current !== null || courseId !== 'gwangju-2026') return current;
  const legacy = storage.getItem(legacyKey);
  if (legacy !== null) storage.setItem(scopedKey, legacy);
  return legacy;
};
