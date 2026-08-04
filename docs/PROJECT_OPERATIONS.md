# 프로젝트 운영 기준

이 문서는 `AI 건축디자인 바이블`의 공식 소스, 컴퓨터 간 동기화, 강의 현장 실행과 포터블 강의키트 운영 기준을 정의한다. Codex를 포함한 모든 작업자는 작업을 시작할 때 이 문서를 먼저 확인한다.

## 1. 공식 source of truth

- 공식 저장소: `asvan-o/ai-architecture-design-ebook`
- 공식 최신본: GitHub 저장소의 `origin/main`
- 특정 컴퓨터의 폴더, 빌드 결과물 또는 포터블 ZIP을 원본으로 간주하지 않는다.
- 작업 전 `git status`와 현재 브랜치를 확인하고, clean 상태라면 `git pull --ff-only origin main`으로 동기화한다.
- working tree가 dirty이면 `reset`, `restore`, `stash`, `clean`으로 상태를 없애지 말고 먼저 변경 범위와 소유자를 확인한다.

## 2. 데스크톱 폴더 역할

공식 데스크톱 작업 폴더는 다음과 같다.

```text
C:\Users\deric\Desktop\architecture-design-course-p1
```

이 폴더에서 다음 작업을 수행한다.

- 주 개발과 코드 변경
- 강의자료 검수·수정
- 교보재와 다운로드 자료 제작
- 학생용 e-book, 강사용 콘솔, 프레젠테이션, PDF 빌드
- Git commit·push와 `main` 반영
- 포터블 강의키트 생성

작업은 최신 `main`에서 목적별 브랜치를 만들어 진행한다. 검사가 끝난 변경만 `main`에 반영한다.

## 3. 기존 폴더 역할

다음 폴더는 과거 미커밋 작업과 제5~14차시 참고자료를 보존하는 읽기 전용 저장소다.

```text
C:\Users\deric\Desktop\architecture-design-course
```

이 폴더에서는 다음을 수행하지 않는다.

- 새 강의자료 제작
- 제1~4차시 수정
- 강의 실행 또는 공식 빌드
- `main` 병합
- 파일 정리·삭제
- `reset`, `restore`, `stash`, `clean`
- 기존 미커밋 변경 덮어쓰기

자료가 필요하면 먼저 읽기 전용으로 감사하고, 승인된 파일만 공식 작업 브랜치로 선별 이관한다. 폴더 전체를 복사하거나 자동 동기화하지 않는다.

## 4. 노트북 clone 역할

노트북에는 데스크톱 P1 폴더를 통째로 복사하지 않는다. P1이 Git worktree이면 `.git` 정보가 데스크톱 원본 저장소를 가리킬 수 있어 다른 컴퓨터에서 동작하지 않을 수 있다.

노트북에는 GitHub에서 독립 clone을 만든다.

```bash
git clone https://github.com/asvan-o/ai-architecture-design-ebook.git architecture-design-course-p1
```

노트북 clone은 다음 용도로 사용한다.

- 강의 현장 실행
- 긴급 수정과 로컬 commit
- 긴급 빌드
- 새 포터블 키트 생성
- Git을 통한 데스크톱과의 동기화

## 5. Git 동기화 절차

### 데스크톱 작업

```bash
git status
git switch main
git pull --ff-only origin main
git switch -c <작업-브랜치>
```

수정과 검사를 마친 뒤 관련 파일만 명시적으로 staging하고 commit·push한다. 검토가 끝난 작업만 fast-forward 방식으로 `main`에 반영하고 `origin/main`에 push한다.

### 노트북 동기화

```bash
git switch main
git pull --ff-only origin main
```

두 컴퓨터에서 같은 파일을 동시에 수정하지 않는다. 폴더 전체 복사나 덮어쓰기는 금지한다.

## 6. 오프라인 긴급 수정

강의 현장에서 인터넷을 사용할 수 없어도 노트북의 소스 프로젝트에서 수정할 수 있다.

1. 현재 `main`을 기준으로 로컬 작업 브랜치를 만든다.
2. 필요한 최소 범위만 수정한다.
3. lint, typecheck, 콘텐츠 검증과 관련 빌드를 수행한다.
4. 로컬 commit으로 변경을 보존한다.
5. 소스 실행 모드로 강의를 진행한다.
6. 인터넷이 복구되면 작업 브랜치를 push한다.
7. 검토 후 `main`에 반영한다.
8. 데스크톱에서 `git pull --ff-only origin main`을 실행한다.

인터넷 복구 전에 데스크톱에서 같은 내용을 다시 작성하지 않는다.

## 7. 포터블 키트 경계

포터블 강의키트는 특정 Git SHA와 생성 시각의 실행 전용 스냅샷이다. 원본 소스나 편집 공간이 아니다.

키트 내부에서는 다음을 수행하지 않는다.

- Codex 또는 수동 소스 수정
- HTML·PDF 직접 교체
- `BUILD_INFO.json` 수정
- 강사 화면 직접 수정
- Git 작업

다음 폴더는 생성 결과이므로 원본으로 사용하지 않는다.

- `sites/student/`
- `sites/instructor/`
- `pdf/`
- `app/`
- `runtime/`

포터블 키트에는 원본 소스, `.git`, 환경변수 파일과 강사 YAML을 넣지 않는다. 서버는 `127.0.0.1`에만 바인딩한다.

## 8. 강의키트 재생성 시점

다음 변경이 `main`에 반영된 경우 강의 전에 키트를 다시 생성한다.

- 강의 내용 또는 교보재 변경
- 학생·강사·프레젠테이션 UI 변경
- PDF 출력 변경
- 강사 메모 렌더링 결과 변경
- 런처·서버·보안 경계 변경

재생성 절차:

1. 소스 프로젝트에서 `main`과 `origin/main` 일치를 확인한다.
2. working tree가 clean인지 확인한다.
3. `강의키트_생성.cmd`를 실행한다.
4. `BUILD_INFO.json`의 Git SHA, 생성 시각, dirty 여부를 확인한다.
5. ZIP SHA-256을 확인한다.
6. 새 ZIP을 강의 PC의 빈 폴더에 완전히 압축 해제한다.
7. 기존 키트 위에 덮어 풀지 않는다.

공식 키트에는 `--allow-dirty`를 사용하지 않는다.

## 9. 수강생 e-book 전달

수강생에게는 검수·배포가 완료된 해당 차시의 공개 e-book 직접 링크를 전달한다.

```text
https://asvan-o.github.io/ai-architecture-design-ebook/lessons/<차시>/
```

e-book에서 강의 내용, 실습자료, 요청문, 차시별 PDF와 전체 PDF를 제공한다. 제5~14차시가 미완성인 동안에는 완성된 차시의 직접 링크만 안내한다. 목차에 보이는 미완성 차시는 수업자료로 사용하도록 안내하지 않는다.

## 10. 제5차시 이후 제작

제1~4차시 사용자 검수가 끝난 뒤 최신 `main`에서 새 작업 브랜치를 만들어 제5차시부터 제작한다.

1. 기존 `architecture-design-course` 자료를 읽기 전용으로 감사한다.
2. 사용 가능한 자료만 선별한다.
3. 오래되거나 중복·불완전한 자료를 구분한다.
4. 개인정보, 권리와 출처를 확인한다.
5. 필요한 파일만 공식 작업 브랜치로 이관한다.
6. 현재 강의 목표에 맞게 수정하거나 재제작한다.
7. 웹·강사·프레젠테이션·PDF를 검수한다.
8. `main`에 반영하고 공개 e-book을 배포한다.
9. 포터블 키트를 다시 생성한다.

기존 폴더의 제5~14차시 자료를 자동 동기화하거나 전체 복사하지 않는다.

## 11. instructor YAML 별도 동기화

`instructor-content/lessons/*.yaml`은 Git 제외 파일이다. clone과 pull만으로는 다른 컴퓨터에 전달되지 않는다.

- 포터블 키트에는 원본 YAML을 넣지 않고 렌더링된 결과만 포함한다.
- 노트북에서 원본 메모가 필요하면 암호화 USB 또는 접근이 제한된 비공개 저장소로 별도 전달한다.
- 복사 전 원본을 백업한다.
- 복사 후 SHA-256을 비교한다.
- 요청 대상이 아닌 다른 차시 YAML은 수정하지 않는다.

## 12. 금지 작업

- 공식 기준을 폴더 복사본이나 포터블 ZIP으로 변경
- 두 컴퓨터에서 같은 파일 동시 수정
- dirty working tree에서 무단 `reset`, `restore`, `stash`, `clean`
- 기존 폴더의 미커밋 작업 삭제 또는 덮어쓰기
- 포터블 키트 내부 직접 수정
- 공식 키트를 `--allow-dirty`로 생성
- 강사 YAML을 공개 저장소·학생 사이트·포터블 원본 파일로 포함
- 사용자 승인 없는 강의 내용 생성·변경
- 검증 실패 상태의 commit·push·배포

## 13. 긴급 복구 절차

### 소스 작업이 잘못된 경우

1. 추가 수정과 파일 정리를 중단한다.
2. `git status --short --branch`와 `git diff --stat`을 기록한다.
3. `reset`, `restore`, `stash`, `clean`을 실행하지 않는다.
4. 현재 브랜치, HEAD와 `origin/main`을 확인한다.
5. 복구 대상을 사용자와 확정한 뒤 별도 브랜치 또는 새 clone에서 복구한다.

### 강의 중 포터블 키트가 실행되지 않는 경우

1. ZIP을 완전히 압축 해제했는지 확인한다.
2. `강의키트_상태확인.cmd`를 실행한다.
3. 실행 중인 기존 키트가 있으면 `강의_종료.cmd`로 안전 종료한다.
4. 기존 폴더를 덮어쓰지 말고 검증된 ZIP을 새 빈 폴더에 다시 압축 해제한다.
5. `BUILD_INFO.json`의 Git SHA와 ZIP 체크섬을 확인한다.
6. 포터블 실행이 불가능하면 노트북의 clean 소스 clone에서 `강의_실행.cmd`를 사용한다.

### 강사 YAML이 누락된 경우

1. 학생용 화면은 그대로 사용한다.
2. 공개 저장소나 포터블 키트에서 YAML을 찾지 않는다.
3. 승인된 암호화 백업에서 해당 차시 파일만 복사한다.
4. SHA-256 비교 후 강사용 빌드를 다시 생성한다.
