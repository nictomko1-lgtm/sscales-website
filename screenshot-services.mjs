import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Scroll to services section
  await page.evaluate(() => {
    const servicesSection = document.getElementById('services');
    servicesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  
  await page.waitForTimeout(1000);
  
  // Take screenshot of just the services area
  const servicesElement = await page.$('#services');
  await servicesElement.screenshot({ path: 'temporary screenshots/screenshot-services-zoom.png' });
  
  await browser.close();
})();
