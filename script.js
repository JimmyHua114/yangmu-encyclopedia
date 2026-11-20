
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const entries=[
 ['羊母（YM）','一种因其不存在而广为人知的不存在物。','index.html#intro'],
 ['起源传说','羊父羊母大战与羊母空间计划。','index.html#origin'],
 ['基本性质','波粒二象性与绝对反观测。','index.html#abilities'],
 ['羊母派与羊没派','关于不存在的派系之争。','index.html#factions'],
 ['相关人物','YX、羊父、章鱼哥等虚构人物。','index.html#characters'],
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
   try{count=Number(localStorage.getItem('ym_count')||0)}catch(_){}
   const display=()=>{if($('observeCount'))$('observeCount').textContent=String(count)};
   display();
   button.addEventListener('click',()=>{count++;try{localStorage.setItem('ym_count',String(count))}catch(_){}display();if($('labStatus'))$('labStatus').textContent='观测完成 · 未发现羊母';if($('labMessage'))$('labMessage').textContent='检测结果：羊母不存在';if($('labResult'))$('labResult').textContent=['无信号。羊母不存在。','第 '+count+' 次实验成功证明：仍然没有羊母。','空白非常稳定，羊母依旧不存在。'][count%3];});
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
