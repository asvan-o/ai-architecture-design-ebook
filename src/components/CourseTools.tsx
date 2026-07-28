import { useEffect, useId, useState } from 'react';

export type ChecklistItem = {
  id: string;
  label: string;
};

type CourseToolsProps = {
  lessonId: string;
  items: ChecklistItem[];
};

const isCheckState = (value: unknown): value is Record<string, boolean> =>
  Boolean(value)
  && typeof value === 'object'
  && Object.values(value as Record<string, unknown>).every((item) => typeof item === 'boolean');

export default function CourseTools({ lessonId, items }: CourseToolsProps) {
  const storagePrefix = `ai-arch-bible:v2:lesson:${lessonId}`;
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const headingId = useId();

  useEffect(() => {
    try {
      const storedChecks = localStorage.getItem(`${storagePrefix}:checks`);
      const storedNote = localStorage.getItem(`${storagePrefix}:note`);
      if (storedChecks) {
        const parsed: unknown = JSON.parse(storedChecks);
        if (isCheckState(parsed)) setChecks(parsed);
      }
      if (storedNote) setNote(storedNote);
    } catch {
      // 저장소가 차단되거나 값이 손상된 경우 현재 세션의 초기 상태를 사용한다.
    }
  }, [storagePrefix]);

  const toggleCheck = (itemId: string) => {
    const next = { ...checks, [itemId]: !checks[itemId] };
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
    <section className="course-tools lesson-section" id="section-11" aria-labelledby={headingId}>
      <div className="course-tools__checklist">
        <div className="tool-heading">
          <span>11</span>
          <div>
            <p>PROGRESS</p>
            <h2 id={headingId}>완료 체크리스트</h2>
          </div>
        </div>
        <p className="placeholder">체크 항목은 검토된 학습 기준으로 교체할 수 있습니다.</p>
        <div className="check-grid">
          {items.map((item, index) => (
            <label key={item.id}>
              <input
                type="checkbox"
                checked={Boolean(checks[item.id])}
                onChange={() => toggleCheck(item.id)}
              />
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.label}</strong>
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
