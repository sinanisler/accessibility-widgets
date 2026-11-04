import { expect, test, type Page } from "@playwright/test";

const panel = (page: Page) => page.locator("#a11y-platform-root .panel");
const fab = (page: Page) => page.locator("#a11y-platform-root .fab");
const tile = (page: Page, id: string) => page.locator(`#a11y-platform-root .tile[data-id="${id}"]`);

test.beforeEach(async ({ page }) => {
  await page.goto("/demo/");
  await expect(fab(page)).toBeVisible();
});

test("panel stays hidden until opened and closes again", async ({ page }) => {
  await expect(panel(page)).toBeHidden();
  await fab(page).click();
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
  await expect(fab(page)).toBeFocused();
});

test("button and panel share the configured physical corner", async ({ page }) => {
  await fab(page).click();
  const button = (await fab(page).boundingBox())!;
  const box = (await panel(page).boundingBox())!;
  expect(button.x).toBeLessThan(100);
  expect(box.x).toBeLessThan(100);

  await page.locator('#a11y-platform-root [data-action="lang"]').click();
  expect((await panel(page).boundingBox())!.x).toBeLessThan(100);
});

test("reset appears once a feature is on and stays visible without scrolling", async ({ page }) => {
  await fab(page).click();
  await expect(page.locator('#a11y-platform-root [data-action="reset"]')).toBeHidden();
  await tile(page, "pause-animations").click();
  await expect(page.locator('#a11y-platform-root [data-action="reset"]')).toBeInViewport();
});

test("bigger text never shrinks page text", async ({ page }) => {
  const heading = page.locator("h1");
  const before = (await heading.boundingBox())!.height;
  await fab(page).click();
  await tile(page, "bigger-text").click();
  expect((await heading.boundingBox())!.height).toBeGreaterThan(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("levels are translated and reset clears every feature", async ({ page }) => {
  await fab(page).click();
  await tile(page, "bigger-text").click();
  await expect(tile(page, "bigger-text").locator(".level")).toContainText("كبير");
  await page.locator('#a11y-platform-root [data-action="reset"]').click();
  await expect(page.locator("html")).not.toHaveClass(/a11y-/);
  await page.locator("#a11y-platform-root .toast button").click();
  await expect(page.locator("html")).toHaveClass(/a11y-bigger-text/);
});

test("tiles keep a 44px touch target on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await fab(page).click();
  const box = (await tile(page, "bigger-text").boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
