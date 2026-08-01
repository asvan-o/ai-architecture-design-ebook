export type Lesson04ResourceGroup =
  | 'common'
  | 'manager-build'
  | 'zoning'
  | 'image'
  | 'revision'
  | 'manager-recovery';

export type Lesson04Download = {
  href: string;
  downloadName: string;
  label: string;
  description: string;
  meta: string;
  note?: string;
  group?: Lesson04ResourceGroup;
};

export type Lesson04WorkflowData = {
  definition: string;
  differenceCriteria: string[];
  rejectedDifferences: string[];
  examples: {
    label: string;
    title: string;
    note: string;
    items: string[];
  }[];
  toolRows: {
    product: string;
    interface: string;
    codeEditing: string;
    projectManagement: string;
    beginnerFit: string;
    repetition: string;
    development: string;
    courseUse: string;
  }[];
  toolNotes: {
    category:
      | '확인된 사실'
      | '확정된 수업 구성'
      | '교육용 가정'
      | '디자인 제안'
      | '수강생 판단'
      | '강의 전 사실 검증'
      | '추가 출처 확인';
    text: string;
  }[];
  modelPrinciples: {
    title: string;
    description: string;
  }[];
  technicalTerms: {
    term: string;
    definition: string;
  }[];
  officialSources: {
    title: string;
    url: string;
    description: string;
  }[];
  officialCheckedAt: string;
  nodeSetup: {
    checkedAt: string;
    downloadUrl: string;
    versions: {
      label: string;
      value: string;
      description: string;
    }[];
    roles: {
      name: string;
      action: string;
      description: string;
    }[];
    windowsSteps: string[];
    verificationCommands: string;
    studentCommands: string;
    readyCommands: string;
    commandNotes: {
      command: string;
      description: string;
    }[];
    troubleshooting: {
      title: string;
      actions: string[];
    }[];
    checklist: string[];
    programUrl: string;
  };
  projectTree: string;
  fileNameExamples: string[];
  managerRequirements: string[];
  managerFeatures: string[];
  carryoverItems: string[];
  alternativeFields: string[];
  zoningMarks: string[];
  generationInputs: string[];
  imageLimits: string[];
  comparisonCriteria: string[];
  revisionCategories: string[];
  registrationItems: string[];
  automationItems: string[];
  deliveryGroups: {
    label: string;
    title: string;
    items: string[];
  }[];
  nextLesson: string;
  managerPrompt: string;
  approvalPrompt: string;
};
