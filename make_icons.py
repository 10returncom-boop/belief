# -*- coding: utf-8 -*-
"""為聖經Bible網站生成 favicon / PWA 圖示（navy + gold 十字與打開的聖經）。
輸出：favicon-32.png、favicon-192.png、favicon-512.png、apple-touch-icon.png、favicon.ico
設計與 favicon.svg 一致；512 基準以 LANCZOS 縮放產生各尺寸。"""
import math
from PIL import Image, ImageDraw

NAVY = (31, 42, 68, 255)
GOLD = (201, 164, 92, 255)
NAVY_LINE = (31, 42, 68, 255)


def draw_icon(size):
    S = float(size)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = 0.22 * S
    # 底：navy 圓角方塊
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=NAVY)
    # 外框：金色圓角細框
    ring_w = max(1.0, 0.028 * S)
    inset = ring_w / 2
    d.rounded_rectangle([inset, inset, S - inset, S - inset],
                        radius=r - inset, outline=GOLD, width=int(ring_w))
    # 十字（書卷上方）
    bw = 0.045 * S
    cx = S / 2
    d.rectangle([cx - bw / 2, 0.20 * S, cx + bw / 2, 0.42 * S], fill=GOLD)
    d.rectangle([0.30 * S, 0.30 * S - bw / 2, 0.70 * S, 0.30 * S + bw / 2], fill=GOLD)
    # 打開的聖經（下半部）
    top_y = 0.52 * S
    bot_y = 0.80 * S
    lx = 0.30 * S
    rx = 0.70 * S
    d.polygon([(cx, top_y), (lx, 0.565 * S), (lx, bot_y), (cx, 0.745 * S)], fill=GOLD)
    d.polygon([(cx, top_y), (rx, 0.565 * S), (rx, bot_y), (cx, 0.745 * S)], fill=GOLD)
    spine = max(1.0, 0.012 * S)
    d.line([(cx, top_y), (cx, 0.745 * S)], fill=NAVY_LINE, width=int(spine))
    return img


def main():
    base = draw_icon(512)
    base.save("favicon-512.png", "PNG")
    base.resize((192, 192), Image.LANCZOS).save("favicon-192.png", "PNG")
    base.resize((180, 180), Image.LANCZOS).save("apple-touch-icon.png", "PNG")
    base.resize((32, 32), Image.LANCZOS).save("favicon-32.png", "PNG")
    # favicon.ico：16 + 32
    base.resize((16, 16), Image.LANCZOS).save(
        "favicon.ico", sizes=[(16, 16), (32, 32)])
    print("icons generated:", [f for f in
          ["favicon-512.png", "favicon-192.png", "apple-touch-icon.png",
           "favicon-32.png", "favicon.ico"]])


if __name__ == "__main__":
    main()
