"""Authored fictional exercise content; all rendered documents derive from these data."""
from pathlib import Path
import argparse, json, re, hashlib

def find_repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if ((candidate / 'package.json').is_file()
                and (candidate / 'src/lib/lesson02-ebook.ts').is_file()
                and (candidate / 'data/courses').is_dir()):
            return candidate
    raise FileNotFoundError(
        f'Repository root not found above {start}: expected package.json, '
        'src/lib/lesson02-ebook.ts and data/courses')

repo_root=find_repo_root(Path(__file__).resolve())
lesson02_source=repo_root/'src/lib/lesson02-ebook.ts'
lesson02_text=lesson02_source.read_text(encoding='utf-8')
parser=argparse.ArgumentParser(description='Prepare CF-02 textual sources; no PDF/image authoring.')
parser.add_argument('--output-root',type=Path)
parser.add_argument('--check-inputs',action='store_true')
args=parser.parse_args()
if args.check_inputs:
    print(json.dumps({'repositoryRoot':str(repo_root),'source':str(lesson02_source),
                      'sourceRelative':'src/lib/lesson02-ebook.ts','outsideRepositoryInputs':[],
                      'normalizedTextSha256':hashlib.sha256(lesson02_text.encode('utf-8')).hexdigest()},ensure_ascii=False))
    raise SystemExit(0)
R=args.output_root.resolve() if args.output_root else Path(__file__).resolve().parent.parent
R.mkdir(parents=True,exist_ok=True)
(R/'source').mkdir(exist_ok=True)
(R/'instructor').mkdir(exist_ok=True)
def write(name,text):(R/name).write_text(text.strip()+'\n',encoding='utf-8')
def jwrite(name,data):write(name,json.dumps(data,ensure_ascii=False,indent=2))
C={
 'id':'DJ-CF-02','status':'review-draft','courseStatus':'design-pending','revision':'02','date':'2026-10-09',
 'title':'소형 근린생활시설 외관 리뉴얼','subtitle':'출입 인지성과 거리 경관의 균형',
 'notice':'교육용 가상 프로젝트 · review/draft · 실측·시공·법규 적합성을 증명하지 않음',
 'opening':'건물 운영자는 노후한 2층 근린생활시설의 도로변 전면을 개선하려 합니다. 건물의 규모와 개구부는 그대로 두고, 처음 방문하는 사람이 입구를 쉽게 찾으면서 주변 거리와 자연스럽게 어울리는 외관을 제안해 주세요.',
 'users':'처음 방문하는 보행자, 1층 상업시설 이용자, 2층 업무·서비스 시설 이용자, 건물 운영자. D1은 두 층 이용자의 공용 진입구로 설정합니다. 내부 계단·점포 구성은 이번 과제에서 다루지 않습니다.',
 'problem':'주 출입구가 창호와 비슷하게 읽혀 진입 위치를 찾기 어렵고, 단조로운 외벽과 빈 간판 영역 때문에 건물의 인상이 약합니다. 1층과 2층이 한 건물로 읽히면서도 보행자가 입구를 바로 찾을 수 있어야 합니다.',
 'requirements':[
  ['R1','출입 인지성','처음 방문한 보행자가 D1을 주 출입구로 알아볼 수 있도록 전면에서 시각적 우선순위를 만들어 주세요.'],
  ['R2','유지 조건','10m 폭, 7.2m 높이의 2층 매스, 지붕선, 층간 관계, D1 1개와 W1~W5의 위치·개수·크기, 창호 사이 벽체를 유지합니다. 구조체와 인접 건물·보도·도로의 기본 관계도 변경하지 않습니다.'],
  ['R3','외관 정체성','단조로운 외관 인상을 개선하되 증축이나 과도한 조형물 없이 기존 건물에 맞는 정체성을 제안해 주세요.'],
  ['R4','변경 범위','외장재·외벽 색상·입구 주변 마감과 강조, 소형 캐노피, SZ1의 무문자 간판 표현, 외부 조명, 소규모 조경을 제안할 수 있습니다. 창호를 가리거나 보행을 방해하지 마세요.'],
  ['R5','주변 관계','주변의 단순한 저층 건물과 거리 환경을 고려해 존재감과 조화를 함께 설명해 주세요. 실제 상호·로고 대신 비어 있는 SZ1을 사용합니다.'],
  ['R6','대안 제안','R1~R5를 근거로 서로 다른 외관 전략 2개를 제안해 주세요. 동일 IMAGE 01, 카메라, 매스, 개구부, 주간 조건으로 비교합니다. 색상만 다른 결과는 서로 다른 전략으로 보지 않습니다. 각 전략의 장점·한계와 선택 이유를 설명해 주세요.']
 ],
 'known':[
  ['K1','교육용 형상','전면 폭 10m, 높이 7.2m, 깊이 6m. 2층 바닥 기준 +3.6m, 지붕 슬래브 +6.8m, 상단 +7.2m.'],
  ['K2','개구부','D1 1개 / 1층 W1·W2 / 2층 W3·W4·W5. 위치·크기는 기준 입면도에서 확인. 우측 측벽에 개구부 없음.'],
  ['K3','간판과 거리','SZ1 8.4×0.5m, 하단 +3.0m. 전면 보도 깊이 2m와 평탄한 도로 관계를 교육용으로 설정. 공공 보도 점유는 허용 조건이 아님.'],
  ['K4','사용 범위','1층 상업, 2층 업무·서비스, 공용 D1. 실내계획·용도변경·실제 입주 업종은 설계 범위 밖. 현황은 가상이며 실제 주소·발주자 없음.']
 ],
 'unknown':[
  ['U1','주요 이용 시간대 및 야간 운영 여부'],
  ['U2','예산 및 공사 중 영업 유지 조건'],
  ['U3','기존 외장재·간판 영역의 보존 여부'],
  ['U4','원하는 건물 이미지 또는 분위기']
 ],
 'keep':'전체 매스·폭·높이·2층 규모·지붕선·층간 관계 / D1·W1~W5 / 구조체 기본 위치 / 창호 사이 벽체 / 인접 건물·보도·도로 관계. SZ1은 제공 위치·범위 안에서 표현합니다.',
 'change':'외장 마감 재료·색상 / 입구 주변 강조 / 소형 캐노피 / SZ1의 무문자 표현 / 외부 조명 / 소규모 조경. 개구부를 침범하지 않고, 보행 공간은 비워 둡니다.',
 'exclude':'층수·폭·높이 변경, 출입구·창호 이동이나 확대, 새 대형 개구부, 증축, 구조체 삭제, 발코니·대형 구조물·과도한 조형물, 도로 구조 변경. 실내·구조·설비·시공 상세와 실제 인허가 판단은 과제 밖입니다.',
 'deliverables':['서로 다른 외관 리뉴얼 콘셉트 2안','각 안의 디자인 전략과 출입 인지성 개선 방향','외장재·입구·간판 영역·조명의 주요 제안','기존 외관과 비교 가능한 콘셉트 이미지','유지 조건 준수 여부와 추가 확인이 필요한 사항'],
 'roles':'RFP는 요청과 범위의 근거, 기준 입면도는 가상 치수·개구부의 근거입니다. IMAGE 01은 편집 원본, IMAGE 02는 같은 건물의 깊이·출입 관계를 읽는 보조 자료입니다. 별도 Reference를 쓰면 재료·분위기만 참고하고 구조를 가져오지 않습니다.',
 'workflow':'RFP → AI 분석 → 원문 비교·검증 → 핵심 조건 → Design Brief → 전략 2개 → 이미지 Prompt → 이미지 생성 → 결과 비교',
 'expert':'외장재 성능·부착, 캐노피 구조·돌출 가능 범위, 간판·조명·보도 관련 기준, 전기·방수 상세는 해당 전문가가 별도 확인해야 합니다. 이미지로 적합성을 확정하지 않습니다.',
 'areas':['프로젝트 목표','주요 사용자와 이용 상황','필수 요구조건','유지 조건','변경 가능 범위','제외 범위','미확정 조건','추가 질문','전문가 확인 항목','디자인 대안 비교 기준'],
 'formula':['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'],
 'brief':[
  ['프로젝트 목표','공용 D1을 찾기 쉽게 하고, 단순한 저층 거리 안에서 건물의 일관된 인상을 만든다. 근거: R1·R3·R5.'],
  ['주요 사용자','첫 방문 보행자와 두 층 이용자의 공용 진입을 우선한다. 구체적인 업종·이용 비율은 설정하지 않는다. 근거: 주요 사용자·K4.'],
  ['핵심 설계 문제','D1은 오른쪽에 있으나 긴 SZ1과 창호들이 수평으로 반복된다. 입구를 별도로 강조할지, 수평 리듬 속에 안내할지 판단이 필요하다. 이는 입면도와 R1·R5를 해석한 설계 문제다.'],
  ['설계 우선순위','1순위 고정 요소 유지 → 2순위 D1 인지 → 3순위 1·2층과 거리의 조화 → 4순위 마감·조명 표현. 구조 오류가 있으면 미관 평가 전에 수정한다. 이 순서는 강사용 설계 판단 예시다.'],
  ['유지 조건','10×7.2m 전면, 2층·지붕선·층간 관계, D1 1개·창호 5개, SZ1 위치·범위, 우측 무창 벽, 인접 건물·보도·도로와 동일 정면 시점. 근거: R2·K1~K3·입면도.'],
  ['변경 가능 범위','R4 범위에서 외장 마감과 입구 표현을 조정한다. 창호는 덮지 않는다. SZ1은 철거 여부가 미확정이므로 영역을 유지한 표면 교체 제안으로 한정한다. 보도 점유와 구조 변경은 제안하지 않는다.'],
  ['미확정 조건','U1~U4는 미확정 상태로 남긴다. 예산·운영시간·공사기간·철거 승인·브랜드를 새 사실로 만들지 않는다. 아래 재료와 조명은 디자인 제안이며 공사 승인이 아니다.'],
  ['대안 전략 2개','A - 입구의 한 점 강조: D1 주변만 얇은 세로 포털과 소형 캐노피로 강조하고 나머지는 중립적으로 둔다. R1을 직접 해결하지만 입구만 과하게 튈 수 있다. B - 거리의 수평 리듬: 1층 벽면 마감과 SZ1의 수평 연속성, 반복되는 작은 조명으로 건물 전면을 묶고 D1에 보조 빛을 둔다. R3·R5에 유리하지만 D1이 다시 묻힐 수 있다. 두 전략 모두 R1을 충족해야 한다. 정답이나 발주자의 지정 방향이 아니다.'],
  ['결과 검토 기준','먼저 매스·층수·D1·W1~W5·카메라 보존 여부를 원본과 대조한다. 그다음 D1의 시각적 우선순위, 1·2층 연결, 주변 대비, 전략 차이, 미확정 조건의 단정 여부를 비교한다. 동점이면 첫 방문 보행자 관점에서 선택 근거를 적는다.']
 ],
 'strategies':{
  'A':{'name':'입구의 한 점 강조','proposal':'D1 주변에만 얇은 브론즈 계열 세로 포털, 작고 얕은 캐노피와 국부 조명을 제안합니다. 나머지 외벽은 중립적인 밝은 회색, SZ1은 비어 있는 기존 범위로 둡니다.','risk':'입구 대비가 주변 거리보다 과할 수 있으므로 강조 범위를 D1 주위로 제한합니다.'},
  'B':{'name':'거리의 수평 리듬','proposal':'1층의 불투명 벽에 얇은 점토벽돌 계열 마감, 상부에 중립적인 회벽을 제안합니다. SZ1을 따라 수평 띠와 낮은 강도의 선형 조명을 묶고, 벽체 사이 작은 조명을 반복하며 D1에 보조 빛을 둡니다. 돌출 캐노피 없이 전면 리듬으로 안내합니다.','risk':'입구가 수평 띠에 묻힐 수 있으므로 D1의 보조 조명과 주변 대비를 별도로 확인합니다.'}
 }
}
jwrite('source/DJ-CF-02_content.json',C)
write('DJ-CF-02_RFP-source.md',f"# {C['title']}\n\n{C['subtitle']}\n\n{C['notice']}\n\n## 01 프로젝트 개요\n{C['opening']}\n\n## 02 주요 사용자\n{C['users']}\n\n## 03 설계 문제\n{C['problem']}\n\n## 04 요구조건\n"+'\n\n'.join(' / '.join(x) for x in C['requirements'])+'\n\n유지: '+C['keep']+'\n\n변경: '+C['change']+'\n\n제외: '+C['exclude']+'\n\n## 05 제공 조건 / 미확정 조건\n'+'\n\n'.join(' / '.join(x) for x in C['known'])+'\n\n'+'\n\n'.join(' / '.join(x) for x in C['unknown'])+'\n\n## 06 요청 결과물\n'+'\n'.join('- '+s for s in C['deliverables'])+'\n\n## 07 자료 사용 방법\n'+C['roles']+'\n\n'+C['expert'])
analysis='''첨부한 DJ-CF-02 RFP, 기준 입면도, 현황 IMAGE 01·02를 분석해 주세요. 아직 Brief나 디자인 전략을 만들지 마세요.

결과는 다음 10개 영역으로 작성하세요.
1. 프로젝트 목표
2. 주요 사용자와 이용 상황
3. 필수 요구조건
4. 유지 조건
5. 변경 가능 범위
6. 제외 범위
7. 미확정 조건
8. 추가 질문
9. 전문가 확인 항목
10. 디자인 대안 비교 기준

표의 열은 영역 / 핵심 내용 / 근거(RFP 요구 ID·자료명·페이지) / 확인 상태입니다. 상태는 ‘원문 조건’, ‘해석·제안’, ‘미확정’으로 구분하세요. 수치 조건은 관련 영역에 넣으세요.

치수·개구부의 근거는 입면도이며 이미지는 현황을 이해하는 표현입니다. 서로 다르면 양쪽 근거를 적으세요. 읽지 못한 정보는 ‘판독 불가’로 남기세요. 없는 예산·운영시간·철거 승인·브랜드를 채우지 마세요.

추가 질문 3~5개에는 질문 대상과 답에 따라 달라질 결정을 적으세요. R6는 두 전략을 요청할 뿐 A/B 방향을 지정하지 않습니다. 전문가 확인을 설계 사실로 바꾸지 마세요. 마지막에 사람이 원문과 대조할 핵심 조건을 적고 검증을 기다리세요.'''
write('DJ-CF-02_rfp-analysis-prompt.txt',analysis)
brief='''RFP 분석표를 원문과 대조한 뒤 확인·수정한 핵심 조건으로 DJ-CF-02 Exterior Design Brief를 작성해 주세요. 검증되지 않은 분석표라면 먼저 대조할 항목을 알려 주세요.

Brief는 RFP를 다시 요약하는 문서가 아니라 다음 디자인 작업의 실행 기준입니다. 다음 9개 항목을 각 1~3문장으로 쓰세요.
프로젝트 목표 / 주요 사용자 / 핵심 설계 문제 / 설계 우선순위 / 유지 조건 / 변경 가능 범위 / 미확정 조건 / 대안 전략 2개 / 결과 검토 기준.

R1~R6 중 어떤 근거로 우선순위를 정했는지 적으세요. 전략은 수강생의 판단으로 도출하고, 서로 다른 해결 방법·장점·한계를 설명하세요. 색상만 다른 전략은 피하세요. RFP 원문 조건과 새 설계 판단을 구분하고, U1~U4는 답을 받기 전까지 미확정으로 유지하세요.

같은 IMAGE 01·시점·매스·창호·출입구·주간 조건으로 비교하게 만드세요. 보행 공간 침범, 구조 변경, 법규 적합성을 이미지로 승인하지 마세요. 마지막에 선택 전 확인할 문제를 남기세요.'''
write('DJ-CF-02_design-brief-prompt.txt',brief)
write('DJ-CF-02_design-brief-sample.md','# DJ-CF-02 Design Brief 예시\n\n강사용 설계 판단 예시이며 정답이 아닙니다. RFP → 10개 영역 분석 → 원문 대조를 거쳐 작성한 제안입니다. 입력 검증 기록: instructor/DJ-CF-02_analysis-verified.md.\n\n'+'\n\n'.join(f'## {i}. {k}\n{v}' for i,(k,v) in enumerate(C['brief'],1)))
def structured(strategy=None):
 purpose=f"현황 IMAGE 01을 '{C['strategies'][strategy]['name']}' 전략의 외관 콘셉트로 바꿔 주세요." if strategy else '현황 IMAGE 01을 검증한 Brief의 [선택한 전략]에 맞는 외관 콘셉트로 바꿔 주세요.'
 change=C['strategies'][strategy]['proposal'] if strategy else '선택한 전략에 따라 외장 마감, 입구 강조, 소형 캐노피, 무문자 SZ1과 조명을 조정하세요.'
 return '\n\n'.join([f'목적\n{purpose}','맥락\n처음 방문하는 사람이 공용 D1을 쉽게 찾고, 단순한 저층 거리와 어울리는 2층 근린생활시설입니다.','입력자료\nIMAGE 01은 편집 원본, 입면도는 고정 요소의 근거, 검증한 Brief는 전략의 기준입니다. IMAGE 02는 깊이 이해용입니다.','작업 단계\n고정 요소를 확인한 뒤 선택한 전략을 적용하고 원본과 대조하세요.','조건·제한\n매스·2층·폭·높이·지붕선·D1·W1~W5·SZ1 영역·카메라·주변 도로를 유지하세요. '+change+' 창호 확대·이동·추가, 증축·발코니·구조 변경·문자·로고·보도 점유는 금지합니다.','출력 형식\n원본과 같은 시점·화면비·주간 조건의 사실적인 이미지 1장.','검토 기준\n입면도와 원본 대비 고정 요소, D1 인지성, 거리 조화와 전략 차이를 확인하세요. 예산·야간 운영·철거 가능 여부, 실제 치수·구조·시공·법규는 확정하지 않습니다.'])
def execution(strategy=None):
 change=C['strategies'][strategy]['proposal'] if strategy else 'Brief의 [선택한 전략]을 외장재·색상·입구 강조·소형 캐노피·무문자 SZ1·조명으로 표현해 줘.'
 return 'IMAGE 01을 편집 원본, 입면도를 고정 조건, 검증한 Brief를 전략 기준으로 사용해 줘.\n\n'+change+'\n\n건물 매스·2층·폭·높이·지붕선, D1 1개·W1~W5 5개와 크기·위치, SZ1 영역, 카메라·보도·도로·인접 건물을 유지해. 창호 추가·이동·확대, 증축·발코니·구조 변경·문자·로고·보도 점유는 금지해.\n\n동일 시점·화면비·주간 조건의 사실적인 이미지 1장. 만든 뒤 개구부와 매스, 입구 인지성, 전략 표현을 원본과 비교해. 구조·시공·법규·예산·야간 운영·철거 가능 여부는 확정하지 마.'
write('DJ-CF-02_image-prompt-from-brief.txt',structured())
write('DJ-CF-02_image-prompt-execution.txt',execution())
for a in ['A','B']:
 write(f'DJ-CF-02_example-{a}-prompt.txt',structured(a));write(f'DJ-CF-02_example-{a}-execution-prompt.txt',execution(a))
write('DJ-CF-02_prompt-practice.txt','''DJ-CF-02 / 2교시 Exterior Prompt 연습
입력: 현황 IMAGE 01 + 기준 입면도. 4~6교시 전체 RFP 실습 전에 조건을 쓰는 연습입니다.

A. 부족한 짧은 Prompt
“이 건물 외관을 현대적으로 바꿔줘.”
짧은 길이가 문제가 아니라 작업 목적과 조건이 빠진 것이 문제입니다.

B. 빠진 것을 찾아 표시하세요
□ 목적: 어떤 결과를 왜 만드는가?
□ 맥락: 누구를 위한 어떤 건물인가?
□ 입력자료: 무엇이 편집 원본이고 무엇이 고정 조건 근거인가?
□ 작업 단계: 확인, 적용, 비교를 어떤 순서로 하는가?
□ 조건·제한: 유지 / 변경 / 금지 / 확인 불가를 구분했는가?
□ 출력 형식: 이미지 수, 시점, 화면비는 무엇인가?
□ 검토 기준: 생성 뒤 무엇을 원본과 비교하는가?

C. 개선한 구조화 Prompt
목적
주 출입구를 쉽게 찾는 외관 콘셉트 이미지로 바꿔 주세요.

맥락
처음 방문하는 보행자와 1·2층 이용자의 공용 진입을 돕는 교육용 가상 프로젝트입니다.

입력자료
IMAGE 01은 편집 원본, 입면도는 D1·W1~W5와 매스의 고정 조건 근거입니다.

작업 단계
고정 요소를 확인한 다음 D1 주변의 마감 대비와 작은 조명을 제안하고 원본과 비교하세요.

조건·제한
2층 매스·폭·높이·지붕선·D1·창호 5개·SZ1·카메라·주변을 유지하세요. D1 주변 마감과 조명만 바꾸세요. 새 개구부·증축·발코니·문자·로고는 금지합니다.

출력 형식
동일 시점·화면비·주간 이미지 1장.

검토 기준
고정 요소를 유지하면서 D1이 잘 읽히는지 확인하세요. 실제 성능·시공·법규는 판단하지 마세요.

D. 실제 실행용 짧은 Prompt
IMAGE 01에서 D1 주변 마감 대비와 작은 조명으로 입구를 찾기 쉽게 해줘. 입면도를 근거로 2층 매스·폭·높이·지붕선, 문 1개·창호 5개, SZ1·카메라·주변 도로는 유지해. 새 개구부·증축·발코니·문자·로고는 금지해. 같은 시점·화면비·주간 이미지 1장으로 만들고, 원본 대비 고정 요소와 D1 인지성을 확인해. 시공·법규 적합성은 확정하지 마.

이 예시는 조건 작성 연습입니다. 이후 RFP의 A/B 전략을 미리 지정하지 않습니다.
공통 규칙은 작성할 때의 원칙, 7단 공식은 그 원칙을 배치하는 작성 순서입니다.
''')
rules=['작업 목적을 먼저 알려준다','작업의 맥락을 알려준다','입력자료의 이름·특징·역할을 구분한다','작업 단계와 범위를 나눈다','조건과 제한을 알려준다','결과 형식을 지정한다','검토 기준을 함께 제시한다']
write('DJ-CF-02_interior-exterior-card.md','''# Interior / Exterior - 같은 원칙, 다른 고정 조건

| 비교 | Interior / DJ-CF-01 | Exterior / DJ-CF-02 |
|---|---|---|
| 유지 | D1·W1·W2·C1·외곽 벽체·천장 높이, K1 위치와 S1 위치·기능·배경, 카메라 | 2층 매스·폭·높이·지붕선·D1·W1~W5·SZ1 영역·주변 도로, 카메라 |
| 변경 | Z1 가구·좌석 조합·마감·조명·소품 | 외장 마감·입구 강조·소형 캐노피·무문자 간판 영역·조명 |
| 핵심 판단 | 공간 사용 전략과 이용 흐름이 보이는가? | 입구 인지와 거리의 조화를 어떤 방식으로 해결했는가? |
| 금지 | 서비스영역 재설계·카운터 이전·구조 변경 | 증축·창호 이동·출입구 이동·대형 구조물·보도 점유 |
| 확인 불가 | 치수·성능·구조·법규·실제 운영 조건 | 치수·외장 부착·캐노피 구조·간판·법규·실제 운영 조건 |

공통: 입력 이미지와 조건 근거를 구분하고, 생성 후 원본을 다시 비교합니다.
ID는 프로젝트 안에서만 유효합니다. 두 프로젝트의 D1·W1은 서로 다른 요소입니다.

## 광주 제2차시 공통 규칙 → 7단 공식
'''+ '\n'.join(f'{i}. {rule} → {formula}' for i,(rule,formula) in enumerate(zip(rules,C['formula']),1))+'\n\n광주 원문 명칭을 유지했습니다. 적용 예시만 Exterior에 맞게 작성했습니다. 확인한 소스: gwangju/src/lib/lesson02-ebook.ts, lesson02PromptRules·lesson02Formula; src/components/content/Lesson02Ebook.astro section-06·07.\n')
# Read-only provenance of the exact existing Gwangju formula, no older PDF inference.
f=lesson02_source;t=lesson02_text
start=t.index('export const lesson02Formula');end=t.index('] as const;',start)+len('] as const;')
jwrite('instructor/DJ-CF-02_gwangju-source-check.json',{'source':f.relative_to(repo_root).as_posix(),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'formulaSourceLine':t[:start].count('\n')+1,'verbatimFormula':t[start:end],'rules':rules,'verified':all(x in t for x in rules)})
analysis_rows=[
 ['프로젝트 목표','입구 인지성과 거리 경관 균형','R1·R3·R5','원문 조건'],
 ['주요 사용자와 이용 상황','보행자·1층 상업·2층 업무/서비스·운영자; 공용 D1','02·K4','원문 조건'],
 ['필수 요구조건','출입 인지·거리 조화·서로 다른 전략 2개; 같은 IMAGE 01로 비교','R1~R6','원문 조건'],
 ['유지 조건','10m×7.2m 전면, 2층, D1 1·창호 5·SZ1·지붕선·도로 관계','R2·K1~K3·입면도','원문 조건'],
 ['변경 가능 범위','마감·입구 강조·소형 캐노피·SZ1 표현·조명·소규모 조경','R4','원문 조건'],
 ['제외 범위','증축·새 개구부·구조 변경·道路 변경·실내/시공 상세','제외 범위','원문 조건'],
 ['미확정 조건','U1 이용시간, U2 예산/영업유지, U3 보존/철거, U4 브랜드 인상','U1~U4','미확정'],
 ['추가 질문','각 U 항목을 운영자/건물주에게 묻고 달라질 결정을 기록','U1~U4','질문 제안'],
 ['전문가 확인 항목','외장 부착·캐노피·간판·조명·보도 관련 기준','자료 사용/전문가 확인','별도 확인 필요'],
 ['디자인 대안 비교 기준','고정 보존 → D1 인지 → 층간/거리 조화 → 전략 차이','R1~R6에서 우선순위 도출','해석·설계 판단']
]
analysis_rows[5][1]=analysis_rows[5][1].replace('道路','도로')
instructor_questions=[
 ['U1','주 이용 시간대와 야간 운영 여부','운영자에게 주간·야간 이용 우선순위를 질문한다. 조명 비중 결정에 필요.'],
 ['U2','예산 상한과 공사 중 영업 유지 조건','운영자에게 예산과 중단 가능 기간을 질문한다. 마감 교체 범위 판단에 필요.'],
 ['U3','보존해야 할 외장재와 기존 간판 패널 철거 가능 여부','건물주에게 보존·철거 조건을 질문한다. 현 단계에서는 SZ1의 표면 표현만 검토.'],
 ['U4','원하는 브랜드 인상과 피하고 싶은 이미지','건물주에게 원하는 인상과 피해야 할 표현을 질문한다. 특정 업종·브랜드는 임의 확정하지 않음.']
]
write('instructor/DJ-CF-02_analysis-verified.md','# DJ-CF-02 분석·원문 대조 기록\n\n작성 주체: 이 패키지를 제작한 Codex. 별도 외부 모델 호출·강사 승인을 받았다는 의미가 아닙니다. 각 행을 원본 데이터의 ID와 대조했습니다. 강사 최종 검수 대기.\n\n| 영역 | 핵심 내용 | 근거 | 상태 |\n|---|---|---|---|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in analysis_rows)+'\n\n## 원문 대조 결과\n- 유지 요소 1개 문·5개 창·2층을 입면도 JSON과 대조.\n- U1~U4는 미확정 유지. 예산·일정·업종·브랜드 수치 추가 없음.\n- A/B는 RFP에 없음. Brief에서 R1·R3·R5를 해석해 도출.\n- SZ1 패널 철거 승인은 없음. 두 예시는 기존 영역의 표면 표현 제안.\n- 캐노피는 형상 제안이며 구조·허가 승인 아님.\n- 조건 간 충돌을 발견하면 생성보다 원문 확인을 우선함.\n\n## 질문 4개\n'+'\n'.join(f'- {u}: {n} / {q}' for u,n,q in instructor_questions))
print('Authored RFP, 10-area analysis, 9-section Brief, seven-part prompts and comparison card')
