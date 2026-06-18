const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set content to just the SVG
  const svg = fs.readFileSync(path.join(__dirname, 'webapp/public/logo.svg'), 'utf8');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px;">
        ${svg}
      </body>
    </html>
  `);

  await page.setViewport({ width: 512, height: 512 });

  // Make sure background is transparent
  const element = await page.$('svg');
  
  // High res 512x512 logo.png
  await element.screenshot({ path: 'webapp/public/logo.png', omitBackground: true });
  
  // Extension icons
  await page.setViewport({ width: 128, height: 128 });
  await page.setContent(`
    <body style="margin: 0; padding: 0; background: transparent;">
      <svg viewBox="0 0 512 512" width="128" height="128">${svg.split('xmlns="http://www.w3.org/2000/svg">')[1]}
    </body>
  `);
  await (await page.$('svg')).screenshot({ path: 'extension/icon128.png', omitBackground: true });

  await page.setViewport({ width: 48, height: 48 });
  await page.setContent(`
    <body style="margin: 0; padding: 0; background: transparent;">
      <svg viewBox="0 0 512 512" width="48" height="48">${svg.split('xmlns="http://www.w3.org/2000/svg">')[1]}
    </body>
  `);
  await (await page.$('svg')).screenshot({ path: 'extension/icon48.png', omitBackground: true });

  await page.setViewport({ width: 16, height: 16 });
  await page.setContent(`
    <body style="margin: 0; padding: 0; background: transparent;">
      <svg viewBox="0 0 512 512" width="16" height="16">${svg.split('xmlns="http://www.w3.org/2000/svg">')[1]}
    </body>
  `);
  await (await page.$('svg')).screenshot({ path: 'extension/icon16.png', omitBackground: true });

  await browser.close();
  console.log('All icons generated successfully!');
})();
