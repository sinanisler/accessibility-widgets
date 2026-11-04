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

test("optional features stay hidden until the site turns them on", async ({ page }) => {
  await fab(page).click();
  await expect(tile(page, "reading-mask")).toHaveCount(0);
  await expect(tile(page, "saturation")).toHaveCount(0);
});

test.describe("optional features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/?optional=1");
    await fab(page).click();
  });

  test("reading mask follows the pointer without blocking clicks", async ({ page }) => {
    await tile(page, "reading-mask").click();
    const mask = page.locator("#a11y-reading-mask");
    await expect(mask).toBeAttached();
    await page.keyboard.press("Escape");
    const button = page.getByRole("button", { name: "إرسال" });
    await button.hover();
    const box = (await button.boundingBox())!;
    const maskBox = (await mask.boundingBox())!;
    expect(maskBox.y).toBeLessThan(box.y + box.height);
    expect(maskBox.y + maskBox.height).toBeGreaterThan(box.y);
    await button.click({ timeout: 2000 });
  });

  test("saturation and color correction combine on the page", async ({ page }) => {
    await tile(page, "saturation").click();
    await tile(page, "color-filter").click();
    const filter = await page.evaluate(() => getComputedStyle(document.documentElement).filter);
    expect(filter).toContain("saturate(0.5)");
    expect(filter).toContain("#a11y-cvd");
  });

  test("readable font swaps the page text font", async ({ page }) => {
    const font = () => page.locator("main p").first().evaluate((el) => getComputedStyle(el).fontFamily);
    const before = await font();
    await tile(page, "font-family").click();
    expect(await font()).not.toBe(before);
    expect(await font()).toContain("Verdana");
  });

  test("text aligns to the start of Arabic paragraphs", async ({ page }) => {
    await page.locator("main p").first().evaluate((el) => ((el as HTMLElement).style.textAlign = "justify"));
    await tile(page, "text-align").click();
    const align = await page.locator("main p").first().evaluate((el) => getComputedStyle(el).textAlign);
    expect(align).toBe("start");
  });
});
