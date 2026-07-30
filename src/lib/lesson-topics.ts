export interface LessonTopicSummary {
  number: string;
  title: string;
  lessonIds: readonly string[];
  lessonCount: number;
}

export const lessonTopics: readonly LessonTopicSummary[] = [
  {
    number: '1',
    title: '생성형 AI 리터러시 기초 및 건축 디자인 시각화 실습',
    lessonIds: ['01', '02'],
    lessonCount: 2,
  },
  {
    number: '2',
    title: '실무 시나리오 기반 맞춤형 제안 이미지 생성 및 워크플로우 자동화',
    lessonIds: ['03', '04'],
    lessonCount: 2,
  },
  {
    number: '3',
    title: '초기 기획을 위한 래피드 컨셉 도출 및 인페인팅 실무',
    lessonIds: ['05', '06'],
    lessonCount: 2,
  },
  {
    number: '4',
    title: '메인-서브 통합 워크플로우 및 2D 역추출 브릿지(Bridge) 실습',
    lessonIds: ['07', '08', '09'],
    lessonCount: 3,
  },
  {
    number: '5',
    title: '실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초',
    lessonIds: ['10', '11'],
    lessonCount: 2,
  },
  {
    number: '6',
    title: 'AI 생성 결과물 다차원 실무 검증 및 제안서 고도화',
    lessonIds: ['12', '13'],
    lessonCount: 2,
  },
  {
    number: '7',
    title: '실무 검증형 설계 제안서 롤플레잉 최종 발표 및 수료',
    lessonIds: ['14'],
    lessonCount: 1,
  },
] as const;

const normalizeLessonId = (lessonId: string | number) =>
  String(lessonId).padStart(2, '0');

const topicsByLessonId = new Map(
  lessonTopics.flatMap((topic) =>
    topic.lessonIds.map((lessonId) => [lessonId, topic] as const),
  ),
);

export const getLessonTopics = (): readonly LessonTopicSummary[] => lessonTopics;

export const getLessonTopicSummary = (
  lessonId: string | number,
): LessonTopicSummary | undefined => topicsByLessonId.get(normalizeLessonId(lessonId));
