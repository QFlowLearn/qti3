# Migrate QTI 2 assessment items to QTI 3

Convert a QTI 2.1 multiple-choice item into QTI 3 XML with
`@longsightgroup/qti3-migrator`. Inspect diagnostics before using converted content.
The migrator checks whether its writer can preserve the source item's scoring.

## Try conversion in your browser

Open the [item conversion demo](https://qflowlearn.github.io/qti3/convert.html),
choose migration, and load the QTI 2.1 example. Run the conversion and inspect the
diagnostics, XML output, and preview. This demo handles individual items and keeps
inputs in browser memory; it does not convert whole packages or bundle assets.

## Run the repository example

From the repository root, use Node.js 22+ and pnpm:

```sh
pnpm install
pnpm build
node examples/manual/quick-start/migrate.mjs > /tmp/planets-qti3.xml
node packages/cli/dist/index.js validate /tmp/planets-qti3.xml
```

The [runnable script](../../examples/manual/quick-start/migrate.mjs) reads a
[synthetic QTI 2.1 item](../../examples/manual/quick-start/legacy-item.xml). Successful
migration writes QTI 3 XML to standard output and sends diagnostics to standard error.
The converted question asks for the red planet and retains Mars (`B`) as the correct
answer. Validation should exit successfully.

## Convert an item in your own project

Install the migrator:

```sh
pnpm add @longsightgroup/qti3-migrator
```

Save the linked QTI 2.1 example as `legacy-item.xml`, then copy the runnable script
into the same directory as `migrate.mjs`. Run:

```sh
node migrate.mjs > migrated-item.xml
```

The script calls `migrateQtiToQti3({ filename, xml })` with strict defaults. It checks
both migration-level and item-level diagnostics, requires exactly one item, and
writes XML only if no error prevents conversion. If conversion fails, the process
exits unsuccessfully; the redirected file can be empty and must not be imported.

Load successful output into the [interactive manual](https://qflowlearn.github.io/qti3/)
using **Paste QTI XML**. Choose Mars and score the attempt: expect `1`. Choose Venus
and score again: expect `0`. Use the [Node scoring guide](score-qti-node.md) to
check converted items without a browser.

## Review conversion limits

Migration supports specific legacy structures and scoring programs. It reports an
error when it cannot preserve semantics, including unsupported custom response
processing, some response mappings, and item-level QTI 2 modal feedback. Safe repair
does not permit dropping scoring rules. Review diagnostics even when XML is present.

For ZIP packages, use `migrateQtiToQti3Package` and the writer's package APIs; the
single-item script above does not preserve a package's asset closure. Assessment-test
structure preservation is not implemented: package migration reports a flat review
part instead. Check the [migrator reference](../../packages/migrator/README.md) for
supported forms, preservation errors, package APIs, and repair policies.

Migration to QTI 3 and export to an LMS are separate tasks. Use the
[transcoder](../../packages/transcoder/README.md) with an explicit output profile
when exporting QTI 3 items to another format.
