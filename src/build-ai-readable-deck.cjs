#!/usr/bin/env node
/**
 * Futures Deck - AI-Readable Card Generator
 *
 * Cards designed to be photographed and interpreted by ChatGPT/Claude.
 * Includes machine-readable text prompts on each card.
 * Proper bleed for professional printing.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'deck-artwork');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output', 'print-ready');

// Print specs with bleed
const SPECS = {
  cardWidth: 2.5,       // inches (poker)
  cardHeight: 3.5,      // inches
  bleed: 0.125,         // 1/8 inch
  get totalWidth() { return this.cardWidth + this.bleed * 2; },
  get totalHeight() { return this.cardHeight + this.bleed * 2; },
};

// Card definitions with AI-readable descriptions
const CARDS = [
  {
    id: 'well-01', name: 'Autonomy', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Independence, self-direction, freedom to choose. Control over decisions, personal agency, opt-out power.'
  },
  {
    id: 'well-02', name: 'Impact', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Making a difference, influence on outcomes. Leaving marks, changing systems, mattering to others.'
  },
  {
    id: 'well-03', name: 'Relatedness', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Close bonds, intimacy, caring relationships. Connection, belonging, being known and loved.'
  },
  {
    id: 'well-04', name: 'Stimulation', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Novelty, excitement, new experiences. Variety, adventure, escape from monotony, engaged attention.'
  },
  {
    id: 'arc-01', name: 'Growth', category: 'Arc', color: '#a855f7',
    prompt: 'Trajectory of expansion. More, faster, bigger. Progress continues. Development climbs upward.'
  },
  {
    id: 'terrain-01', name: 'The Ocean', category: 'Terrain', color: '#4ECDC4',
    prompt: 'Domain: seas and waters. Shipping, aquaculture, underwater habitats, marine resources, coastal life.'
  },
  {
    id: 'object-01', name: 'Ritual', category: 'Object', color: '#FF8C42',
    prompt: 'Artifact: ceremonies, traditions, repeated meaningful acts. Rites of passage, daily routines, sacred moments.'
  },
  {
    id: 'time-01', name: '5 Years', category: 'Timeframe', color: '#60a5fa',
    prompt: 'Horizon: medium-term. Recognizable but shifted. Current trends matured. Plans become reality.'
  },
  {
    id: 'mod-01', name: 'Breakthrough', category: 'Modifier', color: '#f87171',
    prompt: 'Pace modifier: acceleration. Unexpected leap, barrier broken, eureka moment. Timeline compressed.'
  },
  // --- SET 2 ---
  {
    id: 'well-05', name: 'Security', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Safety, stability, predictability. Protection from threats, reliable foundations, peace of mind.'
  },
  {
    id: 'well-06', name: 'Purpose', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Meaning, direction, goals worth pursuing. Life pointing somewhere, efforts adding up, mission clarity.'
  },
  {
    id: 'well-07', name: 'Competence', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Mastery, skill, effectiveness. Knowing how, solving problems, capability growing through practice.'
  },
  {
    id: 'well-08', name: 'Community', category: 'Wellbeing', color: '#FFD93D',
    prompt: 'Group belonging, shared identity. Tribes, teams, movements. Part of something larger than self.'
  },
  {
    id: 'arc-02', name: 'Collapse', category: 'Arc', color: '#a855f7',
    prompt: 'Trajectory of decline. Systems failing, order fragmenting. Entropy wins, structures crumble.'
  },
  {
    id: 'arc-03', name: 'Transformation', category: 'Arc', color: '#a855f7',
    prompt: 'Trajectory of metamorphosis. Fundamental change, unrecognizable from before. New paradigm emerges.'
  },
  {
    id: 'terrain-02', name: 'Healthcare', category: 'Terrain', color: '#4ECDC4',
    prompt: 'Domain: medicine, bodies, minds. Hospitals, treatments, longevity, mental health, biotech.'
  },
  {
    id: 'terrain-03', name: 'Education', category: 'Terrain', color: '#4ECDC4',
    prompt: 'Domain: learning, knowledge transfer. Schools, skills, credentials, wisdom passed between generations.'
  },
  {
    id: 'object-02', name: 'Device', category: 'Object', color: '#FF8C42',
    prompt: 'Artifact: technology in hand. Phones, wearables, implants, tools that extend human capability.'
  },
];

// Prompt cards - pure text instructions for the AI
const PROMPT_CARDS = [
  {
    id: 'prompt-01',
    title: 'Describe This Future',
    text: `You are interpreting a Futures Deck spread.

Look at the cards laid out and weave them into a coherent speculative future.

Consider:
• The ARC sets the overall trajectory
• The TERRAIN defines the domain
• The OBJECT is a key artifact
• WELLBEING cards show human impact
• TIMEFRAME sets when this occurs
• MODIFIERS adjust the pace

Describe a vivid, specific future that incorporates all visible cards.`
  },
  {
    id: 'prompt-02',
    title: 'A Day In The Life',
    text: `Describe a single day in someone's life in this future.

Use the cards visible in this spread to shape:
• Where they live and work
• What technology they use
• Their relationships and community
• Their hopes and concerns
• Small details that make it real

Be specific. Use names, places, sensory details. Make it feel lived-in.`
  },
  {
    id: 'prompt-03',
    title: 'What Went Wrong?',
    text: `This spread shows a future that emerged from choices made today.

Describe the path that led here:
• What decisions were made?
• What was ignored or overlooked?
• Who won and who lost?
• What unintended consequences emerged?

Focus on the human and systemic failures that created this world.`
  },
  {
    id: 'prompt-04',
    title: 'What Went Right?',
    text: `This spread shows a future that emerged from choices made today.

Describe the path that led here:
• What breakthroughs occurred?
• What movements gained power?
• What old problems were solved?
• What new possibilities opened up?

Focus on the human ingenuity and cooperation that created this world.`
  },
];

function generateCardFrontHTML(card) {
  const artworkPath = path.join(ARTWORK_DIR, `${card.id}.png`);
  const bleed = SPECS.bleed;

  return `
    <div class="card" style="width: ${SPECS.totalWidth}in; height: ${SPECS.totalHeight}in;">
      <div class="card-content" style="
        position: absolute;
        top: ${bleed}in; left: ${bleed}in;
        width: ${SPECS.cardWidth}in; height: ${SPECS.cardHeight}in;
        background: #1a1a1a;
        border-radius: 0.12in;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div class="artwork" style="flex: 1; overflow: hidden;">
          <img src="file://${artworkPath}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="text-panel" style="
          background: #1a1a1a;
          padding: 0.08in 0.12in;
          border-top: 1px solid #333;
        ">
          <div style="font-size: 7px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${card.color}; margin-bottom: 2px;">
            ${card.category}
          </div>
          <div style="font-family: 'Playfair Display', serif; font-size: 16px; color: #fff;">
            ${card.name}
          </div>
        </div>
        <div class="ai-prompt" style="
          background: #fff;
          padding: 0.06in 0.1in;
          font-size: 6.5px;
          line-height: 1.45;
          color: #222;
          font-family: 'Source Sans Pro', sans-serif;
        ">
          ${card.prompt}
        </div>
      </div>
      <!-- Bleed extension - white at bottom for prompt area -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0.4in; background: #1a1a1a; z-index: -1;"></div>
      <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 0.4in; background: #fff; z-index: -1;"></div>
    </div>`;
}

function generateCardBackHTML() {
  const bleed = SPECS.bleed;

  return `
    <div class="card" style="width: ${SPECS.totalWidth}in; height: ${SPECS.totalHeight}in; position: relative;">
      <!-- Bleed background -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #080810;"></div>

      <!-- Pattern extends to bleed -->
      <div style="
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background-image:
          repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(201, 162, 39, 0.05) 10px, rgba(201, 162, 39, 0.05) 11px),
          repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(201, 162, 39, 0.05) 10px, rgba(201, 162, 39, 0.05) 11px);
      "></div>

      <!-- Content area -->
      <div style="
        position: absolute;
        top: ${bleed}in; left: ${bleed}in;
        width: ${SPECS.cardWidth}in; height: ${SPECS.cardHeight}in;
      ">
        <!-- Border -->
        <div style="
          position: absolute;
          top: 0.12in; left: 0.12in; right: 0.12in; bottom: 0.12in;
          border: 2px solid #c9a227;
          border-radius: 0.08in;
        "></div>

        <!-- Inner border -->
        <div style="
          position: absolute;
          top: 0.2in; left: 0.2in; right: 0.2in; bottom: 0.2in;
          border: 1px solid rgba(201, 162, 39, 0.4);
          border-radius: 0.05in;
        "></div>

        <!-- Center content -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        ">
          <!-- Eye -->
          <div style="
            width: 0.5in; height: 0.25in;
            border: 2px solid #c9a227;
            border-radius: 50%;
            margin: 0 auto 0.12in;
            position: relative;
          ">
            <div style="
              position: absolute; top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: 0.12in; height: 0.12in;
              background: #c9a227;
              border-radius: 50%;
            "></div>
          </div>

          <div style="
            font-family: 'Bebas Neue', sans-serif;
            font-size: 24px;
            letter-spacing: 0.2em;
            color: #c9a227;
            margin-bottom: 4px;
          ">FUTURES DECK</div>

          <div style="
            font-family: 'Playfair Display', serif;
            font-size: 10px;
            letter-spacing: 0.08em;
            color: rgba(201, 162, 39, 0.6);
            font-style: italic;
          ">Speculative Oracle</div>
        </div>
      </div>
    </div>`;
}

function generatePromptCardHTML(card) {
  const bleed = SPECS.bleed;

  return `
    <div class="card" style="width: ${SPECS.totalWidth}in; height: ${SPECS.totalHeight}in; position: relative;">
      <!-- Bleed background -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #f8f6f0;"></div>

      <!-- Content area -->
      <div style="
        position: absolute;
        top: ${bleed}in; left: ${bleed}in;
        width: ${SPECS.cardWidth}in; height: ${SPECS.cardHeight}in;
        background: #f8f6f0;
        border-radius: 0.12in;
        padding: 0.2in;
        display: flex;
        flex-direction: column;
      ">
        <!-- Border -->
        <div style="
          position: absolute;
          top: 0.1in; left: 0.1in; right: 0.1in; bottom: 0.1in;
          border: 2px solid #c9a227;
          border-radius: 0.08in;
          pointer-events: none;
        "></div>

        <!-- Title -->
        <div style="
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 0.15em;
          color: #c9a227;
          text-align: center;
          margin-bottom: 0.1in;
          padding-top: 0.05in;
        ">${card.title.toUpperCase()}</div>

        <!-- Divider -->
        <div style="
          width: 0.5in;
          height: 2px;
          background: #c9a227;
          margin: 0 auto 0.12in;
        "></div>

        <!-- Text content -->
        <div style="
          font-family: 'Source Sans Pro', sans-serif;
          font-size: 9px;
          line-height: 1.5;
          color: #333;
          flex: 1;
          white-space: pre-wrap;
        ">${card.text}</div>

        <!-- Footer -->
        <div style="
          font-family: 'Playfair Display', serif;
          font-size: 8px;
          color: #999;
          text-align: center;
          font-style: italic;
          margin-top: 0.08in;
        ">Futures Deck — Prompt Card</div>
      </div>
    </div>`;
}

function generatePrintPageHTML(cards, isBack = false) {
  const cardHTML = isBack
    ? cards.map(() => generateCardBackHTML()).join('\n')
    : cards.map(c => c.isPrompt ? generatePromptCardHTML(c) : generateCardFrontHTML(c)).join('\n');

  // Calculate positions for cut marks
  const pageW = 8.5;
  const pageH = 11;
  const cardW = SPECS.totalWidth;
  const cardH = SPECS.totalHeight;
  const gap = 0.05;
  const gridW = cardW * 3 + gap * 2;
  const gridH = cardH * 3 + gap * 2;
  const offsetX = (pageW - gridW) / 2;
  const offsetY = (pageH - gridH) / 2;

  // Cut mark positions (at card edges, inside bleed)
  const bleed = SPECS.bleed;
  const cutMarks = [];
  for (let col = 0; col <= 3; col++) {
    const x = offsetX + col * (cardW + gap) - (col > 0 ? gap : 0) + (col > 0 ? bleed : bleed);
    if (col > 0) {
      // Top marks
      cutMarks.push(`<div class="cut-mark cut-v" style="left: ${x - bleed}in; top: 0.1in;"></div>`);
      // Bottom marks
      cutMarks.push(`<div class="cut-mark cut-v" style="left: ${x - bleed}in; bottom: 0.1in;"></div>`);
    }
  }
  for (let row = 0; row <= 3; row++) {
    const y = offsetY + row * (cardH + gap) - (row > 0 ? gap : 0) + (row > 0 ? bleed : bleed);
    if (row > 0) {
      // Left marks
      cutMarks.push(`<div class="cut-mark cut-h" style="top: ${y - bleed}in; left: 0.1in;"></div>`);
      // Right marks
      cutMarks.push(`<div class="cut-mark cut-h" style="top: ${y - bleed}in; right: 0.1in;"></div>`);
    }
  }

  return `
    <div class="page" style="
      width: 8.5in;
      height: 11in;
      padding: 0.25in;
      display: grid;
      grid-template-columns: repeat(3, ${SPECS.totalWidth}in);
      grid-template-rows: repeat(3, ${SPECS.totalHeight}in);
      gap: ${gap}in;
      justify-content: center;
      align-content: center;
      page-break-after: always;
      background: white;
      position: relative;
    ">
      ${cardHTML}
      ${cutMarks.join('\n      ')}
    </div>`;
}

async function generateIndividualCards(browser) {
  const cardsDir = path.join(OUTPUT_DIR, 'individual-cards');
  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
  }

  const allCards = [
    ...CARDS,
    ...PROMPT_CARDS.map(p => ({ ...p, isPrompt: true }))
  ];

  console.log('\n📦 Generating individual card files...\n');

  // Use 300 DPI scale
  const scale = 300 / 96;
  const widthPx = Math.round(SPECS.totalWidth * 96 * scale);
  const heightPx = Math.round(SPECS.totalHeight * 96 * scale);

  for (const card of allCards) {
    const page = await browser.newPage();
    await page.setViewport({ width: Math.round(SPECS.totalWidth * 96), height: Math.round(SPECS.totalHeight * 96), deviceScaleFactor: scale });

    const cardHTML = card.isPrompt ? generatePromptCardHTML(card) : generateCardFrontHTML(card);
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+Pro:wght@400;600&family=Bebas+Neue&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${SPECS.totalWidth}in; height: ${SPECS.totalHeight}in; }
  </style>
</head>
<body>${cardHTML}</body>
</html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 500)); // Brief pause for fonts
    await page.screenshot({
      path: path.join(cardsDir, `${card.id}-front.png`),
      type: 'png'
    });
    await page.close();
    console.log(`  ✓ ${card.id}-front.png`);
  }

  // Generate card back
  const page = await browser.newPage();
  await page.setViewport({ width: Math.round(SPECS.totalWidth * 96), height: Math.round(SPECS.totalHeight * 96), deviceScaleFactor: scale });

  const backHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+Pro:wght@400;600&family=Bebas+Neue&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${SPECS.totalWidth}in; height: ${SPECS.totalHeight}in; }
  </style>
</head>
<body>${generateCardBackHTML()}</body>
</html>`;

  await page.setContent(backHTML, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(cardsDir, 'card-back.png'),
    type: 'png'
  });
  await page.close();
  console.log(`  ✓ card-back.png`);

  console.log(`\n📁 ${cardsDir}`);
}

async function main() {
  console.log('Building AI-readable Futures Deck...\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Combine regular cards and prompt cards
  const allCards = [
    ...CARDS,
    ...PROMPT_CARDS.map(p => ({ ...p, isPrompt: true }))
  ];

  // Split into pages of 9
  const pages = [];
  for (let i = 0; i < allCards.length; i += 9) {
    pages.push(allCards.slice(i, i + 9));
  }

  // Pad last page if needed
  while (pages[pages.length - 1].length < 9) {
    pages[pages.length - 1].push({ ...PROMPT_CARDS[0], isPrompt: true });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Futures Deck - AI Readable</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+Pro:wght@400;600&family=Bebas+Neue&display=swap" rel="stylesheet">
  <style>
    @page { size: letter; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #444; font-family: 'Source Sans Pro', sans-serif; }
    .card { position: relative; overflow: hidden; }

    /* Cut marks */
    .cut-mark {
      position: absolute;
      background: #000;
      z-index: 100;
    }
    .cut-v {
      width: 1px;
      height: 0.15in;
    }
    .cut-h {
      width: 0.15in;
      height: 1px;
    }

    @media screen {
      .page { margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
      .info {
        max-width: 8.5in;
        margin: 20px auto;
        padding: 16px 20px;
        background: #222;
        color: #fff;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info h1 { font-size: 16px; color: #c9a227; }
      .info p { font-size: 12px; color: #888; margin-top: 4px; }
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
      body { background: white; }
      .info { display: none; }
      .page:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="info">
    <div>
      <h1>Futures Deck - AI Readable Cards</h1>
      <p>${CARDS.length} vision cards + ${PROMPT_CARDS.length} prompt cards | With bleed for professional printing</p>
    </div>
    <button onclick="window.print()">Print</button>
  </div>

  ${pages.map((pageCards, i) => `
    <!-- Page ${i * 2 + 1}: Fronts -->
    ${generatePrintPageHTML(pageCards, false)}
    <!-- Page ${i * 2 + 2}: Backs -->
    ${generatePrintPageHTML(pageCards, true)}
  `).join('\n')}
</body>
</html>`;

  const htmlPath = path.join(OUTPUT_DIR, 'futures-deck-ai-readable.html');
  fs.writeFileSync(htmlPath, html);
  console.log('✓ futures-deck-ai-readable.html');

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    const info = document.querySelector('.info');
    if (info) info.style.display = 'none';
  });

  const pdfPath = path.join(OUTPUT_DIR, 'futures-deck-ai-readable.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true
  });
  console.log('✓ futures-deck-ai-readable.pdf (with cut marks)');
  await browser.close();

  // Generate individual card files for pro printing
  const browser2 = await puppeteer.launch();
  await generateIndividualCards(browser2);
  await browser2.close();

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`✓ ${CARDS.length} vision cards + ${PROMPT_CARDS.length} prompt cards`);
  console.log('\nOutput:');
  console.log(`  📄 Sheet PDF (home printing): futures-deck-ai-readable.pdf`);
  console.log(`  📁 Individual PNGs (pro printing): individual-cards/`);
  console.log('\nSpecs:');
  console.log('  • Bleed: 0.125" on all sides');
  console.log('  • Size: 2.75" × 3.75" (with bleed)');
  console.log('  • Resolution: 300 DPI');
  console.log('════════════════════════════════════════════════════════════');
}

main().catch(console.error);
