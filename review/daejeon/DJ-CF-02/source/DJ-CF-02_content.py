"""Regenerate CF-02 student documents from the current JSON; preserve actual generation records."""
from pathlib import Path
import argparse,hashlib,json,shutil
PACKAGE=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output-root',type=Path);parser.add_argument('--check-inputs',action='store_true');args=parser.parse_args()
repo=next(p for p in PACKAGE.parents if (p/'package.json').is_file() and (p/'src/lib/lesson02-ebook.ts').is_file())
if args.check_inputs:
 source=repo/'src/lib/lesson02-ebook.ts'
 print(json.dumps({'repositoryRoot':str(repo),'sourceRelative':source.relative_to(repo).as_posix(),'outsideRepositoryInputs':[],'normalizedTextSha256':hashlib.sha256(source.read_text(encoding='utf-8').encode()).hexdigest()},ensure_ascii=False));raise SystemExit(0)
R=args.output_root.resolve() if args.output_root else PACKAGE
(R/'source').mkdir(parents=True,exist_ok=True);(R/'instructor').mkdir(exist_ok=True)
C=json.loads((PACKAGE/'source/DJ-CF-02_content.json').read_text(encoding='utf-8'))
def write(name,text):(R/name).write_text(text.rstrip()+'\n',encoding='utf-8')
if R!=PACKAGE:
 shutil.copyfile(PACKAGE/'source/DJ-CF-02_content.json',R/'source/DJ-CF-02_content.json')
 for source in PACKAGE.glob('*.txt'):shutil.copyfile(source,R/source.name)
text=f"# {C['title']}\n\n{C['subtitle']}\n\n{C['notice']}\n\n"
for n,title,key in [('01','실습 개요','opening'),('02','주요 사용자','users'),('03','설계 문제','problem')]:text+=f'## {n} {title}\n{C[key]}\n\n'
text+='## 04 요구조건\n'+'\n\n'.join(' / '.join(x) for x in C['requirements'])+'\n\n유지: '+C['keep']+'\n\n변경: '+C['change']+'\n\n제외: '+C['exclude']+'\n\n## 05 제공 조건 / 미확정 조건\n'+'\n\n'.join(' / '.join(x) for x in C['known'])+'\n\n'+'\n\n'.join(' / '.join(x) for x in C['unknown'])+'\n\n### 원문 01~05절에서 10개 영역으로\n'+C['analysisMapping']+'\n\n| 분석 영역 | 원문 근거 |\n|---|---|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in C['analysisMappingRows'][1:])+'\n\n## 06 요청 결과물\n'+'\n'.join('- '+s for s in C['deliverables'])+'\n\n## 07 자료 사용 방법\n'+C['roles']+'\n\n'+C['expert']
write('DJ-CF-02_RFP-source.md',text)
write('DJ-CF-02_design-brief-sample.md','# 실습 B · 작업 기준서 10개 항목 예시\n\n교육용 제안 초안이며 정답이 아닙니다. 원문 대조 뒤 사람이 선택·보완합니다.\n\n'+C['briefTransition']+'\n\n'+'\n\n'.join(f'## {i}. {k}\n{v}' for i,(k,v) in enumerate(C['brief'],1)))
rows=[['실습 목표','입구 인지성과 거리 경관의 균형','01·03·R1·R3·R5','원문 조건'],['주요 사용자와 이용 상황','보행자·1층 상업·2층 업무/서비스·운영자; 공용 D1','02·K4','원문 조건'],['필수 요구조건','출입 인지·거리 조화·서로 다른 전략 2개; 같은 IMAGE 01로 비교','R1~R6','원문 조건'],['유지 조건',C['brief'][4][1],'R2·K1~K3·입면도','원문 조건'],['변경 가능 범위',C['change'],'R4','원문 조건'],['제외 범위',C['exclude'],'04 제외 범위','원문 조건'],['미확정 조건','U1 이용시간, U2 예산/영업유지, U3 보존/철거, U4 원하는 인상','05 U1~U4','미확정'],['추가 질문','각 U 항목을 운영자/건물주에게 묻고 답에 따라 달라질 결정을 기록','05 U1~U4','질문 제안'],['전문가 확인 항목',C['expert'],'05 미확정·자료 사용 범위','별도 확인 필요'],['디자인 대안 비교 기준','고정 보존 → D1 인지 → 층간/거리 조화 → 전략 차이','R1~R6에서 비교 기준 도출','해석·설계 판단']]
write('instructor/DJ-CF-02_analysis-verified.md','# 실습 B · 분석과 원문 대조 기록\n\n교육용 원문 데이터와의 대조 기록입니다. 실측이나 시공·법규 검증을 의미하지 않습니다.\n\n'+C['analysisMapping']+'\n\n| 영역 | 핵심 내용 | 근거 | 상태 |\n|---|---|---|---|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in rows)+'\n\n## 대조 결과\n- 문 1개·창호 5개·2층. D1의 1.80m는 외곽 포털 포함 개구부이며 문짝 유효폭 약 1.10m 설정이다.\n- 명목 면적: 13.60×8.20=111.52㎡를 111.5㎡로, 두 층 223.04㎡를 223.0㎡로 표시한다. 법정 면적 산정값이 아니다.\n- 새 도면·조건표는 교육용 기준이며 기존 생성 이미지의 정밀 투영 일치를 보증하지 않는다.\n- instructor의 실제 생성 Prompt와 생성 로그는 이전 설정으로 실행한 역사 기록이다. 현재 치수 근거로 사용하지 않으며 원문을 변경하지 않았다.\n- U1~U4를 미확정으로 유지한다. A/B 전략은 의뢰서의 지정 정답이 아닌 디자이너 판단이다.')
print('Current RFP, 10-item Brief and analysis regenerated; photos and actual generation prompts preserved.')