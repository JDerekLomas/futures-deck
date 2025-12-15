#!/usr/bin/env node
/**
 * FUTURES DECK — Midjourney Card Generator via Mulerouter
 *
 * Usage:
 *   MULEROUTER_URL=https://your-mulerouter.com MULEROUTER_KEY=xxx node generate-cards.js
 *
 * Or set in .env file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MULEROUTER_URL = process.env.MULEROUTER_URL || 'http://localhost:3001';
const MULEROUTER_KEY = process.env.MULEROUTER_KEY || '';

// Haring base style
const HARING_STYLE = `Keith Haring style illustration, bold black outlines, flat bright colors, simple iconic figures, radiant energy lines, figures in dynamic poses, pop art aesthetic, solid color fills, playful and energetic, multiple figures interacting, thick black stroke weight, 1980s street art style, white background`;

// First 5 cards to generate
const CARDS_TO_GENERATE = [
  {
    id: 'domain-01',
    name: 'Finance & Banking',
    type: 'domain',
    bgColor: 'teal cyan background',
    prompt: `${HARING_STYLE}, figures exchanging money and coins, dancing figures with dollar signs, figures climbing bar charts, piggy bank symbols, figures shaking hands over deals, figures juggling gold coins, bright green gold and teal colors, ${getBgColor('domain')} --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'domain-02',
    name: 'Healthcare & Pharma',
    type: 'domain',
    prompt: `${HARING_STYLE}, figures with glowing red hearts in chests, dancing figures forming medical cross shape, figures carrying others on stretchers, pill and capsule shapes, figures with stethoscopes, healing energy radiating from hands, DNA helix made of linked dancing figures, bright red white pink and teal colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-01',
    name: 'Autonomy / Agency',
    type: 'wellbeing',
    prompt: `${HARING_STYLE}, single figure breaking free from chains, figure choosing between multiple branching paths, figure with compass directing own destiny, figures each dancing independently freely, figure pushing away controlling hands, figure steering own ship wheel, radiant self-determination energy lines, figure standing alone confidently with arms raised, bold red and orange empowerment colors on golden yellow background --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-06',
    name: 'Equity / Fairness',
    type: 'wellbeing',
    prompt: `${HARING_STYLE}, figures of different sizes all standing at equal height on different platforms, perfectly balanced scales with figures on each side, figures sharing resources passing items evenly, figures lifting smaller figures up to same level, circle of diverse figures all with equal radiant lines, figures redistributing to create balance, level playing field with figures, yellow and orange justice colors on golden background --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'tech-01',
    name: 'Fault-Tolerant Quantum Computing',
    type: 'tech',
    prompt: `${HARING_STYLE}, figures dancing inside computer and circuit shapes, figures catching and fixing falling pieces together, interlocking stable figure structures like building blocks, figures juggling glowing orbs without dropping any, fortress made of reliable connected figures, figures with checkmarks above heads showing success, robust interconnected system of figures, electric blue white and hot pink colors --ar 5:7 --style raw --v 6.1`
  }
];

// Card back (Pollock style)
const CARD_BACKS = {
  domain: {
    id: 'back-domain',
    prompt: `Jackson Pollock style abstract expressionist painting, chaotic drip painting technique, splattered paint layers, energetic gestural marks, interweaving paint drips, dynamic movement, layered enamel paint effect, predominantly teal cyan and blue paint drips with white accents, action painting aesthetic, no recognizable shapes, raw artistic energy --ar 5:7 --style raw --v 6.1`
  },
  wellbeing: {
    id: 'back-wellbeing',
    prompt: `Jackson Pollock style abstract expressionist painting, chaotic drip painting technique, splattered paint layers, warm golden yellow and orange paint drips with amber accents, energetic gestural marks, organic flowing drip lines, human warmth energy feeling, action painting aesthetic --ar 5:7 --style raw --v 6.1`
  },
  tech: {
    id: 'back-tech',
    prompt: `Jackson Pollock style abstract expressionist painting, chaotic drip painting technique, hot pink magenta and red paint drips with electric accents, technological chaos energy, neon feeling, action painting aesthetic, high energy --ar 5:7 --style raw --v 6.1`
  }
};

function getBgColor(type) {
  const colors = {
    domain: 'on teal cyan colored background',
    wellbeing: 'on golden yellow colored background',
    tech: 'on hot pink colored background',
    modifier: 'on purple violet colored background'
  };
  return colors[type] || '';
}

async function generateImage(card) {
  console.log(`\n🎨 Generating: ${card.name} (${card.id})`);
  console.log(`   Type: ${card.type}`);

  const requestBody = {
    model: 'midjourney',
    prompt: card.prompt,
    parameters: {
      aspect_ratio: '5:7',
      style: 'raw',
      version: '6.1'
    },
    reference_id: card.id,
    webhook_url: null
  };

  console.log(`\n   Prompt preview: ${card.prompt.slice(0, 100)}...`);

  if (!MULEROUTER_URL || MULEROUTER_URL === 'http://localhost:3001') {
    console.log('\n   ⚠️  MULEROUTER_URL not configured');
    console.log('   📋 Full prompt saved to prompts output');
    return { id: card.id, status: 'dry-run', prompt: card.prompt };
  }

  try {
    const response = await fetch(`${MULEROUTER_URL}/v1/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MULEROUTER_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`   ✅ Job submitted: ${result.job_id || result.id || 'pending'}`);

    return {
      id: card.id,
      name: card.name,
      type: card.type,
      status: 'submitted',
      job_id: result.job_id || result.id,
      result
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      id: card.id,
      name: card.name,
      status: 'error',
      error: error.message,
      prompt: card.prompt
    };
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          FUTURES DECK — Haring/Pollock Card Generator        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\nMulerouter URL: ${MULEROUTER_URL}`);
  console.log(`API Key: ${MULEROUTER_KEY ? '***' + MULEROUTER_KEY.slice(-4) : '(not set)'}`);
  console.log(`\nGenerating ${CARDS_TO_GENERATE.length} card fronts + ${Object.keys(CARD_BACKS).length} card backs\n`);

  const results = [];

  // Generate card fronts
  console.log('━━━ CARD FRONTS (Keith Haring Style) ━━━');
  for (const card of CARDS_TO_GENERATE) {
    const result = await generateImage(card);
    results.push(result);
  }

  // Generate card backs
  console.log('\n━━━ CARD BACKS (Jackson Pollock Style) ━━━');
  for (const [type, back] of Object.entries(CARD_BACKS)) {
    const result = await generateImage({ ...back, name: `${type} back`, type });
    results.push(result);
  }

  // Save results
  const outputPath = path.join(__dirname, '..', 'assets', 'generation-results.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    generated_at: new Date().toISOString(),
    mulerouter_url: MULEROUTER_URL,
    cards: results
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log('\n━━━ SUMMARY ━━━');
  console.log(`Total cards: ${results.length}`);
  console.log(`Submitted: ${results.filter(r => r.status === 'submitted').length}`);
  console.log(`Dry-run: ${results.filter(r => r.status === 'dry-run').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
  console.log(`\nResults saved to: ${outputPath}`);

  // Also save full prompts for manual use
  const promptsPath = path.join(__dirname, '..', 'assets', 'midjourney-prompts.json');
  const allPrompts = {
    card_fronts: CARDS_TO_GENERATE.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      prompt: c.prompt
    })),
    card_backs: Object.entries(CARD_BACKS).map(([type, back]) => ({
      id: back.id,
      type,
      prompt: back.prompt
    }))
  };
  fs.writeFileSync(promptsPath, JSON.stringify(allPrompts, null, 2));
  console.log(`Prompts saved to: ${promptsPath}`);

  console.log('\n📋 To use prompts manually in Midjourney:');
  console.log('   Copy prompts from assets/midjourney-prompts.json');
  console.log('   Paste into Midjourney Discord with /imagine');
}

main().catch(console.error);
