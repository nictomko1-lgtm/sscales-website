import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readdirSync } from 'fs';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Owner/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true });

function nextPath(label) {
  const existing = readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
  const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return join(screenshotDir, `screenshot-${next}-${label}.png`);
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Owner/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

// Wait for idle state
console.log('Waiting for idle state...');
await new Promise(r => setTimeout(r, 4200));

// Measure preview h1 position BEFORE scroll (preview visible in small browser)
const previewH1Before = await page.evaluate(() => {
  const el = document.getElementById('intro-preview-h1');
  const rect = el.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom, height: rect.height, center: (rect.top + rect.bottom) / 2 };
});
console.log('Preview h1 (in small browser, before scroll):', previewH1Before);

// Trigger expansion
await page.evaluate(() => {
  window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
});

// Wait for full expansion (0.9s) + tiny buffer
await new Promise(r => setTimeout(r, 980));

// Measure preview h1 after expansion (overlay still visible)
const previewH1After = await page.evaluate(() => {
  const el = document.getElementById('intro-preview-h1');
  const rect = el.getBoundingClientRect();
  const overlay = document.getElementById('intro-overlay');
  return { 
    top: rect.top, bottom: rect.bottom, height: rect.height, 
    center: (rect.top + rect.bottom) / 2,
    overlayOpacity: overlay.style.opacity
  };
});
console.log('Preview h1 (fully expanded, overlay visible):', previewH1After);

// Screenshot at this state (animation fully done, overlay visible)
const p1 = nextPath('animation-done-overlay-visible');
await page.screenshot({ path: p1 });
console.log('Shot 1:', p1);

// Wait for overlay to disappear (0.3s fade + 0.2s delay + buffer)
await new Promise(r => setTimeout(r, 800));

// Measure real hero h1
const heroH1 = await page.evaluate(() => {
  const el = document.querySelector('#hero h1');
  const rect = el.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom, height: rect.height, center: (rect.top + rect.bottom) / 2 };
});
console.log('Real hero h1 (after overlay removed):', heroH1);

const p2 = nextPath('hero-revealed');
await page.screenshot({ path: p2 });
console.log('Shot 2:', p2);

console.log('\n--- DELTA ---');
console.log('Preview center:', previewH1After.center.toFixed(1), 'px');
console.log('Hero center:   ', heroH1.center.toFixed(1), 'px');
console.log('Difference:    ', (heroH1.center - previewH1After.center).toFixed(1), 'px (positive = hero is lower)');

await browser.close();
