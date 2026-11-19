import { expect, test } from "@playwright/test";
import { interactionFixtures } from "../../packages/fixtures/src/index.js";

const choice = interactionFixtures.find((fixture) => fixture.id === "choice-reference");
if (!choice) throw Error("Missing choice fixture.");

test("adapter clears a real mounted player when XML is absent", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(
    async ({ xml, entry }) => {
      await customElements.whenDefined("qti-assessment-item-player");

      const adapter: typeof import("../../packages/player/src/player-adapter.js") = await import(
        entry
      );
      const element = document.createElement("qti-assessment-item-player");
      document.body.append(element);
      await element.loadXml(xml);
      const before = element.serialize()?.itemIdentifier;
      adapter.createQtiAssessmentItemPlayerAdapterLoadSync().run(element, { xml: undefined });
      const after = { children: element.childElementCount, state: element.serialize() };
      element.remove();
      return { before, after };
    },
    {
      xml: choice.xml,
      entry:
        "/@fs" + new URL("../../packages/player/src/player-adapter.ts", import.meta.url).pathname,
    },
  );
  expect(result.before).toBe(choice.id);
  expect(result.after).toEqual({ children: 0, state: undefined });
});

test("adapter ignores an obsolete load failure after a newer real load", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(
    async ({ xml, entry }) => {
      await customElements.whenDefined("qti-assessment-item-player");

      const adapter: typeof import("../../packages/player/src/player-adapter.js") = await import(
        entry
      );
      const element = document.createElement("qti-assessment-item-player");
      document.body.append(element);
      const errors: string[] = [];
      const sync = adapter.createQtiAssessmentItemPlayerAdapterLoadSync();
      // Exercise the real renderer with a host asset URL resolver whose configured base is invalid.
      const badAssetXml = xml.replace(
        "<qti-item-body>",
        '<qti-item-body><img src="asset.png" alt="Fixture"/>',
      );
      const invalidBase = "https://[invalid";
      const loadOptions = { resolveAsset: (url: string) => new URL(url, invalidBase).href };
      sync.run(element, {
        xml: badAssetXml,
        loadOptions,
        onLoadError: (error) => errors.push(error.name),
      });
      // The callback must report a current failure, proving the real operation rejects.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const activeErrors = [...errors];
      errors.length = 0;
      sync.run(element, {
        xml: badAssetXml,
        loadOptions,
        onLoadError: (error) => errors.push(error.name),
      });
      const cleanup = sync.run(element, { xml, onLoadError: (error) => errors.push(error.name) });
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      cleanup();
      const snapshot = {
        activeErrors,
        obsoleteErrors: errors,
        identifier: element.serialize()?.itemIdentifier,
      };
      element.remove();
      return snapshot;
    },
    {
      xml: choice.xml,
      entry:
        "/@fs" + new URL("../../packages/player/src/player-adapter.ts", import.meta.url).pathname,
    },
  );
  expect(result.activeErrors).toEqual(["TypeError"]);
  expect(result.obsoleteErrors).toEqual([]);
  expect(result.identifier).toBe(choice.id);
});

test("handle exposes the real mounted player's interaction regions", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(
    async ({ xml, entry }) => {
      await customElements.whenDefined("qti-assessment-item-player");

      const adapter: typeof import("../../packages/player/src/player-adapter.js") = await import(
        entry
      );
      const element = document.createElement("qti-assessment-item-player");
      document.body.append(element);
      await element.loadXml(xml);
      const handle = adapter.createQtiAssessmentItemPlayerHandle(() => element);
      const regions = handle.getInteractionRegions();
      const snapshot = regions.map((region) => ({
        kind: region.kind,
        interactionType: region.interactionType,
        mounted: element.contains(region.element),
        width: region.bounds.width,
        height: region.bounds.height,
      }));
      element.remove();
      return snapshot;
    },
    {
      xml: choice.xml,
      entry:
        "/@fs" + new URL("../../packages/player/src/player-adapter.ts", import.meta.url).pathname,
    },
  );
  expect(result).toContainEqual({
    kind: "interaction",
    interactionType: "choice",
    mounted: true,
    width: expect.any(Number),
    height: expect.any(Number),
  });
  expect(result.every((region) => region.width > 0 && region.height > 0)).toBe(true);
});
