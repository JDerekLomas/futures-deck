const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';
const ENDPOINT = 'https://api.mulerouter.ai/vendors/midjourney/v1/tob/diffusion';

const TAROT_STYLE = `intricate tarot card illustration, dense esoteric symbology, mystical occult imagery, ornate decorative border, art nouveau frame, rich saturated colors, gold leaf accents, woodcut engraving style, dramatic lighting, professional tarot deck art, highly detailed, 4k --ar 2:3 --stylize 750`;

// Load card data
const cardData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards-v2.json'), 'utf8'));

// Build prompts for each card
function buildPrompts() {
  const prompts = [];

  // Arc cards
  cardData.arc.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.name} tarot card: ${symbolStr}, representing a future of ${card.name.toLowerCase()}, ${card.description}, ${TAROT_STYLE}`
    });
  });

  // Terrain cards
  cardData.terrain.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.name} tarot card: ${symbolStr}, representing the domain of ${card.name.toLowerCase()}, ${card.description}, ${TAROT_STYLE}`
    });
  });

  // Object cards
  cardData.object.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.name} tarot card: ${symbolStr}, an artifact representing ${card.description.toLowerCase()}, ${TAROT_STYLE}`
    });
  });

  // Wellbeing cards
  cardData.wellbeing.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.name} tarot card: ${symbolStr}, human flourishing and ${card.description.toLowerCase()}, ${TAROT_STYLE}`
    });
  });

  // Technology cards
  cardData.technology.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.short_name} tarot card: ${symbolStr}, emerging technology as mystical force, futuristic yet ancient, ${TAROT_STYLE}`
    });
  });

  // Modifier cards
  cardData.modifiers.forEach(card => {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      filename: `${card.id}.png`,
      prompt: `${card.label} tarot card: ${symbolStr}, timeline modifier representing ${card.context.toLowerCase()}, ${TAROT_STYLE}`
    });
  });

  return prompts;
}

async function submitJob(prompt) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: prompt.prompt })
  });

  const data = await response.json();
  // Task ID is in task_info.id
  return { ...prompt, taskId: data.task_info?.id };
}

async function checkTask(taskId) {
  const response = await fetch(`${ENDPOINT}/${taskId}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  return response.json();
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
  const prompts = buildPrompts();
  console.log(`\nGenerating ${prompts.length} tarot cards...\n`);

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'assets', 'tarot');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Submit all jobs (with rate limiting)
  const jobs = [];
  for (const prompt of prompts) {
    console.log(`Submitting: ${prompt.id}`);
    try {
      const job = await submitJob(prompt);
      if (job.taskId) {
        jobs.push(job);
        console.log(`  Task ID: ${job.taskId}`);
      } else {
        console.log(`  Error: No task ID returned`);
      }
      // Rate limit: wait 3 seconds between submissions
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log(`\nSubmitted ${jobs.length} jobs. Waiting for completion...\n`);

  // Poll for completion
  const completed = new Set();
  const failed = new Set();

  while (completed.size + failed.size < jobs.length) {
    for (const job of jobs) {
      if (completed.has(job.id) || failed.has(job.id)) continue;

      try {
        const result = await checkTask(job.taskId);

        if (result.task_info?.status === 'completed') {
          const imageUrl = result.images?.[0];
          if (imageUrl) {
            const filepath = path.join(outputDir, job.filename);
            await downloadImage(imageUrl, filepath);
            console.log(`Downloaded: ${job.filename}`);
            completed.add(job.id);
          } else {
            console.log(`No image for: ${job.id}`);
            failed.add(job.id);
          }
        } else if (result.task_info?.status === 'failed') {
          console.log(`Failed: ${job.id}`);
          failed.add(job.id);
        }
      } catch (e) {
        // Ignore polling errors
      }
    }

    if (completed.size + failed.size < jobs.length) {
      console.log(`Progress: ${completed.size}/${jobs.length} completed, ${failed.size} failed`);
      await new Promise(r => setTimeout(r, 15000)); // Wait 15 seconds between polls
    }
  }

  console.log(`\nComplete! ${completed.size} images generated, ${failed.size} failed.`);
}

main().catch(console.error);
