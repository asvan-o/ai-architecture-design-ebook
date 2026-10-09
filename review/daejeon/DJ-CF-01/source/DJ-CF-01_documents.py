"""Create review-only PDFs and a standalone local HTML page from shared sources."""
from pathlib import Path
import json, html, hashlib, sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.utils import ImageReader
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent.parent
S=json.loads((ROOT/'source/DJ-CF-01_space.json').read_text(encoding='utf-8'))
R=json.loads((ROOT/'source/DJ-CF-01_rfp.json').read_text(encoding='utf-8'))
Q=json.loads((ROOT/'source/DJ-CF-01_visual-review.json').read_text(encoding='utf-8'))
E=json.loads((ROOT/'source/DJ-CF-01_examples.json').read_text(encoding='utf-8'))
P=json.loads((ROOT/'source/DJ-CF-01_practice.json').read_text(encoding='utf-8'))
assert Q['acceptedForDraft'], 'Do not issue PDFs before selected images pass draft review'
pdfmetrics.registerFont(TTFont('Malgun','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('MalgunBold','C:/Windows/Fonts/malgunbd.ttf'))
pdfmetrics.registerFontFamily('Malgun',normal='Malgun',bold='MalgunBold',italic='Malgun',boldItalic='MalgunBold')
INK=colors.HexColor('#1a303a');MUTED=colors.HexColor('#53636b');BLUE=colors.HexColor('#255c78')
STYLE=ParagraphStyle('body',fontName='Malgun',fontSize=9.8,leading=15.4,textColor=INK,wordWrap='CJK',spaceAfter=0)
SMALL=ParagraphStyle('small',parent=STYLE,fontSize=8.5,leading=13)

class Doc:
    def __init__(self,name,title):
        self.c=canvas.Canvas(str(ROOT/name),pagesize=A4,pageCompression=1);self.c.setTitle(title);self.c.setAuthor('AI Lecture | DJ-CF-01');self.page=0;self.boxes=[]
    def start(self,title,subtitle='',size=A4,finishPrevious=True):
        if self.page and finishPrevious:self.end()
        self.page+=1;self.w,self.h=size;self.c.setPageSize(size);self.x=42;self.width=self.w-84
        self.c.setFillColor(BLUE);self.c.setFont('MalgunBold',9);self.c.drawString(42,self.h-35,'AI LECTURE  /  DAEJEON  /  DJ-CF-01')
        self.c.setFont('MalgunBold',8.5);self.c.drawRightString(self.w-42,self.h-35,R['documentLabel'])
        self.c.setFillColor(INK);self.c.setFont('MalgunBold',18);self.c.drawString(42,self.h-72,title)
        self.c.setFont('Malgun',10.2);self.c.setFillColor(MUTED);self.c.drawString(42,self.h-94,subtitle)
        self.c.setStrokeColor(colors.HexColor('#c4cdd2'));self.c.line(42,self.h-109,self.w-42,self.h-109);self.y=self.h-131
    def p(self,text,style=STYLE,indent=0):
        p=Paragraph(html.escape(text),style);w,h=p.wrap(self.width-indent,1000)
        if self.y-h<52:raise ValueError(f'Page {self.page} overflow: {text[:40]} ({self.y-h})')
        p.drawOn(self.c,self.x+indent,self.y-h);self.y-=h+8
    def section(self,title):
        self.y-=6;self.c.setFillColor(BLUE);self.c.setFont('MalgunBold',11);self.c.drawString(self.x,self.y,title);self.y-=22
    def table(self,rows,widths,rowHeights=None,padding=7):
        parsed=[[Paragraph(html.escape(str(cell)),SMALL) for cell in row] for row in rows]
        table=Table(parsed,colWidths=widths,rowHeights=rowHeights,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eaf0f3')),('GRID',(0,0),(-1,-1),.45,colors.HexColor('#a7b5bd')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),padding),('RIGHTPADDING',(0,0),(-1,-1),padding),('TOPPADDING',(0,0),(-1,-1),padding),('BOTTOMPADDING',(0,0),(-1,-1),padding)]))
        w,h=table.wrap(self.width,1000)
        if self.y-h<52:raise ValueError(f'Page {self.page} table overflow {self.y-h}')
        table.drawOn(self.c,self.x,self.y-h);self.y-=h+12
    def blank(self,label,height=55):
        self.c.setStrokeColor(colors.HexColor('#a7b5bd'));self.c.rect(self.x,self.y-height,self.width,height)
        self.c.setFont('Malgun',9);self.c.setFillColor(MUTED);self.c.drawString(self.x+9,self.y-17,label);self.y-=height+9
        if self.y<52:raise ValueError('Blank field overflow')
    def end(self):
        self.c.setFont('Malgun',7.6);self.c.setFillColor(MUTED);self.c.drawString(42,30,R['notice'])
        self.c.drawRightString(self.w-42,30,str(self.page));self.c.showPage()
    def save(self):self.end();self.c.save()

def rfp():
    d=Doc('DJ-CF-01_RFP-draft.pdf',S['title']+' | 교육용 RFP')
    d.start('소형 카페 고객공간 리뉴얼',S['subtitle'])
    d.table(R['projectInfo'],[70,d.width/2-70,70,d.width/2-70])
    for n,title,key in [('01','프로젝트 개요','opening'),('02','주요 사용자','users'),('03','설계 문제','problem')]:d.section(n+'  '+title);d.p(R[key])
    d.section('04  요구조건')
    for item in R['requirements']:
        d.p(item['id']+' '+item['title']+'  |  '+item['body'],SMALL)
    d.start('조건을 분석하고 대안을 설명해 주세요','제안 범위 / 미확정 조건 / 제출 결과물')
    d.section('05  제공 조건과 미확정 조건')
    d.p('제공 조건: '+ ' / '.join(R['known'][:2]),SMALL)
    d.table([['의도적으로 남긴 미확정 조건','수강생 작성 항목'],*[ [item,'추가 질문 또는 명시적인 가정으로 기록'] for item in R['unknown']]],[d.width*.49,d.width*.51])
    d.p(R['unknownNote'],SMALL)
    d.section('06  결과물')
    for i,item in enumerate(R['deliverables'],1):d.p(f'{i}. {item}',SMALL)
    d.section('07  비교와 선택')
    d.p(R['comparison'],SMALL)
    d.section('08  자료를 사용하는 방법')
    d.p(R['dataRoles'],SMALL);d.p(R['lesson01Scope'],SMALL);d.p(R['exampleUse'],SMALL)
    d.p('80㎡는 8m×10m의 명목 기준 면적입니다. S1의 경계는 기능 구분선이며 벽체가 아닙니다. '+R['limits'],SMALL)
    # Appendix plan uses the exact downloadable SVG-derived PNG at its intended physical size.
    d.end();d.page+=1;d.w,d.h=landscape(A3);d.c.setPageSize((d.w,d.h));d.c.drawImage(str(ROOT/'DJ-CF-01_existing-plan.png'),0,0,width=d.w,height=d.h)
    d.c.setFont('Malgun',8);d.c.setFillColor(MUTED);d.c.drawRightString(d.w-42,18,'3');d.c.showPage()
    d.start('현황 이미지 01','부록 / 첫 이미지 생성 실습의 주 Input',landscape(A4),finishPrevious=False)
    imgw=d.width;imgh=imgw*2/3
    # A4 landscape: keep the image large but leave room for a two-line caption.
    imgh=min(imgh,d.y-105);imgw=imgh*1.5;x=(d.w-imgw)/2
    d.c.drawImage(str(ROOT/'DJ-CF-01_existing-view-01.png'),x,d.y-imgh,width=imgw,height=imgh);d.y-=imgh+13
    d.p('CAM 01 (4000,7000,1500) → 남측 / 28mm 기준. D1 왼쪽, W1 오른쪽, C1 오른쪽 전경. C1이 W1 일부를 가립니다.',SMALL)
    d.p('AI 생성 현황 표현. 화면 밖 요소는 부록 평면도와 다른 시점에서 확인합니다. 치수의 근거는 평면도입니다.',SMALL)
    d.start('현황 이미지 02 · 03','부록 / 고정 조건과 평면-공간 관계를 확인하는 보조 Input',landscape(A4))
    gap=20;iw=(d.width-gap)/2;ih=iw*2/3;top=d.y
    for i,n in enumerate(['02','03']):
        x=d.x+i*(iw+gap);d.c.drawImage(str(ROOT/f'DJ-CF-01_existing-view-{n}.png'),x,top-ih,width=iw,height=ih)
        p=Paragraph(html.escape(('CAM 02 | C1 · W2 · K1 · S1. W2는 기둥에 일부 가려집니다. S1은 카운터 뒤 기능 영역입니다.' if n=='02' else 'CAM 03 | C1 · W2 · Z1과 W1 일부. 서측 창과 전면 창의 관계를 확인합니다. D1·K1은 화면 밖입니다.')),SMALL);_,ph=p.wrap(iw,100);p.drawOn(d.c,x,top-ih-12-ph)
    d.y=top-ih-75
    d.section('동일 공간 자료를 읽는 기준')
    d.p('세 이미지 모두 같은 좌표 조건에서 만든 공간 기준을 사용했습니다. D1 1개, W1·W2, C1 1개, K1을 유지하며 S1에는 새 경계 벽체가 없습니다.',SMALL)
    d.p('AI 이미지의 미세한 표면 질감·반사·창밖 식생과 프레임 세부는 정밀하게 일치하지 않습니다. 이를 현황 조건이나 재료 성능의 근거로 해석하지 않습니다. 주요 요소의 위치 관계를 확인한 교육용 자료이며, 실측 수준의 사진 정합을 보증하지 않습니다.',SMALL)
    d.save()

def plan_pdf():
    size=landscape(A3);c=canvas.Canvas(str(ROOT/'DJ-CF-01_existing-plan.pdf'),pagesize=size);c.setTitle('DJ-CF-01 교육용 기준 평면도');c.drawImage(str(ROOT/'DJ-CF-01_existing-plan.png'),0,0,width=size[0],height=size[1]);c.showPage();c.save()

def worksheet():
    d=Doc('DJ-CF-01_participant-worksheet-draft.pdf','DJ-CF-01 수강생 실습 기록지')
    d.start('수강생 실습 기록지 01','조건을 읽고, 근거와 확인 상태를 분리해서 기록합니다.')
    d.p('이름/팀: ____________________    날짜: ______________    사용 자료 버전: __________',SMALL)
    d.p('RFP 읽기 → AI 분석 → 원문 비교 → 핵심 조건 정리. 영역별 핵심 내용·근거·확인 상태를 짧게 적습니다. 상태: 자료에서 확인 / 추가 확인 필요 / 전문가 확인 필요. 가정·제안은 내용에 표시합니다.',SMALL)
    d.section('A  핵심 분석 10개 영역')
    rows=[['영역','핵심 내용','근거 / 위치','확인 상태']]+[[f'{i:02} '+area,'','',''] for i,area in enumerate(P['analysisAreas'],1)]
    d.table(rows,[145,d.width-145-100-81,100,81],[30]+[35]*10,padding=5)
    d.section('B  유지할 것 / 바꿀 수 있는 것')
    d.p('주된 개입 영역은 Z1입니다. RFP R5의 제외 범위는 제안하지 않습니다.',SMALL)
    d.table([['고정 요소와 근거','변경 가능 요소와 범위'],['D1·W1·W2·C1·외곽 벽체 유지. K1 위치와 S1 위치·서비스 기능 유지. S1은 고정 배경.','Z1의 가구·테이블·의자 / 벽면·바닥 마감 분위기 / 조명·등기구 / 브랜딩 없는 소품.']],[d.width/2]*2,[29,59])
    d.start('수강생 실습 기록지 02','Brief → Prompt → 결과 검토 → 선택 이유')
    d.section('D  Design Brief')
    d.blank('목표·사용자 / 핵심 설계 문제 / 설계 우선순위 (1→2→3)',45)
    d.blank('유지 조건 / Z1 변경·R5 제외 범위 / 미확정 조건·가정',50)
    d.blank('대안 A 전략 / 대안 B 전략 (좌석 구성·이용 흐름의 차이)',40)
    d.section('E  학습용 7단 Prompt 메모')
    d.table([['항목','작성 메모'],*[[x,''] for x in R['promptTerms']]],[92,d.width-92],[26]+[24]*7,padding=5)
    d.section('F  결과 검토 기준 · A/B 비교')
    d.table([['검토 기준','A안','B안'],['고정 요소·범위 준수','',''],['Z1 좌석 구성·이용 흐름','',''],['체류 방식·분위기·사용성','','']],[d.width*.44,d.width*.28,d.width*.28],[26,27,27,27])
    d.blank('선택 이유 / 선택이 달라지는 조건 / 추가 확인 필요사항',56)
    d.save()


def download_catalog():
    items=[
        ('DJ-CF-01_RFP-draft.pdf','RFP PDF','수강생 입력 자료','과업 범위·조건·부록, 5쪽'),
        ('DJ-CF-01_existing-plan.svg','기준 평면도 SVG','수강생 입력 자료','도식 원본'),
        ('DJ-CF-01_existing-plan.png','기준 평면도 PNG','수강생 입력 자료','이미지 첨부용'),
        ('DJ-CF-01_existing-plan.pdf','기준 평면도 PDF','수강생 입력 자료','A3, 100% 출력 시 1:50'),
        ('DJ-CF-01_existing-view-01.png','현황 이미지 01','수강생 입력 자료','남측, 첫 이미지 실습용'),
        ('DJ-CF-01_existing-view-02.png','현황 이미지 02','수강생 입력 자료','A/B 예시의 공통 편집 입력, CAM 02'),
        ('DJ-CF-01_existing-view-03.png','현황 이미지 03','수강생 입력 자료','공간 관계 보조 확인'),
        ('DJ-CF-01_participant-worksheet-draft.pdf','수강생 실습 기록지 PDF','수강생 작성 자료','인쇄 기록용, 2쪽'),
        (P['coreAnalysis'],'핵심 분석 10개 영역','수강생 작성 자료','양식과 현재 R6 기준 참고 예시'),
        (P['analysisPrompt'],'RFP 분석 Prompt','수강생 실습','근거·상태를 포함한 10영역 결과'),
        (P['briefPrompt'],'Design Brief 작성 Prompt','수강생 실습','검증된 조건을 실행 기준으로 변환'),
        (P['learningPrompt'],'학습용 7단 이미지 Prompt','강의 설명','광주 공식 명칭 그대로 사용'),
        (P['executionPrompt'],'실제 실행용 짧은 이미지 Prompt','수강생 실습','Brief에서 선택한 대안을 넣어 사용'),
        (P['briefSample'],'Design Brief 참고 예시','강사·수강생 참고','전략은 제안이며 정답이 아님'),
    ]
    for item in E['examples']:
        k=item['id']
        items.extend([(item['image'],'결과 예시 '+k,'강사용 시범','입력 현황 또는 정답으로 사용하지 않음'),
            (item['structuredPrompt'],'기존 예시 '+k+' 구조화 Prompt','강사용 참고','현재 기본 실행 Prompt와 구분'),
            (item['actualPrompt'],'기존 예시 '+k+' 실제 생성 Prompt','강사용 제작 증빙','도구에 전달한 원문, 기본 실습용 아님')])
    items.extend([
        ('DJ-CF-01_examples-guide.txt','예시 사용·비교 안내','강사·수강생 참고','관찰 결과와 정밀 제어 방법'),
        ('DJ-CF-01_README.txt','패키지 사용 방법','패키지 안내','자료 역할·생성 근거·재생성 방법'),
        ('DJ-CF-01_downloads.txt','개별 다운로드 목록','패키지 안내','파일명·역할·용도'),
        ('source/DJ-CF-01_space.json','공간·카메라 조건표','근거 자료','동결된 기하·카메라 기준'),
        ('source/DJ-CF-01_example-generation-log.json','A/B 생성 기록','생성 증빙','호출 인수·입력·원문·출력 해시'),
        ('source/DJ-CF-01_package-manifest.json','전체 파일 해시 명세','보존·인계','명세 자신을 제외한 전체 파일')])
    items.extend((name,'R6 수정 전 상세 검토 이력','강사용 참고','29행 분석과 당시 검토 기록; 현재 R6 판단은 핵심 분석 참조') for name in P['historicalAnalysis'])
    items.append((P['revisionReport'],'수강생용 수정 보고서','검토 기록','수정 범위·검증·보존 결과'))
    return items

def practice_sections():
    esc=html.escape
    def catalog_rows(items):
        return ''.join('<tr><td><a download href="'+esc(file)+'">'+esc(title)+'</a><br><small>'+esc(file)+'</small></td><td>'+esc(role)+'</td><td>'+esc(note)+'</td></tr>' for file,title,role,note in items)
    catalog=download_catalog()
    basic=[item for item in catalog if item[2] in {'수강생 입력 자료','수강생 작성 자료','수강생 실습','강의 설명'}]
    references=[item for item in catalog if item not in basic]
    table=lambda rows:'<div class="table-wrap"><table><thead><tr><th>자료</th><th>역할</th><th>사용 방법</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    downloads='<section id="downloads"><div class="section-label">08</div><h2>개별 다운로드</h2><p>기본 실습은 아래 입력 자료·10영역 분석·짧은 실행 Prompt로 진행합니다. 모든 링크는 이 review 패키지 안의 파일을 가리킵니다.</p>'+table(catalog_rows(basic))+'<details><summary>강사용 참고·제작 증빙·이전 상세 검토</summary><p>긴 generation Prompt와 29행 분석은 보존된 참고자료이며 수강생 기본 입력·작성 과제가 아닙니다.</p>'+table(catalog_rows(references))+'</details></section>'
    cards=''
    for item in E['examples']:
        prompt=(ROOT/item['structuredPrompt']).read_text(encoding='utf-8')
        observations=''.join('<li>'+esc(line)+'</li>' for line in item['observations'])
        cards+='<article><h3>예시 '+esc(item['id'])+' · '+esc(item['title'])+'</h3><a href="'+esc(item['image'])+'"><img src="'+esc(item['image'])+'" alt="'+esc(item.get('alt',item['title']))+'" width="1536" height="1024" loading="lazy"></a><p>'+esc(item['intent'])+'</p><ul>'+observations+'</ul><div class="downloads"><a download href="'+esc(item['image'])+'">PNG 다운로드</a></div><details><summary>강사용: 기존 예시 Prompt와 실제 생성 증빙</summary><p>현재 수강생의 기본 입력은 별도의 짧은 실행 Prompt입니다.</p><a download href="'+esc(item['structuredPrompt'])+'">기존 구조화 Prompt</a> · <a download href="'+esc(item['actualPrompt'])+'">실제 생성 Prompt 원문</a><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:inherit">'+esc(prompt)+'</pre></details></article>'
    comparison=''.join('<tr>'+''.join('<td>'+esc(v)+'</td>' for v in row)+'</tr>' for row in E.get('comparison',[]))
    examples='<section id="examples"><div class="section-label">09</div><h2>같은 공간의 결과 예시 A / B</h2><p>'+esc(R['exampleUse'])+'</p><p>공통 입력: 현황 이미지 02 + 기준 평면도 PNG. 시점: CAM 02. 실제 제작: Codex 내장 image_gen. Nano Banana에서 직접 생성한 결과가 아닙니다.</p><div class="grid">'+cards+'</div><h3>A/B 비교 포인트</h3><div class="table-wrap"><table><thead><tr><th>기준</th><th>A · 빠른 이용</th><th>B · 편안한 체류</th></tr></thead><tbody>'+comparison+'</tbody></table></div><p class="note">'+esc(E.get('reviewNote','생성 결과를 조건별로 대조한 뒤 기록합니다.'))+'</p><p><a download href="source/DJ-CF-01_example-generation-log.json">실제 호출과 입력·출력 해시 기록</a> · <a download href="DJ-CF-01_examples-guide.txt">결과 설명과 사용 방법</a></p></section>'
    examples=examples.replace('<p>'+esc(R['exampleUse'])+'</p>','<p>'+esc(R['exampleUse'])+'</p><p class="note">아래 A/B는 기존에 제작한 두 전략의 예시입니다. 현재 R6는 전략을 미리 정하지 않으며 수강생이 분석·검증 후 Brief에서 판단합니다. 이번 수정에서 이미지를 재생성하지 않았습니다.</p>')
    learning=(ROOT/P['learningPrompt']).read_text(encoding='utf-8')
    execution=(ROOT/P['executionPrompt']).read_text(encoding='utf-8')
    workflow='<section id="workflow"><h2>분석 → Brief → 두 종류의 이미지 Prompt</h2><p>광주 Lesson 02: 7가지 공통 규칙 → 7단 공식 → 구조화 Prompt. 규칙을 설명한 뒤 공식으로 정리하고 실제 작성합니다.</p><p class="note">RFP 읽기 → RFP 분석 Prompt → AI 분석 → 사람의 원문 검증 → 추가 질문·검증본 → Design Brief → 학습용 7단 Prompt → 짧은 실행 Prompt → 이미지 생성 → 결과 검토</p><p>수강생은 핵심 10영역에 근거·상태를 남깁니다. 숫자는 해당 영역에 적고, 29행 상세 매트릭스를 모두 작성할 필요는 없습니다. 전략은 Brief에서 도출합니다.</p><div class="downloads"><a download href="'+esc(P['coreAnalysis'])+'">10영역 양식·참고 예시</a><a download href="'+esc(P['analysisPrompt'])+'">RFP 분석 Prompt</a><a download href="'+esc(P['briefPrompt'])+'">Brief 작성 Prompt</a></div><h3>학습용: 7단 구성 이해</h3><p>'+esc(' · '.join(R['promptTerms']))+'</p><details><summary>학습용 7단 Prompt 보기</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(learning)+'</pre></details><h3>실행용: 선택한 대안 입력</h3><p>[선택한 대안 이름]을 수강생의 Brief에 적은 이름으로 바꿉니다. 현황02·평면도·검증 후 작성한 Brief를 첨부하고 두 대안은 같은 입력으로 각각 실행합니다.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(execution)+'</pre><div class="downloads"><a download href="'+esc(P['learningPrompt'])+'">학습용 7단 TXT</a><a download href="'+esc(P['executionPrompt'])+'">짧은 실행 TXT</a></div><p>입력 조건이 같아도 결과가 달라질 수 있습니다. 고정 요소와 범위를 먼저 대조하고 치수·성능·적합성은 이미지로 확정하지 않습니다.</p></section>'
    return workflow+downloads+examples

def text_guides():
    listing='DJ-CF-01 개별 다운로드 안내 | candidate-02 / participant-revision-01\nreview/draft 자산 · 정식 과정 배포 전\n기본 실습: 10영역 분석 → 검증 → Brief → 짧은 실행 Prompt. 긴 실제 생성 Prompt는 강사용 증빙입니다.\n\n'
    listing+='\n'.join(f'{file} | {title} | {role} | {note}' for file,title,role,note in download_catalog())
    listing+='\n\n열기: DJ-CF-01_review.html. PDF는 인쇄용, PNG는 이미지 도구 첨부용입니다. 전체 source 폴더와 미채택 생성 시도는 수강생 배포용 묶음으로 취급하지 않습니다.\n'
    (ROOT/'DJ-CF-01_downloads.txt').write_text(listing,encoding='utf-8')
    guide='DJ-CF-01 결과 예시 A/B 사용 방법\n\n공통 입력: 현황 이미지 02 PNG + 기준 평면도 PNG. 두 안 모두 CAM 02.\nS1은 없애는 영역이 아니라 서비스 기능을 유지하는 배경입니다. 개입 대상은 Z1입니다.\n\n'
    for item in E['examples']:
        guide+='[예시 '+item['id']+' / '+item['title']+']\n'+item['intent']+'\n'+'\n'.join('- '+v for v in item['observations'])+'\n'
        guide+='구조화 Prompt: '+item['structuredPrompt']+'\n실제 도구 전달 원문: '+item['actualPrompt']+'\n결과 PNG: '+item['image']+'\n\n'
    guide+='[실제 제작과 증빙]\n실제 도구는 Codex 내장 image_gen이며 세부 모델 식별자는 도구가 제공하지 않습니다. Nano Banana 실행 결과라고 표시하지 않습니다. generation-prompt.txt는 실제 전달 원문이고, prompt.txt는 이를 설명하는 한국어 실습용 구조입니다. 생성 기록 JSON에 호출 시각, 실제 인수, 입력 파일 해시, 생성 원본 경로, 결과 해시와 채택 여부를 남겼습니다. 파일 연결 증빙과 디자인 조건 충족 판정은 구분합니다.\n\n'
    guide+='[다른 이미지 도구에서 실습하기]\n1. 현재 R6는 A/B의 전략을 지정하지 않습니다. 수강생이 분석·검증 후 Brief에서 두 전략을 정합니다. 기존 A/B는 가능한 전략의 예시입니다.\n2. 학습용 7단 Prompt로 구성 요소를 이해한 뒤, DJ-CF-01_image-prompt-execution.txt의 [선택한 대안 이름]을 Brief의 이름으로 바꿉니다.\n3. 같은 현황 02·평면도 PNG·Brief를 첨부하고 두 안을 각각 실행합니다. 긴 generation Prompt는 기본 실습 입력이 아닙니다.\n4. 결과와 원본을 대조해 카메라·C1·W2·K1·S1과 변경 범위를 확인합니다. 부분 수정도 원본에서 시작하고 고정 조건을 유지합니다.\n5. 좌석 수·통로 폭·치수·재료 성능·법적 적합성은 이미지로 확정하지 않습니다.\n\n'
    guide+='[사용 순서]\n수강생의 조건 분석·첫 Prompt·자체 판단을 먼저 기록한 뒤 강사가 A/B를 비교 시연합니다. 전체 Brief와 A/B 완성은 제1차시 필수 완료 범위가 아닙니다. 예시 이미지를 현황 입력이나 정답으로 다시 제공하지 않습니다.\n\n'+E.get('reviewNote','')+'\n'
    (ROOT/'DJ-CF-01_examples-guide.txt').write_text(guide,encoding='utf-8')


def webpage():
    def e(value):
        return html.escape(value.replace('교육용 draft','교육용 자료').replace('검토용 draft','교육용 자료'))
    req=''.join(f'<li><strong>{i["id"]} {e(i["title"])}</strong><p>{e(i["body"])}</p></li>' for i in R['requirements'])
    info=''.join('<tr>'+''.join(f'<td>{e(cell)}</td>' for cell in row)+'</tr>' for row in R['projectInfo'])
    views=''
    for i,cam in enumerate(S['cameras'],3):
        n=cam['id'];visible=' / '.join(f'{k}: {v}' for k,v in Q['views'][n]['elements'].items())
        views+=f'<section id="view-{n}"><div class="section-label">0{i}</div><h2>현황 이미지 {n}</h2><p>{e(cam["purpose"])}</p><a href="DJ-CF-01_existing-view-{n}.png"><img src="DJ-CF-01_existing-view-{n}.png" alt="{e(Q["views"][n]["alt"])}" width="1536" height="1024" loading="lazy"></a><p class="caption">위치 {cam["position"]} → {cam["target"]} · 눈높이 1500mm · 28mm 기준</p><p>{e(visible)}</p><details><summary>동일 좌표의 공간 기준 이미지와 대조</summary><img src="source/geometry/DJ-CF-01_whitebox-{n}.png" alt="이미지 {n}의 동일 카메라 공간 기준 렌더" width="1536" height="1024" loading="lazy"><p>{e(Q["views"][n]["review"])}</p></details></section>'
    rows=''.join('<tr>'+''.join(f'<td>{e(str(c))}</td>' for c in row)+'</tr>' for row in Q['matrix'])
    doc=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DJ-CF-01 | RFP 자료 검토</title><style>
    :root{{font-family:"Malgun Gothic",system-ui,sans-serif;color:#17313d;background:#f2f4f4;line-height:1.7}}*{{box-sizing:border-box}}body{{margin:0}}a{{color:#155c7d;text-underline-offset:4px}}a:focus-visible,summary:focus-visible{{outline:3px solid #c06d24;outline-offset:5px}}header,main,footer{{max-width:1100px;margin:auto;padding:36px 30px}}header{{padding-top:58px}}h1{{font-size:clamp(25px,4vw,39px);line-height:1.35;margin:12px 0}}h2{{margin:0 0 12px;font-size:25px}}h3{{font-size:17px}}.eyebrow,.section-label{{color:#56717e;letter-spacing:.13em;font-size:12px;font-weight:bold}}.status{{display:inline-block;background:#fff2de;color:#805014;padding:5px 12px;border:1px solid #dfcaa6}}.intro{{max-width:760px}}nav{{display:flex;gap:10px 18px;flex-wrap:wrap;margin-top:26px}}section{{padding:30px;background:white;border:1px solid #d6dfe3;border-radius:8px;margin-bottom:22px;scroll-margin-top:20px}}section img{{width:100%;height:auto;display:block;margin:18px 0;border:1px solid #dbe1e4}}.caption{{color:#5b6d77;font-size:13px}}.downloads{{display:flex;gap:12px 20px;flex-wrap:wrap;margin:20px 0}}.requirements{{padding-left:20px}}.requirements li{{padding:5px 0}}.requirements p{{margin:3px 0 12px}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:20px}}.note{{border-left:3px solid #b17d3d;background:#faf5eb;padding:14px 18px}}details{{margin-top:18px;background:#f4f7f8;padding:12px 18px}}summary{{cursor:pointer;font-weight:bold}}.table-wrap{{overflow-x:auto}}table{{border-collapse:collapse;width:100%;font-size:14px}}th,td{{text-align:left;vertical-align:top;padding:10px;border:1px solid #cbd7dd}}th{{background:#eaf0f3}}.blank{{min-height:76px}}.muted{{color:#5b6d77}}footer{{font-size:13px;padding-bottom:60px}}@media(max-width:640px){{header,main,footer{{padding:22px 16px}}section{{padding:20px 16px}}.grid{{grid-template-columns:1fr}}th,td{{padding:7px;font-size:12px}}}}@media print{{nav,.downloads,details{{display:none}}body{{background:white}}section{{break-inside:avoid}}}}
    </style></head><body data-course-status="design-pending"><header><span class="eyebrow">AI LECTURE / DAEJEON / DJ-CF-01</span><h1>{e(S['title'])}</h1><p>{e(S['subtitle'])}</p><span class="status">승인 후보본 · 개정 02</span><p class="intro">RFP → 조건 분석 → 질문 → Design Brief → 구조화 Prompt → 이미지 대안 → 결과 비교를 위한 초반 실습자료입니다. 제공 조건과 입력 자료를 바탕으로 제안하고 비교합니다.</p><nav aria-label="검토 목차"><a href="#rfp">RFP 요약</a><a href="#plan">기준 평면도</a><a href="#view-01">이미지 01</a><a href="#view-02">이미지 02</a><a href="#view-03">이미지 03</a><a href="#check">일치 검토</a><a href="#worksheet">실습 기록지</a><a href="#downloads">다운로드</a><a href="#examples">예시 A/B</a></nav></header><main>
    <section id="rfp"><div class="section-label">01</div><h2>RFP 요약</h2><div class="table-wrap"><table aria-label="프로젝트 정보"><tbody>{info}</tbody></table></div><p>{e(R['opening'])}</p><p>{e(R['problem'])}</p><p class="note">{e(R['scope']['service'])} 주된 개입 영역은 Z1입니다.</p><div class="downloads"><a href="DJ-CF-01_RFP-draft.pdf">RFP PDF 5쪽</a><a href="source/DJ-CF-01_space.json">공간 조건표</a></div><div class="grid"><div><h3>사용자</h3><p>{e(R['users'])}</p></div><div><h3>미확정 조건</h3><ul>{''.join('<li>'+e(x)+'</li>' for x in R['unknown'])}</ul></div></div><details><summary>R1~R6 요구조건 보기</summary><ol class="requirements">{req}</ol></details><p class="note">{e(R['lesson01Scope'])}</p></section>
    <section id="plan"><div class="section-label">02</div><h2>교육용 기준 평면도</h2><p>8m × 10m / H3m. S1은 서비스 기능 영역이며 점선 위치에 벽체가 없습니다. 완성 가구 배치 정답은 포함하지 않습니다.</p><a href="DJ-CF-01_existing-plan.svg"><img src="DJ-CF-01_existing-plan.svg" alt="출입구 D1, 창호 W1 W2, 기둥 C1, 카운터 K1과 카메라 세 곳을 표시한 기준 평면도" width="1680" height="1188"></a><div class="downloads"><a href="DJ-CF-01_existing-plan.svg">SVG 기준 원본</a><a href="DJ-CF-01_existing-plan.pdf">A3 평면도 PDF</a><a href="DJ-CF-01_existing-plan.png">검토용 PNG</a></div></section>
    {views}
    <section id="check"><div class="section-label">06</div><h2>평면도 ↔ 이미지 일치 검토</h2><p>{e(Q['summary'])}</p><div class="table-wrap"><table><thead><tr><th>요소</th><th>이미지 01</th><th>이미지 02</th><th>이미지 03</th></tr></thead><tbody>{rows}</tbody></table></div><h3>확인한 항목</h3><ul>{''.join('<li>'+e(x)+'</li>' for x in Q['checked'])}</ul><h3>남아 있는 한계</h3><ul>{''.join('<li>'+e(x)+'</li>' for x in Q['limitations'])}</ul><p class="note">주요 요소의 위치 관계를 확인한 교육용 자료입니다. 수치 치수는 조건표·평면도에서 확인하며, AI 이미지의 정밀한 사진 정합이나 전문 적합성을 검증 완료로 표시하지 않습니다.</p></section>
    <section id="worksheet"><div class="section-label">07</div><h2>수강생 실습 기록지</h2><p>‘내용의 성격’과 ‘확인 상태’를 서로 다른 항목으로 기록합니다. 디자인 제안이면서 추가 확인이 필요한 내용도 기록할 수 있습니다.</p><div class="downloads"><a href="DJ-CF-01_participant-worksheet-draft.pdf">수강생 실습 기록지 PDF 2쪽</a></div><div class="table-wrap"><table><thead><tr><th>내용</th><th>내용의 성격</th><th>확인 상태</th><th>근거</th></tr></thead><tbody><tr><td class="blank"></td><td>제공 조건<br>가정<br>디자인 제안</td><td>자료에서 확인됨<br>추가 확인 필요</td><td></td></tr></tbody></table></div><div class="grid"><div><h3>조건과 질문</h3><p>Z1 변경 범위 / K1·S1 고정 배경 / RFP R5 제외 범위 / 추가 질문 / 전문 확인 필요</p></div><div><h3>제안과 비교</h3><p>Design Brief / 구조화 Prompt / A·B 조건 준수 / 선택 이유 / 추가 확인사항</p><p>Prompt 항목: {e(" · ".join(R["promptTerms"]))}</p></div></div></section>
    {practice_sections()}</main><footer>{e(R['notice'])}<br>DJ-CF-01 · 교육용 실습자료 · 개정 02</footer></body></html>'''
    doc=doc.replace('<a href="#downloads">다운로드</a>','<a href="#workflow">분석·Prompt</a><a href="#downloads">다운로드</a>')
    doc=doc.replace('‘내용의 성격’과 ‘확인 상태’를 서로 다른 항목으로 기록합니다. 디자인 제안이면서 추가 확인이 필요한 내용도 기록할 수 있습니다.','핵심 10개 영역의 내용·근거·확인 상태를 기록합니다. 가정·제안은 내용에 표시하고, 추가 질문·전문가 확인을 구분합니다.')
    doc=doc.replace('<th>내용</th><th>내용의 성격</th><th>확인 상태</th><th>근거</th>','<th>영역</th><th>핵심 내용</th><th>근거 / 위치</th><th>확인 상태</th>')
    doc=doc.replace('<tr><td class="blank"></td><td>제공 조건<br>가정<br>디자인 제안</td><td>자료에서 확인됨<br>추가 확인 필요</td><td></td></tr>',''.join('<tr><td>'+e(area)+'</td><td></td><td></td><td></td></tr>' for area in P['analysisAreas']))
    doc=doc.replace('<p>Design Brief / 구조화 Prompt / A·B 조건 준수 / 선택 이유 / 추가 확인사항</p>','<p>핵심 문제·우선순위 / 유지·변경·미확정 / 두 대안 전략 / 결과 기준 / 선택 이유</p>')
    (ROOT/'DJ-CF-01_review.html').write_text(doc,encoding='utf-8')

def manifest():
    rows=[]
    for p in sorted(ROOT.iterdir()):
        if not p.is_file():continue
        row={'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'status':'review-draft'}
        if p.suffix=='.pdf':row['pages']=len(PdfReader(p).pages)
        if p.suffix=='.png':row['pixels']=Image.open(p).size
        rows.append(row)
    (ROOT/'source/DJ-CF-01_asset-inventory.json').write_text(json.dumps({'projectId':'DJ-CF-01','revision':R['revision'],'packageEdition':R['packageEdition'],'productionManifest':False,'assets':rows},ensure_ascii=False,indent=2),encoding='utf-8')
    manifest_path=ROOT/'source/DJ-CF-01_package-manifest.json'
    entries=[{'file':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(ROOT.rglob('*')) if p.is_file() and p!=manifest_path]
    manifest_path.write_text(json.dumps({'projectId':'DJ-CF-01','status':'review-draft','excludesSelf':True,'fileCountIncludingManifest':len(entries)+1,'files':entries},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'documentAssets':len(rows),'pdfs':[r['file'] for r in rows if 'pages' in r]}))

if __name__=='__main__':
    protected=[ROOT/name for name in ['DJ-CF-01_existing-plan.svg','DJ-CF-01_existing-plan.png','DJ-CF-01_existing-view-01.png','DJ-CF-01_existing-view-02.png','DJ-CF-01_existing-view-03.png','DJ-CF-01_example-A.png','DJ-CF-01_example-B.png','source/DJ-CF-01_space.json','source/geometry/DJ-CF-01_geometry.json']]
    if '--refresh-plan-pdf' not in sys.argv:protected.append(ROOT/'DJ-CF-01_existing-plan.pdf')
    before={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in protected}
    if '--refresh-plan-pdf' in sys.argv:plan_pdf()
    rfp();worksheet();text_guides();webpage();manifest()
    assert all(hashlib.sha256(p.read_bytes()).hexdigest()==h for p,h in before.items()), 'Protected plan/image/space data changed'
