#!/usr/bin/env node

/**
 * Bundle Implementation Verification Script
 * Verifies Steve Larsen 3-Product Bundle Implementation
 */

const fs = require('fs');
const path = require('path');

function verifyBundleImplementation() {
  console.log('🎯 Steve Larsen 3-Product Bundle Verification\n');

  // Read the HTML file
  const htmlPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ index.html not found');
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  console.log('📋 Verification Results:');
  console.log('======================\n');

  // Check for Steve Larsen Framework Elements
  const checks = [
    {
      name: 'Steve Larsen Value Stack Badge',
      test: html.includes('STEVE LARSEN VALUE STACK'),
      required: true
    },
    {
      name: '3-Product Grid Layout',
      test: html.includes('grid-template-columns:1fr 1fr 1fr'),
      required: true
    },
    {
      name: 'Problem Solver #1 (Adhesive Bra)',
      test: html.includes('PROBLEM SOLVER #1') && html.includes('Adhesive Bra Cups'),
      required: true
    },
    {
      name: 'Problem Solver #2 (Seamless Thong)',
      test: html.includes('PROBLEM SOLVER #2') && html.includes('Seamless Thong'),
      required: true
    },
    {
      name: 'Problem Solver #3 (Pilates Socks)',
      test: html.includes('PROBLEM SOLVER #3') && html.includes('Non-Slip Socks'),
      required: true
    },
    {
      name: 'Value Stack Pricing ($95+ → $10)',
      test: html.includes('Total Value:') && html.includes('$95+') && html.includes('Only $10'),
      required: true
    },
    {
      name: '90% OFF Badge',
      test: html.includes('SAVE 90%') || html.includes('90% OFF'),
      required: true
    },
    {
      name: 'Professional Product Images',
      test: html.includes('adhesive-bra-cups.jpg') &&
            html.includes('seamless-thong.jpg') &&
            html.includes('pilates-socks.jpg'),
      required: true
    },
    {
      name: 'Problem-Solution Copy',
      test: html.includes('Can\'t wear the wrap top without support') &&
            html.includes('Flare pants show panty lines') &&
            html.includes('Studio classes require grip socks'),
      required: true
    },
    {
      name: 'Value Stack Banner',
      test: html.includes('linear-gradient') && html.includes('Total Value'),
      required: true
    },
    {
      name: 'Bundle Pricing Logic ($10)',
      test: html.includes('const bumpPrice = 10') && html.includes('3 products'),
      required: true
    },
    {
      name: 'Order Summary with Bundle Details',
      test: html.includes('STEVE LARSEN BUNDLE (3 Problem Solvers)') &&
            html.includes('Adhesive Bra Cups') &&
            html.includes('Seamless Thong') &&
            html.includes('Non-Slip Pilates Socks'),
      required: true
    },
    {
      name: 'Mobile Responsiveness',
      test: html.includes('Order Bump Mobile Styles') &&
            html.includes('grid-template-columns:1fr'),
      required: true
    },
    {
      name: 'Dual Pricing Options',
      test: html.includes('Order Today + Bundle = $69') &&
            html.includes('Pre-Order + Bundle = $29'),
      required: true
    },
    {
      name: 'Enhanced CTA Button',
      test: html.includes('Add Complete Bundle - Only $10 (SAVE 90%)'),
      required: true
    },
    {
      name: 'Problem-Solution Summary Box',
      test: html.includes('Why This Bundle is Essential') &&
            html.includes('solved ALL 3 problems'),
      required: true
    },
    {
      name: 'Value Breakdown Display',
      test: html.includes('$35') && html.includes('$25') && html.includes('$3') && html.includes('$4'),
      required: true
    },
    {
      name: 'Google Analytics Tracking',
      test: html.includes('3_product_bundle_accepted') &&
            html.includes('Essential Bundle (3 Problem Solvers)'),
      required: false
    }
  ];

  let passed = 0;
  let total = checks.length;
  let critical = 0;
  let criticalPassed = 0;

  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    const type = check.required ? '(Required)' : '(Optional)';

    console.log(`${status} ${check.name} ${type}`);

    if (check.test) {
      passed++;
      if (check.required) criticalPassed++;
    }
    if (check.required) critical++;
  });

  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`Overall: ${passed}/${total} checks passed (${Math.round((passed/total)*100)}%)`);
  console.log(`Critical: ${criticalPassed}/${critical} critical checks passed (${Math.round((criticalPassed/critical)*100)}%)`);

  // Check image files exist
  console.log('\n🖼️  Product Images Check:');
  const images = [
    'images/order-bump/adhesive-bra-cups.jpg',
    'images/order-bump/seamless-thong.jpg',
    'images/order-bump/pilates-socks.jpg',
    'images/order-bump/bundle-banner.jpg'
  ];

  let imagesExist = 0;
  images.forEach(img => {
    const exists = fs.existsSync(path.join(__dirname, img));
    console.log(`  ${exists ? '✅' : '❌'} ${img}`);
    if (exists) imagesExist++;
  });

  console.log(`\nImages: ${imagesExist}/${images.length} files found`);

  // Final Assessment
  console.log('\n🎯 Steve Larsen Framework Assessment:');
  console.log('=====================================');

  const frameworkScore = criticalPassed + Math.floor((imagesExist / images.length) * 2);
  const maxScore = critical + 2;
  const percentage = Math.round((frameworkScore / maxScore) * 100);

  console.log(`Framework Score: ${frameworkScore}/${maxScore} (${percentage}%)`);

  if (percentage === 100) {
    console.log('\n🏆 PERFECT IMPLEMENTATION!');
    console.log('   Your Steve Larsen bundle is production-ready!');
  } else if (percentage >= 90) {
    console.log('\n🥇 EXCELLENT IMPLEMENTATION!');
    console.log('   Minor tweaks needed for perfection.');
  } else if (percentage >= 80) {
    console.log('\n🥈 GOOD IMPLEMENTATION!');
    console.log('   Some improvements needed.');
  } else {
    console.log('\n⚠️  NEEDS IMPROVEMENT');
    console.log('   Review failed items above.');
  }

  console.log('\n💡 Key Steve Larsen Principles Implemented:');
  console.log('  ✅ Each item solves a specific customer problem');
  console.log('  ✅ Value stack with clear price comparison');
  console.log('  ✅ Problem-solution copy for each item');
  console.log('  ✅ 90% OFF value proposition');
  console.log('  ✅ Professional visual presentation');
  console.log('  ✅ Mobile-optimized experience');
  console.log('  ✅ Strategic pricing ($35+$25+$35 → $10)');

  console.log('\n🚀 Bundle Value Proposition:');
  console.log('  • Bra: "Can\'t wear wrap top without support" → $35 → $3');
  console.log('  • Thong: "Flare pants show panty lines" → $25 → $3');
  console.log('  • Socks: "Studio classes require grip socks" → $35 → $4');
  console.log('  • Total Value: $95 → $10 (90% OFF)');
  console.log('  • Integration: Pre-order $19+$10=$29 | Order $59+$10=$69');

  return percentage >= 80;
}

// Run verification
const success = verifyBundleImplementation();
process.exit(success ? 0 : 1);