#!/usr/bin/env node
/**
 * Generate 5 Futures Deck cards using Nano Banana Pro (Google) via Replicate
 * This model has better text rendering capabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Style prompt optimized for text rendering
const TAROT_STYLE = `intricate tarot card illustration, ornate decorative border, rich layered composition, sacred geometry patterns, celestial elements, gold leaf accents, deep jewel tones, art nouveau style, detailed linework, high detail, symmetrical composition`;

// 5 cards with explicit text rendering instructions
const CARDS = [
  {
    id: 'arc-01',
    name: 'Growth',
    type: 'arc',
    prompt: `${TAROT_STYLE}, tarot card with the word "GROWTH" written in elegant gold serif letters at the bottom, central imagery of golden tree with infinite branches reaching skyward, roots spreading outward, exponential spiral patterns, ascending staircase to heavens, abundance symbols, the sun radiating prosperity, emerald green and gold palette, ornate border with growth motifs`
  },
  {
    id: 'terrain-05',
    name: 'The Ocean',
    type: 'terrain',
    prompt: `${TAROT_STYLE}, tarot card with the word "THE OCEAN" written in silver serif letters at the bottom, central figure of sea goddess emerging from waves, trident held high, mythic sea creatures, floating cities on horizon, underwater kingdoms with bioluminescent coral, the moon governing tides, whales as guardians, deep blue and silver aquatic palette, shell and wave border`
  },
  {
    id: 'object-03',
    name: 'Ritual',
    type: 'object',
    prompt: `${TAROT_STYLE}, tarot card with the word "RITUAL" written in purple and gold serif letters at the bottom, central altar with sacred flames, hooded figures in procession, ceremonial chalice, incense smoke forming symbols, candles in mystical patterns, book of shadows, seasonal wheel of the year, purple and gold palette, ritual symbol border with moon phases`
  },
  {
    id: 'well-07',
    name: 'Impact',
    type: 'wellbeing',
    prompt: `${TAROT_STYLE}, tarot card with the word "IMPACT" written in warm orange serif letters at the bottom, central figure standing tall with radiating golden ripples spreading outward, hands planting seeds growing into oak trees, single candle lighting many others, footprints creating paths, tower of books representing knowledge shared, warm orange and gold palette, ripple pattern border`
  },
  {
    id: 'time-05',
    name: '5 Years',
    type: 'timeframe',
    prompt: `${TAROT_STYLE}, tarot card with "5 YEARS" written in blue and silver serif letters at the bottom, central hourglass with sand forming future landscapes, the roman numeral V glowing with power, calendar pages showing seasons passed, seeds bearing fruit, plans manifested into reality, map showing journey, blue and silver palette, clock and zodiac border`
  }
];

async function generateWithNanoBanana(card) {
  console.log(`\n🍌 Generating: ${card.name} (${card.id})`);

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'google/nano-banana-pro',
        input: {
          prompt: card.prompt,
          resolution: '2K',
          aspect_ratio: '2:3',
          output_format: 'png',
          safety_filter_level: 'block_only_high'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`   ❌ Error ${response.status}: ${JSON.stringify(data)}`);
      return { ...card, status: 'error', error: data };
    }

    console.log(`   ⏳ Prediction started: ${data.id}`);
    return { ...card, status: 'pending', predictionId: data.id };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ...card, status: 'error', error: error.message };
  }
}

async function checkPrediction(predictionId) {
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`
      }
    });
    return await response.json();
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function downloadImage(url, outputPath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

async function waitForPrediction(predictionId, card, maxAttempts = 120) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkPrediction(predictionId);

    if (result.status === 'succeeded' && result.output) {
      const outputDir = path.join(__dirname, '..', 'assets', 'tarot-nanobanana');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const imageUrl = result.output;
      const filePath = path.join(outputDir, `${card.id}.png`);
      await downloadImage(imageUrl, filePath);
      console.log(`\n   💾 ${card.name}: saved to ${filePath}`);
      return { status: 'downloaded', path: filePath };
    }

    if (result.status === 'failed') {
      console.log(`\n   ❌ ${card.name}: failed - ${result.error}`);
      return { status: 'failed', error: result.error };
    }

    if (result.status === 'canceled') {
      console.log(`\n   ⚠️ ${card.name}: canceled`);
      return { status: 'canceled' };
    }

    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 2000));
  }

  return { status: 'timeout' };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       FUTURES DECK — Nano Banana Pro Generation            ║');
  console.log('║       5 Cards • Google Model • Text-Optimized              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Token: ${REPLICATE_API_TOKEN.slice(0, 8)}...${REPLICATE_API_TOKEN.slice(-4)}`);

  // Check for existing cards
  const outputDir = path.join(__dirname, '..', 'assets', 'tarot-nanobanana');
  const cardsToGenerate = CARDS.filter(card => {
    const filePath = path.join(outputDir, `${card.id}.png`);
    if (fs.existsSync(filePath)) {
      console.log(`   ✓ ${card.name} already exists, skipping`);
      return false;
    }
    return true;
  });

  if (cardsToGenerate.length === 0) {
    console.log('\n✅ All cards already generated!');
    return;
  }

  console.log(`\n📤 Generating ${cardsToGenerate.length} cards...\n`);
  console.log('   Note: Nano Banana Pro takes ~60-120 seconds per image\n');

  const results = [];

  for (const card of cardsToGenerate) {
    const result = await generateWithNanoBanana(card);
    results.push(result);

    if (result.status === 'pending') {
      process.stdout.write(`   Waiting for ${card.name}: `);
      const finalResult = await waitForPrediction(result.predictionId, card);
      result.finalStatus = finalResult.status;
      result.finalPath = finalResult.path;
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save results
  const outputPath = path.join(__dirname, '..', 'assets', 'nanobanana-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    model: 'google/nano-banana-pro',
    results: results.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      status: r.finalStatus || r.status,
      path: r.finalPath
    }))
  }, null, 2));

  const downloaded = results.filter(r => r.finalStatus === 'downloaded' || r.finalPath);
  console.log('\n\n━━━ SUMMARY ━━━');
  console.log(`✅ Downloaded: ${downloaded.length}/${cardsToGenerate.length}`);
  console.log(`📁 Output: assets/tarot-nanobanana/`);
  console.log(`📋 Results: ${outputPath}`);
}

main().catch(console.error);
