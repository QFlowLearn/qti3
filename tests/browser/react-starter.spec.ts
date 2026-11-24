import { expect, test } from "@playwright/test";
import { installAxe } from "./axe-helpers.js";

test.use({ baseURL: "http://127.0.0.1:4188" });

test("scores responses and restores the saved answer and score after a reload", async ({
  page,
}) => {
  await page.goto("/");
  const answer = page.getByRole("radio", { name: /^A\. Attendance records/ });
  await answer.check();
  await page.getByRole("button", { name: "Score response", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Score: 1");
  await page.getByRole("button", { name: "Save attempt", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Attempt saved in this browser");
  await page.reload();
  await expect(answer).not.toBeChecked();
  await page.getByRole("button", { name: "Restore saved attempt", exact: true }).click();
  await expect(answer).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("Saved attempt restored.");
  await page.getByText("Inspect attempt JSON", { exact: true }).click();
  const restored = await page
    .getByRole("region", { name: "Question preview" })
    .locator("qti-assessment-item-player")
    .evaluate((element) => element.serialize());
  expect(restored?.responses.RESPONSE).toBe("A");
  expect(restored?.outcomes.SCORE).toBe(1);
  await page.getByRole("radio", { name: /^B\. The library repainted/ }).check();
  await page.getByRole("button", { name: "Score response", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Score: 0");
});

test("explains missing and invalid saved data and supports keyboard operation at narrow widths", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Restore saved attempt", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("No saved attempt in this browser.");
  // Exercise the real serialized-storage boundary with malformed data, not a storage mock.
  await page.evaluate(() =>
    localStorage.setItem("qti3-react-starter.attempt.v1", '{"schema":"unknown"}'),
  );
  await page.getByRole("button", { name: "Restore saved attempt", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("not valid for this question");
  const answer = page.getByRole("radio", { name: /^A\. Attendance records/ });
  await answer.focus();
  await page.keyboard.press("Space");
  await expect(answer).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /^B\. The library repainted/ })).toBeChecked();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await installAxe(page);
  const violations = await page.evaluate(async () => {
    if (!window.axe) throw new Error("axe-core is missing.");
    return (await window.axe.run(document.querySelector("body"))).violations;
  });
  expect(violations).toEqual([]);
});
