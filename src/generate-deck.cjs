#!/usr/bin/env node
/**
 * Futures Deck - Complete Deck Generator
 *
 * Generates artwork via Replicate API and assembles print-ready cards.
 * Incorporates proper bleed, safe zones, and print specifications.
 *
 * Usage:
 *   node src/generate-deck.cjs                    # Generate all cards
 *   node src/generate-deck.cjs --artwork-only     # Only generate artwork
 *   node src/generate-deck.cjs --assemble-only    # Only assemble cards from existing artwork
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Print specifications (poker card size)
const PRINT_SPECS = {
  cardWidth: 2.48,      // inches (63mm)
  cardHeight: 3.46,     // inches (88mm)
  bleed: 0.125,         // 1/8 inch bleed each side
  safeMargin: 0.125,    // 1/8 inch safe zone inside cut
  dpi: 300,
  cornerRadius: 0,      // SQUARE - printer rounds corners

  get totalWidth() { return Math.round((this.cardWidth + this.bleed * 2) * this.dpi); },
  get totalHeight() { return Math.round((this.cardHeight + this.bleed * 2) * this.dpi); },
  get bleedPx() { return Math.round(this.bleed * this.dpi); },
  get safePx() { return Math.round(this.safeMargin * this.dpi); },
};

// Artwork generation style - includes bleed-aware composition instructions
const ARTWORK_STYLE = `Detailed engraving illustration with hand-tinted color, art deco geometric border frame containing small symbolic vignettes in corners and sides, central main image, fine crosshatching technique, modern subjects rendered in classical engraving style. COMPOSITION: Center the main subject with generous margins on all sides, extend decorative border pattern to fill entire frame edge-to-edge for print bleed, keep all important details away from edges. No text no letters no words.`;

// Directories
const PROJECT_DIR = path.join(__dirname, '..');
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'deck-artwork');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output', 'print-ready');

// ============================================================================
// CARD DEFINITIONS
// ============================================================================

const CARDS = [
  // Wellbeing (Desmet's fundamental needs)
  {
    id: 'well-01', name: 'Autonomy', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: person with headphones walking confidently alone through modern city, sense of freedom and self-direction. Art deco frame with small engravings: bicycle, open road, flying bird, unlocked padlock, compass, solo coffee cup. Teal and gold hand-tinted, warm mood.'
  },
  {
    id: 'well-02', name: 'Impact', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: hands releasing paper boat onto rippling water, ripples spreading outward showing influence. Art deco frame with small engravings: dominoes falling, megaphone, planted seedling growing, footprints trail, lit candle lighting others. Orange and gold hand-tinted, hopeful mood.'
  },
  {
    id: 'well-03', name: 'Relatedness', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: two people sitting together on park bench sharing quiet moment of connection. Art deco frame with small engravings: interlinked rings, bridge connecting cliffs, birds flying in formation, warm handshake, shared umbrella. Rose and warm brown hand-tinted.'
  },
  {
    id: 'well-04', name: 'Stimulation', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: person at crossroads with many diverging paths, arms open to possibilities and adventure. Art deco frame with small engravings: lightning bolt, spiral galaxy, treasure chest opening, roller coaster, firework burst. Electric blue and magenta hand-tinted, energetic mood.'
  },
  {
    id: 'well-05', name: 'Security', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: sturdy lighthouse on rocky coast, beam cutting through storm, representing stability. Art deco frame with small engravings: anchor, nested dolls, savings jar, strong walls, steady heartbeat line. Deep blue and silver hand-tinted, reassuring mood.'
  },
  {
    id: 'well-06', name: 'Purpose', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: person climbing mountain path with clear summit visible ahead, determined stride. Art deco frame with small engravings: north star, threading needle, planted flag, connecting dots, sunrise horizon. Deep purple and gold hand-tinted, inspiring mood.'
  },
  {
    id: 'well-07', name: 'Competence', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: craftsperson hands working skillfully at detailed task, mastery in motion. Art deco frame with small engravings: level-up arrow, sharpened tools, puzzle completed, practiced violin, medal earned. Bronze and forest green hand-tinted, satisfying mood.'
  },
  {
    id: 'well-08', name: 'Community', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: circle of diverse people around communal table or fire, belonging together. Art deco frame with small engravings: village houses, shared flag, potluck dishes, team jersey, campfire. Warm amber and terracotta hand-tinted, welcoming mood.'
  },
  {
    id: 'well-09', name: 'Recognition', category: 'Wellbeing', categoryColor: '#FFD93D',
    prompt: 'Central image: person in spotlight on stage, audience applauding, moment of acknowledgment. Art deco frame with small engravings: trophy, thumbs up, name in lights, podium, framed certificate. Gold and royal purple hand-tinted, proud mood.'
  },

  // Arc (narrative trajectories)
  {
    id: 'arc-01', name: 'Growth', category: 'Arc', categoryColor: '#a855f7',
    prompt: 'Central image: city skyline with cranes building upward, rockets launching, trees growing tall, expansion. Art deco frame with small engravings: exponential curve, expanding circles, seedling sprouting, stacking coins, network branching. Green and gold hand-tinted, optimistic mood.'
  },
  {
    id: 'arc-02', name: 'Collapse', category: 'Arc', categoryColor: '#a855f7',
    prompt: 'Central image: crumbling classical building with nature reclaiming it, entropy in motion. Art deco frame with small engravings: falling graph, broken chain, empty hourglass, scattered pieces, setting sun. Rust and grey hand-tinted, somber mood.'
  },
  {
    id: 'arc-03', name: 'Transformation', category: 'Arc', categoryColor: '#a855f7',
    prompt: 'Central image: butterfly emerging from chrysalis, metamorphosis, complete change of form. Art deco frame with small engravings: yin-yang, phoenix rising, caterpillar stages, DNA helix, prism splitting light. Iridescent rainbow hand-tinted, transcendent mood.'
  },
  {
    id: 'arc-04', name: 'Discipline', category: 'Arc', categoryColor: '#a855f7',
    prompt: 'Central image: ordered geometric city grid from above, precise and controlled, systematic. Art deco frame with small engravings: surveillance eye, uniform rows, checkpoint gate, algorithmic pattern, synchronized clocks. Steel blue and white hand-tinted, austere mood.'
  },

  // Terrain (domains of life)
  {
    id: 'terrain-01', name: 'The Ocean', category: 'Terrain', categoryColor: '#4ECDC4',
    prompt: 'Central image: vast ocean with floating city on horizon, submarine exploring depths below waves. Art deco frame with small engravings: whale tail, offshore wind turbine, shipping container, coral reef, lighthouse beacon. Deep teal and turquoise hand-tinted, expansive mood.'
  },
  {
    id: 'terrain-02', name: 'Healthcare', category: 'Terrain', categoryColor: '#4ECDC4',
    prompt: 'Central image: healing hands with soft glow, medical care and human touch combined. Art deco frame with small engravings: stethoscope, DNA strand, hospital bed, pill bottle, beating heart. Clinical white and soft pink hand-tinted, caring mood.'
  },
  {
    id: 'terrain-03', name: 'Education', category: 'Terrain', categoryColor: '#4ECDC4',
    prompt: 'Central image: open book with ideas floating up from pages, knowledge taking flight. Art deco frame with small engravings: graduation cap, lightbulb moment, school desk, globe, raised hand. Warm yellow and brown hand-tinted, enlightening mood.'
  },
  {
    id: 'terrain-04', name: 'Commerce', category: 'Terrain', categoryColor: '#4ECDC4',
    prompt: 'Central image: bustling marketplace with goods exchanging hands, trade in motion. Art deco frame with small engravings: currency symbols, shopping bag, handshake deal, stock ticker, delivery truck. Green and copper hand-tinted, prosperous mood.'
  },

  // Object (things that matter)
  {
    id: 'object-01', name: 'Ritual', category: 'Object', categoryColor: '#FF8C42',
    prompt: 'Central image: hands lighting ceremonial candles in circle arrangement, marking sacred moment. Art deco frame with small engravings: wedding rings, graduation cap, birthday cake, handshake, rising sun. Warm amber and purple hand-tinted, reverent mood.'
  },
  {
    id: 'object-02', name: 'Device', category: 'Object', categoryColor: '#FF8C42',
    prompt: 'Central image: glowing smartphone or tablet in hands, portal to digital world. Art deco frame with small engravings: circuit board, notification bell, charging cable, app icons, wifi waves. Electric blue and black hand-tinted, modern mood.'
  },
  {
    id: 'object-03', name: 'Vehicle', category: 'Object', categoryColor: '#FF8C42',
    prompt: 'Central image: sleek autonomous vehicle on open road, movement and possibility. Art deco frame with small engravings: wheel, wings, train tracks, boat sail, rocket. Silver and speed-blur blue hand-tinted, dynamic mood.'
  },

  // Timeframe
  {
    id: 'time-01', name: '5 Years', category: 'Timeframe', categoryColor: '#60a5fa',
    prompt: 'Central image: person standing at path stretching into visible but misty distance, medium horizon. Art deco frame with small engravings: calendar pages, hourglass, growing plant stages, milestone markers, compass rose. Blue and silver hand-tinted, contemplative mood.'
  },
  {
    id: 'time-02', name: '10 Years', category: 'Timeframe', categoryColor: '#60a5fa',
    prompt: 'Central image: child and elder version of same person facing each other across time. Art deco frame with small engravings: decade calendar, tree rings, photo album, clock face, moon phases. Sepia and gold hand-tinted, reflective mood.'
  },
  {
    id: 'time-03', name: 'Now', category: 'Timeframe', categoryColor: '#60a5fa',
    prompt: 'Central image: vivid present moment, sharp focused instant, everything happening at once. Art deco frame with small engravings: stopwatch at zero, today circled, lightning strike, heartbeat peak, exclamation point. Bright red and white hand-tinted, urgent mood.'
  },

  // Modifier
  {
    id: 'mod-01', name: 'Breakthrough', category: 'Modifier', categoryColor: '#f87171',
    prompt: 'Central image: brilliant light bursting through cracked barrier, illuminating everything around. Art deco frame with small engravings: lightbulb eureka, puzzle piece clicking, door opening wide, ascending arrow, champagne pop. Electric yellow and white hand-tinted, triumphant mood.'
  },
  {
    id: 'mod-02', name: 'Setback', category: 'Modifier', categoryColor: '#f87171',
    prompt: 'Central image: person pausing at unexpected roadblock, obstacle requiring new approach. Art deco frame with small engravings: detour sign, broken bridge, tangled knot, rain cloud, pause symbol. Grey and muted orange hand-tinted, challenging mood.'
  },
];

// ============================================================================
// ARTWORK GENERATION (Replicate API)
// ============================================================================

async function generateArtwork(card) {
  const fullPrompt = `${ARTWORK_STYLE} ${card.prompt}`;

  console.log(`  🎨 ${card.name}...`);

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-1.1-pro',
      input: {
        prompt: fullPrompt,
        aspect_ratio: '4:5',  // Matches artwork area in card layout
        output_format: 'png',
        output_quality: 95,
        safety_tolerance: 5,
        prompt_upsampling: true
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.log(`     ✗ Error: ${data.detail || JSON.stringify(data)}`);
    return null;
  }

  // Poll for completion
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const check = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
    });
    const result = await check.json();
    process.stdout.write('.');

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      const imgResponse = await fetch(imageUrl);
      const buffer = await imgResponse.arrayBuffer();

      const outputPath = path.join(ARTWORK_DIR, `${card.id}.png`);
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(` ✓`);
      return outputPath;
    }
    if (result.status === 'failed') {
      console.log(` ✗ ${result.error}`);
      return null;
    }
  }
  console.log(` ✗ Timeout`);
  return null;
}

// ============================================================================
// CARD ASSEMBLY (Puppeteer)
// ============================================================================

function generateFrontHTML(card) {
  const imagePath = path.join(ARTWORK_DIR, `${card.id}.png`);
  const bleed = PRINT_SPECS.bleedPx;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Source+Sans+Pro:wght@600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${PRINT_SPECS.totalWidth}px;
      height: ${PRINT_SPECS.totalHeight}px;
      background: #1a1a1a;
    }

    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      /* SQUARE corners - printer rounds them */
    }

    .artwork {
      flex: 1;
      overflow: hidden;
      /* Artwork extends into bleed area */
    }

    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .text-panel {
      background: linear-gradient(to bottom, #1a1a1a, #0f0f0f);
      /* Extra padding accounts for bleed on sides and bottom */
      padding: 28px ${bleed + 36}px ${bleed + 40}px;
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

function generateBackHTML() {
  const bleed = PRINT_SPECS.bleedPx;
  const w = PRINT_SPECS.totalWidth;
  const h = PRINT_SPECS.totalHeight;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Bebas+Neue&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${w}px;
      height: ${h}px;
      background: #0a0a12;
    }

    .back {
      width: 100%;
      height: 100%;
      position: relative;
      background:
        /* Radial glow in center */
        radial-gradient(ellipse at center, rgba(201, 162, 39, 0.08) 0%, transparent 50%),
        /* Base gradient */
        linear-gradient(135deg, #0d1117 0%, #0a0a12 50%, #0d1117 100%);
    }

    /* Repeating geometric pattern - extends to edges for bleed */
    .pattern {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(201, 162, 39, 0.04) 24px, rgba(201, 162, 39, 0.04) 25px),
        repeating-linear-gradient(-45deg, transparent, transparent 24px, rgba(201, 162, 39, 0.04) 24px, rgba(201, 162, 39, 0.04) 25px);
    }

    /* Decorative border - inside safe zone */
    .border-outer {
      position: absolute;
      top: ${bleed + 24}px;
      left: ${bleed + 24}px;
      right: ${bleed + 24}px;
      bottom: ${bleed + 24}px;
      border: 3px solid #c9a227;
    }

    .border-inner {
      position: absolute;
      top: ${bleed + 38}px;
      left: ${bleed + 38}px;
      right: ${bleed + 38}px;
      bottom: ${bleed + 38}px;
      border: 1px solid rgba(201, 162, 39, 0.5);
    }

    /* Corner ornaments */
    .corner {
      position: absolute;
      width: 50px;
      height: 50px;
      border: 2px solid #c9a227;
    }
    .corner-tl { top: ${bleed + 52}px; left: ${bleed + 52}px; border-right: none; border-bottom: none; }
    .corner-tr { top: ${bleed + 52}px; right: ${bleed + 52}px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: ${bleed + 52}px; left: ${bleed + 52}px; border-right: none; border-top: none; }
    .corner-br { bottom: ${bleed + 52}px; right: ${bleed + 52}px; border-left: none; border-top: none; }

    /* Radiating lines */
    .sunburst {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px; height: 600px;
    }
    .ray {
      position: absolute;
      top: 50%; left: 50%;
      width: 300px; height: 1px;
      background: linear-gradient(90deg, rgba(201, 162, 39, 0.5) 0%, transparent 100%);
      transform-origin: left center;
    }

    /* Diamond shapes */
    .diamond {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      border: 1px solid rgba(201, 162, 39, 0.25);
    }
    .diamond-1 { width: 180px; height: 180px; }
    .diamond-2 { width: 260px; height: 260px; }
    .diamond-3 { width: 340px; height: 340px; }
    .diamond-4 { width: 420px; height: 420px; }

    /* Central content - well within safe zone */
    .center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
    }

    .eye {
      width: 100px; height: 50px;
      border: 2px solid #c9a227;
      border-radius: 50%;
      position: relative;
      margin: 0 auto 24px;
    }
    .eye::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 26px; height: 26px;
      background: #c9a227;
      border-radius: 50%;
    }
    .eye::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 10px; height: 10px;
      background: #0a0a12;
      border-radius: 50%;
    }

    .title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 32px;
      letter-spacing: 0.35em;
      color: #c9a227;
      margin-bottom: 6px;
    }

    .subtitle {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      letter-spacing: 0.12em;
      color: rgba(201, 162, 39, 0.6);
      font-style: italic;
    }

    /* Top/bottom decorative elements */
    .deco-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 80px; height: 2px;
      background: #c9a227;
    }
    .deco-line-top { top: ${bleed + 90}px; }
    .deco-line-bottom { bottom: ${bleed + 90}px; }

    .deco-dot {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 8px; height: 8px;
      background: #c9a227;
    }
    .deco-dot-top { top: ${bleed + 72}px; }
    .deco-dot-bottom { bottom: ${bleed + 72}px; }
  </style>
</head>
<body>
  <div class="back">
    <div class="pattern"></div>

    <div class="diamond diamond-4"></div>
    <div class="diamond diamond-3"></div>
    <div class="diamond diamond-2"></div>
    <div class="diamond diamond-1"></div>

    <div class="sunburst">
      ${Array.from({length: 36}, (_, i) => `<div class="ray" style="transform: rotate(${i * 10}deg);"></div>`).join('')}
    </div>

    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="deco-dot deco-dot-top"></div>
    <div class="deco-line deco-line-top"></div>
    <div class="deco-dot deco-dot-bottom"></div>
    <div class="deco-line deco-line-bottom"></div>

    <div class="center">
      <div class="eye"></div>
      <div class="title">Futures Deck</div>
      <div class="subtitle">Speculative Oracle</div>
    </div>
  </div>
</body>
</html>`;
}

async function assembleCard(browser, card) {
  const page = await browser.newPage();
  await page.setViewport({
    width: PRINT_SPECS.totalWidth,
    height: PRINT_SPECS.totalHeight,
    deviceScaleFactor: 1
  });

  const html = generateFrontHTML(card);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(OUTPUT_DIR, `${card.id}-front.png`);
  await page.screenshot({ path: outputPath, type: 'png', fullPage: true });

  await page.close();
  return outputPath;
}

async function assembleBack(browser) {
  const page = await browser.newPage();
  await page.setViewport({
    width: PRINT_SPECS.totalWidth,
    height: PRINT_SPECS.totalHeight,
    deviceScaleFactor: 1
  });

  const html = generateBackHTML();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.join(OUTPUT_DIR, 'card-back.png');
  await page.screenshot({ path: outputPath, type: 'png', fullPage: true });

  await page.close();
  return outputPath;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const artworkOnly = args.includes('--artwork-only');
  const assembleOnly = args.includes('--assemble-only');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          FUTURES DECK — Complete Deck Generator            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Print Specifications:');
  console.log(`  Card:       ${PRINT_SPECS.cardWidth}" × ${PRINT_SPECS.cardHeight}" (poker size)`);
  console.log(`  With bleed: ${(PRINT_SPECS.cardWidth + PRINT_SPECS.bleed * 2).toFixed(3)}" × ${(PRINT_SPECS.cardHeight + PRINT_SPECS.bleed * 2).toFixed(3)}"`);
  console.log(`  Resolution: ${PRINT_SPECS.dpi} DPI (${PRINT_SPECS.totalWidth} × ${PRINT_SPECS.totalHeight} px)`);
  console.log(`  Bleed:      ${PRINT_SPECS.bleed}" (${PRINT_SPECS.bleedPx}px) each side`);
  console.log(`  Safe zone:  ${PRINT_SPECS.safeMargin}" (${PRINT_SPECS.safePx}px) inside cut`);
  console.log(`  Corners:    SQUARE (printer rounds them)\n`);

  // Create directories
  [ARTWORK_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Generate artwork
  if (!assembleOnly) {
    console.log(`\n━━━ GENERATING ARTWORK (${CARDS.length} cards) ━━━\n`);

    for (const card of CARDS) {
      const existing = path.join(ARTWORK_DIR, `${card.id}.png`);
      if (fs.existsSync(existing)) {
        console.log(`  ⏭️  ${card.name} (exists)`);
        continue;
      }

      await generateArtwork(card);
      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    }
  }

  if (artworkOnly) {
    console.log('\n✓ Artwork generation complete');
    console.log(`📁 ${ARTWORK_DIR}\n`);
    return;
  }

  // Assemble print-ready cards
  console.log(`\n━━━ ASSEMBLING PRINT-READY CARDS ━━━\n`);

  const browser = await puppeteer.launch();

  for (const card of CARDS) {
    const artworkPath = path.join(ARTWORK_DIR, `${card.id}.png`);
    if (!fs.existsSync(artworkPath)) {
      console.log(`  ⏭️  ${card.name} (no artwork)`);
      continue;
    }

    await assembleCard(browser, card);
    console.log(`  ✓ ${card.name}`);
  }

  console.log('\n  Generating card back...');
  await assembleBack(browser);
  console.log('  ✓ Card Back');

  await browser.close();

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`✓ Generated ${CARDS.length} fronts + 1 back`);
  console.log(`📁 Artwork: ${ARTWORK_DIR}`);
  console.log(`📁 Print-ready: ${OUTPUT_DIR}`);
  console.log('\nReady for upload to:');
  console.log('  • MakePlayingCards.com');
  console.log('  • The Game Crafter');
  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
