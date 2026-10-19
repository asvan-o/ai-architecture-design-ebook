import portfolio from './lesson111213.json';
import {lessonTitle} from './daejeon-2026';
import {lesson02Title} from './daejeon-lesson02-automation';
import {lesson03Title} from './daejeon-lesson03';
import {lesson04Title} from './daejeon-lesson04';
import {lesson05Title} from './daejeon-lesson05';
import {lesson06Title} from './daejeon-lesson06';
import {lesson07Title} from './daejeon-lesson07';
import {lesson08Title} from './daejeon-lesson08';
import {lesson09Title} from './daejeon-lesson09';
import {lesson10Title} from './daejeon-lesson10';

// Titles remain in their lesson data; every overview uses the same bindings.
export const alignedLessons=[
 {id:'01',title:lessonTitle,stage:'대주제 1 → 대주제 2',schedule:'대주제 1 완결 → 대주제 2 시작 · AI 리터러시 기초 및 실무 시나리오 제안 이미지',description:'AI 판단 → Prompt 7규칙·7단 공식 → Nano Banana 첫 생성·수정 → 의뢰서 분석·검증 → 작업 기준서 → A/B 이미지 전략.'},
 {id:'02',title:lesson02Title,stage:'대주제 2 · 완결',schedule:'대주제 2 완결 · 실무 시나리오 기반 설계 워크플로우 자동화',description:'업무 자동화와 Vibe Coding → Architecture·Hierarchy 설계 → 파일 정리 자동화·도면 제출 전 빠른 점검 구현·실행.'},
 {id:'03',title:lesson03Title,stage:'대주제 3 · 시작',schedule:'대주제 3 시작 · 초기 기획 실내 인페인팅 및 래피드 콘셉트 도출',description:'기준 공간 일부 수정 → 디자인 방향 보드 제작 → 보드 방향 갱신 → 새로운 실내 콘셉트 확장.'},
 {id:'04',title:lesson04Title,stage:'대주제 3 · 계속',schedule:'대주제 3 계속 · 초기 기획 건축 외관 인페인팅 및 래피드 대안 비교',description:'클린업 → 마감 교체 A/B/A2 → 조경·석양 조명 → 스케치·서브 시점 → 대안 비교·선별.'},
 {id:'05',title:lesson05Title,stage:'대주제 3 · 완결',schedule:'대주제 3 완결 · 초기 기획 2D 평면도 판독 및 도면 인페인팅 실무',description:'평면도 판독·검증 → 가구 영역 부분 수정 → 확대·문/가벽 수정 → 전체 재반영·중첩 비교.'},
 {id:'06',title:lesson06Title,stage:'대주제 4 · 시작',schedule:'대주제 4 시작 · 3D 입체·분해도 확장, 메인-서브 통합 및 2D 조닝 역추출 브릿지',description:'Top View 3D → 아이소메트릭 A/B → Z축 분해도·실내 서브 시점 → 공간 관계·2D 개념 조닝.'},
 {id:'07',title:lesson07Title,stage:'대주제 4 · 완결',schedule:'대주제 4 완결 · 다각도 시점 탐색·이미지 고도화·고화질 렌더링',description:'Gaussian 구도·시점 확보 → Cross-Generation 이미지 고도화·부분 보정 → ComfyUI·SR1033 초해상화 → 제안서용 렌더링 검수.'},
 {id:'08',title:lesson08Title,stage:'대주제 5 · 시작',schedule:'대주제 5 시작 · 실무 도면 전처리·판독 기준표·공간 관계 검증',description:'같은 원본 도면 → NotebookLM 판독·기준표 → 클린 선화 → 공간 관계 교차검증 → Graphviz 다이어그램 → Blender MCP 연결·첫 3D 룸.'},
 {id:'09',title:lesson09Title,stage:'대주제 5 · 완결',schedule:'대주제 5 완결 · 자체 제작 3층 주택·가구·재질·카메라 이동',description:'주택 도면 받기 → 층별 공간·가구 만들기 → 재질·조명 → 카메라 이동 → FBX·GLB 저장.'},
 {id:'10',title:lesson10Title,stage:'대주제 6 · 시작',schedule:'대주제 6 시작 · 건축법규 검토 및 다차원 실무 검증',description:'공식 원문 → A·B 듀얼 NotebookLM → 배치·규모·피난·측정 대조 → 오류 교정 → 건축사 최종 검토.'},
 {id:'11',title:portfolio.lessons['11'].title,stage:'대주제 7 · 시작',schedule:'대주제 7 · 산출물 통합 기획·발표 구성',description:'1~10차시 결과 선별 → 보드·PPT·보고서 역할 구분 → 8장 스토리보드·권리 확인.'},
 {id:'12',title:portfolio.lessons['12'].title,stage:'대주제 7 · 계속',schedule:'대주제 7 · 포트폴리오·PPT 제안서 제작',description:'주택 원자료 → 보드 4장 → 편집 가능한 PPT 8장 → 원본·한글·형상 검수.'},
 {id:'13',title:portfolio.lessons['13'].title,stage:'대주제 7 · 완결',schedule:'대주제 7 · 결과보고서·최종 발표·인계',description:'보고서·의사결정 기록 → 제출 패키지 → 발표·검수 → 사람의 최종 확인.'},
] as const;

export const topicLessonLinks=[
 [{id:'01',label:'제1차시 전반부'}],
 [{id:'01',label:'제1차시 후반부'},{id:'02',label:'제2차시'}],
 [{id:'03',label:'제3차시'},{id:'04',label:'제4차시'},{id:'05',label:'제5차시'}],
 [{id:'06',label:'제6차시'},{id:'07',label:'제7차시'}],
 [{id:'08',label:'제8차시'},{id:'09',label:'제9차시'}],[{id:'10',label:'제10차시'}],[{id:'11',label:'제11차시'},{id:'12',label:'제12차시'},{id:'13',label:'제13차시'}],
] as const;

// Review routes only; approved curriculum/release remains unchanged.
export const upcomingLessonSequence=[
 {id:'09',topicNumber:5,label:lesson09Title,state:'review/draft 구현'},
 {id:'10',topicNumber:6,label:lesson10Title,state:'review/draft 구현'},
 ...(['11','12','13'] as const).map(id=>({id,topicNumber:7,label:portfolio.lessons[id].title,state:'review/draft 구현'})),
] as const;
