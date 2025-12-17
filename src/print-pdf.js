#!/usr/bin/env node
/**
 * Futures Deck - PDF Print Generator
 *
 * Usage:
 *   node src/print-pdf.js              # Generate both fronts and backs
 *   node src/print-pdf.js fronts       # Generate fronts only
 *   node src/print-pdf.js backs        # Generate backs only
 *   node src/print-pdf.js --print      # Generate and send to default printer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const args = process.argv.slice(2);
const mode = args.find(a => ['fronts', 'backs'].includes(a)) || 'both';
const shouldPrint = args.includes('--print');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const PROJECT_DIR = path.join(__dirname, '..');

async function generatePDF(htmlFile, outputName) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlPath = path.join(PROJECT_DIR, htmlFile);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Hide print controls
  await page.evaluate(() => {
    const controls = document.querySelector('.print-controls');
    if (controls) controls.style.display = 'none';
  });

  const pdfPath = path.join(OUTPUT_DIR, outputName);

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
  });

  await browser.close();

  console.log(`✓ Generated: ${pdfPath}`);
  return pdfPath;
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Futures Deck - PDF Generator\n');

  const pdfs = [];

  if (mode === 'both' || mode === 'fronts') {
    const pdf = await generatePDF('print-cards.html', 'futures-deck-fronts.pdf');
    pdfs.push(pdf);
  }

  if (mode === 'both' || mode === 'backs') {
    const pdf = await generatePDF('print-backs.html', 'futures-deck-backs.pdf');
    pdfs.push(pdf);
  }

  console.log('\nDone!');

  if (shouldPrint) {
    console.log('\nSending to printer...');
    for (const pdf of pdfs) {
      try {
        execSync(`lp "${pdf}"`);
        console.log(`✓ Printed: ${path.basename(pdf)}`);
      } catch (err) {
        console.error(`✗ Print failed: ${err.message}`);
      }
    }
  } else {
    console.log('\nTo print, run: node src/print-pdf.js --print');
    console.log('Or open the PDFs in output/ folder');
  }
}

main().catch(console.error);
