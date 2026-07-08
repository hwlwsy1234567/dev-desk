from math import cos, pi, sin
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "effects" / "arcane_burst"
FRAME_DIR = OUT_DIR / "frames"
SIZE = 768
FRAMES = 72


def rgba(color, alpha):
    return color[0], color[1], color[2], alpha


def add_glow(base, xy, color, radius, alpha):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = xy
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=rgba(color, alpha))
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(radius / 2)))


def draw_frame(index):
    progress = index / FRAMES
    cx = cy = SIZE / 2
    rnd = Random(20260707)

    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    bg = Image.new("RGBA", (SIZE, SIZE), (6, 8, 20, 255))
    bg_draw = ImageDraw.Draw(bg)
    for i in range(SIZE):
        t = i / SIZE
        bg_draw.line((0, i, SIZE, i), fill=(8 + int(t * 18), 10, 26 + int(t * 34), 255))
    img.alpha_composite(bg)

    pulse = sin(progress * pi)
    spin = progress * pi * 2

    add_glow(img, (cx, cy), (33, 120, 255), 255 + pulse * 90, 100)
    add_glow(img, (cx, cy), (120, 240, 255), 105 + pulse * 80, 160)

    ring_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ring = ImageDraw.Draw(ring_layer)
    for i in range(7):
        radius = 85 + i * 34 + pulse * 18
        alpha = max(0, int(190 - i * 22))
        ring.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            outline=(86, 214, 255, alpha),
            width=2 + (i % 3),
        )
    for i in range(36):
        angle = spin + i * pi / 18
        inner = 90 + pulse * 18
        outer = 260 + (i % 4) * 18 + pulse * 35
        x1 = cx + cos(angle) * inner
        y1 = cy + sin(angle) * inner
        x2 = cx + cos(angle) * outer
        y2 = cy + sin(angle) * outer
        ring.line((x1, y1, x2, y2), fill=(112, 224, 255, 105), width=2)
    img.alpha_composite(ring_layer.filter(ImageFilter.GaussianBlur(0.4)))

    beam_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    beam = ImageDraw.Draw(beam_layer)
    for i in range(18):
        angle = -0.65 + i * 0.075 + spin * 0.18
        length = 210 + pulse * 330 + (i % 3) * 46
        start = 40 + (i % 4) * 9
        x1 = cx + cos(angle) * start
        y1 = cy + sin(angle) * start * 0.65
        x2 = cx + cos(angle) * length
        y2 = cy + sin(angle) * length * 0.65
        beam.line((x1, y1, x2, y2), fill=(36, 198, 255, 48), width=18)
        beam.line((x1, y1, x2, y2), fill=(105, 236, 255, 150), width=5)
        beam.line((x1, y1, x2, y2), fill=(245, 255, 255, 220), width=1)
    img.alpha_composite(beam_layer.filter(ImageFilter.GaussianBlur(0.8)))

    particle_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    particles = ImageDraw.Draw(particle_layer)
    for i in range(260):
        angle = rnd.random() * pi * 2 + spin * (0.12 + rnd.random() * 0.2)
        distance = 20 + rnd.random() * (310 + pulse * 120)
        drift = (progress * 160 * (0.4 + rnd.random())) % 120
        x = cx + cos(angle) * (distance + drift)
        y = cy + sin(angle) * (distance + drift) * 0.65
        size = 1 + rnd.random() * 4
        alpha = int((70 + rnd.random() * 155) * (0.45 + pulse * 0.55))
        particles.ellipse((x - size, y - size, x + size, y + size), fill=(136, 236, 255, alpha))
    img.alpha_composite(particle_layer)

    core = Image.new("RGBA", img.size, (0, 0, 0, 0))
    core_draw = ImageDraw.Draw(core)
    core_radius = 42 + pulse * 46
    core_draw.ellipse(
        (cx - core_radius, cy - core_radius, cx + core_radius, cy + core_radius),
        fill=(160, 250, 255, 230),
    )
    core_draw.ellipse(
        (cx - core_radius / 2, cy - core_radius / 2, cx + core_radius / 2, cy + core_radius / 2),
        fill=(255, 255, 255, 245),
    )
    img.alpha_composite(core.filter(ImageFilter.GaussianBlur(1.2)))
    return img


def main():
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    frames = []
    for index in range(FRAMES):
        frame = draw_frame(index)
        frame_path = FRAME_DIR / f"skill_effect_{index + 1:03d}.png"
        frame.save(frame_path)
        frames.append(frame)

    frames[0].save(
        OUT_DIR / "skill_effect.gif",
        save_all=True,
        append_images=frames[1:],
        duration=42,
        loop=0,
        disposal=2,
    )

    cols = 9
    rows = (FRAMES + cols - 1) // cols
    sheet = Image.new("RGBA", (SIZE * cols, SIZE * rows), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % cols) * SIZE, (index // cols) * SIZE))
    sheet.save(OUT_DIR / "skill_effect_spritesheet.png")


if __name__ == "__main__":
    main()
