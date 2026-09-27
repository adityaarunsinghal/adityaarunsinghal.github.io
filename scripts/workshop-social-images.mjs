import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

// The SVG template is the editable source. Raster files are generated into dist.
export async function generateSocialImages(directory) {
  const fontFiles = ["Lato-Regular.ttf", "Lato-Bold.ttf"].map((name) =>
    fileURLToPath(new URL(`./assets/fonts/${name}`, import.meta.url)),
  );
  // The renderer otherwise tolerates missing fonts and can silently omit all text.
  await Promise.all(fontFiles.map((font) => stat(font)));
  await mkdir(directory, { recursive: true });
  for (const year of [2025, 2026]) {
    const subtitle =
      year === 2026
        ? "Build an agent you can explain."
        : "The 2025 workshop archive";
    const detail =
      year === 2026
        ? "OCTOBER 8, 15, 22 &amp; 29  /  NYU CDS"
        : "COURSE OUTLINE  /  HIGHLIGHTS  /  PUBLIC CODE";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#f7f5f0"/>
      <rect width="1200" height="84" fill="#111827"/>
      <g font-family="Lato">
        <text x="64" y="53" font-size="24" fill="#f7f5f0">Adi Singhal / NYU CDS</text>
        <text x="64" y="181" font-size="24" fill="#0f766e" letter-spacing="3">AGENTIC AI WORKSHOP</text>
        <text x="64" y="315" font-size="118" font-weight="bold" fill="#111827">${year}</text>
        <text x="64" y="405" font-size="49" fill="#111827">${subtitle}</text>
        <path d="M64 470H1136" stroke="#b4bfb0"/>
        <text x="64" y="532" font-size="24" fill="#4b5563" letter-spacing="1">${detail}</text>
      </g>
    </svg>`;
    await writeFile(
      `${directory}/workshop-social-${year}.png`,
      new Resvg(svg, {
        font: {
          loadSystemFonts: false,
          fontFiles,
          defaultFontFamily: "Lato",
        },
      })
        .render()
        .asPng(),
    );
  }
}
