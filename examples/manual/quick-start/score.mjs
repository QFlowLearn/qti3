import { readFile } from "node:fs/promises";
import { scoreQtiItemServerSide } from "@longsightgroup/qti3-core";

const itemXml = await readFile(new URL("./item.xml", import.meta.url), "utf8");

// These synthetic responses are trusted input. A delivery host validates submissions first.
for (const response of ["B", "A"]) {
  const result = scoreQtiItemServerSide({
    itemXml,
    trustedResponses: { RESPONSE: response },
  });
  if (!result.ok) {
    console.error(result.diagnostics);
    process.exitCode = 1;
    break;
  }
  console.log(`${response}: ${result.score}`);
}
