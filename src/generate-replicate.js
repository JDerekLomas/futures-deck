#!/usr/bin/env node
/**
 * Generate 5 Futures Deck cards using Replicate (Flux 1.1 Pro)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

const TAROT_STYLE = `intricate tarot card illustration, dense esoteric symbology, mystical occult imagery, ornate decorative border, rich layered composition, sacred geometry patterns, alchemical symbols, celestial elements, gold leaf accents, deep jewel tones, Rider-Waite meets art nouveau style, detailed linework, arcane mysticism, hermetic symbolism, high detail, symmetrical composition`;

// 5 diverse cards from different categories
const CARDS = [
  {
    id: 'arc-01',
    name: 'Growth',
    type: 'arc',
    prompt: `${TAROT_STYLE}, the ARC of GROWTH and EXPANSION, central imagery of golden tree with infinite branches reaching skyward, roots forming foundation spreading outward, exponential spiral patterns, ascending staircase to the heavens, abundance symbols overflowing cornucopia, stock charts rising as sacred mountains, cities of light expanding on the horizon, the sun at zenith radiating prosperity, coins and seeds multiplying, the world card imagery of completion and achievement, emerald green and gold palette, ornate celtic knotwork border with growth motifs`
  },
  {
    id: 'terrain-05',
    name: 'The Ocean',
    type: 'terrain',
    prompt: `${TAROT_STYLE}, the TERRAIN of THE OCEAN, central figure of sea goddess emerging from waves, trident held high, surrounded by mythic sea creatures and leviathans, floating cities on the horizon, ships traversing ancient routes, underwater kingdoms with bioluminescent coral, pearls and treasures of the deep, the moon governing tides, neptune's realm of mystery, whales as guardians of wisdom, kelp forests as underwater cathedrals, the abyssal unknown below, waves forming sacred geometry, deep blue and silver aquatic palette, shell and wave border motifs`
  },
  {
    id: 'object-03',
    name: 'Ritual',
    type: 'object',
    prompt: `${TAROT_STYLE}, the OBJECT of RITUAL and CEREMONY, central altar with sacred flames burning eternal, hooded figures in procession, ceremonial chalice and athame, incense smoke forming sacred symbols, candles arranged in mystical patterns, book of shadows open with ancient text, seasonal wheel of the year, threshold crossings marked by archways, hands raised in blessing, the circle cast and protected, ancestors watching from the veil, transformative rites of passage, purple and gold ceremonial palette, ritual symbol border with phases of moon`
  },
  {
    id: 'well-07',
    name: 'Impact',
    type: 'wellbeing',
    prompt: `${TAROT_STYLE}, the WELLBEING dimension of IMPACT AND MAKING A DIFFERENCE, central figure standing tall with radiating golden ripples spreading outward like stone dropped in still water, hands gently planting seeds that grow into mighty oak trees, single candle flame lighting many other candles in spiral pattern, footprints leading forward creating paths for others to follow, tower of books representing knowledge shared, warm welcoming orange and gold palette representing positive influence, ornate border with concentric ripple patterns and oak leaf motifs, inspirational and uplifting mood`
  },
  {
    id: 'time-05',
    name: '5 Years',
    type: 'timeframe',
    prompt: `${TAROT_STYLE}, the TIMEFRAME of FIVE YEARS hence, central hourglass with sand forming future landscapes, the number V in roman numerals glowing with power, calendar pages scattered showing seasons passed, child grown to youth representing transformation, seeds now bearing fruit, plans manifested into reality, the chariot of progress moving forward, map showing journey from here to there, crystallizing visions becoming solid, the star card hope becoming achievement, medium-term fate revealed in cards, blue and silver temporal palette, clock and calendar border with zodiac symbols`
  }
];

async function generateWithReplicate(card) {
  console.log(`\n🎴 Generating: ${card.name} (${card.id})`);

  try {
    // Create prediction using Flux 1.1 Pro
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Flux 1.1 Pro model
        version: 'black-forest-labs/flux-1.1-pro',
        input: {
          prompt: card.prompt,
          aspect_ratio: '2:3',
          output_format: 'png',
          output_quality: 90,
          safety_tolerance: 2,
          prompt_upsampling: true
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`   ❌ Error ${response.status}: ${JSON.stringify(data)}`);
      return { ...card, status: 'error', error: data };
    }

    console.log(`   ⏳ Prediction started: ${data.id}`);
    return { ...card, status: 'pending', predictionId: data.id, urls: data.urls };

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

async function waitForPrediction(predictionId, card, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkPrediction(predictionId);

    if (result.status === 'succeeded' && result.output) {
      const outputDir = path.join(__dirname, '..', 'assets', 'tarot-replicate');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Output can be a string or array
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      const filePath = path.join(outputDir, `${card.id}.png`);
      await downloadImage(imageUrl, filePath);
      console.log(`   💾 ${card.name}: saved to ${filePath}`);
      return { status: 'downloaded', path: filePath };
    }

    if (result.status === 'failed') {
      console.log(`   ❌ ${card.name}: failed - ${result.error}`);
      return { status: 'failed', error: result.error };
    }

    if (result.status === 'canceled') {
      console.log(`   ⚠️ ${card.name}: canceled`);
      return { status: 'canceled' };
    }

    // Still processing
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 2000));
  }

  return { status: 'timeout' };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       FUTURES DECK — Replicate Generation                  ║');
  console.log('║       5 Cards • Flux 1.1 Pro • Tarot Style                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Token: ${REPLICATE_API_TOKEN.slice(0, 8)}...${REPLICATE_API_TOKEN.slice(-4)}`);

  // Check which cards already exist
  const outputDir = path.join(__dirname, '..', 'assets', 'tarot-replicate');
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

  console.log(`\n📤 Generating ${cardsToGenerate.length} cards (with rate limit handling)...\n`);

  const results = [];

  // Submit and wait for each card sequentially to avoid rate limits
  for (const card of cardsToGenerate) {
    const result = await generateWithReplicate(card);
    results.push(result);

    // If successful, wait for completion before starting next
    if (result.status === 'pending') {
      process.stdout.write(`   Waiting for ${card.name}: `);
      const finalResult = await waitForPrediction(result.predictionId, card);
      result.finalStatus = finalResult.status;
      result.finalPath = finalResult.path;
      console.log('');
    }

    // Wait 12 seconds between requests to respect rate limit (6 per minute)
    if (cardsToGenerate.indexOf(card) < cardsToGenerate.length - 1) {
      console.log('   ⏱️  Waiting 12s for rate limit...');
      await new Promise(r => setTimeout(r, 12000));
    }
  }

  // Wait for all pending predictions
  const pending = results.filter(r => r.status === 'pending');
  if (pending.length > 0) {
    console.log(`\n\n⏳ Waiting for ${pending.length} images to generate...`);
    console.log('   (This may take 30-60 seconds per image)\n');

    for (const p of pending) {
      process.stdout.write(`   ${p.name}: `);
      const finalResult = await waitForPrediction(p.predictionId, p);
      p.finalStatus = finalResult.status;
      p.finalPath = finalResult.path;
    }
  }

  // Save results
  const outputPath = path.join(__dirname, '..', 'assets', 'replicate-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    model: 'flux-1.1-pro',
    results: results.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      status: r.finalStatus || r.status,
      path: r.finalPath,
      predictionId: r.predictionId
    }))
  }, null, 2));

  // Summary
  const downloaded = results.filter(r => r.finalStatus === 'downloaded' || r.finalPath);
  console.log('\n\n━━━ SUMMARY ━━━');
  console.log(`✅ Downloaded: ${downloaded.length}/${CARDS.length}`);
  console.log(`📁 Output: assets/tarot-replicate/`);
  console.log(`📋 Results: ${outputPath}`);

  if (downloaded.length > 0) {
    console.log('\n✨ Done! New tarot cards generated.');
  }
}

main().catch(console.error);
