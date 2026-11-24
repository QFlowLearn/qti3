# Render a QTI 3 question in React

Use the qti3 React adapter to display a multiple-choice question and score a response
in your browser. The adapter loads item XML into the native Web Component and
forwards player events to your React app.

## Run the complete starter

[Try the live React starter](https://qflowlearn.github.io/qti3/starter/) to render,
score, save, and restore an attempt. To run it locally:

```sh
git clone --depth 1 https://github.com/QFlowLearn/qti3.git
cd qti3/examples/react-starter
pnpm install
pnpm dev
```

The starter uses published packages, so you do not need to build qti3. You can also
copy `examples/react-starter` into your own project. The
[starter instructions](../../examples/react-starter/README.md) explain how to check
scores and save and restore an attempt.

## Run the repository example

With Node.js 22.12 or later and pnpm installed, run these commands from the repository root:

```sh
pnpm install
pnpm build
pnpm dev:adapter-react
```

On the local server, open `/adapter-react.html`. The example loads a synthetic civics
question. Choose an answer, then select **Serialize via ref** to inspect the attempt
state for that response.

## Add the player to a React app

For a new app, create a Vite React TypeScript project:

```sh
pnpm create vite qti-react --template react-ts
cd qti-react
pnpm install
pnpm add @longsightgroup/qti3-player-react @longsightgroup/qti3-player @longsightgroup/qti3-fixtures
```

Replace `src/App.tsx` with this component:

```tsx
import { useRef, useState } from "react";
import type { QtiPlayerLoadOptions } from "@longsightgroup/qti3-player";
import {
  QtiAssessmentItemPlayer,
  type QtiAssessmentItemPlayerHandle,
} from "@longsightgroup/qti3-player-react";
import xml from "@longsightgroup/qti3-fixtures/xml/choice-reference.xml?raw";

const loadOptions: QtiPlayerLoadOptions = { status: "interacting" };

export default function App() {
  const player = useRef<QtiAssessmentItemPlayerHandle>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading question…");

  function scorePreview() {
    const result = player.current?.scoreAttempt();
    if (!result) return;
    const score = result.outcomes.SCORE;
    const errors = result.diagnostics.filter((entry) => entry.severity === "error");
    setMessage(
      errors.length > 0
        ? errors.map((entry) => entry.message).join("; ")
        : `Score: ${typeof score === "number" ? score : "requires external grading"}`,
    );
  }

  return (
    <main>
      <h1>QTI question preview</h1>
      <QtiAssessmentItemPlayer
        ref={player}
        xml={xml}
        loadOptions={loadOptions}
        onReady={() => {
          setReady(true);
          setMessage("Choose an answer, then score your response.");
        }}
        onResponseChange={() => setMessage("Response changed. Score it to see the result.")}
        onLoadError={(error) => {
          setReady(false);
          setMessage(error.message);
        }}
      />
      <button type="button" disabled={!ready} onClick={scorePreview}>
        Score response
      </button>
      <p role="status">{message}</p>
    </main>
  );
}
```

Run `pnpm dev` and open the local URL that Vite prints. Choose the attendance-records
answer, then select **Score response**. Expect `Score: 1`. Choose the repainting
answer and score again. Expect `Score: 0`.

Vite's `?raw` import loads the XML as text. The fixture is synthetic and MIT-licensed.
To use your own item, replace the fixture import with your XML string.

Keep load options and callbacks that affect loading stable across renders. In this
example, `loadOptions` is defined outside the component so score-message updates
do not reset the question.

## Connect your host application

Use `onResponseChange` to read response updates and `onStateChange` to read attempt
state. Through the player ref, your app can call `serialize()`, `restore(state)`,
and `reset()` to manage the attempt.
The [React adapter reference](../../packages/player-react/README.md) describes loading,
localization, events, and restored state.

The example includes an answer key for local preview scoring. For graded delivery,
keep the approved item XML and scoring on the server. Send candidate-safe XML to
the browser. The [Node scoring guide](score-qti-node.md) and
[candidate-view contract](../../README.md#candidate-view) describe these steps.
