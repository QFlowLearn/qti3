# Build the documentation site

Run `pnpm build` and `pnpm pages:build` from the repository root. GitHub Pages publishes
`dist/pages` at `https://qflowlearn.github.io/qti3/`.

The integration guides use `docs/guides/*.md` as their source. The `qti3-site-guides`
Vite plugin renders them during development and production builds. To edit a guide,
change its Markdown source. The small HTML entry files under `examples/manual/guides`
identify build routes; they do not contain a second copy of the content.

Guide links to other guides become local website links. Links to package references
and example source files point to their corresponding files on GitHub. Guide pages
include server-rendered content, canonical URLs, descriptions, and section navigation;
reading them does not require JavaScript.

## Markdown dependency decision

`marked@18.2.1` is an exact, MIT-licensed development dependency used only by the
site build. It replaces the need to maintain a Markdown parser or manually duplicate
three tutorials as HTML. It processes trusted repository documentation, never imported
assessment XML or visitor input. It adds no runtime dependency to a published qti3
package and sends no Markdown renderer to browsers. The exact version is reviewed in
`scripts/dependency-policy.json` and meets the repository's seven-day release delay.

When adding a guide, register it in `examples/manual/site-guides.ts`, add its HTML
entry file, link it from the relevant navigation, and include its URL in the sitemap.
