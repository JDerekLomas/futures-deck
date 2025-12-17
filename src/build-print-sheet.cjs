#!/usr/bin/env node
/**
 * Build printable card sheet - HTML and PDF
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'deck-artwork');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output', 'print-ready');

// Card definitions with artwork filenames
const CARDS = [
  { id: 'well-01', name: 'Autonomy', category: 'Wellbeing', color: '#FFD93D' },
  { id: 'well-02', name: 'Impact', category: 'Wellbeing', color: '#FFD93D' },
  { id: 'well-03', name: 'Relatedness', category: 'Wellbeing', color: '#FFD93D' },
  { id: 'well-04', name: 'Stimulation', category: 'Wellbeing', color: '#FFD93D' },
  { id: 'arc-01', name: 'Growth', category: 'Arc', color: '#a855f7' },
  { id: 'terrain-01', name: 'The Ocean', category: 'Terrain', color: '#4ECDC4' },
  { id: 'object-01', name: 'Ritual', category: 'Object', color: '#FF8C42' },
  { id: 'time-01', name: '5 Years', category: 'Timeframe', color: '#60a5fa' },
  { id: 'mod-01', name: 'Breakthrough', category: 'Modifier', color: '#f87171' },
];

function generatePrintHTML() {
  const cardFronts = CARDS.map(card => {
    const artworkPath = path.join(ARTWORK_DIR, `${card.id}.png`);
    return `
      <div class="card">
        <div class="card-inner">
          <div class="artwork">
            <img src="file://${artworkPath}" alt="${card.name}">
          </div>
          <div class="text-panel">
            <div class="category" style="color: ${card.color}">${card.category}</div>
            <div class="title">${card.name}</div>
          </div>
        </div>
      </div>`;
  }).join('\n');

  const cardBacks = CARDS.map(() => `
      <div class="card">
        <div class="card-back">
          <div class="pattern"></div>
          <div class="border-outer"></div>
          <div class="border-inner"></div>
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          <div class="center">
            <div class="eye"></div>
            <div class="back-title">FUTURES DECK</div>
            <div class="back-subtitle">Speculative Oracle</div>
          </div>
        </div>
      </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Futures Deck - Print Sheet</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Source+Sans+Pro:wght@600&family=Bebas+Neue&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: white;
      font-family: 'Source Sans Pro', sans-serif;
    }

    .page {
      width: 8.5in;
      height: 11in;
      padding: 0.35in;
      page-break-after: always;
      display: grid;
      grid-template-columns: repeat(3, 2.5in);
      grid-template-rows: repeat(3, 3.5in);
      gap: 0.08in;
      justify-content: center;
      align-content: center;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .card {
      width: 2.5in;
      height: 3.5in;
      border-radius: 0.125in;
      overflow: hidden;
      background: #1a1a1a;
    }

    /* === FRONT === */
    .card-inner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
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
      padding: 0.12in 0.15in 0.15in;
      border-top: 1px solid #333;
    }

    .category {
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 500;
      color: #fff;
    }

    /* === BACK === */
    .card-back {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(135deg, #0d1117 0%, #080810 50%, #0d1117 100%);
    }

    .pattern {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(201, 162, 39, 0.06) 12px, rgba(201, 162, 39, 0.06) 13px),
        repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(201, 162, 39, 0.06) 12px, rgba(201, 162, 39, 0.06) 13px);
    }

    .border-outer {
      position: absolute;
      top: 0.15in; left: 0.15in; right: 0.15in; bottom: 0.15in;
      border: 2px solid #c9a227;
      border-radius: 0.06in;
    }

    .border-inner {
      position: absolute;
      top: 0.22in; left: 0.22in; right: 0.22in; bottom: 0.22in;
      border: 1px solid rgba(201, 162, 39, 0.4);
      border-radius: 0.04in;
    }

    .corner {
      position: absolute;
      width: 0.25in;
      height: 0.25in;
      border: 2px solid #c9a227;
    }
    .corner-tl { top: 0.3in; left: 0.3in; border-right: none; border-bottom: none; }
    .corner-tr { top: 0.3in; right: 0.3in; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 0.3in; left: 0.3in; border-right: none; border-top: none; }
    .corner-br { bottom: 0.3in; right: 0.3in; border-left: none; border-top: none; }

    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .eye {
      width: 0.6in;
      height: 0.3in;
      border: 2px solid #c9a227;
      border-radius: 50%;
      position: relative;
      margin: 0 auto 0.15in;
    }

    .eye::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 0.15in;
      height: 0.15in;
      background: #c9a227;
      border-radius: 50%;
    }

    .eye::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 0.06in;
      height: 0.06in;
      background: #080810;
      border-radius: 50%;
    }

    .back-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 0.25em;
      color: #c9a227;
      margin-bottom: 4px;
    }

    .back-subtitle {
      font-family: 'Playfair Display', serif;
      font-size: 11px;
      letter-spacing: 0.1em;
      color: rgba(201, 162, 39, 0.6);
      font-style: italic;
    }

    /* Screen styles */
    @media screen {
      body {
        background: #333;
        padding: 20px;
      }

      .page {
        background: white;
        margin: 0 auto 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }

      .info {
        max-width: 8.5in;
        margin: 0 auto 20px;
        padding: 16px 20px;
        background: #222;
        color: #fff;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .info h1 {
        font-size: 16px;
        color: #c9a227;
      }

      .info p {
        font-size: 13px;
        color: #888;
      }

      .info button {
        background: #c9a227;
        color: #000;
        border: none;
        padding: 10px 20px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 4px;
      }
    }

    @media print {
      .info { display: none; }
      .card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="info">
    <div>
      <h1>Futures Deck - 9 Cards</h1>
      <p>Print double-sided, flip on long edge. Cut along card edges.</p>
    </div>
    <button onclick="window.print()">Print</button>
  </div>

  <div class="page">
    ${cardFronts}
  </div>

  <div class="page">
    ${cardBacks}
  </div>

</body>
</html>`;
}

async function main() {
  console.log('Building print sheet...\n');

  // Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate HTML
  const html = generatePrintHTML();
  const htmlPath = path.join(OUTPUT_DIR, 'print.html');
  fs.writeFileSync(htmlPath, html);
  console.log('✓ print.html');

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  // Hide info bar for PDF
  await page.evaluate(() => {
    const info = document.querySelector('.info');
    if (info) info.style.display = 'none';
  });

  const pdfPath = path.join(OUTPUT_DIR, 'futures-deck-9cards.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true
  });

  await browser.close();
  console.log('✓ futures-deck-9cards.pdf');

  console.log('\n📁 ' + OUTPUT_DIR);
}

main().catch(console.error);
