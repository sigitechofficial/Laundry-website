# Website redesign release — what changed and how to ship it

Branch: `website-redesign` → PR into `dev` (staging) → later `dev` → `main` (production).
Hosting: Vercel (GitHub integration). `main` = Production, `dev` / PRs = Preview (staging).

---

## 1. Settings needed before / when releasing

These live in dashboards, not in the code. Nothing works differently in code per branch any more.

### Vercel → Project → Settings → Environment Variables
| Variable | Production | Preview (dev / PRs) | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://prodlaundry.sigisolutions.net/` | `https://stagelaundry.sigisolutions.net/` | **Recommended.** If missing, `utilities/URL.js` falls back to production on Vercel Production and staging everywhere else. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2` | `pk_live_…` | `pk_test_…` | Must match the Stripe account/mode the backend uses. |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | browser key | browser key | Maps JavaScript + Places only. |

> Before this release `utilities/URL.js` was hard-coded and **differed between `main` and `dev`**,
> so every `dev → main` merge had to be fixed by hand. That file is now the same on every branch.

### Stripe Dashboard (test mode for staging, live mode for production)
- **Settings → Payment method domains → Add**: the staging domain and `www.justdrycleans.com`.
  Needed for **Apple Pay** (Google Pay works without it). For ngrok testing add the ngrok domain too.
- **Settings → Payment methods**: choose what customers see under "Use a new payment method".
  The checkout saves the method and charges it later (after weighing), so keep methods that can be
  saved for later charges (Cards, Link, Apple Pay, Google Pay). Turn off ones that don't suit
  (e.g. BLIK, Klarna).

### Firebase → Authentication → Settings → Authorized domains
- Add every domain customers sign in on (staging, production, and an ngrok domain when testing),
  or "Continue with Google / Apple" fails there.

### Backend (repo `Laundry-pipeline-backend`) — deploy alongside
`services/Customer/customerPostcodeService.js`:
- Typing a full district (`HA0`, `NW11`, `E16`) now suggests that district's postcodes (was empty).
- Area lists (`NW`, `HA`) only offer districts that exist (was guessing: showed `NW12`, missed `HA0`).
- Suggestions and "does this district exist" checks are cached in Redis (1 day / 30 days),
  so typing no longer calls postcodes.io every time. Address lists (paid) were already cached 2 weeks.

The website works without this backend change; suggestions are just weaker until it's deployed.

---

## 2. What changed on the website

**Booking (`/place-order`)**
- Postcode suggestions while typing; × buttons to clear Post code / Address.
- Address list reloads for a postcode that's already filled in; a postcode typed on the home page
  carries over; starting a new booking from the home page clears an unfinished one.
- Date & time wait for an address ("Add your address first"), with loading / "no slots" states.
- "Action required" (failed pickup/delivery) popup shows once per order, restyled.

**Services (`/checkout/order`) and payment (`/checkout/payment`)**
- Preferences grouped per wash type; no instructions on service cards.
- Payment method popup: saved cards (default + 2, "Show more"), Apple Pay / Google Pay,
  and the Stripe Payment Element for other methods. Methods that redirect come back and finish
  the order. After placing an order the customer lands on that order's details.
- Fixed: bags/items warning hidden behind the card popup; card form resetting mid-order.
- Right-hand summary is sticky only when it fits the screen (fixes bouncing on drag/scroll).

**Site-wide**
- "Book a pickup" buttons removed from header, menus, footer, pricing and reviews.
- Home page no longer auto-redirects signed-in customers (back button / typed URLs work).
- Phone side menus ~72% width; bottom bars sit under menus; slimmer scrollbars; no rubber-band
  bounce in Edge; no drag-ghost on links/images; page doesn't shift when a menu opens.
- Grey icon tiles instead of blue (as in the prototype); FAQs centred on every page.
- Custom dropdowns (home "Pickup", contact "What is it about?") instead of the browser list.
- Tablet fixes: 48px side margins, hero strip on one line, shorter photos, left-aligned FAQs.
- Rebuilt: Reviews, Notifications, Invite friends; sign-in fits laptop screens; brand favicon.

---

## 3. Test checklist (on the PR preview, then on staging)
1. Sign in (email, Google). 2. Home: Pickup menu, postcode suggestions (`nw`, `nw11 9`).
3. Booking: pick address, clear with ×, slots, driver note. 4. Services: add Wash with
   preferences + note. 5. Payment: saved card; new card `4242 4242 4242 4242`; cash.
6. Order lands on its details page. 7. Notifications, Invite, Reviews, Help, Contact.
8. Phone (390px), tablet (768px), laptop (1366px); Edge and Chrome.

## 4. Rollback
Vercel → Deployments → previous Production deployment → **Promote**. Or revert the merge commit.
