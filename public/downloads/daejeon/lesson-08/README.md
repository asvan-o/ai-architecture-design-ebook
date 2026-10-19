# 자체 제작 1층 오피스 · 도면 판독과 관계도

1. DJ-L07-Office-Floorplan-Original.pdf를 내려받아 NotebookLM 소스로 추가합니다. 텍스트 레이어가 있으며 가로 정방향입니다. 실명·문·창·치수의 기준은 이 원본입니다.
2. 판독 결과를 원본과 교차검수해 KEEP·REVIEW·UNKNOWN 기준표를 만듭니다.
3. 웹의 원본 PNG 다운로드 또는 ZIP의 images/00-office-floorplan-original.png를 ChatGPT 이미지 편집 / Google AI Studio(Nano Banana)에 첨부합니다. 제7차시 comfy-reference-before.png와 동일한 원본입니다. DJ-L07-clean-line-preprocess.txt로 선화 정리를 시도하고, 필요하면 images/01-clean-line.jpg로 이어갑니다. 가로 정방향을 유지합니다.
4. 비교 선화의 이사실·13연승, 입체의 사장실·이사실·계단창·1.5인승은 의도한 교육용 문자 오류입니다. 실제 AI가 해당 오류를 냈다는 증빙이 아니며 원본·기준표로 교정합니다.
5. 원본 PDF·기준표·선화를 Top View 입력으로 함께 사용합니다. 입체의 재료·높이·빛은 가정이며 문·공간 관계는 원본에서 확인합니다.
6. 공간 관계는 원본 PDF·기준표만으로 검증하고 Graphviz DOT로 구조화합니다. 두 PNG는 같은 DOT의 세로·가로 렌더링이며 실제 NotebookLM/ChatGPT 서비스 화면이 아닙니다.

외부 공유 도면·개인 프로젝트 PDF·내부 DOCX는 넣지 않습니다. 이 교육용 도면은 실측·실시설계·법규·구조·승강기 성능을 확정하지 않습니다. 축선·치수·레벨은 교육용 설정이며 계단참 EL+2,200은 확정 층고가 아닙니다.

Graphviz 렌더링은 Viz.js(HTTPS, https://viz-js.com/)를 먼저 사용합니다. WebGraphviz(http://webgraphviz.com/)는 HTTP 연결 주의가 필요한 보조 대안입니다. DOT의 Malgun Gothic 폰트 지정에도 설치 폰트·브라우저에 따라 한글 글자 폭이 달라질 수 있으므로 라벨 잘림과 관계선을 확인합니다.
