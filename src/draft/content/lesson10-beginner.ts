/** 학생 화면용 풀이. 광주 원문 데이터와 실행 프롬프트 본문에는 적용하지 않습니다. */
export function humanizeLegalText(value:string):string{
 return value
  .replace(/A99\s*(?:\/|→)\s*B00/g,'노트북 A의 조건 기준서를 노트북 B로 전달')
  .replace(/B00 프로젝트 조건 기준서|B00 기준서/g,'노트북 B로 옮긴 프로젝트 조건 기준서(B00)')
  .replace(/Project Grounded Reference(?:\(A99\))?/g,'원자료에 근거한 프로젝트 조건 기준서')
  .replace(/\bA99\b(?![_\w]|\))/g,'노트북 A에서 만든 조건 기준서(A99)')
  .replace(/\bB00\b(?![_\w]|\))/g,'노트북 B로 옮긴 조건 기준서(B00)')
  .replace(/\bB99\b(?![_\w]|\))/g,'노트북 B의 1차 법규검토 체크리스트(B99)')
  .replace(/\bSource\b/g,'근거자료').replace(/\bResearch\b/g,'조사').replace(/\bGPT\b/g,'ChatGPT');
}
export const beginnerWorkflow=[
 '발주처 프로젝트 원자료','노트북 A에서 신축 조건 정리','프로젝트 조건 기준서를 노트북 B로 전달','ChatGPT로 필요한 법규 검색','공식 법규·조례·별표 확보','노트북 B에 기준서와 법규 추가','노트북 B의 1차 법규검토 체크리스트','ChatGPT 독립 교차검증','노트북 B 보완·ChatGPT 재검증','사람의 최종 확인',
] as const;
