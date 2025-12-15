#!/usr/bin/env node
/**
 * Generate Futures Deck cards — Tarot Style with Dense Symbology
 * MuleRouter Midjourney API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';
const BASE_URL = 'https://api.mulerouter.ai';
const ENDPOINT = '/vendors/midjourney/v1/tob/diffusion';

const TAROT_STYLE = `intricate tarot card illustration, dense esoteric symbology, mystical occult imagery, ornate decorative border, rich layered composition, sacred geometry patterns, alchemical symbols, celestial elements, gold leaf accents, deep jewel tones, Rider-Waite meets art nouveau style, detailed linework, arcane mysticism, hermetic symbolism, high detail, symmetrical composition`;

const CARDS = [
  {
    id: 'domain-01',
    name: 'Finance & Banking',
    type: 'domain',
    prompt: `${TAROT_STYLE}, the domain of FINANCE AND COMMERCE, central figure of robed merchant holding scales and golden coins, background filled with: flowing rivers of gold coins, the ouroboros eating its tail representing cycles of wealth, alchemical symbols for gold and silver, ascending and descending staircases of prosperity, the wheel of fortune turning, scattered tarot coins suit symbols, vaults and keys, the caduceus of Mercury god of commerce, astrological symbol for Jupiter abundance, intricate celtic knotwork border in gold and deep green, moonlit marble columns, mystical atmosphere --ar 5:7 --style raw --s 750 --v 6.1`
  },
  {
    id: 'domain-02',
    name: 'Healthcare & Pharma',
    type: 'domain',
    prompt: `${TAROT_STYLE}, the domain of HEALING AND MEDICINE, central caduceus staff with twin serpents glowing with life force, surrounded by: the sacred heart radiating light, anatomical drawings in da Vinci style, the Rod of Asclepius, healing herbs and botanical illustrations, the philosopher's stone of transformation, DNA double helix as sacred spiral, the vessel of Hygeia, eye of providence watching over, crystals and elixirs in ornate bottles, phases of the moon governing health, hands of the healer emanating energy, deep crimson and healing green palette, elaborate art nouveau floral border --ar 5:7 --style raw --s 750 --v 6.1`
  },
  {
    id: 'well-01',
    name: 'Autonomy / Agency',
    type: 'wellbeing',
    prompt: `${TAROT_STYLE}, the virtue of AUTONOMY AND FREE WILL, solitary figure standing at crossroads holding lantern of inner wisdom, surrounded by: broken chains falling away, the chariot of self-determination, compass rose pointing all directions, keys to locked doors, the magician's tools of self-mastery, eagle in flight representing freedom, the tower card lightning bolt of liberation, personal sigil glowing on forehead, labyrinth with figure finding own path, astrological symbols for Uranus independence, burning phoenix of self-reinvention, deep purple and gold autonomy palette, geometric border of interlocking choices --ar 5:7 --style raw --s 750 --v 6.1`
  },
  {
    id: 'well-06',
    name: 'Equity / Fairness',
    type: 'wellbeing',
    prompt: `${TAROT_STYLE}, the virtue of EQUITY AND JUSTICE, central figure of blindfolded Justice holding perfectly balanced scales, surrounded by: the sword of truth cutting through deception, equal weights on each side, the two pillars of law Jachin and Boaz, Ma'at's feather of truth, the level and plumb line of masonry, hands of many skin tones reaching toward center, the equalizing sun shining on all equally, broken chains of oppression, the world card showing unified humanity, geometric patterns of fair distribution, the hexagram of balance, rich gold and royal blue justice palette, elaborate symmetrical border of scales --ar 5:7 --style raw --s 750 --v 6.1`
  },
  {
    id: 'tech-01',
    name: 'Fault-Tolerant Quantum Computing',
    type: 'tech',
    prompt: `${TAROT_STYLE}, the technology of QUANTUM COMPUTATION, central glowing quantum processor as sacred altar, surrounded by: superposition symbols showing states existing simultaneously, entangled particle pairs connected by golden threads, wave function collapse visualized as crystallizing patterns, qubits as spinning orbs of light, error correction codes as protective sigils, the infinity symbol of quantum coherence, Schrodinger's cat alive and dead simultaneously, probability clouds as mystical fog, circuit diagrams as sacred geometry, binary code transforming into golden spirals, the tree of knowledge with quantum fruit, deep electric blue and magenta quantum palette, border of interlocking circuit-mandala patterns, year 2029 in roman numerals --ar 5:7 --style raw --s 750 --v 6.1`
  }
];

async function generateImage(card) {
  console.log(`\n🔮 Generating: ${card.name} (${card.id})`);
  console.log(`   Style: Dense Tarot Symbology`);

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

    console.log(`   ✅ Task submitted: ${data.task_info?.id}`);
    return { ...card, status: 'submitted', response: data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ...card, status: 'error', error: error.message };
  }
}

async function checkAndDownload(taskId, cardId, cardName) {
  const endpoint = `/vendors/midjourney/v1/tob/diffusion/${taskId}`;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const data = await response.json();
    const status = data.task_info?.status;

    if (status === 'completed' && data.images?.[0]) {
      // Download the image
      const imageUrl = data.images[0];
      const imgResponse = await fetch(imageUrl);
      const buffer = await imgResponse.arrayBuffer();

      const outputDir = path.join(__dirname, '..', 'assets', 'tarot');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filePath = path.join(outputDir, `${cardId}.png`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`   💾 ${cardName}: ${filePath}`);
      return { status: 'downloaded', path: filePath };
    }

    return { status, taskId };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       FUTURES DECK — Tarot Style Generation               ║');
  console.log('║       Dense Symbology • Mystical • Esoteric               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = [];

  // Submit all jobs
  for (const card of CARDS) {
    const result = await generateImage(card);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save task IDs
  const outputPath = path.join(__dirname, '..', 'assets', 'tarot-tasks.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    style: 'Tarot / Dense Symbology',
    results
  }, null, 2));

  console.log('\n⏳ Waiting 45 seconds for Midjourney to process...\n');
  await new Promise(r => setTimeout(r, 45000));

  // Check and download
  console.log('📥 Downloading completed images:\n');
  for (const r of results) {
    if (r.response?.task_info?.id) {
      await checkAndDownload(r.response.task_info.id, r.id, r.name);
    }
  }

  console.log('\n✨ Done! Check assets/tarot/ for images');
}

main();
