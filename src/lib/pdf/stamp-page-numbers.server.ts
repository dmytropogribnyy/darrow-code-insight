// Post-process a PDF and stamp page numbers onto pages 2..N-1.
// Cover (page 1) and the closing dark page (last page) are intentionally
// left blank — they are full-bleed brand pages.
//
// We use pdf-lib because APITemplate (headless Chromium) ignores the CSS
// `@page` counter rules in our HTML reliably enough that we cannot trust
// them, and the `displayHeaderFooter` flag previously caused render failures
// for this template. Stamping after the fact decouples page numbering from
// the upstream renderer entirely.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface StampOpts {
  /** Skip stamping page 1 (cover). Default: true. */
  skipFirst?: boolean;
  /** Skip stamping the last page (closing). Default: true. */
  skipLast?: boolean;
  /** Prefix shown before the number. Default: "Darrow Code · ". */
  prefix?: string;
}

export async function stampPageNumbers(
  input: Uint8Array,
  opts: StampOpts = {},
): Promise<Uint8Array> {
  const skipFirst = opts.skipFirst !== false;
  const skipLast = opts.skipLast !== false;
  const prefix = opts.prefix ?? "Darrow Code  \u00B7  ";

  const doc = await PDFDocument.load(input);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const pages = doc.getPages();
  const total = pages.length;
  // Muted warm gold/grey — matches body palette without competing.
  const ink = rgb(0x9b / 255, 0x82 / 255, 0x4f / 255);

  for (let i = 0; i < total; i++) {
    if (skipFirst && i === 0) continue;
    if (skipLast && i === total - 1) continue;
    const page = pages[i];
    const { width, height: _h } = page.getSize();
    const num = String(i + 1).padStart(2, "0");
    const label = `${prefix}${num}`;
    const size = 9;
    const textWidth = font.widthOfTextAtSize(label, size);
    // Bottom-right, 14mm from right edge, 12mm from bottom (1mm ≈ 2.834pt).
    const x = width - textWidth - 14 * 2.834;
    const y = 12 * 2.834;
    page.drawText(label, { x, y, size, font, color: ink });
  }

  return new Uint8Array(await doc.save());
}
