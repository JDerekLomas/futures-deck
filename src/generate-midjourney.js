#!/usr/bin/env node
/**
 * Generate Futures Deck cards via MuleRouter Midjourney API
 * Endpoint: POST https://api.mulerouter.ai/vendors/midjourney/v1/tob/diffusion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';
const BASE_URL = 'https://api.mulerouter.ai';
const ENDPOINT = '/vendors/midjourney/v1/tob/diffusion';

const HARING_STYLE = `Keith Haring style illustration, bold black outlines, flat bright colors, simple iconic figures, radiant energy lines, figures in dynamic poses, pop art aesthetic, solid color fills, playful and energetic, multiple figures interacting, thick black stroke weight, 1980s street art style`;

const CARDS = [
  {
    id: 'domain-01',
    name: 'Finance & Banking',
    type: 'domain',
    prompt: `${HARING_STYLE}, teal cyan background, figures exchanging money and coins, dancing figures with dollar signs, figures climbing bar charts, piggy bank symbols, figures shaking hands over deals, figures juggling gold coins, bright green gold and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'domain-02',
    name: 'Healthcare & Pharma',
    type: 'domain',
    prompt: `${HARING_STYLE}, teal cyan background, figures with glowing red hearts in chests, dancing figures forming medical cross shape, figures carrying others on stretchers helping, pill and capsule shapes, figures with stethoscopes, healing energy radiating from hands, DNA helix made of linked dancing figures, bright red white pink and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-01',
    name: 'Autonomy / Agency',
    type: 'wellbeing',
    prompt: `${HARING_STYLE}, golden yellow background, single figure breaking free from chains, figure choosing between multiple branching paths, figure with compass directing own destiny, figures each dancing independently freely, figure pushing away controlling hands, radiant self-determination energy lines, figure standing alone confidently with arms raised, bold red orange and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-06',
    name: 'Equity / Fairness',
    type: 'wellbeing',
    prompt: `${HARING_STYLE}, golden yellow background, figures of different sizes all standing at equal height on platforms, perfectly balanced scales with figures on each side, figures sharing resources passing items evenly, figures lifting smaller figures up to same level, circle of diverse figures all with equal radiant lines, yellow orange and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'tech-01',
    name: 'Fault-Tolerant Quantum Computing',
    type: 'tech',
    prompt: `${HARING_STYLE}, hot pink magenta background, figures dancing inside computer and circuit shapes, figures catching and fixing falling pieces together, interlocking stable figure structures like building blocks, figures juggling glowing orbs without dropping any, fortress made of reliable connected figures, figures with checkmarks showing success, electric blue white and black colors --ar 5:7 --style raw --v 6.1`
  }
];

async function generateImage(card) {
  console.log(`\n🎨 Generating: ${card.name} (${card.id})`);
  console.log(`   Prompt: ${card.prompt.slice(0, 80)}...`);

  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: card.prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`   ❌ Error ${response.status}: ${JSON.stringify(data)}`);
      return { ...card, status: 'error', error: data };
    }

    console.log(`   ✅ Task submitted!`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));

    return { ...card, status: 'submitted', response: data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ...card, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     FUTURES DECK — MuleRouter Midjourney Generation       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nEndpoint: ${BASE_URL}${ENDPOINT}`);
  console.log(`API Key: ${API_KEY.slice(0, 12)}...${API_KEY.slice(-4)}`);
  console.log(`Cards to generate: ${CARDS.length}`);

  const results = [];

  for (const card of CARDS) {
    const result = await generateImage(card);
    results.push(result);

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save results
  const outputDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'midjourney-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    endpoint: `${BASE_URL}${ENDPOINT}`,
    results
  }, null, 2));

  console.log('\n━━━ SUMMARY ━━━');
  console.log(`Submitted: ${results.filter(r => r.status === 'submitted').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
  console.log(`\nResults saved to: ${outputPath}`);
}

main();
