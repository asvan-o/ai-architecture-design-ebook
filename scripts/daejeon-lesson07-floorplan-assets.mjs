import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {repositoryRoot} from './course-registry.mjs';
export const floorplanAudit='review/daejeon/DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11';
export const floorplanImagePrefix='images/daejeon/lesson-07/floorplan/';
export const floorplanDownloadPrefix='downloads/daejeon/lesson-07/floorplan/';
export const floorplanPromptDefinitions=[
 ['notebookPlanAnalysisPrompt','notebook-plan-analysis','원본 평면도 정보 분석 프롬프트'],
 ['floorPlanCriteriaPrompt','floor-plan-criteria','후속 AI용 최종 확정 도면 기준표 프롬프트'],
 ['topViewPrompt','top-view-structure','구조 검토용 Top View 3D 생성 프롬프트'],
 ['spatialAnalysisPrompt','spatial-analysis','공간 기능·공간 인접 관계·주요 동선 분석 프롬프트'],
 ['validationPrompt','spatial-validation','분석 결과 검증 및 최종 인계본 정리 프롬프트'],
 ['graphvizPrompt','graphviz-generation','Graphviz(DOT) 코드 생성 프롬프트'],
];
export const displayFloorplanPrompt=text=>text.replaceAll('1차 분석 초안입니다.','1차 분석 결과입니다.').replaceAll('검토가 필요한 초안입니다.','검토가 필요한 1차 분석 결과입니다.');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Historical external samples remain read-only in their original audit. Active assets are synthetic.
export const floorplanImageCopy={
 'clean-line':{title:'교육용 클린 선화 · 문자 오류 비교본',description:'자체 도면의 주석을 제거하고 모형실 → 이사실, 13인승 → 13연승을 의도적으로 넣은 교육용 비교본입니다. 실제 AI 오류의 증빙이 아니며 원본 PDF·기준표와 대조합니다.'},
 'top-view':{title:'교육용 Top View 3D · 문자 오류 비교본',description:'새 교육용 도면의 입체 표현입니다. 사장실·이사실·계단창·1.5인승은 의도한 문자 오류입니다. 재료·빛·높이·부가 연출은 표현이며 원본 PDF가 사실 기준입니다.'},
 'notebook-diagram':{title:'방법 A · 세로형 관계 구조화 예시',description:'교육용 원본에서 검증한 DOT를 세로로 렌더링했습니다. NotebookLM 분석을 관계표로 넘기는 방법의 예시이며 서비스 실행 화면은 아닙니다.'},
 'chatgpt-diagram':{title:'방법 B · 가로형 기능·관계 다이어그램',description:'같은 교육용 DOT를 가로로 렌더링했습니다. 모형실·소장실·계단실의 이름과 관계 의미를 유지하며 ChatGPT 서비스 실행 화면으로 제시하지 않습니다.'},
};
export function getLesson07FloorplanManifest(){const manifest=JSON.parse(fs.readFileSync(path.join(repositoryRoot,floorplanAudit,'floorplan-manifest.json'),'utf8'));return{...manifest,files:manifest.files.map(file=>({...file,...(floorplanImageCopy[file.key]||{})}))};}
export function getLesson07FloorplanAssets(){return getLesson07FloorplanManifest().files.map(file=>({...file,source:path.join(repositoryRoot,'public',file.outputPath)}));}
export function verifyLesson07FloorplanAssets(){const manifest=getLesson07FloorplanManifest();for(const file of manifest.files){const bytes=fs.readFileSync(path.join(repositoryRoot,'public',file.outputPath));assert.equal(sha(bytes),file.sha256,file.outputPath);if(file.sourcePath)assert.equal(sha(fs.readFileSync(path.join(repositoryRoot,file.sourcePath))),file.sha256);}return manifest;}
async function build(){
 const hotfix="review/daejeon/DJ-L06-OFFICE-SUBVIEW-AND-HOUSE-DOOR-HOTFIX/revision-12";if(fs.existsSync(path.join(repositoryRoot,hotfix,'manifest.json'))){execFileSync(process.execPath,[path.join(repositoryRoot,hotfix,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});return;}
 execFileSync(process.execPath,[path.join(repositoryRoot,floorplanAudit,'assemble-assets.mjs')],{cwd:repositoryRoot,stdio:'inherit',windowsHide:true});
 verifyLesson07FloorplanAssets();
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
