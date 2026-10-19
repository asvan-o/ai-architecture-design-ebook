interface PlanPrompt {
 id:string;
 title:string;
 text:string;
 cropPath:string;
 cropFilename:string;
 promptPath:string;
 promptFilename:string;
}
const root=document.querySelector<HTMLElement>('[data-l05-workbench]');
if(root){
 const plans:PlanPrompt[]=JSON.parse(root.dataset.l05Prompts||'[]');
 const select=root.querySelector<HTMLSelectElement>('[data-l05-plan]');
 const panel=root.querySelector<HTMLElement>('[data-l05-prompt-panel]');
 const base=root.dataset.l05Base||'';
 const update=()=>{
  const plan=plans.find(item=>item.id===select?.value);
  if(!plan||!panel)return;
  const source=panel.querySelector<HTMLTextAreaElement>('[data-copy-source]');
  const code=panel.querySelector<HTMLElement>('pre code');
  const title=panel.querySelector<HTMLElement>('h4');
  if(source)source.value=plan.text;
  if(code)code.textContent=plan.text;
  if(title)title.textContent=plan.title+' · 가구 부분 수정';
  const prompt=panel.querySelector<HTMLElement>('[data-prompt-download]');
  if(prompt)prompt.dataset.promptDownload=plan.promptFilename;
  const download=panel.querySelector<HTMLAnchorElement>('a.review-download');
  if(download){download.href=base+'/'+plan.promptPath;download.download=plan.promptFilename;}
  const crop=root.querySelector<HTMLElement>('[data-l05-crop-link]');
  if(crop){
   crop.textContent=plan.cropFilename;
   if(crop instanceof HTMLAnchorElement){crop.href=base+'/'+plan.cropPath;crop.download=plan.cropFilename;}
  }
  const selection=root.querySelector<HTMLElement>('[data-l05-selection]');
  if(selection)selection.textContent='선택한 도면: '+plan.title+' · Part 2의 첨부 이미지와 Prompt에 반영했습니다.';
 };
 select?.addEventListener('change',update);
 update();
}
