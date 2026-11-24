# QTI 3 React starter

Use the published qti3 React adapter to render a question, score a response, and
save and restore an attempt in your browser. The example item is synthetic and
MIT-licensed.

[Try the live starter](https://qflowlearn.github.io/qti3/starter/).

## Run locally

With Node.js 22.12 or later and pnpm 12.21.0 installed, clone the repository and
enter the starter directory:

```sh
git clone --depth 1 https://github.com/QFlowLearn/qti3.git
cd qti3/examples/react-starter
```

Install the packages and start the app:

```sh
pnpm install
pnpm dev
```

Open the local URL that Vite prints. The starter uses published packages pinned in
`package.json`, so you do not need to build qti3. You can also copy this directory
into your own project and run the same two commands.

Choose the attendance-records answer and select **Score response**. Expect `Score: 1`.
Choose the repainting answer and score again. Expect `Score: 0`.

To check restoration, select **Save attempt**. Reload the page, then select
**Restore saved attempt**. The selected response and scored outcomes return.
**Reset response** clears the current response without deleting the saved attempt.

Use the same browser profile and origin to restore an attempt. An origin consists
of the scheme, hostname, and port in the URL. Clearing site data deletes the saved
attempt. For graded delivery, keep the authoritative assessment record on the server.

## Change the question

In `src/App.tsx`, replace the fixture import with your own XML string. The native
player renders the item and processes its QTI rules. The React app provides buttons,
status messages, and browser storage. Keep `loadOptions` outside the component so
updates to status messages do not reload the question.

`pnpm build` type-checks the app and produces `dist/`. `pnpm preview` serves that build.
See the [integration guide](https://qflowlearn.github.io/qti3/guides/render-qti-react.html)
for API details and server-side delivery boundaries.
