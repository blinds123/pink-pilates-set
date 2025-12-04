#!/usr/bin/env python3
"""
Comprehensive Playwright audit for Pink Pilates Set landing page
Checks accordion, worn by favorites images, mobile optimization, and fashion layout
"""

import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime

class PinkPilatesAudit:
    def __init__(self):
        self.base_url = "https://pink-pilates-set.netlify.app"
        self.issues = []
        self.screenshots = {}

    async def run_audit(self):
        """Run comprehensive audit"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )

            page = await context.new_page()

            print("🔍 Starting comprehensive audit of Pink Pilates Set...")
            print(f"📍 URL: {self.base_url}")
            print()

            # Navigate to site
            try:
                await page.goto(self.base_url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                print("✅ Site loaded successfully")
            except Exception as e:
                print(f"❌ Failed to load site: {e}")
                return

            # 1. Check Accordion Section
            print("\n1️⃣ CHECKING ACCORDION SECTION...")
            await self.check_accordion(page)

            # 2. Check "Worn by Favorites" Images
            print("\n2️⃣ CHECKING 'WORN BY FAVORITES' IMAGES...")
            await self.check_worn_by_favorites(page)

            # 3. Check Mobile Optimization
            print("\n3️⃣ CHECKING MOBILE OPTIMIZATION...")
            await self.check_mobile_optimization(browser)

            # 4. Check Fashion Product Layout
            print("\n4️⃣ CHECKING FASHION PRODUCT LAYOUT...")
            await self.check_fashion_layout(page)

            # 5. Generate report
            print("\n5️⃣ GENERATING AUDIT REPORT...")
            await self.generate_report()

            await browser.close()

    async def check_accordion(self, page):
        """Check product details accordion and tabs"""
        try:
            # Look for accordion section
            accordion = await page.query_selector('.product-details, .accordion, .tabs-section, [data-testid*="accordion"], [data-testid*="tabs"]')
            if not accordion:
                accordion = await page.query_selector('details, .faq-section, .product-info')

            if accordion:
                print("   ✅ Accordion/Tabs section found")

                # Check for tabs
                tabs = await page.query_selector_all('[role="tab"], .tab, .tab-button, .accordion-trigger')
                if tabs:
                    print(f"   ✅ Found {len(tabs)} tab(s)")

                    # Check specific tabs
                    expected_tabs = ['Shipping', 'Returns', 'Care', 'Size Guide']
                    found_tabs = []

                    for tab in tabs:
                        tab_text = await tab.text_content()
                        if tab_text:
                            tab_text = tab_text.strip()
                            found_tabs.append(tab_text)
                            print(f"   📋 Tab: {tab_text}")

                    missing_tabs = [t for t in expected_tabs if t not in found_tabs]
                    if missing_tabs:
                        self.issues.append({
                            'type': 'accordion_missing_tabs',
                            'severity': 'high',
                            'description': f'Missing tabs: {missing_tabs}',
                            'missing_tabs': missing_tabs,
                            'found_tabs': found_tabs
                        })
                        print(f"   ❌ Missing tabs: {missing_tabs}")
                else:
                    print("   ⚠️  No tabs found in accordion section")
                    self.issues.append({
                        'type': 'accordion_no_tabs',
                        'severity': 'high',
                        'description': 'Accordion section found but no tabs'
                    })

                # Take screenshot
                await self.screenshot(page, 'accordion', 'Accordion section')

            else:
                print("   ❌ No accordion/tabs section found")
                self.issues.append({
                    'type': 'accordion_missing',
                    'severity': 'high',
                    'description': 'No product details accordion or tabs found'
                })

        except Exception as e:
            print(f"   ❌ Error checking accordion: {e}")
            self.issues.append({
                'type': 'accordion_error',
                'severity': 'high',
                'description': f'Error checking accordion: {e}'
            })

    async def check_worn_by_favorites(self, page):
        """Check 'Worn by Favorites' celebrity images"""
        try:
            # Look for worn by favorites section
            worn_section = await page.query_selector('.worn-by-favorites, .worn-by, .celebrity-section, .as-seen-on')
            if not worn_section:
                # Try to find by text
                elements = await page.query_selector_all('*')
                for el in elements:
                    text = await el.text_content()
                    if text and ('worn by' in text.lower() or 'favorites' in text.lower() or 'celebrity' in text.lower()):
                        worn_section = el
                        break

            if worn_section:
                print("   ✅ 'Worn by Favorites' section found")

                # Check for images in the section
                images = await worn_section.query_selector_all('img')
                print(f"   📸 Found {len(images)} images in section")

                broken_images = []
                loaded_images = []

                for i, img in enumerate(images):
                    src = await img.get_attribute('src')
                    alt = await img.get_attribute('alt')

                    # Check if image loads
                    is_visible = await img.is_visible()
                    natural_width = await img.evaluate('el => el.naturalWidth')

                    if src:
                        if not is_visible or natural_width == 0:
                            broken_images.append({
                                'index': i,
                                'src': src,
                                'alt': alt
                            })
                            print(f"   ❌ Broken image {i+1}: {src}")
                        else:
                            loaded_images.append({
                                'index': i,
                                'src': src,
                                'alt': alt
                            })
                            print(f"   ✅ Loaded image {i+1}: {src}")

                if broken_images:
                    self.issues.append({
                        'type': 'worn_by_broken_images',
                        'severity': 'high',
                        'description': f'{len(broken_images)} broken celebrity images',
                        'broken_images': broken_images,
                        'loaded_images': loaded_images
                    })

                # Take screenshot
                await self.screenshot(page, 'worn_by_favorites', 'Worn by Favorites section')

            else:
                print("   ❌ 'Worn by Favorites' section not found")
                self.issues.append({
                    'type': 'worn_by_missing',
                    'severity': 'high',
                    'description': 'No "Worn by Favorites" section found'
                })

        except Exception as e:
            print(f"   ❌ Error checking Worn by Favorites: {e}")
            self.issues.append({
                'type': 'worn_by_error',
                'severity': 'high',
                'description': f'Error checking Worn by Favorites: {e}'
            })

    async def check_mobile_optimization(self, browser):
        """Check mobile view at 375px width"""
        try:
            # Create mobile context
            mobile_context = await browser.new_context(
                viewport={'width': 375, 'height': 812},  # iPhone X dimensions
                user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
                is_mobile=True
            )

            mobile_page = await mobile_context.new_page()
            await mobile_page.goto(self.base_url, wait_until='networkidle')
            await mobile_page.wait_for_timeout(3000)

            print("   📱 Mobile view loaded")

            # Check for horizontal scroll
            body_width = await mobile_page.evaluate('document.body.scrollWidth')
            viewport_width = 375

            if body_width > viewport_width:
                print(f"   ❌ Horizontal scroll detected: {body_width}px > {viewport_width}px")
                self.issues.append({
                    'type': 'mobile_overflow',
                    'severity': 'high',
                    'description': f'Horizontal overflow: {body_width}px'
                })
            else:
                print("   ✅ No horizontal scroll")

            # Check worn by favorites on mobile
            worn_section = await mobile_page.query_selector('.worn-by-favorites, .worn-by')
            if worn_section:
                # Count visible images
                images = await worn_section.query_selector_all('img')
                visible_images = []
                for img in images:
                    if await img.is_visible():
                        visible_images.append(img)

                print(f"   📱 Mobile: {len(visible_images)} visible celebrity images")

                if len(visible_images) > 4:
                    print("   ⚠️  Too many images showing on mobile - should be 1-2 small rows")
                    self.issues.append({
                        'type': 'mobile_too_many_images',
                        'severity': 'medium',
                        'description': f'Too many celebrity images on mobile: {len(visible_images)}'
                    })

            # Take mobile screenshot
            await self.screenshot(mobile_page, 'mobile_view', 'Mobile view')

            # Check mobile-specific elements
            hamburger_menu = await mobile_page.query_selector('.hamburger, .mobile-menu, .menu-toggle')
            if hamburger_menu:
                print("   ✅ Mobile menu found")
            else:
                print("   ⚠️  No mobile menu detected")

            # Check tap targets (buttons, links)
            small_buttons = await mobile_page.query_selector_all('button, a, .btn')
            tiny_buttons = []
            for btn in small_buttons:
                box = await btn.bounding_box()
                if box and (box['height'] < 44 or box['width'] < 44):
                    tiny_buttons.append({
                        'tag': await mobile_page.evaluate('el => el.tagName', btn),
                        'text': await btn.text_content(),
                        'size': f"{box['width']}x{box['height']}"
                    })

            if tiny_buttons:
                print(f"   ⚠️  Found {len(tiny_buttons)} buttons smaller than 44px (iOS minimum)")

            await mobile_context.close()

        except Exception as e:
            print(f"   ❌ Error checking mobile: {e}")
            self.issues.append({
                'type': 'mobile_error',
                'severity': 'high',
                'description': f'Error checking mobile: {e}'
            })

    async def check_fashion_layout(self, page):
        """Check if it looks like a fashion/activewear product page"""
        try:
            print("   👗 Analyzing fashion product layout...")

            # Check for fashion-specific elements
            fashion_indicators = {
                'product_gallery': await page.query_selector('.product-gallery, .product-images, .main-image'),
                'product_price': await page.query_selector('.price, .product-price, [data-price]'),
                'size_selector': await page.query_selector('.size-selector, .variant-selector, .size-options'),
                'add_to_cart': await page.query_selector('.add-to-cart, .buy-now, .purchase-btn'),
                'product_description': await page.query_selector('.product-description, .details, .description'),
                'fashion_imaging': await page.query_selector('.model-image, .lifestyle-image, .product-shot'),
            }

            found_indicators = {k: v for k, v in fashion_indicators.items() if v}
            missing_indicators = {k: v for k, v in fashion_indicators.items() if not v}

            print(f"   ✅ Fashion indicators found: {len(found_indicators)}/{len(fashion_indicators)}")

            for indicator, element in found_indicators.items():
                print(f"      ✅ {indicator}")

            for indicator in missing_indicators:
                print(f"      ❌ {indicator}")

            # Check for tech-like elements (should NOT be present)
            tech_elements = await page.query_selector_all('.api-key, .endpoint, .documentation, .code-block, pre code')
            if tech_elements:
                print(f"   ⚠️  Found {len(tech_elements)} tech-like elements that shouldn't be on a fashion site")
                self.issues.append({
                    'type': 'fashion_tech_elements',
                    'severity': 'medium',
                    'description': f'Tech elements found on fashion site: {len(tech_elements)}'
                })

            # Check color scheme and typography
            pink_elements = await page.query_selector_all('[style*="pink"], [style*="#FF69B4"], [style*="#FF1493"], .pink')
            if pink_elements:
                print(f"   ✅ Found {len(pink_elements)} pink elements (good for Pilates brand)")
            else:
                print("   ⚠️  No pink elements found - could improve brand consistency")

            # Take full page screenshot for visual review
            await self.screenshot(page, 'full_page_fashion', 'Fashion layout review', full_page=True)

            if len(missing_indicators) > 2:
                self.issues.append({
                    'type': 'fashion_layout_incomplete',
                    'severity': 'high',
                    'description': f'Missing {len(missing_indicators)} fashion e-commerce elements',
                    'missing': list(missing_indicators.keys())
                })

        except Exception as e:
            print(f"   ❌ Error checking fashion layout: {e}")
            self.issues.append({
                'type': 'fashion_layout_error',
                'severity': 'high',
                'description': f'Error checking fashion layout: {e}'
            })

    async def screenshot(self, page, name, description, full_page=False):
        """Take and store screenshot"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"audit_{name}_{timestamp}.png"
            path = f"/Users/nelsonchan/Downloads/pink ballet wrap/{filename}"

            await page.screenshot(path=path, full_page=full_page)
            self.screenshots[name] = {
                'path': path,
                'description': description,
                'timestamp': timestamp
            }
            print(f"   📸 Screenshot saved: {filename}")

        except Exception as e:
            print(f"   ❌ Screenshot error: {e}")

    async def generate_report(self):
        """Generate audit report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'url': self.base_url,
            'issues': self.issues,
            'screenshots': self.screenshots,
            'summary': {
                'total_issues': len(self.issues),
                'critical_issues': len([i for i in self.issues if i['severity'] == 'high']),
                'medium_issues': len([i for i in self.issues if i['severity'] == 'medium']),
                'low_issues': len([i for i in self.issues if i['severity'] == 'low'])
            }
        }

        # Save report
        report_path = "/Users/nelsonchan/Downloads/pink ballet wrap/playwright_audit_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        print("\n" + "="*60)
        print("📊 AUDIT SUMMARY")
        print("="*60)
        print(f"Total Issues: {report['summary']['total_issues']}")
        print(f"Critical: {report['summary']['critical_issues']} 🔴")
        print(f"Medium: {report['summary']['medium_issues']} 🟡")
        print(f"Low: {report['summary']['low_issues']} 🟢")
        print()

        # Print issues by severity
        if self.issues:
            print("\n🔴 CRITICAL ISSUES:")
            for issue in [i for i in self.issues if i['severity'] == 'high']:
                print(f"   • {issue['description']}")

            print("\n🟡 MEDIUM ISSUES:")
            for issue in [i for i in self.issues if i['severity'] == 'medium']:
                print(f"   • {issue['description']}")

        print(f"\n📸 Screenshots saved: {len(self.screenshots)}")
        print(f"📄 Full report: {report_path}")
        print()

        # Generate fixes needed
        print("="*60)
        print("🔧 NEEDED FIXES")
        print("="*60)

        fixes_needed = []

        # Check for specific fixes
        accordion_issues = [i for i in self.issues if 'accordion' in i['type']]
        if accordion_issues:
            fixes_needed.append("1. Add/fix product accordion with Shipping, Returns, Care, and Size Guide tabs")

        worn_by_issues = [i for i in self.issues if 'worn_by' in i['type']]
        if worn_by_issues:
            fixes_needed.append("2. Fix Worn by Favorites section - add celebrity images and fix broken paths")

        mobile_issues = [i for i in self.issues if 'mobile' in i['type']]
        if mobile_issues:
            fixes_needed.append("3. Fix mobile overflow and optimize celebrity section for 375px width")

        fashion_issues = [i for i in self.issues if 'fashion' in i['type']]
        if fashion_issues:
            fixes_needed.append("4. Improve fashion e-commerce layout - add missing product elements")

        if not fixes_needed:
            print("✅ No critical fixes needed - site looks good!")
        else:
            for fix in fixes_needed:
                print(fix)

if __name__ == "__main__":
    audit = PinkPilatesAudit()
    asyncio.run(audit.run_audit())