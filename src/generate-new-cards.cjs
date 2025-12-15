const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';
const ENDPOINT = 'https://api.mulerouter.ai/vendors/midjourney/v1/tob/diffusion';

const TAROT_STYLE = 'intricate tarot card illustration, dense esoteric symbology, mystical occult imagery, ornate decorative border, art nouveau frame, rich saturated colors, gold leaf accents, woodcut engraving style, dramatic lighting, professional tarot deck art, highly detailed, 4k --ar 2:3 --stylize 750';

const cardData = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards-v2.json'), 'utf8'));
const outputDir = path.join(__dirname, '..', 'assets', 'tarot');

// Find missing images
const existingFiles = fs.readdirSync(outputDir);
const prompts = [];

// Check terrain cards
cardData.terrain.forEach(card => {
  if (!existingFiles.includes(card.id + '.png')) {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      name: card.name,
      filename: card.id + '.png',
      prompt: card.name + ' tarot card: ' + symbolStr + ', representing the domain of ' + card.name.toLowerCase() + ', ' + card.description + ', ' + TAROT_STYLE
    });
  }
});

// Check wellbeing cards
cardData.wellbeing.forEach(card => {
  if (!existingFiles.includes(card.id + '.png')) {
    const symbolStr = card.symbols.slice(0, 3).join(', ');
    prompts.push({
      id: card.id,
      name: card.name,
      filename: card.id + '.png',
      prompt: card.name + ' tarot card: ' + symbolStr + ', human flourishing and ' + card.description.toLowerCase() + ', ' + TAROT_STYLE
    });
  }
});

if (prompts.length === 0) {
  console.log('\nAll card images already exist!');
  process.exit(0);
}

console.log('\nFound ' + prompts.length + ' missing card images:\n');
prompts.forEach(p => console.log('  - ' + p.id + ': ' + p.name));

async function submitJob(prompt) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: prompt.prompt })
  });
  const data = await response.json();
  return { ...prompt, taskId: data.task_info?.id };
}

async function checkTask(taskId) {
  const response = await fetch(ENDPOINT + '/' + taskId, {
    headers: { 'Authorization': 'Bearer ' + API_KEY }
  });
  return response.json();
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
  console.log('\nGenerating ' + prompts.length + ' tarot cards...\n');

  const jobs = [];
  for (const prompt of prompts) {
    console.log('Submitting: ' + prompt.id + ' (' + prompt.name + ')');
    try {
      const job = await submitJob(prompt);
      if (job.taskId) {
        jobs.push(job);
        console.log('  Task ID: ' + job.taskId);
      } else {
        console.log('  Error: No task ID returned');
      }
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      console.log('  Error: ' + e.message);
    }
  }

  console.log('\nSubmitted ' + jobs.length + ' jobs. Waiting for completion...\n');

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
            console.log('Downloaded: ' + job.filename);
            completed.add(job.id);
          } else {
            failed.add(job.id);
          }
        } else if (result.task_info?.status === 'failed') {
          console.log('Failed: ' + job.id);
          failed.add(job.id);
        }
      } catch (e) {}
    }
    if (completed.size + failed.size < jobs.length) {
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  console.log('\nComplete! ' + completed.size + ' images generated, ' + failed.size + ' failed.');
}

main().catch(console.error);
