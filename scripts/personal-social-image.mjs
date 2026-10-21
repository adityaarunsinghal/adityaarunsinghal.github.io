import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

// Regenerate the public card from the supplied MCP portrait and bundled OFL fonts.
// No system fonts, remote assets, or image-generation service are required.
const portrait = await readFile(
  new URL("./assets/personal-portraits/adi-mcp-2026.jpeg", import.meta.url),
);
const fontFiles = ["Lato-Regular.ttf", "Lato-Bold.ttf"].map((name) =>
  fileURLToPath(new URL(`./assets/fonts/${name}`, import.meta.url)),
);
await Promise.all(fontFiles.map((font) => stat(font)));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#091126"/>
  <rect x="24" y="24" width="1152" height="582" rx="12" fill="none" stroke="#33415d"/>
  <g font-family="Lato" fill="#f4f6fc">
    <text x="64" y="89" font-size="24" fill="#bac9e8">adityasinghal.com</text>
    <text x="64" y="209" font-size="62" font-weight="bold">Aditya (Adi) Singhal</text>
    <text x="64" y="278" font-size="40" fill="#b8caff">Agentic AI · MCP · Evaluation</text>
    <text x="64" y="365" font-size="27">Applied Scientist at Amazon</text>
    <text x="64" y="411" font-size="27">Former AWS Bedrock engineer</text>
    <text x="64" y="457" font-size="27">Agentic AI instructor at NYU</text>
    <path d="M64 517H1136" stroke="#33415d"/>
    <text x="64" y="563" font-size="25" fill="#bac9e8">I build and evaluate production AI agents.</text>
  </g>
  <defs>
    <clipPath id="portrait"><rect x="848" y="122" width="280" height="380" rx="12"/></clipPath>
  </defs>
  <image x="848" y="122" width="280" height="380" clip-path="url(#portrait)" href="data:image/jpeg;base64,${portrait.toString("base64")}"/>
</svg>`;

const output = new URL("../public/social/adi-singhal.png", import.meta.url);
await mkdir(new URL("./", output), { recursive: true });
await writeFile(
  output,
  new Resvg(svg, {
    font: { loadSystemFonts: false, fontFiles, defaultFontFamily: "Lato" },
  }).render().asPng(),
);
console.log("Generated public/social/adi-singhal.png (1200 × 630).");
