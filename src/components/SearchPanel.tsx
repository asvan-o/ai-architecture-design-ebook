import { useEffect, useId, useRef, useState } from 'react';

type SearchItem = {
  title: string;
  href: string;
  type: string;
  summary: string;
};

export default function SearchPanel({ searchUrl }: { searchUrl: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (items.length === 0) {
      fetch(searchUrl)
        .then((response) => response.json())
        .then((data: SearchItem[]) => setItems(data))
        .catch(() => setItems([]));
    }
  }, [open, items.length, searchUrl]);

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  const handleDialogClosed = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const normalized = query.trim().toLocaleLowerCase('ko');
  const results = normalized
    ? items.filter((item) =>
        `${item.title} ${item.type} ${item.summary}`.toLocaleLowerCase('ko').includes(normalized),
      )
    : [];

  return (
    <div className="search-panel">
      <button
        ref={triggerRef}
        className="search-trigger"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">⌕</span>
        <span>페이지 검색</span>
        <kbd>Ctrl K</kbd>
      </button>
      {open && (
        <dialog
          ref={dialogRef}
          className="search-backdrop"
          aria-labelledby={`${listId}-title`}
          onClose={handleDialogClosed}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            className="search-dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>SEARCH · INDEX</span>
                <strong id={`${listId}-title`}>전자서적 검색</strong>
              </div>
              <button type="button" aria-label="검색 닫기" onClick={closeDialog}>
                ×
              </button>
            </header>
            <label className="search-input">
              <span className="sr-only">검색어</span>
              <span aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="페이지 또는 차시 검색"
                aria-controls={listId}
              />
            </label>
            <div className="search-results" id={listId} aria-live="polite">
              {!normalized && (
                <p className="search-empty">
                  검색 색인은 페이지 메타데이터를 사용합니다. 이후 승인된 콘텐츠가 추가되면 본문 색인으로 확장할 수 있습니다.
                </p>
              )}
              {normalized && results.length === 0 && <p className="search-empty">일치하는 페이지가 없습니다.</p>}
              {results.map((item) => (
                <a href={item.href} key={item.href}>
                  <span>{item.type}</span>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </a>
              ))}
            </div>
          </section>
        </dialog>
      )}
    </div>
  );
}
