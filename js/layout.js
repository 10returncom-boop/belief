/* ============================================================
   版面 Layout + UI（Header/Footer/Breadcrumb/浮動返回/下拉/行動選單/站內導覽）
   全站共用，由 layout.js 單一來源渲染，改一處全站生效
   ============================================================ */
(function(){
  "use strict";

  /* ---------- Header 渲染 ---------- */
  window.renderHeader = function(active){
    var cats = window.GUJI_CATS||[];
    var dropItems = cats.map(function(c){
      var subs = (c.subs||[]).map(function(s){
        return '<a class="drop-sub" href="catalog.html?cat='+c.id+'&sub='+encodeURIComponent(s.name)+'">'+s.name+'<span class="cat-num">'+s.count+' 部</span></a>';
      }).join("");
      return '<div class="drop-group">'+
        '<a class="drop-cat" href="catalog.html?cat='+c.id+'">'+c.name+'<span class="cat-num">'+c.count+' 部</span></a>'+
        subs+
      '</div>';
    }).join("");
    var mobileSub = cats.map(function(c){
      var subs = (c.subs||[]).map(function(s){
        return '<a class="sub2" href="catalog.html?cat='+c.id+'&sub='+encodeURIComponent(s.name)+'">'+s.name+'（'+s.count+'）</a>';
      }).join("");
      return '<a class="sub" href="catalog.html?cat='+c.id+'">'+c.name+'（'+c.count+' 部）</a>'+subs;
    }).join("");

    var nav = [
      {href:"index.html", label:"首頁"},
      {href:"catalog.html", label:"書庫目錄"},
      {href:"search.html", label:"全文檢索"},
      {href:"dashboard.html", label:"儀表板"},
      {href:"contact.html", label:"訂閱聯絡"},
      {href:"about.html", label:"關於"},
      {href:"sitemap.html", label:"地圖"}
    ];
    var navHtml = nav.map(function(n){
      var cls = (active===n.label) ? ' style="background:rgba(255,255,255,.18);"' : "";
      return '<a href="'+n.href+'"'+cls+'>'+n.label+'</a>';
    }).join("");

    var el = document.getElementById("site-header");
    if(!el) return;
    el.innerHTML =
      '<div class="container topbar">'+
        '<button class="hamburger" data-hamburger aria-label="開啟選單">☰</button>'+
        '<a class="brand" href="index.html">古籍知識庫<small>Ancient Chinese Book Library</small></a>'+
        '<div class="top-actions">'+
          '<form class="searchbox" action="search.html" method="get">'+
            '<input type="text" name="q" placeholder="搜尋全文…" aria-label="全文檢索">'+
            '<button type="submit" aria-label="搜尋">🔍</button>'+
          '</form>'+
          '<button class="icon-btn" data-theme-toggle aria-label="切換主題">☾</button>'+
        '</div>'+
      '</div>'+
      '<nav class="main-nav"><div class="container nav-inner">'+
        navHtml+
        '<div class="drop"><a class="drop-label">十藏分類 ▾</a><div class="drop-menu"><div class="drop-grid">'+dropItems+'</div></div></div>'+
      '</div></nav>'+
      '<nav class="mobile-nav">'+navHtml+
        '<a class="sub" href="catalog.html">— 十藏分類 —</a>'+mobileSub+
      '</nav>';
  };

  /* ---------- Footer 渲染 ---------- */
  window.renderFooter = function(){
    var el = document.getElementById("site-footer");
    if(!el) return;
    var cats = window.GUJI_CATS||[];
    var catLinks = cats.map(function(c){
      return '<a href="catalog.html?cat='+c.id+'">'+c.name+'（'+c.count+' 部）</a>';
    }).join("");
    el.innerHTML =
      '<div class="container">'+
        '<div class="footer-grid">'+
          '<div><h4>古籍知識庫</h4>'+
            '<a href="index.html">首頁</a><a href="about.html">關於與授權</a><a href="sitemap.html">網站地圖</a></div>'+
          '<div><h4>十藏分類</h4>'+catLinks+'</div>'+
          '<div><h4>功能</h4>'+
            '<a href="catalog.html">書庫目錄</a><a href="search.html">全文檢索</a><a href="dashboard.html">儀表板</a><a href="contact.html">訂閱與聯絡</a></div>'+
          '<div><h4>開放精神</h4>'+
            '<span style="font-size:13px;opacity:.8;">免費公開知識庫<br>內容屬公有領域，整理成果採 CC BY-NC 授權</span></div>'+
        '</div>'+
        '<div class="footer-bottom">© 2026 古籍知識庫 · 十藏 · 約 13,331 部 · 免費公開與捐贈典藏<br>'+
          '<span style="opacity:.8;font-weight:500;">規劃設計開發：張書欣 · 331.today</span></div>'+
      '</div>';
  };

  /* ---------- 麵包屑 ---------- */
  /* items: [{text,url}] 或 ["純文字"] */
  window.renderBreadcrumb = function(items){
    var el = document.getElementById("breadcrumb");
    if(!el) return;
    var html = '<a href="index.html">首頁</a>';
    items.forEach(function(it,i){
      html += '<span class="sep">›</span>';
      if(typeof it==="string"){ html += '<span>'+it+'</span>'; }
      else if(it.url){ html += '<a href="'+it.url+'">'+it.text+'</a>'; }
      else { html += '<span>'+it.text+'</span>'; }
    });
    el.innerHTML = html;
  };

  /* ---------- 浮動返回 + 行動選單 + 站內導覽 ---------- */
  function initUI(){
    // 主題切換按鈕（Header 由 JS 渲染，需在此重新綁定）
    if(window.gujiTheme){ window.gujiTheme.bind(); }
    // 浮動返回
    var bt = document.getElementById("back-top");
    if(bt){
      function onScroll(){ if(window.scrollY>400){ bt.classList.add("show"); } else { bt.classList.remove("show"); } }
      window.addEventListener("scroll",onScroll); onScroll();
      bt.addEventListener("click",function(){ window.scrollTo({top:0,behavior:"smooth"}); });
    }
    // 行動選單
    var ham = document.querySelector("[data-hamburger]");
    var mob = document.querySelector(".mobile-nav");
    if(ham && mob){
      ham.addEventListener("click",function(){ mob.style.display = (mob.style.display==="block")?"none":"block"; });
    }
    // 下拉（觸控補強）
    document.querySelectorAll(".main-nav .drop").forEach(function(d){
      d.querySelector(".drop-label").addEventListener("click",function(e){
        e.preventDefault();
        var open = d.classList.contains("open");
        document.querySelectorAll(".main-nav .drop").forEach(function(x){x.classList.remove("open");});
        if(!open){ d.classList.add("open"); }
      });
    });
    // 點擊外部關閉下拉/行動選單
    document.addEventListener("click",function(e){
      if(!e.target.closest(".main-nav .drop")){
        document.querySelectorAll(".main-nav .drop").forEach(function(x){x.classList.remove("open");});
      }
      if(!e.target.closest(".hamburger") && !e.target.closest(".mobile-nav") && mob){
        mob.style.display="none";
      }
    });
  }

  /* ---------- 側欄（十藏快速導覽） ---------- */
  window.renderSidebar = function(){
    var el = document.getElementById("sidebar");
    if(!el) return;
    var cats = window.GUJI_CATS||[];
    var html =
      '<div class="panel"><h3>十藏分類</h3>'+
      cats.map(function(c){
        return '<a href="catalog.html?cat='+c.id+'">'+c.name+'<span class="num">'+c.count+' 部</span></a>';
      }).join("")+
      '</div>'+
      '<div class="panel"><h3>快速功能</h3>'+
        '<a href="search.html">🔍 全文檢索</a>'+
        '<a href="book.html?b=周易-5">📖 線上閱讀</a>'+
        '<a href="dashboard.html">📊 儀表板</a>'+
        '<a href="sitemap.html">🗺 網站地圖</a>'+
      '</div>'+
      '<div class="panel"><h3>開放說明</h3>'+
        '<span style="font-size:12px;color:var(--text-soft);">免費公開知識庫<br>十藏全庫<br>約 13,331 部</span>'+
      '</div>';
    el.innerHTML = html;
  };

  /* ---------- 共用初始化 ---------- */
  window.initLayout = function(active){
    renderHeader(active);
    renderFooter();
    renderSidebar();
    initUI();
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){ if(window.__layoutInit) window.__layoutInit(); });
  }
})();
