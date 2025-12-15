#!/usr/bin/env node
/**
 * Generate cards via Mulerouter Midjourney API
 */

const MULEROUTER_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';

// Common mulerouter endpoints to try
const ENDPOINTS = [
  'https://api.mulerouter.com/v1',
  'https://mulerouter.ai/v1',
  'https://api.mule.router/v1'
];

const HARING_STYLE = `Keith Haring style illustration, bold black outlines, flat bright colors, simple iconic figures, radiant energy lines, figures in dynamic poses, pop art aesthetic, solid color fills, playful and energetic, multiple figures interacting, thick black stroke weight, 1980s street art style`;

const CARDS = [
  {
    id: 'domain-01',
    name: 'Finance & Banking',
    prompt: `${HARING_STYLE}, teal cyan background, figures exchanging money and coins, dancing figures with dollar signs, figures climbing bar charts, piggy bank symbols, figures shaking hands over deals, figures juggling gold coins, bright green gold and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'domain-02',
    name: 'Healthcare & Pharma',
    prompt: `${HARING_STYLE}, teal cyan background, figures with glowing red hearts in chests, dancing figures forming medical cross shape, figures carrying others on stretchers helping, pill and capsule shapes, figures with stethoscopes, healing energy radiating from hands, DNA helix made of linked dancing figures, bright red white pink and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-01',
    name: 'Autonomy / Agency',
    prompt: `${HARING_STYLE}, golden yellow background, single figure breaking free from chains, figure choosing between multiple branching paths, figure with compass directing own destiny, figures each dancing independently freely, figure pushing away controlling hands, radiant self-determination energy lines, figure standing alone confidently with arms raised, bold red orange and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'well-06',
    name: 'Equity / Fairness',
    prompt: `${HARING_STYLE}, golden yellow background, figures of different sizes all standing at equal height on platforms, perfectly balanced scales with figures on each side, figures sharing resources passing items evenly, figures lifting smaller figures up to same level, circle of diverse figures all with equal radiant lines, yellow orange and black colors --ar 5:7 --style raw --v 6.1`
  },
  {
    id: 'tech-01',
    name: 'Fault-Tolerant Quantum Computing',
    prompt: `${HARING_STYLE}, hot pink background, figures dancing inside computer and circuit shapes, figures catching and fixing falling pieces together, interlocking stable figure structures like building blocks, figures juggling glowing orbs without dropping any, fortress made of reliable connected figures, figures with checkmarks showing success, electric blue white and black colors --ar 5:7 --style raw --v 6.1`
  }
];

async function tryEndpoint(baseUrl, card) {
  const endpoints = [
    `${baseUrl}/images/generations`,
    `${baseUrl}/generate`,
    `${baseUrl}/midjourney/imagine`
  ];

  for (const url of endpoints) {
    try {
      console.log(`  Trying: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MULEROUTER_KEY}`,
          'x-api-key': MULEROUTER_KEY
        },
        body: JSON.stringify({
          model: 'midjourney',
          prompt: card.prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      const text = await response.text();
      console.log(`  Status: ${response.status}`);

      if (response.ok) {
        return { url, response: JSON.parse(text) };
      } else {
        console.log(`  Response: ${text.slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
  return null;
}

async function discoverEndpoint() {
  console.log('Discovering mulerouter endpoint...\n');

  for (const base of ENDPOINTS) {
    const result = await tryEndpoint(base, CARDS[0]);
    if (result) {
      return result.url.replace('/images/generations', '').replace('/generate', '').replace('/midjourney/imagine', '');
    }
  }

  // Try OpenAI-compatible format
  console.log('\nTrying OpenAI-compatible endpoints...');
  const openaiStyle = [
    'https://api.mulerouter.com',
    'https://mulerouter.openai.azure.com'
  ];

  for (const base of openaiStyle) {
    try {
      const response = await fetch(`${base}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${MULEROUTER_KEY}`
        }
      });
      console.log(`${base}/v1/models: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Available models:', JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.log(`${base}: ${e.message}`);
    }
  }

  return null;
}

async function main() {
  console.log('FUTURES DECK — Mulerouter Image Generation\n');
  console.log('API Key:', MULEROUTER_KEY.slice(0, 10) + '...' + MULEROUTER_KEY.slice(-4));
  console.log('');

  await discoverEndpoint();
}

main();
