"""현재 교육 문안과 확정 이미지를 PDF에 반영하며 기준 입면도는 선택적으로 보존한다."""
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
S=ParagraphStyle('body',fontName='Malgun',fontSize=8.8,leading=13.0,textColor=INK,wordWrap='CJK')
SM=ParagraphStyle('small',parent=S,fontSize=8.2,leading=12)
class Doc:
 def __init__(self,name,title):
  self.c=canvas.Canvas(str(R/name),pagesize=A4);self.c.setTitle(title);self.c.setAuthor('AI Lecture / DJ-CF-02');self.page=0;self.open=False;self.boxes=[]
 def start(self,title,sub='',size=A4):
  if self.open:self.end()
  self.page+=1;self.open=True;self.w,self.h=size;self.c.setPageSize(size);self.x=40;self.width=self.w-80
  self.c.setFillColor(ACC);self.c.setFont('MalgunBold',8.5);self.c.drawString(40,self.h-31,'AI LECTURE / WORKBOOK');self.c.drawRightString(self.w-40,self.h-31,'교육용 실습자료')
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
 d.table(C['projectInfo'],[52,198,44,d.width-294],header=False)
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
 d.start('기준 입면도','부록 / 지면에 맞춰 축소 수록 · 정밀 축척은 별도 입면도 PDF를 A3 100%로 출력',landscape(A3));d.image('DJ-CF-02_existing-elevation.png',d.y-55)
 d.start('현황 이미지 01 · 02','부록 / 같은 건물을 다른 시점에서 읽습니다',landscape(A4))
 gap=20;iw=(d.width-gap)/2;ih=iw*2/3
 for idx,num in enumerate(['01','02']):
  x=d.x+idx*(iw+gap);d.c.drawImage(str(R/f'DJ-CF-02_existing-view-{num}.png'),x,d.y-ih,iw,ih)
  d.c.setFillColor(INK);d.c.setFont('MalgunBold',10);d.c.drawString(x,d.y-ih-22,'IMAGE '+num+(' / 정면 편집 원본' if num=='01' else ' / 우측 사선 보조 자료'))
 d.y-=ih+46
 d.p('IMAGE 01은 2교시 Prompt 연습, 3교시 Exterior 이미지 실습, 4~6교시 RFP 실습의 편집 원본입니다. IMAGE 02는 측면 관계를 읽는 시각 참고입니다. 새 교육용 도면의 정밀 투영을 재현한 이미지가 아닙니다.',SM)
 d.p('두 이미지에서 D1 1개, 1층 W1·W2, 2층 W3~W5, 무문자 SZ1, 2층 매스·지붕선을 대조합니다. 우측 측벽은 창호가 없습니다.',SM)
 d.p('AI 생성 현황 표현입니다. 현황과 리뉴얼 예시 A/B는 재질·개구부 관계를 읽는 시각 참고이며 기준 치수의 정밀 투영 일치를 보증하지 않습니다. 치수·레벨·면적은 기준 입면도·조건표에서 확인합니다. 역할이 중복되는 IMAGE 03은 제작하지 않았습니다.',SM)
 d.p('자료는 같은 폴더의 개별 PNG·PDF로도 제공합니다. 다운로드 안내: DJ-CF-02_review.html',SM)
 d.start('원문 조건 7개 + 후속 판단 3개','의뢰서 → 분석표 10개 영역 → 작업 기준서 10개 항목')
 d.p(C['analysisMapping'],SM)
 d.table(C['analysisMappingRows'],[d.width*.42,d.width*.58],pad=5)
 d.p(C['briefTransition'],SM)
 d.table([['작업 기준서 10개 항목','정리할 내용'],*[[f'{i}. '+x,'원문 근거와 선택·보완한 판단'] for i,x in enumerate(C['briefAreas'],1)]],[d.width*.49,d.width*.51],pad=4)
 d.p('수치 조건은 해당 영역에 함께 적고 필요한 항목에만 디자인 영향을 덧붙입니다. D1 1.80m는 포털 포함 개구부이며 문짝 유효폭 약 1.10m와 구분합니다.',SM)
 return d.save()
def worksheet():
 d=Doc('DJ-CF-02_participant-worksheet-draft.pdf','실습 B 수강생 실습 기록지')
 d.start('실습 B · 의뢰서 분석 10개 영역','원문 조건 7개 + 후속 확인·비교 3개')
 d.p(C['analysisMapping'],SM)
 d.table(C['analysisMappingRows'],[d.width*.42,d.width*.58],pad=4)
 d.table([['영역','핵심 내용','원문 근거 / 확인 상태'],*[[f'{i}. '+x,'',''] for i,x in enumerate(C['areas'],1)]],[145,d.width-270,125],heights=[26]+[31]*10,pad=4)
 d.p('수치 조건은 관련 영역에 기록합니다. 명목 1층 111.5㎡(약 34평) / 두 층 223.0㎡(약 68평). 수치 근거는 새 기준 입면도·조건표이며 기존 이미지는 시각 참고입니다.',SM)
 d.start('실습 B · 작업 기준서 10개 항목','분석표를 디자인 실행 기준으로 전환합니다')
 d.p(C['briefTransition'],SM)
 d.table([['항목','실행 기준 / 원문 근거 / 선택 이유'],*[[f'{i}. '+x,''] for i,x in enumerate(C['briefAreas'],1)]],[180,d.width-180],heights=[26]+[43]*10,pad=4)
 d.p('추가 질문과 전문가 확인은 분석표에 남기고 8번 미확정·10번 검토 기준에서 연결합니다. AI의 후보 초안은 사람이 선택·보완합니다.',SM)
 d.start('실습 B · Prompt와 A/B 비교','동일 IMAGE 01·기준 입면도·확정한 작업 기준서를 사용합니다')
 d.section('학습용 7단 Prompt 메모')
 d.table([['항목','작성 메모'],*[[x,''] for x in C['formula']]],[92,d.width-92],heights=[26]+[35]*7,pad=4)
 d.section('두 대안을 같은 기준으로 비교')
 d.table([['비교 기준','A','B'],['매스·문·창호·시점과 제외 범위','',''],['D1 인지성 / 거리 조화 / 전략 차이','',''],['원본 대비 원치 않은 변화 / 미확정','','']],[d.width*.5,d.width*.25,d.width*.25],heights=[26,44,44,44],pad=4)
 d.blank('선택 이유 / 다음 수정 / 추가 질문·전문가 확인',75)
 d.p('이미지로 실제 치수·구조·성능·시공·법규 적합성을 확정하지 않습니다.',SM)
 d.start('실습 B · 두 층을 연결하는 외관 리뉴얼 A/B','같은 원본·카메라·주간 조건에서 세로 집중과 수평 연속성을 비교합니다',landscape(A4))
 d.p(C['strategyCommon'],SM)
 gap=20;iw=(d.width-gap)/2;ih=iw*2/3
 for idx,letter in enumerate(['A','B']):
  x=d.x+idx*(iw+gap);strategy=C['strategies'][letter]
  d.guard(d.y-ih,'전략 '+letter+' 이미지');d.c.drawImage(str(R/f'DJ-CF-02_example-{letter}.png'),x,d.y-ih,iw,ih)
  text_y=d.y-ih-18
  d.c.setFillColor(INK);d.c.setFont('MalgunBold',10);d.c.drawString(x,text_y,'전략 '+letter+' · '+strategy['name'])
  for body in [strategy['proposal'],'확인할 점: '+strategy['risk']]:
   paragraph=Paragraph(html.escape(body),SM);_,height=paragraph.wrap(iw,2000);text_y-=height+7;d.guard(text_y,'전략 '+letter+' 설명');paragraph.drawOn(d.c,x,text_y)
 return d.save()

def elevation_pdf():
 # Vector SVG is the master; PDF uses its exact high-resolution raster at A3 landscape.
 c=canvas.Canvas(str(R/'DJ-CF-02_existing-elevation.pdf'),pagesize=landscape(A3));c.setTitle('DJ-CF-02 교육용 기준 입면도');c.drawImage(str(R/'DJ-CF-02_existing-elevation.png'),0,0,width=landscape(A3)[0],height=landscape(A3)[1]);c.save()
if __name__=='__main__':
 import sys
 if '--rfp-only' in sys.argv:
  boxes=rfp();scope='RFP만 갱신; 기록지와 기준 입면도 보존'
 elif '--student-documents-only' in sys.argv:
  boxes=rfp()+worksheet();scope='학생용 RFP·기록지만 갱신; 기준 입면도 PDF 보존'
 else:
  boxes=rfp()+worksheet();elevation_pdf();scope='전체 문서'
 (R/'source/DJ-CF-02_pdf-layout-check.json').write_text(json.dumps({'scope':scope,'layoutBoxes':boxes,'minimumBottom':min(b['bottom'] for b in boxes)},ensure_ascii=False,indent=2),encoding='utf-8');print(scope)
