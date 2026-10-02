/* ============================================================
   書庫目錄（十藏分類瀏覽 + 子類篩選 + 分頁 + 三種檢視：卡片/清單/樹狀）
   ============================================================ */
(function(){
  "use strict";
  var PER=9;
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function viewTabs(catId,sub,view){
    var v=["card","list","tree"].map(function(vk){
      var lbl = vk==="card"?"卡片":(vk==="list"?"清單":"樹狀");
      var href="catalog.html?"+qs(catId,sub,1,vk);
      return '<button class="tab-btn'+(vk===view?" active":"")+'" onclick="location.href=\''+href+'\'">'+lbl+'</button>';
    }).join("");
    return '<div class="tabs" data-tabs><span style="font-size:13px;color:var(--text-soft);margin-right:6px;">檢視：</span>'+v+'</div>';
  }

  window.initCatalogPage = function(){
    var wrap=document.getElementById("catalog");
    if(!wrap) return;
    var params=new URLSearchParams(location.search);
    var catId=params.get("cat")||"";
    var sub=params.get("sub")||"";
    var page=parseInt(params.get("p")||"1",10)||1;
    var view=params.get("view")||"card";
    var books=window.gujiAllBooks();
    var cats=window.GUJI_CATS;

    var filtered=books;
    if(catId){ filtered=filtered.filter(function(b){return b.cat===catId;}); }
    if(sub){ filtered=filtered.filter(function(b){return b.sub===sub;}); }

    // 麵包屑
    var crumbs=[{text:"書庫目錄",url:"catalog.html"}];
    if(catId){ var c=window.gujiCatById(catId); if(c){ crumbs.push({text:c.name,url:"catalog.html?cat="+catId}); } }
    if(sub){ crumbs.push(sub); }
    window.renderBreadcrumb(crumbs);

    // 子類篩選 chips
    var filterHtml='';
    if(catId){
      var cc=window.gujiCatById(catId);
      filterHtml='<div class="filters">'+
        '<button class="chip'+(sub?"":" active")+'" onclick="location.href=\'catalog.html?'+qs(catId,"",1,view)+'\'">全部 <span class="n">'+cc.count+'</span></button>';
      cc.subs.forEach(function(s){
        var act = (sub===s.name)?" active":"";
        filterHtml+='<button class="chip'+act+'" onclick="location.href=\'catalog.html?'+qs(catId,s.name,1,view)+'\'">'+esc(s.name)+' <span class="n">'+s.count+'</span></button>';
      });
      filterHtml+='</div>';
    } else {
      filterHtml='<div class="notice info">目前收錄 <b>'+books.length+'</b> 本代表性示意書目；完整 '+window.gujiTotal+' 部將於 TXT 匯入後上線。</div>';
    }

    // 十藏總覽網格（未指定藏別且為卡片/清單檢視時置頂）
    var gridHtml='';
    if(!catId && view!=="tree"){
      gridHtml='<h2 class="sec">十藏分類</h2><div class="cat-grid">';
      cats.forEach(function(c){
        gridHtml+=
          '<a class="cat-card hover-lift" data-context data-page-url="catalog.html?cat='+c.id+'" href="catalog.html?cat='+c.id+'">'+
            '<div class="cname">'+esc(c.name)+'</div>'+
            '<div class="cnum">'+c.count+' 部</div>'+
            '<div class="cdesc">'+esc(c.desc)+'</div>'+
          '</a>';
      });
      gridHtml+='</div>';
    }

    // ---- 三種檢視內容 ----
    var bodyHtml='';
    if(view==="tree"){
      // 樹狀：十藏 → 子類 → 深層分部（遞迴）
      function renderSubs(subs, catId, leafPrefix){
        return (subs||[]).map(function(s){
          if(s.children && s.children.length){
            return '<div class="tree-node"><div class="tree-row">'+
              '<span class="tree-toggle closed"></span>'+
              '<a class="tree-label" href="catalog.html?cat='+catId+'&sub='+encodeURIComponent(s.name)+'&view=card">'+esc(s.name)+'</a>'+
              '<span class="tree-count">'+s.count+' 部</span></div>'+
              '<div class="tree-children">'+renderSubs(s.children,catId,true)+'</div></div>';
          }
          return '<div class="tree-node"><div class="tree-row">'+
            '<a class="tree-label" href="catalog.html?cat='+catId+'&sub='+encodeURIComponent(s.name)+'&view=card">'+esc(s.name)+'</a>'+
            '<span class="tree-count">'+s.count+' 部</span></div></div>';
        }).join("");
      }
      var tree='<div class="tree-view">';
      cats.forEach(function(c){
        tree+='<div class="tree-node open"><div class="tree-row">'+
          '<span class="tree-toggle closed"></span>'+
          '<a class="tree-label" href="catalog.html?cat='+c.id+'&view=card">'+esc(c.name)+'</a>'+
          '<span class="tree-count">'+c.count+' 部</span></div>'+
          '<div class="tree-children">'+renderSubs(c.subs,c.id,false)+'</div></div>';
      });
      tree+='</div>';
      bodyHtml=tree;
    } else if(view==="list"){
      // 清單：表格
      if(!filtered.length){ bodyHtml='<div class="empty">此分類暫無書目。</div>'; }
      else {
        bodyHtml='<table class="data" style="margin-bottom:16px;"><thead><tr><th>書名</th><th>作者</th><th>朝代</th><th>子類</th></tr></thead><tbody>';
        filtered.forEach(function(b){
          bodyHtml+='<tr><td><a href="book.html?b='+b.id+'">'+esc(b.title)+'</a>'+(b.demo?' <span class="tag demo">示意</span>':"")+'</td>'+
            '<td>'+esc(b.author||"")+'</td><td>'+esc(b.dynasty||"")+'</td><td>'+esc(b.sub||"")+'</td></tr>';
        });
        bodyHtml+='</tbody></table>';
      }
    } else {
      // 卡片（預設）
      var total=filtered.length;
      var pages=Math.max(1,Math.ceil(total/PER));
      page=Math.min(page,pages);
      var start=(page-1)*PER;
      var slice=filtered.slice(start,start+PER);
      if(!slice.length){ bodyHtml='<div class="empty">此分類暫無書目。</div>'; }
      slice.forEach(function(b){
        bodyHtml+=
          '<div class="book-item hover-lift" data-context data-page-url="book.html?b='+b.id+'">'+
            '<div class="b-cover">'+esc(b.title.slice(0,2))+'</div>'+
            '<div class="b-main">'+
              '<a class="b-title" href="book.html?b='+b.id+'">'+esc(b.title)+(b.demo?' <span class="tag demo">示意</span>':"")+'</a>'+
              '<div class="b-meta">'+(b.author||"")+' · '+(b.dynasty||"")+'</div>'+
              '<div class="b-desc">'+esc(b.desc||"")+'</div>'+
            '</div>'+
          '</div>';
      });
      // 分頁導航
      if(pages>1){
        bodyHtml+='<div class="pagination"><span class="info">第 '+page+' / '+pages+' 頁 · 共 '+total+' 筆</span>';
        if(page>1){ bodyHtml+='<button onclick="location.href=\'catalog.html?'+qs(catId,sub,page-1,view)+'\'">‹ 上一頁</button>'; }
        for(var i=1;i<=pages;i++){
          bodyHtml+='<button class="page-num'+(i===page?" active":"")+'" onclick="location.href=\'catalog.html?'+qs(catId,sub,i,view)+'\'">'+i+'</button>';
        }
        if(page<pages){ bodyHtml+='<button onclick="location.href=\'catalog.html?'+qs(catId,sub,page+1,view)+'\'">下一頁 ›</button>'; }
        bodyHtml+='</div>';
      }
    }

    wrap.innerHTML =
      '<h1 class="page-title">'+(catId&&window.gujiCatById(catId)?window.gujiCatById(catId).full:"書庫目錄")+'</h1>'+
      '<div class="page-sub">共 '+filtered.length+' 筆書目'+(catId?'':'（十藏全庫 '+window.gujiTotal+' 部）')+'</div>'+
      gridHtml+filterHtml+viewTabs(catId,sub,view)+bodyHtml;

    // 樹狀檢視需初始化摺疊
    if(view==="tree" && window.gujiTree){ window.gujiTree(); }
  };

  function qs(catId,sub,page,view){
    var p=[];
    if(catId) p.push("cat="+encodeURIComponent(catId));
    if(sub) p.push("sub="+encodeURIComponent(sub));
    if(page>1) p.push("p="+page);
    if(view&&view!=="card") p.push("view="+view);
    return p.join("&");
  }
})();
