const { chromium } = require('playwright');

async function diagnosticTest() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    // Listen to console messages from the page
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));

    // Listen to page errors
    page.on('pageerror', error => console.log(`[BROWSER ERROR] ${error.message}`));

    // Listen to failed requests
    page.on('requestfailed', request => {
        console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
    });

    try {
        console.log('\n=== DIAGNOSTIC TEST: $59 Ship Today ===\n');

        await page.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle' });
        console.log('✓ Page loaded');
        await page.waitForTimeout(3000);

        // Scroll to load lazy content
        await page.evaluate(() => window.scrollTo(0, 800));
        await page.waitForTimeout(2000);

        // Select size
        console.log('Selecting size M...');
        const sizeButton = page.locator('button[data-size="M"]');
        await sizeButton.waitFor({ state: 'visible', timeout: 15000 });
        await sizeButton.click();
        console.log('✓ Size M selected');
        await page.waitForTimeout(1000);

        // Scroll to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);

        // Click primary CTA
        console.log('Clicking primary CTA...');
        const primaryCTA = page.locator('#primaryCTA');
        await primaryCTA.click();
        console.log('✓ Primary CTA clicked');
        await page.waitForTimeout(3000);

        // Take screenshot of popup
        await page.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/diagnostic-popup.png' });
        console.log('✓ Popup screenshot saved');

        // Click "No thanks"
        console.log('Clicking "No thanks"...');
        const noThanks = page.locator('button:has-text("No thanks")');
        await noThanks.click();
        console.log('✓ No thanks clicked');

        // Wait and capture what happens next
        console.log('\nWaiting 30 seconds to see what happens...');
        for (let i = 0; i < 30; i++) {
            await page.waitForTimeout(1000);
            const currentURL = page.url();
            console.log(`[${i + 1}s] Current URL: ${currentURL}`);

            // Check for any loading indicators or messages
            const bodyText = await page.evaluate(() => document.body.innerText);
            if (bodyText.includes('Creating') || bodyText.includes('order') || bodyText.includes('wait')) {
                console.log(`[${i + 1}s] Page text includes: ${bodyText.substring(0, 200)}`);
            }

            // If URL changes, break
            if (currentURL.includes('simpleswap')) {
                console.log('✓✓✓ REDIRECT DETECTED! ✓✓✓');
                break;
            }
        }

        const finalURL = page.url();
        console.log(`\nFinal URL: ${finalURL}`);

        await page.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/diagnostic-final.png' });
        console.log('✓ Final screenshot saved');

        // Check browser console logs stored
        const consoleLogs = await page.evaluate(() => {
            return window.console && window.console.logs ? window.console.logs : 'No logs captured';
        });
        console.log('\nBrowser console:', consoleLogs);

    } catch (error) {
        console.error('Diagnostic test error:', error);
        await page.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/diagnostic-error.png' });
    } finally {
        await browser.close();
    }
}

diagnosticTest().catch(console.error);
