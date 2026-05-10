import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const outputDir = path.join(root, "docs", "screenshots");
const url = process.env.PULSE_URL || "https://pulse-lake-alpha.vercel.app";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

async function shot(name) {
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
}

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await shot("01-landing-privacy-upload.png");

await page.getByRole("button", { name: /use sample statement/i }).click();
await page.waitForSelector("text=Financial Health Scan", { timeout: 60000 });
await page.waitForTimeout(700);
await shot("02-body-scan-overview.png");

await page.locator("svg[aria-label='Financial body scan visualization']").click({ position: { x: 220, y: 250 } });
await page.waitForTimeout(400);
await shot("03-body-scan-organ-detail.png");

await page.getByRole("button", { name: /leaks/i }).click();
await page.waitForSelector("text=Leak map", { timeout: 20000 });
await page.waitForTimeout(400);
await shot("04-leak-map.png");

await page.getByRole("button", { name: /stress map/i }).click();
await page.waitForSelector("text=Stress signature", { timeout: 20000 });
await page.waitForTimeout(400);
await shot("05-stress-signature.png");

await page.getByRole("button", { name: /opportunity/i }).click();
await page.waitForSelector("text=AHA NUMBER", { timeout: 20000 });
await page.waitForTimeout(400);
await shot("06-opportunity-engine.png");

await page.getByRole("button", { name: /predictions/i }).click();
await page.waitForSelector("text=30-day prediction", { timeout: 20000 });
await page.waitForTimeout(400);
await shot("07-predictions.png");

await browser.close();

console.log(`Screenshots saved to ${outputDir}`);
