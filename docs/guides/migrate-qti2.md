# Migrate QTI 2 assessment items to QTI 3

Use `@longsightgroup/qti3-migrator` to convert a QTI 2.1 multiple-choice item to
QTI 3 XML. The migrator checks whether it can preserve the source item's scoring.
Review its diagnostics before you use the converted item.

## Try conversion in your browser

In the [item conversion demo](https://qflowlearn.github.io/qti3/convert.html),
select **Load QTI 2.1 sample**, then **Migrate to QTI 3**. Review the diagnostics
and XML output, then preview the converted question.

The demo keeps individual items in browser memory. To convert a ZIP package with
images or other assets, use the package APIs described below.

## Run the repository example

With Node.js 22.12 or later and pnpm installed, run these commands from the repository root:

```sh
pnpm install
pnpm build
node examples/manual/quick-start/migrate.mjs > /tmp/planets-qti3.xml
node packages/cli/dist/index.js validate /tmp/planets-qti3.xml
```

The [runnable script](../../examples/manual/quick-start/migrate.mjs) reads a
[synthetic QTI 2.1 item](../../examples/manual/quick-start/legacy-item.xml). The script
writes converted QTI 3 XML to standard output and diagnostics to standard error.
The output item asks for the red planet and retains Mars (`B`) as the correct
answer. The validation command should exit successfully.

## Convert an item in your own project

Install the migrator:

```sh
pnpm add @longsightgroup/qti3-migrator
```

Save the [QTI 2.1 sample](../../examples/manual/quick-start/legacy-item.xml) as
`legacy-item.xml`. Copy the [migration script](../../examples/manual/quick-start/migrate.mjs)
into the same directory as `migrate.mjs`, then run:

```sh
node migrate.mjs > migrated-item.xml
```

The script calls `migrateQtiToQti3({ filename, xml })` with strict defaults. It checks
diagnostics for the migration and each item. It writes XML only when the result
contains exactly one item and no conversion errors.

If conversion fails, the process exits with an error. The redirected file can be
empty. Review the diagnostics and correct the source before you import the output.

After conversion succeeds, open **Paste QTI XML** in the
[interactive manual](https://qflowlearn.github.io/qti3/) and load the output.
Choose Mars and score the attempt. Expect `1`. Choose Venus and score again.
Expect `0`. To check scores without a browser, follow the
[Node scoring guide](score-qti-node.md).

## Review conversion limits

The migrator reports an error when it cannot preserve an item's behavior. Examples
include unsupported custom response processing, some response mappings, and
item-level QTI 2 modal feedback. Safe repair does not allow the migrator to discard
scoring rules. Review diagnostics even when the result includes XML.

For ZIP packages, use `migrateQtiToQti3Package` and the writer's package APIs to
include images, stylesheets, and other package files. The script above handles
individual item XML only.

Package migration does not preserve assessment-test structure. It groups items into
a flat review part and reports the lost structure. The
[migrator reference](../../packages/migrator/README.md) lists supported forms,
preservation errors, package APIs, and repair policies.

Migration to QTI 3 and export to an LMS are separate tasks. Use the
[transcoder](../../packages/transcoder/README.md) with an explicit output profile
when exporting QTI 3 items to another format.
