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
