export interface LessonTopicSummary {
  number: string;
  title: string;
  subtitle?: string;
  lessonIds: readonly string[];
  lessonCount: number;
}

export interface LessonRoadmapItem {
  id: string;
  day: number;
  title: string;
}

export const lessonRoadmap: readonly LessonRoadmapItem[] = [
  { id: '01', day: 1, title: '제1차시 · AI가 할 일과 디자이너가 판단할 일' },
  { id: '02', day: 2, title: '제2차시 · 첫 공간 콘셉트 생성과 빈 공간 인테리어 배치' },
    { id: '03', day: 3, title: '제3차시 · 실무 의뢰와 제안요청서(RFP)를 디자인 브리프로 바꾸기' },
  { id: '04', day: 4, title: '제4차시 · RFP 기반 공간구성 대안 개발과 프로젝트 산출물 자동 정리' },
  { id: '05', day: 5, title: '제5차시 · 평면도 기반 AI 공간 입체화와 아이소메트릭' },
  { id: '06', day: 6, title: '제6차시 · DWG·평면도 기반 공간 수정과 3D·아이소메트릭 분해도' },
  { id: '07', day: 7, title: '제7차시 · PDF 도면 기반 공간 수정과 Gaussian Splatting 3D 시각화' },
  { id: '08', day: 8, title: '제8차시 · Gaussian 결과 현실화와 AI 업스케일' },
  { id: '09', day: 9, title: '제9차시 · 3D 콘셉트 이미지에서 공간 관계 읽기와 2D 개념 조닝' },
  { id: '10', day: 10, title: '제10차시 · 프로젝트 Grounding과 AI 법규검토 준비' },
  { id: '11', day: 11, title: '제11차시 · 2D 도면 기반 3D 콘셉트 시각화와 오류 탐지' },
  { id: '12', day: 12, title: '제12차시 · 다차원 검증 체크리스트와 교차검증' },
  { id: '13', day: 13, title: '제13차시 · 제안서 고도화와 KPI·제출 패키지' },
  { id: '14', day: 14, title: '제14차시 · AI 공간디자인 콘셉트 제안서 롤플레잉 최종 발표' },
] as const;

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
    title: '3D 시각화 결과 검토와 공간 관계·개념 조닝 실습',
    subtitle: '(이미지 일관성과 공간 관계 확장)',
    lessonIds: ['07', '08', '09'],
    lessonCount: 3,
  },
  {
    number: '5',
    title: '실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초',
    subtitle: '(도면과 데이터 기반 3D 시각화)',
    lessonIds: ['10', '11'],
    lessonCount: 2,
  },
  {
    number: '6',
    title: 'AI 생성 결과물 다차원 실무 검증 및 제안서 고도화',
    subtitle: '(결과물 검증과 제안서 완성)',
    lessonIds: ['12', '13'],
    lessonCount: 2,
  },
  {
    number: '7',
    title: '실무 검증형 설계 제안서 롤플레잉 최종 발표 및 수료',
    subtitle: '(최종 제안과 발표)',
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

const roadmapByLessonId = new Map(
  lessonRoadmap.map((lesson) => [lesson.id, lesson] as const),
);

export const getLessonTopics = (): readonly LessonTopicSummary[] => lessonTopics;

export const getLessonRoadmap = (): readonly LessonRoadmapItem[] => lessonRoadmap;

export const getLessonRoadmapItem = (
  lessonId: string | number,
): LessonRoadmapItem | undefined => roadmapByLessonId.get(normalizeLessonId(lessonId));

export const getLessonTopicSummary = (
  lessonId: string | number,
): LessonTopicSummary | undefined => topicsByLessonId.get(normalizeLessonId(lessonId));
