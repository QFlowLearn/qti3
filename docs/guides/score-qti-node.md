# Score QTI responses in Node without a browser

Run QTI response processing against authoritative item XML with
`@longsightgroup/qti3-core`. The core has zero third-party runtime dependencies and
requires no DOM or player.

## Run the repository example

From the repository root, use Node.js 22+ and pnpm:

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

Save the linked synthetic item as `item.xml`, then save this code as `score.mjs`
in the same directory:

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

Run `node score.mjs`. Expect score `1` and an outcomes object containing `SCORE: 1`.
The response key must match the item's response declaration; its value must match
that declaration's cardinality and base type. This item declares one identifier.

## Handle scoring results

Check `ok` before accepting a grade, and retain diagnostics for review. A failed
parse, invalid response, or processing error must not become a zero grade by default.
A score of zero can be a valid incorrect answer. Human-graded and externally graded
items need a separate grading workflow; this example uses automatic numeric scoring.

`trustedResponses` is an application boundary. These examples supply fixed synthetic
values. A delivery host must authenticate the attempt, load its authoritative item,
and validate submitted identifiers and values before invoking this API. Keep answer
keys, scoring XML, and saved authoritative state on the server.

The result also includes responses, outcomes, and versioned attempt state. See the
[core reference](../../packages/core/README.md#server-side-scoring) for scoring APIs
and the [attempt-state contract](../../README.md#attempt-state) for persistence.
