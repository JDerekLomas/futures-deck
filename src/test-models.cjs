const fs = require('fs');
const path = require('path');

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';

const TEST_PROMPT = 'Tarot card titled GROWTH with the word GROWTH in gold letters at the bottom, featuring a mystical tree with roots and branches forming an infinity symbol, ornate art nouveau border with Celtic knotwork, rich jewel tones, professional card game art, high detail';

const models = [
  {
    name: 'nano-banana-pro',
    endpoint: 'https://api.mulerouter.ai/vendors/google/v1/nano-banana-pro/generation',
    body: { prompt: TEST_PROMPT, aspect_ratio: '2:3' }
  },
  {
    name: 'wan-2.5',
    endpoint: 'https://api.mulerouter.ai/vendors/alibaba/v1/wan2/image/generation',
    body: { prompt: TEST_PROMPT, model: 'wan2.5-t2i-preview' }
  },
  {
    name: 'midjourney',
    endpoint: 'https://api.mulerouter.ai/vendors/midjourney/v1/tob/diffusion',
    body: { prompt: TEST_PROMPT + ' --ar 2:3 --stylize 750' }
  }
];

const outputDir = path.join(__dirname, '..', 'assets', 'test-models');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function submitJob(model) {
  console.log(`Submitting to ${model.name}...`);
  const response = await fetch(model.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(model.body)
  });
  const data = await response.json();
  console.log(`  Response:`, JSON.stringify(data, null, 2));
  return { ...model, taskId: data.task_info?.id, statusEndpoint: model.endpoint };
}

async function checkStatus(job) {
  const response = await fetch(`${job.statusEndpoint}/${job.taskId}`, {
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
  console.log('Testing all MuleRouter image models...\n');
  console.log('Prompt:', TEST_PROMPT, '\n');

  // Submit all jobs
  const jobs = [];
  for (const model of models) {
    try {
      const job = await submitJob(model);
      if (job.taskId) {
        jobs.push(job);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log(`\nSubmitted ${jobs.length} jobs. Polling for results...\n`);

  // Poll for completion
  const results = [];
  const completed = new Set();

  while (completed.size < jobs.length) {
    for (const job of jobs) {
      if (completed.has(job.name)) continue;

      try {
        const result = await checkStatus(job);
        if (result.task_info?.status === 'completed') {
          const imageUrl = result.images?.[0];
          if (imageUrl) {
            const filepath = path.join(outputDir, `${job.name}.png`);
            await downloadImage(imageUrl, filepath);
            console.log(`✓ ${job.name}: Downloaded`);
            results.push({ name: job.name, file: filepath, url: imageUrl });
          }
          completed.add(job.name);
        } else if (result.task_info?.status === 'failed') {
          console.log(`✗ ${job.name}: Failed`);
          completed.add(job.name);
        } else {
          console.log(`  ${job.name}: ${result.task_info?.status || 'pending'}...`);
        }
      } catch (e) {
        // ignore polling errors
      }
    }

    if (completed.size < jobs.length) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(outputDir, 'results.json'),
    JSON.stringify({ prompt: TEST_PROMPT, results }, null, 2)
  );

  console.log('\nDone! Results saved to assets/test-models/');
}

main().catch(console.error);
