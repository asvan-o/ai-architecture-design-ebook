import { getCourseProfile, getCourseProfiles } from '../../scripts/course-registry.mjs';
export const activeCourseProfile = getCourseProfile(import.meta.env.PUBLIC_COURSE_ID || 'gwangju-2026');
export const activeCourse = activeCourseProfile.course;
export const courses = getCourseProfiles();
export const isCourseDraft = activeCourse.contentStatus === 'design-pending';
