#!/usr/bin/env node
"use strict";

/**
 * scripts/cv-export.js
 *
 * Export a live page to a single full-height PDF, preserving the on-screen
 * (screen-media) visual rendering AND hyperlink annotations.
 *
 * Why this exists: Opera's device-toolbar "Save as PDF" now routes through
 * print media, which Minimal Mistakes' print stylesheet uses to hide the
 * sidebar / author avatar and collapse the layout. By capturing in screen
 * media at a fixed viewport width, the sidebar, avatar and links survive.
 *
 * Usage:
 *   node scripts/cv-export.js [url] [width] [output]
 *
 *   url    - page to export (default http://localhost:8788/private/CV/)
 *   width  - viewport width in px (default 1100; sidebar column needs >=1100)
 *   output - output .pdf path (default cv-export.pdf)
 *
 * The Chrome binary is located via CHROME_PATH, else a set of common paths.
 */

const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  throw new Error(
    "Chrome not found. Set CHROME_PATH to a Chrome/Chromium binary."
  );
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Keep masthead + footer visible, but make the footer sit snug under the
// last line (like in the browser) instead of being pushed to the paper
// bottom. Minimal Mistakes uses `body{display:flex;min-height:100vh}` +
// `.initial-content{flex:1 0 auto}` which stretches the middle column to
// fill the tall print paper, creating a large white gap before the footer.
// Additionally, override the theme's `@media print { display:none !important }`
// hide rules — Page.printToPDF ignores Emulation.setEmulatedMedia in
// headless=new (masthead/sidebar/footer were rendering white/missing).
const SNUG_FOOTER_CSS =
  "html,body{margin:0 !important;padding:0 !important}" +
  "body{display:block !important;min-height:0 !important;background:#fdfafb !important}" +
  ".initial-content{flex:none !important}" +
  "*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important}" +
  ".masthead,.masthead__inner-wrap,.greedy-nav{visibility:visible !important;opacity:1 !important;height:auto !important}" +
  ".masthead{display:block !important;background:#fdfafb !important;position:relative !important;border-bottom:1px solid #e4e2e3 !important}" +
  ".masthead__inner-wrap{display:flex !important;align-items:center !important;justify-content:space-between !important;background:#fdfafb !important;padding:1em 1em !important;width:100% !important;max-width:100% !important}" +
  ".greedy-nav{display:flex !important;align-items:center !important;background:transparent !important}" +
  ".greedy-nav a,.greedy-nav .site-title{color:#272123 !important}" +
  ".greedy-nav button{color:#272123 !important}" +
  "@media print{" +
  ".masthead,.sidebar,.author__avatar,.author__content,.author__urls-wrapper,.page__footer,.toc,.page__share,.page__related,.pagination,.ads,.page__comments-form,.nav__list,.adsbygoogle" +
  "{display:block !important;height:auto !important;opacity:1 !important;visibility:visible !important}" +
  ".masthead{display:block !important;background:#fdfafb !important;position:relative !important;border-bottom:1px solid #e4e2e3 !important}" +
  ".masthead__inner-wrap{display:flex !important;align-items:center !important;background:#fdfafb !important;padding:1em 1em !important}" +
  ".page__footer{background:#1d181a !important}" +
  ".sidebar{position:relative !important;opacity:1 !important}" +
  "body{background:#fdfafb !important;color:#000 !important}" +
  "}";

// Content bounding box of a rendered page PNG (72 dpi => 1 px = 1 pt).
// Treats both pure-white (paper) and the page's canvas #fdfafb
// (253,250,251) as background so trailing blank #fdfafb after the dark
// footer is trimmed, while mixed rows (masthead #fdfafb + dark text +
// #e4e2e3 border, article text, dark footer) still count as content.
async function contentBBox(png) {
  const sharp = require(path.join(__dirname, "..", "node_modules", "sharp"));
  const { data, info } = await sharp(png)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  let minX = Infinity,
    maxX = -1,
    minY = Infinity,
    maxY = -1;
  const rowWhite = new Array(h).fill(true);
  const isBg = (r, g, b) => {
    const white = r >= 254 && g >= 254 && b >= 254;
    const fdfafb =
      Math.abs(r - 253) <= 3 &&
      Math.abs(g - 250) <= 3 &&
      Math.abs(b - 251) <= 3;
    return white || fdfafb;
  };
  for (let y = 0; y < h; y++) {
    let nw = 0;
    let mi = Infinity,
      ma = -1;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (!isBg(r, g, b)) {
        nw++;
        if (x < mi) mi = x;
        if (x > ma) ma = x;
      }
    }
    if (nw) {
      rowWhite[y] = false;
      if (mi < minX) minX = mi;
      if (ma > maxX) maxX = ma;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (minX === Infinity) throw new Error("No non-white content found in page.");
  // Include leading #fdfafb masthead padding (uniform fdfafb rows at y=0)
  // as content for the top edge, while still trimming trailing uniform
  // fdfafb blank after the dark footer. Without this, uniform top padding
  // (no text/border) would be considered background and cropped.
  if (minY > 0) {
    const r0 = data[0], g0 = data[1], b0 = data[2];
    const topIsFdfafb =
      Math.abs(r0 - 253) <= 3 &&
      Math.abs(g0 - 250) <= 3 &&
      Math.abs(b0 - 251) <= 3;
    if (topIsFdfafb) {
      let topAllBg = true;
      for (let y = 0; y < minY; y++) if (!rowWhite[y]) { topAllBg = false; break; }
      if (topAllBg) minY = 0;
    }
  }
  // PDF coords are bottom-left origin; convert the top-left pixel bbox.
  // maxX/maxY are inclusive pixel indices, so the exclusive PDF edge is +1
  // (and bottom edge needs -1). Without this the right/bottom edges are
  // 1 pt inside the content, leaving a thin white line or clipping.
  return {
    x0: minX,
    y0: h - maxY - 1,
    x1: maxX + 1,
    y1: h - minY,
    pageW: w,
    pageH: h,
  };
}

async function trimPdf(src, dst) {
  const pngBase = `${dst}.page`;
  const ppm = spawnSync("pdftoppm", ["-png", "-r", "72", src, pngBase], {
    encoding: "utf8",
  });
  if (ppm.status !== 0) {
    throw new Error(`pdftoppm failed: ${ppm.stderr || "unknown"}`);
  }
  const png = `${pngBase}-1.png`;
  const b = await contentBBox(png);
  // No extra white pad at the top when the masthead is visible — the
  // nav bar's own padding provides the spacing. Keep sides/bottom at 0
  // to avoid thin white borders (user reported sides/bottom fixed).
  // If masthead is hidden the bbox will naturally include a tiny white
  // edge; no extra pad is needed.
  const py = spawnSync(
    "python3",
    [
      path.join(__dirname, "cv-trim.py"),
      src,
      dst,
      String(b.x0),
      String(b.y0),
      String(b.x1),
      String(b.y1),
      "0",
    ],
    { encoding: "utf8" }
  );
  if (py.status !== 0) {
    throw new Error(`cv-trim.py failed: ${py.stderr || "unknown"}`);
  }
  for (const f of [png, `${pngBase}-2.png`]) {
    try {
      fs.rmSync(f, { force: true });
    } catch {
      /* ignore */
    }
  }
  return { x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1 };
}

async function main() {
  const [url = "http://localhost:8788/private/CV/", widthRaw = "1100", outRaw = "cv-export.pdf"] =
    process.argv.slice(2);
  const width = parseInt(widthRaw, 10);
  const out = outRaw.endsWith(".pdf") ? outRaw : `${outRaw}.pdf`;

  const chrome = findChrome();
  const port = await getFreePort();
  const userDataDir = `/tmp/cv-export-${process.pid}`;

  const child = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  const cleanup = () => {
    try {
      child.kill("SIGKILL");
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });

  // wait for the debugging endpoint to come up
  let targets = null;
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      targets = await res.json();
      if (targets.length) break;
    } catch {
      /* not up yet */
    }
    await delay(200);
  }
  if (!targets) {
    cleanup();
    throw new Error("Chrome CDP endpoint did not come up.");
  }

  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 807,
    deviceScaleFactor: 1,
    mobile: false,
  });
  // render with SCREEN css so sidebar/avatar/layout are preserved
  await send("Emulation.setEmulatedMedia", { media: "screen", features: [] });
  await send("Page.enable");
  await send("Page.navigate", { url });
  await delay(6000); // allow CSS + large avatar to load

  // make the footer snug under the last line (undo the flex-column stretch that
  // pushes it to the paper bottom on tall print pages)
  await send("Runtime.evaluate", {
    expression: `document.head.insertAdjacentHTML('beforeend','<style>${SNUG_FOOTER_CSS}</style>')`,
  });
  await delay(300);


  const m = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight})`,
  });
  const { w: docW, h: docH } = m.result.result.value;

  // scrollHeight can under-measure with the sticky sidebar; add headroom so
  // the whole page fits on one sheet instead of spilling onto a 2nd page.
  // The outer white after the footer is trimmed away, so extra headroom
  // does not affect the final cropped size — a small factor (1.1) keeps
  // raw memory use modest while still tolerating long CVs.
  const paperHeight = (docH / 96) * 1.1;
  const rawOut = `${out}.raw.pdf`;
  const res = await send("Page.printToPDF", {
    paperWidth: docW / 96,
    paperHeight,
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    scale: 1,
  });
  fs.writeFileSync(rawOut, Buffer.from(res.result.data, "base64"));
  // Trim outer white margins to zero padding — margins are now 0 in
  // printToPDF, and the @media print overrides keep masthead/sidebar/
  // footer visible. The bbox is the content edge itself, so no thin
  // white border remains.
  try {
    const box = await trimPdf(rawOut, out);
    fs.rmSync(rawOut, { force: true });
    const info = spawnSync("pdfinfo", [out], { encoding: "utf8" });
    const m = info.stdout.match(/Page size:\s+([\d.]+) x ([\d.]+) pts/);
    const sz = m ? `${Math.round(parseFloat(m[1]))}x${Math.round(parseFloat(m[2]))} pt` : "";
    console.log(
      `Exported ${out} (${width}px, screen media, snug footer, trimmed ${box.x1 - box.x0}x${box.y1 - box.y0} pt bbox -> ${sz})`
    );
  } catch (e) {
    // fallback: keep raw if trim dependencies are missing
    fs.renameSync(rawOut, out);
    console.warn(`Trim failed (${e.message}), kept raw ${out}`);
    console.log(`Exported ${out} (${width}px, screen media, snug footer)`);
  }
  ws.close();
  cleanup();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
