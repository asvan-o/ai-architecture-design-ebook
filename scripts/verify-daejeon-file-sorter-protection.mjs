import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),scratch=path.join(root,'tmp/file-sorter-implementation');
const before=JSON.parse(fs.readFileSync(path.join(scratch,'before.json'),'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git=(dir,args)=>execFileSync('git',['--no-optional-locks','-c','core.quotepath=false',...args],{cwd:dir,encoding:'utf8',windowsHide:true}).trim();
const gw=path.join(root,'..','gwangju');
const changed=[];
for(const [region,dir] of [['daejeon',root],['gwangju',gw]])for(const [file,expected] of Object.entries(before[region]))if(!fs.existsSync(path.join(dir,file))||hash(path.join(dir,file))!==expected)changed.push({region,file});
const course=JSON.parse(fs.readFileSync(path.join(root,'data/courses/daejeon-2026/course.json'),'utf8'));
const lesson=fs.readFileSync(path.join(root,'src/draft/content/daejeon-lesson02.ts'),'utf8');
const sectionBlock=lesson.split('export const lesson02Sections = [')[1].split('] as const;')[0];
const sectionIds=[...sectionBlock.matchAll(/id:\s*'(l02-[^']+)'/g)].map(m=>m[1]);
const topicBlock=lesson.split('export const lesson02Topics = [')[1].split('] as const;')[0];
const topics=[...topicBlock.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const condition={
  allExistingFilesUnchanged:changed.length===0,
  headUnchanged:git(root,['rev-parse','HEAD'])===before.head,
  branchUnchanged:git(root,['branch','--show-current'])===before.branch,
  indexUnchanged:git(root,['ls-files','--stage','-z'])===before.index,
  gwangjuHeadUnchanged:git(gw,['rev-parse','HEAD'])===before.gwangjuHead,
  gwangjuStatusUnchanged:git(gw,['status','--short'])===before.gwangjuStatus,
  designPending:course.contentStatus==='design-pending',
  sectionCount15:sectionIds.length===15,
  majorTopics7:topics.length===7,
};
const result={passed:Object.values(condition).every(Boolean),checkedAt:new Date().toISOString(),condition,changed,checkedFileCounts:{daejeon:Object.keys(before.daejeon).length,gwangju:Object.keys(before.gwangju).length},head:before.head,branch:before.branch,gwangjuHead:before.gwangjuHead,sectionIds,topics,sourceHash:hash(path.join(root,'src/draft/content/daejeon-lesson02.ts')),gitStatus:git(root,['status','--short'])};
fs.writeFileSync(path.join(scratch,'protection-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(!result.passed)process.exitCode=1;
