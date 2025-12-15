/**
 * FUTURES DECK — Card Generator
 *
 * Generates card images with Dutch Design aesthetics
 * Compatible with mulerouter or any image generation router
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load card data
const cardData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards.json'), 'utf8'));

/**
 * Design System Constants
 */
const DESIGN = {
  colors: {
    mondrian: {
      red: '#D32F2F',
      blue: '#1565C0',
      yellow: '#FFC107',
      black: '#1A1A1A',
      white: '#FAFAFA'
    },
    domain: '#1565C0',
    wellbeing: '#FFC107',
    tech: '#D32F2F',
    positive: '#2E7D32',
    negative: '#C62828'
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
    mono: 'JetBrains Mono'
  },
  card: {
    width: 750, // 2.5" at 300dpi
    height: 1050, // 3.5" at 300dpi
    bleed: 36 // 0.12" bleed
  }
};

/**
 * Dutch Design Style Prompt Generator
 * Creates prompts for image generation in De Stijl / Dutch modernist style
 */
function generateDutchDesignPrompt(card, type) {
  const baseStyle = `
    Dutch design aesthetic, De Stijl influence,
    Piet Mondrian style geometric blocks,
    bold primary colors (red #D32F2F, blue #1565C0, yellow #FFC107),
    clean grid-based composition,
    grotesque sans-serif typography,
    asymmetric balance,
    functional minimalism,
    strong black borders,
    high contrast,
    print-ready card design,
    no gradients except geometric fills,
    sharp edges and corners
  `.replace(/\s+/g, ' ').trim();

  const prompts = {
    domain: `
      ${baseStyle},
      rectangular color block accent in blue #1565C0,
      icon representing ${card.name}: ${card.examples?.join(', ') || card.description || ''},
      abstract geometric interpretation,
      professional and institutional feel,
      label "DOMAIN" in uppercase tracking
    `,

    wellbeing: `
      ${baseStyle},
      warm yellow #FFC107 as accent color,
      human-centered iconography for "${card.name || ''}" / "${card.subtitle || ''}",
      abstract representation of ${card.description || ''},
      psychological diagram aesthetic,
      label "WELLBEING" in uppercase tracking
    `,

    tech: `
      ${baseStyle},
      bold red #D32F2F as primary accent,
      quantum computing visualization,
      circuit board patterns mixed with De Stijl geometry,
      futuristic but grounded in modernist design,
      year "${card.baseline_year || ''}" prominently displayed in monospace,
      technology: ${card.name || ''},
      label "TECHNOLOGY" in uppercase tracking
    `,

    modifier: `
      ${baseStyle},
      timeline visualization,
      number "${(card.value !== undefined && card.value > 0) ? '+' : ''}${card.value ?? ''}" as hero element,
      ${(card.value !== undefined && card.value < 0) ? 'green #2E7D32 for acceleration' : 'orange/red for delay'},
      abstract clock or calendar motif,
      "${card.label || ''}" as subtitle,
      label "MODIFIER" in uppercase tracking
    `,

    wildcard: `
      ${baseStyle},
      gradient from red to blue (rare exception to no-gradient rule),
      chaotic but composed arrangement,
      disruption symbolism,
      "${card.name}" as dramatic title,
      lightning bolt or fracture patterns,
      label "WILDCARD" in uppercase tracking
    `
  };

  return prompts[type]?.replace(/\s+/g, ' ').trim() || baseStyle;
}

/**
 * SVG Card Template Generator
 * Creates print-ready SVG cards
 */
function generateSVGCard(card, type) {
  const { width, height, bleed } = DESIGN.card;
  const w = width + (bleed * 2);
  const h = height + (bleed * 2);

  const colors = {
    domain: DESIGN.colors.domain,
    wellbeing: DESIGN.colors.wellbeing,
    tech: DESIGN.colors.tech,
    modifier: card.value < 0 ? DESIGN.colors.positive : DESIGN.colors.negative,
    wildcard: DESIGN.colors.mondrian.red
  };

  const accentColor = colors[type];
  const textColor = type === 'wellbeing' ? DESIGN.colors.mondrian.black : DESIGN.colors.mondrian.white;

  // Get card-specific content
  const title = card.name || card.short_name || card.label;
  const subtitle = card.subtitle || card.description?.slice(0, 60) + '...' || '';
  const number = type === 'modifier' ? `${card.value > 0 ? '+' : ''}${card.value}` : '';
  const year = card.baseline_year || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap');
      .display { font-family: 'Space Grotesk', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
    </style>
    <!-- Grid pattern for subtle texture -->
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Bleed area background -->
  <rect x="0" y="0" width="${w}" height="${h}" fill="${DESIGN.colors.mondrian.white}"/>

  <!-- Card border -->
  <rect x="${bleed}" y="${bleed}" width="${width}" height="${height}"
        fill="${DESIGN.colors.mondrian.white}"
        stroke="${DESIGN.colors.mondrian.black}"
        stroke-width="9" rx="24"/>

  <!-- Grid texture -->
  <rect x="${bleed}" y="${bleed}" width="${width}" height="${height}" fill="url(#grid)" rx="24"/>

  <!-- Header bar -->
  <rect x="${bleed + 4.5}" y="${bleed + 4.5}" width="${width - 9}" height="120"
        fill="${accentColor}" rx="20 20 0 0"/>

  <!-- Type label -->
  <text x="${bleed + 48}" y="${bleed + 72}"
        class="display" fill="${textColor}"
        font-size="30" font-weight="700" letter-spacing="4">
    ${type.toUpperCase()}
  </text>

  <!-- Card number -->
  <text x="${bleed + width - 48}" y="${bleed + 72}"
        class="mono" fill="${textColor}"
        font-size="27" text-anchor="end" opacity="0.8">
    ${card.id?.split('-')[1] || '00'}
  </text>

  <!-- Geometric accent blocks (De Stijl) -->
  <rect x="${bleed + width - 180}" y="${bleed + 4.5}" width="175.5" height="180"
        fill="${accentColor}" opacity="0.15" rx="0 20 0 0"/>
  <rect x="${bleed + 4.5}" y="${bleed + height - 240}" width="120" height="235.5"
        fill="${accentColor}" opacity="0.1" rx="0 0 0 20"/>

  <!-- Main content area -->
  ${type === 'modifier' ? `
    <!-- Large number for modifier cards -->
    <text x="${bleed + width/2}" y="${bleed + 520}"
          class="display" fill="${accentColor}"
          font-size="216" font-weight="700" text-anchor="middle">
      ${number}
    </text>
    <text x="${bleed + width/2}" y="${bleed + 620}"
          class="display" fill="${DESIGN.colors.mondrian.black}"
          font-size="48" font-weight="700" text-anchor="middle">
      ${title}
    </text>
  ` : type === 'tech' ? `
    <!-- Technology card with year -->
    <text x="${bleed + width/2}" y="${bleed + 420}"
          class="display" fill="${DESIGN.colors.mondrian.black}"
          font-size="54" font-weight="700" text-anchor="middle">
      ${title}
    </text>
    <text x="${bleed + width/2}" y="${bleed + 560}"
          class="mono" fill="${accentColor}"
          font-size="108" font-weight="700" text-anchor="middle">
      ${year}
    </text>
  ` : `
    <!-- Standard title layout -->
    <text x="${bleed + width/2}" y="${bleed + 450}"
          class="display" fill="${DESIGN.colors.mondrian.black}"
          font-size="60" font-weight="700" text-anchor="middle">
      ${title}
    </text>
    ${subtitle ? `
    <text x="${bleed + width/2}" y="${bleed + 520}"
          class="display" fill="${DESIGN.colors.mondrian.black}"
          font-size="36" font-weight="500" text-anchor="middle" opacity="0.6">
      ${card.subtitle || ''}
    </text>
    ` : ''}
  `}

  <!-- Footer line -->
  <line x1="${bleed + 48}" y1="${bleed + height - 144}"
        x2="${bleed + width - 48}" y2="${bleed + height - 144}"
        stroke="${DESIGN.colors.mondrian.black}" stroke-width="3"/>

  <!-- Footer text -->
  <text x="${bleed + 48}" y="${bleed + height - 84}"
        class="display" fill="#999"
        font-size="24" font-weight="700" letter-spacing="3">
    ${type === 'domain' ? 'WHERE DOES IT HIT?' :
      type === 'wellbeing' ? 'HUMAN DIMENSION' :
      type === 'tech' ? 'BASELINE TIMELINE' :
      type === 'modifier' ? 'YEARS' : 'DISRUPTION'}
  </text>
</svg>`;
}

/**
 * Generate all cards as SVG files
 */
function generateAllSVGs(outputDir = '../cards') {
  const fullPath = path.resolve(__dirname, outputDir);

  // Create output directories
  ['domain', 'wellbeing', 'tech', 'modifier', 'wildcard'].forEach(type => {
    const dir = path.join(fullPath, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate domain cards
  cardData.domains.forEach(card => {
    const svg = generateSVGCard(card, 'domain');
    const filename = `${card.id}.svg`;
    fs.writeFileSync(path.join(fullPath, 'domain', filename), svg);
    console.log(`Generated: domain/${filename}`);
  });

  // Generate wellbeing cards
  cardData.wellbeing.forEach(card => {
    const svg = generateSVGCard(card, 'wellbeing');
    const filename = `${card.id}.svg`;
    fs.writeFileSync(path.join(fullPath, 'wellbeing', filename), svg);
    console.log(`Generated: wellbeing/${filename}`);
  });

  // Generate tech cards
  cardData.technology.forEach(card => {
    const svg = generateSVGCard(card, 'tech');
    const filename = `${card.id}.svg`;
    fs.writeFileSync(path.join(fullPath, 'tech', filename), svg);
    console.log(`Generated: tech/${filename}`);
  });

  // Generate modifier cards
  cardData.modifiers.forEach(card => {
    const svg = generateSVGCard(card, 'modifier');
    const filename = `${card.id}.svg`;
    fs.writeFileSync(path.join(fullPath, 'modifier', filename), svg);
    console.log(`Generated: modifier/${filename}`);
  });

  // Generate wildcard cards
  cardData.wildcards.forEach(card => {
    const svg = generateSVGCard(card, 'wildcard');
    const filename = `${card.id}.svg`;
    fs.writeFileSync(path.join(fullPath, 'wildcard', filename), svg);
    console.log(`Generated: wildcard/${filename}`);
  });

  console.log(`\nGenerated ${cardData.domains.length + cardData.wellbeing.length +
    cardData.technology.length + cardData.modifiers.length + cardData.wildcards.length} cards`);
}

/**
 * Export prompts for mulerouter / image generation
 */
function exportImagePrompts(outputFile = '../assets/prompts.json') {
  const prompts = {
    meta: {
      style: 'Dutch Design / De Stijl',
      aspectRatio: '5:7',
      resolution: '750x1050',
      format: 'PNG or SVG'
    },
    cards: {}
  };

  // Domain prompts
  prompts.cards.domain = cardData.domains.map(card => ({
    id: card.id,
    name: card.name,
    prompt: generateDutchDesignPrompt(card, 'domain'),
    negativePrompt: 'photorealistic, 3D render, gradient backgrounds, rounded organic shapes, photography, realistic textures'
  }));

  // Wellbeing prompts
  prompts.cards.wellbeing = cardData.wellbeing.map(card => ({
    id: card.id,
    name: card.name,
    prompt: generateDutchDesignPrompt(card, 'wellbeing'),
    negativePrompt: 'photorealistic, 3D render, gradient backgrounds, rounded organic shapes, photography, realistic textures'
  }));

  // Tech prompts
  prompts.cards.tech = cardData.technology.map(card => ({
    id: card.id,
    name: card.name,
    prompt: generateDutchDesignPrompt(card, 'tech'),
    negativePrompt: 'photorealistic, 3D render, soft gradients, organic shapes, photography'
  }));

  // Modifier prompts
  prompts.cards.modifier = cardData.modifiers.map(card => ({
    id: card.id,
    label: card.label,
    prompt: generateDutchDesignPrompt(card, 'modifier'),
    negativePrompt: 'photorealistic, complex illustrations, organic shapes'
  }));

  // Wildcard prompts
  prompts.cards.wildcard = cardData.wildcards.map(card => ({
    id: card.id,
    name: card.name,
    prompt: generateDutchDesignPrompt(card, 'wildcard'),
    negativePrompt: 'photorealistic, calm, orderly, simple'
  }));

  fs.writeFileSync(path.resolve(__dirname, outputFile), JSON.stringify(prompts, null, 2));
  console.log(`Exported prompts to ${outputFile}`);

  return prompts;
}

/**
 * Mulerouter Integration
 * Adapter for routing image generation requests
 */
class MulerouterAdapter {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.MULEROUTER_URL;
    this.apiKey = config.apiKey || process.env.MULEROUTER_API_KEY;
    this.defaultModel = config.model || 'flux-schnell'; // or dall-e-3, midjourney, etc.
  }

  /**
   * Generate a single card image via mulerouter
   */
  async generateCard(card, type, options = {}) {
    const prompt = generateDutchDesignPrompt(card, type);

    const request = {
      model: options.model || this.defaultModel,
      prompt: prompt,
      negative_prompt: 'photorealistic, 3D render, gradient backgrounds, photography',
      width: DESIGN.card.width,
      height: DESIGN.card.height,
      steps: options.steps || 30,
      cfg_scale: options.cfgScale || 7.5,
      seed: options.seed || -1
    };

    if (!this.baseUrl) {
      console.log('Mulerouter not configured. Request would be:');
      console.log(JSON.stringify(request, null, 2));
      return { svg: generateSVGCard(card, type) };
    }

    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(request)
      });

      return await response.json();
    } catch (error) {
      console.error(`Error generating ${card.id}:`, error);
      // Fallback to SVG
      return { svg: generateSVGCard(card, type) };
    }
  }

  /**
   * Batch generate all cards
   */
  async generateAllCards(options = {}) {
    const results = { domain: [], wellbeing: [], tech: [], modifier: [], wildcard: [] };

    for (const card of cardData.domains) {
      results.domain.push(await this.generateCard(card, 'domain', options));
    }

    for (const card of cardData.wellbeing) {
      results.wellbeing.push(await this.generateCard(card, 'wellbeing', options));
    }

    for (const card of cardData.technology) {
      results.tech.push(await this.generateCard(card, 'tech', options));
    }

    for (const card of cardData.modifiers) {
      results.modifier.push(await this.generateCard(card, 'modifier', options));
    }

    for (const card of cardData.wildcards) {
      results.wildcard.push(await this.generateCard(card, 'wildcard', options));
    }

    return results;
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'svg':
    generateAllSVGs(args[1]);
    break;
  case 'prompts':
    exportImagePrompts(args[1]);
    break;
  case 'generate':
    const router = new MulerouterAdapter();
    router.generateAllCards().then(results => {
      console.log('Generation complete:', results);
    });
    break;
  default:
    console.log(`
FUTURES DECK Card Generator

Commands:
  node generator.js svg [output-dir]     Generate SVG cards
  node generator.js prompts [output-file] Export image generation prompts
  node generator.js generate              Generate via mulerouter (requires config)

Environment variables:
  MULEROUTER_URL      Base URL for mulerouter API
  MULEROUTER_API_KEY  API key for authentication
    `);
}

export { generateSVGCard, generateDutchDesignPrompt, MulerouterAdapter, exportImagePrompts, generateAllSVGs };
