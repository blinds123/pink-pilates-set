#!/usr/bin/env python3
"""
Verify all fixes on local server before deploying
"""

import asyncio
from playwright.async_api import async_playwright
import json

async def verify_fixes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )

        page = await context.new_page()

        print("🔍 Verifying fixes on local server...")
        print("📍 URL: http://localhost:8080")

        # Test local server
        try:
            await page.goto("http://localhost:8080", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            print("✅ Local server loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load local server: {e}")
            # Try loading file directly
            await page.goto("file:///Users/nelsonchan/Downloads/pink ballet wrap/index.html", wait_until='networkidle')
            await page.wait_for_timeout(3000)

        # 1. Verify Accordion
        print("\n1️⃣ Checking Accordion...")
        accordion = await page.query_selector('.product-accordion-section')
        if accordion:
            print("   ✅ Product accordion section found")

            # Check for tabs
            tabs = await accordion.query_selector_all('.accordion-item')
            print(f"   ✅ Found {len(tabs)} accordion items")

            # Test clicking on tabs
            for i, tab in enumerate(tabs):
                tab_name = await tab.get_attribute('data-tab')
                if tab_name:
                    trigger = await tab.query_selector('.accordion-trigger')
                    if trigger:
                        await trigger.click()
                        await page.wait_for_timeout(300)
                        content = await tab.query_selector('.accordion-content')
                        if content:
                            is_open = await content.evaluate('el => el.style.maxHeight !== "0" && el.style.maxHeight !== ""')
                            print(f"   ✅ Tab '{tab_name}' clickable and opens: {is_open}")
        else:
            print("   ❌ Product accordion not found")

        # 2. Verify Celebrity Images
        print("\n2️⃣ Checking Celebrity Images...")
        worn_images = await page.query_selector_all('.celebrity-card img, .worn-by-favorites img')
        loaded_count = 0
        for img in worn_images:
            src = await img.get_attribute('src')
            if src and 'worn-by-favorites' in src:
                loaded_count += 1
        print(f"   ✅ Found {loaded_count} celebrity images from worn-by-favorites directory")

        # 3. Verify Mobile
        print("\n3️⃣ Checking Mobile...")
        mobile_context = await browser.new_context(
            viewport={'width': 375, 'height': 812},
            is_mobile=True
        )
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto("file:///Users/nelsonchan/Downloads/pink ballet wrap/index.html", wait_until='networkidle')

        # Check mobile menu
        mobile_menu = await mobile_page.query_selector('.mobile-menu-toggle')
        if mobile_menu:
            print("   ✅ Mobile menu toggle found")

            # Test menu toggle
            await mobile_menu.click()
            await mobile_page.wait_for_timeout(300)
            nav = await mobile_page.query_selector('nav.active')
            if nav:
                print("   ✅ Mobile menu opens correctly")
        else:
            print("   ⚠️  Mobile menu not found")

        # Check size selector on mobile
        size_selector = await mobile_page.query_selector('#size-selector')
        if size_selector:
            size_buttons = await size_selector.query_selector_all('.size-btn')
            print(f"   ✅ Size selector with {len(size_buttons)} sizes found")

        await mobile_context.close()

        # 4. Verify Fashion Elements
        print("\n4️⃣ Checking Fashion Elements...")
        elements = {
            'size_selector': await page.query_selector('#size-selector'),
            'add_to_cart': await page.query_selector('button[onclick*="addToCart"]'),
            'buy_now': await page.query_selector('button[onclick*="buyNow"]'),
            'price': await page.query_selector('.price, [data-price]'),
        }

        for name, element in elements.items():
            if element:
                print(f"   ✅ {name.replace('_', ' ').title()} found")
            else:
                print(f"   ❌ {name.replace('_', ' ').title()} not found")

        print("\n✅ Verification complete!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_fixes())