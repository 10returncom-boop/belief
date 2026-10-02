/* ============================================================
   日夜主題（含跟隨系統 + 手動切換 + localStorage 記憶）
   因 Header 由 JS 渲染，綁定採「可重複呼叫 bind()」，
   由 layout.js 在渲染 header 後再次呼叫。
   ============================================================ */
(function(){
  "use strict";
  var KEY="guji_theme";
  function system(){ return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark":"light"; }
  function current(){
    var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
    return saved==="dark"||saved==="light" ? saved : system();
  }
  function apply(t){
    document.documentElement.setAttribute("data-theme",t);
    var btn=document.querySelector("[data-theme-toggle]");
    if(btn){
      btn.textContent = (t==="dark"?"☀":"☾");
      btn.setAttribute("aria-label", t==="dark"?"切換日間":"切換夜間");
    }
    var mc=document.querySelector('meta[name="theme-color"]');
    if(mc){ mc.setAttribute("content", t==="dark" ? "#0f0e0a" : "#2b2720"); }
    try{ localStorage.setItem(KEY,t); }catch(e){}
  }
  function bind(){
    var btn=document.querySelector("[data-theme-toggle]");
    if(!btn || btn.dataset.bound) return;
    btn.dataset.bound="1";
    btn.addEventListener("click",function(){
      var next = document.documentElement.getAttribute("data-theme")==="dark" ? "light":"dark";
      apply(next);
    });
    apply(current()); // 同步圖示與狀態
  }
  function init(){
    apply(current());
    bind();
    if(window.matchMedia){
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(ev){
        var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
        if(!saved) apply(ev.matches?"dark":"light");
      });
    }
  }
  window.gujiTheme={ current:current, apply:apply, bind:bind };
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",init); }
  else{ init(); }
})();
