export const courseOverviewTitle = 'AI 건축디자인 강의 오리엔테이션';

export const courseOverviewSections = [
  { id: 'course-section-01', label: '이번 강의에서 배우는 것' },
  { id: 'course-section-02', label: '생성형 AI와 건축디자인의 관계' },
  { id: 'course-section-03', label: 'AI가 잘하는 영역' },
  { id: 'course-section-04', label: '사람이 판단해야 하는 영역' },
  { id: 'course-section-05', label: '정보를 구분하는 기준' },
  { id: 'course-section-06', label: '수업의 반복 흐름' },
  { id: 'course-section-07', label: '7개 주제와 14개 차시' },
  { id: 'course-section-08', label: 'e-book·실습자료·PDF 사용법' },
  { id: 'course-section-09', label: '강의가 끝난 뒤 갖게 되는 결과물' },
  { id: 'course-section-10', label: 'AI 결과를 정답으로 사용하지 않는 원칙' },
] as const;

export const courseOverviewData = {
  learning: [
    '생성형 AI의 결과를 건축디자인 과정에서 읽고 검토하는 기준을 익힙니다.',
    '문서·이미지·요청문을 바탕으로 초안을 만들고 사람이 다시 판단하는 흐름을 연습합니다.',
    '각 차시 결과를 기록하고 다음 작업으로 연결하는 방법을 익힙니다.',
  ],
  relationship: [
    '생성형 AI는 아이디어와 초안을 빠르게 제안하는 보조 수단입니다.',
    '건축디자인의 목적·사용자·공간 조건은 사람이 확인하고 결정합니다.',
    'AI 결과는 원본 자료와 비교해 수정할 수 있는 첫 제안으로 다룹니다.',
  ],
  aiStrengths: [
    '긴 문서에서 확인할 항목의 초안을 정리하기',
    '여러 디자인 방향을 빠르게 비교할 후보 만들기',
    '반복되는 정리·분류·파일 관리 작업 보조하기',
    '수정 요청을 반영한 새로운 결과 후보 만들기',
  ],
  humanJudgment: [
    '프로젝트 목적과 사용자에게 적절한 방향인지 판단하기',
    '원본 자료에 실제로 있는 내용과 AI가 더한 내용을 구분하기',
    '법규·구조·소방·설비·시공 등 전문가 확인 범위를 분리하기',
    '자료의 권리·개인정보·기밀 여부를 확인하기',
  ],
  informationTypes: [
    { title: '사실', description: '제공된 원문이나 확인 가능한 자료에서 직접 근거를 찾을 수 있는 내용' },
    { title: '추론', description: '확인된 내용을 바탕으로 사람이 해석했지만 원문 그대로는 아닌 내용' },
    { title: '가정', description: '수업이나 작업을 진행하기 위해 임시로 정한 조건' },
    { title: '디자인 제안', description: '여러 가능성 가운데 검토할 수 있도록 새로 제시한 방향' },
  ],
  cycle: ['이해', '자료 확인', 'AI 초안', '사람 검토', '수정', '결과물 정리'],
  usage: [
    { title: 'e-book', description: '수업 전후에 전체 내용과 상세 설명을 확인합니다.' },
    { title: '실습자료', description: '해당 차시 페이지에서 검수된 파일만 내려받아 사용합니다.' },
    { title: 'PDF', description: '인쇄하거나 오프라인에서 읽을 때 사용합니다.' },
  ],
  outcomes: [
    '완성·검수된 차시 범위에서 만든 실습 결과물',
    'AI 결과를 검토하고 수정한 판단 기록',
    '다음 작업으로 이어지는 요청문과 정리 자료',
    '사실·추론·가정·디자인 제안을 구분하는 개인 기준',
  ],
  principles: [
    'AI 결과가 자연스럽거나 보기 좋아도 사실과 설계 적합성이 자동으로 확인되는 것은 아닙니다.',
    '원본 자료와 확인되지 않은 조건은 구분하고, 필요한 경우 질문이나 전문가 검토로 넘깁니다.',
    'AI는 제안하고, 최종 선택과 책임 있는 판단은 사람이 수행합니다.',
  ],
} as const;
