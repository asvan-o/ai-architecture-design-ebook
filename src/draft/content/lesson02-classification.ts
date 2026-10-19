// Display the existing program's rules; do not duplicate or change its classifier.
import rules from '../../../review/daejeon/AI_파일자동정리/app/rules.json';

export const classificationRules=rules;
export const classificationExplanation={
  title:'이 프로그램은 무엇을 보고 분류할까요?',
  core:'이 프로그램은 AI가 파일 내용을 보고 판단하는 프로그램이 아닙니다. 파일의 확장자와 파일명에 있는 단어를 사람이 미리 정한 규칙과 비교해 분류하는 자동화 예제입니다.',
  principle:'확실한 것은 자동으로 처리하고, 판단 근거가 부족한 것은 사람이 확인합니다.',
  introduction:'확장자·파일명 단서를 사람이 정한 규칙에 대조합니다. 실행 중 AI 모델이나 외부 AI API를 호출하지 않습니다.',
  ambiguousTitle:'PNG, JPG, PDF는 확장자만으로 용도를 알 수 없습니다.',
  ambiguousExamples:'PNG는 도면 이미지·렌더링 결과·재질 참고 이미지·현장사진일 수 있고, PDF는 도면·제안서·보고서·계약서일 수 있습니다. 이 프로그램은 파일 내부를 열어 구분하는 대신 파일명 단서를 추가로 확인합니다.',
  flow:[
    {title:'확장자 확인',note:'등록된 직접 분류 확장자라면 정해진 폴더로 자동 분류',example:'.dwg → CAD 도면 · .rvt → BIM · .blend → 3D 모델'},
    {title:'파일명 단서 확인',note:'PNG·JPG·PDF 등은 파일명 단서가 한 분류에만 해당하면 자동 분류',example:'floorplan → 도면 · material / ref → Reference'},
    {title:'불확실하면 사람 확인',note:'단서 없음·서로 다른 분류의 단서 충돌·미등록 확장자는 사람 확인',example:'99_분류확인 → 용도를 확인하고 사람이 분류 선택'},
  ],
  examples:[
    {files:['office_floorplan.png'],clue:'floorplan',result:'도면 후보 → 01_CAD도면',mode:'자동 분류'},
    {files:['material_ref_oak.png'],clue:'material / ref',result:'Reference 후보 → 03_레퍼런스',mode:'자동 분류'},
    {files:['render_final.png'],clue:'render / final',result:'이미지 결과 후보 → 04_이미지결과',mode:'자동 분류'},
    {files:['project_report.pdf'],clue:'report',result:'문서 후보 → 07_문서',mode:'자동 분류'},
    {files:['image001.png','scan003.pdf'],clue:'판단 단서 없음',result:'99_분류확인',mode:'사람 확인'},
  ],
  conflict:'material_floorplan.png에는 material(Reference 후보)과 floorplan(도면 후보)이 함께 있습니다. 서로 다른 분류가 충돌하므로 임의로 하나를 고르지 않고 99_분류확인으로 보냅니다. 같은 분류에 속한 material / ref가 함께 있는 것은 충돌이 아닙니다.',
  keywordBoundary:'영문 키워드는 밑줄(_), 하이픈(-), 공백 등으로 나뉜 단어 전체가 일치해야 합니다. office_plan.png의 plan은 일치하지만 planet.png나 plan01.png는 일치하지 않습니다. 한글 키워드는 파일명에 포함되어 있는지 확인합니다.',
  priority:'직접 분류 확장자를 먼저 적용하고, 아래 애매한 확장자에만 파일명 단서를 확인합니다. 직접 분류 목록과 애매한 목록에 없는 확장자는 파일명 단서가 있어도 99_분류확인으로 보냅니다.',
  ignored:'임시파일(.tmp / .part / .crdownload), ~$로 시작하는 파일, .gitkeep은 처리 대상에서 제외합니다.',
  automation:'자동화가 반드시 AI일 필요는 없습니다. 규칙으로 정확하게 처리할 수 있는 반복 작업은 일반 프로그램으로 자동화하고, 규칙만으로 판단하기 어려운 부분은 사람에게 남길 수 있습니다.',
  roles:[
    {title:'Codex / AI · 만드는 과정',items:['프로그램 구조 제안','코드 작성과 수정','테스트 지원']},
    {title:'완성된 프로그램 · 실행 과정',items:['AI 모델을 호출하지 않음','외부 AI API를 사용하지 않음','사람이 정한 규칙을 반복 실행']},
  ],
} as const;
