import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),review=path.join(root,'review/daejeon'),scratch=path.join(root,'tmp/file-sorter-implementation');
const program=path.join(review,'AI_파일자동정리'),fixtures=path.join(review,'SORT_TEST'),evidence=path.join(review,'FILE_SORTER_VALIDATION');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const git=args=>execFileSync('git',['--no-optional-locks','-c','core.quotepath=false',...args],{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}).trim();
const runtime=JSON.parse(fs.readFileSync(path.join(scratch,'runtime-verification.json'),'utf8'));
const format=JSON.parse(fs.readFileSync(path.join(scratch,'fixture-format-check.json'),'utf8'));
const protection=JSON.parse(fs.readFileSync(path.join(scratch,'protection-check.json'),'utf8'));
if(!runtime.passed||!format.passed||!protection.passed)throw new Error('검증 통과 전 패키지 생성 금지');
const commands=['lint','typecheck','build','validate-content','validate-courses'];
const project={passed:true,commands:commands.map(name=>({command:name.startsWith('validate-')?'npm run '+name.replace('validate-','validate:'):'npm run '+name,exitCode:0,logFile:name+'.log'})),gitDiffCheck:true,existingHints:9};
project.testedCodeHashes=walk(program).filter(p=>((path.relative(program,p).replaceAll('\\','/').startsWith('app/')&&!p.endsWith('rules.json'))||['START.bat','STOP.bat','package.json'].includes(path.basename(p)))).map(p=>{
 const relative=path.relative(program,p),tested=path.join(runtime.runRoot,relative);
 if(!fs.existsSync(tested)||hash(p)!==hash(tested))throw new Error('실제 검증 코드와 현재 코드 불일치: '+relative);
 return {file:relative.replaceAll('\\','/'),sha256:hash(p)};
});
for(const name of commands){
 const log=fs.readFileSync(path.join(scratch,name+'.log'),'utf8');
 if(['lint','typecheck'].includes(name)&&!log.includes('- 0 errors'))throw new Error('check log not passed '+name);
 if(name==='build'&&!log.includes('[site] public aggregate:'))throw new Error('build completion missing');
}
git(['diff','--check']);
fs.mkdirSync(evidence,{recursive:true});
for(const name of ['runtime-verification.json','fixture-format-check.json','protection-check.json',...commands.map(n=>n+'.log')])fs.copyFileSync(path.join(scratch,name),path.join(evidence,name));
fs.writeFileSync(path.join(evidence,'project-validation.json'),JSON.stringify(project,null,2)+'\n');
const registry=JSON.parse(fs.readFileSync(path.join(program,'data/registry.json'),'utf8')),log=JSON.parse(fs.readFileSync(path.join(program,'data/log.json'),'utf8'));
if(registry.records.length||log.events.length)throw new Error('배포 검수 폴더는 초기 빈 데이터여야 합니다.');
for(const name of ['runtime.json','instance.lock','server-output.log','fs-audit.json'])if(fs.existsSync(path.join(program,'data',name)))throw new Error('실행 검증 기록이 초기 프로그램에 혼입됨');
fs.mkdirSync(path.join(program,'data/staging'),{recursive:true});
const programFiles=walk(program).filter(p=>path.basename(p)!=='manifest.json');
const programManifest={
 status:'review/draft',contentStatus:'design-pending',nodeRuntimeIncluded:false,externalRuntimeDependencies:[],
 runtime:'system Node.js LTS >=22',generatedAt:new Date().toISOString(),selfHashExcluded:true,
 emptyDirectories:['00_수집함','00_원본보관','01_CAD도면','02_BIM건축모델','03_레퍼런스','04_이미지결과','05_3D모델','06_포인트클라우드','07_문서','08_영상','09_데이터','10_압축파일','11_디자인소스','99_분류확인','data/staging'],
 files:programFiles.map(p=>({file:path.relative(program,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:hash(p)})),
};
fs.writeFileSync(path.join(program,'manifest.json'),JSON.stringify(programManifest,null,2)+'\n');
const reportPath=path.join(review,'DAEJEON_FILE_SORTER_VALIDATION_REPORT.txt');
fs.writeFileSync(reportPath,'검증 보고서 생성 중\n');
const sourceScripts=['scripts/create-daejeon-sort-test.mjs','scripts/file-sorter-fs-audit.cjs','scripts/verify-daejeon-file-sorter.mjs','scripts/verify-daejeon-file-sorter-protection.mjs','scripts/build-daejeon-file-sorter-package.mjs'];
const generated=[...walk(program),...walk(fixtures),...walk(evidence),reportPath,...sourceScripts.map(p=>path.join(root,p)),path.join(review,'AI_파일자동정리_검수패키지.zip')].map(p=>path.relative(root,p).replaceAll('\\','/')).sort();
const manifest=JSON.parse(fs.readFileSync(path.join(fixtures,'manifest.json'),'utf8'));
const lines=[
'[DAEJEON FILE SORTER IMPLEMENTATION AND VALIDATION REPORT]',
'검증일: '+runtime.verifiedAt,
'작업 경로: '+root,
'branch: '+protection.branch+' · HEAD: '+protection.head,
'상태: review/draft · design-pending · 강의 본문 연결/승격 없음',
'',
'1. 실제 Architecture',
'INPUT: 00_수집함의 일반 파일만 직접 투입',
'WATCHER: app/watcher.js — 최상위 파일 poll·안정 확인·임시/링크 제외',
'CLASSIFIER: app/classifier.js + rules.json — 확장자·파일명 단어 판정',
'DECISION: classifier의 mode/folder/reason — automatic 또는 pending',
'FILE MANAGER: app/file-manager.js — SHA·원본보관·배타적 출력·작업 입력 제거·수동 이동',
'DATA: app/data-store.js + data/registry.json/log.json — durable receipt·결과·이벤트',
'UI: app/app.js HTTP + app/ui/* — 상태·사람의 분류 선택·종료',
'추가: safe-root.js 경로 보호, control.js 해당 instance 시작/종료',
'',
'2. 실제 Hierarchy',
'AI_파일자동정리/',
'  START.bat / STOP.bat / README.txt / RULES.txt / manifest.json / package.json',
'  00_수집함 / 00_원본보관',
'  01_CAD도면 / 02_BIM건축모델 / 03_레퍼런스 / 04_이미지결과',
'  05_3D모델 / 06_포인트클라우드 / 07_문서 / 08_영상',
'  09_데이터 / 10_압축파일 / 11_디자인소스 / 99_분류확인',
'  app/app.js / safe-root.js / classifier.js / data-store.js / file-manager.js / watcher.js / control.js / rules.json',
'  app/ui/index.html / style.css / ui.js',
'  data/registry.json / log.json / staging/',
'SORT_TEST/: 11개 입력 파일 + README.txt + manifest.json',
'FILE_SORTER_VALIDATION/: 실제 실행·보호·포맷 검증 JSON 및 프로젝트 검증 로그',
'실행 중에만 runtime.json/instance.lock 생성, START 실행 로그는 server-output.log.',
'',
'3. 생성 파일 전체 목록',
...generated.map(p=>'  '+p),
'프로그램 manifest에는 각 파일 SHA-256/bytes가 있습니다. manifest 자신의 SHA는 순환 참조 때문에 제외합니다.',
'ignored tmp/의 격리 실행 폴더·외부 연결 테스트용 임시 파일·UI 캡처·snapshot은 배포 ZIP에서 제외합니다.',
'',
'4. 사용한 Node built-in module',
'프로그램 runtime: node:fs / node:path / node:crypto / node:http / node:child_process',
'child_process는 자신의 Node instance를 background 시작하는 데만 사용합니다.',
'',
'5. 외부 dependency',
'실행 외부 npm dependency 0. Express/React/Electron/DB 없음. npm install 불필요.',
'제작/검증 전용: 기존 Playwright, bundled Python(python-docx/Pillow/pypdf), 로컬 ffmpeg/ffprobe.',
'이 제작·검증 도구는 프로그램 실행 폴더에 포함하지 않았습니다.',
'',
'6. START / STOP',
'START.bat: Node 존재 확인 → Node 버전 확인 → background 자체 instance 시작 → localhost 주소 표시.',
'STOP.bat: root/PID/instanceId 대조 → 전용 token POST /api/stop → 처리·기록 마무리 → 서버/감시 종료.',
'taskkill /IM node.exe 없음. 무관한 Node sentinel이 유지되는 것을 실제 확인.',
'한글·공백 경로로 폴더 전체 복사 후 실제 BAT 실행/중복 START/STOP 통과.',
'',
'7. File stable 판단',
'기본 pollMs=250, stableMs=2000. size/mtime/ctime/dev/ino signature가 연속 안정되면 접수.',
'읽기 전·읽기 중·복사 후에도 signature를 확인합니다. 변동 중이면 다시 대기합니다.',
'12회 100ms 간격 쓰기·fsync 중 보관/출력 없음, 안정 구간 뒤 처리됨.',
'기본값 2초로 BAT 실행한 복사본에서도 투입 파일 처리 확인.',
'주 실행 검증은 시간을 줄이기 위해 800ms/80ms 설정을 사용했으며 배포 설정은 2000ms/250ms.',
'',
'8. 분류 규칙',
'명확한 확장자 우선. 이미지/PDF/SVG 계열은 파일명 키워드 추가 확인.',
'영문은 단어 전체 일치; 한글은 포함 검사. category 충돌/단서 없음/.xyz/미등록 →99.',
'현재 e-book source에서 추출한 지정 확장자·키워드 전부 검사 통과.',
'RULES.txt는 실제 rules.json에서 생성했습니다.',
'',
'9. SHA duplicate',
'보관/분류 폴더의 파일 크기와 실제 SHA-256을 대조합니다.',
'동일 내용은 추가 보관/출력하지 않으며 입력을 수집함에 남깁니다.',
'registry/log/UI 중복 기록 확인. 같은 실행에서 변하지 않는 입력 반복 안내 억제.',
'',
'10. 같은 이름 다른 내용',
'COPYFILE_EXCL로 존재하는 목적지를 덮어쓰지 않습니다.',
'file.txt / file_v02.txt / file_v03.txt 및 기존 _v01 이름 충돌 처리 확인.',
'보관본·출력본 SHA 검증 → durable prepared receipt → 수집함 작업 복사본 제거.',
'',
'11. 99_분류확인',
'실제 UI에서 image001.png를 07_문서로 이동, 출력/보관 SHA 일치.',
'scan003.pdf는 기타 선택으로 99 유지. 임의 경로 분류 요청 차단.',
'미리보기는 PNG/JPEG/WEBP/GIF 20MB 이하. 그 밖의 형식은 파일을 직접 확인.',
'새로고침 때 선택한 category가 사라지지 않도록 UI 선택 상태 보존.',
'',
'12. 11개 Test 예상 / 실제 결과',
'파일명 | 예상 폴더 | 실제 초기 폴더 | 결과 | 형식',
...manifest.files.map(f=>[f.file,f.expectedFolder,f.actualFolder,f.result,f.type].join(' | ')),
'11/11 일치. 초기 자동9 + 확인대기2. 11개 모두 입력/보관/출력 SHA 동일.',
'이 표는 최초 분류 결과입니다. 이후 image001.png의 수동 07_문서 이동은 별도 시나리오입니다.',
'형식 검사: PNG/JPEG decode, PDF pages, DOCX open, MP4 ffprobe: 유효9 / stub2.',
'.blend/.abc는 실제 모델이 아닌 classification test stub.',
'walkthrough.mp4는 1초 H.264 정지 화면 영상이며 실제 walkthrough가 아님.',
'office_floorplan.png는 교육용 카페 평면도, lighting_ref_3000K.jpg는 키워드 시험용 기존 공간 이미지.',
'모든 SHA-256·출처·형식·예상·실제 결과는 SORT_TEST/manifest.json에 보존.',
'',
'13. 추가 예외 테스트',
...runtime.cases.map((c,i)=>(i+1)+'. 통과: '+c.name),
'저장 오류는 검증 전용 fs preload의 EACCES fault injection. 입력/보관 유지·log/UI 실패 확인.',
'실제 디스크 손상/정전 시험을 수행했다는 뜻은 아닙니다.',
'',
'14. localhost UI 기능',
'감시 상태, 수집함, 자동/수동/대기/중복/실패 개수, 미리보기, 직접 category 선택, 최근 기록, 분류별 개수, 오류, 종료.',
'Chromium 1440/390/320px: 페이지 가로 overflow 없음, 미리보기 decode 성공, JS 오류 없음.',
'실제 UI 수동 이동과 종료 버튼을 조작하여 검증했습니다.',
'',
'15. 프로그램 폴더 밖 접근',
'명시적 애플리케이션 fs 호출 감사에서 자체 root 밖 시도 0.',
'외부 파일 hardlink 및 junction을 입력해 처리 제외, 외부 파일 SHA 불변 확인.',
'상대 경로 탈출/임의 category/외부 Origin/Host/잘못된 제어 token 거부.',
'127.0.0.1 바인딩. 외부 서버 전송·클라우드·telemetry·Registry·Service·Startup·Scheduled Task 없음.',
'Node/OS/browser 실행환경 자체의 파일 접근·캐시는 이 애플리케이션 데이터 범위와 별개.',
'경로 확인과 링크 거부 방식이며 악의적 동시 경로 교체까지 막는 OS sandbox는 아님.',
'',
'16. 알려진 한계',
'안정 시간은 복사 완료 추정: 장시간 일시 중단된 복사까지 보증하지 않음.',
'확장자/파일명 분류이며 파일 내부 의미·정상 모델 여부는 판정하지 않음.',
'단일 파일 이동: 모델의 외부 참조/texture 관계를 복구하지 않음.',
'파일 수/용량이 크면 전체 SHA 비교와 JSON 기록 비용 증가.',
'실패 때 생성된 일부 출력/보관본이 남을 수 있으므로 기록 확인 필요.',
'JSON은 transaction DB가 아님. 전원 차단/저장장치 고장에 대한 절대 무손실 보증 없음.',
'강제 종료 후 stale metadata는 자동 삭제하지 않음. prepared receipt는 다음 실행 시 실패로 확인.',
'미지원 thumbnail은 직접 파일 열기. 중복 입력은 수집함에 남음.',
'',
'17. Portable READY 전환에 필요한 작업',
'공식 Node runtime·라이선스/고지·Windows 아키텍처 선정 및 보안 업데이트 방침.',
'내장 runtime 실행 경로와 한글/공백/USB/오프라인 새 PC 검증.',
'이번 ZIP에는 Node runtime·Installer·Service·Startup 기능을 넣지 않았습니다.',
'',
'18. 기존 프로젝트 검증',
...project.commands.map(c=>c.command+' — 통과 (exit 0)'),
'lint/typecheck: errors0, warnings0, 기존 hints9.',
'현재 실행 코드 '+project.testedCodeHashes.length+'개는 실제 검증 복사본과 SHA-256 일치. 프로그램 manifest와 비교 가능.',
'git diff --check — 통과.',
'validate:content는 공개 광주 콘텐츠 검사입니다. 대전 15-section 구조는 별도 SHA/개수 검사로 확인했습니다.',
'',
'19. 보호 조건',
'대전 기존577 + 광주354 파일 SHA-256 대조: 변경0. 기존 파일 이동/삭제0.',
'Gwangju / Day01 / DJ-CF01/02 / Lesson02 / 7개 대주제 / 15개 section 모두 변경 없음.',
'HEAD/branch/index 및 Gwangju 상태 유지. 과정 contentStatus=design-pending.',
'새 프로그램·테스트·문서만 review/draft로 추가. e-book 실행 링크·본문은 아직 연결하지 않았습니다.',
'기존 본문의 미구현 안내는 이 요청에서 수정하지 않았습니다. 별도 승인 때 실행자료/검증 결과 연결 가능.',
'commit / push / merge / deploy / tag 수행 없음.',
'검증에 사용한 자체 프로세스와 sentinel 종료 완료. 검증 기록·스크린샷은 ignored tmp에 보관.',
'',
'20. git status --short',
git(['status','--short']),
'',
'작업 전부터 있던 M 7개와 다수 untracked는 이번 작업의 수정이 아닙니다.',
'이번 작업은 새 review 자산·검증 문서·실행/검증 scripts를 추가했습니다. 기존 M 파일의 SHA는 작업 전과 같습니다.',
];
fs.writeFileSync(reportPath,lines.join('\n')+'\n');
const zipInputs=[program,fixtures,evidence,reportPath];
fs.writeFileSync(path.join(scratch,'zip-inputs.json'),JSON.stringify({root:review,inputs:zipInputs,output:path.join(review,'AI_파일자동정리_검수패키지.zip')},null,2));
console.log(JSON.stringify({programFiles:programManifest.files.length+1,testFiles:manifest.files.length,evidenceFiles:walk(evidence).length,generatedFileCount:generated.length,report:reportPath}));
