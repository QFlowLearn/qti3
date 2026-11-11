import { readFile } from "node:fs/promises";
import { migrateQtiToQti3 } from "@longsightgroup/qti3-migrator";

const xml = await readFile(new URL("./legacy-item.xml", import.meta.url), "utf8");
const result = await migrateQtiToQti3({ filename: "legacy-item.xml", xml });
const diagnostics = [...result.diagnostics, ...result.items.flatMap((item) => item.diagnostics)];
if (diagnostics.length > 0) console.error(diagnostics);
if (result.items.length !== 1) {
  console.error("Migration did not produce one usable QTI 3 item.");
  process.exitCode = 1;
} else {
  const item = result.items[0];
  if (!item.xml || diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    console.error("Migration failed. Review the diagnostics before importing this item.");
    process.exitCode = 1;
  } else {
    console.log(item.xml);
  }
}
