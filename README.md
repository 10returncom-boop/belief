# 古籍知識庫 Guji Library

免費公開的古典文獻知識庫網站，匯集《易》《儒》《道》《佛》《子》《史》《詩》《集》《醫》《藝》十藏 **13,331 部**真實文本（來源：殆知閣公版資料庫），提供全文檢索、線上閱讀與章節目錄。

## 版本
- v1.0（2026-10-02）：十藏分類＋範例書目骨架。
- v2.0（2026-10-02）：**匯入真實全庫**——13,331 部 TXT、十藏分類、完整元數據、本機伺服器全文閱讀。
- v2.1（2026-10-02）：**易讀性與介面優化**＋頁尾署名。基字級 16px、正文最佳欄寬 740px 置中、章節目錄限高捲動、鍵盤焦點樣式、`prefers-reduced-motion`、行動觸控加大、全站 0 斷鏈。
- v3.0（2026-10-02）：**全庫正文繁中化**——13,331 部正文以 OpenCC `s2t` 批次轉為繁體，寫入新目錄 `data/texts_trad/`（原始簡體 `data/texts/` 保留不動）；書目 `file` 欄位與 `js/books-data.js` 重新生成指向 `texts_trad/`；重建繁體全文檢索索引（`data/search.db`，FTS5），線上閱讀／全文檢索／高亮片段全面繁體。Header「十藏分類」下拉改為**兩階**（十藏 → 子類，桌面與行動版），全站 8 頁零斷鏈稽核通過。

## 頁尾署名
`規劃設計開發：張書欣 · 331.today`（layout.js 單一來源渲染，全站生效）

## 網站根目錄
`D:\www\guji-library\`

## 快速啟動（線上閱讀全文必需）
```bat
cd D:\www\guji-library
python serve.py
```
→ 瀏覽器開啟 `http://127.0.0.1:8000`
- 靜態瀏覽／檢索／分類可用 `file://` 直接開啟；**閱讀全文與 /texts/ 需本機伺服器**（瀏覽器禁止 file:// 讀取本地檔）。
- serve.py 另提供 API：`/api/search?q=關鍵字`、`/api/book/<id>`。

## 功能規格
- RWD 響應式（手機/平板/桌面）＋行動選單（漢堡）
- 日夜主題切換（含跟隨系統，localStorage 記憶，theme-color 連動）
- 麵包屑 Breadcrumb
- **十藏分類瀏覽**（易/儒/道/佛/子/史/詩/集/醫/藝）＋子類篩選
- 三種檢視：卡片／清單／樹狀（Tree View）
- 線上閱讀＋章節目錄切換＋上一章/下一章＋相關書籍
- 全文檢索（前端靜態：書名/作者/朝代/子類）
- 分頁導航 Pagination
- 下拉選單 Dropdown（十藏 → 子類兩階，桌面＋行動版）＋ 黏性導航 Sticky Nav
- Header / Footer / Sidebar 共用版面（layout.js 單一來源）
- 浮動返回頂部 Back-to-top ＋ FAB 浮動行動按鈕（分享／最愛／返回）
- 自訂右鍵選單 Context Menu
- 我的最愛 Favorite（localStorage）
- 標籤雲 Tag Cloud／最新書目 Latest Posts
- 時間軸 Timeline／社群 Social Icons／聯絡資訊 Contact Info
- 表單：註冊 Register／電子報訂閱 Subscribe／Email／表單提交驗證
- 進階懶載入 Lazy Load（IntersectionObserver）
- 儀表板 Dashboard（十藏統計、比例、子類折疊）
- 防複製 Anti-copy（正文區）
- SEO meta：canonical／favicon／theme-color／viewport／UTF-8

## 目錄結構
```
guji-library/
├── index.html          # 首頁（十藏入口、最新書目、標籤雲、開始探索）
├── catalog.html        # 書庫目錄（三種檢視＋子類篩選＋分頁）
├── book.html           # 線上閱讀（章節目錄＋收藏＋相關書籍）
├── search.html         # 全文檢索
├── dashboard.html      # 儀表板（十藏統計＋我的最愛）
├── contact.html        # 訂閱與聯絡（電子報/註冊/聯絡表單）
├── about.html          # 關於與授權（時間軸/社群/聯絡/折疊）
├── sitemap.html        # 網站地圖
├── serve.py            # 本機伺服器（靜態＋/texts/＋/texts_trad/全文＋檢索 API）
├── css/main.css        # 全站樣式（CSS 變數日夜主題＋進階元件）
├── js/
│   ├── books-data.js   # ★真實全庫 13,331 部書目＋十藏（自動生成，勿手改）
│   ├── categories.js   # 十藏分類（含佛藏三層樹）
│   ├── books.js        # 示意書目＋全庫資料整合載入器
│   ├── site-config.js  # 標籤雲/時間軸/社群/聯絡資料
│   ├── theme.js        # 日夜主題（含跟隨系統）
│   ├── layout.js       # 版面：Header/Footer/Sidebar/麵包屑/導航/行動選單
│   ├── widgets.js      # 互動元件：accordion/tabs/tree/context-menu/fab/favorite/forms/lazy/...
│   ├── catalog.js      # 目錄瀏覽＋三種檢視＋分頁
│   ├── search.js       # 全文檢索
│   └── reader.js       # 線上閱讀＋章節（真實全文經 /texts_trad/ 抓取，繁體）
├── data/
│   ├── texts/          # ★原始簡體全文（3.2GB，13,331 個 TXT，保留不動）
│   ├── texts_trad/     # ★繁體全文副本（OpenCC s2t 轉換，v3.0 起閱讀/檢索使用）
│   ├── search.db       # FTS5 全文索引（繁體，約 5.9GB）
│   └── metadata_full.json  # 全庫元數據（13,331 部）
└── images/favicon.svg  # 網站圖示
```

## 資料狀態（v3.0 真實全庫・繁體）
- **13,331 部真實 TXT**：原始簡體存於 `data/texts/`（3.2GB），**繁體副本**存於 `data/texts_trad/`（OpenCC `s2t` 批次轉換，v3.0 起線上閱讀與全文檢索皆使用繁體副本；原始簡體保留不動，`/texts/` 路由仍可存取）。來源：殆知閣（daizhige.org）漢語古典文本資料庫，公版古典文本。
- `js/books-data.js`＝自動生成的全庫書目（書名/作者/朝代/十藏/子類/檔案路徑），顯示欄位已轉為台灣正體，`file` 指向 `/texts_trad/`。
- 十藏：易195 / 儒370 / 道1689 / 佛5148 / 子1161 / 史1724 / 詩322 / 集1467 / 醫869 / 藝386。
- 全文檢索：**SQLite FTS5 全文內容檢索**（`data/search.db`，約 5.9GB，索引繁體正文）。伺服器模式（serve.py）下檢索頁走 `/api/fullsearch`，可搜書名/作者/朝代/子類/**繁體正文內容**並回傳繁體高亮片段；file:// 模式退回前端元數據檢索。
- 章節解析：通用規則（卷X／卷第一／第一章／N章／NN．，容忍開頭裝飾符號）。已驗證資治通鑑 294 章、道德經 81 章、周易 64 章；格式特異之書顯示為單章「全文」，內容完整。

## 開啟方式
1. 靜態瀏覽：直接開 `D:\www\guji-library\index.html`。
2. 線上閱讀全文：`python serve.py` → `http://127.0.0.1:8000`。

## 授權
- 古典文獻原文：公有領域（殆知閣整理）
- 整理成果：CC BY-NC 4.0（署名・非商業）
- 每部書標註數位化來源出處

## 素材與提示詞
（無圖像素材；日後若加封面/主視覺，提示詞與規範紀錄於此。）
- 封面風格建議：水墨宣紙風、硃砂印章、繁體字。
