# Development dependency security pins

The formatter and Vite toolchain retain their existing direct versions. The workspace
overrides the affected transitive resolutions to reviewed security patches:

| Dependency                         | Existing resolution | Patched resolution | Reason                                                                                                                                                |
| ---------------------------------- | ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tinypool through oxfmt 0.52.0      | 2.1.0               | 2.1.2              | [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) and [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) |
| source-map-js through PostCSS/Vite | 1.2.1               | 1.2.2              | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)                                                                              |

Tinypool 2.1.2 is MIT licensed; source-map-js 1.2.2 is BSD-3-Clause licensed.
Both changes stay within their existing minor release lines. The exact lockfile
allowlist records the patched versions. Core and CLI gain no runtime dependencies.

oxfmt 0.52.0 pins Tinypool exactly, so a range-respecting update cannot resolve its
advisories. The explicit override preserves the formatter version while applying
the patch. PostCSS permits the source-map-js patch, but the configured seven-day
minimum release age initially prevents its installation. The age exception names
only source-map-js 1.2.2, the reviewed patch released September 30, 2026; it does not
exempt future releases or disable the overall age policy.

Verify changes with a frozen-lockfile install, `pnpm audit --audit-level high` and
`pnpm verify`. The normal CI audit threshold and release checks remain enabled.
Remove each override when the corresponding upstream toolchain resolves a reviewed
patched version by default; remove the exact age exception when it is unnecessary.

## Picomatch toolchain version

The workspace pins transitive picomatch dependencies to 4.0.7, the latest published
release as of November 17, 2026. Vite and Vitest use it for development tooling;
published QTI packages do not depend on it.

This update does not resolve
[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf),
which affects versions through 4.0.7. No patched release is available as of
November 17, 2026.

The workspace accepts a development-tool exception for this advisory only.
Vite and Vitest match repository-controlled file patterns; QTI assessment content
is not passed to picomatch. Published-package dependencies audit clean before
applying the exception. This accepts the unresolved development risk; it does
not fix picomatch. The high-severity audit threshold and all other findings
remain enforced.

Remove the exception and update the pin and dependency allowlist when a patched
release becomes available. Review the exception when changing Vite or Vitest,
accepting untrusted glob patterns, or adding published runtime dependencies.

## Type-aware promise checks

Oxlint 1.94.0 uses `tsrs` 0.25.0-ts7.1.0-beta in place of `oxlint-tsgolint`.
This Oxlint version supports [tsrs backend discovery](https://github.com/oxc-project/tsrs#type-aware-lint).
Oxlint is MIT licensed; tsrs and its native packages are Apache-2.0 licensed.
The dependency allowlist and exact release-age exceptions record this cohort.
Future versions remain subject to the normal age policy. Core and CLI gain no runtime dependencies.

The existing TypeScript 6.0.3 build and full compiler checks remain independent.
Packages, browser tests, and manual examples enforce `await-thenable`,
`no-floating-promises` with `ignoreVoid: false`, `no-misused-promises`,
`return-await` in `error-handling-correctness-only` mode, and
`prefer-promise-reject-errors`. A bare `void` does not establish promise ownership.

Features retain their expected-error feedback. Unexpected drawing and demo failures
use the browser's [native error-reporting channel](https://html.spec.whatwg.org/multipage/webappapis.html#dom-reporterror).
The drawing regression checks this channel through a real renderer callback.
Removing its rejection handler changes the observed event to an unhandled rejection
and fails the assertion.

When upgrading tsrs, check promise-rule coverage across packages, tests, examples,
and scripts. Keep `pnpm typecheck`, `pnpm verify`, and the browser matrix in
`pnpm release:check`; lint coverage does not replace them.
