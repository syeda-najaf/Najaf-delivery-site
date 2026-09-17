# NAJAF ULTRA PRISM

A full front-end visual refresh for the Najaf food platform.

## What changed
- Replaced food emojis with real food photography loaded from Unsplash URLs.
- Reworked the entire visual system around a colorful editorial palette: cobalt, violet, magenta, citrus, coral and teal.
- Reworked hero, cards, restaurants, offers, cart, checkout, auth, profile, orders, dashboard, tracking, map HUD, modals, toast and footer.
- Keeps React Router and the existing front-end order/cart flow.
- Keeps the interactive Leaflet + OpenStreetMap delivery map and browser geolocation flow from the Ultra build.

## Install/run
```powershell
npm install
npm start
```

Open http://localhost:3000/home

## Important
The food photographs are loaded from Unsplash at runtime, so an internet connection is required for those images. The map already uses OpenStreetMap tiles via Leaflet at runtime.
