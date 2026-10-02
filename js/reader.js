/* ============================================================
   線上閱讀 + 章節目錄
   - 讀取 ?b=id 顯示書籍詳情、章節目錄、正文（可切換章節）
   - 真實全庫書籍（book.real）經 /texts/ 抓取全文並解析章節
   - 若以 file:// 開啟（無伺服器），顯示提示改用 serve.py
   ============================================================ */
(function(){
  "use strict";

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function parseChapters(raw){
    var lines=raw.split(/\r?\n/);
    var chs=[], cur=null;
    // 章節標題識別（容忍開頭裝飾符號）：
    //   卷X／卷第一／上中下卷／第一章／N章（一章）／第X回／NN．
    function headerOf(ln){
      var t=ln.replace(/^\s+|\s+$/g,"");
      if(!t) return null;
      t=t.replace(/^[●○◆◇▪□■△▽▲▶〔〖【《＜〈·*★☆\u3000]+/,"");
      t=t.replace(/^\s+|\s+$/g,"");
      if(!t) return null;
      var m=t.match(/^(?:卷\s*(?:之\s*|第\s*)?[〇○零一二三四五六七八九十百千0-9]+|[上中下]卷|第\s*[〇○零一二三四五六七八九十百千0-9]+\s*[章节回卷部篇目集]|[〇○零一二三四五六七八九十百千0-9]+\s*[章节回]|[0-9]{1,4}\s*[、.．])[\s、．。:：·\-—]*([\s\S]*)$/);
      if(m){
        var title=(m[1]||"").replace(/^\s+|\s+$/g,"");
        // 標題過長＝該行是正文而非章節標題（如「卷一　＜長段正文＞」），排除
        if(title.length>40) return null;
        return title || t;
      }
      return null;
    }
    lines.forEach(function(ln){
      var h=headerOf(ln);
      if(h!==null){
        if(cur) chs.push(cur);
        cur={t:h, ps:[]};
      } else if(cur && ln.trim()){
        cur.ps.push(ln.trim());
      }
    });
    if(cur) chs.push(cur);
    if(!chs.length){
      var ps=raw.split(/\n\s*\n/).map(function(p){return p.replace(/\s+/g," ").trim();}).filter(Boolean);
      chs=[{t:"全文", ps:ps.length?ps:[raw.trim()]}];
    }
    return chs;
  }

  window.initReaderPage = function(){
    var wrap=document.getElementById("reader");
    if(!wrap) return;
    var params=new URLSearchParams(location.search);
    var id=params.get("b")||"";
    var book=id?window.gujiBookById(id):null;
    if(!book){
      wrap.innerHTML='<div class="card"><div class="empty">找不到此書（id='+esc(id)+'）。</div></div>';
      return;
    }
    var cat=window.gujiCatById(book.cat);
    window.renderBreadcrumb([
      {text:cat?cat.name:"分類", url:"catalog.html?cat="+(cat?cat.id:"")},
      {text:(book.sub||""), url:"catalog.html?cat="+(cat?cat.id:"")},
      book.title
    ]);

    var idx=0;
    var chs=(book.chapters&&book.chapters.length)?book.chapters.slice():[];
    var state={book:book, cat:cat, chs:chs, idx:idx, loading:false, realFail:false};

    function tocHtml(){
      return '<div class="toc-list">'+state.chs.map(function(ch,i){
        return '<a href="#" data-ch="'+i+'" class="'+(i===state.idx?"active":"")+'">'+esc(ch.t)+'</a>';
      }).join("")+'</div>';
    }
    function textHtml(){
      if(state.loading){
        return '<p style="text-align:center;color:var(--text-soft);padding:24px 0;">正在載入全文…</p>';
      }
      if(!state.chs.length){
        if(book.real && book.file && state.realFail){
          return '<div class="notice" style="margin:18px 0;">無法讀取全文：<code style="word-break:break-all;">'+esc(book.file)+'</code><br>'+
                 '線上閱讀需以本機伺服器開啟。請在 <code>D:\\www\\guji-library</code> 執行 <code>python serve.py</code>，再用瀏覽器開啟 <code>http://127.0.0.1:8000</code>。</div>';
        }
        return '<p style="text-align:center;color:var(--text-soft);padding:24px 0;">本書尚無章節內容。</p>';
      }
      return state.chs[state.idx].ps.map(function(p){return '<p>'+esc(p)+'</p>';}).join("");
    }
    function render(){
      var b=state.book;
      wrap.innerHTML=
        '<div class="card" style="margin-bottom:14px;">'+
          '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;">'+
            '<div style="flex:1 1 auto;min-width:200px;">'+
              '<div style="font-family:var(--font-serif);font-size:26px;">'+esc(b.title)+'</div>'+
              '<div style="font-size:13px;color:var(--text-soft);margin-top:4px;">'+
                (b.author||"")+' · '+(b.dynasty||"")+' · '+(cat?cat.name:"")+' › '+(b.sub||"")+
                (b.demo?' <span class="tag demo">範例示意</span>':"")+
                (b.real?' <span class="tag" style="background:var(--primary);color:#fff;">真實全文</span>':"")+
              '</div>'+
              '<div style="font-size:13px;color:var(--text-soft);margin-top:6px;">'+(b.desc||"")+'</div>'+
            '</div>'+
            '<div style="flex:0 0 auto;"><button class="fav-btn" data-fav="'+b.id+'" aria-label="收藏">♡ 收藏</button></div>'+
          '</div>'+
          (b.demo?'<div class="notice">此為範例示意內容（公有領域節錄）。</div>':"")+
        '</div>'+
        '<div class="reader-card">'+
          '<h1>'+esc(b.title)+'</h1>'+
          '<div class="reader-meta">'+esc(b.real?(b.source||"殆知閣公版文本") : (b.source||"公有領域"))+'</div>'+
          '<div class="toc"><div class="toc-title">章節目錄</div>'+(state.chs.length?tocHtml():'<div style="color:var(--text-soft);font-size:13px;">—</div>')+'</div>'+
          '<div class="book-text anti-copy" data-context data-page-url="book.html?b='+b.id+'">'+textHtml()+'</div>'+
          '<div class="nav-book">'+
            (state.idx>0
              ? '<a href="#" data-ch="'+(state.idx-1)+'">‹ 上一章</a>'
              : '<span></span>')+
            (state.idx<state.chs.length-1
              ? '<a href="#" data-ch="'+(state.idx+1)+'">下一章 ›</a>'
              : '<span></span>')+
          '</div>'+
        '</div>'+
        '<div class="card" style="margin-top:16px;"><h2 class="sec">相關書籍</h2><div id="related"></div></div>'+
        (b.real&&!state.loading&&!state.realFail&&state.chs.length
          ? '<div class="notice info" style="margin-top:14px;">原文已轉為繁體中文（來源：殆知閣公版文本），已依章節分段；全文可於本機完整閱讀。</div>'
          : "");
      wrap.querySelectorAll("[data-ch]").forEach(function(a){
        a.addEventListener("click",function(e){
          e.preventDefault();
          state.idx=parseInt(a.getAttribute("data-ch"),10);
          render();
          window.scrollTo({top:0,behavior:"smooth"});
        });
      });
      if(window.gujiBindFav) window.gujiBindFav();
      var rel=document.getElementById("related");
      if(rel && window.renderRelated) window.renderRelated(rel, b.id, 3);
    }

    // 真實全文：從伺服器抓取
    if(book.real && book.file){
      state.loading=true;
      render();
      fetch((book.file||"").replace(/^\/texts\//, "/texts_trad/"))
        .then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
        .then(function(raw){
          state.chs=parseChapters(raw);
          state.idx=0; state.loading=false; state.realFail=false;
          render();
        })
        .catch(function(){
          state.loading=false; state.realFail=true;
          render();
        });
    } else {
      render();
    }
  };
})();
