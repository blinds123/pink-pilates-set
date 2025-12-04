const puppeteer = require('puppeteer');
const fs = require('fs');

const SITE_URL = 'https://pink-pilates-set.netlify.app';
const SCREENSHOT_DIR = '/Users/nelsonchan/Downloads/pink ballet wrap/test-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function detailedInspection() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('🔍 DETAILED SITE INSPECTION\n');
    console.log('=' .repeat(70));

    // DESKTOP INSPECTION
    const desktop = await browser.newPage();
    await desktop.setViewport({ width: 1200, height: 900 });
    await desktop.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await wait(3000);

    console.log('\n📊 DESKTOP (1200px) ANALYSIS:\n');

    // Check what images are actually loading
    const imageAnalysis = await desktop.evaluate(() => {
        const allImages = Array.from(document.querySelectorAll('img'));
        const results = {
            total: allImages.length,
            loaded: 0,
            broken: 0,
            brokenList: []
        };

        allImages.forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                results.loaded++;
            } else {
                results.broken++;
                results.brokenList.push({
                    src: img.src,
                    alt: img.alt,
                    class: img.className
                });
            }
        });

        return results;
    });

    console.log(`Images Status:`);
    console.log(`  Total images: ${imageAnalysis.total}`);
    console.log(`  Loaded: ${imageAnalysis.loaded}`);
    console.log(`  Broken: ${imageAnalysis.broken}`);
    if (imageAnalysis.broken > 0) {
        console.log(`\n  Broken images:`);
        imageAnalysis.brokenList.forEach((img, i) => {
            console.log(`    ${i + 1}. ${img.src}`);
            console.log(`       Class: ${img.class}`);
            console.log(`       Alt: ${img.alt}\n`);
        });
    }

    // Check buttons and CTAs
    const buttonAnalysis = await desktop.evaluate(() => {
        const buttons = {
            ctaPrimary: Array.from(document.querySelectorAll('.cta-primary')).length,
            ctaSecondary: Array.from(document.querySelectorAll('.cta-secondary')).length,
            ctaBtn: Array.from(document.querySelectorAll('.cta-btn')).length,
            loadMoreBtn: document.getElementById('loadMoreBtn') !== null,
            allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
                text: btn.textContent.trim().substring(0, 50),
                class: btn.className,
                id: btn.id
            }))
        };
        return buttons;
    });

    console.log(`\nButtons Found:`);
    console.log(`  .cta-primary: ${buttonAnalysis.ctaPrimary}`);
    console.log(`  .cta-secondary: ${buttonAnalysis.ctaSecondary}`);
    console.log(`  .cta-btn: ${buttonAnalysis.ctaBtn}`);
    console.log(`  #loadMoreBtn: ${buttonAnalysis.loadMoreBtn ? 'YES' : 'NO'}`);
    console.log(`\n  All buttons on page:`);
    buttonAnalysis.allButtons.forEach((btn, i) => {
        console.log(`    ${i + 1}. "${btn.text}"`);
        console.log(`       Class: ${btn.class}`);
        console.log(`       ID: ${btn.id || '(none)'}\n`);
    });

    // Check product gallery
    const galleryAnalysis = await desktop.evaluate(() => {
        const mainImage = document.getElementById('heroImage');
        const thumbsContainer = document.getElementById('thumbs');
        const thumbnails = thumbsContainer ? Array.from(thumbsContainer.querySelectorAll('img')) : [];

        return {
            hasMainImage: mainImage !== null,
            mainImageSrc: mainImage ? mainImage.src : null,
            hasThumbsContainer: thumbsContainer !== null,
            thumbnailCount: thumbnails.length,
            thumbnailSrcs: thumbnails.map(t => t.src)
        };
    });

    console.log(`\nProduct Gallery:`);
    console.log(`  Main image: ${galleryAnalysis.hasMainImage ? 'YES' : 'NO'}`);
    console.log(`  Main image src: ${galleryAnalysis.mainImageSrc}`);
    console.log(`  Thumbs container: ${galleryAnalysis.hasThumbsContainer ? 'YES' : 'NO'}`);
    console.log(`  Thumbnail count: ${galleryAnalysis.thumbnailCount}`);
    if (galleryAnalysis.thumbnailCount > 0) {
        console.log(`  Thumbnail sources:`);
        galleryAnalysis.thumbnailSrcs.forEach((src, i) => {
            console.log(`    ${i + 1}. ${src}`);
        });
    }

    // Check popup
    const popupAnalysis = await desktop.evaluate(() => {
        const popup = document.getElementById('orderBumpPopup');
        return {
            exists: popup !== null,
            display: popup ? window.getComputedStyle(popup).display : null,
            closeButton: document.querySelector('.close-popup') !== null
        };
    });

    console.log(`\nOrder Bump Popup:`);
    console.log(`  Popup exists: ${popupAnalysis.exists ? 'YES' : 'NO'}`);
    console.log(`  Initial display: ${popupAnalysis.display}`);
    console.log(`  Close button: ${popupAnalysis.closeButton ? 'YES' : 'NO'}`);

    // Test actual CTA flow
    console.log(`\n--- Testing Primary CTA Click Flow ---`);
    const ctaPrimary = await desktop.$('.cta-primary');
    if (ctaPrimary) {
        await ctaPrimary.click();
        await wait(1000);

        const popupState = await desktop.evaluate(() => {
            const popup = document.getElementById('orderBumpPopup');
            return {
                isVisible: popup ? window.getComputedStyle(popup).display !== 'none' : false,
                content: popup ? popup.textContent.substring(0, 200) : null
            };
        });

        console.log(`  Popup opened: ${popupState.isVisible ? 'YES' : 'NO'}`);
        if (popupState.isVisible) {
            await desktop.screenshot({ path: `${SCREENSHOT_DIR}/manual-desktop-popup-open.png` });
            console.log(`  Screenshot saved: manual-desktop-popup-open.png`);
        }

        // Close popup
        const closeBtn = await desktop.$('.close-popup');
        if (closeBtn) {
            await closeBtn.click();
            await wait(500);
        }
    }

    // Test size selection
    console.log(`\n--- Testing Size Selection ---`);
    const sizeButtons = await desktop.$$('.size-btn');
    console.log(`  Size buttons found: ${sizeButtons.length}`);
    if (sizeButtons.length > 0) {
        await sizeButtons[1].click();
        await wait(500);
        const selected = await desktop.$('.size-btn.selected');
        console.log(`  Selection works: ${selected ? 'YES' : 'NO'}`);
        await desktop.screenshot({ path: `${SCREENSHOT_DIR}/manual-desktop-size-selected.png` });
    }

    await desktop.screenshot({ path: `${SCREENSHOT_DIR}/manual-desktop-full-page.png`, fullPage: true });

    // MOBILE INSPECTION
    console.log('\n' + '=' .repeat(70));
    console.log('\n📱 MOBILE (375px) ANALYSIS:\n');

    const mobile = await browser.newPage();
    await mobile.setViewport({ width: 375, height: 667 });
    await mobile.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await wait(3000);

    // Check responsive layout
    const mobileLayout = await mobile.evaluate(() => {
        const body = document.body;
        const container = document.querySelector('.container');
        return {
            bodyWidth: body.scrollWidth,
            viewportWidth: window.innerWidth,
            hasHorizontalScroll: body.scrollWidth > window.innerWidth,
            containerWidth: container ? container.offsetWidth : null
        };
    });

    console.log(`Layout Check:`);
    console.log(`  Viewport width: ${mobileLayout.viewportWidth}px`);
    console.log(`  Body scroll width: ${mobileLayout.bodyWidth}px`);
    console.log(`  Horizontal scroll: ${mobileLayout.hasHorizontalScroll ? 'YES (BAD)' : 'NO (GOOD)'}`);

    // Check button sizes for touch
    const touchTargets = await mobile.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .cta-btn'));
        const tooSmall = [];
        const okSize = [];

        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const size = { width: rect.width, height: rect.height };
            const info = {
                text: btn.textContent.trim().substring(0, 30),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            };

            if (rect.width < 44 || rect.height < 44) {
                tooSmall.push(info);
            } else {
                okSize.push(info);
            }
        });

        return { tooSmall, okSize };
    });

    console.log(`\nTouch Targets:`);
    console.log(`  Buttons with good size (44px+): ${touchTargets.okSize.length}`);
    console.log(`  Buttons too small: ${touchTargets.tooSmall.length}`);
    if (touchTargets.tooSmall.length > 0) {
        console.log(`  Small buttons:`);
        touchTargets.tooSmall.forEach((btn, i) => {
            console.log(`    ${i + 1}. "${btn.text}" - ${btn.width}x${btn.height}px`);
        });
    }

    await mobile.screenshot({ path: `${SCREENSHOT_DIR}/manual-mobile-full-page.png`, fullPage: true });

    // Test mobile popup
    const mobileCTA = await mobile.$('.cta-primary');
    if (mobileCTA) {
        await mobileCTA.tap();
        await wait(1000);

        const popupFits = await mobile.evaluate(() => {
            const popup = document.querySelector('.popup-content');
            if (!popup) return false;
            const rect = popup.getBoundingClientRect();
            return {
                fits: rect.width <= window.innerWidth && rect.height <= window.innerHeight,
                popupWidth: rect.width,
                popupHeight: rect.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            };
        });

        console.log(`\nMobile Popup:`);
        console.log(`  Fits on screen: ${popupFits.fits ? 'YES' : 'NO'}`);
        console.log(`  Popup size: ${popupFits.popupWidth}x${popupFits.popupHeight}px`);
        console.log(`  Viewport: ${popupFits.viewportWidth}x${popupFits.viewportHeight}px`);

        await mobile.screenshot({ path: `${SCREENSHOT_DIR}/manual-mobile-popup.png` });
    }

    await browser.close();

    console.log('\n' + '=' .repeat(70));
    console.log('\n✅ Inspection complete. Screenshots saved to:');
    console.log(`   ${SCREENSHOT_DIR}/\n`);
}

detailedInspection().catch(console.error);
