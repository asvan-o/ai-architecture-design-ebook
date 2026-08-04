export const formatCourseDuration = (durationMinutes: number | null | undefined) => {
  if (durationMinutes == null) return '수업시간 확인 예정';
  if (durationMinutes % 60 === 0) return `${durationMinutes / 60}시간 수업`;

  const hours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  return hours > 0
    ? `${hours}시간 ${remainingMinutes}분 수업`
    : `${remainingMinutes}분 수업`;
};
