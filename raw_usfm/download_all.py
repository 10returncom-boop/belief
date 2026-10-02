# -*- coding: utf-8 -*-
"""下載和合本繁體(新標點)公有領域全部66卷 JSON 至 raw 目錄"""
import os, json, urllib.request, time

BASE = "https://v1.fetch.bible/bibles/cmn_cut/html"
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
os.makedirs(RAW, exist_ok=True)

BOOKS = [
 "gen","exo","lev","num","deu","jos","jdg","rut","1sa","2sa","1ki","2ki","1ch","2ch","ezr","neh","est","job","psa","pro","ecc","sng","isa","jer","lam","ezk","dan","hos","jol","amo","oba","jon","mic","nam","hab","zep","hag","zec","mal",
 "mat","mrk","luk","jhn","act","rom","1co","2co","gal","eph","php","col","1th","2th","1ti","2ti","tit","phm","heb","jas","1pe","2pe","1jn","2jn","3jn","jud","rev"]

def fetch(code):
    url = f"{BASE}/{code}.json"
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

manifest = []
for code in BOOKS:
    try:
        data = fetch(code)
        out = os.path.join(RAW, code + ".json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        manifest.append((code, data["name"].get("normal",""), len(data.get("contents",[]))))
        print(f"OK {code}  size={os.path.getsize(out)}")
    except Exception as e:
        print(f"FAIL {code}: {e}")
    time.sleep(0.2)

with open(os.path.join(RAW, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=1)
print("DONE total=", len(manifest))
