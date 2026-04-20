import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/Owner/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Owner/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3500));
await page.evaluate(() => {
  const overlay = document.getElementById('intro-overlay');
  if (overlay) overlay.style.display = 'none';
  document.querySelector('#contact').scrollIntoView({ behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'temporary screenshots/screenshot-30-contact-zoom.png', fullPage: false });

// Zoom into the founder card
const card = await page.$('.contact-grid > div:last-child > div:first-child');
if (card) {
  await card.screenshot({ path: 'temporary screenshots/screenshot-31-founder-card.png' });
}
await browser.close();
console.log('done');
