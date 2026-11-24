# Render a QTI 3 question in React

Embed a multiple-choice question, capture its response, and show a local preview score.
The React adapter loads XML into the native qti3 Web Component and forwards its events.

## Run the complete starter

[Try the live React starter](https://qflowlearn.github.io/qti3/starter/) to render,
score, save, and restore an attempt. To run it locally:

```sh
git clone --depth 1 https://github.com/QFlowLearn/qti3.git
cd qti3/examples/react-starter
pnpm install
pnpm dev
```

The starter uses published packages, so no core build is required. You can copy
`examples/react-starter` into your own project. See its
[README](../../examples/react-starter/README.md) for expected scores and saved-state behavior.

## Run the repository example

From the repository root, use Node.js 22+ and pnpm:

```sh
pnpm install
pnpm build
pnpm dev:adapter-react
```

Open the local `/adapter-react.html` URL. The example loads a synthetic civics question.
Choose an answer, then select **Serialize via ref** to inspect the saved response.

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

Run `pnpm dev` and open the printed URL. Select the attendance-records answer and
choose **Score response**. Expect `Score: 1`. Select the repainting answer and score
again. Expect `Score: 0`.

Vite's `?raw` import loads the XML as text. The fixture is synthetic and MIT-licensed.
For your own item, replace that import with your XML string. Keep load options and
host callbacks that affect loading stable across renders; the module-level options
above keep score-message updates from resetting the question.

## Connect your host application

Use `onResponseChange` to observe responses and `onStateChange` to observe attempt state.
The ref exposes `serialize()`, `restore(state)`, and `reset()` for a host-controlled attempt.
The [React adapter reference](../../packages/player-react/README.md) describes loading,
localization, events, and restored state.

This example includes an answer key and scores in the browser for preview. For graded
delivery, prepare candidate-safe XML on the server and keep authoritative XML and
scoring there. Follow [server-side scoring](score-qti-node.md) and the
[candidate-view contract](../../README.md#candidate-view).
