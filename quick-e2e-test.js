/**
 * Quick E2E checkout test - verifies CORS and checkout flow
 */
const { chromium } = require('playwright');

(async () => {
  console.log('=== QUICK E2E CHECKOUT TEST ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture API responses and console
  let apiCalled = false;
  let apiSuccess = false;
  let exchangeUrl = null;
  let corsError = false;

  page.on('console', msg => {
    const text = msg.text();
    console.log(`[CONSOLE] ${text}`);
    if (text.includes('CORS') || text.includes('blocked')) {
      corsError = true;
    }
    if (text.includes('[POOL]')) {
      if (text.includes('Error')) {
        console.log('API ERROR detected');
      }
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/buy-now')) {
      apiCalled = true;
      console.log(`[API] Status: ${response.status()}`);
      try {
        const data = await response.json();
        console.log(`[API] Response: ${JSON.stringify(data)}`);
        if (data.success && data.exchangeUrl) {
          apiSuccess = true;
          exchangeUrl = data.exchangeUrl;
        }
      } catch (e) {}
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('/buy-now')) {
      console.log(`[API FAILED] ${request.url()} - ${request.failure()?.errorText}`);
      corsError = true;
    }
  });

  try {
    console.log('Loading https://pink-pilates-set.netlify.app...');
    await page.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded\n');

    // Select size
    console.log('Selecting size M...');
    await page.locator('.size-btn:has-text("M")').click();
    await page.waitForTimeout(500);
    console.log('Size selected\n');

    // Click main CTA (ship today $59)
    console.log('Clicking ship today button...');
    await page.locator('.cta-button.primary').first().click();
    console.log('Button clicked\n');

    // Wait for either popup or redirect
    console.log('Waiting for response...');
    await page.waitForTimeout(3000);

    // Check if popup appeared
    const popup = await page.$('#orderBump');
    if (popup && await popup.isVisible()) {
      console.log('Order bump popup visible, clicking No thanks...');
      await page.click('#declineBtn');
      console.log('Declined bump\n');
    }

    // Wait for API or redirect
    console.log('Waiting for checkout completion...');
    await page.waitForTimeout(15000);

    // Check final URL
    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);

    // Summary
    console.log('\n=== RESULTS ===');
    console.log(`API Called: ${apiCalled}`);
    console.log(`API Success: ${apiSuccess}`);
    console.log(`Exchange URL: ${exchangeUrl || 'None'}`);
    console.log(`CORS Error: ${corsError}`);
    console.log(`Redirected to SimpleSwap: ${finalUrl.includes('simpleswap.io')}`);

    if (apiSuccess && exchangeUrl) {
      console.log('\n*** CHECKOUT FLOW WORKING! ***');
    } else if (corsError) {
      console.log('\n*** CORS STILL BLOCKING ***');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== TEST COMPLETE ===');
})();
