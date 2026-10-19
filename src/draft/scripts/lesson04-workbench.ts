import {exteriorWorkPrompt,type ExteriorBase} from '../content/daejeon-lesson04';
const root=document.querySelector<HTMLElement>('[data-l04-workbench]');
if(root){
 const bases:ExteriorBase[]=JSON.parse(root.dataset.l04Bases!);
 const select=root.querySelector<HTMLSelectElement>('[data-l04-base]')!;
 const update=()=>{
  const base=bases.find(b=>b.id===select.value)!;
  for(const variant of ['A','B'] as const){
   const text=exteriorWorkPrompt(base,variant),block=root.querySelector<HTMLElement>(`[data-copy-block-id="l04-my-${variant}"]`)!;
   block.querySelector<HTMLTextAreaElement>('[data-copy-source]')!.value=text;
   block.querySelector<HTMLElement>('pre code')!.textContent=text;
  }
  root.querySelector<HTMLElement>('[data-l04-base-status]')!.textContent='오늘의 기준: '+base.type+' · 내 A/B Prompt에 반영했습니다. 예시 결과 이미지는 BASE 01 예제로 유지됩니다.';
 };
 select.addEventListener('change',update);update();
}
