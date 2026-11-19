# JVLSD Website - Technical and Security Architecture Documentation
**Client:** Jagatpati Vigneshwara LSD LLP (JVLSD)  
**Lead Engineering Team:** Thrive Tech Solutions  
**Updated:** November 2026 (Consolidated Brief Verification)

---

## 1. System Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react icons. Single-page application (SPA) with hash and history routing (`src/lib/router.ts`).
- **Authoritative Backend:** Google Cloud Firebase (Firestore & Firebase Auth).
  - *Project ID:* `jvsl-60177`
  - Browser securely connects to Firestore and Firebase Auth using sanitized public web configuration.
  - Supabase artifacts have been deprecated and removed from active runtime user flows.
- **Hosting Compatibility:**
  - Static distribution (`dist/`) builds cleanly with Vite.
  - MilesWeb cPanel / Apache deployment supported via `public/.htaccess` mod_rewrite SPA routing.
  - Firebase Hosting supported via `firebase.json`.

---

## 2. Page & Routing Directory

| Path | Audience | Functionality |
| :--- | :--- | :--- |
| `/` | Public | JVLSD Master Corporate Homepage introducing parent company, purpose, vision, mission, and division links. |
| `/about` | Public | Corporate philosophy, trust-quality-fairness values, executive leadership, and division structure. |
| `/shakhwala` | Public / Vendor | Shakhwala franchisee introduction, vendor overview, and retail bridge. |
| `/fresh-daily` | Public | Dedicated discovery showcase of farm-to-table service, seasonal produce preview, morning slots, and Ayurvedic tips. |
| `/survey` | Public | Dedicated household procurement preference questionnaire and kitchen produce survey form. |
| `/order` | Public / Customers | Same-day (strict 3 km Haversine geofence) and Next-day pre-order catalogue, rupee-to-weight converter, cart, and multi-payment settlement. |
| `/login` | Public / Customers | Multi-step customer registration, DIGIPIN address capture, standard email/password login, and 1-click test simulation accounts. |
| `/account` | Customers | Household profile, multiple address manager, family hub & consensus voting, and live wallet/loyalty history. |
| `/contact` | Public | Official company registered office (Vardan Tower, Navrangpura), partner phones, and emails from `companyConfig.ts`. |
| `/privacy`, `/terms` | Public | Compliant legal pages aligned with client wallet, discount, and royalty rules. |
| `/admin` | Staff / Admin | Role-gated operations console: orders, inventory, surveys, enquiries, user management, and Master Franchisee royalty ledger. |

---

## 3. Database Schema (Cloud Firestore)

| Collection | Description | Access Rules |
| :--- | :--- | :--- |
| `products` | Catalogue items (vegetable, fruit, milk) with units, prices, and seasonal tags. | Public Read; Staff Write. |
| `orders` | Customer delivery orders with canonical items, price snapshots, delivery mode, and status. | Authenticated Owner Read; Staff Read/Write. |
| `profiles` | User profiles with contact numbers, structured addresses, and roles (`customer`, `admin`, `superadmin`). | Owner Read/Update (role escalation denied); Staff Full. |
| `family_groups` | Household groups, member roles, invite codes, and mutual two-party removal audit logs. | Member Read; Authorized Member / Staff Update. |
| `family_finances` | Household expense proposals and consensus voting records. | Group Member Read/Create/Vote; Staff Read. |
| `user_financials` | Authoritative customer balance summary (wallet, loyalty, promo credit). | Owner Read; Staff Write only. |
| `wallet_ledger` | Immutable financial ledger for wallet reloads, order debits, refunds, and promo credits. | Owner Read; Staff / Server Write only. |
| `loyalty_ledger` | Immutable points ledger (earned, redeemed, rollover). | Owner Read; Staff / Server Write only. |
| `discount_vouchers` | ₹200 discount refund vouchers with 60-day validity tracking. | Owner Read; Staff / Server Write only. |
| `master_franchisee_royalty` | ₹1 daily royalty ledger entries per active subscribed member. | Owner/Staff Read; Staff / Server Write only. |
| `survey_submissions` | Household kitchen survey responses. | Public Create; Staff Read/Manage. |
| `enquiries` | Customer and vendor contact enquiries. | Public Create; Staff Read/Manage. |

---

## 4. Key Business Logic Enforcements

1. **Promotional Credit Rule:**
   - Default user promo balance is strictly ₹0.
   - ₹50 credit is awarded only after the customer's first qualifying order is placed.
2. **Tiered Monthly Volume Discounts:**
   - 20% discount on orders once customer places ≥ 2 qualifying orders in the current calendar month.
   - 30% discount on orders once customer places ≥ 4 qualifying orders in the current calendar month.
3. **Same-Day 3.0 km Dispatch Geofence:**
   - Orders with `mode === 'same_day'` calculate Haversine distance from the Navrangpura hub (`23.0372° N, 72.5613° E`). Orders exceeding 3.0 km are blocked from same-day checkout.
4. **Master Franchisee ₹1 Royalty Rule:**
   - Idempotency key `MF_${member_id}_${orderDate}` guarantees exactly ₹1 is recorded per active member per qualifying order day regardless of order count.
