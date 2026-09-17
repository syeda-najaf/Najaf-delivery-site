# NAJAF ULTRA REAL CONNECTED APP

This package upgrades the NAJAF food app from local/demo behavior to a real-service architecture.

## Real connections included

- **Supabase Auth**: email/password account creation and sign-in, session persistence, Google OAuth hook.
- **Supabase Database**: profiles, addresses, menu catalog, orders, order items, order events.
- **Supabase Realtime**: live `orders` updates so tracking screens refresh when rider/status fields change.
- **Razorpay Standard Checkout**: real order creation on the server, client checkout, server-side HMAC signature verification.
- **Mapbox**: real interactive map, device geolocation, forward geocoding, reverse geocoding, traffic-aware driving route.
- **Rider GPS API**: `POST /api/rider-location` can receive a rider device's current coordinates and update the order; connected customers see the update through Supabase Realtime.

The front-end does **not** contain payment secrets or a Supabase service-role key. Those belong only in Vercel/server environment variables.

## 1. Supabase

Create a Supabase project and run:

```text
supabase/schema.sql
```

Then in Supabase Authentication:

- Enable Email/password.
- For Google login, enable the Google provider and register your site URL + callback URL in Google Cloud.

Supabase's current JS API supports `signUp`, `signInWithPassword`, OAuth, and authenticated `getUser`/session handling. Realtime Postgres Changes can be enabled for the `orders` table. 

## 2. Mapbox

Create a Mapbox public access token and add it as:

```env
REACT_APP_MAPBOX_ACCESS_TOKEN=pk....
```

The map uses Mapbox GL JS, browser geolocation, Geocoding v6, and Directions v5 with traffic-aware driving routes.

## 3. Razorpay

Create Razorpay API keys. For testing, use **Test Mode** keys first.

Browser variable:

```env
RAZORPAY_KEY_ID=rzp_test_...
```

Server-only variables:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

The server creates the Razorpay order. The browser opens Razorpay Checkout. The server verifies the returned signature with HMAC SHA-256 before marking the Supabase order as paid/confirmed.

## 4. Environment

Copy:

```text
.env.example -> .env
```

Fill:

```env
DISABLE_ESLINT_PLUGIN=true
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
REACT_APP_MAPBOX_ACCESS_TOKEN=YOUR_MAPBOX_PUBLIC_ACCESS_TOKEN

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
RIDER_API_TOKEN=CHANGE_THIS_LONG_RANDOM_VALUE
```

**Never** put `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` in `REACT_APP_*` variables or browser JavaScript.

## 5. Install and run

```powershell
npm install
npm start
```

The normal CRA dev server is good for the UI. The `/api/*` payment/rider endpoints run on Vercel/serverless infrastructure.

For full local serverless development, use the Vercel CLI:

```powershell
vercel dev
```

## 6. Deploy to Vercel

Import the project into Vercel and add the environment variables above in Project Settings > Environment Variables.

Build command:

```text
npm run build
```

Output directory:

```text
build
```

The included `vercel.json` keeps React routes working while leaving `/api/*` serverless functions available.

## 7. Real rider tracking

The customer app is wired for actual rider coordinates. Your rider device/server should periodically POST:

```http
POST /api/rider-location
Authorization: Bearer YOUR_RIDER_API_TOKEN
Content-Type: application/json
```

Example:

```json
{
  "order_id": "SUPABASE_ORDER_UUID",
  "lat": 12.9717,
  "lng": 77.6412,
  "heading": 104,
  "eta_minutes": 9,
  "status": "out_for_delivery"
}
```

The endpoint writes the rider position to the order. Supabase Realtime then pushes the update to the customer's tracking screen.

## Important production notes

This package gives you the real integration points, but the services only become live after you connect **your own** Supabase project, Google OAuth credentials (optional), Mapbox token, and Razorpay account keys. Payment, auth, and rider GPS cannot be made genuinely live from front-end code alone without those external accounts/credentials.
