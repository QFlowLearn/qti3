# How QFlowLearn embeds qti3 for authoring preview

QFlowLearn's open-source authoring application uses the native qti3 Web Component
inside a Preact preview. Its host application prepares item XML and supplies the
preview controls, localization, and diagnostics display. qti3 renders the item,
records responses, runs preview scoring, and serializes attempt state.

This walkthrough describes the public implementation at
[revision 5253ff9](https://github.com/QFlowLearn/qflow-author/tree/5253ff989e734604ea7147a59ed35810d7387750),
reviewed on November 24, 2026. It describes authoring preview behavior, not a claim
about production deployment, certification, or authoritative learner grading.

## Follow the integration through the source

1. **Prepare an item.** The host's
   [preview builder](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/lib/qti_preview.ts)
   prepares the authoring draft, builds item XML, and returns either XML or structured
   build issues. The
   [writer adapter](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/lib/types/qti3_writer_adapter.ts)
   calls the qti3 writer through the host's typed authoring boundary.
2. **Mount the player.** The
   [preview component](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/islands/QtiItemPreview.tsx)
   imports the player, registers `qti-assessment-item-player`, and creates an instance.
   It supplies the interface language and matching message catalog before loading XML.
3. **Observe the lifecycle.** The host listens for `qti-ready`, `qti-statechange`,
   `qti-diagnostics`, `qti-score`, and `qti-validation`. Those events update host status,
   response counts, diagnostic messages, and callbacks.
4. **Score a preview response.** The host's check button calls `scoreAttempt()` with
   response validation enabled. On `qti-score`, the host reads `serialize()` and can
   pass the resulting attempt state to its caller. Its reset button calls `reset()`.
5. **Reuse the preview in an item bank.** The
   [bank preview](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/islands/assessment_builder/BankQuestionPreview.tsx)
   loads a selected item revision, parses the preview response, and passes its XML,
   title, and localization context to the same component.

## Keep the host boundary explicit

| Responsibility       | qti3                                      | QFlowLearn host                                                |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Item XML             | Parse and process QTI semantics           | Build XML from an authoring draft and select the revision      |
| Browser presentation | Render interactions and collect responses | Provide preview layout, buttons, and interface messages        |
| Preview scoring      | Run the item's response processing        | Trigger scoring and decide how to display or use the result    |
| Attempt state        | Serialize a versioned QTI attempt         | Decide whether to store it and how to associate it with a user |
| Item bank            | Render the selected item's XML            | Fetch and validate the bank preview response                   |

The host's Preact components remain outside qti3 core. An application using React can
use the optional React adapter around the same native player.

## Try the boundary with a working example

Open the [React starter](https://qflowlearn.github.io/qti3/starter/) without an account.
It demonstrates the same public player boundary with a synthetic MIT-licensed item;
it is a separate example, not the QFlowLearn product UI.

1. Choose the attendance-records answer and select **Score response**. Expect `Score: 1`.
2. Choose **Save attempt**, reload the page, and select **Restore saved attempt**.
   The selected answer and score return.
3. Change to the repainting answer and score again. Expect `Score: 0`.
4. Open **Inspect attempt JSON** to inspect the response and outcome values.

The [starter source](../../examples/react-starter/src/App.tsx) shows the host-owned
controls and storage. The [React guide](render-qti-react.md) explains how to run or
copy the app. The [conversion demo](https://qflowlearn.github.io/qti3/convert.html)
provides a second example: create or migrate an item, inspect diagnostics, and
preview the resulting XML with the same player.

## Evaluate the evidence and limits

QFlowLearn's public
[preview browser suite](https://github.com/QFlowLearn/qflow-author/blob/5253ff989e734604ea7147a59ed35810d7387750/tests/qti_preview_browser_test.ts)
contains rendering, interaction-state, and locale checks for its host integration.
The qti3 repository's
[starter browser tests](../../tests/browser/react-starter.spec.ts) independently
exercise scores, saved-state restoration, keyboard operation, and accessibility
for the runnable example above. These suites cover their named workflows; they do
not establish certification or full assessment-system conformance.

For graded delivery, use [server-side scoring](score-qti-node.md) with authoritative
item XML and follow the [candidate-view contract](../../README.md#candidate-view).
The preview's browser score is for author review.
