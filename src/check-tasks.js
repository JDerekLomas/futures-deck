#!/usr/bin/env node
/**
 * Check MuleRouter Midjourney task status and download images
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'sk-mr-9241c37288a9efea32a6898eb5133e13d5909e87063d8905755762784ea8d893';
const BASE_URL = 'https://api.mulerouter.ai';

// Load task IDs from previous run
const resultsPath = path.join(__dirname, '..', 'assets', 'midjourney-results.json');
const previousResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

async function checkTask(taskId, cardName) {
  // Try different possible endpoint patterns
  const endpoints = [
    `/vendors/midjourney/v1/tob/diffusion/${taskId}`,
    `/vendors/midjourney/v1/tasks/${taskId}`,
    `/v1/tasks/${taskId}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`\n📋 ${cardName} (${taskId.slice(0, 8)}...)`);
        console.log(`   Endpoint: ${endpoint}`);
        console.log(`   Status: ${data.task_info?.status || data.status || 'unknown'}`);

        if (data.result || data.output || data.images || data.image_url) {
          console.log(`   Result:`, JSON.stringify(data, null, 2).slice(0, 500));
        }

        return { taskId, cardName, endpoint, data };
      }
    } catch (e) {
      // Try next endpoint
    }
  }

  console.log(`\n📋 ${cardName} (${taskId.slice(0, 8)}...)`);
  console.log(`   Could not find task status endpoint`);
  return { taskId, cardName, status: 'endpoint_not_found' };
}

async function downloadImage(url, filename) {
  const imagesDir = path.join(__dirname, '..', 'assets', 'generated');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const filePath = path.join(imagesDir, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`   💾 Saved: ${filePath}`);
  return filePath;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Checking MuleRouter Task Status                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tasks = previousResults.results
    .filter(r => r.status === 'submitted' && r.response?.task_info?.id)
    .map(r => ({
      taskId: r.response.task_info.id,
      cardId: r.id,
      cardName: r.name
    }));

  console.log(`\nChecking ${tasks.length} tasks...\n`);

  const results = [];

  for (const task of tasks) {
    const result = await checkTask(task.taskId, task.cardName);
    results.push({ ...task, ...result });

    // Download image if available
    const imageUrl = result.data?.result?.image_url ||
                     result.data?.output?.image_url ||
                     result.data?.images?.[0] ||
                     result.data?.image_url;

    if (imageUrl) {
      try {
        await downloadImage(imageUrl, `${task.cardId}.png`);
      } catch (e) {
        console.log(`   ⚠️ Could not download: ${e.message}`);
      }
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // Save updated results
  const outputPath = path.join(__dirname, '..', 'assets', 'task-status.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    checked_at: new Date().toISOString(),
    results
  }, null, 2));

  console.log(`\n\nResults saved to: ${outputPath}`);
}

main();
