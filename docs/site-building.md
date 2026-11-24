# Build the documentation site

From the repository root, run `pnpm build` and `pnpm pages:build`. GitHub Pages
publishes `dist/pages` at `https://qflowlearn.github.io/qti3/`.

To edit an integration guide, change its Markdown source in `docs/guides/`.
The `qti3-site-guides` Vite plugin renders these files during development and
production builds. The HTML entry files in `examples/manual/guides/` identify
routes; the Markdown files contain the guide text.

The plugin converts links between guides into local website links. Links to package
references and example source files point to GitHub. The built HTML contains the
full guide, canonical URL, description, and section navigation, so you can read a
guide without JavaScript.

## Markdown dependency decision

The site build uses `marked@18.2.1`, an MIT-licensed development dependency pinned
to an exact version. It renders the Markdown guides so maintainers do not need to
write a parser or maintain separate HTML copies.

The renderer processes trusted repository documentation. It does not process imported
assessment XML or visitor input. The site does not send the renderer to browsers,
and no published qti3 package gains a runtime dependency. The approved version is
recorded in `scripts/dependency-policy.json` and meets the seven-day release delay.

## Syntax highlighting dependency decision

The site build uses `highlight.js@11.12.0`, a BSD-3-Clause development dependency
pinned to an exact version. It adds token markup to fenced code blocks while Vite
renders the guide. Only the shell, JavaScript, TypeScript/TSX, and XML/HTML grammars
are loaded. This avoids a custom tokenizer and adds no browser script or published
package runtime dependency. The version is recorded in `scripts/dependency-policy.json`.

Code remains selectable text inside keyboard-focusable blocks. The stylesheet uses
colors with at least 4.5:1 contrast against the white code background. In forced-colors
mode, code uses the reader's system text color. Plain-text fences remain unhighlighted.
Use a registered language in each code fence; the build rejects unknown languages.

## Add a guide

1. Write the Markdown source in `docs/guides/`.
2. Register the guide in `examples/manual/site-guides.ts`.
3. Add its HTML entry file in `examples/manual/guides/`.
4. Link the guide from the relevant navigation and add its URL to the sitemap.
