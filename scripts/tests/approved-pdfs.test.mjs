import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveApprovedPdfSource} from '../approved-pdfs.mjs';
const file={fileName:'approved.pdf',sha256:'a'.repeat(64),sizeBytes:100};
const entry={path:'gwangju/downloads/approved.pdf',sha256:file.sha256,bytes:100,url:'https://github.com/asvan-o/ai-architecture-design-ebook/releases/download/test/approved.pdf'};
test('An empty PDF cache fetches the Release binary rather than a Pages HTML redirect',()=>{
 assert.equal(resolveApprovedPdfSource(file,[entry]),entry.url);
 assert.equal(resolveApprovedPdfSource(file,[]),'https://asvan-o.github.io/ai-architecture-design-ebook/downloads/approved.pdf');
});
test('Release migration cannot bypass the immutable approved PDF hash or size',()=>{
 assert.throws(()=>resolveApprovedPdfSource(file,[{...entry,sha256:'b'.repeat(64)}]),/approval hash/);
 assert.throws(()=>resolveApprovedPdfSource(file,[{...entry,bytes:101}]),/approval size/);
});
