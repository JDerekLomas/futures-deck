#!/usr/bin/env node
/**
 * Futures Deck - Print-Ready Card Generator
 *
 * Generates high-resolution card images for professional printing.
 * Files have SQUARE corners - the printer rounds them during finishing.
 *
 * Output specs:
 * - Poker size: 2.48" x 3.46" (63mm x 88mm)
 * - With bleed: 2.73" x 3.71" (+1/8" each side)
 * - Resolution: 300 DPI
 * - Final pixel size: 819 x 1113 pixels
 *
 * Usage:
 *   node src/generate-print-ready.cjs
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Card specifications for professional printing
const SPECS = {
  cardWidth: 2.48,      // inches
  cardHeight: 3.46,     // inches
  bleed: 0.125,         // 1/8 inch bleed on each side
  safeMargin: 0.125,    // 1/8 inch safe zone inside cut line
  dpi: 300,

  get totalWidth() { return Math.round((this.cardWidth + this.bleed * 2) * this.dpi); },
  get totalHeight() { return Math.round((this.cardHeight + this.bleed * 2) * this.dpi); },
  get bleedPx() { return Math.round(this.bleed * this.dpi); },
  get safePx() { return Math.round(this.safeMargin * this.dpi); },
};

const PROJECT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output', 'print-ready');
const ASSETS_DIR = path.join(PROJECT_DIR, 'assets', 'artdeco-4x5');

// Cards to generate
const CARDS = [
  { id: 'autonomy', name: 'Autonomy', category: 'Wellbeing', categoryColor: '#FFD93D' },
  { id: 'impact', name: 'Impact', category: 'Wellbeing', categoryColor: '#FFD93D' },
  { id: 'relatedness', name: 'Relatedness', category: 'Wellbeing', categoryColor: '#FFD93D' },
  { id: 'stimulation', name: 'Stimulation', category: 'Wellbeing', categoryColor: '#FFD93D' },
  { id: 'growth', name: 'Growth', category: 'Arc', categoryColor: '#a855f7' },
  { id: 'ocean', name: 'The Ocean', category: 'Terrain', categoryColor: '#4ECDC4' },
  { id: 'ritual', name: 'Ritual', category: 'Object', categoryColor: '#FF8C42' },
  { id: '5years', name: '5 Years', category: 'Timeframe', categoryColor: '#60a5fa' },
  { id: 'breakthrough', name: 'Breakthrough', category: 'Modifier', categoryColor: '#f87171' },
];

// Front card HTML - SQUARE corners, extends to bleed
function generateFrontHTML(card, assetsDir) {
  const imagePath = path.join(assetsDir, `${card.id}.png`);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Source+Sans+Pro:wght@600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${SPECS.totalWidth}px;
      height: ${SPECS.totalHeight}px;
      overflow: hidden;
      background: #1a1a1a;
    }

    .card {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      /* NO border-radius - printer rounds corners */
    }

    .artwork {
      flex: 1;
      overflow: hidden;
    }

    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .text-panel {
      background: linear-gradient(to bottom, #1a1a1a, #0f0f0f);
      padding: 28px 36px 40px;
      border-top: 2px solid #333;
    }

    .category {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: ${card.categoryColor};
      margin-bottom: 8px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 44px;
      font-weight: 500;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      <img src="file://${imagePath}" alt="${card.name}">
    </div>
    <div class="text-panel">
      <div class="category">${card.category}</div>
      <div class="title">${card.name}</div>
    </div>
  </div>
</body>
</html>`;
}

// Back card HTML - Procedural geometric pattern with "Futures Deck"
function generateBackHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Bebas+Neue&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${SPECS.totalWidth}px;
      height: ${SPECS.totalHeight}px;
      overflow: hidden;
      background: #0a0a12;
    }

    .back {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(135deg, #0d1117 0%, #0a0a12 50%, #0d1117 100%);
    }

    /* Geometric pattern using CSS */
    .pattern {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        /* Diagonal lines */
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(201, 162, 39, 0.03) 20px,
          rgba(201, 162, 39, 0.03) 21px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 20px,
          rgba(201, 162, 39, 0.03) 20px,
          rgba(201, 162, 39, 0.03) 21px
        );
    }

    /* Art deco border */
    .border-outer {
      position: absolute;
      top: ${SPECS.bleedPx + 20}px;
      left: ${SPECS.bleedPx + 20}px;
      right: ${SPECS.bleedPx + 20}px;
      bottom: ${SPECS.bleedPx + 20}px;
      border: 3px solid #c9a227;
    }

    .border-inner {
      position: absolute;
      top: ${SPECS.bleedPx + 32}px;
      left: ${SPECS.bleedPx + 32}px;
      right: ${SPECS.bleedPx + 32}px;
      bottom: ${SPECS.bleedPx + 32}px;
      border: 1px solid #c9a227;
    }

    /* Corner ornaments */
    .corner {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 2px solid #c9a227;
    }
    .corner-tl { top: ${SPECS.bleedPx + 44}px; left: ${SPECS.bleedPx + 44}px; border-right: none; border-bottom: none; }
    .corner-tr { top: ${SPECS.bleedPx + 44}px; right: ${SPECS.bleedPx + 44}px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: ${SPECS.bleedPx + 44}px; left: ${SPECS.bleedPx + 44}px; border-right: none; border-top: none; }
    .corner-br { bottom: ${SPECS.bleedPx + 44}px; right: ${SPECS.bleedPx + 44}px; border-left: none; border-top: none; }

    /* Central design */
    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    /* Radiating lines from center */
    .sunburst {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
    }

    .ray {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 250px;
      height: 1px;
      background: linear-gradient(90deg, rgba(201, 162, 39, 0.4) 0%, transparent 100%);
      transform-origin: left center;
    }

    /* Diamond shapes */
    .diamond {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      border: 1px solid rgba(201, 162, 39, 0.3);
    }
    .diamond-1 { width: 200px; height: 200px; }
    .diamond-2 { width: 280px; height: 280px; }
    .diamond-3 { width: 360px; height: 360px; }

    /* Eye symbol */
    .eye {
      width: 120px;
      height: 60px;
      border: 2px solid #c9a227;
      border-radius: 50%;
      position: relative;
      margin: 0 auto 30px;
    }

    .eye::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background: #c9a227;
      border-radius: 50%;
    }

    .eye::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #0a0a12;
      border-radius: 50%;
    }

    .title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 36px;
      letter-spacing: 0.4em;
      color: #c9a227;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .subtitle {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      letter-spacing: 0.15em;
      color: rgba(201, 162, 39, 0.6);
      font-style: italic;
    }

    /* Top and bottom decorative elements */
    .deco-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 2px;
      background: #c9a227;
    }
    .deco-line-top { top: ${SPECS.bleedPx + 80}px; }
    .deco-line-bottom { bottom: ${SPECS.bleedPx + 80}px; }

    .deco-diamond {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 10px;
      height: 10px;
      background: #c9a227;
    }
    .deco-diamond-top { top: ${SPECS.bleedPx + 65}px; }
    .deco-diamond-bottom { bottom: ${SPECS.bleedPx + 65}px; }
  </style>
</head>
<body>
  <div class="back">
    <div class="pattern"></div>

    <!-- Diamonds -->
    <div class="diamond diamond-1"></div>
    <div class="diamond diamond-2"></div>
    <div class="diamond diamond-3"></div>

    <!-- Sunburst rays -->
    <div class="sunburst">
      ${Array.from({length: 24}, (_, i) => `<div class="ray" style="transform: rotate(${i * 15}deg);"></div>`).join('')}
    </div>

    <!-- Borders -->
    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <!-- Corners -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Top/bottom decorations -->
    <div class="deco-diamond deco-diamond-top"></div>
    <div class="deco-line deco-line-top"></div>
    <div class="deco-diamond deco-diamond-bottom"></div>
    <div class="deco-line deco-line-bottom"></div>

    <!-- Center content -->
    <div class="center">
      <div class="eye"></div>
      <div class="title">Futures Deck</div>
      <div class="subtitle">Speculative Oracle</div>
    </div>
  </div>
</body>
</html>`;
}

async function generateCard(browser, card, outputDir, assetsDir) {
  const page = await browser.newPage();

  await page.setViewport({
    width: SPECS.totalWidth,
    height: SPECS.totalHeight,
    deviceScaleFactor: 1
  });

  const html = generateFrontHTML(card, assetsDir);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(outputDir, `${card.id}-front.png`);
  await page.screenshot({ path: outputPath, type: 'png', fullPage: true });

  await page.close();
  console.log(`  ✓ ${card.name}`);
  return outputPath;
}

async function generateBack(browser, outputDir) {
  const page = await browser.newPage();

  await page.setViewport({
    width: SPECS.totalWidth,
    height: SPECS.totalHeight,
    deviceScaleFactor: 1
  });

  const html = generateBackHTML();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(outputDir, 'card-back.png');
  await page.screenshot({ path: outputPath, type: 'png', fullPage: true });

  await page.close();
  console.log(`  ✓ Card Back (procedural)`);
  return outputPath;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       FUTURES DECK — Print-Ready Card Generator            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Specs:');
  console.log(`  Card size:    ${SPECS.cardWidth}" × ${SPECS.cardHeight}" (poker)`);
  console.log(`  With bleed:   ${(SPECS.cardWidth + SPECS.bleed * 2).toFixed(3)}" × ${(SPECS.cardHeight + SPECS.bleed * 2).toFixed(3)}"`);
  console.log(`  Resolution:   ${SPECS.dpi} DPI`);
  console.log(`  Pixels:       ${SPECS.totalWidth} × ${SPECS.totalHeight}`);
  console.log(`  Bleed:        ${SPECS.bleedPx}px (${SPECS.bleed}" each side)`);
  console.log(`  Safe zone:    ${SPECS.safePx}px inside cut line`);
  console.log(`  Corners:      SQUARE (printer rounds them)\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch();

  console.log('Generating card fronts...');
  for (const card of CARDS) {
    await generateCard(browser, card, OUTPUT_DIR, ASSETS_DIR);
  }

  console.log('\nGenerating card back...');
  await generateBack(browser, OUTPUT_DIR);

  await browser.close();

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`✓ Generated ${CARDS.length} fronts + 1 back`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('\nUpload to MakePlayingCards.com or The Game Crafter');
  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
