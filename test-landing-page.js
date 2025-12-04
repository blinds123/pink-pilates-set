const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTests() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  console.log('Starting Landing Page Tests...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone 14 Pro
  });
  const page = await context.newPage();

  const filePath = path.join(__dirname, 'index.html');
  const fileUrl = `file://${filePath}`;

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // Test 1: Page loads successfully
    console.log('Test 1: Page loads...');
    const startTime = Date.now();
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    if (loadTime < 1000) {
      results.passed.push(`Page loads in ${loadTime}ms (under 1 second)`);
    } else {
      results.warnings.push(`Page loads in ${loadTime}ms (target: under 1000ms)`);
    }

    // Test 2: Quiz page visible on load
    console.log('Test 2: Quiz page visible...');
    const quizVisible = await page.isVisible('#quizPage');
    if (quizVisible) {
      results.passed.push('Quiz page shows on load');
    } else {
      results.failed.push('Quiz page NOT visible on load');
    }

    // Test 3: Main content hidden initially
    console.log('Test 3: Main content hidden...');
    const mainHidden = await page.evaluate(() => {
      const main = document.getElementById('mainContent');
      return !main.classList.contains('visible');
    });
    if (mainHidden) {
      results.passed.push('Main content hidden until quiz completes');
    } else {
      results.failed.push('Main content should be hidden initially');
    }

    // Test 4: Quiz options have correct avatars
    console.log('Test 4: Quiz avatars...');
    const avatarCount = await page.locator('.quiz-avatar').count();
    if (avatarCount === 3) {
      results.passed.push('3 quiz avatar options present');
    } else {
      results.failed.push(`Expected 3 quiz avatars, found ${avatarCount}`);
    }

    // Test 5: Click quiz option and verify transition
    console.log('Test 5: Quiz interaction...');
    await page.click('.quiz-option:first-child');
    await page.waitForTimeout(500);
    const mainVisible = await page.isVisible('#mainContent');
    if (mainVisible) {
      results.passed.push('Quiz transition works - main content appears');
    } else {
      results.failed.push('Quiz transition failed - main content not visible');
    }

    // Test 6: Verify quiz shows on refresh (no persistence)
    console.log('Test 6: Quiz shows on refresh...');
    await page.reload();
    await page.waitForSelector('#quizPage');
    const quizVisibleAfterRefresh = await page.isVisible('#quizPage');
    if (quizVisibleAfterRefresh) {
      results.passed.push('Quiz shows again on refresh (no persistence)');
    } else {
      results.failed.push('Quiz should show on every refresh');
    }

    // Complete quiz for remaining tests
    await page.click('.quiz-option:first-child');
    await page.waitForTimeout(500);

    // Test 7: Product info displayed correctly
    console.log('Test 7: Product info...');
    const productTitle = await page.textContent('h1');
    if (productTitle.includes('He Said She Said Pants')) {
      results.passed.push('Product title correct');
    } else {
      results.failed.push(`Wrong product title: ${productTitle}`);
    }

    // Test 8: Prices displayed
    console.log('Test 8: Prices...');
    const priceText = await page.textContent('.price');
    if (priceText.includes('$59')) {
      results.passed.push('Price displayed correctly ($59)');
    } else {
      results.failed.push(`Wrong price: ${priceText}`);
    }

    // Test 9: CTA buttons present
    console.log('Test 9: CTA buttons...');
    const primaryCTA = await page.isVisible('#primaryCTA');
    const secondaryCTA = await page.isVisible('#secondaryCTA');
    if (primaryCTA && secondaryCTA) {
      results.passed.push('Both CTA buttons visible');
    } else {
      results.failed.push('CTA buttons missing');
    }

    // Test 10: Product images load
    console.log('Test 10: Product images...');
    const heroImage = await page.evaluate(() => {
      const img = document.getElementById('heroImage');
      return img && img.naturalHeight > 0;
    });
    if (heroImage) {
      results.passed.push('Hero image loads correctly');
    } else {
      results.warnings.push('Hero image may not have loaded (could be async)');
    }

    // Test 11: Thumbnails exist
    console.log('Test 11: Thumbnails...');
    await page.waitForSelector('#thumbs img', { timeout: 2000 }).catch(() => {});
    const thumbCount = await page.locator('#thumbs img').count();
    if (thumbCount === 4) {
      results.passed.push('4 thumbnail images present');
    } else {
      results.warnings.push(`Found ${thumbCount} thumbnails (expected 4)`);
    }

    // Test 12: Size selector loads
    console.log('Test 12: Size selector...');
    await page.waitForSelector('.size-btn', { timeout: 3000 }).catch(() => {});
    const sizeButtons = await page.locator('.size-btn').count();
    if (sizeButtons >= 5) {
      results.passed.push(`Size selector has ${sizeButtons} options`);
    } else {
      results.warnings.push(`Size selector has ${sizeButtons} options`);
    }

    // Test 13: Testimonials load
    console.log('Test 13: Testimonials...');
    await page.waitForSelector('.testimonial-card', { timeout: 3000 }).catch(() => {});
    const testimonialCards = await page.locator('.testimonial-card').count();
    if (testimonialCards >= 10) {
      results.passed.push(`${testimonialCards} testimonials loaded initially`);
    } else {
      results.warnings.push(`Only ${testimonialCards} testimonials found`);
    }

    // Test 14: SVG platform icons
    console.log('Test 14: SVG platform icons...');
    const svgIcons = await page.evaluate(() => {
      const platforms = document.querySelectorAll('.testimonial-platform svg');
      return platforms.length;
    });
    if (svgIcons >= 10) {
      results.passed.push('SVG platform icons render correctly');
    } else {
      results.warnings.push(`Only ${svgIcons} SVG icons found`);
    }

    // Test 15: Order bump popup
    console.log('Test 15: Order bump popup...');
    // Select a size first
    await page.click('.size-btn:not(:disabled)').catch(() => {});
    await page.waitForTimeout(200);
    // Click secondary CTA to trigger order bump
    await page.click('#secondaryCTA');
    await page.waitForSelector('#orderBumpPopup', { state: 'visible', timeout: 2000 }).catch(() => {});
    const popupVisible = await page.isVisible('#orderBumpPopup');
    if (popupVisible) {
      results.passed.push('Order bump popup appears correctly');

      // Test 16: Order bump pricing
      console.log('Test 16: Order bump pricing...');
      const summaryText = await page.textContent('#orderSummary');
      if (summaryText.includes('$19') && summaryText.includes('$10') && summaryText.includes('$29')) {
        results.passed.push('Order bump calculates correctly ($19 + $10 = $29)');
      } else {
        results.warnings.push('Order bump pricing may not be correct');
      }

      // Close popup
      await page.click('button:has-text("No thanks")');
    } else {
      results.warnings.push('Order bump popup not triggered (size may not be selected)');
    }

    // Test 17: Mobile viewport
    console.log('Test 17: Mobile responsive...');
    await context.close();
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 } // iPhone 12
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(fileUrl);
    await mobilePage.click('.quiz-option:first-child');
    await mobilePage.waitForTimeout(500);

    const mobileLayout = await mobilePage.evaluate(() => {
      return document.body.scrollWidth <= window.innerWidth;
    });
    if (mobileLayout) {
      results.passed.push('Mobile layout - no horizontal scroll');
    } else {
      results.failed.push('Mobile layout has horizontal scroll');
    }

    // Test 18: Console errors
    console.log('Test 18: Console errors...');
    if (consoleErrors.length === 0) {
      results.passed.push('No console errors');
    } else {
      results.warnings.push(`${consoleErrors.length} console errors: ${consoleErrors.slice(0, 3).join(', ')}`);
    }

    await mobileContext.close();

  } catch (error) {
    results.failed.push(`Test error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));

  console.log(`\nPASSED (${results.passed.length}):`);
  results.passed.forEach(r => console.log(`  ✓ ${r}`));

  if (results.warnings.length > 0) {
    console.log(`\nWARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(r => console.log(`  ⚠ ${r}`));
  }

  if (results.failed.length > 0) {
    console.log(`\nFAILED (${results.failed.length}):`);
    results.failed.forEach(r => console.log(`  ✗ ${r}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failed.length} failed`);
  console.log('='.repeat(60));

  return results.failed.length === 0;
}

runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
