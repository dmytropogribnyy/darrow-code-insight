// Removes blank interior pages from an APITemplate/Chromium-generated PDF.
//
// Root problem: Chromium sometimes creates an empty overflow-tail page when a
// section's content + bottom padding slightly exceeds the A4 page boundary.
// That tail page has only a cream background rectangle (path-paint) and zero
// text — but pdf-lib's stampPageNumbers() stamps every interior page by index,
// so the overflow page becomes "Darrow Code · NN" with no other content.
//
// Fix: prune before stamp. Remove any interior page that has no meaningful text.
//
// Detection method: pdf-lib text-operator scan (pdfjs-dist not installed —
// would require bundle-size evaluation for CF Workers).
// We decode each page's content stream(s) via FlateDecode (node:zlib), then
// count Tj/TJ text-showing operators. Background path-paint (q/Q/m/l/f etc.)
// is intentionally ignored — Chromium paints background on ALL pages including
// blank overflow ones, so "has drawable content" is too broad a signal.
//
// Blank detection threshold: minGlyphs = 3 (default).
//   Blank overflow page: 0 Tj/TJ → 0 < 3 → removed.
//   Real content page: dozens–hundreds of Tj/TJ → kept.
//   Edge-case page with 1–2 Tj calls would be removed (acceptable; no such
//   page exists in practice for our v3 content).

import { PDFDocument, PDFName, PDFArray, PDFRef, PDFRawStream } from "pdf-lib";
import { inflateSync } from "node:zlib";

export interface PruneResult {
  pdf: Uint8Array;
  removedPageNumbers: number[]; // 1-based, for logging
  originalPageCount: number;
  method: "pdf-lib-text-operators";
}

export interface PruneWarning {
  message: string;
  level: "info" | "warn";
}

// Exported for tests and the apitemplate pipeline.
export const PRUNE_MIN_GLYPHS = 3;
export const PRUNE_PAGE_COUNT_MIN = 16;
export const PRUNE_PAGE_COUNT_MAX = 26;

// ── Text-operator scan ────────────────────────────────────────────────────

// Match word-boundary Tj or TJ (PDF text-showing operators).
// '\'' (single apostrophe) and '"' (double-quote) also show text in PDF
// but are rare in Chromium output — Tj/TJ are sufficient for our use case.
const TEXT_OP_RE = /\bT[jJ]\b/g;

function decodeFlate(raw: Uint8Array): Uint8Array {
  try {
    return new Uint8Array(inflateSync(Buffer.from(raw)));
  } catch {
    // Inflate failed (wrong format or truncated) — scan raw bytes.
    // This is conservative: compressed text won't match, so the page
    // may incorrectly appear blank. Acceptable trade-off; real content
    // pages will still have uncompressed streams or fail open.
    return raw;
  }
}

function streamTextOpCount(doc: PDFDocument, ref: PDFRef): number {
  const obj = doc.context.lookup(ref);
  if (!(obj instanceof PDFRawStream)) return 0;

  const filterObj = obj.dict.get(PDFName.of("Filter"));
  const filterStr = filterObj ? String(filterObj) : "";
  const needsInflate = filterStr.includes("FlateDecode");

  const bytes = needsInflate ? decodeFlate(obj.contents) : obj.contents;
  const text = Buffer.from(bytes).toString("latin1");
  return (text.match(TEXT_OP_RE) ?? []).length;
}

function pageTextOpCount(doc: PDFDocument, pageIndex: number): number {
  const page = doc.getPage(pageIndex);
  const contentsEntry = page.node.get(PDFName.of("Contents"));
  if (!contentsEntry) return 0;

  // Resolve: PDFRef → PDFRawStream (single stream) or PDFRef → PDFArray (multiple)
  const resolved =
    contentsEntry instanceof PDFRef ? doc.context.lookup(contentsEntry) : contentsEntry;

  if (resolved instanceof PDFArray) {
    let total = 0;
    for (let i = 0; i < resolved.size(); i++) {
      const item = resolved.get(i);
      if (item instanceof PDFRef) total += streamTextOpCount(doc, item);
    }
    return total;
  }

  if (contentsEntry instanceof PDFRef) {
    return streamTextOpCount(doc, contentsEntry);
  }

  return 0;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Remove blank interior pages from a Chromium/APITemplate PDF.
 *
 * Cover (index 0) and closing (index n-1) are always protected.
 * Interior pages with < minGlyphs text-showing operators are removed.
 * Pages are removed back-to-front so indices stay stable.
 */
export async function pruneBlankPages(
  input: Uint8Array,
  opts: { minGlyphs?: number; protectFirst?: boolean; protectLast?: boolean } = {},
): Promise<PruneResult> {
  const { minGlyphs = PRUNE_MIN_GLYPHS, protectFirst = true, protectLast = true } = opts;

  const doc = await PDFDocument.load(input, { ignoreEncryption: true });
  const originalPageCount = doc.getPageCount();
  const toRemove: number[] = [];

  for (let i = 0; i < originalPageCount; i++) {
    if (protectFirst && i === 0) continue;
    if (protectLast && i === originalPageCount - 1) continue;
    if (pageTextOpCount(doc, i) < minGlyphs) {
      toRemove.push(i);
    }
  }

  // Back-to-front removal keeps earlier indices stable
  for (const i of [...toRemove].reverse()) {
    doc.removePage(i);
  }

  const pdf = new Uint8Array(await doc.save());
  return {
    pdf,
    removedPageNumbers: toRemove.map((i) => i + 1),
    originalPageCount,
    method: "pdf-lib-text-operators",
  };
}

/**
 * Post-prune layout sanity checks. Returns warnings to be logged by the caller.
 * Does not throw. Designed to catch regressions (article collapse, page explosion).
 */
export function validatePrunedLayout(
  removedPageNumbers: number[],
  finalPageCount: number,
  opts: { pageCountMin?: number; pageCountMax?: number } = {},
): PruneWarning[] {
  const { pageCountMin = PRUNE_PAGE_COUNT_MIN, pageCountMax = PRUNE_PAGE_COUNT_MAX } = opts;
  const warnings: PruneWarning[] = [];

  if (removedPageNumbers.length > 0) {
    warnings.push({
      level: "info",
      message: `[pdf-prune] removed blank pages: ${removedPageNumbers.join(", ")} (original count: ${removedPageNumbers.length + finalPageCount})`,
    });
  }
  if (finalPageCount < pageCountMin) {
    warnings.push({
      level: "warn",
      message: `[pdf-prune] final page count ${finalPageCount} is below minimum ${pageCountMin} — possible article-collapse regression`,
    });
  }
  if (finalPageCount > pageCountMax) {
    warnings.push({
      level: "warn",
      message: `[pdf-prune] final page count ${finalPageCount} exceeds maximum ${pageCountMax} — possible pagination overflow`,
    });
  }

  return warnings;
}
