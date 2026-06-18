const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport large enough for both elements
  await page.setViewport({ width: 2000, height: 1000, deviceScaleFactor: 1 });
  
  const filePath = `file:///${path.join(__dirname, 'promo.html').replace(/\\/g, '/')}`;
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });

  // Wait a bit for fonts to render
  await new Promise(r => setTimeout(r, 1500));

  // Capture Marquee
  const marqueeElement = await page.$('#marquee');
  await marqueeElement.screenshot({ path: 'marquee_promo.png', type: 'png' });

  // Capture Small Promo
  const smallElement = await page.$('#small');
  await smallElement.screenshot({ path: 'small_promo.png', type: 'png' });

  await browser.close();
  console.log('Images generated successfully.');
})();
