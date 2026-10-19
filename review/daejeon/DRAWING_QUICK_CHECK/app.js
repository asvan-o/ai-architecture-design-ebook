(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  let result = DrawingRules.inspect([]), filter = 'all';
  const icons = {'정상': '✓', '확인 필요': '!', '이전 리비전': '↶', '파일명 확인': '?'};
  const classNames = {'정상': 'normal', '확인 필요': 'needs', '이전 리비전': 'previous', '파일명 확인': 'invalid'};
  function node(tag, text, className) { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; }
  function render() {
    for (const [id, key] of [['total','total'],['drawings','drawings'],['needs','needsCheck'],['previous','previous']]) byId('count-' + id).textContent = result.summary[key];
    const visible = result.rows.filter(row => filter === 'all' || filter === 'normal' && row.status === '정상' || filter === 'needs' && row.needsCheck || filter === 'previous' && row.previous);
    byId('rows').replaceChildren();
    for (const row of visible) {
      const tr = node('tr'); tr.dataset.rowId = row.id; tr.dataset.status = row.status;
      const status = node('span', icons[row.status] + ' ' + row.status, 'status ' + classNames[row.status]);
      const drawing = node('div', row.drawing || '—'); drawing.append(node('small', row.revision ? '이 파일 ' + row.revision : '규칙 확인', 'revision'));
      const title = node('div', row.title || '파일명에서 확인 필요'); title.append(node('small', row.relativePath, 'file-meta'));
      const latest = node('div', row.latest || '—');
      const format = node('div', row.formats || '—'); format.append(node('small', '이 파일 ' + row.format, 'file-meta'));
      const notes = node('ul'); for (const note of row.notes) notes.append(node('li', note));
      for (const [label, content] of [['상태',status],['도면번호',drawing],['도면명·파일',title],['최신 후보',latest],['보유 형식',format],['확인사항',notes]]) { const td = node('td'); td.dataset.label = label; const wrap = node('div'); wrap.append(content); td.append(wrap); tr.append(td); }
      byId('rows').append(tr);
    }
    byId('table-wrap').hidden = !visible.length;
    byId('empty').hidden = !!visible.length;
    byId('empty').querySelector('p').textContent = result.summary.total ? '이 필터에 표시할 파일이 없습니다. 다른 필터 또는 제외 목록을 확인해보세요.' : '도면 폴더를 선택하거나 샘플 데이터를 불러와 확인해보세요.';
    byId('result-count').textContent = `점검 대상 ${result.summary.checked}개 중 ${visible.length}개 표시 · 제외 ${result.summary.excluded}개`;
    byId('download-csv').disabled = !result.summary.total;
    byId('excluded-panel').hidden = !result.ignored.length;
    byId('excluded-title').textContent = `제외한 파일 ${result.ignored.length}개 · 이유 보기`;
    byId('excluded-list').replaceChildren(...result.ignored.map(row => node('li', row.relativePath + ' — ' + row.reason)));
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  }
  function load(files, label) {
    try {
      result = DrawingRules.inspect(files); filter = 'all'; render();
      byId('source').textContent = label;
      byId('notice').textContent = `${files.length}개 파일을 불러왔습니다. 확인 필요 ${result.summary.needsCheck}개, 이전 리비전 ${result.summary.previous}개, 제외 ${result.summary.excluded}개입니다. 최신 후보는 제출 확정이 아닙니다.`;
    } catch { byId('notice').textContent = '파일 목록을 확인하지 못했습니다. 파일을 다시 선택해보세요. 원본 파일은 변경되지 않았습니다.'; }
  }
  const folder = byId('folder-input'), files = byId('files-input');
  byId('choose-folder').addEventListener('click', () => folder.click());
  byId('choose-files').addEventListener('click', () => files.click());
  if (!('webkitdirectory' in folder)) { byId('choose-folder').disabled = true; byId('folder-help').textContent = '이 브라우저는 폴더 선택을 지원하지 않습니다. “파일 여러 개 선택”으로 이용해보세요.'; }
  for (const input of [folder, files]) input.addEventListener('change', () => {
    if (!input.files.length) return;
    const metadata = Array.from(input.files, file => ({name: file.name, relativePath: file.webkitRelativePath || file.name, size: file.size, lastModified: file.lastModified}));
    load(metadata, input === folder ? '선택한 폴더 · 하위 폴더 포함' : '선택한 파일'); input.value = '';
  });
  byId('load-sample').addEventListener('click', () => load(DrawingSample.files, '교육용 샘플 · 실제 도면 아님'));
  byId('reset').addEventListener('click', () => { result = DrawingRules.inspect([]); filter = 'all'; folder.value = ''; files.value = ''; byId('source').textContent = '불러온 파일 없음'; byId('notice').textContent = '목록을 초기화했습니다. 원본 파일은 변경하지 않았습니다.'; byId('excluded-panel').open = false; render(); });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render(); }));
  byId('download-csv').addEventListener('click', () => {
    if (!result.summary.total) return;
    const url = URL.createObjectURL(new Blob([DrawingRules.toCsv(result)], {type:'text/csv;charset=utf-8'}));
    const link = node('a'); link.href = url; link.download = '도면_제출전_점검결과.csv'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    byId('notice').textContent = '전체 결과와 제외 목록을 CSV로 저장했습니다. 제출 여부는 원본과 대조해 직접 확인하세요.';
  });
  render();
})();
