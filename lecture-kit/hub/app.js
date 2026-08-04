const token = document.querySelector('meta[name="lecture-kit-token"]')?.content ?? '';
const statusList = document.querySelector('#status-list');
const lessonSelect = document.querySelector('#lesson-select');
let state;

const labels = {
  mode: '실행 모드',
  kitVersion: '키트 버전',
  gitHead: 'Git SHA',
  buildTimestamp: '빌드 시각',
  hub: '허브',
  student: '학생 서버',
  instructor: '강사 서버',
  status: '상태',
};

const renderStatus = (nextState) => {
  state = nextState;
  const values = {
    status: nextState.running ? '정상 실행 중' : '중지됨',
    mode: nextState.mode === 'portable' ? '휴대용 키트' : '소스 최신 빌드',
    kitVersion: nextState.buildInfo?.kitVersion ?? '-',
    gitHead: nextState.buildInfo?.gitHead?.slice(0, 12) ?? '-',
    buildTimestamp: nextState.buildInfo?.buildTimestamp ?? '-',
    hub: `127.0.0.1:${nextState.ports.hub}`,
    student: `127.0.0.1:${nextState.ports.student}`,
    instructor: `127.0.0.1:${nextState.ports.instructor}`,
  };
  statusList.innerHTML = Object.entries(values)
    .map(([key, value]) => `<div><dt>${labels[key]}</dt><dd>${value}</dd></div>`)
    .join('');
  document.querySelector('#public-ebook').href = nextState.publicEbookUrl;
};

const refresh = async () => {
  const response = await fetch('/api/status', { cache: 'no-store' });
  if (!response.ok) throw new Error('상태를 불러오지 못했습니다.');
  renderStatus(await response.json());
};

const lessonUrl = (kind) => {
  const lesson = lessonSelect.value;
  const studentOrigin = `http://127.0.0.1:${state.ports.student}`;
  const instructorOrigin = `http://127.0.0.1:${state.ports.instructor}`;
  if (kind === 'student') return `${studentOrigin}/lessons/${lesson}/`;
  if (kind === 'console') return `${instructorOrigin}/instructor-console/lessons/${lesson}/`;
  if (kind === 'presentation') return `${instructorOrigin}/presentation/lessons/${lesson}/`;
  if (kind === 'lesson-pdf') return `${studentOrigin}/downloads/ai-architecture-design-lesson-${lesson}.pdf`;
  if (kind === 'course-pdf') return `${studentOrigin}/downloads/ai-architecture-design-course.pdf`;
  return studentOrigin;
};

document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.open;
    if (target === 'student-presentation') {
      window.open(lessonUrl('student'), '_blank', 'noopener');
      window.open(lessonUrl('presentation'), '_blank', 'noopener');
      return;
    }
    window.open(lessonUrl(target), '_blank', 'noopener');
  });
});

document.querySelector('#refresh-status').addEventListener('click', () => {
  refresh().catch((error) => alert(error.message));
});

document.querySelector('#open-pdf-folder').addEventListener('click', async () => {
  const response = await fetch('/api/open-pdf-folder', {
    method: 'POST',
    headers: { 'X-Lecture-Kit-Token': token },
  });
  if (!response.ok) alert('PDF 폴더를 열지 못했습니다.');
});

document.querySelector('#stop-server').addEventListener('click', async () => {
  if (!confirm('학생·강사·프로젝터 로컬 서버를 모두 종료할까요?')) return;
  const response = await fetch('/api/stop', {
    method: 'POST',
    headers: { 'X-Lecture-Kit-Token': token },
  });
  if (response.ok) document.body.innerHTML = '<main><section><h1>강의 서버를 종료했습니다.</h1><p>이 창을 닫아도 됩니다.</p></section></main>';
});

refresh().catch((error) => {
  statusList.innerHTML = `<div><dt>상태 오류</dt><dd>${error.message}</dd></div>`;
});
