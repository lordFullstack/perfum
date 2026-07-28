"""
Genera los íconos PNG requeridos por el manifest de la PWA (Fase 1).
Ejecutar una sola vez: python3 scripts/generate-icons.py
No forma parte del build — es una utilidad de desarrollo.
"""

from PIL import Image, ImageDraw

INK = (21, 19, 15, 255)       # #15130F
GOLD = (217, 169, 79, 255)    # #D9A94F

OUT_DIR = "public/icons"


def draw_monogram(draw: ImageDraw.ImageDraw, size: int, stroke_scale: float = 1.0):
    """Dibuja el frasco/gota estilizado, centrado, escalable a cualquier tamaño."""
    cx = size / 2
    top = size * 0.19
    bottom = size * 0.72
    width_half = size * 0.125
    stroke = max(2, round(size * 0.035 * stroke_scale))

    # Cuerpo de gota (frasco estilizado) usando una curva simple con líneas rectas
    points = [
        (cx, top),
        (cx - width_half, bottom - size * 0.06),
        (cx - width_half, bottom),
        (cx, bottom + size * 0.02),
        (cx + width_half, bottom),
        (cx + width_half, bottom - size * 0.06),
        (cx, top),
    ]
    draw.line(points, fill=GOLD, width=stroke, joint="curve")

    # Base (tapón)
    base_y = bottom + size * 0.09
    draw.line([(cx, bottom + size * 0.02), (cx, base_y)], fill=GOLD, width=stroke)
    draw.line(
        [(cx - width_half * 0.85, base_y), (cx + width_half * 0.85, base_y)],
        fill=GOLD,
        width=stroke,
    )


def make_icon(size: int, path: str, padding_ratio: float = 0.0, radius_ratio: float = 0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = int(size * padding_ratio)
    radius = int(size * radius_ratio)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad], radius=radius, fill=INK
    )
    draw_monogram(draw, size)

    img.save(path, "PNG")
    print(f"OK: {path}")


if __name__ == "__main__":
    import os

    os.makedirs(OUT_DIR, exist_ok=True)
    make_icon(192, f"{OUT_DIR}/icon-192.png")
    make_icon(512, f"{OUT_DIR}/icon-512.png")
    # Maskable: el contenido debe respetar una "safe zone" circular central,
    # por eso el fondo cubre todo el lienzo (sin padding ni radio propio).
    make_icon(512, f"{OUT_DIR}/icon-maskable-512.png", padding_ratio=0.0, radius_ratio=0.0)
