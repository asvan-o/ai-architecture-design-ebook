import {workPrompts,recordStages,type WorkInput} from '../content/daejeon-lesson03';
interface Choice {id:string;name?:string;title?:string;}
interface Assets {spaces:Choice[];materials:Choice[];}
interface Snapshot {stage:string;conditions:WorkInput;prompt:string;}
const root=document.querySelector<HTMLElement>('[data-l03-workbench]');
if(root){
  const assets:Assets=JSON.parse(root.dataset.l03Assets!);
  const base=root.querySelector<HTMLSelectElement>('[data-l03-base]')!;
  const target=root.querySelector<HTMLInputElement>('[data-l03-target]')!;
  const intent=root.querySelector<HTMLInputElement>('[data-l03-intent]')!;
  const material=root.querySelector<HTMLSelectElement>('[data-l03-material]')!;
  const next=root.querySelector<HTMLSelectElement>('[data-l03-next-material]')!;
  const snapshots:Array<Snapshot|null>=[null,null,null],names=['','',''],urls=['','',''];
  let automaticTarget=true;
  const input=():WorkInput=>({space:assets.spaces.find(s=>s.id===base.value)?.title||'',target:target.value.trim(),intent:intent.value.trim(),material:assets.materials.find(m=>m.id===material.value)?.name||'',nextMaterial:assets.materials.find(m=>m.id===next.value)?.name||''});
  const setPrompt=(id:string,text:string)=>{
    const block=root.querySelector<HTMLElement>(`[data-copy-block-id="${id}"]`)!;
    block.querySelector<HTMLTextAreaElement>('[data-copy-source]')!.value=text;
    block.querySelector<HTMLElement>('pre code')!.textContent=text;
  };
  const update=()=>{
    const conditions=input(),prompts=workPrompts(conditions);
    setPrompt('l03-my-first-edit',prompts.first);setPrompt('l03-my-new-concept',prompts.final);
    root.querySelector<HTMLElement>('[data-l03-selection-status]')!.textContent=conditions.space?'오늘의 기준 공간: '+conditions.space+' · 오늘 계속 같은 원본을 사용합니다.':'한 공간을 선택하면 내 작업 Prompt에 반영됩니다.';
    root.querySelector<HTMLElement>('[data-l03-prompt-status]')!.textContent=conditions.space&&conditions.target&&conditions.intent?'선택한 공간·지정 면·목적·재질을 반영했습니다. 첨부자료와 유지 조건을 읽고 실행합니다.':'선택한 조건은 반영되고 작성할 부분은 대괄호로 남습니다. 실행 전에 공간·면·목적을 채웁니다.';
    root.querySelectorAll<HTMLButtonElement>('[data-l03-space-choice]').forEach(button=>{
      const selected=button.dataset.l03SpaceChoice===base.value;
      button.setAttribute('aria-pressed',String(selected));button.closest('.l03-asset-card')?.classList.toggle('is-selected',selected);
    });
  };
  const changeSpace=()=>{
    if(automaticTarget)target.value=base.value===assets.spaces[0].id?'리셉션 뒤 왼쪽 모서리부터 문틀 왼쪽 선까지의 벽면':'';
    if(!intent.value)intent.value='한 면의 재질로 차분하고 정돈된 인상을 살펴보기';
    update();
  };
  base.addEventListener('change',changeSpace);
  target.addEventListener('input',()=>{automaticTarget=false;update();});
  [intent,material,next].forEach(control=>control.addEventListener('input',update));
  root.querySelectorAll<HTMLButtonElement>('[data-l03-space-choice]').forEach(button=>button.addEventListener('click',()=>{base.value=button.dataset.l03SpaceChoice!;changeSpace();base.focus();}));
  root.querySelectorAll<HTMLButtonElement>('[data-l03-capture]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.l03Capture),stage=recordStages[index];
    const prompt=root.querySelector<HTMLTextAreaElement>(`[data-copy-block-id="${stage.promptId}"] [data-copy-source]`)!.value;
    snapshots[index]={stage:stage.name,conditions:input(),prompt};
    root.querySelector<HTMLTextAreaElement>(`[data-record-prompt="${index}"]`)!.value=prompt;
    root.querySelector<HTMLElement>(`[data-record-summary="${index}"]`)!.textContent=(input().space||'기준 공간 선택 전')+' · '+(input().target||'변경 면 기록 전');
  }));
  root.querySelectorAll<HTMLInputElement>('[data-record-image]').forEach(control=>control.addEventListener('change',()=>{
    const index=Number(control.dataset.recordImage),file=control.files?.[0],preview=root.querySelector<HTMLElement>(`[data-record-preview="${index}"]`)!;
    if(urls[index])URL.revokeObjectURL(urls[index]);urls[index]='';names[index]='';preview.hidden=true;
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){control.value='';root.querySelector<HTMLElement>('[data-l03-save-status]')!.textContent='PNG·JPEG·WebP 결과 이미지를 선택합니다.';return;}
    names[index]=file.name;urls[index]=URL.createObjectURL(file);const image=preview.querySelector<HTMLImageElement>('img')||document.createElement('img');image.alt=preview.dataset.previewAlt||'내 결과';image.src=urls[index];if(!image.parentElement)preview.prepend(image);preview.hidden=false;
  }));
  root.querySelector<HTMLButtonElement>('[data-l03-records-download]')!.addEventListener('click',()=>{
    const records=recordStages.map((stage,index)=>({stage:stage.name,snapshot:snapshots[index],executedPrompt:root.querySelector<HTMLTextAreaElement>(`[data-record-prompt="${index}"]`)!.value,imageFile:names[index],status:root.querySelector<HTMLSelectElement>(`[data-record-status="${index}"]`)!.value||'아직 기록하지 않음',note:root.querySelector<HTMLTextAreaElement>(`[data-record-note="${index}"]`)!.value}));
    const url=URL.createObjectURL(new Blob([JSON.stringify({records,note:'이미지 원본은 별도로 저장합니다.'},null,2)+'\n'],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='제3차시-실습-기록.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    root.querySelector<HTMLElement>('[data-l03-save-status]')!.textContent='실행 기록을 내려받았습니다. 이미지 원본도 따로 저장합니다.';
  });
  window.addEventListener('pagehide',()=>urls.forEach(url=>{if(url)URL.revokeObjectURL(url);}),{once:true});
  update();
}
