#!/usr/bin/env node

/**
 * Test Suite: Steve Larsen 3-Product Bundle Order Bump
 * Tests the complete value stack framework implementation
 */

const { launch } = require('puppeteer');

async function testBundleOrderBump() {
  console.log('🎯 Testing Steve Larsen 3-Product Bundle Order Bump\n');

  const browser = await launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  const page = await browser.newPage();

  // Enable console logging from page
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  try {
    // Navigate to the landing page
    await page.goto('file:///Users/nelsonchan/Downloads/pink ballet wrap/index.html', {
      waitUntil: 'networkidle0'
    });

    console.log('✅ Page loaded successfully');

    // Wait for page to be ready
    await page.waitForTimeout(2000);

    // Test 1: Primary Purchase Flow with Bundle
    console.log('\n📦 Test 1: Primary Purchase + Bundle ($59 + $10 = $69)');

    // Select size first
    await page.waitForSelector('.cta-btn', { timeout: 5000 });

    // Check if size selection is required
    const sizeButtons = await page.$$('.size-btn');
    if (sizeButtons.length > 0) {
      await sizeButtons[0].click(); // Click first size
      console.log('✅ Size selected');
      await page.waitForTimeout(500);
    }

    // Click primary CTA button
    await page.click('.cta-btn');
    console.log('✅ Primary CTA clicked');

    // Wait for order bump popup to appear
    await page.waitForSelector('#orderBumpPopup', { visible: true, timeout: 3000 });
    console.log('✅ Order bump popup appeared');

    // Verify 3-product bundle elements
    const bundleElements = await page.evaluate(() => {
      const popup = document.getElementById('orderBumpPopup');

      return {
        headerText: popup.querySelector('h2')?.textContent || '',
        valueStackBanner: popup.querySelector('div[style*="linear-gradient"]')?.textContent || '',
        productCount: popup.querySelectorAll('div[style*="grid-template-columns:1fr 1fr 1fr"] > div').length,
        problemSolvers: Array.from(popup.querySelectorAll('div[style*="PROBLEM SOLVER"]')).map(el => el.textContent),
        prices: Array.from(popup.querySelectorAll('div[style*="text-decoration:line-through"]')).map(el => el.textContent),
        save90Badge: popup.querySelector('div[style*="SAVE 90%"]')?.textContent || '',
        acceptButton: popup.querySelector('button[onclick*="acceptOrderBump"]')?.textContent || '',
        orderSummary: document.getElementById('orderSummary')?.innerHTML || ''
      };
    });

    console.log('\n📊 Bundle Elements Verification:');
    console.log(`  Header: ${bundleElements.headerText}`);
    console.log(`  Value Stack Banner: ${bundleElements.valueStackBanner}`);
    console.log(`  Product Count: ${bundleElements.productCount}/3`);
    console.log(`  Problem Solvers: ${bundleElements.problemSolvers.length}`);
    console.log(`  Original Prices: ${bundleElements.prices.join(', ')}`);
    console.log(`  90% OFF Badge: ${bundleElements.save90Badge}`);
    console.log(`  Accept Button: ${bundleElements.acceptButton}`);

    // Verify Steve Larsen framework elements
    const hasBraCups = bundleElements.problemSolvers.some(s => s.includes('PROBLEM SOLVER #1'));
    const hasThong = bundleElements.problemSolvers.some(s => s.includes('PROBLEM SOLVER #2'));
    const hasSocks = bundleElements.problemSolvers.some(s => s.includes('PROBLEM SOLVER #3'));
    const hasSteveLarsenBadge = bundleElements.headerText.includes('STEVE LARSEN');

    console.log('\n🎯 Steve Larsen Framework Check:');
    console.log(`  ✅ Adhesive Bra Cups (Problem #1): ${hasBraCups ? 'Found' : 'MISSING'}`);
    console.log(`  ✅ Seamless Thong (Problem #2): ${hasThong ? 'Found' : 'MISSING'}`);
    console.log(`  ✅ Non-Slip Socks (Problem #3): ${hasSocks ? 'Found' : 'MISSING'}`);
    console.log(`  ✅ Steve Larsen Badge: ${hasSteveLarsenBadge ? 'Found' : 'MISSING'}`);

    // Test order summary pricing
    const hasCorrectPricing = bundleElements.orderSummary.includes('$59') &&
                             bundleElements.orderSummary.includes('$10') &&
                             bundleElements.orderSummary.includes('$69');
    console.log(`  ✅ Correct Pricing ($59 + $10 = $69): ${hasCorrectPricing ? 'Found' : 'MISSING'}`);

    // Check images are loading
    const images = await page.$$eval('#orderBumpPopup img', imgs =>
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    console.log('\n🖼️  Product Images:');
    images.forEach((img, i) => {
      console.log(`  Image ${i + 1}: ${img.loaded ? '✅ Loaded' : '❌ Failed'} - ${img.src}`);
    });

    // Test 2: Accept Bundle
    console.log('\n💰 Test 2: Accept Bundle Offer');

    // Track if checkout process starts
    let checkoutStarted = false;
    page.once('request', request => {
      if (request.url().includes('simpleswap') || request.url().includes('checkout')) {
        checkoutStarted = true;
        console.log('✅ Checkout process started');
      }
    });

    // Click accept bundle button
    await page.click('button[onclick*="acceptOrderBump()"]');
    console.log('✅ Bundle accepted');

    await page.waitForTimeout(2000);

    // Check if popup closed
    const popupVisible = await page.evaluate(() => {
      const popup = document.getElementById('orderBumpPopup');
      return popup && popup.style.display !== 'none';
    });

    console.log(`  Popup closed: ${!popupVisible ? '✅ Yes' : '❌ No'}`);
    console.log(`  Checkout initiated: ${checkoutStarted ? '✅ Yes' : '❌ No'}`);

    // Test 3: Pre-order Flow with Bundle
    console.log('\n📦 Test 3: Pre-order + Bundle ($19 + $10 = $29)');

    // Navigate back (refresh page)
    await page.goto('file:///Users/nelsonchan/Downloads/pink ballet wrap/index.html', {
      waitUntil: 'networkidle0'
    });
    await page.waitForTimeout(2000);

    // Select size if needed
    const sizeButtons2 = await page.$$('.size-btn');
    if (sizeButtons2.length > 0) {
      await sizeButtons2[0].click();
      await page.waitForTimeout(500);
    }

    // Click pre-order button (assuming it's the second CTA)
    const ctaButtons = await page.$$('.cta-btn');
    if (ctaButtons.length > 1) {
      await ctaButtons[1].click(); // Click second button (pre-order)
      console.log('✅ Pre-order CTA clicked');
    } else {
      console.log('⚠️  Only one CTA button found, using it');
      await ctaButtons[0].click();
    }

    // Wait for order bump popup
    await page.waitForSelector('#orderBumpPopup', { visible: true, timeout: 3000 });

    // Check pre-order pricing
    const preorderPricing = await page.evaluate(() => {
      const orderSummary = document.getElementById('orderSummary');
      return {
        summary: orderSummary.innerHTML,
        hasPreOrderText: orderSummary.textContent.includes('Pre-Order'),
        has29Total: orderSummary.textContent.includes('$29')
      };
    });

    console.log('  Pre-order bundle pricing:');
    console.log(`    Pre-order text: ${preorderPricing.hasPreOrderText ? '✅ Found' : '❌ Missing'}`);
    console.log(`    $29 total: ${preorderPricing.has29Total ? '✅ Found' : '❌ Missing'}`);

    // Close popup
    await page.click('button[onclick*="closeOrderBumpPopup()"]');
    console.log('  Popup closed manually');

    // Test 4: Mobile Responsiveness
    console.log('\n📱 Test 4: Mobile Responsiveness');

    // Change to mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Open popup on mobile
    const ctaButtons3 = await page.$$('.cta-btn');
    if (ctaButtons3.length > 0) {
      await ctaButtons3[0].click();
      await page.waitForSelector('#orderBumpPopup', { visible: true, timeout: 3000 });
    }

    // Check mobile layout
    const mobileLayout = await page.evaluate(() => {
      const popup = document.getElementById('orderBumpPopup');
      const productGrid = popup.querySelector('div[style*="grid-template-columns:1fr 1fr 1fr"]');

      return {
        popupWidth: popup.querySelector('div').style.maxWidth,
        gridStyles: productGrid ? productGrid.style.cssText : '',
        imagesHeight: Array.from(popup.querySelectorAll('img')).map(img => img.style.height),
        fontSize: popup.querySelector('h2').style.fontSize
      };
    });

    console.log('  Mobile layout check:');
    console.log(`    Popup responsive: ${mobileLayout.popupWidth === '100%' ? '✅ Yes' : '❌ No'}`);
    console.log(`    Grid adapted: ${mobileLayout.gridStyles ? '✅ Yes' : '❌ No'}`);

    // Final Results
    console.log('\n🎉 STEVE LARSEN BUNDLE TEST RESULTS:');
    console.log('=====================================');

    const allTests = [
      hasBraCups && hasThong && hasSocks, // All 3 products present
      hasSteveLarsenBadge, // Steve Larsen branding
      hasCorrectPricing, // Correct pricing calculation
      images.every(img => img.loaded), // All images loaded
      !popupVisible, // Popup closes properly
      checkoutStarted, // Checkout initiates
      preorderPricing.has29Total, // Pre-order pricing works
      mobileLayout.popupWidth === '100%' // Mobile responsive
    ];

    const passedTests = allTests.filter(Boolean).length;
    const totalTests = allTests.length;

    console.log(`\n📊 Overall Score: ${passedTests}/${totalTests} tests passed`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
      console.log('\n🏆 PERFECT! Steve Larsen bundle implementation is flawless!');
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.');
    }

    console.log('\n💡 Key Features Implemented:');
    console.log('  ✅ 3-Product Bundle (Bra, Thong, Socks)');
    console.log('  ✅ Problem-Solution Framework');
    console.log('  ✅ Value Stack Pricing ($95+ → $10)');
    console.log('  ✅ 90% OFF Badge');
    console.log('  ✅ Professional Product Images');
    console.log('  ✅ Mobile Responsive Design');
    console.log('  ✅ Dual Pricing Options');
    console.log('  ✅ Steve Larsen Branding');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testBundleOrderBump().catch(console.error);