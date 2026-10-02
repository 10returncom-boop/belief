# -*- coding: utf-8 -*-
"""
古籍知識庫 · 本機伺服器
啟動：  python serve.py           （預設 http://127.0.0.1:8000）
功能：
  1. 提供靜態網站（index.html 等）
  2. 提供 /texts/ 全文（線上閱讀所需，file:// 模式無法讀取）
  3. 提供 /api/search?q= 元數據檢索（書名/作者/朝代/子類）
     /api/book/<id> 單書詳情
用法：在 D:\\www\\guji-library 目錄執行本檔。
"""
import http.server, socketserver, os, json, urllib.parse, sys, io, re, sqlite3
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.abspath(__file__))           # 網站根
TEXT_DIR = os.path.join(ROOT, "data", "texts", "AncientChineseBook-master")
TEXT_DIR_TRAD = os.path.join(ROOT, "data", "texts_trad", "AncientChineseBook-master")
META = os.path.join(ROOT, "data", "metadata_full.json")
DB = os.path.join(ROOT, "data", "search.db")                # SQLite FTS5 全文索引
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# 載入元數據（供 /api/search 用）
BOOKS = []
if os.path.exists(META):
    with open(META, encoding="utf-8") as f:
        BOOKS = json.load(f).get("books", [])

MIME = {".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8",
        ".js":"application/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
        ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp",
        ".txt":"text/plain; charset=utf-8", ".md":"text/markdown; charset=utf-8"}

def safe_join(base, rel):
    p = os.path.realpath(os.path.join(base, rel))
    base = os.path.realpath(base)
    return p if (p == base or p.startswith(base + os.sep)) else None

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        path = urllib.parse.unquote(u.path)

        # /api/search
        if path == "/api/search":
            self.search(q)
            return
        # /api/fullsearch → FTS5 全文內容檢索
        if path == "/api/fullsearch":
            self.fullsearch(q)
            return
        # /api/book/<id>
        if path.startswith("/api/book/"):
            self.book(path[len("/api/book/"):])
            return
        # /texts/* → 全文（原始簡體，保留以供防斷鏈）
        if path.startswith("/texts/"):
            rel = path[len("/texts/"):]
            fp = safe_join(TEXT_DIR, rel)
            if fp and os.path.isfile(fp):
                self.send_file(fp)
            else:
                self.send_error(404, "找不到檔案：" + rel)
            return
        # /texts_trad/* → 繁體全文
        if path.startswith("/texts_trad/"):
            rel = path[len("/texts_trad/"):]
            fp = safe_join(TEXT_DIR_TRAD, rel)
            if fp and os.path.isfile(fp):
                self.send_file(fp)
            else:
                self.send_error(404, "找不到檔案：" + rel)
            return
        # 靜態
        rel = path.lstrip("/") or "index.html"
        fp = safe_join(ROOT, rel)
        if fp and os.path.isfile(fp):
            self.send_file(fp)
        else:
            self.send_error(404, "找不到：" + path)
        return

    def send_file(self, fp):
        ext = os.path.splitext(fp)[1].lower()
        ctype = MIME.get(ext, "application/octet-stream")
        with open(fp, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def json_out(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def search(self, q):
        kw = (q.get("q") or [""])[0].strip()
        cat = (q.get("cat") or [""])[0]
        sub = (q.get("sub") or [""])[0]
        limit = min(int((q.get("limit") or ["200"])[0]), 500)
        res = []
        for b in BOOKS:
            if cat and b.get("cat") != cat: continue
            if sub and b.get("sub") != sub: continue
            if kw:
                hay = (b.get("title","")+b.get("author","")+b.get("dynasty","")+b.get("sub",""))
                if kw not in hay: continue
            res.append({k: b.get(k) for k in ("id","title","author","dynasty","cat","sub","file","size")})
            if len(res) >= limit: break
        self.json_out({"total": len(res), "q": kw, "results": res})

    def fullsearch(self, q):
        """FTS5 全文內容檢索：命中書名/作者/朝代/子類/內文，附高亮片段。"""
        kw = (q.get("q") or [""])[0].strip()
        limit = min(int((q.get("limit") or ["50"])[0]), 100)
        if not kw or not os.path.exists(DB):
            self.json_out({"total": 0, "q": kw, "results": [], "server": True})
            return
        # 拆出字詞，各以短語 AND 查詢（unicode61 支援中文）
        terms = re.findall(r"[\w\u4e00-\u9fff]+", kw)
        match = " ".join('"%s"' % t for t in terms) if terms else ""
        try:
            con = sqlite3.connect("file:%s?mode=ro" % DB, uri=True)
            cur = con.cursor()
            # FTS 命中（rowid + 高亮片段），再依 rowid 取書目
            fts = cur.execute(
                "SELECT rowid, snippet(books_fts,4,'<mark>','</mark>','…',40) "
                "FROM books_fts WHERE books_fts MATCH ? ORDER BY rank LIMIT ?",
                (match, limit)).fetchall()
            total = cur.execute(
                "SELECT count(*) FROM books_fts WHERE books_fts MATCH ?", (match,)).fetchone()[0]
            res = []
            for rid, snip in fts:
                b = cur.execute(
                    "SELECT id,title,author,dynasty,cat,sub,file FROM books WHERE rowid=?",
                    (rid,)).fetchone()
                if b:
                    res.append({"id":b[0],"title":b[1],"author":b[2],"dynasty":b[3],
                                "cat":b[4],"sub":b[5],"file":b[6],"snippet":snip})
            con.close()
        except Exception as e:
            self.json_out({"total": 0, "q": kw, "results": [], "error": str(e), "server": True})
            return
        self.json_out({"total": total, "q": kw, "results": res, "server": True})

    def book(self, bid):
        bid = urllib.parse.unquote(bid)
        b = next((x for x in BOOKS if x.get("id") == bid), None)
        self.json_out(b if b else {"error": "not found"}, 200)

    def log_message(self, *a):  # 安靜
        pass

if __name__ == "__main__":
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    # 多執行緒，避免單執行緒在並發（頁面資源＋fetch）時阻塞
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
    with ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"古籍知識庫伺服器已啟動： http://127.0.0.1:{PORT}")
        print(f"站台： {ROOT}")
        print(f"全文： {TEXT_DIR}")
        print("Ctrl+C 停止。")
        httpd.serve_forever()
