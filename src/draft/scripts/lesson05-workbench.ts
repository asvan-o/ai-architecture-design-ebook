interface PromptAttachment {file:string;role:string;outputPath:string;}
interface PlanPrompt {
 id:string;
 title:string;
 text:string;
 cropPath:string;
 cropFilename:string;
 promptPath:string;
 promptFilename:string;
 attachments:PromptAttachment[];
}
interface AttachmentStage {id:string;title:string;recompose:PromptAttachment[];overlay:PromptAttachment[];}
const root=document.querySelector<HTMLElement>('[data-l05-workbench]');
if(root){
 const plans:PlanPrompt[]=JSON.parse(root.dataset.l05Prompts||'[]');
 const select=root.querySelector<HTMLSelectElement>('[data-l05-plan]');
 const panel=root.querySelector<HTMLElement>('[data-l05-prompt-panel]');
 const base=root.dataset.l05Base||'';
 const enabled=root.dataset.l05AssetsEnabled==='true';
 const renderAttachments=(container:HTMLElement,attachments:PromptAttachment[])=>{
  const list=container.querySelector<HTMLOListElement>('[data-prompt-attachments] ol');
  if(!list)return;
  list.replaceChildren(...attachments.map(attachment=>{
   const item=document.createElement('li');
   const name=attachment.file.split('/').pop()||attachment.file;
   const file=enabled?document.createElement('a'):document.createElement('span');
   file.textContent=name;
   if(file instanceof HTMLAnchorElement){file.href=base+'/'+attachment.outputPath;file.download=name;}
   const role=document.createElement('span');
   role.textContent=' — '+attachment.role;
   item.append(file,role);
   return item;
  }));
 };
 const update=()=>{
  const plan=plans.find(item=>item.id===select?.value);
  if(!plan||!panel)return;
  const source=panel.querySelector<HTMLTextAreaElement>('[data-copy-source]');
  const code=panel.querySelector<HTMLElement>('pre code');
  const title=panel.querySelector<HTMLElement>('h4');
  if(source)source.value=plan.text;
  if(code)code.textContent=plan.text;
  if(title)title.textContent=plan.title+' · 가구 부분 수정';
  renderAttachments(panel,plan.attachments);
  const prompt=panel.querySelector<HTMLElement>('[data-prompt-download]');
  if(prompt)prompt.dataset.promptDownload=plan.promptFilename;
  const downloadButton=panel.querySelector<HTMLButtonElement>('[data-download-prompt]');
  if(downloadButton)downloadButton.dataset.downloadPrompt=plan.promptFilename;
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
 const stages:AttachmentStage[]=JSON.parse(root.dataset.l05AttachmentStages||'[]');
 const stageSelect=root.querySelector<HTMLSelectElement>('[data-l05-attachment-stage]');
 const updateStage=()=>{
  const stage=stages.find(item=>item.id===stageSelect?.value);
  if(!stage)return;
  const recompose=root.querySelector<HTMLElement>('[data-l05-recompose-panel]');
  const overlay=root.querySelector<HTMLElement>('[data-l05-overlay-panel]');
  if(recompose)renderAttachments(recompose,stage.recompose);
  if(overlay)renderAttachments(overlay,stage.overlay);
  const selection=root.querySelector<HTMLElement>('[data-l05-attachment-selection]');
  if(selection)selection.textContent='선택 단계: '+stage.title+' · 아래 두 요청문의 첨부 목록에 반영했습니다.';
 };
 stageSelect?.addEventListener('change',updateStage);
 updateStage();
}
