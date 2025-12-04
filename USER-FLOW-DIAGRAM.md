# User Flow Diagram - pink-pilates-set.netlify.app

This document maps the complete user journey from landing to checkout, including all possible paths and their outcomes.

---

## Complete User Journey Map

```
┌─────────────────────────────────────┐
│  USER LANDS ON pink-pilates-set.netlify.app │
│         (Quiz Page Shows)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         QUIZ INTERACTION             │
│                                      │
│  Option 1: Click "Trendsetter"      │
│  Option 2: Click "Effortless Chic"  │
│  Option 3: Click "Bold & Confident" │
│  Option 4: Click "Skip for now"     │
└──────────────┬───────────────────────┘
               │
               │ All options lead to ▼
               │
┌──────────────────────────────────────┐
│      PRODUCT PAGE DISPLAYS           │
│                                      │
│  ✅ Hero image loads                 │
│  ✅ Quiz data stored (no persistence)│
│  ✅ Price shows: $59 / $19           │
│  ✅ Two CTA buttons visible          │
└──────────────┬───────────────────────┘
               │
               │ User scrolls ▼
               │
┌──────────────────────────────────────┐
│      SIZE SELECTOR APPEARS           │
│     (Lazy loaded on scroll)          │
│                                      │
│  Sizes: XXS, XS, S, M, L, XL, XXL   │
│  (XL and XXL shown as "Sold Out")   │
└──────────────┬───────────────────────┘
               │
               │ User selects size ▼
               │
┌──────────────────────────────────────┐
│    USER CLICKS CTA BUTTON            │
│         (Must select size first)     │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ PRIMARY CTA  │  │ SECONDARY CTA│
│ "Ship Today  │  │ "Pre-order   │
│    $59"      │  │    $19"      │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 │
       └────────┬────────┘
                │
                │ Both lead to ▼
                │
┌──────────────────────────────────────────┐
│     ORDER BUMP MODAL APPEARS             │
│                                          │
│  "Add the Matching Bustier?"            │
│                                          │
│  Bustier: $49 → $10 (80% OFF)           │
│                                          │
│  Order Summary:                          │
│  - Pants: $59 or $19                    │
│  - Bustier: $10                          │
│  - Total: $69 or $29                    │
│                                          │
│  [YES! Add Bustier] [No thanks, just...] │
└──────────────┬───────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   [ACCEPT]      [DECLINE]
        │             │
        │             │
        ▼             ▼
```

---

## Path 1: Pre-order → Accept Bump

```
User Journey:
1. Lands on site
2. Completes/skips quiz
3. Selects size (e.g., "M")
4. Clicks "PRE-ORDER - Only $19"
5. Order bump modal shows
6. Clicks "YES! Add Bustier"

API Call:
POST https://simpleswap-automation-1.onrender.com/buy-now
Body: {"amountUSD": 29}

Expected Response:
{
  "success": true,
  "exchangeUrl": "https://simpleswap.io/exchange?id=...",
  "poolStatus": "instant"
}

Result: ✅ SUCCESS
- User redirected to SimpleSwap exchange page
- Total: $29 ($19 pants + $10 bustier)
```

---

## Path 2: Pre-order → Decline Bump

```
User Journey:
1. Lands on site
2. Completes/skips quiz
3. Selects size (e.g., "S")
4. Clicks "PRE-ORDER - Only $19"
5. Order bump modal shows
6. Clicks "No thanks, just the pants"

API Call:
POST https://simpleswap-automation-1.onrender.com/buy-now
Body: {"amountUSD": 19}

Expected Response:
{
  "success": false,
  "error": "Invalid amount: $19. Expected: 29, 39, 69, or 79"
}

Result: ❌ FAILURE
- Alert shows: "Unable to create order. Please try again."
- User stuck on page
- Cannot complete purchase
- Total: $19 (pants only) - NOT ACCEPTED BY API
```

---

## Path 3: Ship Today → Accept Bump

```
User Journey:
1. Lands on site
2. Completes/skips quiz
3. Selects size (e.g., "M")
4. Clicks "ADD TO CART - $59"
5. Order bump modal shows
6. Clicks "YES! Add Bustier"

API Call:
POST https://simpleswap-automation-1.onrender.com/buy-now
Body: {"amountUSD": 69}

Expected Response:
{
  "success": true,
  "exchangeUrl": "https://simpleswap.io/exchange?id=...",
  "poolStatus": "instant"
}

Result: ✅ SUCCESS
- User redirected to SimpleSwap exchange page
- Total: $69 ($59 pants + $10 bustier)
```

---

## Path 4: Ship Today → Decline Bump

```
User Journey:
1. Lands on site
2. Completes/skips quiz
3. Selects size (e.g., "L")
4. Clicks "ADD TO CART - $59"
5. Order bump modal shows
6. Clicks "No thanks, just the pants"

API Call:
POST https://simpleswap-automation-1.onrender.com/buy-now
Body: {"amountUSD": 59}

Expected Response:
{
  "success": false,
  "error": "Invalid amount: $59. Expected: 29, 39, 69, or 79"
}

Result: ❌ FAILURE
- Alert shows: "Unable to create order. Please try again."
- User stuck on page
- Cannot complete purchase
- Total: $59 (pants only) - NOT ACCEPTED BY API
```

---

## Success/Failure Matrix

| Path | Starting Price | Bump Decision | Final Amount | API Response | User Experience |
|------|----------------|---------------|--------------|--------------|-----------------|
| 1 | $19 preorder | Accept (+$10) | $29 | ✅ 200 OK | Redirects to checkout |
| 2 | $19 preorder | Decline | $19 | ❌ 400 Error | "Unable to create order" |
| 3 | $59 ship today | Accept (+$10) | $69 | ✅ 200 OK | Redirects to checkout |
| 4 | $59 ship today | Decline | $59 | ❌ 400 Error | "Unable to create order" |

**Success Rate: 50% (2/4 paths work)**

---

## Code Flow Analysis

### JavaScript Functions Involved

```javascript
// 1. User clicks CTA
handleAddToCart(type) // type = 'primary' or 'secondary'
  ↓
  // Checks if size is selected
  if (!window.selectedSize) { scroll to size selector }
  ↓
  showOrderBumpPopup(type)
    ↓
    // Calculates prices
    basePrice = type === 'primary' ? 59 : 19
    bumpPrice = 10
    total = basePrice + bumpPrice
    ↓
    // Shows modal with pricing

// 2a. User clicks ACCEPT
acceptOrderBump()
  ↓
  amount = currentOrderType === 'primary' ? 69 : 29
  ↓
  processOrder(amount)
    ↓
    getExchangeFromPool(amount)
      ↓
      fetch('https://simpleswap-automation-1.onrender.com/buy-now')
        ↓
        if (success) → redirect to exchangeUrl ✅
        else → alert('Unable to create order') ❌

// 2b. User clicks DECLINE
declineOrderBump()
  ↓
  amount = currentOrderType === 'primary' ? 59 : 19
  ↓
  processOrder(amount)
    ↓
    getExchangeFromPool(amount)
      ↓
      fetch('https://simpleswap-automation-1.onrender.com/buy-now')
        ↓
        API rejects $19 or $59 ❌
        ↓
        alert('Unable to create order')
```

---

## Problem Visualization

```
ADVERTISED PRICES          ORDER BUMP           API ACCEPTABLE AMOUNTS
┌──────────────┐          ┌──────────┐         ┌────────────────────┐
│  $19 preorder │  ──────► │ Accept   │ ──────► │  $29  ✅           │
│              │          │ (+$10)   │         │  $39  ✅           │
│              │          └──────────┘         │  $69  ✅           │
│              │                               │  $79  ✅           │
│              │          ┌──────────┐         └────────────────────┘
│              │  ──────► │ Decline  │ ──────X  $19  ❌ REJECTED
│              │          │ (+$0)    │
└──────────────┘          └──────────┘


┌──────────────┐          ┌──────────┐         ┌────────────────────┐
│ $59 ship today│  ──────► │ Accept   │ ──────► │  $29  ✅           │
│              │          │ (+$10)   │         │  $39  ✅           │
│              │          └──────────┘         │  $69  ✅           │
│              │                               │  $79  ✅           │
│              │          ┌──────────┐         └────────────────────┘
│              │  ──────► │ Decline  │ ──────X  $59  ❌ REJECTED
│              │          │ (+$0)    │
└──────────────┘          └──────────┘
```

---

## Solution Options

### Option A: Update API (Recommended)

**Change API to accept:**
- $19 (preorder without bump)
- $29 (preorder with bump) ✅ Already works
- $39 ✅ Already works
- $59 (ship today without bump)
- $69 (ship today with bump) ✅ Already works
- $79 ✅ Already works

**After implementation, all paths work:**

| Path | Amount | API | Result |
|------|--------|-----|--------|
| Pre-order → Decline | $19 | ✅ | Success |
| Pre-order → Accept | $29 | ✅ | Success |
| Ship Today → Decline | $59 | ✅ | Success |
| Ship Today → Accept | $69 | ✅ | Success |

**Success Rate: 100% (4/4 paths work)** ✅

---

### Option B: Update Landing Page Prices

**Change landing page to:**
- $29 preorder (was $19)
- $69 ship today (was $59)

**Order bump stays $10:**
- $29 + $10 = $39 ✅ (API accepts)
- $69 + $10 = $79 ✅ (API accepts)

**After implementation:**

| Path | Amount | API | Result |
|------|--------|-----|--------|
| Pre-order ($29) → Decline | $29 | ✅ | Success |
| Pre-order ($29) → Accept | $39 | ✅ | Success |
| Ship Today ($69) → Decline | $69 | ✅ | Success |
| Ship Today ($69) → Accept | $79 | ✅ | Success |

**Success Rate: 100% (4/4 paths work)** ✅

**Trade-offs:**
- Requires updating all marketing copy
- Higher advertised prices
- Need to communicate price change to customers
- Update TikTok pixel values

---

## Recommended Implementation

**SOLUTION: Update API to accept $19 and $59**

**Why:**
1. Preserves advertised prices
2. No landing page changes needed
3. Faster implementation
4. No marketing copy updates
5. No price communication needed
6. Maintains conversion optimization

**Implementation:**
```javascript
// In SimpleSwap API server code
const VALID_AMOUNTS = [19, 29, 39, 59, 69, 79]; // Add 19 and 59

function validateAmount(amount) {
  if (!VALID_AMOUNTS.includes(amount)) {
    throw new Error(`Invalid amount: $${amount}. Expected: ${VALID_AMOUNTS.join(', ')}`);
  }
  return true;
}
```

---

## Testing After Fix

Run these tests to verify fix:

```bash
# Test all four paths
cd "/Users/nelsonchan/Downloads/From Blue Sneaker Lander  with SS Checkout"

# Test 1: $19 (should work after fix)
curl -X POST https://simpleswap-automation-1.onrender.com/buy-now \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 19}'
# Expected: {"success":true,"exchangeUrl":"..."}

# Test 2: $29 (already works)
curl -X POST https://simpleswap-automation-1.onrender.com/buy-now \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 29}'
# Expected: {"success":true,"exchangeUrl":"..."}

# Test 3: $59 (should work after fix)
curl -X POST https://simpleswap-automation-1.onrender.com/buy-now \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 59}'
# Expected: {"success":true,"exchangeUrl":"..."}

# Test 4: $69 (already works)
curl -X POST https://simpleswap-automation-1.onrender.com/buy-now \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 69}'
# Expected: {"success":true,"exchangeUrl":"..."}

# Then run full E2E test
node final-e2e-test.js
```

---

**Related Documents:**
- Full test report: `E2E-TEST-REPORT.md`
- Quick summary: `QUICK-TEST-SUMMARY.md`
- Test scripts: `final-e2e-test.js`, `comprehensive-e2e-test.js`
