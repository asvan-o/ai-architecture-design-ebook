import { useEffect, useId, useState } from 'react';

const checklistItems = ['학습 목표 확인', '단계별 실습 완료', '확인 문제 점검'];

export default function CourseTools({ lessonId }: { lessonId: string }) {
  const storagePrefix = `ai-arch-bible:${lessonId}`;
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const headingId = useId();

  useEffect(() => {
    try {
      const storedChecks = localStorage.getItem(`${storagePrefix}:checks`);
      const storedNote = localStorage.getItem(`${storagePrefix}:note`);
      if (storedChecks) setChecks(JSON.parse(storedChecks) as Record<string, boolean>);
      if (storedNote) setNote(storedNote);
    } catch {
      // 브라우저 저장소가 차단되어도 학습 페이지 자체는 계속 사용할 수 있다.
    }
  }, [storagePrefix]);

  const toggleCheck = (item: string) => {
    const next = { ...checks, [item]: !checks[item] };
    setChecks(next);
    try {
      localStorage.setItem(`${storagePrefix}:checks`, JSON.stringify(next));
    } catch {
      // 저장 불가 환경에서는 현재 세션 상태만 유지한다.
    }
  };

  const saveNote = () => {
    try {
      localStorage.setItem(`${storagePrefix}:note`, note);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="course-tools" aria-labelledby={headingId}>
      <div className="course-tools__checklist">
        <div className="tool-heading">
          <span>11</span>
          <div>
            <p>PROGRESS</p>
            <h2 id={headingId}>완료 체크리스트</h2>
          </div>
        </div>
        <p className="placeholder">이 항목은 기능 확인을 위한 예시이며 실제 완료 기준은 추후 검토됩니다.</p>
        <div className="check-grid">
          {checklistItems.map((item, index) => (
            <label key={item}>
              <input type="checkbox" checked={Boolean(checks[item])} onChange={() => toggleCheck(item)} />
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </label>
          ))}
        </div>
      </div>

      <div className="student-note">
        <div>
          <p>PRIVATE NOTE · LOCAL ONLY</p>
          <h3>학생 개인 메모</h3>
        </div>
        <label>
          <span className="sr-only">이 차시에 대한 개인 메모</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="이 기기에만 저장되는 개인 메모를 입력하세요."
            rows={5}
          />
        </label>
        <div className="note-actions">
          <p aria-live="polite">{saved ? '이 기기에 저장되었습니다.' : '서버로 전송되지 않습니다.'}</p>
          <button type="button" onClick={saveNote}>메모 저장</button>
        </div>
      </div>
    </section>
  );
}
