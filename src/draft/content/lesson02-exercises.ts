import { readFileSync } from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from '../../../scripts/daejeon-review-assets.mjs';
import promptAlignment from './prompt-alignment-overrides.json';
import type { PromptPlatformGuide } from './prompt-platform-guides';

export const commencementExercise = {
  title: '건축 용역 착수계 · 반복 행정서류 4종 자동 생성기',
  description:
    '용역명·발주처·계약금액·과업기간·참여기술자를 1회 입력해 착수신고서·책임기술자 선임계·참여기술자 명단·보안각서를 동시에 조립하고, 누락·모순 항목만 사람이 확인합니다.',
  repetition:
    '용역 착수·설계변경·기간 연장 때마다 4~5개 문서의 금액 한글 표기·부가세·날짜·현장명을 일일이 고치며 생기는 오타를 줄입니다.',
  automatic:
    '계약금액 한글 표기("일금 ...원정")·부가세 10% 연산, 착수~준공 총 일수 산출, 4종 서식 공통 항목 동기화, SHA-256 중복 감지 및 _v02 버전 보존',
  human:
    '건축사 자격번호·개설신고번호·변경 사유 등 누락/충돌 항목 검수, 발주처 특기 첨부서류(예정공정표 등) 확인 및 대표 건축사 직인 날인',
  environment:
    'Windows + 시스템 Node.js(실행 중 외부 AI 크레딧 소모 0원). 연결한 빈 실습 폴더에서 만들고 START.bat(또는 단일실행본 HTML)으로 실행합니다.',
} as const;

export const fileSorterExercise = commencementExercise;

type BuildGuide = PromptPlatformGuide & { purpose: string; variables: string };
function buildPrompt(key: string, id: string, title: string, file: string) {
  const source = path.join(repositoryRoot, 'review/daejeon/COMMENCEMENT_DOC_STUDENT', file);
  const guide = (promptAlignment as Record<string, unknown>)[id] as BuildGuide;
  if (!guide?.platform || !guide.derivation || !guide.aiPromptTip) {
    throw new Error('제2차시 제작 가이드 누락: ' + id);
  }
  return {
    key,
    id,
    title,
    file,
    prompt: readFileSync(source, 'utf8'),
    outputPath: 'practice/DJ-L02/commencement/' + file,
    guide,
  };
}

export const buildSteps = [
  {
    ...buildPrompt(
      'step1',
      'l02-step-1-prompt',
      'Step 1 요청문 · 기본 폴더 구조와 계약금액·과업일수 계산기 만들기',
      'DJ-L02_DOC_STEP_01.txt',
    ),
    goal: '빈 실습 폴더에 기본 구조를 만들고 한글 계약금액("일금 ...원정")·부가세·과업일수 계산기와 START/STOP부터 작동시킵니다.',
    why: '화면보다 핵심 숫자·날짜 계산 공식이 먼저 정확해야 이후 4종 서식의 숫자를 신뢰할 수 있고 크레딧 낭비도 없습니다.',
    files: 'START.bat · STOP.bat · app/calculator.js · app/rules.json · samples/ · projects/ · output/',
    check: '38,500,000원(부가세포함, 90일간)과 105,000,000원을 넣어 한글 금액과 공급가·부가세·총 일수가 정확히 출력되는지 확인합니다.',
    next: '같은 프로그램에 누락·모순을 잡아내는 사람 확인(검수 대기) 판정기를 덧붙입니다.',
  },
  {
    ...buildPrompt(
      'step2',
      'l02-step-2-prompt',
      'Step 2 요청문 · 자동 조립 완료와 사람 확인(검수 대기) 분리하기',
      'DJ-L02_DOC_STEP_02.txt',
    ),
    goal: '필수값이 모두 맞으면 자동 조립 완료로, 자격번호·변경사유 누락이나 날짜 역전이 있으면 사람 확인(검수 대기)으로 분리합니다.',
    why: '행정·계약 서류에서 빈칸을 AI나 프로그램이 임의로 지어내면 큰 사고가 되므로 멈춰야 할 경계를 코드로 명시합니다.',
    files: 'app/validator.js · app/rules.json',
    check: '정상 신규착수계, 변경사유·자격번호가 빠진 변경착수계, 준공일이 착수일보다 빠른 날짜 역전 데이터를 넣어 분기 결과를 비교합니다.',
    next: '검증을 통과하거나 경고가 붙은 데이터를 행정서류 4종 서식과 버전 보존 저장소에 연결합니다.',
  },
  {
    ...buildPrompt(
      'step3',
      'l02-step-3-prompt',
      'Step 3 요청문 · 행정서류 4종 동시 조립과 원본·버전(_v02) 보호',
      'DJ-L02_DOC_STEP_03.txt',
    ),
    goal: '착수신고서·책임기술자 선임계·참여기술자 명단·보안각서 4종을 동시 생성하고 동일 SHA-256 중복 안내와 _v02 버전 저장을 구현합니다.',
    why: '설계변경이 잦은 건축 실무에서는 이전 제출본을 덮어쓰지 않고 _v02, _v03으로 이력을 보존해야 안전합니다.',
    files: 'app/templates.js · app/server.js · projects/ · output/',
    check: '같은 입력을 두 번 저장할 때 SHA-256 중복 안내가 나오고, 계약금액 수정 후 저장할 때 _v02 파일이 새로 생기는지 확인합니다.',
    next: '완성된 엔진을 로컬 브라우저 화면(127.0.0.1:4175)과 외부 JSON 가져오기·인쇄/Word 출력에 연결합니다.',
  },
  {
    ...buildPrompt(
      'step4',
      'l02-step-4-prompt',
      'Step 4 요청문 · 브라우저 화면(4175)·외부 JSON 가져오기·A4/Word 출력',
      'DJ-L02_DOC_STEP_04.txt',
    ),
    goal: '실시간 금액·일수 요약, 검수 대기 경고창, 서류 4종 탭 미리보기, 외부 JSON 읽기 전용 불러오기, A4 인쇄·Word(.doc) 내보내기를 연결합니다.',
    why: '비전공 실무자도 코드 수정 없이 브라우저 폼에서 바로 서류를 점검·인쇄할 수 있어야 매일 쓰는 업무 도구가 됩니다.',
    files: 'app/ui/index.html · app.js · style.css · README.txt',
    check: '127.0.0.1:4175 화면 열림, 탭 전환, 외부 JSON 원본 불변, Word(.doc) 다운로드, STOP.bat 종료를 확인합니다.',
    next: '완성 프로그램에 DOC_TEST 시나리오 6종을 불러와 아래 기준표와 화면을 직접 비교합니다.',
  },
] as const;

export const integratedPrompt = buildPrompt(
  'integrated',
  'l02-integrated-prompt',
  '최종 통합 예시문 · 크레딧을 아껴 한 번에 전체 구조를 구현할 때 사용하는 완성형 프롬프트',
  'DJ-L02_DOC_INTEGRATED_PROMPT.txt',
);
