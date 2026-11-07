import alignment from './prompt-alignment-overrides.json';
import type {PromptPlatformGuide} from './prompt-platform-guides';

export type PromptRole = 'example'|'text'|'image'|'local'|'human';
export const promptRoleLabels: Record<PromptRole,string>={
 example:'① 학습·오류 비교 예시(실행 안 함)',
 text:'② 텍스트 분석·기획 요청',image:'③ 이미지 생성·편집 요청',
 local:'④ 로컬 코드·터미널·MCP 실행',human:'⑤ 사람의 사후 검수 체크리스트',
};
type Alignment = Partial<PromptPlatformGuide>&{role?:PromptRole;execution?:string;editTarget?:string;referenceInputs?:string;prerequisite?:string;};
const byId=alignment as Record<string,Alignment>;
export function applyPromptAlignment(id:string,source:PromptPlatformGuide){
 const extra=byId[id]||{};
 const guide={...source,...extra};
 const role=extra.role||(guide.kind==='image'?'image':guide.kind==='code'||guide.kind==='terminal'||guide.kind==='diagram'?'local':'text');
 const execution=extra.execution||(role==='example'?'지금 실행하지 않고 문장과 조건을 읽습니다.':role==='image'?'입력 자료를 준비한 뒤 이미지 1장을 생성·편집합니다. 결과 대조는 생성 후 사람이 수행합니다.':role==='local'?'표시된 로컬 실행 환경과 선행 상태를 먼저 확인합니다.':role==='human'?'생성 결과와 원자료를 사람이 직접 대조합니다.':'자료를 읽고 텍스트 결과를 받습니다. 이미지는 생성하지 않습니다.');
 return {...guide,role,execution};
}

/** 교재 도출에 사용한 공동 모델명입니다. 실습 실행 도구나 개별 결과의 실행 증빙과 구분합니다. */
export const promptDerivationModel='OpenAI Codex (6.1 Sol / 6 Astra)';

/** 제10차시의 lesson11-prompt-*도 포함하도록 원본 ID가 아닌 실제 차시 경로를 사용합니다. */
export function hasPromptModelNote(pathname:string):boolean{
 const match=pathname.match(/\/lessons\/(\d{2})\/?$/);
 return !!match&&Number(match[1])>=1&&Number(match[1])<=10;
}

type ModelNoteGuide=Pick<ReturnType<typeof applyPromptAlignment>,'role'|'kind'>;

export function getPromptModelNote(guide:ModelNoteGuide):string{
 if(guide.role==='human')return `아래 항목은 ${promptDerivationModel}로 정리한 교재의 사람 사후 검수 기준입니다. 위 작성 요청문은 대조할 기준을 정리하는 연습이며 모델에 실행을 맡기는 지시가 아닙니다. 실제 원자료와 생성·실행 결과를 사람이 직접 비교하며, AI 답변만으로 검수 완료를 판단하지 않습니다.`;
 if(guide.role==='example')return `학습 및 조건 비교를 위해 ${promptDerivationModel}로 구성한 교재 예시 문장입니다. 위 작성 요청문을 ChatGPT 또는 Google Gemini에 입력해 문장 역할·충돌 분석을 연습할 수 있으며, 답변 표현은 모델마다 다르게 나올 수 있습니다. 아래 문장을 이미지 생성이나 로컬 실행 지시로 사용하지 않습니다.`;
 if(guide.kind==='terminal'||guide.kind==='diagram'){
  const target=guide.kind==='terminal'?'명령어':'다이어그램 코드';
  return `위 작성 요청문과 실습 환경 조건을 바탕으로 ${promptDerivationModel}에서 도출·정제한 교재의 기준 ${target}입니다. 다른 AI의 답변 표현이 달라도 아래 예시를 기준으로 삼고, 임의로 변형하지 말고 경로·환경 변수 등 안내된 항목만 내 환경에 맞게 확인해 사용하세요. 실제 실행·검증 범위는 해당 단계의 기록과 내 컴퓨터의 결과를 기준으로 확인합니다.`;
 }
 return `아래 프롬프트 예시는 위 ‘AI로 작성 요청’ 문장에 이번 실습의 입력자료·고정 조건·구조 규칙을 함께 넣어 ${promptDerivationModel}로 도출·정제한 결과입니다. 일반 ChatGPT 또는 Google Gemini에 위 요청문만 입력하면 모델과 대화 맥락 차이로 문장이 다르게 나오는 것이 정상입니다. 직접 만든 초안은 핵심 조건(유지·변경·금지)의 포함 여부를 비교해 다듬거나, 아래 프롬프트 예시를 그대로 복사해 실습하세요.`;
}
