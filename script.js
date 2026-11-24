
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const phaseDuration=4000;
 const phases=[
   {name:'signal',title:'YM-0▉0｜信号回流',value:'█',status:'信号回流 · 同步失败',message:'检测结果：画面来源待核',glyphs:'▒░▉�',stride:2},
   {name:'registry',title:'名册 · 观测席还留着一位',value:'1',status:'名册更新 · 新增一条应答',message:'新增记录：当前观测席',glyphs:'□░▌',stride:3},
   {name:'recovery',title:'复位完成｜尚有一条记录未撤回',value:'0',status:'终端已复位 · 等待档案回执',message:'未撤回记录：1 条',glyphs:'_□·',stride:5}
 ];
 const normalTitle=document.title;
 const storageKey='ym_interference_start';
 const originalText=new Map();
 const searchInput=$('siteSearch');
 const normalPlaceholder=searchInput?.getAttribute('placeholder');
 let currentPhase;
 let phaseStart=0;
 let phaseTimer;
 let refreshReadout=()=>{};

 const corruptText=(text,phase)=>{
   let offset=0;
   const altered=text.replace(/[\p{L}\p{N}]/gu,char=>{
     const position=offset++;
     return position%phase.stride===0 ? phase.glyphs[(position/phase.stride)%phase.glyphs.length] : char;
   });
   return offset ? altered : altered.replace(/\S/u,phase.glyphs[0]);
 };

 const textFilter={acceptNode(node){
   if(!/\S/u.test(node.data) || node.parentElement?.closest('script, style, template, noscript, textarea, [contenteditable], #labReading, #labStatus, #labMessage')){
     return NodeFilter.FILTER_REJECT;
   }
   return NodeFilter.FILTER_ACCEPT;
 }};

 function applyInterferenceText(){
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,textFilter);
   while(walker.nextNode()){
     const node=walker.currentNode;
     const previous=originalText.get(node);
     const normal=previous?.shown===node.data ? previous.normal : node.data;
     const {interferenceText,interferenceRegistry,interferenceRecovery}=node.parentElement.dataset;
     const override={signal:interferenceText,registry:interferenceRegistry??interferenceText,recovery:interferenceRecovery}[currentPhase.name];
     const shown=override ? normal.replace(/\S(?:[\s\S]*\S)?/u,()=>override) : corruptText(normal,currentPhase);
     originalText.set(node,{normal,shown});
     if(node.data!==shown) node.data=shown;
   }
 }

 const watchText=()=>textObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
 const textObserver=new MutationObserver(()=>{
   textObserver.disconnect();
   applyInterferenceText();
   watchText();
 });

 function advanceInterference(){
   clearTimeout(phaseTimer);
   textObserver.disconnect();
   const elapsed=Date.now()-phaseStart;
   currentPhase=phases[Math.floor(elapsed/phaseDuration)];
   document.body.classList.toggle('observation-interference',Boolean(currentPhase));
   document.title=currentPhase?.title??normalTitle;
   if(searchInput && normalPlaceholder!==null){
     searchInput.setAttribute('placeholder',currentPhase ? corruptText(normalPlaceholder,currentPhase) : normalPlaceholder);
   }
   if(currentPhase){
     document.body.dataset.observationPhase=currentPhase.name;
     refreshReadout();
     applyInterferenceText();
     watchText();
     phaseTimer=setTimeout(advanceInterference,phaseDuration-elapsed%phaseDuration);
   }else{
     delete document.body.dataset.observationPhase;
     for(const [node,{normal,shown}] of originalText){
       if(node.isConnected && node.data===shown) node.data=normal;
     }
     originalText.clear();
     refreshReadout();
     try{sessionStorage.removeItem(storageKey);}catch(_){}
   }
 }

 function resumeInterference(){
   try{phaseStart=Number(sessionStorage.getItem(storageKey))||0;}catch(_){}
   if(phaseStart || currentPhase) advanceInterference();
 }

 const entries=[
 ['羊母（YM）','太初虚无，羊曦的母亲，从未诞生。','index.html#intro'],
 ['起源传说','《零时之前》据说由剑桥爸爸亲笔撰写，记载太初虚无、羊父奇点与羊父羊母大战。','index.html#origin'],
 ['基本性质','波粒二象性与绝对反观测。','index.html#abilities'],
 ['羊母空间异常档案','YM-013：后室失踪报告、模因污染与暗物质假说。','index.html#space-archive'],
 ['零号元素 Ym','Hydrogen 前的一格，四个零。羊母的残骸、虚无与宇宙膨胀。','index.html#element-ym'],
 ['夜间校务记录','羊曦、学校、失踪名册与复活计划。','index.html#academy-record'],
 ['值班室副本','白天公示、夜间底稿、失物招领与监控抄录。','index.html#evidence-room'],
 ['羊母派与羊没派','羊曦的追随者与追查失踪者的羊没派。','index.html#factions'],
 ['相关人物','羊曦 YX、章翰峰、羊父、剑桥爸爸、章鱼哥等在卷人物。','index.html#characters'],
 ['学生意见与校务记录','学生手记、羊曦、校规、食堂 35 元、旧喷泉广场篮球场与前任校长的意见簿。','index.html#student-notes'],
 ['档案批注','羊母、羊母派经费申请与退稿意见。','index.html#archive-notes'],
 ['存在性实验','今天的观测结果仍然为零。','index.html#observation'],
 ['影像档案','YM 和 YX 的原卷及五段补录影像。','影像档案.html'],
 ['补录影像','值班室收到的五段新录像。','影像档案.html#supplemental-footage']
 ];
 const layer=$('searchLayer');
 if(layer && $('openSearch')){
   const input=$('siteSearch'),results=$('searchResults');
   const render=()=>{
     const q=input.value.trim().toLowerCase();
     results.replaceChildren();
     const found=entries.filter(entry=>(entry[0]+entry[1]).toLowerCase().includes(q));
     if(q==='03:00:08') found.push(['CAM-03 · 校时复核','值班室导出索引中有两条同一时间的记录。','#camera-time-check']);
     if(!q||!found.length){
       const p=document.createElement('p');
       p.textContent=q?'没有匹配的词条，羊母仍未找到。':'输入关键词，搜索羊母宇宙。';
       results.append(p);
       return;
     }
     for(const [title,description,link] of found){
       const a=document.createElement('a');
       a.href=link;
       a.className='search-hit';
       const strong=document.createElement('strong');
       strong.textContent=title;
       const span=document.createElement('span');
       span.textContent=description;
       a.append(strong,span);
       results.append(a);
     }
   };
   const open=()=>{layer.hidden=false;input.value='';render();input.focus();};
   const close=()=>{layer.hidden=true;};
   $('openSearch').addEventListener('click',open);
   $('closeSearch')?.addEventListener('click',close);
   input.addEventListener('input',render);
   results.addEventListener('click',event=>{if(event.target.closest('a[href]'))close();});
   layer.addEventListener('click',e=>{if(e.target===layer)close()});
   document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='/'&&layer.hidden&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();open();}});
 }
 const button=$('observeButton');
 if(button){
   const anomaly=$('observationAnomaly');
   const anomalyInterval=13;
   const warnings={
     [anomalyInterval-2]: {value:'_',status:'观测完成 · 读数缺失',message:'检测结果：空白',remark:'读数栏已留空，原始记录仍在写入。'},
     [anomalyInterval-1]: {value:'▒?',status:'信号串入 · 校验失败',message:'检测结果：不可解析',remark:'无法解码末行。终端收到一帧不在本次采样中的影像。'}
   };
   const value=$('labReading'),status=$('labStatus'),message=$('labMessage');
   let count=0;
   try{const saved=Number(localStorage.getItem('ym_count')||0);if(Number.isSafeInteger(saved)&&saved>=0)count=saved}catch(_){}
   refreshReadout=()=>{
     const reading=currentPhase??warnings[count%anomalyInterval];
     if(value) value.textContent=reading?.value??'0';
     if(status) status.textContent=reading?.status??(count?'观测完成 · 未发现羊母':'系统就绪 · 等待观测');
     if(message) message.textContent=reading?.message??(count?'检测结果：未检出羊母':'羊母出现概率');
   };
   const display=()=>{
     if($('observeCount'))$('observeCount').textContent=String(count);
     if($('withdrawnNote'))$('withdrawnNote').hidden=count<7;
     refreshReadout();
   };
   anomaly?.addEventListener('close',()=>{
     phaseStart=Date.now();
     try{sessionStorage.setItem(storageKey,String(phaseStart));}catch(_){}
     advanceInterference();
   });
   const remarks=[
    '无信号。羊母的排场到了，本人依然没到。',
    '检测完成：只有空气。羊曦，你又给空箱贴了加急。',
    'CY 的自信已抵达现场，证据仍在路上。',
    '羊母派已提交说明：不是没有，是证据暂时不方便存在。',
    '仪器正常。羊曦，请别再拍打仪器。你母亲的出生栏一直是空的。',
    '章鱼哥的八个大脑已完成会诊：八个都没找到。',
    '田教授批注：这不是量子力学，这是你们的报告没写明白。',
    '羊曦申请重抄《零时之前》最后一页。退回原因：他把原件上的空白填了。',
    '羊母派的嘴还在运行，证据服务器仍然离线。',
    '观测结束：画面为空。走廊里的重力仪向同一方向偏了一格。'
   ];
   display();
   button.addEventListener('click',()=>{
     count++;
     try{localStorage.setItem('ym_count',String(count))}catch(_){}
     display();
     let remark=warnings[count%anomalyInterval]?.remark??remarks[(count-1)%remarks.length];
     if(count===7) remark+=' 第七次观测附页已解封。';
     if(count%anomalyInterval===0 && typeof anomaly?.showModal==='function'){
       anomaly.showModal();
       remark='异常帧已截获，仪器仍报告未检出实体。';
     }
     if($('labResult'))$('labResult').textContent=`第 ${count} 次观测 · ${remark}`;
   });
 }
 const buttons=[...document.querySelectorAll('[data-filter]')];
 const items=[...document.querySelectorAll('.video-item[data-type]')];
 if(buttons.length){
  buttons.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;let n=0;for(const el of items){const show=f==='all'||el.dataset.type===f;el.hidden=!show;if(show)n++;else el.querySelector('video')?.pause()}buttons.forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active))});if($('galleryCount'))$('galleryCount').textContent='共 '+n+' 条资料'}))
 }
 resumeInterference();
 window.addEventListener('pageshow',event=>{if(event.persisted) resumeInterference();});
})();

(() => {
  const register = document.querySelector('[data-register]');
  if (register) {
    const buttons = [...register.querySelectorAll('[data-copy-select]')];
    const copies = [...register.querySelectorAll('[data-copy]')];
    const showCopy = selected => {
      copies.forEach(copy => { copy.hidden = copy.dataset.copy !== selected; });
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.copySelect === selected));
      });
    };
    buttons.forEach(button => button.addEventListener('click', () => showCopy(button.dataset.copySelect)));
    showCopy('day');
    register.querySelector('.evidence-controls').hidden = false;
  }

  const monitor = document.querySelector('[data-monitor]');
  if (monitor) {
    const frames = [...monitor.querySelectorAll('[data-monitor-frame]')];
    const previous = monitor.querySelector('[data-frame-prev]');
    const next = monitor.querySelector('[data-frame-next]');
    const number = monitor.querySelector('[data-frame-number]');
    let frameIndex = 0;
    const showFrame = index => {
      frameIndex = index;
      frames.forEach((frame, i) => { frame.hidden = i !== frameIndex; });
      previous.disabled = frameIndex === 0;
      next.disabled = frameIndex === frames.length - 1;
      number.textContent = `${frameIndex + 1} / ${frames.length}`;
    };
    previous.addEventListener('click', () => showFrame(frameIndex - 1));
    next.addEventListener('click', () => showFrame(frameIndex + 1));
    showFrame(0);
    monitor.querySelector('.evidence-controls').hidden = false;
  }
})();
