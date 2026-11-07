"""현재 JSON의 CF-02 학생 문서·전략 요청문을 동기화하고 실제 생성 기록은 보존한다."""
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
common_keep=C['strategyCommon']
prohibited='창호 추가·이동·확대, 매스·층수·높이·지붕선 변경, 증축·발코니·구조체 삭제, 문자·로고·보도 점유는 금지합니다. 새 창호나 새로운 개구부를 만들지 마세요.'
metric_note='기준 도면·조건표의 수치는 교육용 설정입니다. 현황과 A/B 이미지는 시각 참고이며 정밀 투영·실측 일치를 보증하지 않습니다. 이미지에서 치수를 재지 말고 수치 검토는 도면에서 별도로 합니다.'
for letter,strategy in C['strategies'].items():
 learning='\n\n'.join([
  '목적\n현황 IMAGE 01을 '+strategy['name']+' 전략의 외관 리뉴얼 이미지로 바꿔 주세요. 두 층 전체를 일관되게 정돈하면서 처음 방문한 사람이 D1을 바로 찾게 합니다.',
  '맥락\n1층 상업·2층 업무/서비스 시설이 공용 D1을 사용하는 가상 근린생활시설입니다. 선택 전략은 디자이너의 제안이며 발주자가 확정한 재료나 공사 승인이 아닙니다.',
  '입력자료\nDJ-CF-02_existing-view-01.png는 편집 원본, DJ-CF-02_existing-elevation.png 또는 같은 이름의 PDF는 고정 조건, DJ-CF-02_design-brief-sample.md는 선택·보완할 작업 기준서 예시입니다. IMAGE 02는 측면 관계 참고용이며 카메라를 바꾸는 기준이 아닙니다.',
  '작업 단계\n1. 편집 원본과 기준 입면도에서 매스·개구부·SZ1·주변 관계를 확인합니다.\n2. 1·2층 전체 외벽을 통일한 뒤 다음 행동을 지정한 위치에 적용합니다.\n'+'\n'.join(f'{i+3}. {action}' for i,action in enumerate(strategy['actions'])),
  '조건·제한\n'+common_keep+'\n'+prohibited+'\n'+C['strategyBoundary'],
  '출력 형식\n편집 원본과 같은 카메라·주간·화면 구성의 사실적인 건축 외관 이미지 1장만 출력합니다. 이미지 안에 설명문·재료 라벨·비교표를 넣지 않습니다.',
  '검토 기준\n생성 후 사람이 원본과 결과를 비교합니다. 두 층 전체 마감의 연결, 선택 전략의 표현, D1 인지성과 매스·W1~W5·SZ1·주변 관계 보존을 확인합니다. '+strategy['risk']+'\n'+metric_note,
 ])
 execution='\n\n'.join([
  '[목적]\nIMAGE 01을 편집 원본, 기준 입면도를 고정 조건, 검증한 작업 기준서를 전략 기준으로 사용해 '+strategy['name']+' 리뉴얼 이미지 1장을 만들어 주세요.',
  '[유지]\n'+common_keep,
  '[변경]\n'+strategy['proposal'],
  '[금지]\n'+prohibited+' '+C['strategyBoundary'],
  '[결과]\n원본과 같은 카메라·주간·화면 구성의 사실적인 외관 이미지 1장만 출력하고 문자·로고·설명표는 넣지 마세요. 생성 뒤 고정 조건과 두 층의 통일감, D1 인지성, 선택 전략의 표현은 사람이 원본과 대조합니다.\n'+metric_note,
 ])
 write(f'DJ-CF-02_example-{letter}-prompt.txt',learning)
 write(f'DJ-CF-02_example-{letter}-execution-prompt.txt',execution)
 # 사용자 지정 이름도 같은 완성 실행문을 가리키며 별도 전략으로 만들지 않는다.
 write(f'DJ-CF-02_image-prompt-{letter}.txt',execution)
template_inputs='현황 이미지 01은 편집 원본, 기준 입면도는 매스·개구부·SZ1의 고정 조건, 원문과 대조한 작업 기준서는 전략 선택의 근거입니다. 현황 이미지 02는 측면 관계만 참고합니다.'
write('DJ-CF-02_image-prompt-from-brief.txt','\n\n'.join([
 '목적\n현황 이미지 01의 1·2층 전체 외관을 작업 기준서의 <전략명>에 맞춰 일관되게 리뉴얼해 주세요. D1의 출입 인지성도 함께 확보합니다.',
 '선택 전략\n전략명: <전략명>\n전체 마감과 층간 연결: <재료·톤·연결 방법>\n핵심 행동과 적용 위치: <행동 1 + 위치> / <행동 2 + 위치> / <행동 3 + 위치 또는 없음>',
 '맥락\n처음 방문한 보행자와 1·2층 이용자가 공용 D1을 사용하는 가상 근린생활시설입니다. 재료·조명은 디자인 제안이며 미확정 발주 조건을 새 사실로 만들지 않습니다.',
 '입력자료\n'+template_inputs,
 '작업 단계\n기준 도면·원본의 고정 요소를 확인하고, 두 층 전체의 마감을 정돈한 다음 선택한 핵심 행동을 지정 위치에 적용합니다.',
 '조건·제한\n'+common_keep+'\n'+prohibited+'\n'+C['strategyBoundary'],
 '출력 형식\n원본과 같은 카메라·주간·화면 구성의 사실적인 건축 외관 이미지 1장만 출력합니다. 설명문·라벨·비교표는 넣지 않습니다.',
 '검토 기준\n생성 후 사람이 원본과 대조해 고정 요소와 두 층의 통일감·D1 인지성·선택 전략을 확인합니다.\n'+metric_note,
]))
write('DJ-CF-02_image-prompt-execution.txt','\n\n'.join([
 '[목적]\n'+template_inputs+' 선택한 <전략명>을 <전체 마감과 층간 연결> 및 <행동 1 + 위치> / <행동 2 + 위치> / <행동 3 + 위치 또는 없음>으로 표현해 주세요.',
 '[유지]\n'+common_keep,
 '[변경]\n1·2층 전체 외벽의 재료·톤을 일관되게 정돈하고, 선택 전략의 지정 위치에 포털·소형 캐노피·SZ1 무문자 표현·루버·조명을 적용해 주세요. A/B를 한 이미지에 섞지 않습니다.',
 '[금지]\n'+prohibited+' '+C['strategyBoundary'],
 '[결과]\n같은 카메라·주간·화면 구성의 사실적인 이미지 1장만 출력합니다. 생성 후 고정 조건·두 층의 연결·D1 인지성과 전략 차이는 사람이 비교합니다.\n'+metric_note,
]))
comparison='# 실습 B · 외관 리뉴얼 A/B 비교 안내\n\n'+common_keep+'\n\n'
for letter,strategy in C['strategies'].items():
 comparison+=f"## 전략 {letter} · {strategy['name']}\n\n"+strategy['proposal']+'\n\n'+'\n'.join('- '+action for action in strategy['actions'])+'\n\n근거: '+strategy['basis']+'\n\n확인할 점: '+strategy['risk']+'\n\n'
comparison+='## 같은 순서로 비교합니다\n\n1. 매스·층수·D1·W1~W5·SZ1·카메라·주변 관계가 보존되었는지 원본과 대조합니다.\n2. 1·2층 전체 마감이 연결되는지 봅니다. 2층에 기존 얼룩을 방치하거나 1층만 이질적인 재료로 분리하지 않습니다.\n3. A의 세로 포털 집중과 B의 수평 루버·조명 연속성이 서로 다르게 읽히는지 봅니다. 두 안 모두 D1을 찾기 쉬워야 합니다.\n4. 의도하지 않은 변경은 유지·보완·보류로 구분합니다. AI 이미지가 조건을 자동으로 충족했다고 단정하지 않습니다.\n\n'+metric_note+'\n\n'+C['strategyBoundary']+'\n\n## 요청문 파일 안내\n\n- example-A/B-prompt.txt: 7단 구조로 읽는 학습용 요청문\n- example-A/B-execution-prompt.txt: 바로 사용할 수 있는 5항목 완성 실행예시\n- image-prompt-A/B.txt: 위 완성 실행예시와 내용이 같은 사용자 지정 파일명\n- instructor의 실제 생성 원문·로그: 이미지 제작 당시 입력·결과를 확인하는 기록. 학습용 문안과 별도로 구분합니다.\n'
write('DJ-CF-02_comparison-note.md',comparison)
rows=[['실습 목표','입구 인지성과 거리 경관의 균형','01·03·R1·R3·R5','원문 조건'],['주요 사용자와 이용 상황','보행자·1층 상업·2층 업무/서비스·운영자; 공용 D1','02·K4','원문 조건'],['필수 요구조건','출입 인지·거리 조화·서로 다른 전략 2개; 같은 IMAGE 01로 비교','R1~R6','원문 조건'],['유지 조건',C['brief'][4][1],'R2·K1~K3·입면도','원문 조건'],['변경 가능 범위',C['change'],'R4','원문 조건'],['제외 범위',C['exclude'],'04 제외 범위','원문 조건'],['미확정 조건','U1 이용시간, U2 예산/영업유지, U3 보존/철거, U4 원하는 인상','05 U1~U4','미확정'],['추가 질문','각 U 항목을 운영자/건물주에게 묻고 답에 따라 달라질 결정을 기록','05 U1~U4','질문 제안'],['전문가 확인 항목',C['expert'],'05 미확정·자료 사용 범위','별도 확인 필요'],['디자인 대안 비교 기준','고정 보존 → D1 인지 → 층간/거리 조화 → 전략 차이','R1~R6에서 비교 기준 도출','해석·설계 판단']]
write('instructor/DJ-CF-02_analysis-verified.md','# 실습 B · 분석과 원문 대조 기록\n\n교육용 원문 데이터와의 대조 기록입니다. 실측이나 시공·법규 검증을 의미하지 않습니다.\n\n'+C['analysisMapping']+'\n\n| 영역 | 핵심 내용 | 근거 | 상태 |\n|---|---|---|---|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in rows)+'\n\n## 대조 결과\n- 문 1개·창호 5개·2층. D1의 1.80m는 외곽 포털 포함 개구부이며 문짝 유효폭 약 1.10m 설정이다.\n- 명목 면적: 13.60×8.20=111.52㎡를 111.5㎡로, 두 층 223.04㎡를 223.0㎡로 표시한다. 법정 면적 산정값이 아니다.\n- 기준 도면·조건표는 교육용 설정이며 현황·리뉴얼 예시 이미지의 정밀 투영 일치를 보증하지 않는다.\n- instructor의 실제 생성 Prompt와 생성 로그는 각 제작 시점의 입력·결과를 확인하는 기록이다. 현재 치수 근거인 기준 도면·조건표 및 학습용 요청문과 구분한다.\n- U1~U4를 미확정으로 유지한다. A/B 전략은 의뢰서의 지정 정답이 아닌 디자이너 판단이다.')
print('현재 RFP·작업 기준서 10개 항목·A/B 학습/실행문·비교 안내를 동기화했습니다. 사진과 실제 생성 기록은 변경하지 않았습니다.')
