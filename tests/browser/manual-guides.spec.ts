import { expect, test } from "@playwright/test";
import { installAxe } from "./axe-helpers.js";

const guides = [
  {
    slug: "render-qti-react",
    title: "Render a QTI 3 question in React",
    code: "QtiAssessmentItemPlayer",
  },
  {
    slug: "score-qti-node",
    title: "Score QTI responses in Node without a browser",
    code: "scoreQtiItemServerSide",
  },
  {
    slug: "migrate-qti2",
    title: "Migrate QTI 2 assessment items to QTI 3",
    code: "migrateQtiToQti3",
  },
];

for (const guide of guides) {
  test(`opens the ${guide.slug} guide from the homepage and supports narrow reading`, async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.getByRole("link", {
      name: guide.title.replace(" without a browser", "").replace(" assessment", ""),
      exact: true,
    });
    await link.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(guide.title);
    await expect(page.locator("article")).toContainText(guide.code);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://qflowlearn.github.io/qti3/guides/${guide.slug}.html`,
    );
    const section = page
      .getByRole("navigation", { name: "On this page", exact: true })
      .getByRole("link")
      .first();
    await section.click();
    const href = await section.getAttribute("href");
    if (!href) throw new Error("Missing section link.");
    await expect(page.locator(href)).toBeInViewport();
    await page.setViewportSize({ width: 360, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await installAxe(page);
    const violations = await page.evaluate(async () => {
      if (!window.axe) throw new Error("axe-core is missing.");
      return (await window.axe.run(document.querySelector("body"))).violations;
    });
    expect(violations).toEqual([]);
  });
}
