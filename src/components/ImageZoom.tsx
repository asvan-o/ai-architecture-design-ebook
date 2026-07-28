import { useEffect, useId, useRef, useState } from 'react';

function PlanPlaceholder() {
  return (
    <div className="plan-placeholder" role="img" aria-label="추후 검토된 실습 이미지가 들어갈 자리">
      <span className="plan-line plan-line--a" />
      <span className="plan-line plan-line--b" />
      <span className="plan-line plan-line--c" />
      <span className="plan-core">IMAGE<br />PLACEHOLDER</span>
    </div>
  );
}

export default function ImageZoom() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
  }, [open]);

  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  const handleClosed = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <button ref={triggerRef} className="image-zoom-trigger" type="button" onClick={() => setOpen(true)}>
        <PlanPlaceholder />
        <span>이미지 확대 보기 <b aria-hidden="true">↗</b></span>
      </button>
      {open && (
        <dialog
          ref={dialogRef}
          className="image-lightbox"
          aria-labelledby={titleId}
          onClose={handleClosed}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <header>
              <strong id={titleId}>실습 이미지 · PLACEHOLDER</strong>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label="확대 이미지 닫기">×</button>
            </header>
            <PlanPlaceholder />
            <p>승인된 강의 이미지가 제공되면 이 위치에 원본 크기로 표시됩니다.</p>
          </div>
        </dialog>
      )}
    </>
  );
}
