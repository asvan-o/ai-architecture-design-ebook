"""Build review-only PDFs from content.json and the unchanged SVG-derived elevation PNG."""
from pathlib import Path
import json,html
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,A3,landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import Paragraph,Table,TableStyle
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'source/DJ-CF-02_content.json').read_text(encoding='utf-8'))
for n,f in [('Malgun','malgun.ttf'),('MalgunBold','malgunbd.ttf')]:pdfmetrics.registerFont(TTFont(n,'C:/Windows/Fonts/'+f))
pdfmetrics.registerFontFamily('Malgun',normal='Malgun',bold='MalgunBold',italic='Malgun',boldItalic='MalgunBold')
INK=colors.HexColor('#182b35');ACC=colors.HexColor('#315b66');MUT=colors.HexColor('#586b72');LINE=colors.HexColor('#b9c8cd')
S=ParagraphStyle('body',fontName='Malgun',fontSize=9.2,leading=14.4,textColor=INK,wordWrap='CJK')
SM=ParagraphStyle('small',parent=S,fontSize=8.2,leading=12)
class Doc:
 def __init__(self,name,title):
  self.c=canvas.Canvas(str(R/name),pagesize=A4);self.c.setTitle(title);self.c.setAuthor('AI Lecture / DJ-CF-02');self.page=0;self.open=False;self.boxes=[]
 def start(self,title,sub='',size=A4):
  if self.open:self.end()
  self.page+=1;self.open=True;self.w,self.h=size;self.c.setPageSize(size);self.x=40;self.width=self.w-80
  self.c.setFillColor(ACC);self.c.setFont('MalgunBold',8.5);self.c.drawString(40,self.h-31,'AI LECTURE / DAEJEON / DJ-CF-02');self.c.drawRightString(self.w-40,self.h-31,'REVIEW / '+C['revision'])
  self.c.setFillColor(INK);self.c.setFont('MalgunBold',18);self.c.drawString(40,self.h-67,title)
  self.c.setFillColor(MUT);self.c.setFont('Malgun',9);self.c.drawString(40,self.h-88,sub)
  self.c.setStrokeColor(LINE);self.c.line(40,self.h-103,self.w-40,self.h-103);self.y=self.h-122
 def guard(self,bottom,label):
  if bottom<48:raise ValueError(f'Page {self.page} overflow: {label} at {bottom:.1f}')
  self.boxes.append({'page':self.page,'label':label[:60],'bottom':bottom})
 def p(self,t,style=S):
  p=Paragraph(html.escape(t),style);_,h=p.wrap(self.width,2000);self.guard(self.y-h,t);p.drawOn(self.c,self.x,self.y-h);self.y-=h+6
 def section(self,t):
  self.y-=5;self.c.setFillColor(ACC);self.c.setFont('MalgunBold',10);self.c.drawString(self.x,self.y,t);self.y-=20
 def table(self,rows,widths,heights=None,header=True,pad=5):
  data=[[Paragraph(html.escape(str(t)),SM) for t in row] for row in rows]
  tb=Table(data,colWidths=widths,rowHeights=heights)
  styles=[('GRID',(0,0),(-1,-1),.4,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),pad),('RIGHTPADDING',(0,0),(-1,-1),pad),('TOPPADDING',(0,0),(-1,-1),pad),('BOTTOMPADDING',(0,0),(-1,-1),pad)]
  if header:styles.append(('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9f0f1')))
  tb.setStyle(TableStyle(styles));_,h=tb.wrap(self.width,2000);self.guard(self.y-h,'table');tb.drawOn(self.c,self.x,self.y-h);self.y-=h+9
 def image(self,file,maxh):
  from PIL import Image
  w,h=Image.open(R/file).size;scale=min(self.width/w,maxh/h);iw,ih=w*scale,h*scale;self.guard(self.y-ih,file);self.c.drawImage(str(R/file),(self.w-iw)/2,self.y-ih,iw,ih);self.y-=ih+10
 def blank(self,label,height):
  self.guard(self.y-height,label);self.c.setStrokeColor(LINE);self.c.rect(self.x,self.y-height,self.width,height);self.c.setFillColor(MUT);self.c.setFont('Malgun',8);self.c.drawString(self.x+7,self.y-15,label);self.y-=height+7
 def end(self):
  self.c.setFillColor(MUT);self.c.setFont('Malgun',7);self.c.drawString(40,26,C['notice']);self.c.drawRightString(self.w-40,26,str(self.page));self.c.showPage();self.open=False
 def save(self):
  if self.open:self.end()
  self.c.save();return self.boxes
def rfp():
 d=Doc('DJ-CF-02_RFP-draft.pdf',C['title']+' / 교육용 RFP')
 d.start(C['title'],C['subtitle'])
 d.table([['프로젝트','DJ-CF-02 / Exterior','대상','가상 2층 근린생활시설'],['범위','도로변 전면 리뉴얼','단계','콘셉트·이미지 실습']],[52,198,44,d.width-294],header=False)
 for n,t,key in [('01','프로젝트 개요','opening'),('02','주요 사용자','users'),('03','설계 문제','problem')]:d.section(n+'  '+t);d.p(C[key])
 d.section('04  요구조건')
 for no,title,body in C['requirements']:d.p(no+' '+title+' | '+body)
 d.start('조건을 확인하고 전략을 제안하세요','원문 조건 / 미확정 조건 / 제안 범위를 구분합니다')
 d.section('05  제공 조건 / 미확정 조건')
 for no,title,body in C['known']:d.p(no+' '+title+' | '+body,SM)
 d.table([['ID','추가 확인이 필요한 조건'],*C['unknown']],[45,d.width-45])
 d.p('변경 가능: '+C['change'],SM);d.p('제외: '+C['exclude'],SM)
 d.section('06  요청 결과물')
 for i,t in enumerate(C['deliverables'],1):d.p(f'{i}. {t}',SM)
 d.section('07  자료 사용 방법')
 d.p(C['roles'],SM);d.p(C['expert'],SM)
 d.p('U1~U4의 답을 받기 전에는 미확정 상태로 둡니다. 교육용 가상 조건의 확인은 실제 현장 검증이 아닙니다.',SM)
 d.start('기준 입면도','부록 / 고정 요소와 가상 치수의 근거',landscape(A3));d.image('DJ-CF-02_existing-elevation.png',d.y-55)
 d.start('현황 이미지 01 · 02','부록 / 같은 건물을 다른 시점에서 읽습니다',landscape(A4))
 gap=20;iw=(d.width-gap)/2;ih=iw*2/3
 for idx,num in enumerate(['01','02']):
  x=d.x+idx*(iw+gap);d.c.drawImage(str(R/f'DJ-CF-02_existing-view-{num}.png'),x,d.y-ih,iw,ih)
  d.c.setFillColor(INK);d.c.setFont('MalgunBold',10);d.c.drawString(x,d.y-ih-22,'IMAGE '+num+(' / 정면 편집 원본' if num=='01' else ' / 우측 사선 보조 자료'))
 d.y-=ih+46
 d.p('IMAGE 01은 2교시 Prompt 연습, 3교시 Exterior 이미지 실습, 4~6교시 RFP 실습의 편집 원본입니다. IMAGE 02는 같은 건물의 측면 깊이와 출입구 관계를 확인하는 보조 자료입니다.',SM)
 d.p('두 이미지에서 D1 1개, 1층 W1·W2, 2층 W3~W5, 무문자 SZ1, 2층 매스·지붕선을 대조합니다. 우측 측벽은 창호가 없습니다.',SM)
 d.p('AI 생성 현황 표현입니다. 미세 질감·유리 반사·이웃 건물 세부와 촬영 비례는 실측 자료가 아닙니다. 치수는 입면도에서 확인합니다. 역할이 중복되는 IMAGE 03은 제작하지 않았습니다.',SM)
 d.p('자료는 같은 폴더의 개별 PNG·PDF로도 제공합니다. 다운로드 안내: DJ-CF-02_review.html',SM)
 return d.save()
def worksheet():
 d=Doc('DJ-CF-02_participant-worksheet-draft.pdf','DJ-CF-02 수강생 실습 기록지')
 d.start('수강생 실습 기록지','이름 / 팀: _______________________     날짜: _______________________')
 d.section('1  RFP 분석 - 먼저 원문과 대조하세요')
 d.p('각 영역의 핵심을 1~2문장으로 적습니다. 근거는 R번호·자료명·페이지, 상태는 원문 조건 / 해석·제안 / 미확정으로 표시합니다.',SM)
 d.table([['영역','핵심 내용','근거','확인 상태'],*[[f'{i}. '+t,'','',''] for i,t in enumerate(C['areas'],1)]],[118,224,89,d.width-431],heights=[28]+[45]*10)
 d.p('추가 질문은 3~5개로 정리하고 대상·답에 따라 달라질 결정을 짧게 적습니다. 공간이 부족하면 별도 메모를 사용하세요.',SM)
 d.blank('원문 대조 후 수정한 핵심 조건 / 아직 해결하지 못한 충돌',66)
 d.p('검증 체크: □ 문 1개·창호 5개·2층  □ 유지/변경/제외 구분  □ U1~U4 미확정 유지  □ 전문 판단 별도 확인',SM)
 d.start('분석을 디자인 실행 기준으로 바꾸기','Design Brief → 전략 2개 → 7단 Prompt → 결과 비교')
 d.section('2  간단한 Design Brief')
 for label,h in [('목표·사용자·핵심 설계 문제',42),('설계 우선순위 1→2→3 / 그렇게 정한 근거',42),('유지 조건 / 변경 가능 범위 / 남은 미확정 조건',42)]:d.blank(label,h)
 d.table([['전략 A: __________________','전략 B: __________________'],['해결 방법·근거·장점·한계:','해결 방법·근거·장점·한계:']],[d.width/2]*2,heights=[27,46])
 d.section('3  학습용 7단 Prompt - 각 칸에 한 줄')
 d.table([['항목','선택한 전략에 대한 작업지시'],*[[f,''] for f in C['formula']]],[83,d.width-83],heights=[24]+[24]*7)
 d.section('4  두 결과를 원본과 비교하기')
 d.p('조건 위반은 먼저 수정합니다. 같은 IMAGE 01·주간·시점으로 비교하고, 결과를 정답으로 보지 않습니다.',SM)
 d.table([['비교 기준','A','B'],['매스·문·창호·시점 유지 / 위반 내용','',''],['D1 인지성 / 거리 조화 / 전략 표현','','']],[d.width*.64,d.width*.18,d.width*.18],heights=[23,28,28])
 d.blank('선택한 안과 이유 / 다음 수정 요청 / 전문가 확인',39)
 return d.save()
def elevation_pdf():
 # Vector SVG is the master; PDF uses its exact high-resolution raster at A3 landscape.
 c=canvas.Canvas(str(R/'DJ-CF-02_existing-elevation.pdf'),pagesize=landscape(A3));c.setTitle('DJ-CF-02 교육용 기준 입면도');c.drawImage(str(R/'DJ-CF-02_existing-elevation.png'),0,0,width=landscape(A3)[0],height=landscape(A3)[1]);c.save()
if __name__=='__main__':
 import sys
 if '--rfp-only' in sys.argv:
  boxes=rfp();scope='RFP only; worksheet and elevation preserved'
 else:
  boxes=rfp()+worksheet();elevation_pdf();scope='all documents'
 (R/'source/DJ-CF-02_pdf-layout-check.json').write_text(json.dumps({'scope':scope,'layoutBoxes':boxes,'minimumBottom':min(b['bottom'] for b in boxes)},ensure_ascii=False,indent=2),encoding='utf-8');print(scope)
