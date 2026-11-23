
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const entries=[
 ['羊母（YM）','太初虚无，羊曦的母亲，从未诞生。','index.html#intro'],
 ['起源传说','《零时之前》据说由剑桥爸爸亲笔撰写，记载太初虚无、羊父奇点与羊父羊母大战。','index.html#origin'],
 ['基本性质','波粒二象性与绝对反观测。','index.html#abilities'],
 ['羊母空间异常档案','YM-013：后室失踪报告、模因污染与暗物质假说。','index.html#space-archive'],
 ['零号元素 Ym','Hydrogen 前的一格，四个零。羊母的残骸、虚无与宇宙膨胀。','index.html#element-ym'],
 ['夜间校务记录','羊曦、雾阶寄宿学院、失踪名册与复活计划。','index.html#academy-record'],
 ['羊母派与羊没派','羊曦的追随者与追查失踪者的羊没派。','index.html#factions'],
 ['相关人物','羊曦 YX、章翰峰、羊父、剑桥爸爸、章鱼哥等在卷人物。','index.html#characters'],
 ['档案员的恶意批注','退稿意见、吐槽、羊曦 YX 的空箱运单、退稿意见与羊母派经费申请。','index.html#annotations'],
 ['存在性实验','今天的观测结果仍然为零。','index.html#observation'],
 ['影像档案','YM 和 YX 的五段视频档案。','影像档案.html']
 ];
 const layer=$('searchLayer');
 if(layer && $('openSearch')){
   const input=$('siteSearch'),results=$('searchResults');
   const render=()=>{const q=input.value.trim().toLowerCase();results.replaceChildren();const found=entries.filter(e=>(e[0]+e[1]).toLowerCase().includes(q));if(!q||!found.length){const p=document.createElement('p');p.textContent=q?'没有匹配的词条，羊母仍未找到。':'输入关键词，搜索羊母宇宙。';results.append(p);return;}for(const e of found){const a=document.createElement('a');a.href=e[2];a.className='search-hit';const strong=document.createElement('strong');strong.textContent=e[0];const span=document.createElement('span');span.textContent=e[1];a.append(strong,span);results.append(a);}};
   const open=()=>{layer.hidden=false;input.value='';render();input.focus();};
   const close=()=>{layer.hidden=true;};
   $('openSearch').addEventListener('click',open);
   $('closeSearch')?.addEventListener('click',close);
   input.addEventListener('input',render);
   layer.addEventListener('click',e=>{if(e.target===layer)close()});
   document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='/'&&layer.hidden&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();open();}});
 }
 const button=$('observeButton');
 if(button){
   let count=0;
   try{const saved=Number(localStorage.getItem('ym_count')||0);if(Number.isSafeInteger(saved)&&saved>=0)count=saved}catch(_){}
   const display=()=>{if($('observeCount'))$('observeCount').textContent=String(count);if($('withdrawnNote'))$('withdrawnNote').hidden=count<7};
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
   button.addEventListener('click',()=>{count++;try{localStorage.setItem('ym_count',String(count))}catch(_){}display();if($('labStatus'))$('labStatus').textContent='观测完成 · 未发现羊母';if($('labMessage'))$('labMessage').textContent='检测结果：未检出羊母';if($('labResult'))$('labResult').textContent='第 '+count+' 次观测 · '+remarks[(count-1)%remarks.length]+(count===7?' 第七次观测附页已解封。':'');});
 }
 const buttons=[...document.querySelectorAll('[data-filter]')];
 const items=[...document.querySelectorAll('.video-item[data-type]')];
 if(buttons.length){
  buttons.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;let n=0;for(const el of items){const show=f==='all'||el.dataset.type===f;el.hidden=!show;if(show)n++;else el.querySelector('video')?.pause()}buttons.forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active))});if($('galleryCount'))$('galleryCount').textContent='共 '+n+' 条资料'}))
 }
})();


/* Media archive: restore exact original MP4 bytes from GitHub-safe chunks. */
(() => {
  const parts = {
    "YM视频.mp4": 2,
    "YX视频.mp4": 3,
    "YX视频2.mp4": 2,
    "视频2026-11-19_213352_750.mp4": 2
  };
  for (const video of document.querySelectorAll("video")) {
    const source = video.querySelector("source[src]");
    if (!source) continue;
    const path = source.getAttribute("src");
    const filename = path.split("/").pop();
    const count = parts[filename];
    if (!count) continue;
    source.removeAttribute("src");
    video.removeAttribute("src");
    video.preload = "none";
    video.load();
    let task;
    const prepare = () => {
      if (task) return task;
      task = Promise.all(Array.from({length: count}, async (_, index) => {
        const url = "media/chunks/" + encodeURIComponent(filename) + ".part" + index;
        const response = await fetch(url);
        if (!response.ok) throw new Error("视频片段载入失败: " + response.status);
        return response.arrayBuffer();
      })).then(buffers => {
        video.src = URL.createObjectURL(new Blob(buffers, {type: "video/mp4"}));
        video.load();
        return true;
      }).catch(error => {
        console.error(error);
        task = null;
        video.setAttribute("aria-label", "视频暂时无法载入，请刷新重试");
        return false;
      });
      return task;
    };
    video.addEventListener("pointerdown", () => {
      prepare().then(ok => { if (ok) video.play().catch(() => {}); });
    }, {once:true});
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          prepare();
        }
      }, {rootMargin: "320px"});
      observer.observe(video);
    } else {
      prepare();
    }
  }
})();
