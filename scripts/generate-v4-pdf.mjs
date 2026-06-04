// B4.1 PDF generator — Puppeteer + pdf-lib.
//
// Reads: outputs/pdf-v4.1-core-diagnostic.html  (generate first via Vitest)
// Writes: outputs/pdf-v4.1-core-diagnostic.pdf
//
// Uses system Chrome (no Chromium download) via puppeteer-core.
// Puppeteer settings mirror APITemplate production path:
//   printBackground: true    — dark cover/closing backgrounds visible
//   displayHeaderFooter: false — NO browser date/title/path/counter headers
//   preferCSSPageSize: true  — respects @page { size: A4; margin: 0 }
//   margin: {0}              — zero browser margins (layout owns all spacing)
//
// After print-to-PDF, pdf-lib stamps "Darrow Code · NN" on pages 2..N-1
// (cover page 1 and closing last page are intentionally left unnumbered).
//
// Run:
//   npx vitest run src/lib/pdf/generate-v4-artifact.test.ts
//   node scripts/generate-v4-pdf.mjs
//
// NOT production. No AI. No Stripe. No email. No Supabase.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import puppeteer from "puppeteer-core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Chrome candidates — first found wins.
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH ?? null,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "Google\\Chrome\\Application\\chrome.exe")
    : null,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function stampPageNumbers(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const pages = doc.getPages();
  const total = pages.length;
  // Muted warm gold — matches the v3 production stamp colour.
  const ink = rgb(0x9b / 255, 0x82 / 255, 0x4f / 255);

  for (let i = 0; i < total; i++) {
    if (i === 0) continue; // cover — no stamp
    if (i === total - 1) continue; // closing — no stamp
    const page = pages[i];
    const { width } = page.getSize();
    const num = String(i + 1).padStart(2, "0");
    const label = `Darrow Code  ·  ${num}`;
    const size = 9;
    const textWidth = font.widthOfTextAtSize(label, size);
    // Bottom-right: 14 mm from right edge, 12 mm from bottom (1 mm ≈ 2.834 pt).
    const x = width - textWidth - 14 * 2.834;
    const y = 12 * 2.834;
    page.drawText(label, { x, y, size, font, color: ink });
  }

  return new Uint8Array(await doc.save());
}

async function main() {
  // Default to the B5.0 diagnostic artifact; allow override via env so other
  // diagnostic tooling (e.g. the manual core-v4 CLI) can reuse this single PDF
  // engine without a second implementation. Backward-compatible.
  const htmlPath = process.env.CORE_V4_PDF_IN || join(ROOT, "outputs", "pdf-v4.1-core-diagnostic.html");
  const outPath = process.env.CORE_V4_PDF_OUT || join(ROOT, "outputs", "pdf-v4.1-core-diagnostic.pdf");

  // Read HTML
  let html;
  try {
    html = readFileSync(htmlPath, "utf8");
  } catch {
    console.error(
      `\n✗ HTML not found at outputs/pdf-v4.1-core-diagnostic.html\n` +
        `  Generate it first:\n` +
        `  npx vitest run src/lib/pdf/generate-v4-artifact.test.ts\n`,
    );
    process.exit(1);
  }

  // Find Chrome
  const chromePath = findChrome();
  if (!chromePath) {
    console.error(
      `\n✗ Chrome not found. Checked:\n` +
        CHROME_CANDIDATES.map((p) => `  - ${p}`).join("\n") +
        `\n  Install Chrome or set CHROME_PATH env var.\n`,
    );
    process.exit(1);
  }
  console.log(`  Chrome: ${chromePath}`);

  // Launch headless Chrome via puppeteer-core
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let pdfBytes;
  try {
    const page = await browser.newPage();
    // Load HTML directly (no network request — no file:// path in the PDF footer)
    await page.setContent(html, { waitUntil: "networkidle0" });

    pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true, // dark cover/closing backgrounds visible
      displayHeaderFooter: false, // NO browser date/title/path/counter
      preferCSSPageSize: true, // use @page { size: A4; margin: 0 } from CSS
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
  } finally {
    await browser.close();
  }

  // Stamp "Darrow Code · NN" on pages 2..N-1 (cover + closing left blank)
  console.log(`  Stamping page numbers...`);
  const stamped = await stampPageNumbers(pdfBytes);

  mkdirSync(join(ROOT, "outputs"), { recursive: true });
  writeFileSync(outPath, stamped);

  const sizeKb = (stamped.length / 1024).toFixed(1);
  // pdf-lib page count from the stamped bytes
  const checkDoc = await PDFDocument.load(stamped);
  const pageCount = checkDoc.getPageCount();

  console.log(`\n✓ outputs/pdf-v4.1-core-diagnostic.pdf`);
  console.log(`  Size:  ${sizeKb} KB`);
  console.log(`  Pages: ${pageCount}`);
  console.log(`  Browser headers/footers: NONE (displayHeaderFooter: false)`);
  console.log(`  Blank pages: none expected (Puppeteer + preferCSSPageSize)`);
  console.log(`  Footer stamps: Darrow Code · NN on pages 2..${pageCount - 1}`);
}

main().catch((err) => {
  console.error("\n✗ PDF generation failed:", err);
  process.exit(1);
});
