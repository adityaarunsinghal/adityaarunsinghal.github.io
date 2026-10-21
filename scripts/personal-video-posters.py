# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow==13.0.0"]
# ///
"""Regenerate responsive film posters: uv run scripts/personal-video-posters.py."""

from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "scripts/assets/personal-videos"
output = root / "public/static/images/video-posters"
output.mkdir(parents=True, exist_ok=True)

# Source images: https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg
# The first video is the opening film in the existing short-films playlist.
for video_id in ["lkA05ODFs4U", "Gaa14VT4eWI"]:
    with Image.open(source / f"{video_id}.jpg") as image:
        if image.size != (1280, 720):
            raise ValueError(f"Expected a 1280×720 source poster for {video_id}")
        for width in [640, 1280]:
            poster = image.convert("RGB").resize(
                (width, width * 9 // 16), Image.Resampling.LANCZOS
            )
            poster.save(output / f"{video_id}-{width}.webp", quality=90, method=6)
print("Generated 640px and 1280px posters for both personal video players.")
