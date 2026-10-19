(function (scope) {
  'use strict';
  const supported = new Set(['pdf', 'dwg', 'dxf']);
  const normalize = value => String(value || '').normalize('NFC');
  function excluded(file) {
    const relative = normalize(file.relativePath || file.name).replaceAll('\\', '/');
    if (relative.split('/').some(part => part.startsWith('.'))) return '숨김 이름 또는 숨김 폴더';
    if (/^(~\$|~)/.test(file.name) || /(?:\.(tmp|part|crdownload|bak)|~)$/i.test(file.name)) return '임시·백업 파일';
    const extension = file.name.split('.').at(-1).toLowerCase();
    if (!supported.has(extension)) return '지원하지 않는 형식';
    return '';
  }
  function inspect(files) {
    const ignored = [], rows = [];
    files.forEach((file, index) => {
      const meta = {id: index, name: normalize(file.name), relativePath: normalize(file.relativePath || file.name), size: Number(file.size) || 0, lastModified: Number(file.lastModified) || 0};
      const reason = excluded(meta);
      if (reason) { ignored.push({...meta, reason}); return; }
      const match = /^([a-z][a-z0-9]*-\d+)_(.+)_R(\d+)\.(pdf|dwg|dxf)$/i.exec(meta.name);
      if (!match || !match[2].trim() || !Number.isSafeInteger(Number(match[3]))) {
        rows.push({...meta, valid: false, drawing: '', title: '', revision: '', revisionNumber: null, format: meta.name.split('.').at(-1).toUpperCase(), latest: '', formats: '', previous: false, needsCheck: true, status: '파일명 확인', notes: ['[도면번호]_[도면명]_R[숫자].[pdf|dwg|dxf] 형식을 확인하세요.']});
        return;
      }
      rows.push({...meta, valid: true, drawing: match[1].toUpperCase(), title: match[2], revision: 'R' + match[3], revisionNumber: Number(match[3]), format: match[4].toUpperCase(), notes: [], previous: false, needsCheck: false});
    });
    const groups = new Map();
    for (const row of rows.filter(row => row.valid)) {
      if (!groups.has(row.drawing)) groups.set(row.drawing, []);
      groups.get(row.drawing).push(row);
    }
    for (const group of groups.values()) {
      const maximum = Math.max(...group.map(row => row.revisionNumber));
      const revisions = new Set(group.map(row => row.revisionNumber));
      const formats = [...new Set(group.filter(row => row.revisionNumber === maximum).map(row => row.format))].sort();
      const names = new Set(group.map(row => row.title));
      for (const row of group) {
        row.latest = 'R' + String(maximum).padStart(2, '0');
        row.formats = formats.join(' · ');
        row.previous = row.revisionNumber < maximum;
        if (revisions.size > 1) row.notes.push('여러 리비전: ' + [...revisions].sort((a, b) => a - b).map(n => 'R' + String(n).padStart(2, '0')).join(' / '));
        if (row.previous) row.notes.push('이전 리비전 · 최신 후보 ' + row.latest);
        else if (!formats.includes('PDF') || !formats.includes('DWG')) {
          row.needsCheck = true;
          row.notes.push('형식 확인 필요 · 최신 후보에 ' + ['PDF', 'DWG'].filter(f => !formats.includes(f)).join('·') + ' 없음');
        }
        if (group.filter(other => other.revisionNumber === row.revisionNumber && other.format === row.format).length > 1) {
          row.needsCheck = true;
          row.notes.push('중복 후보 · 같은 도면번호·리비전·형식');
        }
        if (names.size > 1) { row.needsCheck = true; row.notes.push('같은 도면번호에 도면명 차이 있음'); }
        row.status = row.needsCheck ? '확인 필요' : row.previous ? '이전 리비전' : '정상';
        if (!row.notes.length) row.notes.push('파일명 규칙과 최신 후보 PDF/DWG 짝 확인됨');
      }
    }
    rows.sort((a, b) => a.drawing.localeCompare(b.drawing, 'ko') || (b.revisionNumber ?? -1) - (a.revisionNumber ?? -1) || a.relativePath.localeCompare(b.relativePath, 'ko') || a.id - b.id);
    return {rows, ignored, summary: {total: files.length, checked: rows.length, drawings: groups.size, needsCheck: rows.filter(row => row.needsCheck).length, previous: rows.filter(row => row.previous).length, excluded: ignored.length}};
  }
  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }
  function toCsv(result) {
    const lines = [['상태', '파일명', '상대경로', '도면번호', '도면명', '이 파일 리비전', '최신 후보', '파일형식', '최신 후보 보유 형식', '확인사항', '크기(byte)']];
    for (const row of result.rows) lines.push([row.status, row.name, row.relativePath, row.drawing, row.title, row.revision, row.latest, row.format, row.formats, row.notes.join(' / '), row.size]);
    for (const row of result.ignored) lines.push(['제외', row.name, row.relativePath, '', '', '', '', '', '', row.reason, row.size]);
    return '\uFEFF' + lines.map(line => line.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  scope.DrawingRules = Object.freeze({inspect, toCsv, csvCell});
})(globalThis);
