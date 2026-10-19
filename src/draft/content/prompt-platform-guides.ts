import {getPromptDerivation} from './prompt-derivations';
interface ExecutionGuide {
  platform: string;
  howToUse: string;
  kind: 'image' | 'text' | 'code' | 'terminal' | 'diagram';
}
export interface PromptPlatformGuide extends ExecutionGuide {
  derivation: string;
  aiPromptTip: string;
}

const imagePlatform = 'Google AI Studio (Nano Banana) 또는 ChatGPT 이미지 편집';
const textPlatform = 'ChatGPT 또는 Gemini (텍스트 대화창)';
const image01: ExecutionGuide = {kind:'image',platform:'Google AI Studio (Nano Banana) 또는 ChatGPT 이미지 생성',howToUse:'실습용 원본 공간/외관 이미지를 첨부하고 아래 프롬프트를 입력합니다. 빈칸은 자신의 조건으로 채웁니다.'};
const rfp: ExecutionGuide = {kind:'text',platform:'ChatGPT 또는 Gemini (텍스트 분석)',howToUse:'선택한 실습 A/B 의뢰서(RFP) 원문과 관련 자료를 함께 제공하고 아래 프롬프트를 입력합니다.'};
const coding: ExecutionGuide = {kind:'code',platform:'OpenAI Codex / ChatGPT 또는 AI 코드 에디터',howToUse:'자연어 기획 요청 → 구조 검토 → 구현 승인 순서로 AI 코딩 도구에 입력합니다.'};
const material: ExecutionGuide = {kind:'image',platform:imagePlatform,howToUse:'작업 전 기준 공간 이미지와 선택한 재질·조명 참고 이미지를 첨부하고 입력합니다.'};
const interior: ExecutionGuide = {kind:'image',platform:imagePlatform,howToUse:'선택한 기준 실내 이미지와 해당 단계의 재질·보드 이미지를 첨부하고 아래 프롬프트를 입력합니다.'};
const exterior: ExecutionGuide = {kind:'image',platform:imagePlatform,howToUse:'기준 건축 외관 이미지 또는 이전 단계 결과를 아래 첨부 목록의 순서대로 준비하고 입력합니다.'};
const exteriorAnalysis: ExecutionGuide = {kind:'text',platform:textPlatform,howToUse:'기준 외관·비교 결과 이미지와 실제 요청문을 첨부하고 유지·변경 범위를 텍스트로 분석합니다. 지금은 이미지를 생성하지 않습니다.'};
const floorplanEdit: ExecutionGuide = {kind:'image',platform:'ChatGPT 이미지 편집 또는 Google AI Studio (Nano Banana)',howToUse:'확대한 부분 평면도(Crop) 이미지를 첨부하고 지정한 영역만 수정합니다. 유지할 벽·문·창·문자를 함께 지정합니다.'};
const spatialImage: ExecutionGuide = {kind:'image',platform:'ChatGPT 이미지 생성·편집 또는 Google AI Studio (Nano Banana)',howToUse:'상단 첨부 이미지 목록의 도면·이전 단계 이미지를 순서대로 첨부하고 입력합니다.'};
const terminal: ExecutionGuide = {kind:'terminal',platform:'Windows PowerShell (로컬 터미널)',howToUse:'AI 채팅창이 아니라 Windows PowerShell 창에 명령어를 복사해 붙여넣고 Enter를 누릅니다.'};
const relational: ExecutionGuide = {kind:'text',platform:textPlatform,howToUse:'원본 평면도 PDF와 최종 확정 도면 기준표 텍스트만 사실 기준으로 입력합니다. 3D 이미지는 사실 기준에서 제외합니다.'};

const groups: readonly [readonly string[], ExecutionGuide][] = [
  [['gw-complete','gw-annotated-copy','flower-cafe-revision','conflicting','conflict-revision','assemble-template','revision-prompt'],image01],
  [['DJ-CF-01-analysis','DJ-CF-02-analysis','DJ-CF-01-brief','DJ-CF-02-brief'],rfp],
  [['DJ-CF-01-learning','DJ-CF-02-learning','DJ-CF-01-execution','DJ-CF-02-execution'],{...image01,howToUse:'선택한 현황 이미지·기준 도면·검증한 작업 기준서를 준비하고 아래 이미지 프롬프트를 입력합니다.'}],
  [['l02-A-first','l02-B-first','l02-A-approval','l02-B-approval','l02-implement-prompt'],coding],
  [['l02-evidence-prompt'],{...coding,howToUse:'기대 결과표와 직접 남긴 실행 기록을 함께 제공해 비교 내용을 정리합니다. 실행하지 않은 결과를 성공으로 만들지 않습니다.'}],
  [['l02-material-prompt','l02-material-execution-prompt'],material],
  [['l03-my-first-edit','l03-first-example-prompt','l03-board-example-prompt','l03-board-edit-prompt','l03-my-new-concept','l03-final-example-prompt'],interior],
  [['l03-meta-prompt'],{kind:'text',platform:textPlatform,howToUse:'재질을 적용한 수정 공간과 사용한 재질 자료를 첨부해 분석과 보드용 요청문을 받습니다. 이 단계에서는 이미지를 생성하지 않습니다.'}],
  [['l04-scope-7step','l04-gemini-7step','l04-gemini-short','l04-compare-7step'],exteriorAnalysis],
  [['l04-my-A','l04-my-B','l04-A-7step','l04-A-short','l04-B-7step','l04-B-short','l04-A2-7step','l04-A2-short','l04-EXT-BASE-02-practice-7step',
    ...['cleanup','landscape','surrounding-landscape','human-scale','dusk','rough-sketch','rapid','refined','subview','angle-corner','angle-streetscape','angle-elevated'].flatMap(key=>['l04-app-'+key+'-7step','l04-app-'+key+'-short'])],exterior],
  [['l05-prompt-analysis'],{kind:'text',platform:'ChatGPT 또는 Gemini (도면 판독)',howToUse:'원본 평면도 이미지를 첨부하고 방 구획·개구부·가구 정보를 판독합니다.'}],
  [['l05-my-prompt','l05-prompt-door-edit'],floorplanEdit],
  [['l05-prompt-recompose'],{...floorplanEdit,howToUse:'원본 전체 평면도와 부분 수정 결과를 함께 첨부하고, 수정 부분만 전체 도면에 다시 반영합니다.'}],
  [['l05-prompt-overlay'],{...floorplanEdit,howToUse:'같은 단계의 수정 전후 전체 평면도를 함께 첨부해 중첩 비교 이미지를 만듭니다. 새로운 도면 요소를 만들지 않습니다.'}],
  [['l06-office-topview','l06-office-warm','l06-office-modern','l06-cafe-isometric','l06-office-exploded','l06-office-subview','l06-office-bubble','l06-office-zoning'],spatialImage],
  [['l07-realistic-render-execution','l07-realistic-render-learning'],{...spatialImage,howToUse:'Gaussian 시점 캡처 이미지(01-gaussian-source.png)를 첨부하고 입력합니다.'}],
  [['l07-partial-fix-execution','l07-partial-fix-learning'],{kind:'image',platform:'ChatGPT 이미지 편집(영역 선택 브러시) 또는 Google AI Studio (Nano Banana)',howToUse:'현실화 후보 이미지(route-01.png)를 첨부하고 식탁 앞 검은 의자 영역만 지정해 입력합니다.'}],
  [[...Array.from({length:12},(_,i)=>'l07-sr-step-'+(i+1)+'-0'),'l07-sr-step-2-1','l07-sr-reuse'],terminal],
  [['l07-plan-analysis'],{kind:'text',platform:'Google NotebookLM',howToUse:'교육용 원본 PDF 다운로드 → 새 노트북의 소스로 업로드 → 아래 프롬프트 입력.'}],
  [['l07-clean-line-prompt'],{kind:'image',platform:'ChatGPT 이미지 편집 · Google AI Studio (Nano Banana)',howToUse:'원본 평면도 이미지와 검증한 기준표를 준비하고 정방향을 확인해 입력합니다. 직접 결과를 대조한 뒤 필요하면 실습팩의 01-clean-line.jpg로 이어갑니다.'}],
  [['l07-plan-criteria'],{kind:'text',platform:textPlatform,howToUse:'원본 1층 평면도 PDF를 첨부하고, 섹션 18의 NotebookLM 1차 분석 결과 텍스트를 함께 붙여넣고 실행합니다.'}],
  [['l07-plan-topview'],{...spatialImage,howToUse:'① 원본 평면도 PDF + ② 최종 확정 도면 기준표 텍스트 + ③ 클린 선화 이미지(01-clean-line.jpg)를 함께 첨부하고 실행합니다.'}],
  [['l07-spatial-analysis','l07-spatial-validation-prompt'],relational],
  [['l07-graphviz-prompt'],{kind:'text',platform:'ChatGPT 또는 Gemini',howToUse:'섹션 20의 최종 검증 데이터에 이어서 입력해 DOT 코드를 생성합니다. 생성된 코드는 WebGraphviz 또는 Viz.js로 옮깁니다.'}],
  [['l07-actual-dot'],{kind:'diagram',platform:'WebGraphviz · Viz.js',howToUse:'아래 digraph DOT 코드 전체를 복사해 WebGraphviz 또는 Viz.js의 입력창에 붙여넣고 다이어그램을 생성합니다. AI 채팅 요청문이 아닙니다.'}],
];

export const promptPlatformGuides: Readonly<Record<string,PromptPlatformGuide>> = Object.fromEntries(groups.flatMap(([ids,guide])=>ids.map(id=>[id,{...guide,...getPromptDerivation(id)}])));
export function getPromptPlatformGuide(id:string): PromptPlatformGuide {
  const guide=promptPlatformGuides[id];
  if(!guide)throw new Error('실행 플랫폼 안내가 없는 Prompt ID: '+id);
  return guide;
}
