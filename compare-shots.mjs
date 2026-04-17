import { createRequire } from 'module';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Owner/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotDir)) mkdirSync(screenshotDir, { recursive: true });

function nextPath(label) {
  const existing = existsSync(screenshotDir) ? readdirSync(screenshotDir).filter(f => f.endsWith('.png')) : [];
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

// Wait for animation to reach idle state (typing + loading + preview reveal)
console.log('Waiting for animation to reach idle state...');
await new Promise(r => setTimeout(r, 4000));

// Trigger scroll to start expansion
console.log('Triggering scroll...');
await page.evaluate(() => {
  window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }));
});

// Wait until expansion is nearly complete (0.85s) then screenshot the preview
await new Promise(r => setTimeout(r, 850));
const p1 = nextPath('end-of-animation');
await page.screenshot({ path: p1 });
console.log('Shot 1 (end of animation):', p1);

// Wait for overlay to fully disappear (~0.5s more: 0.3s fade + 0.2s delay)
await new Promise(r => setTimeout(r, 700));
const p2 = nextPath('hero-revealed');
await page.screenshot({ path: p2 });
console.log('Shot 2 (hero revealed):', p2);

await browser.close();
