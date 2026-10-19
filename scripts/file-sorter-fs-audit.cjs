'use strict';
// Verification-only preload, excluded from the distributable program.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),outsideAttempts=[],accesses=new Set();
const write=fs.writeFileSync.bind(fs);
function check(value,operation){
 if(typeof value==='number'||value===undefined)return;
 const p=value instanceof URL?require('node:url').fileURLToPath(value):Buffer.isBuffer(value)?value.toString():String(value);
 const full=path.resolve(p),relative=path.relative(root,full);
 if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){outsideAttempts.push({operation,path:p});throw new Error('AUDIT: outside root');}
 accesses.add(relative);
}
for(const name of ['readFileSync','writeFileSync','openSync','mkdirSync','lstatSync','realpathSync','unlinkSync','renameSync','readdirSync','existsSync','copyFileSync']){
 const original=fs[name].bind(fs);
 fs[name]=function(...args){check(args[0],name);if(['renameSync','copyFileSync'].includes(name))check(args[1],name);return original(...args);};
}
for(const name of ['readFile','writeFile','open','mkdir','lstat','realpath','unlink','rename','readdir','copyFile']){
 const original=fs.promises[name].bind(fs.promises);
 fs.promises[name]=async function(...args){
  check(args[0],name);if(['rename','copyFile'].includes(name))check(args[1],name);
  if(name==='copyFile'&&String(args[1]).endsWith(path.join('04_이미지결과','render_failure.png'))){const error=new Error('검증용 저장 오류 주입 (EACCES)');error.code='EACCES';throw error;}
  return original(...args);
 };
}
process.on('exit',()=>write(path.join(root,'data/fs-audit.json'),JSON.stringify({root,outsideAttempts,accesses:[...accesses].sort()},null,2)));
