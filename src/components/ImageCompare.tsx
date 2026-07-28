import { useId, useState } from 'react';

type ImageCompareProps = {
  beforeSrc?: string;
  beforeAlt: string;
  afterSrc?: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
};

function CompareLayer({
  src,
  alt,
  label,
}: {
  src?: string;
  alt: string;
  label: string;
}) {
  return (
    <>
      {src ? <img src={src} alt={alt} /> : <strong role="img" aria-label={alt}>검토 이미지 예정</strong>}
      <span>{label}</span>
    </>
  );
}

export default function ImageCompare({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: ImageCompareProps) {
  const [position, setPosition] = useState(52);
  const labelId = useId();

  return (
    <div className="image-compare">
      <div className="compare-stage" style={{ '--compare-position': `${position}%` } as React.CSSProperties}>
        <div className="compare-layer compare-layer--after">
          <CompareLayer src={afterSrc} alt={afterAlt} label={afterLabel} />
        </div>
        <div className="compare-layer compare-layer--before">
          <CompareLayer src={beforeSrc} alt={beforeAlt} label={beforeLabel} />
        </div>
        <div className="compare-divider" aria-hidden="true"><span>↔</span></div>
      </div>
      <label id={labelId}>
        <span>전후 비교 위치</span>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          aria-labelledby={labelId}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
        <output>{position}%</output>
      </label>
    </div>
  );
}
