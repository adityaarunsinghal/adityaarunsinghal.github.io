import { execFileSync } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "scripts/assets/workshop-instructors");
const date = "2026-10-09";

function ffmpeg(args) {
  execFileSync(
    "ffmpeg",
    ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
}

export async function generateInstructorPortraits(output) {
  await mkdir(output, { recursive: true });
  const adi = path.join(source, `adi-wave-${date}.gif`);
  const luca = path.join(source, `luca-wave-${date}.mp4`);

  // Preserve the supplied GIF, including every frame and its original timing.
  await copyFile(adi, path.join(output, `adi-wave-${date}.gif`));
  ffmpeg([
    "-i",
    luca,
    "-filter_complex",
    "fps=15,scale=640:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a",
    "-loop",
    "0",
    path.join(output, `luca-wave-${date}.gif`),
  ]);

  for (const [name, input] of [["adi", adi], ["luca", luca]]) {
    ffmpeg([
      "-i",
      input,
      "-frames:v",
      "1",
      "-vf",
      "scale=640:-2:flags=lanczos",
      "-q:v",
      "2",
      "-update",
      "1",
      path.join(output, `${name}-wave-${date}.jpg`),
    ]);
  }
  console.log(`Generated instructor GIFs and still portraits in ${output}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateInstructorPortraits(
    path.join(root, "public/workshops/2026/instructors"),
  );
}
