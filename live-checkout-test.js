const { chromium } = require('playwright');

async function runLiveCheckoutTests() {
    const browser = await chromium.launch({
        headless: false, // Run in visible mode to see what's happening
        slowMo: 500 // Slow down actions for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });

    const results = {
        test1: {},
        test2: {},
        test3: {}
    };

    console.log('\n=== STARTING LIVE E2E CHECKOUT TESTS ===\n');
    console.log('Testing live site: https://pink-pilates-set.netlify.app\n');

    try {
        // TEST 1: Primary CTA ($59 Ship Today)
        console.log('--- TEST 1: $59 Ship Today ---');
        const page1 = await context.newPage();

        await page1.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle' });
        await page1.waitForTimeout(3000); // Wait for lazy content to load

        // Take initial screenshot
        await page1.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test1-initial.png' });

        // Scroll down to ensure lazy content is loaded
        await page1.evaluate(() => window.scrollTo(0, 800));
        await page1.waitForTimeout(2000);

        // Find and click size selector - looking for data-size="M"
        console.log('Selecting size M...');
        const sizeButton = page1.locator('button[data-size="M"]');
        await sizeButton.waitFor({ state: 'visible', timeout: 15000 });
        await sizeButton.click();
        await page1.waitForTimeout(1000);

        results.test1.sizeSelected = 'M';
        console.log('✓ Size M selected');

        // Scroll to top and click primary CTA
        await page1.evaluate(() => window.scrollTo(0, 0));
        await page1.waitForTimeout(1000);

        console.log('Clicking "GET MY SET NOW - $59" button...');
        const primaryCTA = page1.locator('#primaryCTA');
        await primaryCTA.waitFor({ state: 'visible', timeout: 10000 });

        // Set up navigation listener BEFORE clicking
        const navigationPromise = page1.waitForURL(/simpleswap\.io/, { timeout: 45000 });

        await primaryCTA.click();
        console.log('✓ Primary CTA clicked');
        await page1.waitForTimeout(2000);

        // Check for order bump popup
        const popup = page1.locator('.order-bump-popup, #orderBumpPopup, [class*="popup"]').first();
        const popupVisible = await popup.isVisible().catch(() => false);

        if (popupVisible) {
            console.log('✓ Order bump popup appeared');
            results.test1.popupAppeared = 'Yes';
            await page1.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test1-popup.png' });

            // Click "No thanks" button
            console.log('Clicking "No thanks, just the set"...');
            const noThanksButton = page1.locator('button:has-text("No thanks")').first();
            await noThanksButton.click();
            console.log('✓ No thanks clicked');
        } else {
            console.log('⚠ No popup appeared, checking for direct redirect...');
            results.test1.popupAppeared = 'No';
        }

        // Wait for redirect
        try {
            await navigationPromise;
            const finalURL = page1.url();
            results.test1.redirectURL = finalURL;

            // Extract SimpleSwap exchange ID
            const urlParams = new URL(finalURL);
            const exchangeId = urlParams.searchParams.get('id');
            results.test1.exchangeId = exchangeId || 'Not found';

            console.log(`✓ Redirected to: ${finalURL}`);
            console.log(`✓ Exchange ID: ${exchangeId || 'Not found'}`);

            await page1.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test1-final.png' });
        } catch (error) {
            results.test1.redirectURL = `FAILED - ${error.message}`;
            results.test1.exchangeId = 'N/A';
            console.log(`✗ Redirect failed: ${error.message}`);
        }

        await page1.close();

        // TEST 2: Pre-order with Order Bump ($29)
        console.log('\n--- TEST 2: $29 Pre-order + Bump ---');
        const page2 = await context.newPage();

        await page2.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle' });
        await page2.waitForTimeout(3000);

        // Scroll down to load lazy content
        await page2.evaluate(() => window.scrollTo(0, 800));
        await page2.waitForTimeout(2000);

        console.log('Selecting size L...');
        const sizeButton2 = page2.locator('button[data-size="L"]');
        await sizeButton2.waitFor({ state: 'visible', timeout: 15000 });
        await sizeButton2.click();
        await page2.waitForTimeout(1000);

        results.test2.sizeSelected = 'L';
        console.log('✓ Size L selected');

        // Scroll to top and find pre-order button
        await page2.evaluate(() => window.scrollTo(0, 0));
        await page2.waitForTimeout(1000);

        console.log('Clicking "PRE-ORDER FOR 91% OFF - $19" button...');
        const preorderButton = page2.locator('#secondaryCTA');
        await preorderButton.waitFor({ state: 'visible', timeout: 10000 });

        const navigationPromise2 = page2.waitForURL(/simpleswap\.io/, { timeout: 45000 });

        await preorderButton.click();
        console.log('✓ Pre-order button clicked');
        await page2.waitForTimeout(2000);

        // Check for popup and click YES
        const popup2 = page2.locator('.order-bump-popup, #orderBumpPopup, [class*="popup"]').first();
        const popup2Visible = await popup2.isVisible().catch(() => false);

        if (popup2Visible) {
            console.log('✓ Order bump popup appeared');
            results.test2.popupAppeared = 'Yes';
            await page2.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test2-popup.png' });

            console.log('Clicking "YES! Add Yoga Mat - Only $10"...');
            const yesButton = page2.locator('button:has-text("YES")').first();
            await yesButton.click();
            console.log('✓ YES button clicked');
        } else {
            console.log('⚠ No popup appeared');
            results.test2.popupAppeared = 'No';
        }

        try {
            await navigationPromise2;
            const finalURL2 = page2.url();
            results.test2.redirectURL = finalURL2;

            const urlParams2 = new URL(finalURL2);
            const exchangeId2 = urlParams2.searchParams.get('id');
            results.test2.exchangeId = exchangeId2 || 'Not found';

            console.log(`✓ Redirected to: ${finalURL2}`);
            console.log(`✓ Exchange ID: ${exchangeId2 || 'Not found'}`);

            await page2.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test2-final.png' });
        } catch (error) {
            results.test2.redirectURL = `FAILED - ${error.message}`;
            results.test2.exchangeId = 'N/A';
            console.log(`✗ Redirect failed: ${error.message}`);
        }

        await page2.close();

        // TEST 3: Pre-order without bump ($19)
        console.log('\n--- TEST 3: $19 Pre-order Only ---');
        const page3 = await context.newPage();

        await page3.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle' });
        await page3.waitForTimeout(3000);

        // Scroll down to load lazy content
        await page3.evaluate(() => window.scrollTo(0, 800));
        await page3.waitForTimeout(2000);

        console.log('Selecting size S...');
        const sizeButton3 = page3.locator('button[data-size="S"]');
        await sizeButton3.waitFor({ state: 'visible', timeout: 15000 });
        await sizeButton3.click();
        await page3.waitForTimeout(1000);

        results.test3.sizeSelected = 'S';
        console.log('✓ Size S selected');

        // Scroll to top and click pre-order button
        await page3.evaluate(() => window.scrollTo(0, 0));
        await page3.waitForTimeout(1000);

        console.log('Clicking pre-order button...');
        const preorderButton3 = page3.locator('#secondaryCTA');
        await preorderButton3.waitFor({ state: 'visible', timeout: 10000 });

        const navigationPromise3 = page3.waitForURL(/simpleswap\.io/, { timeout: 45000 });

        await preorderButton3.click();
        console.log('✓ Pre-order button clicked');
        await page3.waitForTimeout(2000);

        const popup3 = page3.locator('.order-bump-popup, #orderBumpPopup, [class*="popup"]').first();
        const popup3Visible = await popup3.isVisible().catch(() => false);

        if (popup3Visible) {
            console.log('✓ Order bump popup appeared');
            results.test3.popupAppeared = 'Yes';
            await page3.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test3-popup.png' });

            console.log('Clicking "No thanks, just the set"...');
            const noThanks3 = page3.locator('button:has-text("No thanks")').first();
            await noThanks3.click();
            console.log('✓ No thanks clicked');
        } else {
            console.log('⚠ No popup appeared');
            results.test3.popupAppeared = 'No';
        }

        try {
            await navigationPromise3;
            const finalURL3 = page3.url();
            results.test3.redirectURL = finalURL3;

            const urlParams3 = new URL(finalURL3);
            const exchangeId3 = urlParams3.searchParams.get('id');
            results.test3.exchangeId = exchangeId3 || 'Not found';

            console.log(`✓ Redirected to: ${finalURL3}`);
            console.log(`✓ Exchange ID: ${exchangeId3 || 'Not found'}`);

            await page3.screenshot({ path: '/Users/nelsonchan/Downloads/pink ballet wrap/test3-final.png' });
        } catch (error) {
            results.test3.redirectURL = `FAILED - ${error.message}`;
            results.test3.exchangeId = 'N/A';
            console.log(`✗ Redirect failed: ${error.message}`);
        }

        await page3.close();

    } catch (error) {
        console.error('Test execution error:', error);
    } finally {
        await browser.close();
    }

    // Print formatted results
    console.log('\n\n=== TEST RESULTS SUMMARY ===\n');

    console.log('**Test 1: $59 Ship Today**');
    console.log(`- Size Selected: ${results.test1.sizeSelected || 'N/A'}`);
    console.log(`- Button Clicked: GET MY SET NOW - $59`);
    console.log(`- Popup Appeared: ${results.test1.popupAppeared || 'Unknown'}`);
    console.log(`- Redirect URL: ${results.test1.redirectURL || 'N/A'}`);
    console.log(`- SimpleSwap Exchange ID: ${results.test1.exchangeId || 'N/A'}`);

    console.log('\n**Test 2: $29 Pre-order + Bump**');
    console.log(`- Size Selected: ${results.test2.sizeSelected || 'N/A'}`);
    console.log(`- Button Clicked: PRE-ORDER FOR 91% OFF - $19`);
    console.log(`- Popup Appeared: ${results.test2.popupAppeared || 'Unknown'}`);
    console.log(`- Bump Selected: YES! Add Yoga Mat`);
    console.log(`- Redirect URL: ${results.test2.redirectURL || 'N/A'}`);
    console.log(`- SimpleSwap Exchange ID: ${results.test2.exchangeId || 'N/A'}`);

    console.log('\n**Test 3: $19 Pre-order Only**');
    console.log(`- Size Selected: ${results.test3.sizeSelected || 'N/A'}`);
    console.log(`- Button Clicked: PRE-ORDER FOR 91% OFF - $19`);
    console.log(`- Popup Appeared: ${results.test3.popupAppeared || 'Unknown'}`);
    console.log(`- Bump Selected: No thanks`);
    console.log(`- Redirect URL: ${results.test3.redirectURL || 'N/A'}`);
    console.log(`- SimpleSwap Exchange ID: ${results.test3.exchangeId || 'N/A'}`);

    // Determine verdict
    console.log('\n### VERDICT');

    const allRedirected =
        results.test1.redirectURL && !results.test1.redirectURL.includes('FAILED') &&
        results.test2.redirectURL && !results.test2.redirectURL.includes('FAILED') &&
        results.test3.redirectURL && !results.test3.redirectURL.includes('FAILED');

    const allSimpleSwap =
        results.test1.redirectURL && results.test1.redirectURL.includes('simpleswap.io') &&
        results.test2.redirectURL && results.test2.redirectURL.includes('simpleswap.io') &&
        results.test3.redirectURL && results.test3.redirectURL.includes('simpleswap.io');

    console.log(`- Checkout Flow: ${allRedirected ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`- All 3 price points redirect to SimpleSwap: ${allSimpleSwap ? 'Yes' : 'No'}`);

    const issues = [];
    if (!allRedirected) issues.push('Some redirects failed');
    if (!allSimpleSwap) issues.push('Some redirects did not go to SimpleSwap');
    if (results.test1.popupAppeared === 'No') issues.push('Test 1: No popup appeared');
    if (results.test2.popupAppeared === 'No') issues.push('Test 2: No popup appeared');
    if (results.test3.popupAppeared === 'No') issues.push('Test 3: No popup appeared');

    console.log(`- Issues Found: ${issues.length > 0 ? issues.join(', ') : 'None'}`);

    return results;
}

runLiveCheckoutTests().catch(console.error);
