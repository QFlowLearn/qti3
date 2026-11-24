# Score QTI responses in Node without a browser

Use `@longsightgroup/qti3-core` to score responses against the item XML your server
trusts. The core runs without a browser, DOM, or player and has zero third-party
runtime dependencies.

## Run the repository example

With Node.js 22.12 or later and pnpm installed, run these commands from the repository root:

```sh
pnpm install
pnpm build
node examples/manual/quick-start/score.mjs
```

The example asks which planet is known as the red planet. Response `B` selects Mars;
response `A` selects Venus. Expect:

```text
B: 1
A: 0
```

The [runnable script](../../examples/manual/quick-start/score.mjs) reads a
[synthetic QTI 3 item](../../examples/manual/quick-start/item.xml) and scores each
response independently.

## Score an item in your own project

Install the core package in your Node project:

```sh
pnpm add @longsightgroup/qti3-core
```

Save the [synthetic QTI 3 item](../../examples/manual/quick-start/item.xml) as
`item.xml`. In the same directory, save this code as `score.mjs`:

```js
import { readFile } from "node:fs/promises";
import { scoreQtiItemServerSide } from "@longsightgroup/qti3-core";

const itemXml = await readFile(new URL("./item.xml", import.meta.url), "utf8");
const result = scoreQtiItemServerSide({
  itemXml,
  trustedResponses: { RESPONSE: "B" },
});

if (!result.ok) {
  console.error(result.diagnostics);
  process.exitCode = 1;
} else {
  console.log(result.score);
  console.log(result.outcomes);
}
```

Run `node score.mjs`. Expect a score of `1` and an outcomes object containing
`SCORE: 1`.

The response key, `RESPONSE`, matches the item's response declaration. That declaration
requires a single identifier, so the response value is the string `"B"`. For other
items, use the cardinality and base type declared in their XML.

## Handle scoring results

Check `ok` before you accept a grade, and keep the diagnostics for review. If parsing,
response validation, or processing fails, handle the error instead of assigning zero.
Zero can be a valid score for an incorrect answer.

This example uses automatic numeric scoring. Human-graded and externally graded
items require a separate grading workflow.

The examples pass fixed synthetic values in `trustedResponses`. Before your server
passes learner responses to this API, authenticate the attempt, load the approved
item XML, and validate the submitted identifiers and values. Keep answer keys,
scoring XML, and authoritative attempt state on the server.

The result also includes responses, outcomes, and versioned attempt state. The
[core reference](../../packages/core/README.md#server-side-scoring) describes the
scoring API. The [attempt-state contract](../../README.md#attempt-state) describes
the JSON you can save and restore.
