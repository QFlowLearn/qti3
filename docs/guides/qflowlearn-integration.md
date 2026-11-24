# How QFlowLearn embeds qti3 for authoring preview

QFlowLearn embeds the native qti3 Web Component in a Preact preview. QFlowLearn
prepares item XML and supplies the preview controls, language settings, and diagnostic
messages. qti3 renders the item, records responses, scores the preview, and serializes
attempt state.

This walkthrough follows the public implementation at
[revision 5253ff9](https://github.com/QFlowLearn/qflow-author/tree/5253ff989e734604ea7147a59ed35810d7387750),
reviewed on November 24, 2026. Its scope is authoring preview. Production deployment,
certification, and authoritative learner grading require separate evidence.

## Follow an item from draft to preview

1. **Prepare item XML.** QFlowLearn's
   [preview builder](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/lib/qti_preview.ts)
   prepares the authoring draft and returns either item XML or structured build issues.
   Its [writer adapter](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/lib/types/qti3_writer_adapter.ts)
   passes typed authoring data to the qti3 writer.
2. **Create the player.** The
   [preview component](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/islands/QtiItemPreview.tsx)
   imports the player, registers `qti-assessment-item-player`, and creates an instance.
   It sets the interface language and matching message catalog before loading XML.
3. **Listen for player events.** QFlowLearn uses `qti-ready`, `qti-statechange`,
   `qti-diagnostics`, `qti-score`, and `qti-validation` to update its status messages,
   response counts, diagnostics, and callbacks.
4. **Score a response.** QFlowLearn's check button calls `scoreAttempt()` with response
   validation enabled. When the player emits `qti-score`, QFlowLearn calls `serialize()`
   and can pass the attempt state to the calling component. Its reset button calls
   `reset()`.

The [item-bank preview](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/islands/assessment_builder/BankQuestionPreview.tsx)
reuses this component. It loads a selected item revision, parses the server response,
and passes the XML, title, and language settings to the preview.

## Compare player and application responsibilities

The application that embeds qti3 controls the surrounding workflow:

| Responsibility       | qti3                                      | QFlowLearn                                                |
| -------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Item XML             | Parse and process QTI semantics           | Build XML from an authoring draft and select the revision |
| Browser presentation | Render interactions and collect responses | Provide preview layout, buttons, and interface messages   |
| Preview scoring      | Run the item's response processing        | Trigger scoring and display or use the result             |
| Attempt state        | Serialize a versioned QTI attempt         | Decide whether to store it and which user it belongs to   |
| Item bank            | Render the selected item's XML            | Fetch and validate the item-bank preview response         |

QFlowLearn's Preact components remain outside qti3 core. If your application uses
React, the optional React adapter wraps the same native player.

## Try the player in a small app

Open the [React starter](https://qflowlearn.github.io/qti3/starter/) without an account.
It uses a synthetic MIT-licensed item to demonstrate the player API. The starter has
its own interface and browser storage; the QFlowLearn implementation above uses Preact.

1. Choose the attendance-records answer and select **Score response**. Expect `Score: 1`.
2. Select **Save attempt**.
3. Reload the page, then select **Restore saved attempt**. The selected answer and
   score return.
4. Choose the repainting answer and score again. Expect `Score: 0`.
5. Open **Inspect attempt JSON** to read the response and outcome values.

The [starter source](../../examples/react-starter/src/App.tsx) shows how the app
provides controls and storage. Follow the [React guide](render-qti-react.md) to run
or copy it.

In the [conversion demo](https://qflowlearn.github.io/qti3/convert.html), you can also
create or migrate an item, review diagnostics, and preview the output XML with the
same player.

## Review test coverage

QFlowLearn's public
[preview browser suite](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/tests/qti_preview_browser_test.ts)
contains rendering, interaction-state, and language checks for its preview component.
The qti3 [starter browser tests](../../tests/browser/react-starter.spec.ts) check scores,
saved-state restoration, keyboard operation, and accessibility in the example above.
These tests cover the named preview workflows. Certification and full assessment-system
conformance require separate evidence.

For graded delivery, use [server-side scoring](score-qti-node.md) with authoritative
item XML and follow the [candidate-view contract](../../README.md#candidate-view).
Use browser scoring for author review.
