import { useState } from 'react';

type PromptCopyProps = {
  text: string;
  label?: string;
};

export default function PromptCopy({ text, label = 'PROMPT · PLACEHOLDER' }: PromptCopyProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="prompt-example">
      <div className="prompt-example__bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>{copied ? '복사됨' : '프롬프트 복사'}</button>
      </div>
      <pre><code>{text}</code></pre>
      <p aria-live="polite" className="sr-only">{copied ? '프롬프트가 클립보드에 복사되었습니다.' : ''}</p>
    </div>
  );
}
