/* ============================================================
   全文檢索（前端靜態版）
   - 索引範圍：書名/作者/朝代/描述/章節內文
   - 純靜態起步方案；真實 13,331 部匯入後可換 Meilisearch/SQLite FTS5
   ============================================================ */
(function(){
  "use strict";

  window.gujiSearch = function(query){
    query=(query||"").trim().toLowerCase();
    var books = window.GUJI_BOOKS||[];
    if(!query) return [];
    var out=[];
    books.forEach(function(b){
      var fields = [b.title,b.author,b.dynasty,b.desc,(b.sub||"")].join(" ").toLowerCase();
      var inMeta = fields.indexOf(query)>-1;
      // 章節內文
      var chapHit=null;
      (b.chapters||[]).forEach(function(ch){
        ch.ps.forEach(function(p){
          if(chapHit) return;
          if(p.toLowerCase().indexOf(query)>-1){ chapHit={ch:ch.t, p:p}; }
        });
      });
      if(inMeta || chapHit){
        out.push({book:b, inMeta:inMeta, chapHit:chapHit});
      }
    });
    return out;
  };

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function highlight(s,q){
    s=esc(s); if(!q) return s;
    var re=new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","gi");
    return s.replace(re,"<mark>$1</mark>");
  }

  window.renderSearch = function(query, results, containerId){
    var c=document.getElementById(containerId||"search-results");
    if(!c) return;
    if(!query){
      c.innerHTML='<div class="empty">請輸入關鍵字開始全文檢索。</div>';
      return;
    }
    if(!results.length){
      c.innerHTML='<div class="empty">「'+esc(query)+'」未找到結果。<br>目前僅收錄範例示意書目。</div>';
      return;
    }
    var html='<div class="card" style="margin-bottom:14px;font-size:14px;">找到 <b>'+results.length+'</b> 筆相關結果（範例示意庫）</div>';
    results.forEach(function(r){
      var b=r.book; var cat=window.gujiCatById(b.cat);
      var snip = r.chapHit
        ? highlight(r.chapHit.p, query)
        : (b.desc?highlight(b.desc,query):"");
      html+=
        '<div class="result-item">'+
          '<div class="r-title"><a href="book.html?b='+b.id+'">'+highlight(b.title,query)+'</a></div>'+
          '<div class="r-meta" style="font-size:12px;color:var(--text-soft);">'+
            (cat?cat.name:"")+' › '+(b.sub||"")+' · '+(b.author||"")+' · '+(b.dynasty||"")+
            (b.demo?' <span class="tag demo">示意</span>':"")+
          '</div>'+
          '<div class="r-snippet">'+(snip||"")+
            (r.chapHit?' <span style="font-size:11px;color:var(--text-soft);">（節自 '+esc(r.chapHit.ch)+'）</span>':"")+
          '</div>'+
        '</div>';
    });
    c.innerHTML=html;
  };

  /* 搜尋頁掛載：讀取 ?q= 並執行 */
  window.initSearchPage = function(){
    var params=new URLSearchParams(location.search);
    var q=params.get("q")||"";
    var input=document.getElementById("search-input");
    var go=document.getElementById("search-go");
    if(input){ input.value=q; }
    if(input && go){
      function run(){ var v=input.value.trim(); location.href="search.html?q="+encodeURIComponent(v); }
      go.addEventListener("click",run);
      input.addEventListener("keydown",function(e){ if(e.key==="Enter"){e.preventDefault();run();} });
    }
    if(q){
      // 伺服器模式 → 全文內容檢索（SQLite FTS5）
      if(location.protocol==="http:"||location.protocol==="https:"){
        fetch("/api/fullsearch?q="+encodeURIComponent(q))
          .then(function(r){ return r.json(); })
          .then(function(data){ window.renderFullResults(q, data, "search-results"); })
          .catch(function(){ window.renderSearch(q, window.gujiSearch(q), "search-results"); });
      } else {
        window.renderSearch(q, window.gujiSearch(q), "search-results");
      }
    }
    else if(input){ input.focus(); }
  };

  /* 伺服器全文檢索結果渲染（FTS5，含高亮片段） */
  window.renderFullResults = function(query, data, containerId){
    var c=document.getElementById(containerId||"search-results");
    if(!c) return;
    if(!data || !data.results || !data.results.length){
      c.innerHTML='<div class="card"><div class="empty">「'+esc(query)+'」全文檢索未找到結果。</div></div>';
      return;
    }
    var total=data.total||data.results.length;
    var html='<div class="card" style="margin-bottom:14px;font-size:14px;">全文檢索「<b>'+esc(query)+'</b>」共 <b>'+total+'</b> 部命中，顯示前 '+data.results.length+' 部</div>';
    data.results.forEach(function(b){
      var cat=window.gujiCatById(b.cat);
      html+=
        '<div class="result-item">'+
          '<div class="r-title"><a href="book.html?b='+b.id+'">'+esc(b.title)+'</a></div>'+
          '<div class="r-meta" style="font-size:12px;color:var(--text-soft);">'+
            (cat?cat.name:"")+' › '+(b.sub||"")+' · '+(b.author||"")+' · '+(b.dynasty||"")+
          '</div>'+
          '<div class="r-snippet">'+(b.snippet||"")+'</div>'+
        '</div>';
    });
    c.innerHTML=html;
  };
})();
