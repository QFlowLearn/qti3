import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Marked, Renderer } from "marked";

export const siteGuides = [
  {
    slug: "qflowlearn-integration",
    title: "How QFlowLearn embeds qti3 for authoring preview",
    description:
      "Follow the public QFlowLearn host integration and try the same player boundary in a runnable starter.",
  },
  {
    slug: "render-qti-react",
    title: "Render a QTI 3 question in React",
    description:
      "Embed a QTI 3 question in React, capture a response, and show a local preview score.",
  },
  {
    slug: "score-qti-node",
    title: "Score QTI responses in Node without a browser",
    description:
      "Run QTI response processing in Node with authoritative XML and no DOM dependencies.",
  },
  {
    slug: "migrate-qti2",
    title: "Migrate QTI 2 assessment items to QTI 3",
    description: "Convert a QTI 2.1 item to QTI 3, review diagnostics, and check its scoring.",
  },
] as const;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

/** Render trusted repository Markdown for the static site; assessment XML never enters this path. */
export async function renderSiteGuide(slug: string): Promise<string> {
  const guide = siteGuides.find((entry) => entry.slug === slug);
  if (!guide) throw new Error(`Unknown website guide: ${slug}`);
  const source = await readFile(
    new URL(`../../docs/guides/${guide.slug}.md`, import.meta.url),
    "utf8",
  );
  const renderer = new Renderer();
  renderer.link = function (token) {
    const linkedGuide = siteGuides.find((entry) => token.href === `${entry.slug}.md`);
    const href = linkedGuide
      ? `${linkedGuide.slug}.html`
      : new URL(token.href, "https://github.com/QFlowLearn/qti3/blob/main/docs/guides/").href;
    return `<a href="${escapeHtml(href)}">${this.parser.parseInline(token.tokens)}</a>`;
  };
  renderer.code = function (token) {
    return `<pre tabindex="0" aria-label="Code example"><code>${escapeHtml(token.text)}</code></pre>\n`;
  };
  renderer.heading = function (token) {
    return `<h${token.depth} id="${headingId(token.text)}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
  };
  const markdown = new Marked({ renderer });
  const content = markdown.parse(source, { async: false });
  const sections = markdown
    .lexer(source)
    .flatMap((token) =>
      token.type === "heading" && token.depth === 2 ? [{ text: token.text }] : [],
    );
  const outline = sections
    .map(
      (section) => `<li><a href="#${headingId(section.text)}">${escapeHtml(section.text)}</a></li>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(guide.title)} · qti3</title>
  <meta name="description" content="${escapeHtml(guide.description)}">
  <link rel="canonical" href="https://qflowlearn.github.io/qti3/guides/${guide.slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(guide.title)}">
  <meta property="og:description" content="${escapeHtml(guide.description)}">
  <meta property="og:url" content="https://qflowlearn.github.io/qti3/guides/${guide.slug}.html">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../src/convert/style.css">
  <link rel="stylesheet" href="../src/guides.css">
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header"><div class="site-header-inner">
    <a class="wordmark" href="../" aria-label="qti3 homepage">qti3</a>
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="../#manual">Interactive manual</a><a href="../integration.html">Use in your app</a>
      <a href="../convert.html">Create and convert</a><a href="https://github.com/QFlowLearn/qti3">GitHub source</a>
    </nav>
  </div></header>
  <main id="content" tabindex="-1" class="content-width guide-layout">
    <article class="guide-content">${content}
      <footer><a href="${escapeHtml(new URL(`../../docs/guides/${guide.slug}.md`, "https://github.com/QFlowLearn/qti3/blob/main/examples/manual/").href)}">Edit this guide on GitHub</a></footer>
    </article>
    <aside class="guide-outline"><nav aria-label="On this page"><h2>On this page</h2><ul>${outline}</ul></nav>
      <nav aria-label="Integration guides"><h2>Integration guides</h2><ul>${siteGuides.map((entry) => `<li><a href="${entry.slug}.html"${entry.slug === slug ? ' aria-current="page"' : ""}>${entry.title}</a></li>`).join("")}</ul></nav>
    </aside>
  </main>
</body>
</html>`;
}

export const siteGuideInputs = Object.fromEntries(
  siteGuides.map((guide) => [
    `guides/${guide.slug}`,
    fileURLToPath(new URL(`guides/${guide.slug}.html`, import.meta.url)),
  ]),
);
