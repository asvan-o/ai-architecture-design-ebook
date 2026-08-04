import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const argumentsList = process.argv.slice(2);
const valueAfter = (name) => {
  const index = argumentsList.indexOf(name);
  return index >= 0 ? argumentsList[index + 1] : undefined;
};
const root = path.resolve(valueAfter('--root') ?? process.cwd());
const mode = valueAfter('--mode') === 'portable' ? 'portable' : 'source';
const statePath = path.resolve(
  valueAfter('--state') ?? path.join(root, mode === 'portable' ? 'logs' : '.lecture-kit', 'state.json'),
);
const stop = argumentsList.includes('--stop');

let state;
try {
  state = JSON.parse(await readFile(statePath, 'utf8'));
} catch {
  console.log('[lecture-kit] 실행 중인 강의 서버가 없습니다.');
  process.exit(stop ? 0 : 1);
}

try {
  const endpoint = `http://127.0.0.1:${state.ports.hub}${stop ? '/api/stop' : '/api/status'}`;
  const response = await fetch(endpoint, {
    method: stop ? 'POST' : 'GET',
    headers: { 'X-Lecture-Kit-Token': state.token },
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  if (stop) {
    console.log('[lecture-kit] 등록된 강의 서버에 안전 종료를 요청했습니다.');
  } else if (body.pid === state.pid && body.tokenValid) {
    console.log('[lecture-kit] 강의 서버가 정상 실행 중입니다.');
    console.log(`- 허브: http://127.0.0.1:${body.ports.hub}/`);
    console.log(`- 학생: http://127.0.0.1:${body.ports.student}/lessons/01/`);
    console.log(`- 강사: http://127.0.0.1:${body.ports.instructor}/instructor-console/lessons/01/`);
    console.log(`- 프로젝터: http://127.0.0.1:${body.ports.instructor}/presentation/lessons/01/`);
  } else {
    throw new Error('PID 또는 고유 토큰이 일치하지 않습니다.');
  }
} catch (error) {
  console.error(`[lecture-kit] 상태 파일은 있으나 해당 서버를 확인할 수 없습니다: ${error.message}`);
  process.exit(1);
}
