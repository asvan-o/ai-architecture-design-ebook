import test from 'node:test';import assert from 'node:assert/strict';
import {workbookAssetPath,legacyWorkbookAssetPath,publicReleasePath,legacyReleasePath,rewriteWorkbookReferences} from '../workbook-public-paths.mjs';
import {shouldUseRelease,namedReleaseAsset} from '../pages-release-assets.mjs';
test('Neutral public assets retain a reversible approved-source mapping',()=>{
 for(const original of ['images/daejeon/lesson-07/gaussian-input-512.jpg','downloads/daejeon/lesson-09/House_B_Walkthrough.html','downloads/daejeon/pdf/ai-architecture-design-daejeon-lesson-13.pdf','practice/gwangju-lesson02-reuse/flower-cafe-sample/00-empty-space.png']){
  const neutral=workbookAssetPath(original);assert(!/daejeon|gwangju/i.test(neutral));assert.equal(legacyWorkbookAssetPath(neutral),original);
 }
 assert.equal(workbookAssetPath('practice/DJ-CF-01/base.png'),'practice/DJ-CF-01/base.png');
 assert.equal(publicReleasePath('gwangju/downloads/textbook.pdf'),'gwangju/downloads/textbook.pdf');
});
test('Neutral Release paths preserve existing names and same-origin workbook PDFs',()=>{
 const legacy='daejeon/downloads/daejeon/lesson-10/A01_건축기획서.pdf';
 const neutral=publicReleasePath(legacy);assert.equal(neutral,'workbook/downloads/lesson-10/A01_건축기획서.pdf');assert.equal(legacyReleasePath(neutral),legacy);
 assert.equal(namedReleaseAsset(neutral),namedReleaseAsset(legacy));
 assert(!shouldUseRelease('workbook/downloads/pdf/ai-architecture-design-lesson-07.pdf',83000000));
 assert(shouldUseRelease(neutral,123456));assert(!shouldUseRelease('workbook/downloads/lesson-09/model.glb',20000000));
});
test('HTML and inline URL references become neutral without editing prompt prose or authentication IDs',()=>{
 const text='<img src="/workbook/images/daejeon/lesson-07/a.png"><a href="/workbook/downloads/daejeon/pdf/ai-architecture-design-daejeon-lesson-01.pdf?x=1#p">PDF</a><script>const course="daejeon-2026";</script><pre>벽체·치수 유지</pre>';
 const out=rewriteWorkbookReferences(text);assert(out.includes('/workbook/images/lesson-07/a.png'));assert(out.includes('/workbook/downloads/pdf/ai-architecture-design-lesson-01.pdf?x=1#p'));assert(out.includes('course="daejeon-2026"'));assert(out.includes('<pre>벽체·치수 유지</pre>'));
 assert.equal(rewriteWorkbookReferences('<a href="/gwangju/downloads/reference.pdf">광주</a>'),'<a href="/gwangju/downloads/reference.pdf">광주</a>');
});
