
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const phaseDuration=4000;
 const phases=[
   {name:'signal',title:'YM-0▉0｜信号回流',value:'█',status:'信号回流 · 同步失败',message:'检测结果：画面来源待核',glyphs:'▒░▉�',stride:2},
   {name:'registry',title:'YM-000｜观测席登记异常',value:'1',status:'名册更新 · 新增一条应答',message:'新增记录：当前观测席',glyphs:'□░▌',stride:3},
   {name:'recovery',title:'YM-000｜终端恢复',value:'0',status:'终端已复位 · 等待档案回执',message:'未撤回记录：1 条',glyphs:'_□·',stride:5}
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
 ['YM-000｜羊母','管制规程、异常描述、历代异称与羊曦母系假说。','index.html#intro'],
 ['附录 A｜起源文献','《零时之前》与剑桥爸爸、羊父奇点、大战及太初记载。','index.html#origin'],
 ['附录 A.1｜历代异文','古代文献、文人笔记与留声试录。历代称谓最初分别归档。','index.html#historical-records'],
 ['A.1-07｜合卷及定名记录','羊没派成员 N-17 首次提出关联假说并命名羊母。羊曦未表态。','index.html#naming-record'],
 ['古希腊｜《空室习题》','空室之母。六肘库房实测十二条边。','index.html#history-greek'],
 ['东晋｜《却扇斋杂记》','席下夫人。庾子衡清谈时坠入坐席。','index.html#history-jin'],
 ['中唐｜《宿东偏》','问儿妇。卢执素的驿站来信，各房的灯芯长度不一。','index.html#history-tang'],
 ['北宋｜《校书余牍》','无声母。许循对读时发现语音缺口，随后失踪。','index.html#history-song'],
 ['晚明｜《无院图》','隔院娘。沈简庵所绘水榭平面与修井账。','index.html#history-ming'],
 ['晚清｜翻译馆留声试录','无生之母。译员笔录及两支蜡筒中的语音缺口。','index.html#history-qing'],
 ['附录 A.2｜起源复核','《零时之前》附图、脐带状负形、旧产房登记与音轨。','index.html#origin-addenda'],
 ['A.2-01｜膜内与膜外','羊父排出物、破膜插图和纸背的刻度。','index.html#membrane-drawing'],
 ['A.2-02｜空箱留样','断层扫描、脐带状负形与搏动读数。','index.html#negative-cord'],
 ['A.2-03｜旧产房登记','同一册登记里有四次「首次诞生」。','index.html#delivery-register'],
 ['A.2-04｜双路心音','回收音轨里两组脉冲在床边交换远近。','index.html#delivery-audio'],
 ['附录 B｜性质与实验','基本性质、波粒二象性、真空传播与绝对反观测。','index.html#abilities'],
 ['YM-013｜羊母空间异常档案','后室、随机穿模、回收影像、模因污染与暗物质。','index.html#space-archive'],
 ['013-02｜三处穿模事件比对','现实切出，地点包括商场、旅馆和装卸坡道。','index.html#noclip-cases'],
 ['零号元素 Ym','氢前第 0 栏的记录。羊母残留与宇宙膨胀假说。','index.html#element-ym'],
 ['013-09｜离校记录核查','夜间校务、羊曦、学校、失踪名册与复活计划。','index.html#academy-record'],
 ['值班室存根','白天公示、夜间底稿、失物招领与监控抄录。','index.html#evidence-room'],
 ['附录 C｜相关组织','羊母派与羊没派，封条物证和名册保全密令。','index.html#factions'],
 ['附录 D｜人员索引','相关人物及代号：羊曦 YX、章翰峰、羊父、剑桥爸爸。','index.html#characters'],
 ['013-03｜拉莱耶文献比对','章翰峰、章鱼哥、克苏鲁之王。梦境地图及回收带中的门框。','index.html#cthulhu-archive'],
 ['013-04｜语音缺口与模因污染','羊母名称口述、两路录音与历代同类记载。','index.html#voice-gap-record'],
 ['013-10｜校务会纪要','共同经营学校、旧构件与零层钥匙。','index.html#school-management'],
 ['附录 C.1｜剑桥爸爸残片档案','两起残片聚合记录，愤怒和镜子各自发令。','index.html#cambridge-fragments'],
 ['剑桥爸爸的愤怒','回收残片、战前记忆及门框封存令。','index.html#cambridge-anger'],
 ['剑桥爸爸的镜子','受污染的残片、独立声明与签名比对。','index.html#cambridge-mirror'],
 ['附录 E｜校务核查与证词','学生意见、设备收存、食堂 35 元、旧喷泉广场篮球场与前任校长。','index.html#student-notes'],
 ['审阅意见与退件记录','档案批注、CY 笔录、羊母派申请及田教授退稿。','index.html#archive-notes'],
 ['附录 F｜观测终端','存在性实验、采样读数与第七次观测日志。','index.html#observation'],
 ['附录 G｜影音证物目录','影像档案，YM 原件及 YX 行为艺术送审件。','影像档案.html'],
 ['补录影像','值班室接收的第 006 至 010 号证物。','影像档案.html#supplemental-footage']
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
       p.textContent=q?'索引中无匹配记录。':'输入编号或关键词以调阅档案。';
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
   const scream=$('observationScream');
   const anomalyInterval=13;
   const warnings={
     [anomalyInterval-2]: {value:'_',status:'采样完成 · 数值字段缺失',message:'结果字段为空',remark:'写入完成。数值占位符无对应原始读数。'},
     [anomalyInterval-1]: {value:'▒?',status:'信号混入 · 校验失败',message:'结果未通过格式校验',remark:'末行解码失败。缓存帧的时间戳早于本轮采样。'}
   };
   const value=$('labReading'),status=$('labStatus'),message=$('labMessage');
   let count=0;
   try{const saved=Number(localStorage.getItem('ym_count')||0);if(Number.isSafeInteger(saved)&&saved>=0)count=saved}catch(_){}
   refreshReadout=()=>{
     const reading=currentPhase??warnings[count%anomalyInterval];
     if(value) value.textContent=reading?.value??'0';
     if(status) status.textContent=reading?.status??(count?'采样完成 · 无实体检出':'待机 · 等待采样');
     if(message) message.textContent=reading?.message??(count?'结果：未检出 YM-000':'有效实体检出率');
   };
   const display=()=>{
     if($('observeCount'))$('observeCount').textContent=String(count);
     if($('withdrawnNote'))$('withdrawnNote').hidden=count<7;
     refreshReadout();
   };
   anomaly?.addEventListener('close',()=>{
     if(scream){
       scream.pause();
       scream.currentTime=0;
     }
     phaseStart=Date.now();
     try{sessionStorage.setItem(storageKey,String(phaseStart));}catch(_){}
     advanceInterference();
   });
   const remarks=[
    '空样已保存。记录中无可辨识目标。',
    '空箱移交单已录入。箱内成像无可见物。',
    'CY 目击笔录尚未核准。终端读数维持零。',
    '第三份复核申请未附证物。已登记退回。',
    '仪器校准通过。亲属簿「母」栏未写入。',
    'ZHF 会审结束。出席人数一，表决记录八。',
    '对照组读数已归档。对应退件可供调阅。',
    '《零时之前》末页补抄件退回。原缺口宽度不得修改。',
    '备用通道离线。只读缓冲区仍收到一条应答。',
    '画面无目标。仪器已完成归零，空箱方向仍有一格偏移。'
   ];
   display();
   button.addEventListener('click',()=>{
     count++;
     try{localStorage.setItem('ym_count',String(count))}catch(_){}
     display();
     let remark=warnings[count%anomalyInterval]?.remark??remarks[(count-1)%remarks.length];
     if(count===7) remark+=' 观测日志 F-07 已开放调阅。';
     if(count%anomalyInterval===0 && typeof anomaly?.showModal==='function'){
       anomaly.showModal();
       // Keep playback in the click handler for browsers that require a user gesture.
       scream?.play().catch(()=>{});
       remark='异常帧及音轨已保存。实体检出数维持零。';
     }
     if($('labResult'))$('labResult').textContent=`采样 ${count} · ${remark}`;
   });
 }
 const buttons=[...document.querySelectorAll('[data-filter]')];
 const items=[...document.querySelectorAll('.video-item[data-type]')];
 if(buttons.length){
  buttons.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;let n=0;for(const el of items){const show=f==='all'||el.dataset.type===f;el.hidden=!show;if(show)n++;else el.querySelector('video')?.pause()}buttons.forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active))});if($('galleryCount'))$('galleryCount').textContent='列出 '+n+' 件'}))
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
