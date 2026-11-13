# ✨ WTW · WhaToWear — Atelier Wardrobe, Season, Astral & Persona Stylist

A modern, weather- and hemisphere-season-aware, computer-vision-assisted, and personal-style-driven daily wardrobe stylist that helps you decide what to wear every day.

---

## 🌟 Key Features

### 🆕 Multi-Device Cloud Sync ("Common Memory" via Firebase), Custom Categories/Types/Formalities & Location Season Styling
1. **☁️ Multi-Device Cloud Sync (Common Memory across iPhone & PCs)**:
   - Built-in real-time synchronization backed by **Firebase Firestore**.
   - Changes made on your PC (wardrobe items, captured photos, personal palette, body shapes, custom categories, and vision statements) automatically sync in real-time with your phone and second PC.
   - Protected by a private **Vault Key / Passphrase** (default `marcelo-atelier-wardrobe`) configured in *Profile & Settings*.
   - Features a live **`🟢 Cloud Synced`** status badge in the header and in settings.
2. **✨ Google Material Design 3 & Modern Antigravity Floating UI Aesthetics**:
   - **Deep Sophisticated Dark Theme**: Deep obsidian background with subtle glowing teal (`#00e5c0`) and soft yellow accents (`#ffd166`), glassmorphism card surfaces, and multi-elevation floating shadows.
   - **Refined Slim Header**: Minimalist `WTW` brand logo on the left with sleek, rounded status pills on the right displaying live `Spring - Bathurst` and `Cloud Synced`.
   - **'My Persona' Card in Profile & Settings**: Relocated cleanly from the main landing page into *Profile & Settings* (`rounded corners`, glassmorphism border, luminous drop-shadow, tactile Masculine/Feminine pill toggle, 6 portrait slots, and active biometric blueprint summary).
   - **Tactile Sliding Pill Toggle**: Smooth animated pill switcher between Masculine and Feminine wardrobe preferences.
   - **Six User Portrait Thumbnails**: Clean, spacious 6-column grid with generous negative space, multi-angle role hints (Close-up, Full Body, Daylight, Profile, Elevated, Movement), hover scale, and tap-to-inspect.
   - **Modern Pill-Shaped Action Buttons with Soft Gradients**: Soft luminous gradients for `📷 Use Camera`, `🔄 Re-analyze Persona`, `🖼️ Photo Library`, and `🗂️ Saved Images`.
   - **Clean Premium Sans-Serif Typography**: Refined font hierarchy powered by *Plus Jakarta Sans*.

3. **🏛️ Bespoke Editorial Branding & `WTW` Monogram Emblem**:
   - Features a bespoke **`WTW`** monogram emblem in deep botanical emerald (`#0f241d`) and brushed champagne gold (`#c89b6e`), paired with editorial typography (*Cormorant Garamond* + *Plus Jakarta Sans*), glassmorphic navigation, and live status pills in the header (**Install on iPhone** lives in *Profile & Settings*).
2. **📸 Clean Photo Upload & Non-Overlapping Wardrobe Controls**:
   - Preserves original clothing photos with full fidelity and crisp aspect-ratio rendering across wardrobe cards, outfit previews, and lightboxes.
   - Wardrobe card **Edit (`✏️`) & Delete (`✕`)** buttons sit in a dedicated header action bar above the photo container so garment images never cover or block controls.
3. **🎯 High-Precision Computer-Vision Item Identification**:
   - Segments the garment from studio or real-world backgrounds for analysis (while keeping the stored original photo untouched), excludes white studio washout and wearer skin tones when worn, and classifies across a normalized `40×40` silhouette matrix (underarm gap vs. crotch leg-split, short vs. long sleeve drop, hoodie dome crown, lapel/placket contrast, quilted puffer baffles, dual-shoe geometry, belt ring/strap) with one-click alternative match chips.
4. **👚 150+ Precise Garment Types + Custom Categories, Types & 9+ Formalities**:
   - Includes over **150 specific garment types** across Masculine and Feminine styles.
   - In **Add / Edit Clothing Item**, you can create your own **Custom Category** (`＋ Add Category`), **Custom Garment Type** (`＋ Add Type`), and **Custom Formality** (`＋ Add Formality`).
   - Expanded built-in formalities across **9 dress code tiers**: *Athleisure / Active*, *Lounge / Relaxed*, *Casual*, *Elevated Casual*, *Smart Casual*, *Business Casual*, *Business Formal*, *Cocktail / Evening*, and *Black Tie / Gala*.
5. **🌱☀️🍂❄️ Location-Aware Season of the Year Engine (On Top of Temperature)**:
   - Detects the astronomical/meteorological season (**Spring**, **Summer**, **Autumn**, **Winter**) in your city's hemisphere (**Northern Hemisphere** vs. **Southern Hemisphere** via live latitude and city/country lookup) and combines pieces according to both **daily temperature** and **seasonal fabric, color weight, and season suitability** (*All-Season*, *Spring & Summer*, *Autumn & Winter*, *Spring*, *Summer*, *Autumn*, *Winter*).

### ✈️ Trip Mode (new)
1. **Plan**: choose Holiday or Work per stop, destination, number of days and start date. Add as many locations as you like in one trip (stops run back to back).
2. **Weather**: looked up automatically for your dates (live forecast up to ~15 days out, otherwise typical weather for the same dates last year, via the free Open-Meteo service, no key needed). Offline or unknown place? Pick Hot / Warm / Mild / Cool / Cold and "expect rain" manually.
3. **Pack**: a checklist built from your wardrobe: tops, bottoms, shoes, AC/weather layers, accessories, plus **underwear and socks as numbers only (1 per day)**. Tick items as they go into the bag, remove what you'd rather leave home, or add extras. Submit when done.
4. **Daily outfits**: one outfit per day using **only what you ticked as packed**, matched to that day's weather and stop type, with no repeated tops and no same top two days running. Tap **✓ I wore this** to mark pieces (and underwear/socks) as used; **🔀 Swap** changes a day; **🔄 Re-mix** rebuilds remaining days while keeping worn ones. A usage panel shows what you've used so far.
5. A banner on *Today's Outfit* shows today's trip outfit while you're travelling.

### 🚫 Natal chart on/off (new)
Switch in *Profile & Settings → Natal Birth Chart* (and on the home card). When off, planets no longer pre-select your mood, score colours, or influence Pieces to Buy. Birth data stays saved.

### 📷 Reference photos complete your Persona (new)
Upload up to 8 photos of looks you love. WhaToWear reads dominant colours, contrast, warmth and boldness, then fills in your **archetype, desired impressions and vision statement** (all editable; a statement you wrote yourself is never overwritten). Those colours also give a small boost to matching pieces in daily and trip outfits.


### 1. 🏷️ Bespoke Branding & Logo
- **Official Brand**: **WhaToWear** (all one word).
- **Custom Logo**: Features an interlocking 'W' monogram with a luxury coat hanger, celestial 8-point gold sparkle stars, and a diurnal weather curve in forest green (`#2d4a3e`) and gold (`#d4a574`).

### 2. 👔 / 👗 Male & Female Dressing Style System
- Switch effortlessly between **Masculine / Male Style** and **Feminine / Female Style** in *Profile & Settings*.
- **Dynamic Icon & Category Adaptation**:
  - Automatically updates all app icons, tab icons (👔 vs 👗), category tags, and garment types.
  - **Masculine**: Tops, Bottoms, Shoes, Outerwear, Accessories (Polos, Henley, Chinos, Blazers, Boots, Oxfords).
  - **Feminine**: Tops & Blouses, Bottoms & Skirts, Shoes & Heels, Outerwear, Bags & Accessories (Silk Camisoles, Bodysuits, Wide-Leg Trousers, Midi Skirts, Heeled Pumps, Trench Coats, Crossbody Bags).
  - Clicking **"Add Sample Wardrobe"** populates a curated masculine or feminine capsule wardrobe based on your setting.

### 3. 📸 Multi-Photo Personal Biometrics, Best Colors & Face/Body Blueprint
- **Unlimited Multi-Photo Aggregation**: Reads across **all** uploaded portraits & full-body photos weighted by lighting clarity (`analyzeUploadedPhotos`), rather than sampling only a single file.
- **YCbCr Undertone & Contrast Detection**: Maps skin chrominance + hair/brow contrast to identify your personal **Seasonal Color Season**, undertone label, contrast level, best flattering tones near the face, and caution colors.
- **Facial & Body Geometry Extraction**:
  - Measures forehead, cheekbone, jaw, and chin proportions from facial skin contours (**Oval, Round, Square, Heart, Diamond / Oblong**) to recommend ideal necklines, collars, and lapels.
  - Segments full-length body silhouettes to measure shoulder, waist, and hip proportions (**Inverted Triangle, Rectangle, Hourglass, Pear, Oval**) and define optimal garment cuts.

### 4. 🎭 "My Persona & Style Blueprint" (Primary Outfit Decision Maker)
- Combines your **Personal Color & Face/Body Cloth Type Blueprint** with your **Desired Style** (**7 Signature Archetypes**, **Desired Impression Chips**, **Style Vision Statement**, and uploaded **Inspiration Palette**) as the **primary decision engine** deciding both **what** you wear and **how** to wear it (complete with an in-card *"Why These Colors, Cuts & How to Wear It"* styling guide on *Today's Outfit*).

### 5. 🔮 Wardrobe Illusion & Usage Maximizer Engine
- **Combinatorial Capacity Calculator**:
  - Computes all mathematically valid cross-combinations:
    $$\text{Looks} = \text{Tops} \times \text{Bottoms} \times \max(1, \text{Shoes}) \times \max(1, \text{Outerwear})$$
  - Displays the **Wardrobe Illusion Matrix** card on the home page:
    - **Unique Looks Count**: e.g., 18 pieces $\rightarrow$ 144 looks.
    - **Perception Multiplier**: e.g., 8.0x wardrobe expansion factor.
    - **Months of Non-Repeating Outfits**: e.g., dress for 4.8 months without repeating!
- **Wear Log & Anti-Repetition Rotation Memory**:
  - Logs your worn outfits in browser storage (`wtw_wear_log`).
  - Penalizes recently worn pairings so you never wear the exact same look on consecutive days.
  - Rewards unrepeated, fresh pairings (+40 bonus).
  - Displays a **Freshness Rating Badge**: `✨ 100% Fresh Combination · Never worn this exact pairing!`
  - **"📌 I'm Wearing This Today!"** button to log and lock in today's rotation.

### 6. 🛍️ Pieces to Buy & AI Studio Product Photography (`@google/genai`)
- Every recommended piece starts in **🧥 Garment Photo** studio mode rendered server-side via the official `@google/genai` SDK (`gemini-3.1-flash-image` / `gemini-3-pro-image`) inside `3:4` e-commerce card containers:
  - Dynamic prompt builder [`buildGarmentPhotoPrompt(item)`](src/services/garmentPhotoPrompt.ts) injects each recommendation's exact color, cut, collar/closure details, and tangible fabric weave on a pure solid off-white/light-grey background (`#F5F5F5`), with front-left diffused studio lighting, 15% centered padding, and strict negative guardrails (no models, text, watermarks, hangers, or props).
  - **Two-Tier Persistent Cache**: Generated photos are cached by content hash on the server (`cache/garment-photos/`) and in browser IndexedDB (`wtw_shop_photo_cache_v1`) so reloading never regenerates or repays for already rendered items.
  - **Interactive Multi-View Toggle**: Switch seamlessly between **🧥 Garment Photo**, **🧍 See How It Looks** (styled model inspiration), and **🎨 Exact Shade** (`3:4` vector cut & colorway preview).
- **Gemini 3.8 Flash Structured Wardrobe Recognition**:
  - Single-item and mass photo uploads call `POST /api/recognize-garment` powered by `gemini-3.8-flash` (`MEDIA_RESOLUTION_HIGH`) and JSON Schema Structured Outputs returning strictly `category`, `subcategory`, `primaryColor`, `season`, and `confidenceScore` (with automatic offline canvas fallback if no key is configured).
- **Driven by What You Love to Wear & Your Desired Impression**:
  - Directly reflects your **Signature Style Archetype**, **Desired Impressions** (e.g., *Polished*, *Authoritative*, *Approachable*, *Effortless*), your uploaded reference outfit palette, and your most-worn wardrobe categories.
  - Includes 1-click **➕ Add to Wardrobe**, **🔍 Shop Online** Google Shopping links, and **🚫 Dislike** filtering.

### 7. 🔮 Natal Birth Chart & Daily Planetary Transits
- Enter Date, Time, and Place of Birth in *Profile & Settings*.
- Computes **Sun Sign**, **Moon Sign** (lunar Julian day algorithm), and **Rising / Ascendant Sign**.
- Evaluates daily planetary ruler (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) to **automatically pre-select your daily mood**, with manual override anytime.
- Suggests daily lucky power colors and cosmic style insights.

### 8. 🧥 Strict 3-Tier Top Layer Hierarchy & 🪢 Always-Proposed Belt Color
- **Strict 3-Tier Top Layer System** (enforced across *Today's Outfit* and *Trip Mode*):
  - **Layer 1 (Base Layer)**: T-Shirts (short or long sleeve), Henleys, Camisoles, Bodysuits, or light base shirts next to skin.
  - **Layer 2 (Mid-Layer)**: Hoodies, Blazers / Sport Coats, Sweaters, Cardigans, Overshirts, or Vests.
  - **Layer 3 (Outer Shell / Jacket)**: Denim Jackets, Bombers, Leather Jackets, Field/Rain Jackets, Puffers, Trenches, or Wool Overcoats.
  - Automatically adapts between **1 Layer**, **2 Layers** (Base + Mid-Layer OR Jacket), and **3 Layers** (Base + Mid-Layer + Outer Jacket/Coat), preventing invalid stacks like a blazer over a bomber jacket or dress shirt over a hoodie.
  - Includes an interactive **Top Layering Control** (`[🌡️ Auto by Temp]`, `[1 Layer]`, `[2 Layers]`, `[3 Layers]`) right on the outfit card so you can override the layer count anytime.
- **Always Proposes a Belt Color (Coordinated with Accessories)**:
  - Every daily and Trip Mode outfit **always proposes an ideal belt color** (with a color swatch, shade name such as *Rich Cognac / Amber Brown Leather*, *Classic Black Leather*, *Warm Saddle Tan*, and styling rationale coordinated with your shoes and bottoms).
  - Automatically selects the best-matching **Belt** from your **Accessories** category (`subType: 'Belt'`), or offers a 1-click **＋ Save "... Belt" to My Accessories** button if you haven't added one yet.

### 9. 📈 Diurnal Weather Chart (Temperature Curve + Rain Probability Bars) & Home Flow
- **Home Page Priority Flow**:
  1. **Weather & Diurnal Chart** (`#weather-section`) — First on the page, with a quick city input that works automatically via Open-Meteo (no API key required) or OpenWeatherMap.
  2. **What to Wear Today** (`#outfit-section`) — Immediately below the weather.
  3. **Everything Else** — Day/Meeting context, Feeling/Mood selector, and Natal Birth Chart.
  4. **Collapsible Wardrobe Illusion Statistics** (`#wardrobe-illusion-section`) — Tucked neatly into an optional expandable drawer at the very bottom of the page so it never clutters your daily view.
- **Visual SVG Chart**: Plots the smooth diurnal **Temperature Curve (°C)** from 6 AM to 11 PM alongside **Rain Probability (%)** vertical bars.

### 10. 📱 Installable iPhone App (iOS Web App / PWA)
- Configured with Apple iOS Web App meta tags (`apple-mobile-web-app-capable`, `black-translucent` status bar, safe-area-inset notch padding), a dynamically generated 180×180 Home Screen icon, and a Web App Manifest.
- Click **"📱 Install on iPhone"** in the header (or in *Profile & Settings*) for step-by-step instructions to add **WhaToWear** to your iPhone Home Screen via Safari (*Share → Add to Home Screen*).

---

## 🚀 Quick Start

### Recommended: Full Stack with Gemini Studio Photography & Garment Recognition (`http://localhost:3000`)
1. Copy `.env.example` to `.env` and add your server-side Gemini API key (never committed to git):
   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY=...
   ```
2. Install dependencies, build the TypeScript backend, and start the server:
   ```bash
   npm install
   npm run build
   npm start
   ```
3. Open `http://localhost:3000` in your browser.
4. *(Optional)* Verify live 2-sample `3:4` `#F5F5F5` garment generation and disk-cache latency:
   ```bash
   npm run verify:images
   ```

### Offline / Standalone Preview
You can still open [`index.html`](index.html) directly in any modern browser; when served without the Node backend or without `GEMINI_API_KEY`, studio product previews and wardrobe recognition fall back cleanly to built-in client-side studio vector previews and canvas CV analysis.

### First-Time Styling Setup
1. Go to **Profile & Settings**:
   - Choose **Masculine / Male** or **Feminine / Female** dressing style.
   - Choose your **Signature Style Archetype** and desired impression tags.
   - Upload 1 to 4 personal photos for automated quality scanning, skin seasonal palette, and face/body shape detection.
   - Enter your Date, Time, and Place of Birth for your Natal Birth Chart.
2. In **My Wardrobe**:
   - Click **"🎁 Add Sample Wardrobe"** to populate a capsule, or upload your own clothes (classified via `gemini-3.8-flash` high-resolution Structured Outputs).
3. Check **Today's Outfit**:
   - See your Wardrobe Illusion stats, diurnal weather projection, cosmic alignment, pre-selected mood, and complete outfit with 3-tier top layering & freshness rating.
   - Click **"📌 I'm Wearing This Today!"** to update your wear rotation history.
4. In **Pieces to Buy**:
   - Inspect each recommended item's cached `3:4` `#F5F5F5` studio product photo and toggle to **🧍 See How It Looks** or **🎨 Exact Shade**.
