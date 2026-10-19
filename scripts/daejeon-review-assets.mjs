import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const repositoryRoot = process.env.EBOOK_REPOSITORY_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const reviewOutput = path.join(repositoryRoot, 'dist', 'daejeon-2026', 'review');
const common = [
  ['RFP-draft.pdf','RFP PDF','rfp'],
  ['participant-worksheet-draft.pdf','실습 기록지 PDF','rfp'],
  ['rfp-analysis-prompt.txt','RFP 분석 Prompt TXT','analysis'],
  ['image-prompt-from-brief.txt','학습용 7단 Prompt TXT','learning'],
  ['image-prompt-execution.txt','짧은 실행 Prompt TXT','execution'],
  ['design-brief-prompt.txt','기존 상세 Brief Prompt TXT · 상세 참고','instructor'],
  ['design-brief-sample.md','상세 Brief 작성 예 · 상세 참고','instructor'],
  ...['A','B'].flatMap((letter) => [
    [`example-${letter}.png`,`교육용 적용 예시 ${letter} PNG`,'example'],
    [`example-${letter}-prompt.txt`,`적용 예시 ${letter} 학습 Prompt TXT`,'example'],
  ]),
];
export const packages = [
  { id:'DJ-CF-01', kind:'INTERIOR', title:'소형 카페 고객공간 리뉴얼', image:'existing-view-02.png', diagram:'existing-plan.png',
    keep:'D1·W1·W2·C1·외곽 벽체, K1 위치, S1의 위치·기능·배경과 같은 카메라 시점',
    change:'고객공간 Z1의 가구·테이블·의자, 벽면 마감 재료·색감, 바닥 분위기, 조명·등기구, 브랜딩 없는 소품',
    exclude:'주방 신설·카운터 이전·구조 변경·설비 재설계·S1 상세 재설계·화장실 및 주방·설비 상세계획',
    diagramRole:'기준 평면도는 교육용 치수·고정 요소의 근거입니다. 현황 02는 편집 원본, 01·03은 다른 시점 이해용입니다.',
    strategyNames:['빠른 이용 / 픽업 편의 중심','짧은 체류 / 편안함 중심'],
    assets:[...common, ...['png','pdf'].map((ext)=>[`existing-plan.${ext}`,`기준 평면도 ${ext.toUpperCase()}`,'rfp']), ...['01','02','03'].map((n)=>[`existing-view-${n}.png`,`현황 이미지 ${n} PNG`,n==='02'?'early':'rfp']),
      ['example-A-generation-prompt.txt','실제 생성 Prompt A · 생성 기록','evidence'],['example-B-generation-prompt.txt','실제 생성 Prompt B · 생성 기록','evidence']] },
  { id:'DJ-CF-02', kind:'EXTERIOR', title:'소형 근린생활시설 외관 리뉴얼', image:'existing-view-01.png', diagram:'existing-elevation.png',
    keep:'매스·2층·폭·높이·지붕선·D1·W1~W5·SZ1 위치와 영역, 주변 도로·보도 관계와 같은 카메라 시점',
    change:'외장 마감, 입구 강조, 소형 캐노피, SZ1 무문자 표현, 조명·소규모 조경 · 개구부와 보행 공간 유지',
    exclude:'출입구·창호 이동·확대·추가, 증축·구조 변경·발코니·도로 변경·실내/설비/시공 상세·문자·로고·보도 점유',
    diagramRole:'기준 입면도는 교육용 치수·개구부의 근거입니다. IMAGE 01은 편집 원본, IMAGE 02는 같은 건물의 깊이 이해용입니다.',
    strategyNames:['입구의 한 점 강조','거리의 수평 리듬'],
    assets:[...common, ...['png','pdf'].map((ext)=>[`existing-elevation.${ext}`,`기준 입면도 ${ext.toUpperCase()}`,'rfp']), ...['01','02'].map((n)=>[`existing-view-${n}.png`,`현황 IMAGE ${n} PNG`,n==='01'?'early':'rfp']),
      ['example-A-generation-prompt.txt','실제 생성 Prompt A · 생성 기록','evidence'],['example-B-generation-prompt.txt','실제 생성 Prompt B · 생성 기록','evidence']] },
].map((project)=>({...project, assets:project.assets.map(([suffix,label,stage])=>({file:`${project.id}_${suffix}`,label,stage}))}));
export const originalPath = (id,file) => path.join(repositoryRoot, 'review','daejeon',id, ...(id==='DJ-CF-02' && file.endsWith('-generation-prompt.txt')?['instructor']:[]), file);
export const promptText = (id,suffix) => readFileSync(originalPath(id, `${id}_${suffix}`),'utf8').trim();
export const simpleBriefPrompt = (id) => `첨부한 ${id} RFP 분석표를 원문·기준 도면·현황자료와 대조한 뒤 검증된 핵심 조건으로 간단한 Design Brief를 작성해 주세요. 미검증 항목은 먼저 대조 대상으로 표시하세요.
RFP를 다시 요약하지 말고 다음 디자인 작업에 사용할 실행 기준으로 정리하세요.
각 항목은 1~3문장으로 쓰세요.
1. 프로젝트 목표
2. 주요 사용자
3. 핵심 설계 문제
4. 설계 우선순위 1→2→3
5. 유지 조건
6. 변경 가능 범위
7. 제외 범위
8. 미확정 조건 / 가정
9. 디자인 대안 전략 2개
10. 결과 검토 기준
각 판단에 RFP 요구 ID 또는 근거 자료·페이지를 붙이고 원문 조건과 새 설계 판단을 구분하세요. 없는 수치·예산·운영·철거 승인 조건을 채우지 마세요. 미확정 조건은 그대로 두고 임시 가정에는 확인할 질문을 붙이세요.
전략 2개는 직접 정한 우선순위를 근거로 서로 다른 공간 사용 또는 외관 표현 방법으로 제안하세요. 색상만 바꾸지 말고 장점·한계·비교 기준을 적으세요. 제공된 A/B 예시를 정답으로 사용하지 마세요.
같은 입력 이미지·시점·고정 조건으로 비교합니다. 제외 범위를 넘어가지 말고 실제 치수·구조·설비·시공·법규 적합성은 이미지로 확정하지 마세요. 추가 질문과 전문가 확인 항목은 분석표에 남기고 선택 전 다시 확인하세요.`;
export const generatedPrompts = () => [
  ...packages.map((p)=>({file:`practice/${p.id}/${p.id}_day01-design-brief-prompt.txt`,text:simpleBriefPrompt(p.id)})),
];
