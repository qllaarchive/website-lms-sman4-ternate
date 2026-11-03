#!/usr/bin/env python3
"""
Generate header images for LMS Fisika and Pendais (PAI).
Images are placed in public/assets/, then HTML files updated to use them.
"""

import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "/Users/mac/Desktop/LMS/public/assets"
W, H = 1100, 360  # header banner size


# ---------- helper: font fallback ----------
def get_font(size, bold=False):
    paths = [
        "/System/Library/Fonts/Doing/Doing.ttf",
        "/System/Library/Fonts/Fonts/Arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFNS.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_centered_text(draw, text, y, font, fill, spacing=0):
    """Draw multi-line text centered horizontally."""
    lines = text.split("\n")
    total_h = sum(font.getbbox(line)[3] - font.getbbox(line)[1] for line in lines)
    total_h += spacing * (len(lines) - 1)
    start_y = y - total_h // 2
    for i, line in enumerate(lines):
        bbox = font.getbbox(line)
        w = bbox[2] - bbox[0]
        x = (W - w) // 2
        if i > 0:
            start_y += (bbox[3] - bbox[1]) + spacing
        draw.text((x, start_y), line, font=font, fill=fill, anchor="ls")
    return start_y


# ============================================================
# FISIKA — header image
# ============================================================
def generate_fisika_image(path):
    img = Image.new("RGB", (W, H), "#1a0f3b")

    # Soft gradient band
    for y in range(H):
        t = y / H
        r = int(49 + (53) * (1 - t))
        g = int(15 + (26 - 15) * (1 - t))
        b = int(59 + (126 - 59) * (1 - t))
        for x in range(0, W, 4):
            img.putpixel((x, y), (r, g, b))
    # fill rest
    for y in range(H):
        for x in range(4, W, 4):
            img.putpixel((x, y), img.getpixel((x - 4, y)))

    # Glow orb (atom nucleus)
    cx, cy = 550, 190
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(140, 0, -10):
        alpha = int(40 * (1 - r / 140))
        gd.ellipse([cx - r, cy - r, cx + r, cy + r],
                   fill=(109, 77, 242, alpha))
    img.paste(glow, (0, 0), glow)

    # Atom orbits (concentric ellipses)
    draw = ImageDraw.Draw(img)
    orbit_colors = [
        (139, 107, 255, 30),
        (155, 125, 255, 22),
        (139, 107, 255, 18),
        (155, 125, 255, 14),
        (139, 107, 255, 10),
    ]
    for i, (r, g, b, a) in enumerate(orbit_colors):
        offset = i * 18
        for angle in range(0, 360, 30):
            rad = math.radians(angle)
            ex = cx + (420 + offset + i * 12) * math.cos(rad)
            ey = cy + (220 + offset + i * 12) * math.sin(rad)
            draw.ellipse([ex - 3, ey - 3, ex + 3, ey + 3], fill=(r, g, b, a))

    # Electrons on orbits
    electron_positions = [
        (550, 190, 500, 150),
        (550, 190, 610, 160),
        (550, 190, 590, 240),
        (550, 190, 510, 240),
    ]
    for i, (x, y, ox, oy) in enumerate(electron_positions):
        # elliptical orbit
        for t in range(0, 360, 15):
            rad = math.radians(t)
            ex = ox + (x - ox) * 0.6 * math.cos(rad)
            ey = oy + (y - oy) * 0.45 * math.sin(rad)
            draw.ellipse([ex - 2, ey - 2, ex + 2, ey + 2],
                         fill=(255, 255, 255, 80))

    # Nucleus
    draw.ellipse([cx - 30, cy - 30, cx + 30, cy + 30],
                 fill=(255, 255, 255, 240))
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(167, 139, 255, 255))

    # Formula E = mc²
    para = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(para)
    try:
        font_big = ImageFont.truetype(
            "/System/Library/Fonts/Fonts/SFNS.ttc", 72)
    except Exception:
        font_big = get_font(72, True)
    try:
        font_small = ImageFont.truetype(
            "/System/Library/Fonts/Fonts/SFNS.ttc", 48)
    except Exception:
        font_small = get_font(48, False)

    text1 = "E = mc"
    bbox1 = font_big.getbbox(text1)
    w1 = bbox1[2] - bbox1[0]
    pdraw.text(((W - w1) // 2, 270), text1, font=font_big,
               fill=(255, 255, 255, 255))
    text2 = "²"
    bbox2 = font_small.getbbox(text2)
    w2 = bbox2[2] - bbox2[0]
    pdraw.text(((W - w2) // 2, 230), text2, font=font_small,
               fill=(167, 139, 255, 255))

    img.paste(para, (0, 0), para)

    # Formula ∑ F = ma (bottom)
    para2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p2 = ImageDraw.Draw(para2)
    text3 = "∑ F = ma"
    b3 = font_big.getbbox(text3)
    w3 = b3[2] - b3[0]
    p2.text(((W - w3) // 2, 200), text3, font=font_big,
            fill=(167, 139, 255, 255))

    img.paste(para2, (0, 0), para2)

    # Bottom label
    draw.text((W // 2, 330), "FISIKA", font=get_font(48, True),
              fill=(255, 255, 255, 200), anchor="mm")
    draw.text((W // 2, 10), "SMAN 4 Ternate", font=get_font(26, False),
              fill=(255, 255, 255, 140), anchor="mm")

    img.convert("RGB").save(path, quality=92)
    print("Fisika image saved:", path, img.size)


# ============================================================
# PENDAIS — header image
# ============================================================
def generate_pendais_image(path):
    """Pendais = Pendidikan Agama Islam — use mosque silhouette with Islamic geometry."""
    img = Image.new("RGB", (W, H), "#2b1a5e")

    # Gradient band
    for y in range(H):
        t = y / H
        r = int(43 + (30 - 43) * t)
        g = int(26 + (22 - 26) * t)
        b = int(83 + (90 - 83) * t)
        for x in range(0, W, 4):
            img.putpixel((x, y), (r, g, b))
    for y in range(H):
        for x in range(4, W, 4):
            img.putpixel((x, y), img.getpixel((x - 4, y)))

    # Islamic geometric pattern overlay
    draw = ImageDraw.Draw(img)
    pattern = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pattern)
    for i in range(8):
        rot = i * 45
        for x in range(0, W, 20):
            for y in range(0, H, 20):
                # diamond shape
                d = 10 + i * 3
                pd.polygon([
                    (x, y - d), (x + d, y), (x, y + d), (x - d, y)
                ], fill=(255, 255, 255, int(15 * (i + 1))))
    img.paste(pattern, (0, 0), pattern)

    # Mosque silhouette (stylized)
    mx, my = 470, 190  # minaret base
    building_h = 260

    # Main building
    draw.rounded_rectangle(
        [mx - 140, my, mx + 140, my + building_h],
        radius=12, fill=(43, 26, 94, 230))

    # Dome on top
    draw.ellipse([mx - 60, my - 200, mx + 60, my - 80],
                 fill=(226, 218, 255, 230))
    draw.rounded_rectangle([mx - 20, my - 210, mx + 20, my - 190],
                           radius=4, fill=(255, 255, 255, 240))

    # Minarets
    for mx_ in [mx - 80, mx + 80]:
        draw.rounded_rectangle([mx_ - 14, my - 140, mx_ + 14, my - 60],
                               radius=6, fill=(30, 20, 70, 230))
        draw.ellipse([mx_ - 18, my - 110, mx_ + 18, my - 80],
                     fill=(226, 218, 255, 230))

    # Pillars
    for px in [mx - 125, mx - 75, mx - 25, mx + 25, mx + 75, mx + 125]:
        draw.rounded_rectangle([px - 10, my, px + 10, my + 100],
                               radius=5, fill=(60, 40, 110, 220))

    # Quran ornament (center top)
    q_x, q_y = mx, my - 230
    draw.rounded_rectangle([q_x - 40, q_y - 40, q_x + 40, q_y + 40],
                           radius=8, fill=(230, 220, 255, 235))
    # Quran text decoration
    try:
        font_q = ImageFont.truetype(
            "/System/Library/Fonts/Fonts/SFNS.ttc", 32)
    except Exception:
        font_q = get_font(32, True)
    draw.text((q_x, q_y - 12), "📖", font=font_q,
              fill=(255, 255, 255, 255), anchor="mm")

    # Arabic-inspired calligraphy pattern (subtle)
    pattern2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd2 = ImageDraw.Draw(pattern2)
    for x in range(0, W, 40):
        for y in range(0, H, 40):
            angle = 45
            pd2.line([(x, y), (x - 20, y + 20)], fill=(255, 255, 255, 10),
                     width=1)
            pd2.line([(x + 20, y), (x, y + 20)], fill=(255, 255, 255, 10),
                     width=1)
    img.paste(pattern2, (0, 0), pattern2)

    # Title
    draw.text((W // 2, 330), "PENDAISO", font=get_font(48, True),
              fill=(255, 255, 255, 200), anchor="mm")
    draw.text((W // 2, 10), "MUSLIM", font=get_font(26, False),
              fill=(255, 255, 255, 140), anchor="mm")

    img.convert("RGB").save(path, quality=92)
    print("Pendais image saved:", path, img.size)


if __name__ == "__main__":
    generate_fisika_image(f"{OUTPUT_DIR}/lms-fisika-header.jpg")
    generate_pendais_image(f"{OUTPUT_DIR}/lms-pendais-header.jpg")
