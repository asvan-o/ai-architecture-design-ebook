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
  if (event.status === 'moved') return `${event.file ?? event.source?.split(/[\\/]/).pop()} → ${event.classification?.label}`;
  if (event.status === 'review') return `${event.file ?? event.source?.split(/[\\/]/).pop()} → REVIEW 확인`;
  if (event.status === 'project-created') return `${event.project} 프로젝트 생성`;
  if (event.status === 'project-detected') return `${event.project} 프로젝트 감지`;
  if (event.status === 'error') return `${event.file ?? event.project ?? '작업'} · 오류 확인`;
  return event.status ?? '상태 변경';
}

function render(snapshot) {
  rootPath.textContent = snapshot.rootPath ?? '아직 ROOT가 연결되지 않았습니다.';
  watchState.textContent = snapshot.watching ? '파일 감시 ON' : '파일 감시 OFF';
  watchState.dataset.active = String(snapshot.watching);

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
