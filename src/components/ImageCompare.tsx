import { useId, useState } from 'react';

export default function ImageCompare() {
  const [position, setPosition] = useState(52);
  const labelId = useId();

  return (
    <div className="image-compare">
      <div className="compare-stage" style={{ '--compare-position': `${position}%` } as React.CSSProperties}>
        <div className="compare-layer compare-layer--after">
          <span>AFTER</span>
          <strong>검토 이미지 예정</strong>
        </div>
        <div className="compare-layer compare-layer--before">
          <span>BEFORE</span>
          <strong>검토 이미지 예정</strong>
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
