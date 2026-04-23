import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});
await page.screenshot({ path: 'temporary screenshots/screenshot-35-footer-bottom.png', fullPage: false });
await browser.close();
