import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';

async function runTests() {
  console.log('=== FULL DARK MODE VERIFICATION ===\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();

  try {
    // Test LIGHT mode
    const page1 = await context.newPage();
    await page1.goto(BASE_URL, { waitUntil: 'networkidle' });

    const light = await page1.evaluate(() => {
      const addon = document.querySelector('.input-group-addon');
      const cs = getComputedStyle(addon);
      return {
        addonBg: cs.backgroundColor,
        addonBorder: cs.borderColor,
      };
    });
    console.log('LIGHT MODE:');
    console.log(`  input-group-addon bg: ${light.addonBg}`);
    console.log(`  input-group-addon border: ${light.addonBorder}`);
    await page1.close();

    // Test DARK mode (fresh page)
    const page2 = await context.newPage();
    await page2.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page2.evaluate(() => document.documentElement.classList.add('dark-mode'));
    await page2.waitForTimeout(300);

    const dark = await page2.evaluate(() => {
      const addon = document.querySelector('.input-group-addon');
      const cs = getComputedStyle(addon);
      return {
        addonBg: cs.backgroundColor,
        addonBorder: cs.borderColor,
      };
    });
    console.log('\nDARK MODE:');
    console.log(`  input-group-addon bg: ${dark.addonBg}`);
    console.log(`  input-group-addon border: ${dark.addonBorder}`);
    await page2.close();

    // Result
    console.log('\n=== RESULT ===');
    const bgChanged = light.addonBg !== dark.addonBg;
    console.log(`Background changed: ${bgChanged ? '✅ YES' : '❌ NO'}`);
    if (bgChanged) {
      console.log(`✅ Light bg: ${light.addonBg}`);
      console.log(`✅ Dark bg: ${dark.addonBg}`);
    }
  } finally {
    await browser.close();
  }
}

runTests();
