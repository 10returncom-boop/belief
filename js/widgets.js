/* ============================================================
   互動元件總管 widgets.js
   accordion / tabs / tree-view / context-menu / fab / favorite /
   forms / lazy-load / tag-cloud / timeline / social / related /
   latest / email-protect / anti-copy / back-to-top(整合fab)
   ============================================================ */
(function(){
  "use strict";

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  /* ---------- 我的最愛 ---------- */
  var FAV_KEY="guji_favs";
  function getFavs(){ try{ return JSON.parse(localStorage.getItem(FAV_KEY))||[]; }catch(e){ return []; } }
  function setFavs(a){ try{ localStorage.setItem(FAV_KEY,JSON.stringify(a)); }catch(e){} }
  window.gujiFav = {
    is:function(id){ return getFavs().indexOf(id)>-1; },
    toggle:function(id){
      var a=getFavs();
      var i=a.indexOf(id);
      if(i>-1){ a.splice(i,1); } else { a.push(id); }
      setFavs(a); return a.indexOf(id)>-1;
    },
    list:function(){ return getFavs(); }
  };

  /* ---------- Accordion ---------- */
  function initAccordion(){
    document.querySelectorAll(".acc-item").forEach(function(item){
      var head=item.querySelector(".acc-head");
      if(!head||head.dataset.bound) return; head.dataset.bound="1";
      head.addEventListener("click",function(){ item.classList.toggle("open"); });
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs(){
    document.querySelectorAll("[data-tabs]").forEach(function(tabs){
      tabs.querySelectorAll(".tab-btn").forEach(function(btn){
        if(btn.dataset.bound) return; btn.dataset.bound="1";
        btn.addEventListener("click",function(){
          var tgt=btn.getAttribute("data-tab-target");
          tabs.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
          btn.classList.add("active");
          document.querySelectorAll("[data-tab-panel]").forEach(function(p){
            p.style.display = (p.getAttribute("data-tab-panel")===tgt) ? "block":"none";
          });
        });
      });
    });
  }

  /* ---------- Tree View ---------- */
  function initTree(){
    document.querySelectorAll(".tree-view .tree-toggle").forEach(function(tog){
      if(tog.dataset.bound) return; tog.dataset.bound="1";
      tog.addEventListener("click",function(){
        var node=tog.closest(".tree-node");
        if(node) node.classList.toggle("open");
      });
    });
  }
  window.gujiTree=initTree;

  /* ---------- Favorite 按鈕（data-fav） ---------- */
  function initFavoriteBtns(){
    document.querySelectorAll("[data-fav]").forEach(function(btn){
      if(btn.dataset.bound) return; btn.dataset.bound="1";
      var id=btn.getAttribute("data-fav");
      function refresh(){ btn.classList.toggle("faved",window.gujiFav.is(id)); btn.innerHTML=(window.gujiFav.is(id)?"♥ 已收藏":"♡ 收藏")+'<span class="fav-count"></span>'; }
      refresh();
      btn.addEventListener("click",function(){ window.gujiFav.toggle(id); refresh(); });
    });
  }
  window.gujiBindFav=initFavoriteBtns;

  /* ---------- Context Menu（自訂右鍵） ---------- */
  function initContextMenu(){
    var menu=document.getElementById("context-menu");
    if(!menu) return;
    document.addEventListener("contextmenu",function(e){
      // 僅在受保護區塊顯示自訂選單
      var t=e.target.closest("[data-context]");
      if(!t) return;
      e.preventDefault();
      var x=Math.min(e.clientX, window.innerWidth-180);
      var y=Math.min(e.clientY, window.innerHeight-menu.offsetHeight-8);
      menu.style.left=x+"px"; menu.style.top=y+"px"; menu.style.display="block";
      var page=t.closest("[data-page-url]");
      var url = page ? page.getAttribute("data-page-url") : location.href;
      var links=menu.querySelectorAll("a");
      if(links.length>=1){ links[0].onclick=function(e){e.preventDefault();window.open(url,"_blank");menu.style.display="none";}; }
      if(links.length>=2){ links[1].onclick=function(e){e.preventDefault();navigator.clipboard&&navigator.clipboard.writeText(url);menu.style.display="none";}; }
      if(links.length>=3){ links[2].onclick=function(e){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});menu.style.display="none";}; }
    });
    document.addEventListener("click",function(e){
      if(!e.target.closest("#context-menu")) menu.style.display="none";
    });
    window.addEventListener("scroll",function(){ menu.style.display="none"; });
  }

  /* ---------- FAB 浮動行動按鈕 ---------- */
  function initFab(){
    var group=document.getElementById("fab-group");
    if(!group) return;
    var top=document.getElementById("fab-top");
    var fav=document.getElementById("fab-fav");
    var share=document.getElementById("fab-share");
    if(top){ top.addEventListener("click",function(){ window.scrollTo({top:0,behavior:"smooth"}); }); }
    if(fav){ fav.addEventListener("click",function(){ location.href="dashboard.html?view=fav"; }); }
    if(share){
      share.addEventListener("click",function(){
        var url=location.href;
        if(navigator.share){ navigator.share({title:document.title,url:url}).catch(function(){}); }
        else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){ alert("已複製連結"); }); }
      });
    }
  }

  /* ---------- Back-to-top（與 fab 整合，舊按鈕保留） ---------- */
  function initBackTop(){
    var btn=document.getElementById("back-top");
    if(btn){
      function onS(){ if(window.scrollY>400){ btn.classList.add("show"); } else { btn.classList.remove("show"); } }
      window.addEventListener("scroll",onS); onS();
      btn.addEventListener("click",function(){ window.scrollTo({top:0,behavior:"smooth"}); });
    }
  }

  /* ---------- Lazy Load（IntersectionObserver） ---------- */
  function initLazy(){
    if(!("IntersectionObserver" in window)){ document.querySelectorAll(".lazy-section,img.lazy-img").forEach(function(el){el.classList.add("loaded");}); return; }
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("loaded"); io.unobserve(en.target); }
      });
    },{rootMargin:"80px"});
    document.querySelectorAll(".lazy-section,img.lazy-img").forEach(function(el){ io.observe(el); });
  }

  /* ---------- 表單（register/subscribe/email） ---------- */
  function initForms(){
    document.querySelectorAll("form[data-form]").forEach(function(form){
      if(form.dataset.bound) return; form.dataset.bound="1";
      var msg=form.querySelector("[data-form-msg]");
      form.addEventListener("submit",function(e){
        e.preventDefault();
        var firstErr=null;
        form.querySelectorAll("[required]").forEach(function(f){
          if(!f.value.trim()){ f.style.borderColor="var(--accent)"; if(!firstErr) firstErr=f; }
          else { f.style.borderColor=""; }
        });
        if(firstErr){ showMsg(msg,"請填寫必填欄位（標 * 者）。","err"); firstErr.focus(); return; }
        // 簡單 email 驗證
        var em=form.querySelector('input[type="email"]');
        if(em && em.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value)){
          showMsg(msg,"請輸入有效的 Email 格式。","err"); return;
        }
        var action=form.getAttribute("data-form");
        if(action==="subscribe"||action==="email"){
          showMsg(msg,"訂閱成功！感謝你的支持（範例：靜態站未接後端）。","ok");
        } else if(action==="register"){
          showMsg(msg,"註冊成功（範例：靜態站未接後端）。","ok");
        } else {
          showMsg(msg,"表單已送出（範例）。","ok");
        }
        form.reset();
      });
    });
    function showMsg(el,t,kind){ if(!el) return; el.className="form-msg "+kind; el.textContent=t; }
  }

  /* ---------- Email 保護（點擊顯示） ---------- */
  function initEmailProtect(){
    document.querySelectorAll("[data-email-protect]").forEach(function(el){
      if(el.dataset.bound) return; el.dataset.bound="1";
      var enc=el.getAttribute("data-email-protect"); // base64
      el.addEventListener("click",function(){
        try{ var em=atob(enc); el.textContent=em; el.removeAttribute("data-email-protect"); }catch(e){}
      });
    });
  }

  /* ---------- Anti-copy 防複製 ---------- */
  function initAntiCopy(){
    document.querySelectorAll(".anti-copy").forEach(function(el){
      if(el.dataset.bound) return; el.dataset.bound="1";
      el.addEventListener("copy",function(e){ e.preventDefault(); });
      el.addEventListener("cut",function(e){ e.preventDefault(); });
    });
  }

  /* ---------- 渲染：標籤雲 ---------- */
  window.renderTagCloud=function(el){
    if(!el) return;
    el.innerHTML=(window.GUJI_TAGS||[]).map(function(t){
      return '<a href="search.html?q='+encodeURIComponent(t.t)+'" class="s'+Math.min(5,Math.max(1,t.w))+'">'+esc(t.t)+'</a>';
    }).join("");
  };

  /* ---------- 渲染：時間軸 ---------- */
  window.renderTimeline=function(el){
    if(!el) return;
    el.innerHTML='<div class="timeline">'+(window.GUJI_TIMELINE||[]).map(function(it){
      return '<div class="tl-item"><span class="tl-dot"></span><div class="tl-date">'+esc(it.date)+'</div><div class="tl-title">'+esc(it.title)+'</div><div class="tl-desc">'+esc(it.desc)+'</div></div>';
    }).join("")+'</div>';
  };

  /* ---------- 渲染：社群 ---------- */
  window.renderSocial=function(el){
    if(!el) return;
    el.innerHTML='<div class="social-icons">'+(window.GUJI_SOCIAL||[]).map(function(s){
      return '<a href="'+esc(s.url)+'" aria-label="'+esc(s.label)+'" title="'+esc(s.label)+'">'+esc(s.icon)+'</a>';
    }).join("")+'</div>';
  };

  /* ---------- 渲染：最新書目 ---------- */
  window.renderLatest=function(el, n){
    if(!el) return;
    var books=(window.GUJI_BOOKS||[]).slice(0,n||5);
    el.innerHTML='<div class="latest-posts">'+books.map(function(b){
      return '<div class="lp-item"><div class="lp-cover">'+esc(b.title.slice(0,2))+'</div>'+
        '<div><a class="lp-title" href="book.html?b='+b.id+'">'+esc(b.title)+'</a>'+
        '<div class="lp-meta">'+(b.dynasty||"")+' · '+(b.sub||"")+'</div></div></div>';
    }).join("")+'</div>';
  };

  /* ---------- 渲染：相關書籍 ---------- */
  window.renderRelated=function(el, bookId, n){
    if(!el) return;
    var b=window.gujiBookById(bookId); if(!b){ el.innerHTML=''; return; }
    var rel=(window.GUJI_BOOKS||[]).filter(function(x){ return x.id!==bookId && (x.cat===b.cat||x.sub===b.sub); });
    var picks=rel.slice(0,n||3);
    el.innerHTML='<div class="related">'+(picks.length?picks.map(function(x){
      return '<div class="rel-card"><a class="t" href="book.html?b='+x.id+'">'+esc(x.title)+'</a><div class="m">'+(x.dynasty||"")+' · '+(x.sub||"")+'</div></div>';
    }).join(""):'<div class="empty" style="padding:12px;">暫無相關書籍</div>')+'</div>';
  };

  /* ---------- 渲染：我的最愛清單 ---------- */
  window.renderFavorites=function(el){
    if(!el) return;
    var ids=window.gujiFav.list();
    var books=(window.GUJI_BOOKS||[]).filter(function(x){ return ids.indexOf(x.id)>-1; });
    el.innerHTML= books.length
      ? '<div class="related">'+books.map(function(x){
          return '<div class="rel-card"><a class="t" href="book.html?b='+x.id+'">'+esc(x.title)+'</a><div class="m">'+(x.dynasty||"")+'</div></div>';
        }).join("")+'</div>'
      : '<div class="empty">尚未收藏任何書目。<br>在書籍頁點「♡ 收藏」即可加入。</div>';
  };

  /* ---------- 總入口 ---------- */
  window.initWidgets=function(){
    initAccordion(); initTabs(); initTree();
    initFavoriteBtns(); initContextMenu(); initFab(); initBackTop();
    initLazy(); initForms(); initEmailProtect(); initAntiCopy();
  };

  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",function(){ window.initWidgets(); }); }
  else{ window.initWidgets(); }
})();
