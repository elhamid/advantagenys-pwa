"""
Recolor the inner Star of David triangles in icon-512.png
from sage green to the original cyan color from the backup icon.

The backup's inner triangles use:
  - Base/bright:  RGB(23, 190, 233)  — main lit face
  - Mid shadow:   RGB(0, 135, 170)   — side face
  - Dark shadow:  RGB(0, 100, 140)   — deep shadow

We preserve the luminosity ratio of each green pixel to map it to
the equivalent cyan shade, preserving the 3D shading.
"""

from PIL import Image

SRC = "/Users/haza/Projects/advantagenys-pwa/public/icons/icon-512.png"
DST = "/Users/haza/Projects/advantagenys-pwa/public/icons/icon-512.png"

# Target cyan hue anchors (base bright, mid, dark)
# Sampled from backup — the full range the inner triangles use
CYAN_BRIGHT = (31, 203, 246)   # brightest highlight
CYAN_MID    = (23, 190, 233)   # main body
CYAN_DARK   = (0, 135, 170)    # shadow/dark face

def luminance(r, g, b):
    """Simple perceptual luminance (0..1)."""
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255.0

def lerp(a, b, t):
    return a + (b - a) * t

def cyan_for_luminance(lum):
    """
    Map luminance (0..1) to a cyan color.
    lum=1.0 → very bright (near white or bright cyan highlight)
    lum=0.5 → mid cyan
    lum=0.0 → dark teal
    """
    # Bright anchor: lum ~0.65 → CYAN_BRIGHT
    # Mid anchor:    lum ~0.55 → CYAN_MID
    # Dark anchor:   lum ~0.30 → CYAN_DARK
    # We'll linearly interpolate across 3 anchors

    DARK_LUM  = 0.20
    MID_LUM   = 0.55
    BRIGHT_LUM = 0.80

    if lum <= DARK_LUM:
        # Scale CYAN_DARK down
        t = lum / DARK_LUM
        return tuple(int(lerp(0, c, t)) for c in CYAN_DARK)
    elif lum <= MID_LUM:
        t = (lum - DARK_LUM) / (MID_LUM - DARK_LUM)
        return tuple(int(lerp(CYAN_DARK[i], CYAN_MID[i], t)) for i in range(3))
    elif lum <= BRIGHT_LUM:
        t = (lum - MID_LUM) / (BRIGHT_LUM - MID_LUM)
        return tuple(int(lerp(CYAN_MID[i], CYAN_BRIGHT[i], t)) for i in range(3))
    else:
        # Above bright anchor — push toward near-white cyan
        t = (lum - BRIGHT_LUM) / (1.0 - BRIGHT_LUM)
        WHITE = (220, 245, 255)
        return tuple(int(lerp(CYAN_BRIGHT[i], WHITE[i], t)) for i in range(3))

def is_green(r, g, b, a):
    """Detect sage green pixels (inner Star of David triangles)."""
    if a < 30:
        return False
    # Green: G dominant, not too high (would be white), not blue-dominant
    return (
        100 <= r <= 200 and
        140 <= g <= 230 and
        80 <= b <= 165 and
        g > r and  # greener than red
        g > b and  # greener than blue
        (g - b) > 20  # meaningfully more green than blue
    )

img = Image.open(SRC).convert("RGBA")
pixels = img.load()
w, h = img.size

recolored = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if is_green(r, g, b, a):
            lum = luminance(r, g, b)
            nr, ng, nb = cyan_for_luminance(lum)
            pixels[x, y] = (nr, ng, nb, a)
            recolored += 1

print(f"Recolored {recolored} green pixels to cyan.")
img.save(DST, "PNG")
print(f"Saved to {DST}")

# Verify a few sample points
img2 = Image.open(DST)
cx, cy = w // 2, h // 2
print(f"\nPost-recolor samples around center:")
for dx, dy in [(0, -60), (0, 0), (0, 40), (-40, 20), (40, 20)]:
    px = img2.getpixel((cx + dx, cy + dy))
    print(f"  ({cx+dx},{cy+dy}): RGB({px[0]}, {px[1]}, {px[2]})")
