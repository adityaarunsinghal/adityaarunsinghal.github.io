import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/**
 * Convert the same public HTML that visitors receive. Do not maintain a second
 * biography or course transcript. Preserve disclosure content and chapter names,
 * but omit controls, scripts and decorative/duplicate navigation.
 */
export function htmlToMarkdown(html, canonicalUrl) {
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  service.use(gfm);

  service.addRule("inlineLabels", {
    filter: "span",
    replacement: (content) => content.trim() ? ` ${content.trim()} ` : "",
  });
  service.addRule("disclosureHeading", {
    filter: "summary",
    replacement: (content) => `\n\n### ${content.trim()}\n\n`,
  });
  service.addRule("recordingChapter", {
    filter: (node) => node.nodeName === "BUTTON" && node.hasAttribute("data-recording-seek"),
    replacement: (content) => content,
  });
  service.addRule("absoluteLinks", {
    filter: (node) => node.nodeName === "A" && node.hasAttribute("href"),
    replacement(content, node) {
      const href = node.getAttribute("href");
      const label = content.trim() || node.getAttribute("aria-label") || "";
      if (!label || !href) return label;
      const url = new URL(href, canonicalUrl).href;
      if (!/^(?:https?:|mailto:|tel:)/.test(url)) return label;
      return `[${label}](${url.replace(/\(/g, "%28").replace(/\)/g, "%29")})`;
    },
  });
  service.addRule("absoluteImages", {
    filter: "img",
    replacement(_content, node) {
      const src = node.getAttribute("src");
      const alt = (node.getAttribute("alt") || "").replace(/[[\]]/g, "\\$&");
      return src && alt ? `![${alt}](${new URL(src, canonicalUrl).href})` : "";
    },
  });
  // Added last so omitted elements take precedence over link/image rules.
  service.addRule("publicContentOnly", {
    filter(node) {
      const tag = node.nodeName;
      if (tag === "NAV" && node.getAttribute("aria-label") === "Main navigation") return false;
      if (["HEAD", "TITLE", "META", "LINK", "BASE", "SCRIPT", "STYLE", "NOSCRIPT",
        "NAV", "CANVAS", "SVG", "IFRAME", "FORM", "INPUT", "SELECT", "TEXTAREA"].includes(tag)) return true;
      if (tag === "BUTTON" && !node.hasAttribute("data-recording-seek")) return true;
      if (tag === "FOOTER" && node.parentNode?.nodeName !== "BLOCKQUOTE") return true;
      if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") return true;
      return /(?:^|\s)(?:workshop-skip-link|document-skip-link|document-header|term-lights|term-meta|term-gh)(?:\s|$)/
        .test(node.getAttribute("class") || "");
    },
    replacement: () => "",
  });

  let markdown = service.turndown(html).trim();
  // A portrait or eyebrow may precede the H1 in the visual layout. A Markdown
  // document still starts with its single real title, keeping preceding content.
  const heading = markdown.match(/^# .+$/m);
  if (!heading) throw new Error(`Missing public document title: ${canonicalUrl}`);
  markdown = markdown.replace(heading[0], "").trim();
  return `${heading[0]}\n\nSource: ${canonicalUrl}\n\n${markdown}\n`;
}
