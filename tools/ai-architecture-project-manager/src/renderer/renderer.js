const rootPath = document.querySelector('#root-path');
const watchState = document.querySelector('#watch-state');
const projectList = document.querySelector('#project-list');
const eventList = document.querySelector('#event-list');
const message = document.querySelector('#message');
const projectForm = document.querySelector('#project-form');

function setMessage(text, isError = false) {
  message.textContent = text;
  message.dataset.error = String(isError);
}

function eventLabel(event) {
  const entryType = event.kind === 'folder' ? '[폴더] ' : '[파일] ';
  const entryName = event.file ?? event.source?.split(/[\\/]/).pop();
  if (event.status === 'moved') return `${entryType}${entryName} → ${event.classification?.label}`;
  if (event.status === 'review') return `${entryType}${entryName} → REVIEW 확인`;
  if (event.status === 'package-waiting') return `[폴더] ${entryName} → 복사 완료 대기 중`;
  if (event.status === 'waiting') return `[폴더] ${entryName} → 복사 진행 또는 파일 사용 중`;
  if (event.status === 'watch-ready') return '실시간 감시 준비 완료';
  if (event.status === 'watch-error') return '실시간 감시 오류 · 상태 확인';
  if (event.status === 'project-created') return `${event.project} 프로젝트 생성`;
  if (event.status === 'project-detected') return `${event.project} 프로젝트 감지`;
  if (event.status === 'error') return `${event.file ?? event.project ?? '작업'} · 오류 확인`;
  return event.status ?? '상태 변경';
}

function render(snapshot) {
  rootPath.textContent = snapshot.rootPath ?? '아직 ROOT가 연결되지 않았습니다.';
  const watchLabels = {
    active: '● 실시간 감시 중',
    preparing: '감시 준비 중',
    error: '감시 오류',
    stopped: '감시 중지',
  };
  watchState.textContent = watchLabels[snapshot.watchStatus] ?? (snapshot.watching ? '● 실시간 감시 중' : '감시 중지');
  watchState.dataset.active = String(snapshot.watching);
  watchState.dataset.status = snapshot.watchStatus ?? 'stopped';

  projectList.replaceChildren();
  if (snapshot.projects.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = snapshot.rootPath ? '등록된 프로젝트가 없습니다.' : 'ROOT를 먼저 선택하세요.';
    projectList.append(empty);
  }
  for (const project of snapshot.projects) {
    const article = document.createElement('article');
    const heading = document.createElement('h3');
    heading.textContent = project.name;
    const pathText = document.createElement('p');
    pathText.className = 'project-path';
    pathText.textContent = project.path;
    const counts = document.createElement('dl');
    for (const [label, count] of Object.entries(project.counts)) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = label;
      value.textContent = String(count);
      row.append(term, value);
      counts.append(row);
    }
    article.append(heading, pathText, counts);
    projectList.append(article);
  }

  eventList.replaceChildren();
  const events = snapshot.events.slice(0, 12);
  if (events.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = '아직 자동분류 내역이 없습니다.';
    eventList.append(empty);
  }
  for (const event of events) {
    const item = document.createElement('li');
    const time = document.createElement('time');
    time.dateTime = event.at;
    time.textContent = new Date(event.at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const text = document.createElement('span');
    text.textContent = eventLabel(event);
    item.append(time, text);
    eventList.append(item);
  }
}

async function refresh() {
  try {
    render(await window.organizer.snapshot());
  } catch (error) {
    setMessage(error.message, true);
  }
}

document.querySelector('#choose-root').addEventListener('click', async () => {
  try {
    render(await window.organizer.chooseRoot());
    setMessage('ROOT 연결 상태를 갱신했습니다.');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.querySelector('#refresh').addEventListener('click', refresh);

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#project-name');
  try {
    render(await window.organizer.createProject(input.value));
    setMessage(`${input.value.trim()} 프로젝트를 생성했습니다.`);
    input.value = '';
  } catch (error) {
    setMessage(error.message, true);
    input.focus();
  }
});

window.organizer.onEvent(() => refresh());
refresh();
