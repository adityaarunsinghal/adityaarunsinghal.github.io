import assert from "node:assert/strict";
import test from "node:test";
import { htmlToMarkdown } from "./markdown.mjs";

const origin = "https://adityasinghal.com/course/";

test("uses the real H1 and removes metadata, scripts and hidden navigation", () => {
  const result = htmlToMarkdown(`<html><head><title>Metadata only</title>
    <script>privateImplementation()</script></head><body>
    <a class="workshop-skip-link" href="#main">Skip</a>
    <p>Eyebrow</p><h1>Published title</h1><main id="main">
    <p>Published description</p><p hidden>Hidden control state</p>
    </main><footer>Duplicate navigation</footer></body></html>`, origin);
  assert.ok(result.startsWith("# Published title\n\nSource: " + origin));
  assert.match(result, /Eyebrow/);
  assert.match(result, /Published description/);
  assert.doesNotMatch(result, /Metadata only|privateImplementation|Hidden control|Skip|Duplicate navigation/);
});

test("preserves disclosure prose, accessible icon links and recording chapters", () => {
  const result = htmlToMarkdown(`<h1>Course</h1>
    <details><summary>Prerequisites</summary><p>Some Python</p></details>
    <a href="/profile/" aria-label="Public profile"><span aria-hidden="true">X</span></a>
    <ol><li><button data-recording-seek="20"><span>0:20</span><span>Agent tools</span></button></li></ol>
    <button>Share control</button>`, origin);
  assert.match(result, /### Prerequisites/);
  assert.match(result, /Some Python/);
  assert.match(result, /\[Public profile\]\(https:\/\/adityasinghal\.com\/profile\/\)/);
  assert.match(result, /0:20\s+Agent tools/);
  assert.doesNotMatch(result, /Share control/);
});

test("preserves table structure, code and original quote attribution", () => {
  const result = htmlToMarkdown(`<h1>Guide</h1>
    <table><thead><tr><th>Endpoint</th><th>Purpose</th></tr></thead><tbody>
    <tr><td>/api/v1/profile.json</td><td>Profile</td></tr></tbody></table>
    <pre><code>const value = 1;\nconsole.log(value);</code></pre>
    <blockquote><p>Published quote</p><footer>Original speaker</footer></blockquote>`, origin);
  assert.match(result, /\| Endpoint \| Purpose \|/);
  assert.match(result, /```[\s\S]*const value = 1;[\s\S]*```/);
  assert.match(result, /> Original speaker/);
});

test("resolves relative links and declines pages without a document title", () => {
  const result = htmlToMarkdown('<h1>Course</h1><a href="materials/">Materials</a>', origin);
  assert.match(result, /\(https:\/\/adityasinghal\.com\/course\/materials\/\)/);
  assert.throws(() => htmlToMarkdown("<p>No title</p>", origin), /Missing public document title/);
});
