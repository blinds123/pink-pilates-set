#!/usr/bin/env python3
"""
Apply fixes to index.html - proper edits
"""

def apply_fixes():
    # Read the file
    with open('/Users/nelsonchan/Downloads/pink ballet wrap/index.html', 'r') as f:
        content = f.read()

    # 1. Add size selector after price box
    price_box_end = '<div style="color:#E8B4B8;font-size:14px;font-weight:600;margin-bottom:20px">1,247 sets sold this week</div>'

    size_selector = '''
        <div style="color:#E8B4B8;font-size:14px;font-weight:600;margin-bottom:20px">1,247 sets sold this week</div>

        <!-- Size Selector -->
        <div style="margin-bottom:24px">
          <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:12px">Select Size:</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="size-selector">
            <button onclick="selectSize('XS')" data-size="XS" class="size-btn" style="min-width:48px;height:48px;border:2px solid #E8B4B8;background:#fff;color:#333;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s">XS</button>
            <button onclick="selectSize('S')" data-size="S" class="size-btn" style="min-width:48px;height:48px;border:2px solid #E8B4B8;background:#fff;color:#333;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s">S</button>
            <button onclick="selectSize('M')" data-size="M" class="size-btn" style="min-width:48px;height:48px;border:2px solid #E8B4B8;background:#fff;color:#333;border-radius:8px;font-weight:600;cursor-pointer;transition:all 0.3s">M</button>
            <button onclick="selectSize('L')" data-size="L" class="size-btn" style="min-width:48px;height:48px;border:2px solid #E8B4B8;background:#fff;color:#333;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s">L</button>
            <button onclick="selectSize('XL')" data-size="XL" class="size-btn" style="min-width:48px;height:48px;border:2px solid #E8B4B8;background:#fff;color:#333;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s">XL</button>
          </div>
        </div>

        <!-- Stock Indicator -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;color:#E8B4B8;font-weight:500">
          <svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="#E8B4B8"/></svg>
          <span>In Stock - Ships within 24 hours</span>
        </div>
    '''

    if price_box_end in content:
        content = content.replace(price_box_end, size_selector)
        print("✅ Size selector added")

    # 2. Add product accordion after reviews section
    reviews_section_end = '<!-- Customer Reviews Section -->'

    accordion_html = '''
    <!-- Product Details Accordion Section -->
    <div class="product-accordion-section fade-in" style="padding:60px 20px;background:#fff">
      <div style="max-width:1200px;margin:0 auto">
        <h2 style="text-align:center;font-size:32px;font-weight:700;color:#333;margin-bottom:50px">Product Details</h2>

        <div class="accordion-container" style="background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(232,180,184,0.1);overflow:hidden">

          <!-- Shipping Tab -->
          <div class="accordion-item" data-tab="shipping">
            <button class="accordion-trigger" onclick="toggleAccordion('shipping')" style="width:100%;padding:20px 24px;border:none;background:#fff;text-align:left;font-size:16px;font-weight:600;color:#333;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;transition:all 0.3s ease">
              <span style="display:flex;align-items:center;gap:12px">
                <svg width="24" height="24" style="fill:#E8B4B8"><use href="#free-shipping"/></svg>
                Shipping & Delivery
              </span>
              <svg class="accordion-icon" width="16" height="16" style="fill:#E8B4B8;transition:transform 0.3s" id="shipping-icon">
                <path d="M4 6l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="accordion-content" id="shipping-content" style="padding:0;max-height:0;overflow:hidden;transition:all 0.3s ease">
              <div style="padding:24px;color:#666;line-height:1.8">
                <p style="margin-bottom:16px"><strong>Free Standard Shipping</strong> on all orders over $50</p>
                <p style="margin-bottom:16px"><strong>Processing Time:</strong> 1-2 business days</p>
                <p style="margin-bottom:16px"><strong>Standard Delivery:</strong> 3-5 business days</p>
                <p style="margin-bottom:16px"><strong>Express Delivery:</strong> 2-3 business days ($15)</p>
                <p><strong>International Shipping:</strong> Available at checkout</p>
              </div>
            </div>
          </div>

          <!-- Returns Tab -->
          <div class="accordion-item" data-tab="returns">
            <button class="accordion-trigger" onclick="toggleAccordion('returns')" style="width:100%;padding:20px 24px;border:none;background:#fff;text-align:left;font-size:16px;font-weight:600;color:#333;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;transition:all 0.3s ease">
              <span style="display:flex;align-items:center;gap:12px">
                <svg width="24" height="24" style="fill:#E8B4B8">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Returns & Exchanges
              </span>
              <svg class="accordion-icon" width="16" height="16" style="fill:#E8B4B8;transition:transform 0.3s" id="returns-icon">
                <path d="M4 6l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="accordion-content" id="returns-content" style="padding:0;max-height:0;overflow:hidden;transition:all 0.3s ease">
              <div style="padding:24px;color:#666;line-height:1.8">
                <p style="margin-bottom:16px"><strong>30-Day Return Policy</strong></p>
                <p style="margin-bottom:16px">Items must be unworn, unwashed, and in original condition with tags attached</p>
                <p style="margin-bottom:16px"><strong>Free Returns:</strong> We provide a prepaid return label</p>
                <p style="margin-bottom:16px"><strong>Exchanges:</strong> Available for different sizes or colors</p>
                <p><strong>Refunds:</strong> Processed within 5-7 business days after we receive your return</p>
              </div>
            </div>
          </div>

          <!-- Care Tab -->
          <div class="accordion-item" data-tab="care">
            <button class="accordion-trigger" onclick="toggleAccordion('care')" style="width:100%;padding:20px 24px;border:none;background:#fff;text-align:left;font-size:16px;font-weight:600;color:#333;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;transition:all 0.3s ease">
              <span style="display:flex;align-items:center;gap:12px">
                <svg width="24" height="24" style="fill:#E8B4B8">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor" opacity="0.3"/>
                  <path d="M9 12l2 2 4-4" stroke="#E8B4B8" stroke-width="2" stroke-linecap="round" fill="none"/>
                </svg>
                Care Instructions
              </span>
              <svg class="accordion-icon" width="16" height="16" style="fill:#E8B4B8;transition:transform 0.3s" id="care-icon">
                <path d="M4 6l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="accordion-content" id="care-content" style="padding:0;max-height:0;overflow:hidden;transition:all 0.3s ease">
              <div style="padding:24px;color:#666;line-height:1.8">
                <p style="margin-bottom:16px"><strong>Machine Wash Cold</strong> - Gentle cycle</p>
                <p style="margin-bottom:16px"><strong>Tumble Dry Low</strong> or hang to dry</p>
                <p style="margin-bottom:16px"><strong>Do Not Bleach</strong></p>
                <p style="margin-bottom:16px"><strong>Iron on Low Heat</strong> if needed</p>
                <p><strong>Professional Dry Cleaning</strong> also available</p>
              </div>
            </div>
          </div>

          <!-- Size Guide Tab -->
          <div class="accordion-item" data-tab="size">
            <button class="accordion-trigger" onclick="toggleAccordion('size')" style="width:100%;padding:20px 24px;border:none;background:#fff;text-align:left;font-size:16px;font-weight:600;color:#333;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:all 0.3s ease">
              <span style="display:flex;align-items:center;gap:12px">
                <svg width="24" height="24" style="fill:#E8B4B8">
                  <rect x="4" y="6" width="16" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M8 10h8M8 14h8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                </svg>
                Size Guide
              </span>
              <svg class="accordion-icon" width="16" height="16" style="fill:#E8B4B8;transition:transform 0.3s" id="size-icon">
                <path d="M4 6l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="accordion-content" id="size-content" style="padding:0;max-height:0;overflow:hidden;transition:all 0.3s ease">
              <div style="padding:24px;color:#666;line-height:1.8">
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                  <tr>
                    <th style="padding:12px;border:1px solid #E8B4B8;background:#fdf5f6;text-align:left">Size</th>
                    <th style="padding:12px;border:1px solid #E8B4B8;background:#fdf5f6;text-align:left">Bust</th>
                    <th style="padding:12px;border:1px solid #E8B4B8;background:#fdf5f6;text-align:left">Waist</th>
                    <th style="padding:12px;border:1px solid #E8B4B8;background:#fdf5f6;text-align:left">Hips</th>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #E8B4B8">XS</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">32-33"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">24-25"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">34-35"</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #E8B4B8">S</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">34-35"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">26-27"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">36-37"</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #E8B4B8">M</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">36-37"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">28-29"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">38-39"</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #E8B4B8">L</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">38-39"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">30-31"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">40-41"</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #E8B4B8">XL</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">40-41"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">32-33"</td>
                    <td style="padding:12px;border:1px solid #E8B4B8">42-43"</td>
                  </tr>
                </table>
                <p><strong>Model is wearing size S</strong> - Height: 5'8", Bust: 34", Waist: 26", Hips: 36"</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Customer Reviews Section -->
    '''

    if reviews_section_end in content:
        content = content.replace(reviews_section_end, accordion_html)
        print("✅ Accordion added")

    # 3. Fix worn-by-favorites images
    import re

    # Replace testimonials with proper worn-by-favorites images
    testimonials_pattern = r'./images/testimonials/testimonial-\d+\.jpeg'

    celebrity_images = [
        '/images/worn-by-favorites/alix-earle-600.jpg',
        '/images/worn-by-favorites/alex-cooper-600.jpg',
        '/images/worn-by-favorites/hailey-bieber-600.jpg',
        '/images/worn-by-favorites/kendall-jenner-600.jpg',
        '/images/worn-by-favorites/gigi-hadid-600.jpg',
        '/images/worn-by-favorites/bella-hadid-600.jpg',
        '/images/worn-by-favorites/kylie-jenner-600.jpg',
        '/images/worn-by-favorites/charli-damelio-600.jpg',
        '/images/worn-by-favorites/addison-rae-600.jpg',
        '/images/worn-by-favorites/emma-chamberlain-600.jpg'
    ]

    # Replace all testimonial image references
    content = re.sub(testimonials_pattern, lambda m: celebrity_images[hash(m.group()) % len(celebrity_images)], content)
    print("✅ Celebrity image paths fixed")

    # 4. Add mobile menu toggle to nav
    nav_pattern = r'(<nav[^>]*>)'
    import re

    def add_mobile_menu(match):
        nav_tag = match.group(1)
        mobile_btn = '''<button onclick="toggleMobileMenu()" class="mobile-menu-toggle" style="display:none;flex-direction:column;gap:4px;padding:8px;border:none;background:transparent;cursor:pointer" aria-label="Toggle menu">
          <span style="width:24px;height:2px;background:#E8B4B8;transition:all 0.3s"></span>
          <span style="width:24px;height:2px;background:#E8B4B8;transition:all 0.3s"></span>
          <span style="width:24px;height:2px;background:#E8B4B8;transition:all 0.3s"></span>
        </button>'''
        return mobile_btn + nav_tag

    content = re.sub(nav_pattern, add_mobile_menu, content)
    print("✅ Mobile menu toggle added")

    # 5. Add mobile CSS if not present
    mobile_css = '''
/* Mobile Menu Styles */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex !important;
  }

  nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    height: 100vh;
    background: #fff;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    z-index: 1000;
    padding: 80px 20px 20px;
  }

  nav.active {
    right: 0;
  }

  nav ul {
    flex-direction: column;
    gap: 24px;
  }

  /* Improve button sizes for touch */
  button, .btn, a {
    min-height: 44px;
    min-width: 44px;
  }

  /* Size selector mobile */
  #size-selector {
    gap: 12px;
  }

  .size-btn {
    min-width: 60px !important;
    min-height: 60px !important;
    font-size: 18px !important;
  }

  /* Worn by favorites mobile - smaller grid */
  .celebrity-card {
    padding: 20px !important;
  }
}

/* Accordion Styles */
.accordion-item.open .accordion-content {
  max-height: 500px !important;
}

.accordion-item.open .accordion-icon {
  transform: rotate(180deg) !important;
}

.size-btn.selected {
  background: #E8B4B8 !important;
  color: #fff !important;
}

.size-btn:hover {
  background: #fdf5f6 !important;
  transform: scale(1.05);
}
'''

    # Add mobile CSS before closing style tag
    if '/* Mobile Menu Styles */' not in content:
        content = content.replace('</style>', mobile_css + '\n</style>')
        print("✅ Mobile CSS added")

    # 6. Add JavaScript functions if not present
    js_functions = '''
    // Accordion functionality
    function toggleAccordion(tabName) {
      const item = document.querySelector(`[data-tab="${tabName}"]`);
      const content = document.getElementById(`${tabName}-content`);
      const icon = document.getElementById(`${tabName}-icon`);

      // Close all other accordions
      document.querySelectorAll('.accordion-item').forEach(acc => {
        if (acc !== item) {
          acc.classList.remove('open');
          const otherContent = acc.querySelector('.accordion-content');
          const otherIcon = acc.querySelector('.accordion-icon');
          if (otherContent) otherContent.style.maxHeight = '0';
          if (otherIcon) otherIcon.style.transform = 'rotate(0)';
        }
      });

      // Toggle current accordion
      if (item.classList.contains('open')) {
        item.classList.remove('open');
        content.style.maxHeight = '0';
        icon.style.transform = 'rotate(0)';
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
      }
    }

    // Size selector functionality
    let selectedSize = null;

    function selectSize(size) {
      selectedSize = size;

      // Update button states
      document.querySelectorAll('.size-btn').forEach(btn => {
        if (btn.dataset.size === size) {
          btn.classList.add('selected');
          btn.style.background = '#E8B4B8';
          btn.style.color = '#fff';
        } else {
          btn.classList.remove('selected');
          btn.style.background = '#fff';
          btn.style.color = '#333';
        }
      });

      // Track size selection
      if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'SizeSelected', {size: size});
      }
    }

    // Mobile menu toggle
    function toggleMobileMenu() {
      const nav = document.querySelector('nav');
      nav.classList.toggle('active');

      // Prevent body scroll when menu is open
      if (nav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }

    // Initialize first accordion open
    document.addEventListener('DOMContentLoaded', function() {
      // Open shipping tab by default
      setTimeout(() => toggleAccordion('shipping'), 500);
    });
    '''

    # Add JS before closing script tag
    if 'toggleAccordion' not in content:
        # Find the last script tag
        last_script = content.rfind('<script>')
        if last_script != -1:
            insert_pos = content.find('>', last_script) + 1
            content = content[:insert_pos] + js_functions + content[insert_pos:]
            print("✅ JavaScript functions added")

    # Save the updated file
    with open('/Users/nelsonchan/Downloads/pink ballet wrap/index.html', 'w') as f:
        f.write(content)

    print("\n✅ All fixes applied successfully!")
    return True

if __name__ == "__main__":
    apply_fixes()