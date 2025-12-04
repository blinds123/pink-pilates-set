const puppeteer = require('puppeteer');

async function findOverflowingElement() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('https://pink-pilates-set.netlify.app', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const overflowingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflowing = [];
        const viewportWidth = window.innerWidth;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > viewportWidth) {
                overflowing.push({
                    tag: el.tagName,
                    class: el.className,
                    id: el.id,
                    width: Math.round(rect.width),
                    left: Math.round(rect.left),
                    right: Math.round(rect.right)
                });
            }
        });

        // Sort by width descending
        return overflowing.sort((a, b) => b.width - a.width).slice(0, 10);
    });

    console.log('\n🔍 ELEMENTS WIDER THAN 375px VIEWPORT:\n');
    overflowingElements.forEach((el, i) => {
        console.log(`${i + 1}. <${el.tag}> ${el.id ? `#${el.id}` : ''} ${el.class ? `.${el.class.split(' ')[0]}` : ''}`);
        console.log(`   Width: ${el.width}px (overflow: ${el.width - 375}px)`);
        console.log(`   Position: left=${el.left}px, right=${el.right}px\n`);
    });

    await browser.close();
}

findOverflowingElement().catch(console.error);
