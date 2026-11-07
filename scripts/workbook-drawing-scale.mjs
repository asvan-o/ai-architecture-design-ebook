// Print guidance describes the actual supplied artifact, never an assumed PDF.
export const drawingScaleNotice = '교보재 내 도면은 지면에 맞춰 축소 수록되었습니다. 표기 치수와 그래픽 스케일바로 판독하며, 정밀 축척 확인 시 제공된 별도 도면 PDF를 A3·100%로 출력하고 도면의 축척 표기를 확인합니다. 별도 PDF가 없는 기존 자료는 원 CAD·실측 자료를 확인합니다.';
export const drawingImagePattern = /existing[-_](?:plan|elevation)|PLAN-BASE|comfy-reference-(?:before|after)|floorplan\/01-clean-line|small-room-plan|living-kitchen-plan|legacy-house\/0[13]-|drawings?[\/_-]|평면도|입면도|단면도|배치도|입단면|평면조닝|보드0[34]|슬라이드0[46]/i;

export function isDrawingImage(source, alt = '') {
  let text = `${source} ${alt}`;
  try { text = decodeURIComponent(text); } catch { /* Keep literal filenames. */ }
  return drawingImagePattern.test(text);
}
