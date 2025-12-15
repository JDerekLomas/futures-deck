/**
 * FUTURES DECK — Keith Haring / Jackson Pollock Edition
 * Midjourney prompts for mulerouter
 */

// Base style parameters for all Haring-style card fronts
const HARING_BASE = `
  Keith Haring style illustration,
  bold black outlines,
  flat bright colors,
  simple iconic figures,
  radiant energy lines,
  figures in dynamic poses,
  pop art aesthetic,
  no gradients,
  solid color fills,
  white or bright colored background,
  playful and energetic,
  multiple figures interacting,
  thick black stroke weight,
  1980s street art style
`.replace(/\s+/g, ' ').trim();

// Pollock style for card backs
const POLLOCK_BASE = `
  Jackson Pollock style abstract expressionist painting,
  chaotic drip painting technique,
  splattered paint layers,
  energetic gestural marks,
  interweaving paint drips,
  dynamic movement,
  layered enamel paint effect,
  black white and primary colors,
  action painting aesthetic,
  organic flowing lines,
  no recognizable shapes,
  raw artistic energy
`.replace(/\s+/g, ' ').trim();

// Card back variations by deck type
export const cardBacks = {
  domain: {
    prompt: `${POLLOCK_BASE}, predominantly blue and teal paint drips, hints of white, energetic corporate energy --ar 5:7 --style raw --v 6.1`,
    seed: 42
  },
  wellbeing: {
    prompt: `${POLLOCK_BASE}, warm yellows and golds with orange accents, human warmth energy, organic flowing --ar 5:7 --style raw --v 6.1`,
    seed: 43
  },
  tech: {
    prompt: `${POLLOCK_BASE}, hot pink and magenta with red accents, electric energy, technological chaos --ar 5:7 --style raw --v 6.1`,
    seed: 44
  },
  modifier: {
    prompt: `${POLLOCK_BASE}, deep purples and violets with silver accents, temporal distortion feeling --ar 5:7 --style raw --v 6.1`,
    seed: 45
  },
  wildcard: {
    prompt: `${POLLOCK_BASE}, all primary colors chaotically mixed, maximum entropy, explosive energy --ar 5:7 --style raw --v 6.1`,
    seed: 46
  }
};

// Domain card prompts - Haring figures showing each sector
export const domainPrompts = {
  'domain-01': {
    name: 'Finance & Banking',
    prompt: `${HARING_BASE},
      figures exchanging money and coins,
      dancing figures with dollar signs,
      figures climbing bar charts,
      piggy bank symbols,
      figures shaking hands over deals,
      credit card shapes,
      figures juggling coins,
      bank building with figures entering,
      bright green and gold colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-02': {
    name: 'Healthcare & Pharma',
    prompt: `${HARING_BASE},
      figures with glowing hearts,
      dancing figures forming a cross/plus sign,
      figures carrying stretchers helping others,
      pill and capsule shapes,
      figures with stethoscopes,
      radiant healing energy from hands,
      figures in caring embraces,
      DNA helix made of linked figures,
      bright red and white with pink accents,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-03': {
    name: 'Energy & Climate',
    prompt: `${HARING_BASE},
      figures holding up the sun,
      dancing figures as wind turbines spinning,
      figures planting trees,
      lightning bolt figures with energy,
      figures surfing waves,
      radiant sun with figure inside,
      figures forming a globe shape together,
      leaves and nature symbols,
      bright green yellow and blue,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-04': {
    name: 'Education & Learning',
    prompt: `${HARING_BASE},
      figures reading books with radiant lines,
      dancing figures with lightbulbs for heads,
      figures passing knowledge hand to hand,
      graduation cap symbols,
      figures climbing ladders of books,
      brain shapes with figures inside,
      figures in circles sharing ideas,
      pencil and ruler symbols,
      bright yellow orange and blue,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-05': {
    name: 'Governance & Democracy',
    prompt: `${HARING_BASE},
      figures raising hands voting,
      figures holding scales of justice,
      figures forming a human pyramid structure,
      ballot box with figures around it,
      figures in deliberation circles,
      gavel symbols,
      figures marching together united,
      podium with speaking figure,
      red white and blue colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-06': {
    name: 'Labor & Work',
    prompt: `${HARING_BASE},
      figures building with tools,
      dancing figures carrying briefcases,
      figures on assembly line in rhythm,
      gear and cog symbols with figures inside,
      figures climbing corporate ladder,
      handshake symbols,
      figures with hard hats constructing,
      clock symbols with figures racing,
      orange blue and gray colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-07': {
    name: 'Communication & Media',
    prompt: `${HARING_BASE},
      figures with speech bubbles radiating,
      dancing figures holding phones and screens,
      figures connected by lightning bolts,
      TV and radio shapes with figures,
      figures shouting with megaphones,
      satellite dish with radiant signals,
      figures in conversation pairs,
      newspaper and microphone symbols,
      bright cyan magenta and yellow,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-08': {
    name: 'Security & Defense',
    prompt: `${HARING_BASE},
      figures holding shields protecting others,
      figures forming a defensive wall together,
      lock and key symbols,
      figures with watchful eyes,
      radar dish with scanning lines,
      figures standing guard,
      fortress shapes with figures,
      figures deflecting threats,
      dark blue black and red accents,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-09': {
    name: 'Transportation & Logistics',
    prompt: `${HARING_BASE},
      figures riding in cars planes trains,
      dancing figures with wheels for feet,
      figures passing packages hand to hand,
      road and highway symbols,
      figures driving trucks,
      airplane shapes with figures waving,
      figures on conveyor belts,
      map and route symbols,
      orange green and blue colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'domain-10': {
    name: 'Food & Agriculture',
    prompt: `${HARING_BASE},
      figures harvesting crops together,
      dancing figures holding vegetables and fruits,
      figures watering plants with care,
      tractor shapes with figures,
      figures around a shared table eating,
      wheat and corn symbols,
      figures planting seeds,
      sun and rain nurturing figures,
      green brown and golden yellow,
      --ar 5:7 --style raw --v 6.1`
  }
};

// Wellbeing card prompts - Haring figures embodying human dimensions
export const wellbeingPrompts = {
  'well-01': {
    name: 'Autonomy / Agency',
    prompt: `${HARING_BASE},
      single figure breaking free from chains,
      figure choosing between multiple paths,
      figure with compass directing own way,
      figures each dancing independently,
      figure pushing away controlling hands,
      figure steering own ship,
      radiant self-determination energy,
      figure standing alone confidently,
      bold red and orange empowerment colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-02': {
    name: 'Connection / Belonging',
    prompt: `${HARING_BASE},
      figures embracing in groups,
      figures holding hands in circles,
      figures forming heart shapes together,
      interlocking figures like puzzle pieces,
      figures reaching toward each other,
      group of figures radiating together,
      figures building bridges to connect,
      warm community gathering,
      warm pink red and yellow colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-03': {
    name: 'Meaning / Purpose',
    prompt: `${HARING_BASE},
      figure reaching toward bright star,
      figures building something larger together,
      figure with glowing center radiating purpose,
      figures climbing mountain toward goal,
      figure planting flag triumphantly,
      compass and north star symbols,
      figures aligned in same direction,
      transcendent upward energy,
      purple gold and white colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-04': {
    name: 'Security / Safety',
    prompt: `${HARING_BASE},
      figures under protective dome,
      larger figure sheltering smaller ones,
      figures inside safe house shape,
      figures with shields all around,
      nest with figures safely inside,
      figures standing firm against storm,
      anchor symbol with stable figures,
      cocoon of protection,
      deep blue and silver colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-05': {
    name: 'Health / Vitality',
    prompt: `${HARING_BASE},
      figures with radiating hearts pulsing,
      dancing figures full of energy,
      figures doing exercise jumping,
      figure with sun energy inside body,
      figures breathing with visible breath,
      running figures with speed lines,
      figures with strong glowing cores,
      tree of life with figures as leaves,
      vibrant green and red colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-06': {
    name: 'Equity / Fairness',
    prompt: `${HARING_BASE},
      figures of different sizes treated equally,
      balanced scales with figures on each side,
      figures sharing resources evenly,
      figures lifting others up to same level,
      circle of figures all same height,
      figures redistributing to balance,
      level playing field with figures,
      equal radiant lines from all figures,
      yellow and orange justice colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-07': {
    name: 'Privacy / Dignity',
    prompt: `${HARING_BASE},
      figure with protective personal bubble,
      figures with closed doors respecting space,
      figure holding mask choosing what to show,
      curtain symbols with figures behind,
      figures with personal boundaries drawn,
      figure controlling own information flow,
      sacred personal space symbols,
      figures averting eyes respectfully,
      deep purple and black colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-08': {
    name: 'Creativity / Expression',
    prompt: `${HARING_BASE},
      figures painting and drawing wildly,
      figures with ideas exploding from heads,
      dancing figures making music notes,
      figures sculpting and creating,
      rainbow explosion from figure,
      figures with paintbrushes as arms,
      spontaneous artistic energy,
      figures transforming into art,
      rainbow and bright multi colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-09': {
    name: 'Knowledge / Understanding',
    prompt: `${HARING_BASE},
      figures with lightbulbs illuminating,
      figures sharing books and scrolls,
      eye symbols with figures seeing clearly,
      figures connecting dots together,
      puzzle pieces clicking with figures,
      figures with magnifying glasses,
      network of understanding figures,
      eureka moment radiant figure,
      bright yellow and white colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'well-10': {
    name: 'Trust / Cooperation',
    prompt: `${HARING_BASE},
      figures falling backward caught by others,
      figures building tower together,
      handshake with radiant energy,
      figures passing torch to each other,
      circle of figures supporting center,
      figures rowing boat in unison,
      bridge made of trusting figures,
      figures with open vulnerable poses,
      warm orange and teal colors,
      --ar 5:7 --style raw --v 6.1`
  }
};

// Technology card prompts - Haring figures with quantum concepts
export const techPrompts = {
  'tech-01': {
    name: 'Fault-Tolerant Quantum Computing',
    prompt: `${HARING_BASE},
      figures dancing inside computer shapes,
      figures fixing and correcting errors together,
      interlocking stable figure structures,
      figures juggling qubits without dropping,
      fortress of reliable figures,
      figures with checkmarks showing success,
      robust interconnected system of figures,
      error-proof dancing formation,
      electric blue and white colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'tech-02': {
    name: 'Cryptographically-Relevant Quantum',
    prompt: `${HARING_BASE},
      figures breaking through lock symbols,
      figures with keys unlocking secrets,
      figures cracking code puzzles,
      shattered encryption symbols,
      figures revealing hidden messages,
      figures passing through walls,
      lock and key symbols transforming,
      digital fortress figures,
      black red and silver colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'tech-03': {
    name: 'Quantum-AI Hybrid Systems',
    prompt: `${HARING_BASE},
      figures merging human and robot forms,
      brain and computer combining figures,
      figures with both heart and circuit,
      dancing human-machine hybrid figures,
      figures teaching robot figures,
      synthesis of organic and digital,
      neural network made of figures,
      collaborative human-AI figures,
      hot pink and electric blue colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'tech-04': {
    name: 'Quantum Sensing Networks',
    prompt: `${HARING_BASE},
      figures with antenna sensing signals,
      figures detecting invisible waves,
      network of watching sensing figures,
      figures with radar dish heads,
      interconnected sensor figures,
      figures feeling vibrations,
      web of perception figures,
      figures mapping the invisible,
      teal and purple colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'tech-05': {
    name: 'Post-Quantum Cryptography',
    prompt: `${HARING_BASE},
      figures building new stronger locks,
      figures with shields against quantum,
      fortress upgrade with figures,
      figures wrapping in new protection,
      evolution of security figures,
      figures creating unbreakable codes,
      next generation defense figures,
      figures armoring up,
      green and gold protection colors,
      --ar 5:7 --style raw --v 6.1`
  }
};

// Modifier prompts - Haring figures showing time shifts
export const modifierPrompts = {
  'mod-01': {
    name: '-3 Years (Major Breakthrough)',
    prompt: `${HARING_BASE},
      figures rocketing forward fast,
      eureka explosion figures,
      figures leaping over obstacles,
      lightning bolt breakthrough energy,
      figures accelerating through time,
      warp speed dancing figures,
      triumphant discovery figures,
      figures breaking through barriers,
      bright green and gold acceleration,
      --ar 5:7 --style raw --v 6.1`
  },
  'mod-02': {
    name: '-2 Years (Accelerated Funding)',
    prompt: `${HARING_BASE},
      figures showered in money rain,
      figures with rocket fuel boosting,
      investment energy figures,
      figures building faster together,
      resources flowing to figures,
      figures on fast forward,
      funding surge wave figures,
      accelerated progress figures,
      green and gold money colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'mod-03': {
    name: '-1 Year (Steady Progress)',
    prompt: `${HARING_BASE},
      figures marching forward steadily,
      consistent climbing figures,
      figures on escalator upward,
      metronome rhythm figures,
      reliable progress figures,
      figures in steady formation,
      incremental gains figures,
      patient advancement figures,
      calm blue and green colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'mod-04': {
    name: '+1 Year (Technical Setback)',
    prompt: `${HARING_BASE},
      figures stumbling backward,
      figures hitting wall obstacle,
      figures puzzling over problem,
      detour sign with figures,
      figures regrouping after fall,
      minor delay figures,
      figures taking step back,
      recalibrating figures,
      orange caution colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'mod-05': {
    name: '+2 Years (Funding Collapse)',
    prompt: `${HARING_BASE},
      figures watching money drain away,
      collapsing structure figures,
      figures catching falling resources,
      empty pockets figures,
      figures in economic winter,
      dried up well figures,
      figures scrambling for scraps,
      austerity struggling figures,
      gray and muted red colors,
      --ar 5:7 --style raw --v 6.1`
  },
  'mod-06': {
    name: '+3 Years (Regulatory Delay)',
    prompt: `${HARING_BASE},
      figures stuck behind red tape,
      figures waiting in long line,
      bureaucracy maze figures,
      figures with stop signs,
      paperwork avalanche figures,
      figures in approval limbo,
      gatekeepers blocking figures,
      frustrated waiting figures,
      red and gray obstruction colors,
      --ar 5:7 --style raw --v 6.1`
  }
};

/**
 * Mulerouter request builder for Midjourney
 */
export function buildMidjourneyRequest(prompt, options = {}) {
  return {
    model: 'midjourney',
    prompt: prompt,
    parameters: {
      aspect_ratio: options.ar || '5:7',
      style: options.style || 'raw',
      version: options.version || '6.1',
      quality: options.quality || 1,
      stylize: options.stylize || 100
    },
    webhook_url: options.webhookUrl || null,
    reference_id: options.referenceId || null
  };
}

/**
 * Generate first 5 cards via mulerouter
 */
export async function generateFirstFiveCards(mulerouterUrl, apiKey) {
  const cardsToGenerate = [
    { ...domainPrompts['domain-01'], type: 'domain', id: 'domain-01' },
    { ...domainPrompts['domain-02'], type: 'domain', id: 'domain-02' },
    { ...wellbeingPrompts['well-01'], type: 'wellbeing', id: 'well-01' },
    { ...wellbeingPrompts['well-06'], type: 'wellbeing', id: 'well-06' },
    { ...techPrompts['tech-01'], type: 'tech', id: 'tech-01' }
  ];

  const results = [];

  for (const card of cardsToGenerate) {
    console.log(`Generating: ${card.name}...`);

    const request = buildMidjourneyRequest(card.prompt, {
      referenceId: card.id
    });

    try {
      const response = await fetch(`${mulerouterUrl}/v1/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      results.push({
        id: card.id,
        name: card.name,
        type: card.type,
        result
      });

      console.log(`  -> Job ID: ${result.job_id || result.id || 'pending'}`);
    } catch (error) {
      console.error(`  -> Error: ${error.message}`);
      results.push({
        id: card.id,
        name: card.name,
        type: card.type,
        error: error.message
      });
    }
  }

  return results;
}

// Export all prompts for external use
export const allPrompts = {
  domains: domainPrompts,
  wellbeing: wellbeingPrompts,
  technology: techPrompts,
  modifiers: modifierPrompts,
  cardBacks
};

export default allPrompts;
