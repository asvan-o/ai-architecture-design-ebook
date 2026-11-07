import {readFileSync} from 'node:fs';
import path from 'node:path';
import {repositoryRoot} from '../../../scripts/daejeon-review-assets.mjs';
import promptAlignment from './prompt-alignment-overrides.json';
import type {PromptPlatformGuide} from './prompt-platform-guides';

export const fileSorterExercise={
  title:'건축 프로젝트 파일 자동 정리 프로그램',
  description:'도면·모델·이미지·문서를 정해둔 규칙으로 분류하고, 애매한 파일만 사람이 확인합니다.',
  repetition:'들어온 파일마다 분류 폴더를 찾고 옮기는 일을 줄입니다.',
  automatic:'확장자·파일명 규칙 확인, 원본 보관, 분류·중복 안내·처리 상태 표시',
  human:'애매한 파일의 용도와 목적지, 실행 결과와 오류 확인',
  environment:'Windows + 시스템 Node.js. 연결한 빈 실습 폴더에서 만들고 START.bat으로 실행합니다.',
} as const;

type BuildGuide=PromptPlatformGuide&{purpose:string;variables:string};
function buildPrompt(key:string,id:string,title:string,file:string){
  const source=path.join(repositoryRoot,'review/daejeon/LESSON02_AUTOMATION_AB/student/A',file);
  const guide=(promptAlignment as Record<string,unknown>)[id] as BuildGuide;
  if(!guide?.platform||!guide.derivation||!guide.aiPromptTip)throw new Error('제2차시 제작 가이드 누락: '+id);
  return {key,id,title,file,prompt:readFileSync(source,'utf8'),outputPath:'practice/DJ-L02/automation/A/'+file,guide};
}
export const buildSteps=[
  {...buildPrompt('step1','l02-step-1-prompt','Step 1 요청문 · 기본 폴더 구조와 감시 뼈대 만들기','DJ-L02_STEP_01.txt'),
    goal:'빈 실습 폴더에 기본 구조를 만들고 파일 감지·이동과 START/STOP부터 작동시킵니다.',
    why:'작은 동작부터 실행해 보면 어느 단계에서 고쳐야 하는지 쉽게 찾을 수 있습니다.',
    files:'START.bat · STOP.bat · app/watcher.js · classifier.js · file-manager.js · rules.json',
    check:'작은 시험 복사본을 넣어 감지·원본보관·이동을 확인하고 STOP으로 멈춥니다. 실제 업무 원본은 넣지 않습니다.',
    next:'같은 프로그램에 분류 규칙과 사람 확인을 덧붙입니다.'},
  {...buildPrompt('step2','l02-step-2-prompt','Step 2 요청문 · 자동 분류와 사람 확인 분리하기','DJ-L02_STEP_02.txt'),
    goal:'명확한 확장자는 자동으로, 파일명 단서가 불확실하거나 충돌하면 99_분류확인으로 보냅니다.',
    why:'애매한 파일을 억지로 분류하지 않는 것도 올바른 자동화 동작입니다.',
    files:'app/classifier.js · rules.json',
    check:'도면 단서, 재질 단서, 서로 다른 분류 단서가 겹친 이름, 단서 없는 이름을 비교합니다.',
    next:'자동 처리 중 파일을 잃거나 덮어쓰지 않도록 안전장치를 보완합니다.'},
  {...buildPrompt('step3','l02-step-3-prompt','Step 3 요청문 · 원본 보호와 중복·덮어쓰기 방지','DJ-L02_STEP_03.txt'),
    goal:'원본을 먼저 보관하고 같은 이름·다른 내용, 동일 SHA-256, 임시파일을 각각 구분합니다.',
    why:'분류가 맞아도 원본이 사라지거나 기존 결과를 덮어쓰면 업무에서 사용할 수 없습니다.',
    files:'app/file-manager.js · watcher.js · data/',
    check:'동일 파일 재투입은 중복 안내, 같은 이름·다른 내용은 _v02, 임시파일은 제외되는지 봅니다.',
    next:'검증한 처리 기능을 브라우저 화면과 외부 폴더 가져오기에 연결합니다.'},
  {...buildPrompt('step4','l02-step-4-prompt','Step 4 요청문 · 브라우저 화면과 외부 폴더 가져오기','DJ-L02_STEP_04.txt'),
    goal:'감시 상태·폴더별 수·사람 확인 대기 목록을 보여주고 수동 선택과 외부 자료 복사를 연결합니다.',
    why:'사용자가 처리 상태를 이해하고 자동화가 멈춘 이유나 직접 결정할 항목을 볼 수 있어야 합니다.',
    files:'app/ui/ · 로컬 서버 연결 · 사용방법 README',
    check:'127.0.0.1:4174 화면, 사람 선택, 외부 원본 불변, 수집함 복사, STOP 종료를 확인합니다.',
    next:'완성 프로그램에 SORT_TEST를 넣고 아래 기준표와 화면을 직접 비교합니다.'},
] as const;
export const integratedPrompt=buildPrompt('integrated','l02-integrated-prompt','최종 통합 예시문 · 한 번에 전체 구조를 구현할 때 사용하는 완성형 프롬프트','DJ-L02_INTEGRATED_PROMPT.txt');
