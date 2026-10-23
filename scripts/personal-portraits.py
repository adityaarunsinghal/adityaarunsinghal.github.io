# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow==13.0.0"]
# ///
"""Regenerate the public portraits: uv run scripts/personal-portraits.py."""

from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "scripts/assets/personal-portraits"
output = root / "public/static/images"

with Image.open(source / "adi-mcp-2026.jpeg") as original:
    portrait = ImageOps.exif_transpose(original).convert("RGB")
    portrait.thumbnail((720, 1080), Image.Resampling.LANCZOS)
    portrait.save(output / "adi-mcp-2026.webp", quality=88, method=6)
    for width in (288, 576):
        responsive = portrait.copy()
        responsive.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
        responsive.save(output / f"adi-mcp-2026-{width}.webp", quality=88, method=6)

# Both supplied GIFs already share a timeline. A single compressed animation
# keeps the pair synchronized even when network loading or decoding is slow.
frames = []
durations = []
with (
    Image.open(source / "hi_adi.gif") as younger,
    Image.open(source / "hi-adi-v2.gif") as current,
):
    if younger.n_frames != current.n_frames:
        raise ValueError("The supplied waving portraits need matching frames.")
    loop = younger.info.get("loop", 0)
    if current.info.get("loop", 0) != loop:
        raise ValueError("The supplied waving portraits need matching loops.")
    for index in range(younger.n_frames):
        younger.seek(index)
        current.seek(index)
        duration = younger.info["duration"]
        if duration <= 0 or current.info["duration"] != duration:
            raise ValueError(f"The portraits differ in timing at frame {index}.")
        pair = Image.new("RGB", (1024, 300), "#091126")
        for image, left in [(younger, 0), (current, 524)]:
            panel = image.convert("RGB").resize(
                (500, 300), Image.Resampling.LANCZOS
            )
            pair.paste(panel, (left, 0))
        frames.append(pair)
        durations.append(duration)

frames[0].save(output / "adi-waving-still.webp", quality=88, method=6)
frames[0].save(
    output / "adi-waving-together.webp",
    save_all=True,
    append_images=frames[1:],
    duration=durations,
    loop=loop,
    quality=88,
    method=6,
)
print(f"Generated the MCP portrait and {len(frames)} synchronized waving frames "
      f"({sum(durations)} ms per loop).")
