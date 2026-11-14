# Arabian Shawarma & Pizza — Premium Online Ordering & Complete Restaurant CRM

Official full-stack restaurant ordering and CRM business management platform built for **Arabian Shawarma & Pizza** (Lahore, Pakistan). 

This platform was built by extracting every product, category, deal, price, contact number, and address verbatim from the official attached restaurant printed menus. It features a luxury 3D-inspired customer storefront and a 20-module private Admin CRM with manual payment verification for Easypaisa, JazzCash, Meezan Bank, and Cash on Delivery.

Designed and pre-configured for seamless publication to **GitHub Pages** using client-side hash routing and external Firebase services.

---

## 1. Restaurant Details & Menu Extraction Summary

- **Business Name:** Arabian Shawarma & Pizza
- **Address:** Cavalry Ground Mian Chowk Near Shiffa Hospital Madina Colony Walton Cantt, Lahore
- **Telephone / Dispatch:** `+92 322-2222461` / `+92 300-0433134`
- **WhatsApp Kitchen Link:** `+92 322-2222461`
- **Operating Hours:** 1:00 PM – 3:00 AM (Open 7 Days a week)
- **Currency:** Pakistani Rupee (`Rs.` / `PKR`)
- **Default Timezone:** `Asia/Karachi`
- **Extra Add-on Charges:** Extra Cheese/Chicken Charges `Rs. 200/-`; Extra White Sauce Topping (Small: Rs. 50, Medium: Rs. 100, Large: Rs. 150, Family: Rs. 200).

### Menu Categories & Product Counts
1. **Regular Deals:** 29 complete combo offers (Deal 01 to Deal 29) with drinks and items accurately populated.
2. **Pizza (22 Flavors):** Tikka, Fajita, Supreme, Hot & Spicy, Fry Chicken, Achari, Tandoori, Cheese Lower, Veggie Lover, Cheese Chicken, Peri Peri Spicy, Bone Fire, Extreme, Creamy Stuff, Cheese Crust, Bihari Kabab, Crown Crust, Stif Crust, Lazania, Malai Boti Crown, Double Seekh Kabab, Double Daker (Sizes: Small 8", Medium 11", Large 13", Family 17").
3. **Burger (15 Types):** Grill Burger (with Fries), Special Pizza Zinger Burger, Peri Peri Spicy, Petti Burger, Zinger Burger (plain & with fries), Jalapeno, Mighty Zinger, Tower, Chicken Boti, Lapeta Burgers, Shami Burger.
4. **Sandwich (8 Types):** Tikka Sandwich, Pizza Stacker, Panini, Grill, Zinger, Chicken Club, Chicken Cheese, Cheese Stick.
5. **Paratha Roll (8 Types):** Pizza Paratha, Chicken BBQ, BBQ Paratha, Zinger Paratha, Zinger Cheese, Chicken, Chicken Cheese, Chicken Grill.
6. **Shawarma (9 Types):** Chicken Shawarma (Regular & Jumbo), Chicken Cheese, Chicken Olive, Chicken Jalapeno, Platter Shawarma (Extra Bread 50), Zinger Shawarma, Zinger Cheese, Arabian Special, Grill Chicken.
7. **Wrap (6 Types):** Peri Peri Spicy Wrap, Grill, BBQ, Nuggets Wrap, Zinger, Chicken.
8. **Appetizer (8 Types):** Loaded Fries, Pizza Fries, Cheese Mayo Fries, Masala Fries, Plan Fries, Hot Shot (12 Pcs), Nuggets (10 Pcs), Hot Wings (10 Pcs).
9. **Drinks (7 Types):** 345ml, 500ml, 1 Ltr, 1.5 Ltr, 2.25 Ltr, Mineral Water Small, Mineral Water Large.
10. **Dip Sauces (5 Types):** Mayo Garlic Sauce, Special Sauce, Peri Peri Sauce, Chipotle Sauce, Jalapeno Sauce.

---

## 2. Completed Features

### Customer Experience
- **Hero & 3D Interactive Displays:** Subtle 3D tilt effects, dark-amber luxury palette, trust markers, and live kitchen dispatch status.
- **Original Scanned Menu Modal:** Customers and administrators can view and zoom into the high-resolution scanned menu sheets anytime.
- **29 Regular Deals Browser:** Filter by budget, family, or mega feasts with complete itemized breakdowns.
- **Product Customizer (PDP):** Size selection (Small, Medium, Large, Family), extra cheese/chicken (+Rs. 200), extra white sauce topping, and kitchen cooking instructions.
- **Cart & Slide-over Drawer:** Live quantity adjustments, delivery vs pickup toggle, area-specific delivery fees, and promo code engine.
- **Checkout Experience:** Customer details, area selection, Cash on Delivery, Easypaisa, JazzCash, and Bank Transfer with transaction ID & screenshot upload.
- **Live Order Tracking:** Real-time visual timeline (Placed → Confirmed → Kitchen → Ready → Out for Delivery → Delivered) with live timestamps and WhatsApp kitchen dispatch link.
- **Customer Account Portal:** Profile management, saved addresses, and past order history with 1-click reorder.
- **Customer Dining Reviews:** Verified ratings, review submission, and customer testimonials.

### Private & Secure Admin CRM
- **Secure Admin Login:** Protected owner-only authentication with rate-limited brute-force protection and mandatory password rotation on initial login. Public registration and Google sign-in are disabled for administrators.
- **All 20 Sidebar Modules:**
  1. *Dashboard Overview:* Real-time KPIs, net revenue, today's sales, pending payments, active orders, and sales distribution.
  2. *Orders:* Filter by status, search, detail view, advance status modal with admin note, print invoices.
  3. *Order Tracking:* Fast-track order workflow through kitchen states.
  4. *Products (Full CRUD):* Add food items, edit prices/images/descriptions/sizes, toggle availability (Sold Out), feature dishes, delete with confirmation.
  5. *Categories (Full CRUD):* Create, edit, reorder, delete menu categories.
  6. *Deals & Promotions:* Modify any of the 29 deals, adjust bundle prices, toggle active/inactive.
  7. *Customers / CRM:* Customer profiles, total lifetime orders, total spend (PKR), VIP automatic tiering, internal notes, customer tags, and secure CSV export.
  8. *Payment Methods:* Configure Easypaisa account title/number/instructions, JazzCash, Meezan Bank / Bank Alfalah accounts, and COD.
  9. *Payment Verification Queue:* Dedicated verification desk for mobile wallet and bank transfer orders. Review TID and screenshot, Verify or Reject with reason note.
  10. *Delivery Management:* Delivery areas, charges, delivery time estimates, minimum order limits.
  11. *Coupons & Promos:* Create discount codes (percentage or flat PKR), min order requirements, max discount caps, expiry dates.
  12. *Reviews:* Moderate and manage customer ratings.
  13. *Website Content:* Edit restaurant name, tagline, address, phone numbers, WhatsApp, announcement bar.
  14. *Banners & Offers:* Manage homepage announcements.
  15. *Notifications:* System event alerts (new orders, pending verifications, stock notices).
  16. *Reports & Analytics:* Daily, weekly, and monthly sales calculations, AOV, payment distribution, CSV export.
  17. *Staff / Roles:* Access control for Master Admin and Kitchen Operators.
  18. *General Settings:* Currency symbol, minimum order, free delivery threshold, and Factory Menu Reset.
  19. *Admin Profile:* Administrator credentials view.
  20. *Logout:* Secure session termination.
- **Order Invoices & Kitchen Order Tickets (KOT):** Printable thermal KOT tickets for the kitchen line with `@media print` clean formatting.

---

## 3. GitHub Pages Deployment Instructions

The project is structured with `base: command === 'build' ? '/arabian-shawarma-pizza-webapp/' : '/'` in `vite.config.ts`, a Bun lockfile (`bun.lock`), and client-side `HashRouter` (`#/...`) so production builds deploy cleanly under GitHub Pages without 404 errors.

### Step-by-Step GitHub Pages Deployment:
1. **Push to GitHub (`main` branch):**
   ```bash
   git add .
   git commit -m "Deploy Arabian Shawarma & Pizza"
   git push -u origin main
   ```

2. **Configure GitHub Pages Source (CRITICAL):**
   - In your GitHub repository, go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions** (never *Deploy from a branch*, which serves raw uncompiled source files).

3. **Configure Firebase Repository Secrets (Optional Overrides):**
   - Go to **Settings** → **Secrets and variables** → **Actions**.
   - Optionally set your Firebase project configuration keys (falls back cleanly to `firebase-applet-config.json` when omitted):
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

4. **Automatic Bun CI/CD Deployment:**
   - The workflow `.github/workflows/deploy.yml` runs on Node.js 22 + Bun (`bun install --frozen-lockfile`, `bun run lint`, `bun run build`), validates `dist/`, and deploys exclusively the `./dist` directory to `https://gaugehouse1998-debug.github.io/arabian-shawarma-pizza-webapp/`.

---

## 4. Firebase Architecture & Setup

The application features dual-persistence:
- **Instant Out-of-the-Box Mode:** Uses reactive browser storage with event broadcasting, so all CRUD operations, order tracking, and admin verifications work immediately.
- **Firebase Production Mode:** Follow these steps to connect your Firebase backend:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com) and create a project (e.g. `arabian-shawarma`).
2. **Enable Authentication:**
   - In Firebase Console → **Build** → **Authentication** → **Sign-in method**, enable **Email/Password**.
   - Create your private administrator account in Firebase Authentication and authorize it via `adminUsers`.
3. **Enable Cloud Firestore:**
   - In Firebase Console → **Firestore Database**, create a database in production mode.
   - Deploy the provided `firestore.rules` file:
     ```bash
     firebase deploy --only firestore:rules
     ```
4. **Enable Firebase Storage:**
   - In Firebase Console → **Storage**, click Get Started to enable image uploads for screenshots.
5. **Copy Web App Config:**
   - In Project Settings, add a Web App (`</>`) and copy the keys into `.env` or GitHub Secrets.

---

## 5. Security & Data Protection

- **Deny-by-Default Firestore Rules:** Rules in `firestore.rules` forbid public tampering with roles, payments, or orders.
- **Role Isolation:** Customers cannot grant themselves administrative privileges.
- **Sensitive Credentials:** No payment passwords or private keys are ever stored or exposed.
- **Manual Verification Integrity:** All mobile wallet payments require explicit administrator approval with an audit trail note.
