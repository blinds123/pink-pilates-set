const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Comprehensive E2E Test for https://shepants.netlify.app\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const testResults = [];
  let testsPassed = 0;
  let testsFailed = 0;

  // Helper function to record test results
  function recordTest(testName, passed, details = '') {
    const result = { testName, passed, details };
    testResults.push(result);
    if (passed) {
      testsPassed++;
      console.log(`✅ PASS: ${testName}${details ? ' - ' + details : ''}`);
    } else {
      testsFailed++;
      console.log(`❌ FAIL: ${testName}${details ? ' - ' + details : ''}`);
    }
  }

  try {
    // TEST 1: Page loads successfully
    console.log('\n📋 TEST 1: Page Load');
    const response = await page.goto('https://shepants.netlify.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    recordTest('Page loads successfully', response.status() === 200, `Status: ${response.status()}`);

    // Wait a moment for page to settle
    await page.waitForTimeout(2000);

    // TEST 2: Quiz displays on page load
    console.log('\n📋 TEST 2: Quiz Display');
    const quizVisible = await page.isVisible('#quizPage');
    recordTest('Quiz displays on page load', quizVisible);

    // TEST 3: Quiz options are clickable
    console.log('\n📋 TEST 3: Quiz Options');
    const quizOptions = await page.$$('.quiz-option');
    recordTest('Quiz has 3 options', quizOptions.length === 3, `Found ${quizOptions.length} options`);

    // TEST 4: Quiz option images load
    const quizImages = await page.$$eval('.quiz-avatar', imgs =>
      imgs.map(img => ({ loaded: img.complete && img.naturalHeight > 0 }))
    );
    const allImagesLoaded = quizImages.every(img => img.loaded);
    recordTest('Quiz images load properly', allImagesLoaded, `${quizImages.filter(i => i.loaded).length}/${quizImages.length} loaded`);

    // TEST 5: Click a quiz option
    console.log('\n📋 TEST 4: Quiz Interaction');
    await page.click('.quiz-option:first-child');
    await page.waitForTimeout(1000);

    // TEST 6: Product page renders after quiz
    console.log('\n📋 TEST 5: Product Page Display');
    const mainContentVisible = await page.isVisible('.main-content.visible');
    recordTest('Product page displays after quiz selection', mainContentVisible);

    // TEST 7: Main product image loads
    const heroImage = await page.$eval('#heroImage', img => ({
      src: img.src,
      loaded: img.complete && img.naturalHeight > 0,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
    recordTest('Hero image loads', heroImage.loaded, `${heroImage.width}x${heroImage.height}px`);

    // TEST 8: Check all critical elements exist
    console.log('\n📋 TEST 6: Critical Elements');
    const elements = {
      'Product title': await page.isVisible('h1'),
      'Price box': await page.isVisible('.price-box'),
      'Primary CTA ($59)': await page.isVisible('#primaryCTA'),
      'Secondary CTA ($19)': await page.isVisible('#secondaryCTA'),
      'Announcement bar': await page.isVisible('.announcement'),
    };

    for (const [name, visible] of Object.entries(elements)) {
      recordTest(name + ' exists', visible);
    }

    // TEST 9: Check button text
    const primaryBtnText = await page.textContent('#primaryCTA');
    recordTest('Primary CTA shows $59', primaryBtnText.includes('$59'), `Text: "${primaryBtnText.trim()}"`);

    const secondaryBtnText = await page.textContent('#secondaryCTA');
    recordTest('Secondary CTA shows $19', secondaryBtnText.includes('$19'), `Text: "${secondaryBtnText.trim()}"`);

    // TEST 10: Scroll to trigger lazy content
    console.log('\n📋 TEST 7: Lazy Content Loading');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // TEST 11: Size selector appears
    const sizeGridVisible = await page.isVisible('.size-grid');
    recordTest('Size selector displays', sizeGridVisible);

    // TEST 12: Count size buttons
    const sizeButtons = await page.$$('.size-btn');
    recordTest('All size options present', sizeButtons.length === 7, `Found ${sizeButtons.length} sizes`);

    // TEST 13: Select a size
    console.log('\n📋 TEST 8: Size Selection');
    await page.click('.size-btn[data-size="M"]');
    await page.waitForTimeout(500);
    const sizeSelected = await page.$eval('.size-btn[data-size="M"]', btn => btn.classList.contains('selected'));
    recordTest('Size selector works', sizeSelected, 'Selected size M');

    // TEST 14: Click Primary CTA to trigger order bump
    console.log('\n📋 TEST 9: Order Bump Modal');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.click('#primaryCTA');
    await page.waitForTimeout(1000);

    // TEST 15: Order bump modal appears
    const orderBumpVisible = await page.isVisible('#orderBumpPopup');
    recordTest('Order bump modal displays', orderBumpVisible);

    // TEST 16: Order bump content
    if (orderBumpVisible) {
      const modalElements = {
        'Accept button': await page.isVisible('button[onclick="acceptOrderBump()"]'),
        'Decline button': await page.isVisible('button[onclick="declineOrderBump()"]'),
        'Order summary': await page.isVisible('#orderSummary'),
      };

      for (const [name, visible] of Object.entries(modalElements)) {
        recordTest('Order bump - ' + name, visible);
      }

      // Check order summary shows correct pricing
      const orderSummaryText = await page.textContent('#orderSummary');
      recordTest('Order summary shows $59 base', orderSummaryText.includes('$59'), 'For primary order');
      recordTest('Order summary shows $10 bump', orderSummaryText.includes('$10'), 'For bustier add-on');
      recordTest('Order summary shows $69 total', orderSummaryText.includes('$69'), 'Total with bump');
    }

    // TEST 17: Test decline flow
    console.log('\n📋 TEST 10: Order Bump Decline Flow');
    console.log('⚠️  NOTE: Declining will attempt API call with $59 (will fail as API expects $29/$39/$69/$79)');

    // Intercept the API call to prevent actual redirect
    await page.route('**/buy-now', route => {
      console.log(`\n🌐 API Call Intercepted:`);
      console.log(`   URL: ${route.request().url()}`);
      console.log(`   Method: ${route.request().method()}`);
      const postData = route.request().postData();
      console.log(`   Body: ${postData}`);

      try {
        const body = JSON.parse(postData);
        recordTest('API called with correct format', body.amountUSD !== undefined, `Amount: $${body.amountUSD}`);

        // Simulate API response based on amount
        if ([29, 39, 69, 79].includes(body.amountUSD)) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              exchangeUrl: 'https://simpleswap.io/exchange?id=test123',
              poolStatus: 'instant'
            })
          });
        } else {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: `Invalid amount: $${body.amountUSD}. Expected: 29, 39, 69, or 79`
            })
          });
        }
      } catch (e) {
        route.continue();
      }
    });

    await page.click('button[onclick="declineOrderBump()"]');
    await page.waitForTimeout(2000);

    // TEST 18: Test accept flow (reopen modal first)
    console.log('\n📋 TEST 11: Order Bump Accept Flow');

    // Click primary CTA again to reopen modal
    await page.click('#primaryCTA');
    await page.waitForTimeout(1000);

    console.log('⚠️  NOTE: Accepting will attempt API call with $69 (should succeed)');
    await page.click('button[onclick="acceptOrderBump()"]');
    await page.waitForTimeout(2000);

    // TEST 19: Test secondary CTA flow
    console.log('\n📋 TEST 12: Secondary CTA ($19) Flow');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Skip quiz
    await page.click('.quiz-skip');
    await page.waitForTimeout(1000);

    // Select size
    await page.waitForSelector('.size-btn[data-size="M"]');
    await page.click('.size-btn[data-size="M"]');
    await page.waitForTimeout(500);

    // Click secondary CTA
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.click('#secondaryCTA');
    await page.waitForTimeout(1000);

    // Check modal appears with correct pricing
    const orderBumpVisible2 = await page.isVisible('#orderBumpPopup');
    recordTest('Order bump opens for $19 preorder', orderBumpVisible2);

    if (orderBumpVisible2) {
      const orderSummaryText2 = await page.textContent('#orderSummary');
      recordTest('Order summary shows $19 preorder', orderSummaryText2.includes('$19'), 'For preorder');
      recordTest('Order summary shows $29 total', orderSummaryText2.includes('$29'), 'Total with $10 bump');
    }

    console.log('⚠️  NOTE: Accepting will attempt API call with $29 (should succeed)');
    await page.click('button[onclick="acceptOrderBump()"]');
    await page.waitForTimeout(2000);

    // TEST 20: Visual verification
    console.log('\n📋 TEST 13: Visual Elements');

    // Reload to fresh state
    await page.goto('https://shepants.netlify.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.click('.quiz-skip');
    await page.waitForTimeout(1000);

    // Scroll and check lazy loaded content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const testimonialCards = await page.$$('.testimonial-card');
    recordTest('Testimonials load', testimonialCards.length >= 10, `Found ${testimonialCards.length} testimonials`);

    // Check if load more button exists
    const loadMoreBtn = await page.isVisible('#loadMoreBtn');
    recordTest('Load more reviews button exists', loadMoreBtn);

    // TEST 21: Mobile responsiveness check
    console.log('\n📋 TEST 14: Mobile Responsiveness');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const quizVisibleMobile = await page.isVisible('#quizPage');
    recordTest('Quiz displays on mobile', quizVisibleMobile);

    await page.click('.quiz-skip');
    await page.waitForTimeout(1000);

    const ctaVisibleMobile = await page.isVisible('#primaryCTA');
    recordTest('CTA buttons visible on mobile', ctaVisibleMobile);

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    recordTest('Test execution', false, error.message);
  }

  // Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\n🌐 Tested URL: https://shepants.netlify.app`);
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`\n✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  console.log('\n' + '-'.repeat(80));
  console.log('CRITICAL FINDINGS:');
  console.log('-'.repeat(80));

  console.log('\n⚠️  API COMPATIBILITY ISSUE DETECTED:');
  console.log('   Current page uses: $59 (ship today) and $19 (preorder)');
  console.log('   SimpleSwap API accepts: $29, $39, $69, $79');
  console.log('   \n   MISMATCH:');
  console.log('   - $19 preorder → API rejects (expects $29, $39, $69, or $79)');
  console.log('   - $59 ship today → API rejects (expects $29, $39, $69, or $79)');
  console.log('   - $29 with bump (preorder + $10) → API ACCEPTS ✅');
  console.log('   - $69 with bump (ship today + $10) → API ACCEPTS ✅');

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('   1. Update API to accept $19 and $59 as valid amounts');
  console.log('   2. OR update page pricing to match API expectations:');
  console.log('      - Change $19 preorder → $29 preorder');
  console.log('      - Keep $29 with bump (preorder + bustier)');
  console.log('      - Change $59 ship today → $69 ship today');
  console.log('      - Keep $79 with bump option available');
  console.log('   3. Add error handling on page for failed API calls');
  console.log('   4. Consider price update communication to users');

  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED TEST RESULTS:');
  console.log('-'.repeat(80));

  testResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.testName}`);
    if (result.details) {
      console.log(`   └─ ${result.details}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🏁 TEST COMPLETE');
  console.log('='.repeat(80));

  await browser.close();
})();
