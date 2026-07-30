export interface LessonTopicSummary {
  number: string;
  title: string;
}

const confirmedTopics: Record<string, LessonTopicSummary> = {
  '01': {
    number: '1',
    title: '생성형 AI 리터러시 기초 및 건축 디자인 시각화 실습',
  },
  '02': {
    number: '1',
    title: '생성형 AI 리터러시 기초 및 건축 디자인 시각화 실습',
  },
};

export const getLessonTopicSummary = (lessonId: string): LessonTopicSummary | undefined =>
  confirmedTopics[lessonId];
