# Development tooling and security pins

The repository pins its tools and dependency graph in `package.json`,
`pnpm-workspace.yaml`, and `scripts/dependency-policy.json`. Core and CLI gain no
runtime dependencies from these development tools.

## Current toolchain

Use Node 26.13.1 from `.node-version` and pnpm 12.21.0. The compiler is TypeScript
7.0.2; Vite 8.3.8 uses native Oxc transforms. Vitest 5.1.1, Playwright 1.65.1,
axe-core 4.14.1, oxfmt 0.79.0, and Oxlint 1.94.0 own testing and static checks.
The full compiler build remains independent of type-aware lint.

Node declarations stay on the latest Node 22 release line to check the minimum
supported runtime API. Adapter test dependencies stay within their supported
React 19 and Preact 10 peer ranges. axe-core retains its existing MPL-2.0 license
and remains confined to accessibility testing; it is not a published runtime dependency.

The dependency allowlist covers every package in both pnpm lockfile documents,
including pnpm's own native packages. Tests reject unreviewed entries in either
document. The seven-day release-age policy remains enabled; exact exceptions
cover the current toolchain cohort and its required native packages. Future
versions remain subject to the normal age policy.

## Security resolutions

The current formatter resolves Tinypool 2.2.0, and PostCSS resolves source-map-js
1.2.2. Their earlier security overrides and release-age exception are no longer
needed and have been removed.

Picomatch resolves to 4.0.7 through Vite and Vitest. GitHub
[withdrew GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
on November 18, 2026. The former audit exception and forced version override are
removed. `pnpm audit --audit-level high` passes without advisory exclusions.

Verify updates with a frozen-lockfile install, the dependency policy check, an
unfiltered audit, and `pnpm release:check`.

## Type-aware promise checks

Oxlint uses `tsrs` 7.1.0-beta.tsrs3 as its type-aware backend. Oxlint is MIT
licensed; tsrs and its native packages are Apache-2.0 licensed.

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
