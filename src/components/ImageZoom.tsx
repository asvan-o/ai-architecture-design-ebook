import { useEffect, useId, useRef, useState } from 'react';

type ImageZoomProps = {
  src?: string;
  alt: string;
  caption?: string;
};

function ImageContent({ src, alt }: Pick<ImageZoomProps, 'src' | 'alt'>) {
  if (src) return <img src={src} alt={alt} />;

  return (
    <div className="plan-placeholder" role="img" aria-label={alt}>
      <span className="plan-line plan-line--a" />
      <span className="plan-line plan-line--b" />
      <span className="plan-line plan-line--c" />
      <span className="plan-core">IMAGE<br />PLACEHOLDER</span>
    </div>
  );
}

export default function ImageZoom({ src, alt, caption }: ImageZoomProps) {
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

  const visibleCaption = caption ?? (src ? alt : '검토된 이미지가 제공되면 이 위치에 표시됩니다.');

  return (
    <>
      <button
        ref={triggerRef}
        className="image-zoom-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <ImageContent src={src} alt={alt} />
        <span>이미지 크게 보기 <b aria-hidden="true">↗</b></span>
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
              <strong id={titleId}>{caption ?? alt}</strong>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label="확대 이미지 닫기">×</button>
            </header>
            <ImageContent src={src} alt={alt} />
            <p>{visibleCaption}</p>
          </div>
        </dialog>
      )}
    </>
  );
}
