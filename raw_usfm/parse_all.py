# -*- coding: utf-8 -*-
"""解析和合本繁體JSON -> 網站可用 BIBLE_TEXT 資料檔(逐節)"""
import os, json, re, html as _html

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(HERE, "..", "assets", "bible_text.js")

def clean(txt):
    if not txt: return ""
    txt = re.sub(r'<[^>]+>', '', txt)
    txt = _html.unescape(txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt

def extract_verse(frag):
    """frag: [前綴, HTML, 後綴]，回傳(節號, 節文, 章標題)"""
    html = (frag[0] or "") + (frag[1] or "") + (frag[2] or "")
    m = re.search(r'data-v="(\d+):(\d+)"', html)
    vnum = int(m.group(2)) if m else None
    # 章標題 h4
    hm = re.search(r'<h4[^>]*>(.*?)</h4>', html, re.S)
    head = clean(hm.group(1)) if hm else None
    # 節文：去掉 sup 標籤本身與 h3/h4，保留 sup 文字
    body = re.sub(r'<h3[^>]*>.*?</h3>', '', html, flags=re.S)
    body = re.sub(r'<h4[^>]*>.*?</h4>', '', body, flags=re.S)
    body = re.sub(r'<sup[^>]*>.*?</sup>', '', body, flags=re.S)
    body = clean(body)
    return vnum, body, head

books = {}
manifest = []
for fn in sorted(os.listdir(RAW)):
    if not fn.endswith('.json') or fn == 'manifest.json': continue
    code = fn[:-5]
    with open(os.path.join(RAW, fn), encoding='utf-8') as f:
        d = json.load(f)
    name = d['name'].get('normal', code)
    contents = d.get('contents', [])
    chapters = []
    heads = []
    # contents: 外層=章, 每章=列表，元素=[pre,html,post]
    for ch in contents:
        # 過濾空佔位章(contents 首元素為空陣列)
        if not ch: continue
        verses = []
        for frag in ch:
            vnum, body, head = extract_verse(frag)
            if head and head not in heads:
                heads.append(head)
            if vnum is not None and body:
                verses.append({"v": vnum, "t": body})
        # 依節號排序並去重
        verses = [v for v in verses]
        chapters.append(verses)
    books[code] = {"name": name, "chapters": chapters, "heads": heads}
    manifest.append((code, name, len(chapters)))
    print(f"parse {code} chapters={len(chapters)}")

# 輸出 JS
with open(OUT, 'w', encoding='utf-8') as f:
    f.write("// 和合本繁體(新標點)公有領域逐節經文資料\n")
    f.write("// 資料來源: v1.fetch.bible cmn_cut (Public Domain)\n")
    f.write("window.BIBLE_TEXT = ")
    json.dump(books, f, ensure_ascii=False)
    f.write(";\n")

total_ch = sum(len(v['chapters']) for v in books.values())
total_v = sum(sum(len(c) for c in v['chapters']) for v in books.values())
print(f"DONE books={len(books)} chapters={total_ch} verses={total_v} outbytes={os.path.getsize(OUT)}")
