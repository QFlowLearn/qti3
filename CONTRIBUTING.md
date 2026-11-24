# Contribute to qti3

Help reproduce compatibility problems, improve integration examples, or check
keyboard and assistive-technology behavior. Start with the
[open starter tasks](https://github.com/QFlowLearn/qti3/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22)
and describe your proposed work on the relevant issue before making a large change.

You can start with one of these tasks:

- [Write a Vue 3 integration recipe](https://github.com/QFlowLearn/qti3/issues/45).
- [Review the starter with Safari and VoiceOver](https://github.com/QFlowLearn/qti3/issues/46).
- [Document a migration refusal with explicit scoring expectations](https://github.com/QFlowLearn/qti3/issues/47).

## Report a compatibility problem

Use the [compatibility report form](https://github.com/QFlowLearn/qti3/issues/new?template=compatibility.yml).
Include the source product and export format, qti3 package versions, runtime, exact
reproduction steps, expected behavior, actual behavior, and diagnostic codes.
For a scoring problem, include the submitted response values and the grade expected
from the source item. For an accessibility problem, describe the keyboard sequence
or assistive-technology output. Include the browser and operating system versions.

Use synthetic XML or a public, licensed sample. Never attach private question banks,
learner data, official certification content, customer packages, real answer keys,
or credentials. Remove identifying data from metadata, images, and other assets
as well as names visible in the question.
If you cannot share a reproduction, explain the problem and include diagnostics
with private data removed. Keep the original package private.

Contributed fixtures must be synthetic and MIT-licensed. Identify the license and
source of any external reference material before proposing its inclusion.

## Run the project

Use the Node version in `.node-version` and the pnpm version in `package.json`:

```sh
pnpm install
pnpm build
pnpm dev
```

The [standalone React starter](examples/react-starter/README.md) uses published
packages and can run without building the monorepo. The
[integration guides](https://qflowlearn.github.io/qti3/guides/render-qti-react.html)
explain how to render items, score responses, migrate content, and embed the player.

## Make a focused change

Keep parsing, validation, processing, rendering, and host behavior separate. The
core and CLI must have zero third-party runtime dependencies. Framework-specific
integration belongs in optional adapters or examples.

Edit website guide content in `docs/guides/*.md`; the site generates its HTML from
those sources. See [site building](docs/site-building.md). Read [AGENTS.md](AGENTS.md)
for the full engineering and dependency rules.

Before submitting code, run:

```sh
pnpm verify
```

For browser changes, install the supported Playwright browsers and run the relevant
suite. For example, the starter and guide suites run with:

```sh
pnpm exec playwright install chromium
pnpm exec playwright test tests/browser/react-starter.spec.ts tests/browser/manual-guides.spec.ts --project chromium
```

Keep Node tests DOM-free. Test DOM, keyboard, ARIA, focus, and browser storage in
Playwright against the actual implementation. Avoid mocks and DOM shims. New tests
must meet the [test quality bar](docs/test-quality-bar.md); conformance changes must
also follow [spec regression testing](docs/spec-regression-testing.md).

## Submit a pull request

Explain what failed for the caller, how your change fixes it, and which checks you ran.
Link the issue and include a minimal synthetic reproduction where useful. For each
regression test, identify the defect it detects and the assertion that detects it. Add
support metadata and conformance evidence before claiming support for a new element.

Project code, examples, and public synthetic fixtures are MIT-licensed. By submitting
material for inclusion, you agree to provide it under the repository's MIT license.
Do not submit material whose license or ownership prevents that use.
