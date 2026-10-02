/* ============================================================
   古籍知識庫 · 十藏分類結構（真實，取自原始資料夾）
   易 / 儒 / 道 / 佛 / 子 / 史 十藏
   ============================================================ */
window.GUJI_CATS = [
  {
    id:"yi", name:"易藏", full:"易藏", count:195,
    desc:"《易經》及其術數衍生，含易經 49 部、術數 146 部。",
    color:"#8a5a2b",
    subs:[
      {name:"易經", count:49},
      {name:"術數", count:146}
    ]
  },
  {
    id:"ru", name:"儒藏", full:"儒藏", count:370,
    desc:"儒家經典與蒙學修身，含詩書禮樂春秋、四書、語錄、蒙學等。",
    color:"#9a2f2f",
    subs:[
      {name:"詩經", count:17},{name:"尚書", count:7},{name:"禮經", count:12},
      {name:"樂經", count:1},{name:"春秋", count:13},{name:"小學", count:13},
      {name:"四書", count:27},{name:"五經總義", count:7},{name:"孝經", count:4},
      {name:"語錄", count:136},{name:"啟蒙蒙學", count:75},{name:"修身治家", count:58}
    ]
  },
  {
    id:"dao", name:"道藏", full:"道藏", count:1689,
    desc:"道教經典總集，含正統道藏各洞、續道藏與藏外。",
    color:"#2d6a4f",
    subs:[
      {name:"洞神部", count:369},{name:"洞玄部", count:311},{name:"洞真部", count:326},
      {name:"太平部", count:65},{name:"太清部", count:24},{name:"太玄部", count:113},
      {name:"正一部", count:237},{name:"續道藏", count:58},{name:"藏外", count:186}
    ]
  },
  {
    id:"fo", name:"佛藏", full:"佛藏", count:5159,
    desc:"佛教經律論三藏總集，含大藏經、續藏、乾隆藏、嘉興藏。",
    color:"#9a6a2f",
    subs:[
      {name:"大藏經", count:2432,
        children:[
          {name:"經藏", count:1481, children:[
            {name:"本緣部", count:72},{name:"密教部", count:614},{name:"般若部", count:43},
            {name:"阿含部", count:155},{name:"經集部", count:433},{name:"法華部", count:16},
            {name:"涅槃部", count:23},{name:"大集部", count:28},{name:"華嚴部", count:32},{name:"寶積部", count:65}
          ]},
          {name:"律藏", count:87},
          {name:"論藏", count:533, children:[
            {name:"瑜伽部", count:49},{name:"中觀部", count:15},{name:"諸宗部", count:185},
            {name:"律疏部", count:12},{name:"論集部", count:66},{name:"經疏部", count:111},
            {name:"經論部", count:32},{name:"論疏部", count:35},{name:"毗曇部", count:28}
          ]},
          {name:"雜藏", count:139, children:[
            {name:"目錄部", count:17},{name:"事匯部", count:17},{name:"史傳部", count:96},{name:"外教部", count:9}
          ]},
          {name:"續藏", count:192, children:[
            {name:"古逸部", count:135},{name:"疑似部", count:57}
          ]}
        ]
      },
      {name:"續藏經", count:710},
      {name:"乾隆藏", count:1591, children:[
        {name:"大乘五大部外重譯經", count:249},{name:"宋元入藏諸大小乘經", count:300},
        {name:"此土著述", count:138},{name:"小乘阿含部", count:137},{name:"小乘單譯經", count:102},
        {name:"西土聖賢撰集", count:143},{name:"大乘律", count:24},{name:"宋元續入藏諸論", count:23},
        {name:"大乘論", count:93},{name:"大乘大集部", count:26},{name:"大乘涅槃部", count:13},
        {name:"大乘寶積部", count:37},{name:"大乘單譯經", count:165},{name:"大乘般若部", count:19},
        {name:"大乘華嚴部", count:26},{name:"小乘律", count:59},{name:"小乘論", count:37}
      ]},
      {name:"嘉興藏", count:284},{name:"藏外", count:116}
    ]
  },
  {
    id:"zi", name:"子藏", full:"子藏", count:1155,
    desc:"諸子百家與專門之學，含兵家、法家、農家、筆記、類書等。",
    color:"#3f5a9a",
    subs:[
      {name:"農家", count:25},{name:"兵家", count:53},{name:"法家", count:7},
      {name:"諸子", count:50},{name:"算法", count:7},{name:"雜論", count:270},
      {name:"筆記", count:415},{name:"類書", count:328}
    ]
  },
  {
    id:"shi", name:"史藏", full:"史藏", count:1725,
    desc:"史書與政書，含正史、編年、地理、職官、志存等。",
    color:"#7a4a8a",
    subs:[
      {name:"正史", count:34},{name:"編年", count:21},{name:"別史", count:100},
      {name:"紀事本末", count:28},{name:"地理", count:296},{name:"傳記", count:77},
      {name:"史評", count:24},{name:"載記", count:36},{name:"詔令奏議", count:61},
      {name:"政書", count:60},{name:"職官", count:105},{name:"目錄", count:26},
      {name:"經世文編", count:11},{name:"四庫雜史", count:22},{name:"志存記錄", count:824}
    ]
  }
];

/* 依 id 或名稱取藏別 */
window.gujiCatById = function(id){
  return window.GUJI_CATS.find(function(c){return c.id===id;});
};
window.gujiTotal = window.GUJI_CATS.reduce(function(s,c){return s+c.count;},0);

/* ============================================================
   真實十藏資料整合
   當 js/books-data.js 已載入（window.GUJI_CATS_FULL）時，
   以真實十藏分類取代上方十藏示意結構。
   ============================================================ */
(function(){
  if(!window.GUJI_CATS_FULL || !window.GUJI_CATS_FULL.length) return;
  var colors={易藏:"#8a5a2b",儒藏:"#9a2f2f",道藏:"#2d6a4f",佛藏:"#9a6a2f",子藏:"#3f5a9a",
             史藏:"#7a4a8a",詩藏:"#a05a2f",集藏:"#2f6a9a",醫藏:"#2f8a5a",藝藏:"#7a5a8a"};
  window.GUJI_CATS = window.GUJI_CATS_FULL.map(function(c){
    return { id:c.name, name:c.name, full:c.name, count:c.count, desc:c.desc,
             color:colors[c.name]||"#555",
             subs:(c.subs||[]).map(function(s){ return {name:s.name, count:s.count}; }) };
  });
  window.gujiTotal = window.GUJI_CATS.reduce(function(s,c){return s+c.count;},0);
  window.gujiCatById = function(id){
    return window.GUJI_CATS.find(function(c){ return c.id===id || c.name===id; }) || null;
  };
})();
