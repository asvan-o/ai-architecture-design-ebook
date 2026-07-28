import { useState } from 'react';

export default function PromptCopy() {
  const [copied, setCopied] = useState(false);
  const placeholder = '[검토된 프롬프트가 이 영역에 제공될 예정입니다.]';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(placeholder);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="prompt-example">
      <div className="prompt-example__bar">
        <span>PROMPT · PLACEHOLDER</span>
        <button type="button" onClick={copy}>{copied ? '복사됨' : '프롬프트 복사'}</button>
      </div>
      <pre><code>{placeholder}</code></pre>
      <p aria-live="polite" className="sr-only">{copied ? '프롬프트가 클립보드에 복사되었습니다.' : ''}</p>
    </div>
  );
}
