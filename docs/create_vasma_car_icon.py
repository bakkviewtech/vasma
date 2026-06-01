from pathlib import Path

from PIL import Image, ImageDraw


def main():
    out = Path(r"C:\Users\HP 1030 G7\OneDrive\Email attachments\Documents\VASMA System\frontend\vasma-car.ico")
    sizes = [16, 24, 32, 48, 64, 128, 256]
    images = []
    for size in sizes:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        margin = max(1, size // 16)
        radius = size // 5
        d.rounded_rectangle(
            [margin, margin, size - margin - 1, size - margin - 1],
            radius=radius,
            fill=(21, 94, 117, 255),
        )
        d.rounded_rectangle(
            [size * 0.18, size * 0.52, size * 0.82, size * 0.70],
            radius=size * 0.06,
            fill=(248, 250, 252, 255),
        )
        roof = [
            (size * 0.30, size * 0.52),
            (size * 0.42, size * 0.32),
            (size * 0.62, size * 0.32),
            (size * 0.74, size * 0.52),
        ]
        d.polygon(roof, fill=(248, 250, 252, 255))
        line_w = max(1, size // 24)
        d.line([(size * 0.46, size * 0.36), (size * 0.42, size * 0.52)], fill=(21, 94, 117, 255), width=line_w)
        d.line([(size * 0.60, size * 0.36), (size * 0.65, size * 0.52)], fill=(21, 94, 117, 255), width=line_w)
        wheel_r = size * 0.09
        d.ellipse([size * 0.27 - wheel_r, size * 0.70 - wheel_r, size * 0.27 + wheel_r, size * 0.70 + wheel_r], fill=(15, 23, 42, 255))
        d.ellipse([size * 0.73 - wheel_r, size * 0.70 - wheel_r, size * 0.73 + wheel_r, size * 0.70 + wheel_r], fill=(15, 23, 42, 255))
        d.rounded_rectangle([size * 0.18, size * 0.23, size * 0.82, size * 0.28], radius=size * 0.02, fill=(245, 158, 11, 255))
        images.append(img)
    out.parent.mkdir(parents=True, exist_ok=True)
    images[-1].save(out, format="ICO", sizes=[(s, s) for s in sizes])
    print(out)


if __name__ == "__main__":
    main()
