import { TypographyStyle } from "@/types";

/**
 * Screenshot service using Playwright for headless browser screenshots
 * and typography extraction via getComputedStyle.
 *
 * Note: Playwright must be installed separately:
 *   npx playwright install chromium
 */

export async function captureScreenshot(
  url: string,
  viewport: { width: number; height: number },
  fullPage: boolean = true
): Promise<Buffer> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "load",
      timeout: 60000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    // Extra settle time for animations/lazy content
    await page.waitForTimeout(1500);

    const screenshot = await page.screenshot({
      fullPage: fullPage,
      type: "png",
    });

    await browser.close();
    return Buffer.from(screenshot);
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export async function extractTypography(
  url: string,
  viewport: { width: number; height: number }
): Promise<TypographyStyle[]> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);

    const styles = await page.evaluate(() => {
      const textElements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, button, input, textarea, blockquote, figcaption, strong, em, small, code"
      );

      const results: Array<{
        selector: string;
        textContent: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        lineHeight: string;
        letterSpacing: string;
        color: string;
        textTransform: string;
      }> = [];

      textElements.forEach((el, index) => {
        const text = (el.textContent || "").trim();
        if (!text || text.length > 200) return; // skip empty or very long text

        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const tagName = el.tagName.toLowerCase();
        const classList = el.className
          ? `.${String(el.className).split(" ").filter(Boolean).join(".")}`
          : "";

        let section = "Main";
        const closestSemantic = el.closest("header, footer, nav, aside, section");
        if (closestSemantic) {
          section = closestSemantic.tagName.toLowerCase();
          section = section.charAt(0).toUpperCase() + section.slice(1);
          if (closestSemantic.id) section += ` #${closestSemantic.id}`;
          else if (closestSemantic.className && typeof closestSemantic.className === "string") {
            const firstClass = closestSemantic.className.split(" ")[0];
            if (firstClass) section += ` .${firstClass}`;
          }
        }

        results.push({
          selector: `[${section}] ${tagName}${classList}:nth(${index})`,
          textContent: text.substring(0, 100),
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          letterSpacing: computed.letterSpacing,
          color: computed.color,
          textTransform: computed.textTransform,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        });
      });

      return results;
    });

    await browser.close();
    return styles;
  } catch (error) {
    await browser.close();
    throw error;
  }
}
