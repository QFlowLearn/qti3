# QTI 3 React starter

Run a question with the published qti3 React adapter, score a response, and save and
restore attempt JSON in your browser. This example is synthetic and MIT-licensed.

[Try the live starter](https://qflowlearn.github.io/qti3/starter/).

## Run locally

Use Node.js 22.12+ and pnpm 12.21.0. Clone the repository and enter this directory:

```sh
git clone --depth 1 https://github.com/QFlowLearn/qti3.git
cd qti3/examples/react-starter
```

Then run:

```sh
pnpm install
pnpm dev
```

Open the local URL Vite prints. No qti3 package build is required: this starter uses
published packages pinned in `package.json`. You can also copy this directory into
your own project and run the same two commands.

Choose the attendance-records answer and select **Score response**: expect `Score: 1`.
Choose the repainting answer and score again: expect `Score: 0`.

Choose **Save attempt**, reload the page, and select **Restore saved attempt**.
The selected response and scored outcomes return. **Reset response** starts a new
local response without deleting the saved attempt.

Storage belongs to this browser profile and origin. Clearing site data removes the
saved attempt. This is a preview, not an authoritative assessment or a backup system.

## Change the question

Edit `src/App.tsx` to replace the fixture import with your own XML string. The native
player owns item rendering and QTI processing; this React app owns the buttons,
status messages, and browser storage. Keep the module-level load options stable.

`pnpm build` type-checks the app and produces `dist/`. `pnpm preview` serves that build.
See the [integration guide](https://qflowlearn.github.io/qti3/guides/render-qti-react.html)
for API details and server-side delivery boundaries.
