import test from 'node:test';
import assert from 'node:assert/strict';
import {isDrawingImage,drawingScaleNotice} from '../workbook-drawing-scale.mjs';

test('scaled textbook drawings receive print guidance across the supplied plan families',()=>{
  for(const source of [
    'practice/DJ-CF-01/DJ-CF-01_existing-plan.png',
    'practice/DJ-CF-02/DJ-CF-02_existing-elevation.png',
    'practice/DJ-L05/plans/PLAN-BASE-01.png',
    'practice/DJ-L06/legacy-basic/01-small-room-plan.png',
    'practice/DJ-L06/legacy-basic/04-living-kitchen-plan.png',
    'images/lesson-07/comfy-reference-before.png',
    'images/lesson-08/floorplan/01-clean-line.jpg',
    'images/lesson-09/drawings/section.png',
  ]) assert(isDrawingImage(source),source);
  assert(isDrawingImage('images/example.png','2층 평면도'));
  assert(isDrawingImage('images/lesson-12/'+encodeURIComponent('보드04_03_Verification_입단면도면과_법규검토요약.png')));
  assert(isDrawingImage('images/lesson-12/'+encodeURIComponent('슬라이드04_평면조닝.png')));
  assert(!isDrawingImage('images/material-oak.png','재질 참고 이미지'));
  assert(drawingScaleNotice.includes('제공된 별도 도면 PDF'));
  assert(drawingScaleNotice.includes('별도 PDF가 없는'));
});
